package database

import (
	"fmt"
	"log"
	"time"

	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Database wraps the GORM DB connection
type Database struct {
	DB *gorm.DB
}

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg *config.Config) (*Database, error) {
	var logLevel logger.LogLevel
	if cfg.Server.Environment == "production" {
		logLevel = logger.Error
	} else {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(cfg.Database.ConnMaxLifetime)

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established")

	return &Database{DB: db}, nil
}

// AutoMigrate runs database migrations for all models
func (d *Database) AutoMigrate() error {
	log.Println("🔄 Running database migrations...")

	err := d.DB.AutoMigrate(
		// User models
		&models.User{},
		&models.UserStats{},
		&models.EmailVerification{},
		&models.PasswordReset{},

		// Question models
		&models.Topic{},
		&models.SubTopic{},
		&models.Question{},
		&models.QuestionOption{},
		&models.UserAnswer{},
		&models.UserBookmark{},
		&models.UserTopicMastery{},

		// Test models
		&models.PracticeTest{},
		&models.PracticeTestQuestion{},

		// Subscription models
		&models.Subscription{},
		&models.Payment{},

		// Study models
		&models.StudyPath{},
		&models.Module{},
		&models.UserModuleProgress{},

		// Notification and community models
		&models.Notification{},
		&models.UserNotificationSettings{},
		&models.ForumPost{},
		&models.ForumReply{},
		&models.StudyGroup{},
		&models.StudyGroupMember{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("✅ Database migrations completed")
	return nil
}

// Close closes the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// CreateIndexes creates additional database indexes for performance
func (d *Database) CreateIndexes() error {
	log.Println("🔄 Creating database indexes...")

	indexes := []string{
		// User answer indexes
		"CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id)",
		"CREATE INDEX IF NOT EXISTS idx_user_answers_created_at ON user_answers(created_at)",

		// Practice test indexes
		"CREATE INDEX IF NOT EXISTS idx_practice_tests_user_id_status ON practice_tests(user_id, status)",

		// Question indexes (composite for common queries)
		"CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON questions(topic_id, difficulty)",
		"CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active) WHERE is_active = true",
		"CREATE INDEX IF NOT EXISTS idx_questions_updated_at ON questions(updated_at DESC)",

		// Full-text search index for question content (using pg_trgm)
		"CREATE INDEX IF NOT EXISTS idx_questions_content_trgm ON questions USING gin(content gin_trgm_ops)",
		"CREATE INDEX IF NOT EXISTS idx_questions_explanation_trgm ON questions USING gin(explanation gin_trgm_ops)",

		// Question option indexes
		"CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id)",
		"CREATE INDEX IF NOT EXISTS idx_question_options_position ON question_options(question_id, position)",
	}

	for _, index := range indexes {
		if err := d.DB.Exec(index).Error; err != nil {
			log.Printf("⚠️ Warning: Failed to create index: %v", err)
		}
	}

	log.Println("✅ Database indexes created")
	return nil
}

// EnableExtensions enables PostgreSQL extensions
func (d *Database) EnableExtensions() error {
	log.Println("🔄 Enabling PostgreSQL extensions...")

	extensions := []string{
		"CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"",
		"CREATE EXTENSION IF NOT EXISTS \"pg_trgm\"", // For full-text search
	}

	for _, ext := range extensions {
		if err := d.DB.Exec(ext).Error; err != nil {
			log.Printf("⚠️ Warning: Failed to enable extension: %v", err)
		}
	}

	log.Println("✅ PostgreSQL extensions enabled")
	return nil
}
