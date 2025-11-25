package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/nppe-pro/api/config"
	"github.com/redis/go-redis/v9"
)

// RedisClient wraps the Redis client
type RedisClient struct {
	Client *redis.Client
}

// NewRedisClient creates a new Redis client connection
func NewRedisClient(cfg *config.Config) (*RedisClient, error) {
	opt, err := redis.ParseURL(cfg.Redis.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	if cfg.Redis.Password != "" {
		opt.Password = cfg.Redis.Password
	}
	opt.DB = cfg.Redis.DB

	client := redis.NewClient(opt)

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Println("✅ Redis connection established")

	return &RedisClient{Client: client}, nil
}

// Close closes the Redis connection
func (r *RedisClient) Close() error {
	return r.Client.Close()
}

// Set stores a value in Redis with an expiration time
func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.Client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value from Redis
func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.Client.Get(ctx, key).Result()
}

// Delete removes a key from Redis
func (r *RedisClient) Delete(ctx context.Context, keys ...string) error {
	return r.Client.Del(ctx, keys...).Err()
}

// Exists checks if a key exists in Redis
func (r *RedisClient) Exists(ctx context.Context, key string) (bool, error) {
	count, err := r.Client.Exists(ctx, key).Result()
	return count > 0, err
}

// Increment increments a counter in Redis
func (r *RedisClient) Increment(ctx context.Context, key string) (int64, error) {
	return r.Client.Incr(ctx, key).Result()
}

// SetNX sets a value only if it doesn't exist (for distributed locks)
func (r *RedisClient) SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error) {
	return r.Client.SetNX(ctx, key, value, expiration).Result()
}

// Expire sets an expiration time on a key
func (r *RedisClient) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return r.Client.Expire(ctx, key, expiration).Err()
}

// GetTTL gets the remaining time to live of a key
func (r *RedisClient) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	return r.Client.TTL(ctx, key).Result()
}
