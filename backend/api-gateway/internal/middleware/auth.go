package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey      contextKey = "userID"
	UserEmailIDKey contextKey = "userEmail"
)

type AuthMiddleware struct {
	jwtSecret string
}

func NewAuthMiddleware(jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		jwtSecret: jwtSecret,
	}
}

// claims - same like auth-service
type Claims struct {
	UserID    string `json:"user_id"`
	UserEmail string `json:"user_email"`
	jwt.RegisteredClaims
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// get authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "authorization header is required")
			return
		}

		// check format is in Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeError(w, http.StatusUnauthorized, "format must be: Bearer <token>")
			return
		}

		tokenString := parts[1]

		// parse and validate token
		claims, err := parseToken(tokenString, m.jwtSecret)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		// make sure the access token is not a refresh token
		if claims.TokenType != "access" {
			writeError(w, http.StatusUnauthorized, "invalid token type")
			return
		}

		// inject claims into request context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, UserEmailIDKey, claims.UserEmail)

		r.Header.Set("X-User-ID", claims.UserID)
		r.Header.Set("X-User-Email", claims.UserEmail)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// helpers function

func parseToken(tokenString, secret string) (*Claims, error) {

}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write([]byte(message))
}
