package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	AuthServiceURL   string
	ReviewServiceURL string
	LLMServiceURL    string
	JWTAccessSecret  string

	RateLimitRequests int
	RateLimitWindow   time.Duration

	CBMaxRequests uint32
	CBInterval    time.Duration
	CBTimeout     time.Duration
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("failed to load .env file")
	}
	rateLimitRequests, err := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS", "100"))
	if err != nil {
		log.Fatalf("invalid RATE_LIMIT_REQUESTS %s", err)
	}
	rateLimitWindow, err := time.ParseDuration(getEnv("RATE_LIMIT_WINDOW", "1m"))
	if err != nil {
		log.Fatal("invalid RATE_LIMIT_WINDOW")
	}
	cbMaxRequests, err := strconv.ParseUint(getEnv("CB_MAX_REQUESTS", "5"), 10, 32)
	if err != nil {
		log.Fatal("invalid CB_MAX_REQUESTS")
	}
	cbInterval, err := time.ParseDuration(getEnv("CB_INTERVAL", "60s"))
	if err != nil {
		log.Fatal("invalid CB_INTERVAL")
	}
	cbTimeout, err := time.ParseDuration(getEnv("CB_TIMEOUT", "30s"))
	if err != nil {
		log.Fatal("invalid CB_TIMEOUT")
	}

	return &Config{
		Port:              getEnv("PORT", "8000"),
		AuthServiceURL:    getEnv("AUTH_SERVICE_URL", "http://localhost:8080"),
		ReviewServiceURL:  getEnv("REVIEW_SERVICE_URL", "http://localhost:8081"),
		LLMServiceURL:     getEnv("LLM_SERVICE_URL", "http://localhost:8082"),
		JWTAccessSecret:   mustEnv("JWT_ACCESS_SECRET"),
		RateLimitRequests: rateLimitRequests,
		RateLimitWindow:   rateLimitWindow,
		CBMaxRequests:     uint32(cbMaxRequests),
		CBInterval:        cbInterval,
		CBTimeout:         cbTimeout,
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func mustEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("missing required .env variables: %s", key)
	}
	return value
}
