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
	if err := validateCreateRequest(req); err != nil {
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

// get all reviews
func (s *ReviewService) GetAllReviews(ctx context.Context, userID primitive.ObjectID, page, limit int) (*models.ReviewListResponse, error) {
	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 50 {
		limit = 10
	}

	reviews, total, err := s.repo.FindAllByUser(ctx, userID, page, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch reviews: %w", err)
	}

	// convert to summary list
	summaries := make([]models.ReviewSummary, len(reviews))
	for i, r := range reviews {
		summaries[i] = *models.ToReviewSummary(&r)
	}

	return &models.ReviewListResponse{
		Reviews: summaries,
		Total:   total,
		Page:    page,
		Limit:   limit,
	}, nil
}

func (s *ReviewService) DeleteReview(ctx context.Context, reviewID string, userID primitive.ObjectID) error {
	id, err := primitive.ObjectIDFromHex(reviewID)
	if err != nil {
		return errors.New("Invalid review id")
	}

	return s.repo.Delete(ctx, id, userID)
}

// private helpers
func validateCreateRequest(req *models.CreateReviewRequest) error {
	if req.Title == "" {
		return errors.New("title is required")
	}
	if len(req.Title) > 100 {
		return errors.New("title must be under 100 characters")
	}
	if req.Code == "" {
		return errors.New("code is required")
	}
	if len(req.Code) > 50000 {
		return errors.New("code exceeds maximum length of 50,000 characters")
	}
	if req.Language == "" {
		req.Language = models.LangUnknown
	}
	return nil
}
