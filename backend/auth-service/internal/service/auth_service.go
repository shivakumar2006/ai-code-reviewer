package service

import (
	"auth-service/internal/models"
	"auth-service/internal/repository"
	"auth-service/pkg/jwt"
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo      *repository.UserRepository
	jwtManager    *jwt.JWTManager
	refreshExpiry time.Duration
}

func NewAuthService(userRepo *repository.UserRepository, jwtManager *jwt.JWTManager, refreshExpiry time.Duration) *AuthService {
	return &AuthService{
		userRepo:      userRepo,
		jwtManager:    jwtManager,
		refreshExpiry: refreshExpiry,
	}
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	existingUser, err := s.userRepo.FindUserByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, errors.New("email already in use")
	}

	if len(req.Password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to process password")
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if err := s.userRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	if err := s.saveRefreshToken(ctx, user.ID, tokenPair.RefreshToken); err != nil {
		return nil, err
	}

	return buildAuthResponse(tokenPair, user), nil
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.userRepo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	if err := s.saveRefreshToken(ctx, user.ID, tokenPair.RefreshToken); err != nil {
		return nil, err
	}

	return buildAuthResponse(tokenPair, user), nil
}

func (s *AuthService) Refresh(ctx context.Context, req *models.RefreshRequest) (*models.AuthResponse, error) {
	// 1. validate JWT signature + expiry
	claims, err := s.jwtManager.ValidateRefreshToken(req.RefreshToken) // ✅ uppercase V
	if err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}

	// 2. check token exists in MongoDB
	storedToken, err := s.userRepo.FindRefreshToken(ctx, req.RefreshToken)
	if err != nil {
		return nil, errors.New("refresh token not found, please login again")
	}

	// 3. check not expired in DB
	if time.Now().After(storedToken.ExpiresAt) {
		_ = s.userRepo.DeleteRefreshToken(ctx, req.RefreshToken)
		return nil, errors.New("refresh token expired, please login again")
	}

	// 4. get user from DB
	userID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return nil, errors.New("invalid token claims")
	}

	user, err := s.userRepo.FindUserById(ctx, userID)
	if err != nil {
		return nil, errors.New("user no longer exists")
	}

	// 5. delete old refresh token (rotation)
	_ = s.userRepo.DeleteRefreshToken(ctx, req.RefreshToken)

	// 6. generate new token pair
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("failed to generate tokens")
	}

	// 7. save new refresh token
	if err := s.saveRefreshToken(ctx, user.ID, tokenPair.RefreshToken); err != nil {
		return nil, err
	}

	return buildAuthResponse(tokenPair, user), nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	return s.userRepo.DeleteRefreshToken(ctx, refreshToken)
}

func (s *AuthService) LogoutAll(ctx context.Context, userID primitive.ObjectID) error {
	return s.userRepo.DeleteAllUserTokens(ctx, userID)
}

func (s *AuthService) GetMe(ctx context.Context, userID primitive.ObjectID) (*models.UserResponse, error) {
	user, err := s.userRepo.FindUserById(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &models.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}, nil
}

// ─────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────

func (s *AuthService) saveRefreshToken(ctx context.Context, userID primitive.ObjectID, tokenString string) error {
	refreshToken := &models.RefreshToken{
		UserID:    userID,
		Token:     tokenString,
		ExpiresAt: time.Now().Add(s.refreshExpiry),
	}
	return s.userRepo.SaveRefreshToken(ctx, refreshToken)
}

func buildAuthResponse(tokenPair *jwt.TokenPair, user *models.User) *models.AuthResponse {
	return &models.AuthResponse{
		AccessToken:  tokenPair.AccessToken,
		RefreshToken: tokenPair.RefreshToken,
		User: models.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			CreatedAt: user.CreatedAt,
		},
	}
}

