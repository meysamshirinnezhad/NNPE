package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	OAuth    OAuthConfig
	Stripe   StripeConfig
	Email    EmailConfig
	AWS      AWSConfig
	RateLimit RateLimitConfig
	Logging  LoggingConfig
}

type ServerConfig struct {
	Port           string
	Environment    string
	AppName        string
	FrontendURL    string
	AllowedOrigins []string
	CookieSecure   bool
	CookieSameSite string
}

type DatabaseConfig struct {
	URL             string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime time.Duration
}

type RedisConfig struct {
	URL      string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret           string
	RefreshSecret    string
	Expiration       time.Duration
	RefreshExpiration time.Duration
}

type OAuthConfig struct {
	Google GoogleOAuthConfig
	Apple  AppleOAuthConfig
}

type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type AppleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type StripeConfig struct {
	SecretKey       string
	WebhookSecret   string
	MonthlyPriceID  string
	AnnualPriceID   string
}

type EmailConfig struct {
	SendGridAPIKey string
	FromEmail      string
	FromName       string
}

type AWSConfig struct {
	AccessKeyID     string
	SecretAccessKey string
	Region          string
	S3Bucket        string
}

type RateLimitConfig struct {
	Requests int
	Duration time.Duration
}

type LoggingConfig struct {
	Level  string
	Format string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists (optional in production)
	_ = godotenv.Load()

	cfg := &Config{
		Server: ServerConfig{
			Port:           getEnv("PORT", "8080"),
			Environment:    getEnv("APP_ENV", "development"),
			AppName:        getEnv("APP_NAME", "NPPE API"),
			FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:5173"),
			AllowedOrigins: getEnvAsSlice("ALLOWED_ORIGINS", []string{"http://localhost:5173"}),
			CookieSecure:   getEnvAsBool("COOKIE_SECURE", false),
			CookieSameSite: getEnv("COOKIE_SAMESITE", "Lax"),
		},
		Database: DatabaseConfig{
			URL:             getEnv("DATABASE_URL", "postgres://user:password@localhost:5432/nppe?sslmode=disable"),
			MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 10),
			MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 100),
			ConnMaxLifetime: getEnvAsDuration("DB_CONN_MAX_LIFETIME", time.Hour),
		},
		Redis: RedisConfig{
			URL:      getEnv("REDIS_URL", "redis://localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", "your-secret-key"),
			RefreshSecret:     getEnv("JWT_REFRESH_SECRET", "your-refresh-secret"),
			Expiration:        getEnvAsDuration("JWT_EXPIRATION", time.Hour),
			RefreshExpiration: getEnvAsDuration("JWT_REFRESH_EXPIRATION", 168*time.Hour),
		},
		OAuth: OAuthConfig{
			Google: GoogleOAuthConfig{
				ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
				ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
				RedirectURL:  getEnv("GOOGLE_REDIRECT_URL", ""),
			},
			Apple: AppleOAuthConfig{
				ClientID:     getEnv("APPLE_CLIENT_ID", ""),
				ClientSecret: getEnv("APPLE_CLIENT_SECRET", ""),
				RedirectURL:  getEnv("APPLE_REDIRECT_URL", ""),
			},
		},
		Stripe: StripeConfig{
			SecretKey:      getEnv("STRIPE_SECRET_KEY", ""),
			WebhookSecret:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
			MonthlyPriceID: getEnv("STRIPE_MONTHLY_PRICE_ID", ""),
			AnnualPriceID:  getEnv("STRIPE_ANNUAL_PRICE_ID", ""),
		},
		Email: EmailConfig{
			SendGridAPIKey: getEnv("SENDGRID_API_KEY", ""),
			FromEmail:      getEnv("FROM_EMAIL", "noreply@nppepro.com"),
			FromName:       getEnv("FROM_NAME", "NPPE Pro"),
		},
		AWS: AWSConfig{
			AccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
			Region:          getEnv("AWS_REGION", "us-east-1"),
			S3Bucket:        getEnv("AWS_S3_BUCKET", "nppe-uploads"),
		},
		RateLimit: RateLimitConfig{
			Requests: getEnvAsInt("RATE_LIMIT_REQUESTS", 60),
			Duration: getEnvAsDuration("RATE_LIMIT_DURATION", time.Minute),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}

	return cfg, nil
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := getEnv(key, "")
	if value, err := time.ParseDuration(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	
	var result []string
	current := ""
	for _, char := range valueStr {
		if char == ',' {
			if current != "" {
				result = append(result, current)
				current = ""
			}
		} else {
			current += string(char)
		}
	}
	if current != "" {
		result = append(result, current)
	}
	
	return result
}

// Validate checks if all required configuration values are set
func (c *Config) Validate() error {
	if c.JWT.Secret == "your-secret-key" && c.Server.Environment == "production" {
		return fmt.Errorf("JWT_SECRET must be set in production")
	}
	
	if c.Database.URL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	
	return nil
}
