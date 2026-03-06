package main

import (
	"auth-service/internal/config"
	"auth-service/internal/db"
	"auth-service/internal/handler"
	"auth-service/internal/middleware"
	"auth-service/internal/repository"
	"auth-service/internal/service"
	"auth-service/pkg/jwt"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// ─────────────────────────────────────────
	// 1. load config
	// ─────────────────────────────────────────
	cfg := config.Load()

	// ─────────────────────────────────────────
	// 2. connect to MongoDB
	// ─────────────────────────────────────────
	database := db.Connect(cfg.MongoURI, cfg.MongoDB)
	defer database.Disconnect()

	// ─────────────────────────────────────────
	// 3. setup indexes
	// ─────────────────────────────────────────
	userRepo := repository.NewUserRepository(database)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := userRepo.CreateIndexes(ctx); err != nil {
		log.Fatalf("failed to create indexes: %v", err)
	}
	log.Println("✅ MongoDB indexes created")

	// ─────────────────────────────────────────
	// 4. wire up layers
	// ─────────────────────────────────────────
	jwtManager := jwt.NewJWTManager(
		cfg.JWTAccessSecret,
		cfg.JWTRefreshSecret,
		cfg.AccessTokenExpiry,
		cfg.RefreshTokenExpiry,
	)

	authService := service.NewAuthService(userRepo, jwtManager, cfg.RefreshTokenExpiry)
	authHandler := handler.NewAuthHandler(authService)
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// ─────────────────────────────────────────
	// 5. setup Chi router
	// ─────────────────────────────────────────
	r := chi.NewRouter()

	// ─────────────────────────────────────────
	// 6. global middleware
	// ─────────────────────────────────────────
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)

	// CORS — must be before your routes
	r.Use(cors.Handler(cors.Options{
		// in development allow all origins
		// in production replace * with your frontend URL
		// e.g. "https://myapp.com", "http://localhost:3000"
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:5173"},

		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},

		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-Request-ID",
		},

		// lets browser read Authorization header in response
		ExposedHeaders: []string{"Authorization"},

		// allows cookies/auth headers in cross-origin requests
		AllowCredentials: true,

		// how long browser caches preflight response (seconds)
		// 300 = 5 minutes, browser won't send OPTIONS again for 5 min
		MaxAge: 300,
	}))

	// ─────────────────────────────────────────
	// 7. register routes
	// ─────────────────────────────────────────
	r.Route("/auth", func(r chi.Router) {
		// public routes
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/refresh", authHandler.Refresh)
		r.Post("/logout", authHandler.Logout)

		// protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Get("/me", authHandler.GetMe)
			r.Post("/logout-all", authHandler.LogoutAll)
		})
	})

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"auth-service"}`))
	})

	// ─────────────────────────────────────────
	// 8. start server
	// ─────────────────────────────────────────
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 auth-service running on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// ─────────────────────────────────────────
	// 9. graceful shutdown
	// ─────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🔴 shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}

	log.Println("✅ server exited cleanly")
}
