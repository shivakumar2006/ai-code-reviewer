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

// register
func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {

	// check if user already exists
	existingUser, err := s.userRepo.FindUserByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, errors.New("email already in use")
	}

	if len(req.Password) < 8 {
		return nil, errors.New("Password must be at least 8 characters")
	}

	// hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to process password")
	}

	// build user
	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	// save user
	if err := s.userRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	// generate tokens
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	// save refresh token
	refreshToken := &models.RefreshToken{
		UserID:    user.ID,
		Token:     tokenPair.RefreshToken,
		ExpiresAt: time.Now().Add(s.refreshExpiry),
	}

	if err := s.userRepo.SaveRefreshToken(ctx, refreshToken); err != nil {
		return nil, err
	}

	return buildAuthResponse(tokenPair, user), nil
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {

	// find user by email
	user, err := s.userRepo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// compare password with hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// generate token pair
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	// save refresh token
	refreshToken := &models.RefreshToken{
		UserID:    user.ID,
		Token:     tokenPair.RefreshToken,
		ExpiresAt: time.Now().Add(s.refreshExpiry),
	}

	err = s.userRepo.SaveRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, err
	}

	// return response
	return buildAuthResponse(tokenPair, user), nil
}

// refresh

func (s *AuthService) Refresh(ctx context.Context, req *models.RefreshRequest) (*models.AuthResponse, error) {
	// 1. validate refresh token signature + expiry
	claims, err := s.jwtManager.ValidateRefreshToken(req.RefreshToken) // ← fix 1

	if err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}

	// 2. check token exists in MongoDB
	storedToken, err := s.userRepo.FindRefreshToken(ctx, req.RefreshToken) // ← fix 2
	if err != nil {
		return nil, errors.New("refresh token not found, please login again")
	}

	// 3. check not expired in DB
	if time.Now().After(storedToken.ExpiresAt) {
		_ = s.userRepo.DeleteRefreshToken(ctx, req.RefreshToken) // ← fix 3
		return nil, errors.New("refresh token expired, please login again")
	}

	// 4. get user from DB
	userID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return nil, errors.New("invalid token claims")
	}

	user, err := s.userRepo.FindUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user no longer exists")
	}

	// 5. delete old refresh token
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
	// just delete the refresh token from MongoDB
	// access token expires naturally after 15 min
	return s.userRepo.DeleteRefreshToken(ctx, refreshToken)
}

func (s *AuthService) LogoutAll(ctx context.Context, userID primitive.ObjectID) error {
	// delete ALL refresh tokens for this user
	// useful for "logout from all devices"
	return s.userRepo.DeleteAllUserTokens(ctx, userID)
}

func (s *AuthService) GetMe(ctx context.Context, userID primitive.ObjectID) (*models.UserResponse, error) {
	user, err := s.userRepo.FindUserByID(ctx, userID)
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
