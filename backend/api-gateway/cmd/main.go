package main

import (
	"api-gateway/internal/config"
	"api-gateway/internal/proxy"
	"api-gateway/internal/router"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg := config.Load()

	// setup service proxy
	sp, err := proxy.NewServiceProxy(
		cfg.AuthServiceURL, cfg.ReviewServiceURL, cfg.LLMServiceURL,
	)
	if err != nil {
		log.Fatalf("failed to setup proxies %v", err)
	}

	// setup router with all middlewares
	r := router.Setup(cfg, sp)

	// create server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 60 * time.Second, // higher because llm takes time
		IdleTimeout:  120 * time.Second,
	}

	// start server in goroutine
	go func() {
		log.Printf("api gateway running on port : %s", cfg.Port)
		log.Printf("📡 auth-service    → %s", cfg.AuthServiceURL)
		log.Printf("📡 review-service  → %s", cfg.ReviewServiceURL)
		log.Printf("📡 llm-service     → %s", cfg.LLMServiceURL)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("gateway error %v", err)
		}
	}()

	// graceful shutdown

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down api gateway")

	shutDownCtx, shutDownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutDownCancel()

	if err := srv.Shutdown(shutDownCtx); err != nil {
		log.Fatalf("failed to shutdown server: %v", err)
	}
	log.Println("Api gateway exited cleanly")
}
