package proxy

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

type ServiceProxy struct {
	authProxy   *httputil.ReverseProxy
	reviewProxy *httputil.ReverseProxy
	llmProxy    *httputil.ReverseProxy
}

func NewServiceProxy(authURL, reviewURL, llmURL string) (*ServiceProxy, error) {
	authProxy, err := newReverseProxy(authURL)
	if err != nil {
		return nil, fmt.Errorf("invalid auth service url: %w", err)
	}

	reviewProxy, err := newReverseProxy(reviewURL)
	if err != nil {
		return nil, fmt.Errorf("invalid review service url: %w", err)
	}

	llmProxy, err := newReverseProxy(llmURL)
	if err != nil {
		return nil, fmt.Errorf("invalid llm service url: %w", err)
	}

	return &ServiceProxy{
		authProxy:   authProxy,
		reviewProxy: reviewProxy,
		llmProxy:    llmProxy,
	}, nil
}

// proxy handlers
// each one forwarded to it's proxy

func (sp *ServiceProxy) AuthProxy(w http.ResponseWriter, r *http.Request) {
	sp.authProxy.ServeHTTP(w, r)
}

func (sp *ServiceProxy) ReviewProxy(w http.ResponseWriter, r *http.Request) {
	sp.reviewProxy.ServeHTTP(w, r)
}

func (sp *ServiceProxy) LLMProxy(w http.ResponseWriter, r *http.Request) {
	sp.llmProxy.ServeHTTP(w, r)
}

// private handlers

func newReverseProxy(targetURL string) (*httputil.ReverseProxy, error) {
	// parse the target value
	target, err := url.Parse(targetURL)
	if err != nil {
		return nil, err
	}

	// create reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(target)

	// custom proxy transport with timeout
	proxy.Transport = &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     90 * time.Second,

		ResponseHeaderTimeout: 30 * time.Second,
	}

	// custom director - modify request before forwarding
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		// run original director first
		originalDirector(req)

		// clean up headers we don't want to forward
		req.Header.Del("X-Forwarded-For")
		req.Header.Del("CP-Connecting-IP")

		// set forwarded headers
		req.Header.Set("X-Forwarded-Host", req.Host)
		req.Header.Set("X-Orign-Host", target.Host)

		// tell downstream which gateway forwarded he request
		req.Header.Set("X-Gateway", "ai-code-reviewer-gateway")
	}

	// custom error handler
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{
			"error": "downstream service unreachable",
			"detail": "` + err.Error() + `"
		}`))
	}

	return proxy, nil
}
