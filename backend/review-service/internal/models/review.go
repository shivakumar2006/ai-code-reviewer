package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReviewStatus string
type Language string
type Severity string

const (
	StatusPending    ReviewStatus = "pending"
	StatusProcessing ReviewStatus = "processing"
	StatusCompleted  ReviewStatus = "completed"
	StatusFailed     ReviewStatus = "failed"
)

const (
	LangGo         Language = "go"
	LangPython     Language = "python"
	LangJava       Language = "java"
	LangJavaScript Language = "javascript"
	LangTypeScript Language = "typescript"
	LangRust       Language = "rust"
	LangUnknown    Language = "unknown"
)

const (
	SeverityBug       Severity = "bug"
	SeverityWarning   Severity = "warning"
	SeverityInfo      Severity = "info"
	SeveritySsecurity Severity = "security"
)

// core models

// issue represent a single problem found in the code
type Issue struct {
	Line     int      `bson:"line" json:"line"`
	Severity Severity `bson:"severity" json:"severity"`
	Message  string   `bson:"message" json:"message"`
	Details  string   `bson:"details" json:"details"`
}

// review is the main document stored in the mongodb
type Review struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID   primitive.ObjectID `bson:"user_id" json:"user_id"`
	Title    string             `bson:"title" json:"title"`
	Code     string             `bson:"code" json:"code"`
	Language Language           `bson:"language" json:"language"`
	Status   ReviewStatus       `bson:"status" json:"status"`

	// populated after llm reviews
	Score       float64  `bson:"score" json:"score"`
	Summary     string   `bson:"summary" json:"summary"`
	Issues      []Issue  `bson:"issues" json:"issues"`
	Suggestions []string `bson:"suggestions" json:"suggestions"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

// request / response models

// what clients sends to create a review
type CreateReviewRequest struct {
	Title    string   `json:"title"`
	Code     string   `json:"code"`
	Language Language `json:"language"`
}

// what review-service sends back for a list of reviews
type ReviewSummary struct {
	ID         primitive.ObjectID `json:"id"`
	Title      string             `json:"title"`
	Language   Language           `json:"language"`
	Status     ReviewStatus       `json:"status"`
	Score      float64            `json:"score"`
	IssueCount int                `json:"issue_count"`
	CreatedAt  time.Time          `json:"created_at"`
}

// what service sends back for the full review
type ReviewResponse struct {
	ID          primitive.ObjectID `json:"id"`
	Title       string             `json:"title"`
	Code        string             `json:"code"`
	Language    Language           `json:"language"`
	Status      ReviewStatus       `json:"status"`
	Score       float64            `json:"score"`
	Summary     string             `json:"summary"`
	Issues      []Issue            `json:"issues"`
	Suggestions []string           `json:"suggestions"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

// list response for pagination response
type ReviewListResponse struct {
	Reviews []ReviewResponse `json:"review"`
	Total   int64            `json:"total"`
	Page    int              `json:"page"`
	Limit   int              `json:"limit"`
}

// llm request / response
type LLMReviewRequest struct {
	Code     string   `json:"code"`
	Language Language `json:"language"`
}

type LLMReviewResponse struct {
	Score       float64  `json:"score"`
	Summary     string   `json:"summary"`
	Issues      []Issue  `json:"issues"`
	Suggestions []string `json:"suggestions"`
}

// helprs
func ToReviewResponse(r *Review) *ReviewResponse {
	return &ReviewResponse{
		ID:          r.ID,
		Title:       r.Title,
		Code:        r.Code,
		Language:    r.Language,
		Status:      r.Status,
		Score:       r.Score,
		Summary:     r.Summary,
		Issues:      r.Issues,
		Suggestions: r.Suggestions,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}

func ToReviewSummary(r *Review) *ReviewSummary {
	return &ReviewSummary{
		ID:         r.ID,
		Title:      r.Title,
		Language:   r.Language,
		Status:     r.Status,
		Score:      r.Score,
		IssueCount: len(r.Issues),
		CreatedAt:  r.CreatedAt,
	}
}
