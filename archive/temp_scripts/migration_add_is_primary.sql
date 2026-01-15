-- Migration: Add is_primary column to user_department_access table
-- Date: 2025-12-08
-- Purpose: Track which department is the user's primary/home department

-- Step 1: Add is_primary column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_department_access' 
        AND column_name = 'is_primary'
    ) THEN
        ALTER TABLE user_department_access 
        ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT FALSE;
        
        RAISE NOTICE 'Column is_primary added successfully';
    ELSE
        RAISE NOTICE 'Column is_primary already exists';
    END IF;
END $$;

-- Step 2: Create index for faster primary department lookups
CREATE INDEX IF NOT EXISTS idx_user_department_access_is_primary 
ON user_department_access(user_id, is_primary) 
WHERE is_primary = TRUE;

-- Step 3: Ensure only one primary department per user (unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_department_access_one_primary 
ON user_department_access(user_id) 
WHERE is_primary = TRUE;

-- Step 4: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_department_access'
ORDER BY ordinal_position;
