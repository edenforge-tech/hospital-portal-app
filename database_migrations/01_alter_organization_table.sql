-- =====================================================
-- MIGRATION: Alter Organization Table
-- Purpose: Add missing columns to existing organization table
-- Date: 2025-12-07
-- =====================================================

BEGIN;

-- Add missing columns to organization table
ALTER TABLE organization 
ADD COLUMN IF NOT EXISTS organization_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD-MM-YYYY',
ADD COLUMN IF NOT EXISTS time_format VARCHAR(10) DEFAULT '24h',
ADD COLUMN IF NOT EXISTS number_format VARCHAR(20) DEFAULT 'en-US',
ADD COLUMN IF NOT EXISTS email VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS regulatory_body VARCHAR(200),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS accreditation_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#1976d2',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#dc004e',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update organization_name from name if null
UPDATE organization 
SET organization_name = name 
WHERE organization_name IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_organization_active ON organization(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organization_country ON organization(country_code) WHERE deleted_at IS NULL;

-- Ensure RLS policy exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization' 
        AND policyname = 'tenant_isolation'
    ) THEN
        ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
        CREATE POLICY tenant_isolation ON organization
            FOR ALL
            USING (tenant_id::text = current_setting('app.current_tenant_id', true));
    END IF;
END $$;

-- Ensure admin bypass policy exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization' 
        AND policyname = 'admin_bypass'
    ) THEN
        CREATE POLICY admin_bypass ON organization
            FOR ALL
            TO rls_admin
            USING (true);
    END IF;
END $$;

COMMIT;

-- Verification
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'organization' 
ORDER BY ordinal_position;
