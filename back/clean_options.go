package main

import (
	"fmt"
	"log"

	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/pkg/database"
	"github.com/nppe-pro/api/pkg/text"
	"gorm.io/gorm"
)

func main() {
	fmt.Println("🧹 Starting option prefix cleaning...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Get all question options
	var options []models.QuestionOption
	if err := db.Find(&options).Error; err != nil {
		log.Fatalf("Failed to fetch options: %v", err)
	}

	fmt.Printf("Found %d options to process\n", len(options))

	updated := 0
	for _, option := range options {
		cleaned := text.CleanOptionPrefix(option.OptionText)
		if cleaned != option.OptionText {
			// Update the option
			if err := db.Model(&option).Update("option_text", cleaned).Error; err != nil {
				log.Printf("Failed to update option %s: %v", option.ID, err)
				continue
			}
			updated++
			fmt.Printf("Cleaned: '%s' → '%s'\n", option.OptionText, cleaned)
		}
	}

	fmt.Printf("✅ Successfully cleaned %d options\n", updated)
	fmt.Println("🎉 Option prefix cleaning completed!")
}
