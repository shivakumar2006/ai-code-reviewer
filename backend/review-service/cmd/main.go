package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"review-service/internal/config"
	"review-service/internal/db"
	"review-service/internal/handler"
	"review-service/internal/middleware"
	llmclient "review-service/internal/pkg/llmClient"
	"review-service/internal/repository"
	"review-service/internal/service"
	"syscall"
	"time"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/go-chi/chi/v5"
)

func main() {
	cfg := config.Load()

	database := db.Connect(cfg.MongoURI, cfg.MongoDB)
	defer database.Disconnect()

	reviewRepo := repository.NewReviewRepository(database)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := reviewRepo.CreateIndexes(ctx); err != nil {
		log.Fatalf("failed to create indexes: %v", err)
	}
	log.Println("MongoDB indexes created")

	// setup llm client
	llmClient := llmclient.NewLLMClient(cfg.LLMServiceURL)

	pingCtx, pingCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer pingCancel()

	if err := llmClient.Ping(pingCtx); err != nil {
		log.Printf("⚠️  llm service not reachable: %v", err)
		log.Println("⚠️  continuing without llm — reviews will fail until llm is up")
	}
	log.Println("✅ llm service reachable")

	// wite up layers
	reviewService := service.NewReviewRepository(reviewRepo, llmClient)
	reviewHandler := handler.NewReviewHandler(reviewService)

	// setup router
	r := chi.NewRouter()

	// gloabal middkewware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)

	// cors
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodDelete, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Content-Type", "X-User-ID", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// register routes

	r.Route("/reviews", func(r chi.Router) {
		r.Use(middleware.Authenticate)
		r.Post("/", reviewHandler.CreateReview)
		r.Get("/", reviewHandler.GetAllReviews)
		r.Get("/{id}", reviewHandler.GetReview)
		r.Delete("/{id}", reviewHandler.DeleteReview)
	})

	// health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		// also check llm service health
		pingCtx, pingCancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer pingCancel()

		llmStatus := "ok"
		if err := llmClient.Ping(pingCtx); err != nil {
			llmStatus = "unavailable"
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"status": "ok",
			"service": "review-service",
			"llm_service": "` + llmStatus + `"
		}`))
	})

	// start server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("🚀 review-service running on port %s", cfg.Port)
		log.Printf("📡 llm-service → %s", cfg.LLMServiceURL)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🔴 shutting down review-service...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}

	log.Println("✅ review-service exited cleanly")

}
