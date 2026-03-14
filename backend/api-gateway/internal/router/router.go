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

	// ─────────────────────────────────────────
	// global middleware — must be before routes
	// ─────────────────────────────────────────
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTAccessSecret)
	rateLimiter := middleware.NewRateLimiter(cfg.RateLimitRequests, cfg.RateLimitWindow)
	cb := middleware.NewCircuitBreaker(middleware.CircuitBreakerConfig{
		MaxRequests: cfg.CBMaxRequests,
		Interval:    cfg.CBInterval,
		Timeout:     cfg.CBTimeout,
	})

	// rate limit on every route
	r.Use(rateLimiter.Limit)

	// ─────────────────────────────────────────
	// health check
	// ─────────────────────────────────────────
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"api-gateway"}`))
	})

	// ─────────────────────────────────────────
	// auth routes
	// ─────────────────────────────────────────
	r.Route("/auth", func(r chi.Router) {
		// public routes
		r.With(cb.Protect("auth-service", middleware.CircuitBreakerConfig{
			MaxRequests: cfg.CBMaxRequests,
			Interval:    cfg.CBInterval,
			Timeout:     cfg.CBTimeout,
		})).Group(func(r chi.Router) {
			r.Post("/register", sp.AuthProxy)
			r.Post("/login", sp.AuthProxy)
			r.Post("/refresh", sp.AuthProxy)
			r.Post("/logout", sp.AuthProxy)
		})

		// protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Use(cb.Protect("auth-service", middleware.CircuitBreakerConfig{
				MaxRequests: cfg.CBMaxRequests,
				Interval:    cfg.CBInterval,
				Timeout:     cfg.CBTimeout,
			}))
			r.Get("/me", sp.AuthProxy)
			r.Post("/logout-all", sp.AuthProxy)
		})
	})

	// ─────────────────────────────────────────
	// review routes
	// ─────────────────────────────────────────
	r.Route("/reviews", func(r chi.Router) {
		// all review routes require authentication and circuit breaker
		r.Use(authMiddleware.Authenticate)
		r.Use(cb.Protect("review-service", middleware.CircuitBreakerConfig{
			MaxRequests: cfg.CBMaxRequests,
			Interval:    cfg.CBInterval,
			Timeout:     cfg.CBTimeout,
		}))

		r.Post("/", sp.ReviewProxy)
		r.Get("/", sp.ReviewProxy)
		r.Get("/{id}", sp.ReviewProxy)
		r.Delete("/{id}", sp.ReviewProxy)
	})

	// ─────────────────────────────────────────
	// llm routes
	// ─────────────────────────────────────────
	r.Route("/llm", func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		r.Use(cb.Protect("llm-service", middleware.CircuitBreakerConfig{
			MaxRequests: cfg.CBMaxRequests,
			Interval:    cfg.CBInterval,
			Timeout:     cfg.CBTimeout * 3,
		}))

		r.Post("/review", sp.LLMProxy)
		r.Post("/test", sp.LLMProxy)
	})

	return r
}
