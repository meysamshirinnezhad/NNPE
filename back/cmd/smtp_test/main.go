package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"time"
)

func main() {
	// Read environment variables
	smtpUser := os.Getenv("GMAIL_SMTP_USER")
	smtpPass := os.Getenv("GMAIL_SMTP_PASS")
	testToEmail := os.Getenv("TEST_TO_EMAIL")

	// Validate required environment variables
	if smtpUser == "" {
		log.Fatal("❌ GMAIL_SMTP_USER environment variable is required")
	}
	if smtpPass == "" {
		log.Fatal("❌ GMAIL_SMTP_PASS environment variable is required")
	}
	if testToEmail == "" {
		log.Fatal("❌ TEST_TO_EMAIL environment variable is required")
	}

	// SMTP server configuration
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	fmt.Println("🚀 Gmail SMTP Test Starting...")
	fmt.Printf("📧 From: %s\n", smtpUser)
	fmt.Printf("📧 To: %s\n", testToEmail)
	fmt.Printf("🔗 Server: %s:%s\n", smtpHost, smtpPort)

	// Create email message
	subject := "SMTP Test - " + time.Now().Format("2006-01-02 15:04:05")
	body := fmt.Sprintf(`Hello,

This is a test email from your Go backend server to verify Gmail SMTP connectivity.

Timestamp: %s
Server: %s

If you receive this email, your SMTP configuration is working correctly!

Best regards,
Your Go Backend Server`, time.Now().Format("2006-01-02 15:04:05"), getHostname())

	// Compose message
	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: %s\r\n"+
		"Content-Type: text/plain; charset=utf-8\r\n"+
		"\r\n"+
		"%s", testToEmail, subject, body))

	// Set up authentication
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Connect to SMTP server
	fmt.Println("🔌 Connecting to SMTP server...")
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	// Create TLS config
	tlsConfig := &tls.Config{
		ServerName: smtpHost,
	}

	// Use timeout for connection
	conn, err := smtp.Dial(addr)
	if err != nil {
		log.Fatalf("❌ Failed to connect to SMTP server: %v", err)
	}
	defer conn.Close()

	// Start TLS
	fmt.Println("🔐 Starting TLS encryption...")
	if err := conn.StartTLS(tlsConfig); err != nil {
		log.Fatalf("❌ Failed to start TLS: %v", err)
	}

	// Authenticate
	fmt.Println("🔑 Authenticating...")
	if err := conn.Auth(auth); err != nil {
		log.Fatalf("❌ Authentication failed: %v", err)
	}

	// Set up sender and recipient
	if err := conn.Mail(smtpUser); err != nil {
		log.Fatalf("❌ Failed to set sender: %v", err)
	}
	if err := conn.Rcpt(testToEmail); err != nil {
		log.Fatalf("❌ Failed to set recipient: %v", err)
	}

	// Send email body
	fmt.Println("📤 Sending email...")
	writer, err := conn.Data()
	if err != nil {
		log.Fatalf("❌ Failed to create data writer: %v", err)
	}
	defer writer.Close()

	if _, err := writer.Write(msg); err != nil {
		log.Fatalf("❌ Failed to write email body: %v", err)
	}

	fmt.Println("✅ SUCCESS: Email sent successfully!")
	fmt.Println("📬 Check your inbox (and spam folder) for the test email")
	fmt.Println("📊 SMTP connectivity test completed successfully")
}

// getHostname returns the server hostname or "unknown" if unable to determine
func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}
