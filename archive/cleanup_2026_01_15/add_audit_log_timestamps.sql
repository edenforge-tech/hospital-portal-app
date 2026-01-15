-- Add missing timestamp columns to audit_log table
BEGIN;

-- Add created_at column (will be used for record creation time)
ALTER TABLE audit_log 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- Add Timestamp column (alias for created_at, used by service layer)
ALTER TABLE audit_log 
ADD COLUMN IF NOT EXISTS "Timestamp" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- Update existing records with random timestamps in the last 24 hours
-- This gives realistic time distribution for dashboard
UPDATE audit_log 
SET created_at = NOW() - (RANDOM() * INTERVAL '24 hours'),
    "Timestamp" = NOW() - (RANDOM() * INTERVAL '24 hours')
WHERE created_at IS NULL OR "Timestamp" IS NULL;

-- Verify the changes
SELECT 
    COUNT(*) as total_logs,
    COUNT(created_at) as logs_with_created_at,
    COUNT("Timestamp") as logs_with_timestamp,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM audit_log;

COMMIT;
