package repository

import (
	"auth-service/internal/db"
	"auth-service/internal/models"
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository struct {
	userCol  *mongo.Collection
	tokenCol *mongo.Collection
}

func NewUserRepository(database *db.Database) *UserRepository {
	return &UserRepository{
		userCol:  database.GetCollection("users"),
		tokenCol: database.GetCollection("refresh_tokens"),
	}
}

// create user
func (r *UserRepository) CreateUser(ctx context.Context, user *models.User) error {
	user.ID = primitive.NewObjectID()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	_, err := r.userCol.InsertOne(ctx, user)
	if err != nil {
		// check if email already exist or not
		if mongo.IsDuplicateKeyError(err) {
			return errors.New("Email already exist")
		}
		return err
	}
	return nil
}

func (r *UserRepository) FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User

	filter := bson.M{"email": email}
	err := r.userCol.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindUserById(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	var user models.User

	filter := bson.M{"_id": id}
	err := r.userCol.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("User not found")
		}
		return nil, err
	}
	return &user, nil
}

// refresh token queries

func (r *UserRepository) SaveRefreshToken(ctx context.Context, token *models.RefreshToken) error {
	token.ID = primitive.NewObjectID()
	token.CreatedAt = time.Now()

	_, err := r.tokenCol.InsertOne(ctx, token)
	if err != nil {
		return err
	}
	return nil
}

func (r *UserRepository) FindRefreshToken(ctx context.Context, tokenString string) (*models.RefreshToken, error) {
	var token models.RefreshToken

	filter := bson.M{"token": tokenString}
	err := r.tokenCol.FindOne(ctx, filter).Decode(&token)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("refresh token not found")
		}
		return nil, err
	}
	return &token, nil
}

func (r *UserRepository) DeleteRefreshToken(ctx context.Context, tokenString string) error {
	filter := bson.M{"token": tokenString}
	result, err := r.tokenCol.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("Refresh token not found")
	}
	return nil
}

func (r *UserRepository) DeleteAllUserTokens(ctx context.Context, userID primitive.ObjectID) error {
	filter := bson.M{"user_id": userID}
	_, err := r.tokenCol.DeleteMany(ctx, filter)
	if err != nil {
		return err
	}
	return nil
}

// indexes (call once at startup)

func (r *UserRepository) CreateIndexes(ctx context.Context) error {

	userIndex := mongo.IndexModel{
		Keys:    bson.M{"email": 1},
		Options: options.Index().SetUnique(true),
	}

	_, err := r.userCol.Indexes().CreateOne(ctx, userIndex)
	if err != nil {
		return err
	}

	tokenIndex := mongo.IndexModel{
		Keys: bson.M{"token": 1},
	}

	_, err = r.tokenCol.Indexes().CreateOne(ctx, tokenIndex)
	if err != nil {
		return err
	}

	ttlIndex := mongo.IndexModel{
		Keys:    bson.M{"expires_at": 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}

	_, err = r.tokenCol.Indexes().CreateOne(ctx, ttlIndex)
	if err != nil {
		return err
	}

	return nil
}
