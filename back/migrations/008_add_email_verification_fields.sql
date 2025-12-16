-- Migration: Add email verification fields to users table
-- Adds fields for email verification tokens and tracking

-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verify_token_hash VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS email_verify_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verify_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verify_token_hash ON users(email_verify_token_hash);
CREATE INDEX IF NOT EXISTS idx_users_email_verify_expires_at ON users(email_verify_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email_verify_sent_at ON users(email_verify_sent_at);

-- Update function for email verification rate limiting (1 hour window)
CREATE OR REPLACE FUNCTION can_send_verification_email(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    last_sent TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the last verification email sent time for this user
    SELECT email_verify_sent_at INTO last_sent
    FROM users
    WHERE email = user_email;
    
    -- If no email sent before, allow sending
    IF last_sent IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if more than 1 hour has passed since last email
    RETURN (NOW() - last_sent) > INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Clear expired tokens from users table
    UPDATE users 
    SET email_verify_token_hash = NULL,
        email_verify_expires_at = NULL
    WHERE email_verify_expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up old EmailVerification records too
    DELETE FROM email_verifications WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
