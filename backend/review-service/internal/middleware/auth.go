package middleware

import (
	"context"
	"net/http"
)

type contextKey string

const UserIDKey contextKey = "userID"

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("X-User-ID")
		if userID == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "unauthorized"}`))
			return
		}

		// inject into context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)

		// forward to next handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// get user id - extract user id from context
func GetUserID(r *http.Request) (string, bool) {
	value := r.Context().Value(UserIDKey)
	if value == nil {
		return "", false
	}
	userID, ok := value.(string)
	return userID, ok
}
