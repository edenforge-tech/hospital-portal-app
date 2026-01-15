-- =====================================================
-- MIGRATION: CREATE ORGANIZATION TABLE
-- =====================================================
-- Purpose: Add Organization entity between Tenant and Branch
-- Structure: Tenant → Organization → Branch → Department
-- Date: December 7, 2025
-- =====================================================

BEGIN;

-- =====================================================
-- CREATE ORGANIZATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    organization_code VARCHAR(50) NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    
    -- Regional Configuration
    country_code VARCHAR(3) NOT NULL DEFAULT 'IND', -- ISO 3166-1 alpha-3 (IND, USA, GBR, ARE, etc.)
    state_province VARCHAR(100), -- State/Province for regional compliance
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata', -- IANA timezone
    currency VARCHAR(3) NOT NULL DEFAULT 'INR', -- ISO 4217 currency code
    language VARCHAR(10) NOT NULL DEFAULT 'en', -- ISO 639-1 language code
    date_format VARCHAR(20) NOT NULL DEFAULT 'DD-MM-YYYY',
    time_format VARCHAR(10) NOT NULL DEFAULT '24h', -- '12h' or '24h'
    number_format VARCHAR(20) NOT NULL DEFAULT 'en-IN', -- Locale for number formatting
    
    -- Contact & Address
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Compliance & Regulatory
    regulatory_body VARCHAR(100), -- NABH, JCI, WHO, etc.
    license_number VARCHAR(100),
    accreditation_status VARCHAR(50) DEFAULT 'Pending',
    accreditation_expiry DATE,
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7), -- Hex color code
    secondary_color VARCHAR(7),
    
    -- Status & Audit
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    deleted_at TIMESTAMP,
    deleted_by UUID,
    
    -- Foreign Keys
    CONSTRAINT fk_organization_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_organization_code UNIQUE (tenant_id, organization_code),
    CONSTRAINT uk_organization_name UNIQUE (tenant_id, organization_name)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_organization_tenant_id ON organization(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organization_country ON organization(country_code);
CREATE INDEX IF NOT EXISTS idx_organization_status ON organization(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organization_active ON organization(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organization_deleted ON organization(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) FOR MULTI-TENANCY
-- =====================================================

-- Enable RLS
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

-- Policy: Tenant Isolation
CREATE POLICY tenant_isolation_organization ON organization
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Policy: Admin Bypass (for super admin operations)
CREATE POLICY admin_bypass_organization ON organization
    FOR ALL
    TO rls_admin
    USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organization IS 'Regional/state-level entities under tenant, subject to local governance and compliance';
COMMENT ON COLUMN organization.country_code IS 'ISO 3166-1 alpha-3 country code for regional compliance';
COMMENT ON COLUMN organization.timezone IS 'IANA timezone database name (e.g., Asia/Kolkata, America/New_York)';
COMMENT ON COLUMN organization.currency IS 'ISO 4217 currency code (INR, USD, EUR, GBP, AED)';
COMMENT ON COLUMN organization.language IS 'ISO 639-1 language code (en, hi, es, ar, zh)';
COMMENT ON COLUMN organization.date_format IS 'Display format for dates (DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD)';

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'organization'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'organization';
