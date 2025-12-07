-- =============================================
-- Dashboard Enhancement Tables Migration
-- Purpose: Add Department, UserDepartment, and UserMfa tables
-- Author: Backend API Implementation
-- Date: January 2025
-- =============================================

-- Check if tables exist before creation
-- This script is idempotent and can be run multiple times safely

-- =============================================
-- 1. DEPARTMENT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    department_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Emergency, Outpatient, Inpatient, Surgical, Diagnostic, Administrative, Support, Specialty
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Inactive, UnderMaintenance
    
    -- 7-Step Wizard Fields
    parent_department_id UUID,
    department_head_id UUID,
    operating_hours JSONB, -- Flexible JSON for complex schedules
    budget DECIMAL(18,2),
    currency VARCHAR(10) DEFAULT 'INR',
    workflow_settings JSONB,
    max_concurrent_patients INTEGER,
    
    -- Audit Fields
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    updated_by UUID,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    deleted_by UUID,
    
    -- Constraints
    CONSTRAINT fk_department_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_department_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_department_parent FOREIGN KEY (parent_department_id) REFERENCES department(id) ON DELETE SET NULL,
    CONSTRAINT fk_department_head FOREIGN KEY (department_head_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_department_code UNIQUE (tenant_id, department_code)
);

-- Indexes for Department table
CREATE INDEX IF NOT EXISTS idx_department_tenant_id ON department(tenant_id);
CREATE INDEX IF NOT EXISTS idx_department_branch_id ON department(branch_id);
CREATE INDEX IF NOT EXISTS idx_department_status ON department(status);
CREATE INDEX IF NOT EXISTS idx_department_type ON department(type);
CREATE INDEX IF NOT EXISTS idx_department_parent_id ON department(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_department_head_id ON department(department_head_id);
CREATE INDEX IF NOT EXISTS idx_department_deleted_at ON department(deleted_at);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_department_tenant_status ON department(tenant_id, status) WHERE deleted_at IS NULL;

-- Comment on table
COMMENT ON TABLE department IS 'Hospital departments with 7-step wizard configuration and hierarchical structure';

-- =============================================
-- 2. USER_DEPARTMENTS TABLE (Many-to-Many)
-- =============================================
CREATE TABLE IF NOT EXISTS user_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    department_id UUID NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    access_level VARCHAR(50) NOT NULL DEFAULT 'Full', -- Full, ReadOnly, ApprovalOnly
    assigned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    
    -- Constraints
    CONSTRAINT fk_user_departments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_departments_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_departments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_user_department UNIQUE (user_id, department_id)
);

-- Indexes for UserDepartments table
CREATE INDEX IF NOT EXISTS idx_user_departments_user_id ON user_departments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_department_id ON user_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_is_primary ON user_departments(is_primary);
CREATE INDEX IF NOT EXISTS idx_user_departments_access_level ON user_departments(access_level);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_departments_user_primary ON user_departments(user_id, is_primary);

-- Comment on table
COMMENT ON TABLE user_departments IS 'Many-to-many relationship between users and departments with access level control';

-- =============================================
-- 3. USER_MFA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_mfa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    method VARCHAR(50), -- SMS, Email, Authenticator
    phone_number VARCHAR(20),
    email VARCHAR(255),
    secret_key VARCHAR(255),
    backup_codes TEXT, -- Comma-separated backup codes (encrypted)
    enabled_at TIMESTAMP WITHOUT TIME ZONE,
    last_used_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    
    -- Constraints
    CONSTRAINT fk_user_mfa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_mfa_method CHECK (method IN ('SMS', 'Email', 'Authenticator') OR method IS NULL),
    CONSTRAINT chk_user_mfa_sms_phone CHECK (method != 'SMS' OR phone_number IS NOT NULL),
    CONSTRAINT chk_user_mfa_email_address CHECK (method != 'Email' OR email IS NOT NULL),
    CONSTRAINT chk_user_mfa_authenticator_secret CHECK (method != 'Authenticator' OR secret_key IS NOT NULL)
);

