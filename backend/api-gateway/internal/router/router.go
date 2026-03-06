package router

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/internal/proxy"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func Setup(cfg *config.Config, sp *proxy.ServiceProxy) http.Handler {
	r := chi.NewRouter()

	// global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodOptions, http.MethodDelete},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "application/json"},
		ExposedHeaders:   []string{"Authorization"},
		AllowCredentials: true,
		MaxAge:           30,
	}))

	// initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTAccessSecret)
	rateLimiter := middleware.NewRateLimiter(cfg.RateLimitRequests, cfg.RateLimitWindow)
	cb := middleware.NewCircuitBreaker(middleware.CircuitBreakerConfig{
		MaxRequests: cfg.CBMaxRequests,
		Interval:    cfg.CBInterval,
		Timeout:     cfg.CBTimeout,
	})

	// rate limit applies to every route
	r.Use(rateLimiter.Limit)

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok", "service": "api-gateway"}`))
	})

	// auth route public
	// no auth middleware but cb is on
	r.Route("/auth", func(chi.Router) {
		r.Use(func(next http.Handler) http.Handler {
			return cb.Protect("auth-service", middleware.CircuitBreakerConfig{
				MaxRequests: cfg.CBMaxRequests,
				Interval:    cfg.CBInterval,
				Timeout:     cfg.CBTimeout,
			}, next)
		})

		r.Post("/register", sp.AuthProxy)
		r.Post("/login", sp.AuthProxy)
		r.Post("/refresh", sp.AuthProxy)
		r.Post("/logout", sp.AuthProxy)

		// protected auth routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Get("/me", sp.AuthProxy)
			r.Post("/logout-all", sp.AuthProxy)
		})
	})

	// review route - protected
	// auth middleware + cb on
	r.Route("/review", func(r chi.Router) {
		//all review routes require authentication
		r.Use(authMiddleware.Authenticate)
		r.Use(func(next http.Handler) http.Handler {
			return cb.Protect("review-service", middleware.CircuitBreakerConfig{
				MaxRequests: cfg.CBMaxRequests,
				Interval:    cfg.CBInterval,
				Timeout:     cfg.CBTimeout,
			}, next)
		})

		r.Post("/", sp.ReviewProxy)
		r.Get("/", sp.ReviewProxy) // get all reviews
		r.Post("/{id}", sp.ReviewProxy)
		r.Delete("/{id}", sp.ReviewProxy)
	})

	// llm routes - protected
	// authmiddleware + cb on
	// llm get longer timeout
	r.Route("/llm", func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		r.Use(func(next http.Handler) http.Handler {
			return cb.Protect("llm-service", middleware.CircuitBreakerConfig{
				MaxRequests: cfg.CBMaxRequests,
				Interval:    cfg.CBInterval,
				Timeout:     cfg.CBTimeout,
			}, next)
		})

		r.Post("/review", sp.LLMProxy) // send code for review
	})
	return r
}
