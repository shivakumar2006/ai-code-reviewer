package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	JWTSecret     string
	EncryptionKey string
}

func Load() *Config {

	if err := godotenv.Load(); err != nil {
		log.Println("Failed to load .env file")
	}

	return &Config{
		Port:          getEnv("PORT", "8083"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		JWTSecret:     mustEnv("JWT_SECRET"),
		EncryptionKey: mustEnv("ENCRYPTION_KEY"),
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
		log.Fatalf("missing required .env file variable: %s", value)
	}
	return value
}
