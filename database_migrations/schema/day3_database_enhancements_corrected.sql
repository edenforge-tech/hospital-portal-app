-- =====================================================
-- DAY 3 DATABASE ENHANCEMENTS (CORRECTED)
-- =====================================================
-- Hospital Portal - Database Performance & Compliance
-- Date: January 25, 2026
-- Purpose: Add missing indexes, audit triggers, and is_clinical flag
-- CORRECTED: Uses actual table names (lowercase: users, app_roles)
-- Execution Time: ~2 minutes
-- =====================================================

-- =====================================================
-- SECTION 1: PERFORMANCE INDEXES
-- =====================================================

-- User-related indexes (lowercase email, not "Email")
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);

-- Role-related indexes (app_roles has DeletedAt column)
CREATE INDEX IF NOT EXISTS idx_app_roles_tenant_id ON app_roles(tenant_id) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_app_roles_name ON app_roles(name) WHERE "DeletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_app_user_roles_user_id ON app_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_app_user_roles_role_id ON app_user_roles(role_id);

-- Department indexes
CREATE INDEX IF NOT EXISTS idx_department_tenant_id ON department(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_department_branch_id ON department(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_department_status ON department(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_department_created_at ON department(created_at);
CREATE INDEX IF NOT EXISTS idx_department_tenant_branch ON department(tenant_id, branch_id) WHERE deleted_at IS NULL;

-- Branch indexes
CREATE INDEX IF NOT EXISTS idx_branch_tenant_id ON branch(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branch_organization_id ON branch(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branch_status ON branch(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branch_created_at ON branch(created_at);
CREATE INDEX IF NOT EXISTS idx_branch_tenant_org ON branch(tenant_id, organization_id) WHERE deleted_at IS NULL;

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_organization_tenant_id ON organization(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organization_status ON organization(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organization_created_at ON organization(created_at);

-- Patient indexes (uses snake_case: medical_record_number, contact_number)
CREATE INDEX IF NOT EXISTS idx_patient_tenant_id ON patient(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_branch_id ON patient(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_mrn ON patient(medical_record_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_email ON patient(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_contact_number ON patient(contact_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_status ON patient(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_created_at ON patient(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_tenant_mrn ON patient(tenant_id, medical_record_number) WHERE deleted_at IS NULL;

-- Appointment indexes (uses doctor_id, not practitioner_id or organization_id)
CREATE INDEX IF NOT EXISTS idx_appointment_tenant_id ON appointment(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_patient_id ON appointment(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_doctor_id ON appointment(doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointment(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointment(appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_created_at ON appointment(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_tenant_date ON appointment(tenant_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_doctor_date ON appointment(doctor_id, appointment_date) WHERE deleted_at IS NULL;

-- Clinical Examination indexes (if table exists - no deleted_at column)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinical_examination') THEN
        CREATE INDEX IF NOT EXISTS idx_clinical_exam_tenant_id ON clinical_examination(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_clinical_exam_patient_id ON clinical_examination(patient_id);
        CREATE INDEX IF NOT EXISTS idx_clinical_exam_appointment_id ON clinical_examination(appointment_id);
        CREATE INDEX IF NOT EXISTS idx_clinical_exam_practitioner_id ON clinical_examination(practitioner_id);
        CREATE INDEX IF NOT EXISTS idx_clinical_exam_created_at ON clinical_examination(created_at);
    END IF;
END $$;

-- Employee indexes (employee doesn't have organization_id column)
CREATE INDEX IF NOT EXISTS idx_employee_tenant_id ON employee(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_department_id ON employee(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_user_id ON employee(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_created_at ON employee(created_at);
CREATE INDEX IF NOT EXISTS idx_employee_tenant_dept ON employee(tenant_id, department_id) WHERE deleted_at IS NULL;

-- Audit Log indexes (uses resource_type and created_at, not entity_name/timestamp)
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_resource ON audit_log(tenant_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_date ON audit_log(tenant_id, created_at);

-- Permission indexes (no deleted_at column, role_permission uses different column names)
CREATE INDEX IF NOT EXISTS idx_permission_module ON permission(module);
CREATE INDEX IF NOT EXISTS idx_permission_code ON permission(code);
-- Skip role_permission indexes as table structure unclear

-- Session indexes (no deleted_at column on user_session)
CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON user_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_tenant_id ON user_session(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_session_status ON user_session(status);
CREATE INDEX IF NOT EXISTS idx_user_session_created_at ON user_session(created_at);

-- =====================================================
-- SECTION 2: AUDIT TRIGGERS (HIPAA COMPLIANCE)
-- =====================================================

-- Create audit trigger function if not exists
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (
            tenant_id,
            user_id,
            entity_name,
            action,
            entity_id,
            old_data,
            timestamp
        ) VALUES (
            OLD.tenant_id,
            current_setting('app.current_user_id', true)::uuid,
            TG_TABLE_NAME,
            TG_OP,
            OLD.id,
            row_to_json(OLD),
            NOW()
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (
            tenant_id,
            user_id,
            entity_name,
            action,
            entity_id,
            old_data,
            new_data,
            timestamp
        ) VALUES (
            NEW.tenant_id,
            current_setting('app.current_user_id', true)::uuid,
            TG_TABLE_NAME,
            TG_OP,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW),
            NOW()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (
            tenant_id,
            user_id,
            entity_name,
            action,
            entity_id,
            new_data,
            timestamp
        ) VALUES (
            NEW.tenant_id,
            current_setting('app.current_user_id', true)::uuid,
            TG_TABLE_NAME,
            TG_OP,
            NEW.id,
            row_to_json(NEW),
            NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers for critical tables

-- Users audit trigger
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Patient audit trigger
DROP TRIGGER IF EXISTS audit_patient_trigger ON patient;
CREATE TRIGGER audit_patient_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patient
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Appointment audit trigger
DROP TRIGGER IF EXISTS audit_appointment_trigger ON appointment;
CREATE TRIGGER audit_appointment_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointment
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Clinical Examination audit trigger (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinical_examination') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS audit_clinical_exam_trigger ON clinical_examination';
        EXECUTE 'CREATE TRIGGER audit_clinical_exam_trigger 
                 AFTER INSERT OR UPDATE OR DELETE ON clinical_examination 
                 FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- Prescription audit trigger (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescription') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS audit_prescription_trigger ON prescription';
        EXECUTE 'CREATE TRIGGER audit_prescription_trigger 
                 AFTER INSERT OR UPDATE OR DELETE ON prescription 
                 FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()';
    END IF;
END $$;

-- Employee audit trigger
DROP TRIGGER IF EXISTS audit_employee_trigger ON employee;
CREATE TRIGGER audit_employee_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employee
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- SECTION 3: ADD IS_CLINICAL FLAG TO ROLE TABLE
-- =====================================================

-- Add is_clinical column to app_roles
ALTER TABLE app_roles 
ADD COLUMN IF NOT EXISTS is_clinical BOOLEAN DEFAULT FALSE;

-- Create index for is_clinical filtering
CREATE INDEX IF NOT EXISTS idx_app_roles_is_clinical 
ON app_roles(is_clinical) 
WHERE "DeletedAt" IS NULL;

-- Update existing roles to set is_clinical flag
UPDATE app_roles 
SET is_clinical = TRUE 
WHERE LOWER(name) IN (
    'doctor',
    'physician',
    'ophthalmologist',
    'optometrist',
    'nurse',
    'registered nurse',
    'staff nurse',
    'head nurse',
    'clinical coordinator',
    'medical assistant',
    'paramedic',
    'technician',
    'lab technician',
    'imaging technician',
    'pharmacist'
) AND "DeletedAt" IS NULL;

-- Add comment to column
COMMENT ON COLUMN app_roles.is_clinical IS 
'Indicates if role requires clinical credentials and has access to clinical data (PHI). TRUE for doctors, nurses, clinical staff. FALSE for administrative, IT, finance staff.';

-- =====================================================
-- SECTION 4: VALIDATION QUERIES
-- =====================================================

-- Check index counts
SELECT 
    'INDEX COUNT' as metric,
    schemaname,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'app_roles', 'patient', 'appointment', 'employee', 'department', 'branch')
GROUP BY schemaname, tablename
ORDER BY index_count DESC;

-- Check audit trigger coverage
SELECT 
    'AUDIT TRIGGERS' as metric,
    event_object_table,
    trigger_name,
    STRING_AGG(event_manipulation, ', ') as operations
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'audit_%'
GROUP BY event_object_table, trigger_name
ORDER BY event_object_table;

-- Check is_clinical flag distribution
SELECT 
    'IS_CLINICAL DISTRIBUTION' as metric,
    is_clinical,
    COUNT(*) as role_count,
    STRING_AGG(name, ', ' ORDER BY name) as role_names
FROM app_roles
WHERE "DeletedAt" IS NULL
GROUP BY is_clinical;

-- Sample query performance test (users has user_name, not UserName)
EXPLAIN ANALYZE
SELECT 
    u.user_name,
    u.email,
    u.created_at
FROM users u
WHERE u.tenant_id = (SELECT id FROM tenant LIMIT 1)
ORDER BY u.created_at DESC
LIMIT 100;

-- =====================================================
-- END OF DAY 3 DATABASE ENHANCEMENTS
-- =====================================================
