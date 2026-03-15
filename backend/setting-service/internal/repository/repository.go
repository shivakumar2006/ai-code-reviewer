package repository

import (
	"context"
	"setting-service/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const collectionName = "user_providers"

// provider repository defines the data-access contract
type ProviderRepository interface {
	UpsertProvider(ctx context.Context, userID, provider string, cfg models.ProviderConfig) error
	GetSettings(ctx context.Context, userID string) (models.UserProviderSettings, error)
	DeleteProvider(ctx context.Context, userID, provider string) error
	UpsertGithub(ctx context.Context, userID string, cfg models.GithubConfig) error
	DeleteGithub(ctx context.Context, userID string) error
	GetGithub(ctx context.Context, userID string) (models.GithubConfig, error)
}

type mongoProviderRepo struct {
	col *mongo.Collection
}

func NewProviderRepository(db *mongo.Database) ProviderRepository {
	col := db.Collection(collectionName)

	idxModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "user_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, _ = col.Indexes().CreateOne(ctx, idxModel)

	return &mongoProviderRepo{col: col}
}
