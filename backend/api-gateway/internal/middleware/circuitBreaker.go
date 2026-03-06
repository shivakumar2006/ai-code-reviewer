package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/sony/gobreaker"
)

type CircuitBreaker struct {
	breakers map[string]*gobreaker.CircuitBreaker
}

type CircuitBreakerConfig struct {
	MaxRequests uint32
	Interval    time.Duration
	Timeout     time.Duration
}

func NewCircuitBreaker(cfg CircuitBreakerConfig) *CircuitBreaker {
	return &CircuitBreaker{
		breakers: make(map[string]*gobreaker.CircuitBreaker),
	}
}

func (cb *CircuitBreaker) getBreaker(serviceName string, cfg CircuitBreakerConfig) *gobreaker.CircuitBreaker {
	if breaker, exists := cb.breakers[serviceName]; exists {
		return breaker
	}

	// create a new cb
	settings := gobreaker.Settings{
		Name: serviceName,

		// max requests allow at half open state
		MaxRequests: cfg.MaxRequests,

		// interval to wait before moving to half open state
		Interval: cfg.Interval,

		// how long to wait before switching from open to half open
		Timeout: cfg.Timeout,

		// when to open the breaker
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			// if trip more than 5 consecutive failures
			return counts.ConsecutiveFailures > 5
		},

		// called every time state changed
		OnStateChange: func(name string, from gobreaker.State, to gobreaker.State) {
			fromStr := stateToString(from)
			toStr := stateToString(to)
			println("Circuit breaker [" + name + "] " + fromStr + " -> " + toStr)
		},
	}

	breaker := gobreaker.NewCircuitBreaker(settings)
	cb.breakers[serviceName] = breaker
	return breaker
}

func (cb *CircuitBreaker) Protect(serviceName string, cfg CircuitBreakerConfig) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			breaker := cb.getBreaker(serviceName, cfg)

			// execute request through the circuit breaker
			_, err := breaker.Execute(func() (interface{}, error) {
				// wrap the next handler in response recorder
				// so we can detect if it fail
				recorder := newResponseRecorder(w)
				next.ServeHTTP(recorder, r)

				// if downstream returned as 500 treat it as failure
				if recorder.statusCode >= 500 {
					return nil, errServiceUnavailable
				}

				// write the recorded response to the real writer
				recorder.flush()
				return nil, nil
			})

			if err != nil {
				if err == gobreaker.ErrOpenState {
					writeCBError(w, serviceName, "circuit open")
					return
				}

				if err == gobreaker.ErrTooManyRequests {
					writeCBError(w, serviceName, "too many requests at half open state")
					return
				}

				//service returned 5xx or execution failed
				writeCBError(w, serviceName, "service unavailable")
			}
		})
	}
}

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
	body       []byte
	headers    http.Header
}

func newResponseRecorder(w http.ResponseWriter) *responseRecorder {
	return &responseRecorder{
		ResponseWriter: w,
		statusCode:     http.StatusOK,
		headers:        make(http.Header),
	}
}

func (rr *responseRecorder) WriteHeader(statusCode int) {
	rr.statusCode = statusCode
}

func (rr *responseRecorder) Write(b []byte) (int, error) {
	rr.body = append(rr.body, b...)
	return len(b), nil
}

func (rr *responseRecorder) Header() http.Header {
	return rr.headers
}

func (rr *responseRecorder) flush() {
	// copy headers
	for key, values := range rr.headers {
		for _, value := range values {
			rr.ResponseWriter.Header().Set(key, value)
		}
	}
	rr.ResponseWriter.WriteHeader(rr.statusCode)
	rr.ResponseWriter.Write(rr.body)
}

// helper functions

var errServiceUnavailable = fmt.Errorf("service unavailable")

func writeCBError(w http.ResponseWriter, serviceName string, reason string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusServiceUnavailable)

	resp := map[string]string{
		"error":   "service temporarily unavailable",
		"service": serviceName,
		"reason":  reason,
	}
	json.NewEncoder(w).Encode(resp)
}

func stateToString(state gobreaker.State) string {
	switch state {
	case gobreaker.StateClosed:
		return "CLOSED"
	case gobreaker.StateHalfOpen:
		return "HALF-OPEN"
	case gobreaker.StateOpen:
		return "OPEN"
	default:
		return "UNKNOWN"
	}
}
