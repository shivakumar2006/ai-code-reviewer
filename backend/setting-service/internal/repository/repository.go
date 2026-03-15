package repository

import (
	"context"
	"fmt"
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
	GetSettings(ctx context.Context, userID string) (*models.UserProviderSettings, error)
	DeleteProvider(ctx context.Context, userID, provider string) error
	UpsertGithub(ctx context.Context, userID string, cfg models.GithubConfig) error
	DeleteGithub(ctx context.Context, userID string) error
	GetGithub(ctx context.Context, userID string) (*models.GithubConfig, error)
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

// lllm provider methods
// add or update single provider entry in the database
// uses $set so other providers in the map are untouched
func (r *mongoProviderRepo) UpsertProvider(ctx context.Context, userID, provider string, cfg models.ProviderConfig) error {
	filter := bson.D{{Key: "user_id", Value: userID}}
	update := bson.D{
		{Key: "$set", Value: bson.D{
			{Key: fmt.Sprintf("providers.%s", provider), Value: cfg},
			{Key: "updated_at", Value: time.Now().UTC()},
		}},
		{Key: "$setOnInsert", Value: bson.D{
			{Key: "user_id", Value: userID},
		}},
	}
	opts := options.Update().SetUpsert(true)
	if _, err := r.col.UpdateOne(ctx, filter, update, opts); err != nil {
		return fmt.Errorf("upsert provider: %w", err)
	}
	return nil
}

// get settings the full settings document for a user
// returns empty (nil, nil) if no documents is exist
func (r *mongoProviderRepo) GetSettings(ctx context.Context, userID string) (*models.UserProviderSettings, error) {
	filter := bson.D{{Key: "user_id", Value: userID}}

	var doc models.UserProviderSettings
	err := r.col.FindOne(ctx, filter).Decode(&doc)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get settings: %w", err)
	}
	return &doc, nil
}

// delete provider remove key from provider map
func (r *mongoProviderRepo) DeleteProvider(ctx context.Context, userID, provider string) error {
	doc, err := r.GetSettings(ctx, userID)
	if err != nil {
		return err
	}
	if doc == nil {
		return nil
	}
	if _, ok := doc.Providers[provider]; !ok {
		return models.ErrProviderNotFound
	}

	filter := bson.D{{Key: "user_id", Value: userID}}
	update := bson.D{
		{Key: "$unset", Value: bson.D{
			{Key: fmt.Sprintf("providers.%s", provider), Value: ""},
		}},
		{Key: "$set", Value: bson.D{
			{Key: "updated_at", Value: time.Now().UTC()},
		}},
	}
	if _, err := r.col.UpdateOne(ctx, filter, update); err != nil {
		return fmt.Errorf("delete provider: %w", err)
	}
	return nil
}

// github operations
func (r *mongoProviderRepo) UpsertGithub(ctx context.Context, userID string, cfg models.GithubConfig) error {
	filter := bson.D{{Key: "user_id", Value: userID}}
	update := bson.D{
		{Key: "$set", Value: bson.D{
			{Key: "github", Value: cfg},
			{Key: "updated_at", Value: time.Now().UTC()},
		}},
		{Key: "$setOnInsert", Value: bson.D{
			{Key: "user_id", Value: userID},
		}},
	}
	opts := options.Update().SetUpsert(true)
	if _, err := r.col.UpdateOne(ctx, filter, update, opts); err != nil {
		return fmt.Errorf("upsert github: %w", err)
	}
	return nil
}

func (r *mongoProviderRepo) DeleteGithub(ctx context.Context, userID string) error {
	doc, err := r.GetSettings(ctx, userID)
	if err != nil {
		return err
	}
	if doc == nil || doc.Github == nil {
		return models.ErrGitHubNotFound
	}

	filter := bson.D{{Key: "user_id", Value: userID}}
	update := bson.D{
		{Key: "$unset", Value: bson.D{
			{Key: "github", Value: ""},
		}},
		{Key: "$set", Value: bson.D{
			{Key: "updated_at", Value: time.Now().UTC()},
		}},
	}
	if _, err := r.col.UpdateOne(ctx, filter, update); err != nil {
		return fmt.Errorf("delete github: %w", err)
	}
	return nil
}

func (r *mongoProviderRepo) GetGithub(ctx context.Context, userID string) (*models.GithubConfig, error) {
	doc, err := r.GetSettings(ctx, userID)
	if err != nil {
		return nil, err
	}
	if doc == nil || doc.Github == nil {
		return nil, models.ErrGitHubNotFound
	}
	return doc.Github, nil
}
