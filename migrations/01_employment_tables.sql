# Test connection
psql -h your-server.postgres.database.azure.com -U your-username -d hospitalportal -c "SELECT version();"-- =====================================================
-- MIGRATION 01: EMPLOYMENT & HR TABLES
-- =====================================================
-- Hospital Portal - Employment Lifecycle Management
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 21, 2026
-- Phase: 1 - Critical Foundation
-- 
-- This migration creates:
-- 1. Employment Type Lookup (12 types)
-- 2. Employment Category Lookup (5 categories)
-- 3. Employee Table (hybrid with AspNetUsers)
-- 4. Employment Contract Table
-- 5. Professional License Table
-- 6. Probation Tracking Table
-- 7. Extensions to AspNetUsers table
-- 8. Performance indexes
-- =====================================================

-- =====================================================
-- 1. EMPLOYMENT TYPE LOOKUP TABLE
-- =====================================================
-- Defines 12 employment types for healthcare workers

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
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id)
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
-- 2. EMPLOYMENT CATEGORY LOOKUP TABLE
-- =====================================================
-- Defines 5 broad user categories (replaces simple user_type enum)

CREATE TABLE IF NOT EXISTS employment_category_lookup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed 5 employment categories
INSERT INTO employment_category_lookup (category_code, category_name, description, display_order) VALUES
('STAFF', 'Staff', 'Internal employees (clinical, administrative, support)', 1),
('PATIENT', 'Patient', 'Patient portal users for self-service', 2),
('VENDOR', 'Vendor', 'External contractors and service providers', 3),
('EXTERNAL', 'External', 'Auditors, visiting consultants, regulatory bodies', 4),
('SYSTEM', 'System', 'API integration accounts, automation users', 5)
ON CONFLICT (category_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_employment_category_active ON employment_category_lookup(is_active) WHERE is_active = true;

-- =====================================================
-- 3. EMPLOYEE TABLE (HYBRID ARCHITECTURE)
-- =====================================================
-- Extends AspNetUsers with detailed HR information
-- Links to users table via user_id FK

CREATE TABLE IF NOT EXISTS employee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES "AspNetUsers"(id) ON DELETE CASCADE,
    
    -- Employment Details
    employee_number VARCHAR(50) UNIQUE,
    hire_date DATE NOT NULL,
    employment_type_id UUID REFERENCES employment_type_lookup(id),
    employment_status VARCHAR(50) DEFAULT 'active', -- active, on_probation, on_leave, terminated, resigned
    job_title VARCHAR(200),
    department_id UUID REFERENCES department(id),
    branch_id UUID REFERENCES branch(id),
    manager_id UUID REFERENCES "AspNetUsers"(id),
    
    -- Probation & Contract
    probation_end_date DATE,
    confirmation_date DATE,
    contract_end_date DATE,
    resignation_date DATE,
    termination_date DATE,
    last_working_date DATE,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_email VARCHAR(200),
    emergency_contact_address TEXT,
    
    -- Compensation & Benefits
    salary_grade VARCHAR(50),
    base_salary DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'USD',
    benefits_package JSONB, -- Stores flexible benefits data
    payroll_frequency VARCHAR(50), -- monthly, bi-weekly, weekly
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(200),
    bank_branch VARCHAR(200),
    tax_id VARCHAR(50),
    
    -- Work Schedule
    work_schedule JSONB, -- Flexible schedule definition
    weekly_hours DECIMAL(5,2),
    shift_pattern VARCHAR(50), -- day, night, rotating
    
    -- Additional Info
    marital_status VARCHAR(50),
    dependents_count INTEGER DEFAULT 0,
    blood_group VARCHAR(10),
    allergies TEXT,
    medical_conditions TEXT,
    
    -- Standard Columns
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_by UUID REFERENCES "AspNetUsers"(id),
    
    CONSTRAINT check_salary_positive CHECK (base_salary >= 0),
    CONSTRAINT check_hire_before_termination CHECK (hire_date <= COALESCE(termination_date, hire_date))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_tenant ON employee(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_user ON employee(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_number ON employee(employee_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_department ON employee(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_branch ON employee(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_manager ON employee(manager_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_hire_date ON employee(hire_date);
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(employment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_probation ON employee(probation_end_date) WHERE probation_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employee_contract_end ON employee(contract_end_date) WHERE contract_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employee_active ON employee(tenant_id, employment_status) WHERE deleted_at IS NULL AND employment_status = 'active';

-- RLS Policy for Employee
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_employee ON employee
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 4. EMPLOYMENT CONTRACT TABLE
-- =====================================================
-- Tracks employment contracts with renewal workflow

CREATE TABLE IF NOT EXISTS employment_contract (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Contract Details
    contract_number VARCHAR(50) UNIQUE,
    contract_type VARCHAR(50) NOT NULL, -- permanent, fixed_term, consultant, part_time
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for permanent contracts
    renewal_date DATE,
    auto_renew BOOLEAN DEFAULT false,
    renewal_notice_period_days INTEGER DEFAULT 60,
    
    -- Terms & Conditions
    contract_terms TEXT,
    job_description TEXT,
    reporting_to UUID REFERENCES "AspNetUsers"(id),
    work_location VARCHAR(200),
    
    -- Compensation in Contract
    agreed_salary DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_terms TEXT,
    benefits_summary TEXT,
    
    -- Contract Lifecycle
    contract_status VARCHAR(50) DEFAULT 'draft', -- draft, active, expiring, expired, renewed, terminated
    signed_by_employee BOOLEAN DEFAULT false,
    signed_by_employer BOOLEAN DEFAULT false,
    employee_signature_date DATE,
    employer_signature_date DATE,
    
    -- Document Management
    contract_document_url TEXT,
    signed_document_url TEXT,
    
    -- Termination
    termination_clause TEXT,
    termination_notice_period_days INTEGER,
    termination_date DATE,
    termination_reason TEXT,
    
    -- Standard Columns
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_by UUID REFERENCES "AspNetUsers"(id),
    
    CONSTRAINT check_contract_dates CHECK (start_date <= COALESCE(end_date, start_date)),
    CONSTRAINT check_salary_positive CHECK (agreed_salary >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contract_tenant ON employment_contract(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_employee ON employment_contract(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_number ON employment_contract(contract_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_status ON employment_contract(contract_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_end_date ON employment_contract(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contract_renewal ON employment_contract(renewal_date) WHERE renewal_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contract_expiring ON employment_contract(end_date) 
    WHERE end_date IS NOT NULL 
    AND end_date > CURRENT_DATE 
    AND end_date <= CURRENT_DATE + INTERVAL '90 days'
    AND deleted_at IS NULL;

-- RLS Policy
ALTER TABLE employment_contract ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_contract ON employment_contract
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 5. PROFESSIONAL LICENSE TABLE
-- =====================================================
-- Tracks professional licenses, certifications, renewals

CREATE TABLE IF NOT EXISTS professional_license (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "AspNetUsers"(id) ON DELETE CASCADE,
    
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
    verified_by_user_id UUID REFERENCES "AspNetUsers"(id),
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
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_by UUID REFERENCES "AspNetUsers"(id),
    
    CONSTRAINT check_license_dates CHECK (issue_date <= expiry_date),
    CONSTRAINT uk_license_number UNIQUE (tenant_id, license_number, license_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_license_tenant ON professional_license(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_user ON professional_license(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_number ON professional_license(license_number);
CREATE INDEX IF NOT EXISTS idx_license_expiry ON professional_license(expiry_date);
CREATE INDEX IF NOT EXISTS idx_license_expiring ON professional_license(expiry_date) 
    WHERE expiry_date > CURRENT_DATE 
    AND expiry_date <= CURRENT_DATE + INTERVAL '90 days'
    AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_expired ON professional_license(expiry_date) 
    WHERE expiry_date < CURRENT_DATE 
    AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_verification ON professional_license(verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_license_renewal_status ON professional_license(renewal_status) WHERE deleted_at IS NULL;

-- RLS Policy
ALTER TABLE professional_license ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_license ON professional_license
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 6. PROBATION TRACKING TABLE
-- =====================================================
-- Detailed probation period management with reviews

CREATE TABLE IF NOT EXISTS probation_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Probation Period
    probation_start_date DATE NOT NULL,
    probation_end_date DATE NOT NULL,
    original_end_date DATE NOT NULL, -- Track if extended
    extension_date DATE, -- New end date if extended
    extension_reason TEXT,
    extension_duration_months INTEGER,
    
    -- Review Schedule
    review_scheduled_date DATE,
    review_completed_date DATE,
    reviewer_user_id UUID REFERENCES "AspNetUsers"(id),
    
    -- Performance Assessment
    performance_rating DECIMAL(3,2), -- 0.00 to 5.00
    strengths TEXT,
    areas_for_improvement TEXT,
    training_recommendations TEXT,
    
    -- Outcome
    confirmation_status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, confirmed, extended, terminated
    confirmation_date DATE,
    confirmed_by_user_id UUID REFERENCES "AspNetUsers"(id),
    
    -- Decision & Notes
    decision_notes TEXT,
    manager_recommendation TEXT,
    hr_notes TEXT,
    
    -- Documents
    review_document_url TEXT,
    confirmation_letter_url TEXT,
    
    -- Standard Columns
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_by UUID REFERENCES "AspNetUsers"(id),
    
    CONSTRAINT check_probation_dates CHECK (probation_start_date < probation_end_date),
    CONSTRAINT check_rating CHECK (performance_rating IS NULL OR (performance_rating >= 0 AND performance_rating <= 5))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_probation_tenant ON probation_tracking(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_employee ON probation_tracking(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_end_date ON probation_tracking(probation_end_date);
CREATE INDEX IF NOT EXISTS idx_probation_status ON probation_tracking(confirmation_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_review_date ON probation_tracking(review_scheduled_date) 
    WHERE review_completed_date IS NULL 
    AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_probation_upcoming ON probation_tracking(probation_end_date) 
    WHERE probation_end_date > CURRENT_DATE 
    AND probation_end_date <= CURRENT_DATE + INTERVAL '30 days'
    AND confirmation_status = 'in_progress'
    AND deleted_at IS NULL;

-- RLS Policy
ALTER TABLE probation_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_probation ON probation_tracking
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 7. EXTEND ASPNETUSERS TABLE
-- =====================================================
-- Add columns to existing AspNetUsers table

-- Employment Category & Type
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS employment_category VARCHAR(50);
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS primary_role_id UUID;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS employment_type_id UUID REFERENCES employment_type_lookup(id);

-- Critical Dates
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS probation_end_date DATE;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS contract_end_date DATE;

-- Manager & Hierarchy
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES "AspNetUsers"(id);
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT false;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS department_head BOOLEAN DEFAULT false;

-- Emergency Contact (Quick Access)
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(200);
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);

-- Access Control Enhancements
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS access_valid_from TIMESTAMPTZ;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS access_valid_until TIMESTAMPTZ;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS allowed_ip_ranges JSONB;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS blocked_countries JSONB;

-- MFA & Security Enhancements
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN DEFAULT false;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS mfa_enrolled_at TIMESTAMPTZ;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER DEFAULT 3;

-- License Quick Reference (denormalized for performance)
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS license_expiry_date DATE;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS license_renewal_reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS has_active_license BOOLEAN DEFAULT false;

-- Indexes on new columns
CREATE INDEX IF NOT EXISTS idx_users_employment_category ON "AspNetUsers"(employment_category) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_employment_type ON "AspNetUsers"(employment_type_id) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_manager ON "AspNetUsers"(manager_id) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_hire_date ON "AspNetUsers"(hire_date);
CREATE INDEX IF NOT EXISTS idx_users_probation_end ON "AspNetUsers"(probation_end_date) WHERE probation_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_contract_end ON "AspNetUsers"(contract_end_date) WHERE contract_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_license_expiry ON "AspNetUsers"(license_expiry_date) WHERE license_expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_mfa_required ON "AspNetUsers"(mfa_required) WHERE mfa_required = true;
CREATE INDEX IF NOT EXISTS idx_users_managers ON "AspNetUsers"("TenantId") WHERE is_manager = true AND "DeletedAt" IS NULL;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to check if employee has active contract
CREATE OR REPLACE FUNCTION has_active_contract(p_employee_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM employment_contract
        WHERE employee_id = p_employee_id
        AND contract_status = 'active'
        AND deleted_at IS NULL
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if license is valid
CREATE OR REPLACE FUNCTION has_valid_license(p_user_id UUID, p_license_type VARCHAR DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM professional_license
        WHERE user_id = p_user_id
        AND (p_license_type IS NULL OR license_type = p_license_type)
        AND expiry_date >= CURRENT_DATE
        AND verification_status = 'verified'
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to calculate probation progress percentage
CREATE OR REPLACE FUNCTION get_probation_progress(p_employee_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_days INTEGER;
    v_elapsed_days INTEGER;
BEGIN
    SELECT probation_start_date, probation_end_date
    INTO v_start_date, v_end_date
    FROM probation_tracking
    WHERE employee_id = p_employee_id
    AND confirmation_status = 'in_progress'
    AND deleted_at IS NULL
    ORDER BY probation_start_date DESC
    LIMIT 1;
    
    IF v_start_date IS NULL THEN
        RETURN 0;
    END IF;
    
    v_total_days := v_end_date - v_start_date;
    v_elapsed_days := CURRENT_DATE - v_start_date;
    
    RETURN LEAST(100, GREATEST(0, (v_elapsed_days * 100) / NULLIF(v_total_days, 0)));
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 9. DATA VALIDATION
-- =====================================================

-- Verify tables exist
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_name IN (
        'employment_type_lookup',
        'employment_category_lookup',
        'employee',
        'employment_contract',
        'professional_license',
        'probation_tracking'
    );
    
    RAISE NOTICE '✅ Created % out of 6 tables', v_count;
    
    IF v_count < 6 THEN
        RAISE EXCEPTION 'Migration incomplete: Only % tables created', v_count;
    END IF;
END $$;

-- Verify seed data
DO $$
DECLARE
    v_emp_types INTEGER;
    v_emp_categories INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_emp_types FROM employment_type_lookup WHERE is_active = true;
    SELECT COUNT(*) INTO v_emp_categories FROM employment_category_lookup WHERE is_active = true;
    
    RAISE NOTICE '✅ Seeded % employment types', v_emp_types;
    RAISE NOTICE '✅ Seeded % employment categories', v_emp_categories;
    
    IF v_emp_types < 12 OR v_emp_categories < 5 THEN
        RAISE EXCEPTION 'Seed data incomplete';
    END IF;
END $$;

-- =====================================================
-- MIGRATION 01 COMPLETE
-- =====================================================
-- Next: 02_seed_78_roles.sql
-- =====================================================
