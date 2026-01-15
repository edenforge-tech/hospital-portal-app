-- Add missing ComplianceFlags column to audit_log table
-- This column is required by the C# AuditLog model but is missing from the database

-- Check if column exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'audit_log' 
        AND column_name = 'ComplianceFlags'
    ) THEN
        ALTER TABLE audit_log 
        ADD COLUMN "ComplianceFlags" TEXT NULL;
        
        RAISE NOTICE 'Added ComplianceFlags column to audit_log table';
    ELSE
        RAISE NOTICE 'ComplianceFlags column already exists in audit_log table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
AND column_name = 'ComplianceFlags';
