package models

import "time"

// user provider settings is the top level document per user
type UserProviderSettings struct {
	UserID    string                    `bson:"user_id" json:"user_id"`
	Providers map[string]ProviderConfig `bson:"providers" json:"providers"`
	Github    *GithubConfig             `bson:"github,omitempty" json:"github,omitempty"`
	UpdatedAt time.Time                 `bson:"updated_at" json:"updated_at"`
}

// provider config stores one llm provider's encrypted key + model
type ProviderConfig struct {
	APIKeyEncrypted string    `bson:"api_key_encrypted" json:"-"` // never in json
	Model           string    `bson:"model" json:"model"`
	CreatedAt       time.Time `bson:"created_at" json:"created_at"`
}

// Github config stores the encrypted github personal access token
type GithubConfig struct {
	TokenEncrypted string    `bson:"token_encrypted" json:"-"` // never in json
	Repo           string    `bson:"repo" json:"repo"`
	Branch         string    `bson:"branch" json:"branch"`
	CreatedAt      time.Time `bson:"created_at" json:"created_at"`
}

// request / response structs

// save provider request - post /users/providers
type SaveProviderRequest struct {
	Provider string `json:"provider"`
	APIKey   string `json:"api_key"`
	Model    string `json:"model"`
}

func (r *SaveProviderRequest) Validate() error {
	if r.Provider == "" {
		return ErrProviderRequired
	}

	if r.APIKey == "" {
		return ErrApiKeyRequired
	}

	return nil
}

// save github request - post /users/github
type SaveGithubRequest struct {
	Token  string `json:"token"`
	Repo   string `json:"repo"`
	Branch string `json:"branch"`
}

func (g *SaveGithubRequest) Validate() error {
	if g.Token == "" {
		return ErrTokenRequired
	}
	return nil
}

// provider DTO - what the client sees (masked key)
type ProviderDTO struct {
	APIKey string `json:"api_key"`
	Model  string `josn:"model"`
}

// github DTO - what the client sees (masked key)
type GithubDTO struct {
	Token  string `json:"token"`
	Repo   string `json:"repo"`
	Branch string `json:"branch"`
}

// get provider response - Get /users/providers
type GetProviderResponse struct {
	Providers map[string]ProviderDTO `json:"providers"`
}

// get setting response - all at once
type GetSettingsResponse struct {
	Providers map[string]ProviderDTO `json:"providers"`
	Github    *GithubDTO             `json:"github,omitempty"`
}

// sentinel errors

type AppError struct {
	Code    int
	Message string
}

func (e *AppError) Error() string {
	return e.Message
}

var (
	ErrProviderRequired = &AppError{Code: 400, Message: "Provider is required"}
	ErrApiKeyRequired   = &AppError{Code: 400, Message: "appi_key is required"}
	ErrTokenRequired    = &AppError{Code: 400, Message: "github token is required"}
	ErrGitHubNotFound   = &AppError{Code: 404, Message: "github settings not found"}
	ErrUnauthorized     = &AppError{Code: 401, Message: "unauthorized"}
	ErrInternal         = &AppError{Code: 500, Message: "internal server error"}
	ErrProviderNotFound = &AppError{Code: 404, Message: "provider not found"}
)
