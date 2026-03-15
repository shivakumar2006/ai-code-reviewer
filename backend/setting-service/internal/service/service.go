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

func NewProviderService(repo repository.ProviderRepository, cipher *crypto.Cipher) *providerService {
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
	doc, err := s.repo.GetSettings(ctx, userID)
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
	for name, cfg := range doc.Providers {
		plainKey, decErr := s.cipher.Decrypt(cfg.APIKeyEncrypted)
		if decErr != nil {
			plainKey = "****error****"
		}

		resp.Providers[name] = models.ProviderDTO{
			APIKey: maskKey(plainKey),
			Model:  cfg.Model,
		}
	}

	// mask github token if present
	if doc.Github != nil {
		plainText, decErr := s.cipher.Decrypt(doc.Github.TokenEncrypted)
		if decErr != nil {
			plainText = "****error****"
		}
		resp.Github = models.GithubDTO{
			Token:  maskKey(plainText),
			Repo:   doc.Github.Repo,
			Branch: doc.Github.Branch,
		}
	}
	return resp, nil
}

func maskKey(key string) string {
	if len(key) <= 10 {
		return "****"
	}
	return key[:6] + "****" + key[len(key)-4:]
}

// delete provider from the users settings
func (s *providerService) DeleteProvider(ctx context.Context, userID string, req *models.SaveGithubRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}

	branch := req.Branch
	if branch == "" {
		branch = "main"
	}

	encrypted, err := s.cipher.Encrypt(req.Token)
	if err != nil {
		return fmt.Errorf("encrypt github token: %w", err)
	}

	cfg := models.GithubConfig{
		TokenEncrypted: encrypted,
		Repo:           req.Repo,
		Branch:         req.Branch,
		CreatedAt:      time.Now().UTC(),
	}

	if err := s.repo.UpsertGithub(ctx, userID, cfg); err != nil {
		return fmt.Errorf("save github : %w", err)
	}
	return nil
}

// delete github remove github settings for a user
func (s *providerService) DeleteGithub(ctx context.Context, userID string) error {
	return s.repo.DeleteGithub(ctx, userID)
}

// internal: used by llm and review service
// this is called internally by llm-service to perform the actual llm request
func (s *providerService) GetDecryptProviderKey(ctx context.Context, userID, provider string) (string, string, error) {
	doc, err := s.repo.GetSettings(ctx, userID)
	if err != nil {
		return "", "", err
	}

	if doc == nil {
		return "", "", models.ErrProviderNotFound
	}

	cfg, ok := doc.Providers[provider]
	if !ok {
		return "", "", models.ErrProviderNotFound
	}

	plainKey, err := s.cipher.Decrypt(cfg.APIKeyEncrypted)
	if err != nil {
		return "", "", fmt.Errorf("decrypt api key: %w", err)
	}
	return plainKey, cfg.Model, nil
}

// this function returns the plaintext github token + repo + branch
func (s *providerService) GetDecryptGithubToken(ctx context.Context, userID string) (string, string, string, error) {
	doc, err := s.GetSettings(ctx, userID)
	if err != nil {
		return "", "", "", err
	}

	if doc == nil || doc.Github == nil {
		return "", "", "", models.ErrGitHubNotFound
	}

	plainText, err := s.cipher.Decrypt(doc.Github.TokenEncrypted)
	if err != nil {
		return "", "", "", fmt.Errorf("decrypt github token : %w", err)
	}

	return plainText, doc.Github.Repo, doc.Github.Branch, nil
}
