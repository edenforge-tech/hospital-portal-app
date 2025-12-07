-- Create user_department_access table for multi-department user access
CREATE TABLE IF NOT EXISTS user_department_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES "AspNetUsers"(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('full', 'read_write', 'read_only', 'approval_only', 'limited')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    assigned_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES "AspNetUsers"(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES "AspNetUsers"(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES "AspNetUsers"(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES "AspNetUsers"(id) ON DELETE SET NULL,

    CONSTRAINT unique_user_dept_access UNIQUE (tenant_id, user_id, department_id, deleted_at),
    CONSTRAINT chk_valid_date_range CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dept_access_tenant ON user_department_access(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_user ON user_department_access(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_department ON user_department_access(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_primary ON user_department_access(user_id, is_primary) WHERE deleted_at IS NULL AND is_primary = true;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_status ON user_department_access(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_dept_access_level ON user_department_access(access_level) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE user_department_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_user_dept_access ON user_department_access
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create audit trigger
CREATE TRIGGER audit_user_department_access_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_department_access
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Add comments
COMMENT ON TABLE user_department_access IS 'Multi-department user access control with role-based permissions';
COMMENT ON COLUMN user_department_access.is_primary IS 'Indicates the user primary department';
COMMENT ON COLUMN user_department_access.access_level IS 'Access level: full, read_write, read_only, approval_only, limited';
COMMENT ON COLUMN user_department_access.status IS 'Status: active, inactive, suspended, pending';