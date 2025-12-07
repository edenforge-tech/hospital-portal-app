-- Fix user_department_access table - Add missing access_level column
-- This column stores the access level (Full, ReadOnly, ApprovalOnly) for user-department assignments

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_department_access' 
        AND column_name = 'access_level'
    ) THEN
        ALTER TABLE user_department_access 
        ADD COLUMN access_level VARCHAR(50) NOT NULL DEFAULT 'full';
        
        RAISE NOTICE 'Added access_level column to user_department_access table';
    ELSE
        RAISE NOTICE 'access_level column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_department_access'
AND column_name = 'access_level';
