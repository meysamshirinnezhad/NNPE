-- Migration: Convert from boolean has_test_access to credit-based system
-- Remove old column and add new ones for exam attempts and expiration

-- Remove the old has_test_access column
ALTER TABLE users DROP COLUMN IF EXISTS has_test_access;

-- Add new columns for credit-based system
ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_attempts_left INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;
