-- Promote user to admin and verified
UPDATE users 
SET is_verified = true, is_admin = true 
WHERE email = 'admin@nppepro.local';