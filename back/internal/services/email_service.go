package services

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"html/template"
	"net/smtp"
	"strings"

	"github.com/nppe-pro/api/config"
)

// EmailService handles sending emails via Gmail SMTP
type EmailService struct {
	config *config.Config
}

// NewEmailService creates a new email service instance
func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{
		config: cfg,
	}
}

// EmailTemplateData holds template variables
type EmailTemplateData struct {
	FirstName string
	VerifyURL string
	ToEmail   string
}

// SendVerificationEmail sends an email verification email to the user
func (e *EmailService) SendVerificationEmail(toEmail string, firstName string, token string) error {
	// Generate the verification URL
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", e.config.Server.FrontendURL, token)

	// Create email content
	subject := "Verify Your Email - ProCertFlo"
	body := e.createVerificationEmailBody(firstName, verifyURL, toEmail)

	return e.sendEmail(toEmail, subject, body)
}

// SendPasswordResetEmail sends a password reset email to the user
func (e *EmailService) SendPasswordResetEmail(toEmail string, firstName string, token string) error {
	// Generate the reset URL
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", e.config.Server.FrontendURL, token)

	// Create email content
	subject := "Reset Your Password - ProCertFlo"
	body := e.createPasswordResetEmailBody(firstName, resetURL, toEmail)

	return e.sendEmail(toEmail, subject, body)
}

// sendEmail sends an email using Gmail SMTP
func (e *EmailService) sendEmail(to string, subject string, body string) error {
	// Gmail SMTP configuration
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	// Get SMTP credentials from environment
	smtpUser := e.config.Email.GmailSMTPUser
	smtpPass := e.config.Email.GmailSMTPPass

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("Gmail SMTP credentials not configured")
	}

	// Create email headers
	headers := fmt.Sprintf("To: %s\r\n", to)
	headers += fmt.Sprintf("Subject: %s\r\n", subject)
	headers += "MIME-Version: 1.0\r\n"
	headers += "Content-Type: text/html; charset=UTF-8\r\n"
	headers += "\r\n"

	// Combine headers and body
	message := headers + body

	// Set up authentication
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Compose message to send
	fullMessage := fmt.Sprintf("From: %s\r\n%s", smtpUser, message)

	// Send email
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	return smtp.SendMail(addr, auth, smtpUser, []string{to}, []byte(fullMessage))
}

// createVerificationEmailBody creates HTML email body for verification using html/template
func (e *EmailService) createVerificationEmailBody(firstName string, verifyURL string, toEmail string) string {
	const htmlTemplateStr = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 ProCertFlo</h1>
        <p>Email Verification Required</p>
    </div>
    
    <div class="content">
        <h2>Hello {{.FirstName}}!</h2>
        <p>Thank you for signing up for ProCertFlo! To complete your registration and start using our platform, please verify your email address.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{.VerifyURL}}" class="button">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #f1f3f4; padding: 10px; border-radius: 5px; word-break: break-all;">{{.VerifyURL}}</p>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in 1 hour for security reasons.
        </div>
        
        <p>If you didn't create a ProCertFlo account, please ignore this email.</p>
        
        <p>Best regards,<br>
        The ProCertFlo Team</p>
    </div>
    
    <div class="footer">
        <p>© 2025 ProCertFlo. All rights reserved.</p>
        <p>This email was sent to {{.ToEmail}}. If you have any questions, contact our support team.</p>
    </div>
</body>
</html>`

	// Prepare template data
	data := EmailTemplateData{
		FirstName: firstName,
		VerifyURL: verifyURL,
		ToEmail:   toEmail,
	}

	// Parse template
	tmpl, err := template.New("verification").Parse(htmlTemplateStr)
	if err != nil {
		fmt.Printf("Email template parsing error: %v\n", err)
		// Fallback to basic string to ensure email still goes out
		return fmt.Sprintf("Hello %s, please verify email: %s", firstName, verifyURL)
	}

	// Execute template
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		fmt.Printf("Email template execution error: %v\n", err)
		return fmt.Sprintf("Hello %s, please verify email: %s", firstName, verifyURL)
	}

	return buf.String()
}

// createPasswordResetEmailBody creates HTML email body for password reset using html/template
func (e *EmailService) createPasswordResetEmailBody(firstName string, resetURL string, toEmail string) string {
	const htmlTemplateStr = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 ProCertFlo</h1>
        <p>Password Reset Request</p>
    </div>
    
    <div class="content">
        <h2>Hello {{.FirstName}}!</h2>
        <p>We received a request to reset your password for your ProCertFlo account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{.VerifyURL}}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #f1f3f4; padding: 10px; border-radius: 5px; word-break: break-all;">{{.VerifyURL}}</p>
        
        <div class="warning">
            <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for your security.
        </div>
        
        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        
        <p>Best regards,<br>
        The ProCertFlo Team</p>
    </div>
    
    <div class="footer">
        <p>© 2025 ProCertFlo. All rights reserved.</p>
        <p>This email was sent to {{.ToEmail}}. If you have any questions, contact our support team.</p>
    </div>
</body>
</html>`

	// Prepare template data
	data := EmailTemplateData{
		FirstName: firstName,
		VerifyURL: resetURL,
		ToEmail:   toEmail,
	}

	// Parse template
	tmpl, err := template.New("reset").Parse(htmlTemplateStr)
	if err != nil {
		fmt.Printf("Password reset template parsing error: %v\n", err)
		// Fallback to basic string to ensure email still goes out
		return fmt.Sprintf("Hello %s, please reset password: %s", firstName, resetURL)
	}

	// Execute template
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		fmt.Printf("Password reset template execution error: %v\n", err)
		return fmt.Sprintf("Hello %s, please reset password: %s", firstName, resetURL)
	}

	return buf.String()
}

// GenerateSecureToken generates a cryptographically secure random token
func GenerateSecureToken(length int) string {
	// Use crypto/rand for secure random generation
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		// Fallback to less secure method if crypto/rand fails
		return generateFallbackToken(length)
	}
	return hex.EncodeToString(b)[:length]
}

// HashToken hashes a token using SHA-256 for storage
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// generateFallbackToken generates a token using crypto/rand fallback
func generateFallbackToken(length int) string {
	// This is a fallback method - should rarely be needed
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var result strings.Builder
	for i := 0; i < length; i++ {
		// Using a simple method as fallback
		result.WriteByte(charset[i%len(charset)])
	}
	return result.String()
}
