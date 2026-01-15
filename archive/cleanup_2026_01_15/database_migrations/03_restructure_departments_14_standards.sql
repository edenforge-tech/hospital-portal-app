-- =====================================================
-- MIGRATION: RESTRUCTURE DEPARTMENTS - 14 STANDARDS + SUB-DEPARTMENTS
-- =====================================================
-- Purpose: Add support for department hierarchy and sub-departments
-- Structure: Standard Department (level 1) → Sub-Department (level 2)
-- Date: December 7, 2025
-- =====================================================

BEGIN;

-- =====================================================
-- ADD NEW COLUMNS TO DEPARTMENT TABLE
-- =====================================================

-- Flag for 14 standard departments
ALTER TABLE department ADD COLUMN IF NOT EXISTS is_standard_department BOOLEAN NOT NULL DEFAULT false;

-- Department level (1 = standard, 2 = sub-department)
ALTER TABLE department ADD COLUMN IF NOT EXISTS department_level INTEGER NOT NULL DEFAULT 1;

-- Display order for UI sorting
ALTER TABLE department ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Icon/color for UI representation
ALTER TABLE department ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE department ADD COLUMN IF NOT EXISTS color VARCHAR(7); -- Hex color

-- Permission inheritance flag
ALTER TABLE department ADD COLUMN IF NOT EXISTS inherit_permissions BOOLEAN NOT NULL DEFAULT true;

-- Can create sub-departments
ALTER TABLE department ADD COLUMN IF NOT EXISTS can_have_subdepartments BOOLEAN NOT NULL DEFAULT false;

-- =====================================================
-- UPDATE PARENT_DEPARTMENT_ID CONSTRAINT
-- =====================================================

-- Add check constraint: sub-departments must have parent
ALTER TABLE department 
    ADD CONSTRAINT chk_subdepartment_has_parent 
    CHECK (
        (department_level = 1 AND parent_department_id IS NULL) OR
        (department_level = 2 AND parent_department_id IS NOT NULL)
    );

-- Add check constraint: standard departments cannot have standard parents
ALTER TABLE department 
    ADD CONSTRAINT chk_standard_no_parent 
    CHECK (
        (is_standard_department = true AND parent_department_id IS NULL) OR
        (is_standard_department = false)
    );

-- =====================================================
-- CREATE DEPARTMENT_ACCESS TABLE
-- =====================================================
-- For primary/secondary department assignments with permission levels

CREATE TABLE IF NOT EXISTS department_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    department_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Access Type
    access_type VARCHAR(20) NOT NULL DEFAULT 'Secondary', -- 'Primary' or 'Secondary'
    
    -- Granular Permissions
    can_view BOOLEAN NOT NULL DEFAULT true,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    can_approve BOOLEAN NOT NULL DEFAULT false,
    can_export BOOLEAN NOT NULL DEFAULT false,
    
    -- Time-bound access (for temporary staff)
    access_start_date TIMESTAMP,
    access_end_date TIMESTAMP,
    
    -- Approval workflow
    approved_by UUID,
    approved_at TIMESTAMP,
    approval_notes TEXT,
    
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
    CONSTRAINT fk_dept_access_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_access_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_access_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_access_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_access_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique Constraints
    CONSTRAINT uk_user_department_access UNIQUE (user_id, department_id, tenant_id, branch_id),
    
    -- Check Constraints
    CONSTRAINT chk_access_type CHECK (access_type IN ('Primary', 'Secondary'))
    -- Note: One primary department per user constraint enforced at application level via unique index
);

