-- =============================================================================
-- FIX SCRIPT FOR PHASE 2 MIGRATIONS
-- Addresses schema mismatches and missing columns
-- =============================================================================

-- ===== FIX 1: Add missing columns to existing tables =====

-- Fix for migration 08: Add capacity tracking columns to branch
ALTER TABLE branch ADD COLUMN IF NOT EXISTS total_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS icu_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS emergency_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS occupied_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS occupied_icu_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS occupied_emergency_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS last_capacity_update TIMESTAMPTZ;

-- Note: Skipping geospatial index since ll_to_earth requires PostGIS
-- Will use standard B-tree index instead
CREATE INDEX IF NOT EXISTS idx_branch_location ON branch(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_branch_capacity ON branch(occupied_beds, total_beds);

-- Fix for migration 10: employment_contract uses person_id not employee_id
-- No action needed - will update migration script

-- Fix for migration 14: patient table uses medical_record_number not patient_number
-- No action needed - will update migration script

-- Fix for migration 15: tenant table structure is different
-- No action needed - will update migration script

-- Fix for migration 16: department uses department_type not department_category
-- No action needed - will update migration script

-- ===== FIX 2: Table name references =====

-- Fix for migration 09: AspNetRoles should be referenced as aspnetroles (lowercase)
-- No schema changes needed - will update migration script

RAISE NOTICE '========================================';
RAISE NOTICE 'PHASE 2 SCHEMA FIXES COMPLETE';
RAISE NOTICE '========================================';
RAISE NOTICE '✓ Added capacity tracking columns to branch';
RAISE NOTICE '✓ Created indexes for location and capacity';
RAISE NOTICE '⚠ Skipped PostGIS geospatial index (not installed)';
RAISE NOTICE '========================================';
RAISE NOTICE 'Next: Execute fixed migration scripts 08-16';
RAISE NOTICE '========================================';
