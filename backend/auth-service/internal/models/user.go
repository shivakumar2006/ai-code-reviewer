package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name"          json:"name"`
	Email     string             `bson:"email"         json:"email"`
	Password  string             `bson:"password"      json:"-"`          // ← fix 2
	CreatedAt time.Time          `bson:"created_at"    json:"created_at"` // ← fix 3
	UpdatedAt time.Time          `bson:"updated_at"    json:"updated_at"`
}

type RefreshToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id"       json:"user_id"`
	Token     string             `bson:"token"         json:"token"`
	ExpiresAt time.Time          `bson:"expires_at"    json:"expires_at"`
	CreatedAt time.Time          `bson:"created_at"    json:"created_at"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"` // ← fix 1
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         UserResponse `json:"user"`
}

type UserResponse struct {
	ID        primitive.ObjectID `json:"id"`
	Name      string             `json:"name"`
	Email     string             `json:"email"`
	CreatedAt time.Time          `json:"created_at"` // ← fix 3
}
