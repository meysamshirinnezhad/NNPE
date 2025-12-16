package services

import (
	"strings"
	"testing"

	"github.com/nppe-pro/api/config"
)

func TestCreateVerificationEmailBody(t *testing.T) {
	// Setup
	cfg := &config.Config{
		Server: config.ServerConfig{
			FrontendURL: "https://procertflo.ca",
		},
	}
	emailService := NewEmailService(cfg)

	// Test Data
	firstName := "Jane"
	verifyURL := "https://procertflo.ca/verify?token=xyz"
	toEmail := "jane@example.com"

	// Execution
	body := emailService.createVerificationEmailBody(firstName, verifyURL, toEmail)

	// Assertions
	// 1. Check for the specific error string
	if strings.Contains(body, "%!s(MISSING)") {
		t.Fatal("CRITICAL: Output contains missing placeholder error '%!s(MISSING)'")
	}

	// 2. Check for data integrity
	checks := map[string]string{
		"FirstName": firstName,
		"Email":     toEmail,
		"Link Href": `href="` + verifyURL + `"`,
		"Link Text": ">" + verifyURL + "<",
	}

	for name, substr := range checks {
		if !strings.Contains(body, substr) {
			t.Errorf("Email body missing correct %s. Expected to find: %s", name, substr)
		}
	}
}
