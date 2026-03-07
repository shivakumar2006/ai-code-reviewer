package repository

import (
	"context"
	"errors"
	"review-service/internal/db"
	"review-service/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ReviewRepository struct {
	col *mongo.Collection
}

func NewReviewRepository(database *db.Database) *ReviewRepository {
	return &ReviewRepository{
		col: database.GetCollection("reviews"),
	}
}

// write operations
func (r *ReviewRepository) Create(ctx context.Context, review *models.Review) error {
	review.ID = primitive.NewObjectID()
	review.CreatedAt = time.Now()
	review.UpdatedAt = time.Now()

	_, err := r.col.InsertOne(ctx, review)
	return err
}

func (r *ReviewRepository) UpdateReview(ctx context.Context, id primitive.ObjectID, llmResp *models.LLMReviewResponse, status models.ReviewStatus) error {
	filter := bson.M{
		"_id": id,
	}

	update := bson.M{
		"$set": bson.M{
			"status":      status,
			"score":       llmResp.Score,
			"summary":     llmResp.Summary,
			"issues":      llmResp.Issues,
			"suggestions": llmResp.Suggestions,
			"updated_at":  time.Now(),
		},
	}

	result, err := r.col.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("review not found")
	}
	return nil
}

func (r *ReviewRepository) UpdateStatus(ctx context.Context, id primitive.ObjectID, status models.ReviewStatus) error {
	filter := bson.M{"_id": id}
	update := bson.M{
		"$set": bson.M{
			"status":     status,
			"updated_at": time.Now(),
		},
	}

	_, err := r.col.UpdateOne(ctx, filter, update)
	return err
}

func (r *ReviewRepository) Delete(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) error {
	// user can delete their own reviews
	filter := bson.M{
		"id":      id,
		"user_id": userID,
	}

	result, err := r.col.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("reviews not found or unauthorized")
	}
	return nil
}

// read operations
func (r *ReviewRepository) FindByID(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) (*models.Review, error) {
	var review models.Review

	filter := bson.M{
		"_id":     id,
		"user_id": userID,
	}

	err := r.col.FindOne(ctx, filter).Decode(&review)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("review not found")
		}
		return nil, err
	}
	return &review, nil
}

func (r *ReviewRepository) FindAllByUser(ctx context.Context, userID primitive.ObjectID, page, limit int) ([]models.Review, int64, error) {
	filter := bson.M{"user_id": userID}

	// get total count first
	total, err := r.col.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// pagination
	skip := int64((page - 1) * limit)

	findOptions := options.Find().
		SetSort(bson.M{"created_at": -1}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := r.col.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var reviews []models.Review
	if err := cursor.All(ctx, &reviews); err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

// indexes

func (r *ReviewRepository) CreateIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		// fast lookup by user - most common query
		{
			Keys: bson.M{"user_id": 1},
		},
		// compund index - user review sorted by date
		{
			Keys: bson.D{
				{Key: "user_id", Value: 1},
				{Key: "created_at", Value: -1},
			},
		},
		// fast lookup by status - useful for finding pending reviews
		{
			Keys: bson.M{"status": 1},
		},
	}

	_, err := r.col.Indexes().CreateMany(ctx, indexes)
	return err
}
