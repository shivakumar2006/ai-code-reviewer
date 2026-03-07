package handler

import (
	"encoding/json"
	"net/http"
	"review-service/internal/models"
	"review-service/internal/service"
	"strconv"

	"github.com/go-chi/chi"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

// post /review
func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	// get userID from header
	userID, err := getUserIDFromHex(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// decode request body
	var req models.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// call service
	resp, err := h.reviewService.CreateReview(r.Context(), userID, &req)
	if err != nil {
		switch {
		case isValidationError(err):
			writeError(w, http.StatusBadRequest, err.Error())
		case isLLMError(err):
			writeError(w, http.StatusServiceUnavailable, "ai review service is currently unavailable")
		default:
			writeError(w, http.StatusInternalServerError, "failed to create review")
		}
		return
	}
	writeJSON(w, http.StatusCreated, resp)
}

func (h *ReviewHandler) GetAllReviews(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromHex(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// parse pagination from query params
	page := parseQueryInt(r, "page", 1)
	limit := parseQueryInt(r, "limit", 10)

	// call service
	resp, err := h.reviewService.GetAllReviews(r.Context(), userID, page, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch reviews")
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// get /review/{id}
func (h *ReviewHandler) GetReview(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromHex(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// get review id from url param
	reviewID := chi.URLParam(r, "id")
	if reviewID == "" {
		writeError(w, http.StatusBadRequest, "review id is required")
		return
	}

	// call service
	resp, err := h.reviewService.GetReview(r.Context(), reviewID, userID)
	if err != nil {
		if err.Error() == "review not found" {
			writeError(w, http.StatusNotFound, "review not found")
			return
		}
		if err.Error() == "invalid review id" {
			writeError(w, http.StatusBadRequest, "invalid review id format")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to fetch review")
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// delete /reviews/{id}
func (h *ReviewHandler) DeleteReview(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromHex(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	reviewID := chi.URLParam(r, "id")
	if reviewID == "" {
		writeError(w, http.StatusBadRequest, "review id i required")
		return
	}

	// call servuce
	if err := h.reviewService.DeleteReview(r.Context(), reviewID, userID); err != nil {
		if err.Error() == "review not found or unauthorized" {
			writeError(w, http.StatusNotFound, "review not found")
			return
		}

		if err.Error() == "invalid review id" {
			writeError(w, http.StatusBadRequest, "invalid review id format")
			return
		}

		writeError(w, http.StatusInternalServerError, "failed to delete review")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// private helpers

// reads X-User-ID set by api gateway
func getUserIDFromHex(r *http.Request) (primitive.ObjectID, error) {
	userIDStr := r.Header.Get("X-User-ID")
	if userIDStr == "" {
		return primitive.NilObjectID, nil
	}
	return primitive.ObjectIDFromHex(userIDStr)
}

func parseQueryInt(r *http.Request, key string, defaultVal int) int {
	val := r.URL.Query().Get(key)
	if val == "" {
		return defaultVal
	}
	parsed, err := strconv.Atoi(val)
	if err != nil || parsed < 1 {
		return defaultVal
	}
	return parsed
}

func isValidationError(err error) bool {
	validationErrors := []string{
		"title is required",
		"code is required",
		"title must be under",
		"code exceeds maximum",
	}
	for _, msg := range validationErrors {
		if err.Error() == msg || len(err.Error()) > len(msg) && err.Error()[:len(msg)] == msg {
			return true
		}
	}
	return false
}

// isLLMError checks if error came from llm service
func isLLMError(err error) bool {
	errStr := err.Error()
	return len(errStr) > 3 && errStr[:3] == "llm"
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{
		"error": message,
	})
}
