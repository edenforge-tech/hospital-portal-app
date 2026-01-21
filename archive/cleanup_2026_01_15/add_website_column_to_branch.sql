-- Add Website column to branch table
-- This column was added to the C# model but missing in the database

DO $$ 
BEGIN
    -- Check if column doesn't exist before adding
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'branch' 
        AND column_name = 'website'
    ) THEN
        ALTER TABLE branch ADD COLUMN website VARCHAR(500);
        RAISE NOTICE 'Added website column to branch table';
    ELSE
        RAISE NOTICE 'Column website already exists in branch table';
    END IF;
END $$;
