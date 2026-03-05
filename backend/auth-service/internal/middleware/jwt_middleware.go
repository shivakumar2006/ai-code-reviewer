package middleware

import (
	"auth-service/pkg/jwt"
	"context"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// context key
type contextKey string

const (
	UserIDKey    contextKey = "userID"
	UserEmailKey contextKey = "userEmail"
)

type AuthMiddleware struct {
	jwtManager *jwt.JWTManager
}

func NewAuthMiddleware(jwtManager *jwt.JWTManager) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager: jwtManager,
	}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// get authorized header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "authorized header is required", http.StatusUnauthorized)
			return
		}

		// check format is of Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			http.Error(w, "format must be: Bearer <token>", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		// validate token
		claims, err := m.jwtManager.ValidateAccessToken(tokenString)
		if err != nil {
			http.Error(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}

		// convert userID string to ObjectID
		userID, err := primitive.ObjectIDFromHex(claims.UserID)
		if err != nil {
			http.Error(w, "invalid token claims", http.StatusUnauthorized)
			return
		}

		// inject into reqest context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserEmailKey, claims.Email)

		// call next handler with updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// helpers
func GetUserID(r *http.Request) (primitive.ObjectID, bool) {
	value := r.Context().Value(UserIDKey)
	if value == nil {
		return primitive.NilObjectID, false
	}

	userID, ok := value.(primitive.ObjectID)
	return userID, ok
}

func GetUserEmail(r *http.Request) (string, bool) {
	value := r.Context().Value(UserEmailKey)
	if value == nil {
		return "", false
	}
	email, ok := value.(string)
	return email, ok
}
