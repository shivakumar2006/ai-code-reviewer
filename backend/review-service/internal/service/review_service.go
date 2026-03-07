package service

import (
	"context"
	"errors"
	"fmt"
	"review-service/internal/models"
	llmclient "review-service/internal/pkg/llmClient"
	"review-service/internal/repository"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReviewService struct {
	repo      *repository.ReviewRepository
	llmclient *llmclient.LLMClient
}

func NewReviewRepository(repo *repository.ReviewRepository, llmClient *llmclient.LLMClient) *ReviewService {
	return &ReviewService{
		repo:      repo,
		llmclient: llmClient,
	}
}

// create review
func (s *ReviewService) CreateReview(ctx context.Context, userID primitive.ObjectID, req *models.CreateReviewRequest) (*models.ReviewResponse, error) {
	// validate request
	if err := validateCreateReqest(req); err != nil {
		return nil, err
	}

	// build review documents
	review := &models.Review{
		UserID:      userID,
		Title:       req.Title,
		Code:        req.Code,
		Language:    req.Language,
		Status:      models.StatusPending,
		Issues:      []models.Issue{},
		Suggestions: []string{},
	}

	// save to mongodb with pending status
	if err := s.repo.Create(ctx, review); err != nil {
		return nil, fmt.Errorf("failed to save review : %w", err)
	}

	// update status to processing
	if err := s.repo.UpdateStatus(ctx, review.ID, models.StatusProcessing); err != nil {
		fmt.Printf("warning: failed to update status to processing: %v\n", err)
	}

	// call llm service
	llmCtx, cancel := context.WithTimeout(context.Background(), 110*time.Second)
	defer cancel()

	llmResp, err := s.llmclient.Review(llmCtx, &models.LLMReviewRequest{
		Code:     req.Code,
		Language: req.Language,
	})

	if err != nil {
		_ = s.repo.UpdateStatus(ctx, review.ID, models.StatusFailed)
		return nil, fmt.Errorf("llm review failed : %w", err)
	}

	// update review with llm results
	if err := s.repo.UpdateReview(ctx, review.ID, llmResp, models.StatusCompleted); err != nil {
		return nil, fmt.Errorf("failed to save review results: %w", err)
	}

	// fecth the final updated review
	completed, err := s.repo.FindByID(ctx, review.ID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to feth completed review: %w", err)
	}

	return models.ToReviewResponse(completed), nil
}

// get single review
func (s *ReviewService) GetReview(ctx context.Context, reviewID string, userID primitive.ObjectID) (*models.ReviewResponse, error) {
	// convert string id to object id
	id, err := primitive.ObjectIDFromHex(reviewID)
	if err != nil {
		return nil, errors.New("invalid review id")
	}

	review, err := s.repo.FindByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	return models.ToReviewResponse(review), nil
}
