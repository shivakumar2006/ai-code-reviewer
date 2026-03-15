package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	MongoDB       string
	JWTSecret     string
	EncryptionKey string
}

func Load() (*Config, error) {

	if err := godotenv.Load(); err != nil {
		log.Println("Failed to load .env file")
	}

	cfg := &Config{
		Port:          getEnv("PORT", "8083"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:       getEnv("MONGO_DB", "ai_code_reviewer"),
		JWTSecret:     mustEnv("JWT_SECRET"),
		EncryptionKey: mustEnv("ENCRYPTION_KEY"),
	}

	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("jwt secret is required")
	}

	if cfg.EncryptionKey == "" {
		return nil, fmt.Errorf("encryption key is required")
	}

	if len(cfg.EncryptionKey) != 32 {
		return nil, fmt.Errorf("ENCRYPTION_KEY must be exactly 32 bytes for AES-256, got %d", len(cfg.EncryptionKey))
	}

	return cfg, nil
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
		log.Fatalf("missing required .env file variable: %s", value)
	}
	return value
}