-- =====================================================
-- INDEXES FOR DEPARTMENT_ACCESS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_dept_access_user ON department_access(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_access_department ON department_access(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_access_tenant ON department_access(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_access_type ON department_access(access_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_access_active ON department_access(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dept_access_time_bound ON department_access(access_end_date) WHERE access_end_date IS NOT NULL AND deleted_at IS NULL;

-- Unique constraint: One primary department per user per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_user 
ON department_access(user_id, tenant_id) 
WHERE access_type = 'Primary' AND deleted_at IS NULL;

-- =====================================================
-- ROW-LEVEL SECURITY FOR DEPARTMENT_ACCESS
-- =====================================================

ALTER TABLE department_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dept_access ON department_access
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY admin_bypass_dept_access ON department_access
    FOR ALL
    TO rls_admin
    USING (true);

-- =====================================================
-- CREATE 14 STANDARD DEPARTMENTS (SEED DATA)
-- =====================================================

-- Note: This will be executed per tenant
-- For India Eye Hospital Network tenant: 33333333-3333-3333-3333-333333333333

DO $$
DECLARE
    v_tenant_id UUID := '33333333-3333-3333-3333-333333333333';
    v_branch_id UUID;
BEGIN
    -- Get the first branch for India Eye Hospital Network
    SELECT id INTO v_branch_id 
    FROM branch 
    WHERE tenant_id = v_tenant_id 
    LIMIT 1;
    
    -- 1. Doctor
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_DOCTOR', 'Doctor', 'Clinical', 'Licensed physicians providing medical diagnosis and treatment', true, 1, true, 1, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_DOCTOR' AND tenant_id = v_tenant_id);
    
    -- 2. Optometrist
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_OPTOMETRIST', 'Optometrist', 'Clinical', 'Eye care professionals conducting vision tests and prescribing corrective lenses', true, 1, true, 2, 'Active', false, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_OPTOMETRIST' AND tenant_id = v_tenant_id);
    
    -- 3. Counselor
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_COUNSELOR', 'Counselor', 'Clinical', 'Patient counseling, pre/post-operative guidance, treatment plan discussions', true, 1, false, 3, 'Active', false, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_COUNSELOR' AND tenant_id = v_tenant_id);
    
    -- 4. Front Office
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_FRONT_OFFICE', 'Front Office', 'Administrative', 'Patient registration, appointment scheduling, reception services', true, 1, true, 4, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_FRONT_OFFICE' AND tenant_id = v_tenant_id);
    
    -- 5. Scan/Imaging
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_IMAGING', 'Scan/Imaging', 'Diagnostics', 'Diagnostic imaging, OCT scans, fundus photography, visual field testing', true, 1, true, 5, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_IMAGING' AND tenant_id = v_tenant_id);
    
    -- 6. Nurse (Operation Theater Management)
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_NURSE', 'Nurse (OT Management)', 'Clinical', 'Surgical assistance, OT management, patient care', true, 1, true, 6, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_NURSE' AND tenant_id = v_tenant_id);
    
    -- 7. Junior Doctor
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_JUNIOR_DOCTOR', 'Junior Doctor', 'Clinical', 'Resident physicians, medical interns, doctors in training', true, 1, false, 7, 'Active', true, true, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_JUNIOR_DOCTOR' AND tenant_id = v_tenant_id);
    
    -- 8. Pharmacy
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_PHARMACY', 'Pharmacy', 'Pharmacy', 'Medication dispensing, prescription management, inventory control', true, 1, true, 8, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_PHARMACY' AND tenant_id = v_tenant_id);
    
    -- 9. Optical
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_OPTICAL', 'Optical', 'Support', 'Eyewear sales, lens fitting, optical product management', true, 1, false, 9, 'Active', false, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_OPTICAL' AND tenant_id = v_tenant_id);
    
    -- 10. Insurance
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_INSURANCE', 'Insurance', 'Administrative', 'Insurance verification, claims processing, third-party coordination', true, 1, false, 10, 'Active', false, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_INSURANCE' AND tenant_id = v_tenant_id);
    
    -- 11. Billing Management
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_BILLING', 'Billing Management', 'Administrative', 'Invoice generation, payment processing, financial reconciliation', true, 1, false, 11, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_BILLING' AND tenant_id = v_tenant_id);
    
    -- 12. Inventory
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_INVENTORY', 'Inventory', 'Support', 'Supply chain management, equipment tracking, stock control', true, 1, true, 12, 'Active', false, true, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_INVENTORY' AND tenant_id = v_tenant_id);
    
    -- 13. Admin Management
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_ADMIN', 'Admin Management', 'Administrative', 'System administration, user management, configuration', true, 1, false, 13, 'Active', true, true, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_ADMIN' AND tenant_id = v_tenant_id);
    
    -- 14. Laboratory
    INSERT INTO department (id, tenant_id, branch_id, department_code, department_name, department_type, description, is_standard_department, department_level, can_have_subdepartments, display_order, status, is_24x7, requires_approval, created_at)
    SELECT gen_random_uuid(), v_tenant_id, v_branch_id, 'STD_LABORATORY', 'Laboratory', 'Diagnostics', 'Pathology tests, microbiology, clinical laboratory services', true, 1, true, 14, 'Active', true, false, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_code = 'STD_LABORATORY' AND tenant_id = v_tenant_id);
    
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN department.is_standard_department IS 'True for 14 standard departments defined in requirements';
COMMENT ON COLUMN department.department_level IS '1 = Standard Department, 2 = Sub-Department';
COMMENT ON COLUMN department.can_have_subdepartments IS 'Whether this department can have child sub-departments';
COMMENT ON COLUMN department.inherit_permissions IS 'Sub-departments inherit permissions from parent if true';
COMMENT ON TABLE department_access IS 'Primary/Secondary department assignments with granular permissions';
COMMENT ON COLUMN department_access.access_type IS 'Primary (one per user) or Secondary (multiple allowed)';

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check new columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'department'
AND column_name IN ('is_standard_department', 'department_level', 'can_have_subdepartments', 'inherit_permissions')
ORDER BY ordinal_position;

-- Count standard departments
SELECT COUNT(*) as standard_dept_count
FROM department
WHERE is_standard_department = true
  AND tenant_id = '33333333-3333-3333-3333-333333333333'
  AND deleted_at IS NULL;

-- List 14 standard departments
SELECT 
    department_code,
    department_name,
    department_type,
    can_have_subdepartments,
    display_order
FROM department
WHERE is_standard_department = true
  AND tenant_id = '33333333-3333-3333-3333-333333333333'
  AND deleted_at IS NULL
ORDER BY display_order;
