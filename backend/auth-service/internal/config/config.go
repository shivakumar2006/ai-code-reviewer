package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	MongoURI           string
	MongoDB            string
	JWTAccessSecret    string
	JWTRefreshSecret   string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

func Load() *Config {
	// load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file are found")
	}

	accessExpiry, err := time.ParseDuration(getEnv("ACCESS_TOKEN_EXPIRY", "15m"))
	if err != nil {
		accessExpiry = 15 * time.Minute
	}

	refreshExpiry, err := time.ParseDuration((getEnv("ACCESS_REFRESH_EXPIRY", "168h")))
	if err != nil {
		refreshExpiry = 168 * time.Hour
	}

	return &Config{
		Port:               getEnv("PORT", "8080"),
		MongoURI:           getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:            getEnv("MONGO_DB", "ai_code_reviewer"),
		JWTAccessSecret:    getEnv("JWT_ACCESS_SECRET", "15m"),
		JWTRefreshSecret:   getEnv("JWT_REFRESH_SECRET", "168h"),
		AccessTokenExpiry:  accessExpiry,
		RefreshTokenExpiry: refreshExpiry,
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// func Load() *Config {
// 	// load .env file
// 	if err := godotenv.Load(); err != nil {
// 		log.Println("No .env file found, reading from environment")
// 	}

// 	accessExpiry, err := time.ParseDuration(getEnv("ACCESS_TOKEN_EXPIRY", "15m"))
// 	if err != nil {
// 		accessExpiry = 15 * time.Minute
// 	}

// 	refreshExpiry, err := time.ParseDuration(getEnv("ACCESS_REFRESH_EXPIRY", "168h"))
// 	if err != nil {
// 		refreshExpiry = 168 * time.Hour
// 	}

// 	return &Config{
// 		Port:                getEnv("PORT", "8080"),
// 		MongoURI:            getEnv("MONGO_URI", "mongodb://localhost:27017"),
// 		MongoDB:             getEnv("MONGO_DB", "ai_code_reviewer"),
// 		JWTAccessSecret:     getEnv("JWT_ACCESS_SECRET", ""),
// 		JWTRefreshSecret:    getEnv("JWT_REFRESH_SECRET", ""),
// 		AccessTokenExpiry:   accessExpiry,
// 		AccessRefreshExpiry: refreshExpiry,
// 	}
// }

// func getEnv(key, fallback string) string {
// 	if value := os.Getenv(key); value != "" {
// 		return value
// 	}
// 	return fallback
// }
