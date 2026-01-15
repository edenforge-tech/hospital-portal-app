-- Add is_primary column to department_access table
-- This column was previously renamed to can_export in error
-- We need a separate boolean field to track primary department

ALTER TABLE department_access 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_department_access_is_primary 
ON department_access(user_id, is_primary) 
WHERE is_primary = TRUE AND deleted_at IS NULL;

-- Add constraint to ensure only one primary department per user per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_department_access_one_primary_per_user
ON department_access(tenant_id, user_id, is_primary)
WHERE is_primary = TRUE AND deleted_at IS NULL;

COMMENT ON COLUMN department_access.is_primary IS 'Indicates if this is the users primary department assignment';
