package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TokenType string

const (
	AccessToken  TokenType = "access"
	RefreshToken TokenType = "refresh"
)

// claims is what we embed inside the token
type Claims struct {
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

type JWTManager struct {
	accessSecret  string
	refreshSecret string
	accessExpiry  time.Duration
	refreshExpiry time.Duration
}

func NewJWTManager(accessSecret, refreshSecret string, accessExpiry, refreshExpiry time.Duration) *JWTManager {
	return &JWTManager{
		accessSecret:  accessSecret,
		refreshSecret: refreshSecret,
		accessExpiry:  accessExpiry,
		refreshExpiry: refreshExpiry,
	}
}

// generate tokens pair creates both access + refresh token at once
func (j *JWTManager) GenerateTokenPair(userID primitive.ObjectID, email string) (*TokenPair, error) {
	accessToken, err := j.generateToken(userID, email, AccessToken, j.accessSecret, j.accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := j.generateToken(userID, email, RefreshToken, j.refreshSecret, j.refreshExpiry)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (j *JWTManager) generateToken(userID primitive.ObjectID, email string, tokenType TokenType, secret string, expiry time.Duration) (string, error) {
	claims := &Claims{
		UserID:    userID.Hex(),
		Email:     email,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "ai_code_reviewer",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (j *JWTManager) ValidateAccessToken(tokenString string) (*Claims, error) {
	return j.validateToken(tokenString, j.accessSecret, AccessToken)
}

func (j *JWTManager) validateRefreshToken(tokenString string) (*Claims, error) {
	return j.validateToken(tokenString, j.refreshSecret, RefreshToken)
}

func (j *JWTManager) validateToken(tokenString, secret string, expectedType TokenType) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			// make sure signing method is need to be what we expected
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("Unexpected signing method")
			}
			return []byte(secret), nil
		},
	)

	if err != nil {
		return nil, err
	}

	// extract claims from token
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.TokenType != expectedType {
		return nil, errors.New("Invalid token type")
	}

	return claims, nil
}
