-- =====================================================
-- ADD MISSING ORGANIZATION FIELDS
-- =====================================================
-- Purpose: Add fields that are shown in UI but missing from database
-- Date: December 18, 2025
-- =====================================================

BEGIN;

-- Add missing fields to organization table
ALTER TABLE organization 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS operational_since DATE,
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS primary_contact_email VARCHAR(200),
ADD COLUMN IF NOT EXISTS primary_contact_phone VARCHAR(50);

-- Add comments
COMMENT ON COLUMN organization.description IS 'Organization description';
COMMENT ON COLUMN organization.operational_since IS 'Date when organization started operations';
COMMENT ON COLUMN organization.website IS 'Organization website URL';
COMMENT ON COLUMN organization.primary_contact_name IS 'Name of primary contact person';
COMMENT ON COLUMN organization.primary_contact_email IS 'Email of primary contact person';
COMMENT ON COLUMN organization.primary_contact_phone IS 'Phone number of primary contact person';

COMMIT;