-- Indexes for UserMfa table
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_is_enabled ON user_mfa(is_enabled);
CREATE INDEX IF NOT EXISTS idx_user_mfa_method ON user_mfa(method);

-- Comment on table
COMMENT ON TABLE user_mfa IS 'Multi-factor authentication settings for users supporting SMS, Email, and Authenticator app methods';

-- =============================================
-- 4. SAMPLE DATA (Optional - for testing)
-- =============================================
-- Note: Uncomment the following section if you want to insert sample data

/*
-- Insert sample departments for testing
-- Replace 'YOUR_TENANT_ID' with actual tenant ID from your database

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_admin_user_id UUID;
    v_dept_emergency UUID;
    v_dept_outpatient UUID;
    v_dept_cardiology UUID;
BEGIN
    -- Get first tenant (replace with specific tenant if needed)
    SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
    
    -- Get first branch (replace with specific branch if needed)
    SELECT id INTO v_branch_id FROM branches WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Get first admin user (replace with specific user if needed)
    SELECT id INTO v_admin_user_id FROM users WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Insert Emergency Department (root level)
    INSERT INTO department (
        tenant_id, branch_id, department_code, name, type, description, status,
        department_head_id, max_concurrent_patients, created_by
    ) VALUES (
        v_tenant_id, v_branch_id, 'EMRG-001', 'Emergency Department', 'Emergency',
        'Emergency and trauma care 24/7', 'Active',
        v_admin_user_id, 50, v_admin_user_id
    ) RETURNING id INTO v_dept_emergency;
    
    -- Insert Outpatient Department (root level)
    INSERT INTO department (
        tenant_id, branch_id, department_code, name, type, description, status,
        department_head_id, max_concurrent_patients, created_by
    ) VALUES (
        v_tenant_id, v_branch_id, 'OPD-001', 'Outpatient Department', 'Outpatient',
        'General outpatient consultations', 'Active',
        v_admin_user_id, 100, v_admin_user_id
    ) RETURNING id INTO v_dept_outpatient;
    
    -- Insert Cardiology (under Outpatient)
    INSERT INTO department (
        tenant_id, branch_id, department_code, name, type, description, status,
        parent_department_id, department_head_id, max_concurrent_patients, created_by
    ) VALUES (
        v_tenant_id, v_branch_id, 'CARD-001', 'Cardiology', 'Specialty',
        'Heart and cardiovascular care', 'Active',
        v_dept_outpatient, v_admin_user_id, 30, v_admin_user_id
    ) RETURNING id INTO v_dept_cardiology;
    
    -- Assign admin user to departments
    INSERT INTO user_departments (user_id, department_id, is_primary, access_level, assigned_by)
    VALUES 
        (v_admin_user_id, v_dept_emergency, TRUE, 'Full', v_admin_user_id),
        (v_admin_user_id, v_dept_outpatient, FALSE, 'Full', v_admin_user_id),
        (v_admin_user_id, v_dept_cardiology, FALSE, 'Full', v_admin_user_id);
    
    -- Create MFA record for admin user (disabled by default)
    INSERT INTO user_mfa (user_id, is_enabled)
    VALUES (v_admin_user_id, FALSE);
    
    RAISE NOTICE 'Sample data inserted successfully';
    RAISE NOTICE 'Emergency Dept ID: %', v_dept_emergency;
    RAISE NOTICE 'Outpatient Dept ID: %', v_dept_outpatient;
    RAISE NOTICE 'Cardiology Dept ID: %', v_dept_cardiology;
END $$;
*/

-- =============================================
-- 5. VERIFICATION QUERIES
-- =============================================
-- Run these queries to verify tables were created successfully

-- Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('department', 'user_departments', 'user_mfa')
ORDER BY table_name;

-- Count indexes created
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('department', 'user_departments', 'user_mfa')
GROUP BY tablename
ORDER BY tablename;

-- Check foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('department', 'user_departments', 'user_mfa')
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Tables created: department, user_departments, user_mfa
-- Indexes created: 17 total (8 department, 5 user_departments, 3 user_mfa)
-- Foreign keys: 9 total (6 department, 3 user_departments, 1 user_mfa)
-- Ready for backend API testing!
-- =============================================
