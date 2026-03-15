package service

import (
	"context"
	"fmt"
	"setting-service/internal/crypto"
	"setting-service/internal/models"
	"setting-service/internal/repository"
	"time"
)

type ProviderService interface {
	SaveProvider(ctx context.Context, userID string, req *models.SaveProviderRequest) error
	GetSettings(ctx context.Context, userID string) (*models.GetSettingsResponse, error)
	DeleteProvider(ctx context.Context, userID, provider string) error
	// github
	SaveGithub(ctx context.Context, userID string, req *models.SaveGithubRequest) error
	DeleteGithub(ctx context.Context, userID string) error
	// used by llm service via internal call
	GetdecryptProviderKey(ctx context.Context, userID, provider string) (apiKey string, model string, err error)
	GetDecryptGithubToken(ctx context.Context, userID string) (token string, repo string, branch string, err error)
}

type providerService struct {
	repo   repository.ProviderRepository
	cipher *crypto.Cipher
}

func NewProviderService(repo repository.ProviderRepository, cipher *crypto.Cipher) providerService {
	return &providerService{
		repo:   repo,
		cipher: cipher,
	}
}

// llm provider operations

// save provider encrypt the api key and save the provider config
func (s *providerService) SaveProvider(ctx context.Context, userID string, req *models.SaveProviderRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}

	encrypted, err := s.cipher.Encrypt(req.APIKey)
	if err != nil {
		return fmt.Errorf("failed to encrypt api key: %d", err)
	}

	cfg := models.ProviderConfig{
		APIKeyEncrypted: encrypted,
		Model:           req.Model,
		CreatedAt:       time.Now().UTC(),
	}

	if err := s.repo.UpsertProvider(ctx, userID, req.Provider, cfg); err != nil {
		return fmt.Errorf("save provider: %w", err)
	}
	return nil
}

// get settings maks all providers + github config with masked secrets
func (s *providerService) GetSettings(ctx context.Context, userID string) (*models.GetSettingsResponse, error) {
	doc, err := s.repo.GetGithub(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get settings: %w", err)
	}

	resp := &models.GetSettingsResponse{
		Providers: make(map[string]models.ProviderDTO),
	}

	if doc == nil {
		return resp, nil
	}

	// mask all provider keys

}
