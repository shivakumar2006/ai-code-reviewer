package handler

import (
	"auth-service/internal/models"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

// validateRegisterRequest checks that all required fields are present and valid.
func validateRegisterRequest(req *models.RegisterRequest) error {
	if strings.TrimSpace(req.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(req.Email) == "" {
		return errors.New("email is required")
	}
	if !strings.Contains(req.Email, "@") {
		return errors.New("email is invalid")
	}
	if len(req.Password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	return nil
}

func validateLoginRequest(req *models.LoginRequest) error {
	if strings.TrimSpace(req.Email) == "" {
		return errors.New("email is required")
	}
	if !strings.Contains(req.Email, "@") {
		return errors.New("invalid email format")
	}
	if strings.TrimSpace(req.Password) == "" {
		return errors.New("password is required")
	}
	return nil
}

// writeJSON writes a JSON response with the given status code and payload.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
