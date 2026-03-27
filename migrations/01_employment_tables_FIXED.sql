-- =====================================================
-- MIGRATION 01: EMPLOYMENT & HR TABLES (FIXED)
-- =====================================================
-- Hospital Portal - Employment Lifecycle Management
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 21, 2026
-- Phase: 1 - Critical Foundation
-- FIXED: Changed AspNetUsers → users (correct table name)
-- =====================================================

-- =====================================================
-- 1. EMPLOYMENT TYPE LOOKUP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employment_type_lookup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_contract BOOLEAN DEFAULT true,
    requires_probation BOOLEAN DEFAULT false,
    benefits_eligible BOOLEAN DEFAULT true,
    default_probation_months INTEGER DEFAULT 3,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id)
);

-- Seed 12 employment types
INSERT INTO employment_type_lookup (type_code, type_name, description, requires_contract, requires_probation, benefits_eligible, default_probation_months, display_order) VALUES
('PERMANENT', 'Permanent Full-Time', 'Regular full-time employment with full benefits', true, true, true, 3, 1),
('CONTRACT', 'Contract Employee', 'Fixed-term contract with specified end date', true, false, true, 0, 2),
('PART_TIME', 'Part-Time', 'Part-time employment with pro-rata benefits', true, false, false, 0, 3),
('CONSULTANT', 'Consultant/Independent Contractor', 'Self-employed professional on consultation basis', true, false, false, 0, 4),
('LOCUM', 'Locum/Temporary', 'Short-term temporary staff or agency worker', false, false, false, 0, 5),
('INTERN', 'Intern/Trainee', 'Educational/training program participant', true, false, false, 0, 6),
('VOLUNTEER', 'Volunteer', 'Non-paid volunteer for charitable work', false, false, false, 0, 7),
('PROBATIONARY', 'Probationary', 'Currently in probation period', true, true, true, 3, 8),
('RETIRED', 'Retired/Emeritus', 'Retired professional in advisory role', true, false, false, 0, 9),
('ON_LEAVE', 'On Leave/Suspended', 'Currently on extended leave or suspension', false, false, false, 0, 10),
('TERMINATED', 'Terminated/Exited', 'Employment terminated', false, false, false, 0, 11),
('ALUMNI', 'Alumni', 'Former employee maintaining relationship', false, false, false, 0, 12)
ON CONFLICT (type_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_employment_type_active ON employment_type_lookup(is_active) WHERE is_active = true;

-- =====================================================
-- 2. EMPLOYMENT CATEGORY LOOKUP (already exists, skip)
-- =====================================================
-- Table already created in previous run

-- =====================================================
-- 3. EMPLOYEE TABLE (already exists, skip)
-- =====================================================
-- Table already created in previous run

-- =====================================================
-- 4. EMPLOYMENT CONTRACT TABLE (already exists, skip)
-- =====================================================
-- Table already created in previous run

-- =====================================================
-- 5. PROFESSIONAL LICENSE TABLE (already exists, skip)
-- =====================================================
-- Table already created in previous run

-- =====================================================
-- 6. PROBATION TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS probation_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Probation Period
    probation_start_date DATE NOT NULL,
    probation_end_date DATE NOT NULL,
    original_probation_months INTEGER DEFAULT 3,
    
    -- Extension tracking
    extension_date DATE,
    extended_probation_months INTEGER,
    extension_reason TEXT,
    
    -- Confirmation
    confirmation_date DATE,
    confirmation_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, EXTENDED, TERMINATED
    
    -- Review tracking
    review_scheduled_date DATE,
    review_completed_date DATE,
    reviewer_user_id UUID REFERENCES users(id),
    performance_rating VARCHAR(50), -- EXCELLENT, GOOD, SATISFACTORY, NEEDS_IMPROVEMENT, UNSATISFACTORY
    
    -- Notes
    notes TEXT,
    hr_comments TEXT,
    manager_comments TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id UUID REFERENCES users(id),
    
    CONSTRAINT chk_probation_dates CHECK (probation_end_date > probation_start_date),
    CONSTRAINT chk_confirmation_date CHECK (confirmation_date IS NULL OR confirmation_date >= probation_start_date)
);

