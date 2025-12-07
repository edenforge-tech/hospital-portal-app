-- =============================================
-- Create User Access Tables
-- Created: November 11, 2025
-- Purpose: Department and Branch access mapping tables
-- =============================================

-- Set tenant context
SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

BEGIN;

-- ============================================
-- user_department_access Table
-- Tracks which users have access to which departments
-- ============================================
CREATE TABLE IF NOT EXISTS user_department_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    department_id UUID NOT NULL,
    access_type VARCHAR(50) DEFAULT 'Full Access',
    is_primary BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by_user_id UUID,
    revoked_at TIMESTAMP,
    revoked_by_user_id UUID,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_user_dept_access_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_user_dept_access_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_dept_access_department FOREIGN KEY (department_id) REFERENCES department(id),
    
    -- Constraints
    CONSTRAINT unique_user_dept_access UNIQUE (tenant_id, user_id, department_id, deleted_at)
);

-- Indexes for user_department_access
CREATE INDEX IF NOT EXISTS idx_user_dept_access_tenant ON user_department_access(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_user ON user_department_access(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_department ON user_department_access(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_primary ON user_department_access(user_id, is_primary) WHERE deleted_at IS NULL AND is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_status ON user_department_access(status) WHERE deleted_at IS NULL;

-- ============================================
-- user_branch_access Table
-- Tracks which users have access to which branches
-- ============================================
CREATE TABLE IF NOT EXISTS user_branch_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    access_type VARCHAR(50) DEFAULT 'Full Access',
    is_primary BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by_user_id UUID,
    revoked_at TIMESTAMP,
    revoked_by_user_id UUID,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_user_branch_access_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_user_branch_access_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_branch_access_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    
    -- Constraints
    CONSTRAINT unique_user_branch_access UNIQUE (tenant_id, user_id, branch_id, deleted_at)
);

-- Indexes for user_branch_access
CREATE INDEX IF NOT EXISTS idx_user_branch_access_tenant ON user_branch_access(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_branch_access_user ON user_branch_access(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_branch_access_branch ON user_branch_access(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_branch_access_primary ON user_branch_access(user_id, is_primary) WHERE deleted_at IS NULL AND is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_branch_access_status ON user_branch_access(status) WHERE deleted_at IS NULL;

-- ============================================
-- Row-Level Security Policies
-- ============================================

-- Enable RLS on user_department_access
ALTER TABLE user_department_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_user_dept_access ON user_department_access
    FOR ALL 
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Enable RLS on user_branch_access
ALTER TABLE user_branch_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_user_branch_access ON user_branch_access
    FOR ALL 
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================

-- Check tables exist
SELECT 
    table_name,
    CASE WHEN table_name IN (
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
    ) THEN '✓ Created' ELSE '✗ Missing' END as status
FROM (VALUES 
    ('user_department_access'),
    ('user_branch_access')
) AS t(table_name);

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE tablename IN ('user_department_access', 'user_branch_access')
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN ('user_department_access', 'user_branch_access')
ORDER BY tablename, policyname;

-- Summary
SELECT 
    'user_department_access table created with RLS enabled' as status
UNION ALL
SELECT 
    'user_branch_access table created with RLS enabled' as status;
