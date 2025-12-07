-- Department Structure for World-Class Eye Hospital
-- Based on your YES responses for department organization (56-60)

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_department_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (parent_department_id) REFERENCES departments(id)
);

-- Core Departments
INSERT INTO departments (tenant_id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'MEDICAL', 'Medical Services and Clinical Care'),
('00000000-0000-0000-0000-000000000001', 'NURSING', 'Nursing Services and Patient Care'),
('00000000-0000-0000-0000-000000000001', 'ADMINISTRATION', 'Administrative and Management'),
('00000000-0000-0000-0000-000000000001', 'FINANCE', 'Financial and Billing Operations'),
('00000000-0000-0000-0000-000000000001', 'PHARMACY', 'Pharmacy Services'),
('00000000-0000-0000-0000-000000000001', 'OPTICAL', 'Optical Services'),
('00000000-0000-0000-0000-000000000001', 'QUALITY', 'Quality Assurance and Compliance'),
('00000000-0000-0000-0000-000000000001', 'IT', 'Information Technology'),
('00000000-0000-0000-0000-000000000001', 'PATIENT_SERVICES', 'Patient Support Services'),
('00000000-0000-0000-0000-000000000001', 'SECURITY', 'Security and Safety');

-- Medical Sub-departments
INSERT INTO departments (tenant_id, name, description, parent_department_id) VALUES
('00000000-0000-0000-0000-000000000001', 'RETINA', 'Retinal Diseases and Surgery', 
    (SELECT id FROM departments WHERE name = 'MEDICAL' AND tenant_id = '00000000-0000-0000-0000-000000000001')),
('00000000-0000-0000-0000-000000000001', 'CORNEA', 'Corneal Diseases and Transplants', 
    (SELECT id FROM departments WHERE name = 'MEDICAL' AND tenant_id = '00000000-0000-0000-0000-000000000001')),
('00000000-0000-0000-0000-000000000001', 'GLAUCOMA', 'Glaucoma Management', 
    (SELECT id FROM departments WHERE name = 'MEDICAL' AND tenant_id = '00000000-0000-0000-0000-000000000001')),
('00000000-0000-0000-0000-000000000001', 'PEDIATRIC', 'Pediatric Ophthalmology', 
    (SELECT id FROM departments WHERE name = 'MEDICAL' AND tenant_id = '00000000-0000-0000-0000-000000000001')),
('00000000-0000-0000-0000-000000000001', 'OCULOPLASTIC', 'Oculoplastic Surgery', 
    (SELECT id FROM departments WHERE name = 'MEDICAL' AND tenant_id = '00000000-0000-0000-0000-000000000001'));

-- Role-Department Mapping
CREATE TABLE IF NOT EXISTS role_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    department_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- SECURITY AND ACCESS CONTROL IMPLEMENTATION
-- Based on your STRONGLY YES responses (51-55)

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, EXECUTE
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- AUDIT TRAIL (Security requirement 55)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER SESSIONS (For session timeout - requirement 54)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- EMERGENCY ACCESS (Requirements 66-67)
CREATE TABLE IF NOT EXISTS emergency_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    emergency_role VARCHAR(100) NOT NULL,
    justification TEXT NOT NULL,
    patient_id UUID,
    approved_by UUID,
    access_granted_at TIMESTAMP DEFAULT NOW(),
    access_expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- ROLE ASSIGNMENTS WITH EXPIRATION (Requirement 69)
CREATE TABLE IF NOT EXISTS user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    assignment_reason TEXT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- APPROVAL WORKFLOWS (Requirement 68)
CREATE TABLE IF NOT EXISTS role_assignment_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    requested_role_id UUID NOT NULL,
    requested_by UUID NOT NULL,
    approved_by UUID,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    request_reason TEXT,
    approval_comments TEXT,
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    FOREIGN KEY (requested_role_id) REFERENCES roles(id)
);

-- Add department column to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS can_delegate BOOLEAN DEFAULT false;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;