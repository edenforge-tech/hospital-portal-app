-- =====================================================
-- ROLE HIERARCHY & TEMPLATES MIGRATION
-- Week 11: Roles Management Backend Implementation
-- =====================================================

-- Create role_template table
CREATE TABLE IF NOT EXISTS role_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    role_type VARCHAR(50) NOT NULL,
    template_category VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_system_template BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_by UUID
);

-- Create role_hierarchy table
CREATE TABLE IF NOT EXISTS role_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    parent_role_id UUID NOT NULL,
    child_role_id UUID NOT NULL,
    level INTEGER DEFAULT 1,
    path VARCHAR(500),
    inheritance_type VARCHAR(50) DEFAULT 'inherit_all',
    inheritance_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_by UUID
);

-- Create user_role_history table
CREATE TABLE IF NOT EXISTS user_role_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    reason VARCHAR(500),
    action_timestamp TIMESTAMPTZ DEFAULT NOW(),
    effective_from TIMESTAMPTZ,
    effective_until TIMESTAMPTZ,
    assigned_by_user_id UUID NOT NULL,
    branch_id UUID,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for role_template
CREATE INDEX IF NOT EXISTS idx_role_template_tenant_id ON role_template(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_template_role_type ON role_template(role_type);
CREATE INDEX IF NOT EXISTS idx_role_template_template_category ON role_template(template_category);
CREATE INDEX IF NOT EXISTS idx_role_template_tenant_name ON role_template(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_role_template_tenant_active ON role_template(tenant_id, is_active);

-- Create indexes for role_hierarchy
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_tenant_id ON role_hierarchy(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_parent_role_id ON role_hierarchy(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_child_role_id ON role_hierarchy(child_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_tenant_parent ON role_hierarchy(tenant_id, parent_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_tenant_child ON role_hierarchy(tenant_id, child_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_parent_child ON role_hierarchy(parent_role_id, child_role_id);

-- Create indexes for user_role_history
CREATE INDEX IF NOT EXISTS idx_user_role_history_tenant_id ON user_role_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_user_id ON user_role_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_role_id ON user_role_history(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_tenant_user ON user_role_history(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_tenant_role ON user_role_history(tenant_id, role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_user_role ON user_role_history(user_id, role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_history_action_timestamp ON user_role_history(action_timestamp);

-- Add foreign key constraints for role_hierarchy
ALTER TABLE role_hierarchy 
    ADD CONSTRAINT IF NOT EXISTS fk_role_hierarchy_parent_role 
    FOREIGN KEY (parent_role_id) REFERENCES app_roles(id) ON DELETE RESTRICT;

ALTER TABLE role_hierarchy 
    ADD CONSTRAINT IF NOT EXISTS fk_role_hierarchy_child_role 
    FOREIGN KEY (child_role_id) REFERENCES app_roles(id) ON DELETE RESTRICT;

-- Insert sample role templates
INSERT INTO role_template (tenant_id, name, description, role_type, template_category, priority, configuration, is_system_template) VALUES
-- Medical Templates
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Chief Medical Officer', 'Senior medical leadership role with full medical authority', 'Medical', 'Medical', 100, 
 '{"permissions": ["medical.view_all", "medical.prescribe", "medical.surgery_approve", "user.manage", "department.manage"], "settings": {"approval_level": 5, "emergency_access": true}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Department Head - Emergency', 'Emergency department leadership role', 'Department', 'Medical', 80,
 '{"permissions": ["medical.view_department", "medical.prescribe", "emergency.override", "staff.manage_department"], "settings": {"approval_level": 3, "emergency_access": true}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Senior Doctor', 'Senior physician with advanced privileges', 'Medical', 'Medical', 70,
 '{"permissions": ["medical.view_department", "medical.prescribe", "medical.diagnose", "patient.view_full"], "settings": {"approval_level": 2}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Resident Doctor', 'Junior doctor with supervised privileges', 'Medical', 'Medical', 50,
 '{"permissions": ["medical.view_supervised", "medical.prescribe_supervised", "patient.view_assigned"], "settings": {"requires_supervision": true}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Nurse Manager', 'Nursing department leadership role', 'Department', 'Nursing', 60,
 '{"permissions": ["nursing.manage", "staff.manage_nursing", "patient.care_plan", "medication.administer"], "settings": {"approval_level": 2}}', true),

-- Administrative Templates
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Hospital Administrator', 'Senior administrative leadership role', 'Administrative', 'Administrative', 90,
 '{"permissions": ["admin.manage", "financial.view", "staff.manage", "reports.generate"], "settings": {"approval_level": 4}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Department Administrator', 'Department-level administrative role', 'Department', 'Administrative', 60,
 '{"permissions": ["admin.view_department", "staff.manage_department", "scheduling.manage"], "settings": {"approval_level": 2}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Financial Manager', 'Financial operations management role', 'Financial', 'Administrative', 70,
 '{"permissions": ["financial.manage", "billing.process", "insurance.manage", "reports.financial"], "settings": {"financial_authority": true}}', true),

-- IT & Security Templates
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IT Administrator', 'IT systems administration role', 'IT', 'IT', 80,
 '{"permissions": ["system.admin", "user.manage", "security.configure", "audit.view"], "settings": {"system_access": true}}', true),

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Security Officer', 'Security and compliance role', 'Security', 'Security', 75,
 '{"permissions": ["security.audit", "compliance.monitor", "incident.investigate", "access.review"], "settings": {"security_clearance": true}}', true);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS for new tables
ALTER TABLE role_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for role_template
CREATE POLICY IF NOT EXISTS tenant_isolation ON role_template
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for role_hierarchy
CREATE POLICY IF NOT EXISTS tenant_isolation ON role_hierarchy
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for user_role_history
CREATE POLICY IF NOT EXISTS tenant_isolation ON user_role_history
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- Sample Role Hierarchy Setup
-- =====================================================

-- Create sample roles if they don't exist (for demonstration)
DO $$
DECLARE
    tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    cmo_role_id UUID;
    dept_head_role_id UUID;
    senior_doc_role_id UUID;
    resident_role_id UUID;
    admin_role_id UUID;
BEGIN
    -- Insert CEO/CMO role if not exists
    INSERT INTO app_roles (id, tenant_id, name, normalized_name, role_code, description, role_type, priority, is_system_role, created_at, updated_at)
    VALUES (gen_random_uuid(), tenant_id, 'Chief Medical Officer', 'CHIEF MEDICAL OFFICER', 'CMO', 'Chief Medical Officer', 'Medical', 100, true, NOW(), NOW())
    ON CONFLICT (tenant_id, name) DO NOTHING
    RETURNING id INTO cmo_role_id;
    
    -- Get existing CMO role if insert was skipped
    IF cmo_role_id IS NULL THEN
        SELECT id INTO cmo_role_id FROM app_roles WHERE tenant_id = tenant_id AND name = 'Chief Medical Officer';
    END IF;

    -- Insert Emergency Department Head role
    INSERT INTO app_roles (id, tenant_id, name, normalized_name, role_code, description, role_type, priority, parent_role_id, created_at, updated_at)
    VALUES (gen_random_uuid(), tenant_id, 'Emergency Dept Head', 'EMERGENCY DEPT HEAD', 'ED_HEAD', 'Emergency Department Head', 'Department', 80, cmo_role_id, NOW(), NOW())
    ON CONFLICT (tenant_id, name) DO NOTHING
    RETURNING id INTO dept_head_role_id;
    
    IF dept_head_role_id IS NULL THEN
        SELECT id INTO dept_head_role_id FROM app_roles WHERE tenant_id = tenant_id AND name = 'Emergency Dept Head';
    END IF;

    -- Insert Senior Doctor role
    INSERT INTO app_roles (id, tenant_id, name, normalized_name, role_code, description, role_type, priority, parent_role_id, created_at, updated_at)
    VALUES (gen_random_uuid(), tenant_id, 'Senior Doctor', 'SENIOR DOCTOR', 'SR_DOC', 'Senior Doctor', 'Medical', 70, dept_head_role_id, NOW(), NOW())
    ON CONFLICT (tenant_id, name) DO NOTHING
    RETURNING id INTO senior_doc_role_id;
    
    IF senior_doc_role_id IS NULL THEN
        SELECT id INTO senior_doc_role_id FROM app_roles WHERE tenant_id = tenant_id AND name = 'Senior Doctor';
    END IF;

    -- Insert Resident Doctor role  
    INSERT INTO app_roles (id, tenant_id, name, normalized_name, role_code, description, role_type, priority, parent_role_id, created_at, updated_at)
    VALUES (gen_random_uuid(), tenant_id, 'Resident Doctor', 'RESIDENT DOCTOR', 'RESIDENT', 'Resident Doctor', 'Medical', 50, senior_doc_role_id, NOW(), NOW())
    ON CONFLICT (tenant_id, name) DO NOTHING
    RETURNING id INTO resident_role_id;

    -- Create hierarchy relationships
    IF cmo_role_id IS NOT NULL AND dept_head_role_id IS NOT NULL THEN
        INSERT INTO role_hierarchy (tenant_id, parent_role_id, child_role_id, level, path, inheritance_type, created_at, updated_at)
        VALUES (tenant_id, cmo_role_id, dept_head_role_id, 1, 'CMO/ED_HEAD', 'inherit_all', NOW(), NOW())
        ON CONFLICT (tenant_id, parent_role_id, child_role_id) DO NOTHING;
    END IF;

    IF dept_head_role_id IS NOT NULL AND senior_doc_role_id IS NOT NULL THEN
        INSERT INTO role_hierarchy (tenant_id, parent_role_id, child_role_id, level, path, inheritance_type, created_at, updated_at)
        VALUES (tenant_id, dept_head_role_id, senior_doc_role_id, 2, 'CMO/ED_HEAD/SR_DOC', 'inherit_all', NOW(), NOW())
        ON CONFLICT (tenant_id, parent_role_id, child_role_id) DO NOTHING;
    END IF;

    IF senior_doc_role_id IS NOT NULL AND resident_role_id IS NOT NULL THEN
        INSERT INTO role_hierarchy (tenant_id, parent_role_id, child_role_id, level, path, inheritance_type, created_at, updated_at)
        VALUES (tenant_id, senior_doc_role_id, resident_role_id, 3, 'CMO/ED_HEAD/SR_DOC/RESIDENT', 'inherit_selective', NOW(), NOW())
        ON CONFLICT (tenant_id, parent_role_id, child_role_id) DO NOTHING;
    END IF;

END $$;

-- =====================================================
-- VALIDATION & TESTING
-- =====================================================

-- Test query: Show role templates
SELECT 
    name,
    description,
    role_type,
    template_category,
    priority,
    is_system_template
FROM role_template 
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
ORDER BY template_category, priority DESC;

-- Test query: Show role hierarchy
SELECT 
    h.level,
    h.path,
    pr.name as parent_role,
    cr.name as child_role,
    h.inheritance_type
FROM role_hierarchy h
JOIN app_roles pr ON h.parent_role_id = pr.id
JOIN app_roles cr ON h.child_role_id = cr.id
WHERE h.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
ORDER BY h.level, h.path;

-- Test query: Count new tables
SELECT 
    'role_template' as table_name, COUNT(*) as record_count
FROM role_template 
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
UNION ALL
SELECT 
    'role_hierarchy', COUNT(*)
FROM role_hierarchy 
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
UNION ALL  
SELECT 
    'user_role_history', COUNT(*)
FROM user_role_history
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

COMMIT;