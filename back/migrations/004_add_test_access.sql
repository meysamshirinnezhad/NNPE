-- Add has_test_access column to users table
ALTER TABLE users ADD COLUMN has_test_access BOOLEAN DEFAULT FALSE;
