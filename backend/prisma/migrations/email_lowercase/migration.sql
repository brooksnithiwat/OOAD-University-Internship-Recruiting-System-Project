-- Convert all existing emails to lowercase
UPDATE "users" SET email = LOWER(email);

-- Add a constraint to keep emails lowercase (optional, but recommended)
-- This creates a check constraint that ensures emails stored are in lowercase
ALTER TABLE "users" 
ADD CONSTRAINT email_lowercase CHECK (email = LOWER(email));
