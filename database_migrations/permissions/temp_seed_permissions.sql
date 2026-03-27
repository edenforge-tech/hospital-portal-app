-- Seed core permissions for Hospital Portal
-- This creates essential permissions across all modules

DO $$
BEGIN
    -- Insert core permissions across modules
    INSERT INTO permission (code, name, description, module, resource, resource_type, action, scope, data_classification, is_system, is_active) VALUES
    
    -- Auth & Users Module
    ('AUTH:USER:VIEW', 'View Users', 'View user list and details', 'auth', 'user', 'entity', 'view', 'tenant', 'confidential', true, true),
    ('AUTH:USER:CREATE', 'Create Users', 'Create new users', 'auth', 'user', 'entity', 'create', 'tenant', 'confidential', true, true),
    ('AUTH:USER:UPDATE', 'Update Users', 'Modify user information', 'auth', 'user', 'entity', 'update', 'tenant', 'confidential', true, true),
    ('AUTH:USER:DELETE', 'Delete Users', 'Soft delete users', 'auth', 'user', 'entity', 'delete', 'tenant', 'confidential', true, true),
    
    -- Roles Module
    ('AUTH:ROLE:VIEW', 'View Roles', 'View role list and details', 'auth', 'role', 'entity', 'view', 'tenant', 'internal', true, true),
    ('AUTH:ROLE:CREATE', 'Create Roles', 'Create new roles', 'auth', 'role', 'entity', 'create', 'tenant', 'internal', true, true),
    ('AUTH:ROLE:UPDATE', 'Update Roles', 'Modify role information', 'auth', 'role', 'entity', 'update', 'tenant', 'internal', true, true),
    ('AUTH:ROLE:DELETE', 'Delete Roles', 'Delete roles', 'auth', 'role', 'entity', 'delete', 'tenant', 'internal', true, true),
    
    -- Permissions Module
    ('AUTH:PERMISSION:VIEW', 'View Permissions', 'View permission list', 'auth', 'permission', 'entity', 'view', 'tenant', 'internal', true, true),
    ('AUTH:PERMISSION:ASSIGN', 'Assign Permissions', 'Assign permissions to roles', 'auth', 'permission', 'entity', 'assign', 'tenant', 'internal', true, true),
    
    -- Tenants Module
    ('ADMIN:TENANT:VIEW', 'View Tenants', 'View tenant information', 'admin', 'tenant', 'entity', 'view', 'global', 'confidential', true, true),
    ('ADMIN:TENANT:CREATE', 'Create Tenants', 'Create new tenants', 'admin', 'tenant', 'entity', 'create', 'global', 'confidential', true, true),
    ('ADMIN:TENANT:UPDATE', 'Update Tenants', 'Modify tenant information', 'admin', 'tenant', 'entity', 'update', 'global', 'confidential', true, true),
    
    -- Branches Module
    ('ADMIN:BRANCH:VIEW', 'View Branches', 'View branch list and details', 'admin', 'branch', 'entity', 'view', 'tenant', 'internal', true, true),
    ('ADMIN:BRANCH:CREATE', 'Create Branches', 'Create new branches', 'admin', 'branch', 'entity', 'create', 'tenant', 'internal', true, true),
    ('ADMIN:BRANCH:UPDATE', 'Update Branches', 'Modify branch information', 'admin', 'branch', 'entity', 'update', 'tenant', 'internal', true, true),
    ('ADMIN:BRANCH:DELETE', 'Delete Branches', 'Delete branches', 'admin', 'branch', 'entity', 'delete', 'tenant', 'internal', true, true),
    
    -- Departments Module
    ('ADMIN:DEPARTMENT:VIEW', 'View Departments', 'View department list', 'admin', 'department', 'entity', 'view', 'branch', 'internal', true, true),
    ('ADMIN:DEPARTMENT:CREATE', 'Create Departments', 'Create new departments', 'admin', 'department', 'entity', 'create', 'branch', 'internal', true, true),
    ('ADMIN:DEPARTMENT:UPDATE', 'Update Departments', 'Modify departments', 'admin', 'department', 'entity', 'update', 'branch', 'internal', true, true),
    ('ADMIN:DEPARTMENT:DELETE', 'Delete Departments', 'Delete departments', 'admin', 'department', 'entity', 'delete', 'branch', 'internal', true, true),
    
    -- Patients Module (HIPAA Protected)
    ('CLINICAL:PATIENT:VIEW', 'View Patients', 'View patient list and demographics', 'clinical', 'patient', 'entity', 'view', 'branch', 'phi', true, true),
    ('CLINICAL:PATIENT:CREATE', 'Register Patients', 'Register new patients', 'clinical', 'patient', 'entity', 'create', 'branch', 'phi', true, true),
    ('CLINICAL:PATIENT:UPDATE', 'Update Patients', 'Modify patient information', 'clinical', 'patient', 'entity', 'update', 'branch', 'phi', true, true),
    ('CLINICAL:PATIENT:DELETE', 'Delete Patients', 'Soft delete patient records', 'clinical', 'patient', 'entity', 'delete', 'branch', 'phi', true, true),
    ('CLINICAL:PATIENT:VIEW_PHI', 'View Patient PHI', 'Access Protected Health Information', 'clinical', 'patient', 'phi', 'view', 'assigned', 'phi', true, true),
    
    -- Appointments Module
    ('CLINICAL:APPOINTMENT:VIEW', 'View Appointments', 'View appointment schedules', 'clinical', 'appointment', 'entity', 'view', 'branch', 'internal', true, true),
    ('CLINICAL:APPOINTMENT:CREATE', 'Create Appointments', 'Schedule new appointments', 'clinical', 'appointment', 'entity', 'create', 'branch', 'internal', true, true),
    ('CLINICAL:APPOINTMENT:UPDATE', 'Update Appointments', 'Modify appointments', 'clinical', 'appointment', 'entity', 'update', 'branch', 'internal', true, true),
    ('CLINICAL:APPOINTMENT:CANCEL', 'Cancel Appointments', 'Cancel appointments', 'clinical', 'appointment', 'entity', 'cancel', 'branch', 'internal', true, true),
    
    -- Medical Records Module (HIPAA Critical)
    ('CLINICAL:RECORD:VIEW', 'View Medical Records', 'View medical records', 'clinical', 'medical_record', 'entity', 'view', 'assigned', 'phi', true, true),
    ('CLINICAL:RECORD:CREATE', 'Create Medical Records', 'Create medical records', 'clinical', 'medical_record', 'entity', 'create', 'assigned', 'phi', true, true),
    ('CLINICAL:RECORD:UPDATE', 'Update Medical Records', 'Update medical records', 'clinical', 'medical_record', 'entity', 'update', 'assigned', 'phi', true, true),
    
    -- Prescriptions Module (Controlled)
    ('CLINICAL:PRESCRIPTION:VIEW', 'View Prescriptions', 'View prescription history', 'clinical', 'prescription', 'entity', 'view', 'assigned', 'phi', true, true),
    ('CLINICAL:PRESCRIPTION:CREATE', 'Create Prescriptions', 'Write new prescriptions', 'clinical', 'prescription', 'entity', 'create', 'assigned', 'phi', true, true),
    ('CLINICAL:PRESCRIPTION:APPROVE', 'Approve Prescriptions', 'Approve prescription requests', 'clinical', 'prescription', 'entity', 'approve', 'assigned', 'phi', true, true),
    
    -- Lab Results Module (HIPAA)
    ('CLINICAL:LAB:VIEW', 'View Lab Results', 'View laboratory results', 'clinical', 'lab_result', 'entity', 'view', 'assigned', 'phi', true, true),
    ('CLINICAL:LAB:CREATE', 'Create Lab Orders', 'Order laboratory tests', 'clinical', 'lab_result', 'entity', 'create', 'assigned', 'phi', true, true),
    ('CLINICAL:LAB:APPROVE', 'Approve Lab Results', 'Approve and sign lab results', 'clinical', 'lab_result', 'entity', 'approve', 'assigned', 'phi', true, true),
    
    -- Billing Module
    ('BILLING:INVOICE:VIEW', 'View Invoices', 'View billing invoices', 'billing', 'invoice', 'entity', 'view', 'branch', 'confidential', true, true),
    ('BILLING:INVOICE:CREATE', 'Create Invoices', 'Generate invoices', 'billing', 'invoice', 'entity', 'create', 'branch', 'confidential', true, true),
    ('BILLING:PAYMENT:PROCESS', 'Process Payments', 'Process patient payments', 'billing', 'payment', 'entity', 'process', 'branch', 'confidential', true, true),
    
    -- Reports Module
    ('REPORTS:CLINICAL:VIEW', 'View Clinical Reports', 'View clinical reports', 'reports', 'clinical_report', 'entity', 'view', 'branch', 'internal', true, true),
    ('REPORTS:FINANCIAL:VIEW', 'View Financial Reports', 'View financial reports', 'reports', 'financial_report', 'entity', 'view', 'tenant', 'confidential', true, true),
    ('REPORTS:COMPLIANCE:VIEW', 'View Compliance Reports', 'View compliance audit reports', 'reports', 'compliance_report', 'entity', 'view', 'tenant', 'confidential', true, true),
    
    -- Audit Module
    ('ADMIN:AUDIT:VIEW', 'View Audit Logs', 'View system audit logs', 'admin', 'audit_log', 'entity', 'view', 'tenant', 'confidential', true, true),
    ('ADMIN:AUDIT:EXPORT', 'Export Audit Logs', 'Export audit logs for compliance', 'admin', 'audit_log', 'entity', 'export', 'tenant', 'confidential', true, true),
    
    -- Settings Module
    ('ADMIN:SETTINGS:VIEW', 'View Settings', 'View system settings', 'admin', 'settings', 'entity', 'view', 'tenant', 'internal', true, true),
    ('ADMIN:SETTINGS:UPDATE', 'Update Settings', 'Modify system settings', 'admin', 'settings', 'entity', 'update', 'tenant', 'internal', true, true),
    
    -- Dashboard Module
    ('DASHBOARD:VIEW', 'View Dashboard', 'Access main dashboard', 'dashboard', 'dashboard', 'page', 'view', 'tenant', 'internal', true, true),
    ('DASHBOARD:STATS:VIEW', 'View Statistics', 'View dashboard statistics', 'dashboard', 'statistics', 'data', 'view', 'branch', 'internal', true, true)
    
    ON CONFLICT (code) DO NOTHING;
    
    RAISE NOTICE 'Successfully seeded core permissions';
END $$;

-- Verify count
SELECT COUNT(*) as total_permissions FROM permission;