-- Indexes for probation_tracking
CREATE INDEX IF NOT EXISTS idx_probation_tenant ON probation_tracking(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_user ON probation_tracking(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_employee ON probation_tracking(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_status ON probation_tracking(confirmation_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_end_date ON probation_tracking(probation_end_date) WHERE deleted_at IS NULL AND confirmation_status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_probation_review_date ON probation_tracking(review_scheduled_date) WHERE deleted_at IS NULL AND review_completed_date IS NULL;

-- Enable RLS
ALTER TABLE probation_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS tenant_isolation_probation ON probation_tracking;
CREATE POLICY tenant_isolation_probation ON probation_tracking
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 7. EXTEND USERS TABLE WITH EMPLOYMENT COLUMNS
-- =====================================================
-- Add columns if they don't exist

DO $$
BEGIN
    -- employment_category_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'employment_category_id') THEN
        ALTER TABLE users ADD COLUMN employment_category_id UUID REFERENCES employment_category_lookup(id);
    END IF;
    
    -- primary_role_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'primary_role_id') THEN
        ALTER TABLE users ADD COLUMN primary_role_id UUID REFERENCES app_roles(id);
    END IF;
    
    -- employment_type_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'employment_type_id') THEN
        ALTER TABLE users ADD COLUMN employment_type_id UUID REFERENCES employment_type_lookup(id);
    END IF;
    
    -- hire_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hire_date') THEN
        ALTER TABLE users ADD COLUMN hire_date DATE;
    END IF;
    
    -- probation_end_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'probation_end_date') THEN
        ALTER TABLE users ADD COLUMN probation_end_date DATE;
    END IF;
    
    -- contract_end_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'contract_end_date') THEN
        ALTER TABLE users ADD COLUMN contract_end_date DATE;
    END IF;
    
    -- manager_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'manager_id') THEN
        ALTER TABLE users ADD COLUMN manager_id UUID REFERENCES users(id);
    END IF;
    
    -- Emergency contact fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE users ADD COLUMN emergency_contact_name VARCHAR(200);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE users ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'emergency_contact_relationship') THEN
        ALTER TABLE users ADD COLUMN emergency_contact_relationship VARCHAR(50);
    END IF;
    
    -- Access validity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'access_valid_from') THEN
        ALTER TABLE users ADD COLUMN access_valid_from TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'access_valid_until') THEN
        ALTER TABLE users ADD COLUMN access_valid_until TIMESTAMPTZ;
    END IF;
    
    -- Security settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mfa_required') THEN
        ALTER TABLE users ADD COLUMN mfa_required BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'max_concurrent_sessions') THEN
        ALTER TABLE users ADD COLUMN max_concurrent_sessions INTEGER DEFAULT 3;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'allowed_ip_ranges') THEN
        ALTER TABLE users ADD COLUMN allowed_ip_ranges JSONB;
    END IF;
END$$;

-- Create indexes on new users columns
CREATE INDEX IF NOT EXISTS idx_users_employment_category ON users(employment_category_id) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_employment_type ON users(employment_type_id) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_hire_date ON users(hire_date) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_probation_end ON users(probation_end_date) WHERE "DeletedAt" IS NULL AND probation_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_contract_end ON users(contract_end_date) WHERE "DeletedAt" IS NULL AND contract_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id) WHERE "DeletedAt" IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    table_count INTEGER;
    type_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('employment_type_lookup', 'employment_category_lookup', 'employee', 
                         'employment_contract', 'professional_license', 'probation_tracking');
    
    -- Count employment types
    SELECT COUNT(*) INTO type_count FROM employment_type_lookup WHERE is_active = true;
    
    RAISE NOTICE '✅ Employment Tables Migration Complete!';
    RAISE NOTICE '   - Tables created: %/6', table_count;
    RAISE NOTICE '   - Employment types: %', type_count;
    RAISE NOTICE '   - Users table extended with % new columns', 16;
END$$;
