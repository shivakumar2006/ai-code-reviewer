package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func Connect(uri, dbName string) *Database {
	// give mongo 10 seconds timeout to connect otherwise it refuse to connect
	context, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// client option with our uri
	clientOptions := options.Client().ApplyURI(uri)

	// connect to mongo
	client, err := mongo.Connect(context, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to mongodb %v", err)
	}

	// ping the db
	if err := client.Ping(context, nil); err != nil {
		log.Fatalf("Failed to ping mongodb: %v", err)
	}

	log.Println("MongoDB connected successfully")

	return &Database{
		Client: client,
		DB:     client.Database(dbName),
	}
}

func (d *Database) GetCollection(name string) *mongo.Collection {
	return d.DB.Collection(name)
}

func (d *Database) Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := d.Client.Disconnect(ctx); err != nil {
		log.Fatalf("Error disconnecting mongoDB: %v", err)
	}

	log.Println("MongoDB connection closed")
}
