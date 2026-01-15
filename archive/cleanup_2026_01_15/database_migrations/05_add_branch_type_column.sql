-- ============================================================================
-- Migration: Add branch_type column to branch table
-- Date: 2025-01-15
-- Purpose: Add missing branch_type column to support branch classification
-- ============================================================================

-- Add branch_type column
ALTER TABLE branch 
ADD COLUMN IF NOT EXISTS branch_type VARCHAR(50);

-- Add comment
COMMENT ON COLUMN branch.branch_type IS 'Type/classification of the branch (e.g., Main, Satellite, Diagnostic Center, Clinic)';

-- Optional: Add a check constraint for valid values (uncomment if needed)
-- ALTER TABLE branch 
-- ADD CONSTRAINT chk_branch_type CHECK (
--     branch_type IS NULL OR 
--     branch_type IN ('Main', 'Satellite', 'Diagnostic Center', 'Clinic', 'Pharmacy', 'Laboratory')
-- );
