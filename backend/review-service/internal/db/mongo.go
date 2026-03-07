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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to mongodb: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Failed to ping: %v", err)
	}

	log.Println("Connected to mongodb successfully")

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
		log.Printf("Error disconnecting mongodb: %v", err)
	}

	log.Println("Mongodb disconnected successfully")
}
