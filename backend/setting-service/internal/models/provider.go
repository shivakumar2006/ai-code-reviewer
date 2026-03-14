package models

import "time"

type ProviderConfig struct {
	APIKeyEncrypted string    `bson:"api_key_encrypted"`
	Model           string    `bson:"model"`
	CreatedAt       time.Time `bson:"created_at"`
}

type UserProvider struct {
	UserID    string                    `bson:"user_id"`
	providers map[string]ProviderConfig `bson:"providers"`
	UpdatedAt time.Time                 `bson:"updated_At"`
}
