-- =====================================================
-- MIGRATION 06: PROFESSIONAL LICENSE & BULK OPERATIONS
-- =====================================================
-- Hospital Portal - Enable License Management & Bulk Ops
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Purpose: Create missing tables for enabled services
-- =====================================================

-- =====================================================
-- 1. PROFESSIONAL LICENSE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS professional_license (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- License Details
    license_type VARCHAR(100) NOT NULL, -- medical_council, nursing_council, pharmacy_council, specialty_board
    license_category VARCHAR(100), -- medical_doctor, registered_nurse, pharmacist, specialist
    issuing_authority VARCHAR(200) NOT NULL, -- State Medical Council, National Nursing Council, etc.
    issuing_country VARCHAR(100),
    issuing_state VARCHAR(100),
    
    -- License Numbers & Dates
    license_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    renewal_date DATE,
    
    -- Renewal Management
    renewal_reminder_days INTEGER DEFAULT 90, -- Remind 90 days before expiry
    last_reminder_sent_at TIMESTAMPTZ,
    renewal_status VARCHAR(50) DEFAULT 'active', -- active, expiring, expired, renewed, suspended
    
    -- Verification
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected, expired
    verified_at TIMESTAMPTZ,
    verified_by_user_id UUID REFERENCES users(id),
    verification_notes TEXT,
    
    -- Document Management
    document_url TEXT, -- Scanned license document
    renewal_document_url TEXT,
    
    -- Scope of Practice
    scope_of_practice TEXT,
    restrictions TEXT,
    specializations JSONB, -- Array of specializations
    
    -- Standard Columns
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_by_user_id UUID REFERENCES users(id),
    
    CONSTRAINT check_license_dates CHECK (issue_date <= expiry_date),
    CONSTRAINT uk_license_number UNIQUE (tenant_id, license_number, license_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_license_tenant ON professional_license(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_user ON professional_license(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_number ON professional_license(license_number);
CREATE INDEX IF NOT EXISTS idx_license_expiry ON professional_license(expiry_date) WHERE deleted_at IS NULL AND verification_status = 'verified';
CREATE INDEX IF NOT EXISTS idx_license_status ON professional_license(verification_status, renewal_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_type ON professional_license(license_type, license_category) WHERE deleted_at IS NULL;

-- RLS Policy
DROP POLICY IF EXISTS tenant_isolation_license ON professional_license;
CREATE POLICY tenant_isolation_license ON professional_license
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

ALTER TABLE professional_license ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON professional_license TO hospitalportal_app;

-- =====================================================
-- 2. BULK OPERATION JOB TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bulk_operation_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Job Details
    operation_type VARCHAR(100) NOT NULL, -- import_users, export_users, bulk_assign_role, bulk_change_status, bulk_delete
    entity_type VARCHAR(50) NOT NULL, -- users, employees, patients, etc.
    total_records INTEGER NOT NULL DEFAULT 0,
    processed_records INTEGER NOT NULL DEFAULT 0,
    successful_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    
    -- Job Status
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed, cancelled
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Output
    output_file_url TEXT,
    
    -- Standard Columns
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bulk_job_tenant ON bulk_operation_job(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bulk_job_status ON bulk_operation_job(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bulk_job_user ON bulk_operation_job(created_by_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bulk_job_type ON bulk_operation_job(operation_type, created_at DESC) WHERE deleted_at IS NULL;

-- RLS Policy
DROP POLICY IF EXISTS tenant_isolation_bulk_job ON bulk_operation_job;
CREATE POLICY tenant_isolation_bulk_job ON bulk_operation_job
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

ALTER TABLE bulk_operation_job ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON bulk_operation_job TO hospitalportal_app;

-- =====================================================
-- 3. SEED SAMPLE PROFESSIONAL LICENSES
-- =====================================================
-- Insert sample licenses for existing users (if not exists)
DO $$
DECLARE
    test_tenant_id UUID;
    admin_user_id UUID;
    doctor_user_id UUID;
    nurse_user_id UUID;
BEGIN
    -- Get test tenant and users
    SELECT id INTO test_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO admin_user_id FROM users WHERE "Email" = 'admin@test.com' LIMIT 1;
    SELECT id INTO doctor_user_id FROM users WHERE "Email" LIKE 'doctor%' LIMIT 1;
    SELECT id INTO nurse_user_id FROM users WHERE "Email" LIKE 'nurse%' LIMIT 1;
    
    -- Insert sample licenses (only if users exist)
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO professional_license (
            tenant_id, user_id, license_type, license_category, 
            issuing_authority, issuing_country, issuing_state,
            license_number, issue_date, expiry_date,
            verification_status, verified_at, verified_by_user_id,
            renewal_status, created_by_user_id
        ) VALUES
        (
            test_tenant_id, admin_user_id, 'medical_council', 'medical_doctor',
            'State Medical Council', 'India', 'Maharashtra',
            'MMC-2020-12345', '2020-01-15', '2027-01-15',
            'verified', CURRENT_TIMESTAMP - INTERVAL '30 days', admin_user_id,
            'active', admin_user_id
        )
        ON CONFLICT (tenant_id, license_number, license_type) DO NOTHING;
    END IF;
    
    IF doctor_user_id IS NOT NULL THEN
        INSERT INTO professional_license (
            tenant_id, user_id, license_type, license_category,
            issuing_authority, issuing_country, issuing_state,
            license_number, issue_date, expiry_date,
            verification_status, verified_at, verified_by_user_id,
            renewal_status, created_by_user_id
        ) VALUES
        (
            test_tenant_id, doctor_user_id, 'medical_council', 'specialist',
            'National Medical Commission', 'India', 'Karnataka',
            'NMC-2019-67890', '2019-06-10', '2026-06-10',
            'verified', CURRENT_TIMESTAMP - INTERVAL '60 days', admin_user_id,
            'active', admin_user_id
        )
        ON CONFLICT (tenant_id, license_number, license_type) DO NOTHING;
    END IF;
    
    IF nurse_user_id IS NOT NULL THEN
        INSERT INTO professional_license (
            tenant_id, user_id, license_type, license_category,
            issuing_authority, issuing_country, issuing_state,
            license_number, issue_date, expiry_date,
            verification_status, verified_at, verified_by_user_id,
            renewal_status, created_by_user_id
        ) VALUES
        (
            test_tenant_id, nurse_user_id, 'nursing_council', 'registered_nurse',
            'Indian Nursing Council', 'India', 'Tamil Nadu',
            'INC-2021-45678', '2021-03-20', '2028-03-20',
            'verified', CURRENT_TIMESTAMP - INTERVAL '45 days', admin_user_id,
            'active', admin_user_id
        )
        ON CONFLICT (tenant_id, license_number, license_type) DO NOTHING;
    END IF;
    
    RAISE NOTICE '✅ Sample professional licenses seeded';
END$$;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    license_count INTEGER;
    job_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO license_count FROM professional_license WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO job_count FROM bulk_operation_job WHERE deleted_at IS NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration 06 Complete!';
    RAISE NOTICE '   - Professional licenses: %', license_count;
    RAISE NOTICE '   - Bulk operation jobs: %', job_count;
    RAISE NOTICE '   - Tables created with RLS enabled';
    RAISE NOTICE '========================================';
END$$;
