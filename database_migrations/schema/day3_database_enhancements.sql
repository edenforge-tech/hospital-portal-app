-- =====================================================
-- DAY 3 DATABASE ENHANCEMENTS
-- =====================================================
-- Hospital Portal - Database Performance & Compliance
-- Date: January 25, 2026
-- Purpose: Add missing indexes, audit triggers, and is_clinical flag
-- Execution Time: ~2 minutes
-- =====================================================

-- =====================================================
-- SECTION 1: PERFORMANCE INDEXES
-- =====================================================
-- Add indexes for common query patterns:
-- - Foreign keys (JOIN operations)
-- - tenant_id (multi-tenancy filtering)
-- - status columns (filtering)
-- - created_at/updated_at (date range queries)
-- - Composite indexes (tenant_id + foreign_key)
-- =====================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON "AspNetUsers"(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON "AspNetUsers"(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_department_id ON "AspNetUsers"(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON "AspNetUsers"(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON "AspNetUsers"(user_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON "AspNetUsers"(created_at);
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON "AspNetUsers"(tenant_id, email) WHERE deleted_at IS NULL;

-- Role-related indexes
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON "AspNetRoles"(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_roles_name ON "AspNetRoles"(normalized_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON "AspNetUserRoles"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON "AspNetUserRoles"(role_id);

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

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patient_tenant_id ON patient(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_branch_id ON patient(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_mrn ON patient(mrn) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_email ON patient(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_phone ON patient(phone_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_status ON patient(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_created_at ON patient(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_tenant_mrn ON patient(tenant_id, mrn) WHERE deleted_at IS NULL;

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointment_tenant_id ON appointment(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_patient_id ON appointment(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_doctor_id ON appointment(doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_branch_id ON appointment(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_department_id ON appointment(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointment(appointment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointment(appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_created_at ON appointment(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_tenant_date ON appointment(tenant_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointment_doctor_date ON appointment(doctor_id, appointment_date) WHERE deleted_at IS NULL;

-- Clinical Examination indexes
CREATE INDEX IF NOT EXISTS idx_clinical_exam_tenant_id ON clinical_examination(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clinical_exam_patient_id ON clinical_examination(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clinical_exam_appointment_id ON clinical_examination(appointment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clinical_exam_doctor_id ON clinical_examination(doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clinical_exam_created_at ON clinical_examination(created_at);

-- Employee indexes
CREATE INDEX IF NOT EXISTS idx_employee_tenant_id ON employee(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_branch_id ON employee(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_department_id ON employee(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_user_id ON employee(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(employment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_created_at ON employee(created_at);
CREATE INDEX IF NOT EXISTS idx_employee_tenant_dept ON employee(tenant_id, department_id) WHERE deleted_at IS NULL;

-- Audit Log indexes (for compliance reporting)
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_table ON audit_log(tenant_id, table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_date ON audit_log(tenant_id, changed_at);

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_permission_module ON permission(module_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_permission_code ON permission(permission_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_role_permission_role_id ON role_permission(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_permission_id ON role_permission(permission_id);

-- Session indexes (for security monitoring)
CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON user_session(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_session_tenant_id ON user_session(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_session_status ON user_session(session_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_session_created_at ON user_session(created_at);

-- Device indexes (for security monitoring)
CREATE INDEX IF NOT EXISTS idx_user_device_user_id ON user_device(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_device_status ON user_device(device_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_device_last_used ON user_device(last_used_at);

-- Emergency Access indexes (HIPAA Break-the-Glass)
CREATE INDEX IF NOT EXISTS idx_emergency_access_user_id ON emergency_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_access_patient_id ON emergency_access_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_access_timestamp ON emergency_access_log(access_timestamp);
CREATE INDEX IF NOT EXISTS idx_emergency_access_tenant ON emergency_access_log(tenant_id, access_timestamp);

-- =====================================================
-- SECTION 2: AUDIT TRIGGERS (HIPAA COMPLIANCE)
-- =====================================================
-- Add audit triggers for tables storing PHI/PII
-- Ensures complete audit trail for compliance
-- =====================================================

-- Create audit trigger function if not exists
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (
            tenant_id,
            user_id,
            table_name,
            operation,
            record_id,
            old_values,
            changed_at
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
            table_name,
            operation,
            record_id,
            old_values,
            new_values,
            changed_at
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
            table_name,
            operation,
            record_id,
            new_values,
            changed_at
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
-- (Only add if not already exists)

-- Users audit trigger
DROP TRIGGER IF EXISTS audit_users_trigger ON "AspNetUsers";
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "AspNetUsers"
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

-- Clinical Examination audit trigger
DROP TRIGGER IF EXISTS audit_clinical_exam_trigger ON clinical_examination;
CREATE TRIGGER audit_clinical_exam_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clinical_examination
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Prescription audit trigger
DROP TRIGGER IF EXISTS audit_prescription_trigger ON prescription;
CREATE TRIGGER audit_prescription_trigger
    AFTER INSERT OR UPDATE OR DELETE ON prescription
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Lab Order audit trigger
DROP TRIGGER IF EXISTS audit_lab_order_trigger ON lab_order;
CREATE TRIGGER audit_lab_order_trigger
    AFTER INSERT OR UPDATE OR DELETE ON lab_order
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Imaging Study audit trigger
DROP TRIGGER IF EXISTS audit_imaging_study_trigger ON imaging_study;
CREATE TRIGGER audit_imaging_study_trigger
    AFTER INSERT OR UPDATE OR DELETE ON imaging_study
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Employee audit trigger (HR data)
DROP TRIGGER IF EXISTS audit_employee_trigger ON employee;
CREATE TRIGGER audit_employee_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employee
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Emergency Access audit trigger
DROP TRIGGER IF EXISTS audit_emergency_access_trigger ON emergency_access_log;
CREATE TRIGGER audit_emergency_access_trigger
    AFTER INSERT OR UPDATE OR DELETE ON emergency_access_log
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- SECTION 3: ADD IS_CLINICAL FLAG TO ROLE TABLE
-- =====================================================
-- Distinguishes clinical roles (Doctor, Nurse, Optometrist)
-- from administrative roles (Receptionist, IT Admin, Manager)
-- Used for clinical data access control
-- =====================================================

-- Add is_clinical column to AspNetRoles
ALTER TABLE "AspNetRoles" 
ADD COLUMN IF NOT EXISTS is_clinical BOOLEAN DEFAULT FALSE;

-- Create index for is_clinical filtering
CREATE INDEX IF NOT EXISTS idx_roles_is_clinical 
ON "AspNetRoles"(is_clinical) 
WHERE deleted_at IS NULL;

-- Update existing roles to set is_clinical flag
-- Clinical roles: Doctor, Nurse, Optometrist, Ophthalmologist, etc.
UPDATE "AspNetRoles" 
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
) AND deleted_at IS NULL;

-- Administrative roles remain is_clinical = FALSE (default)
-- Examples: Receptionist, IT Admin, HR Manager, Finance Manager, etc.

-- Add comment to column
COMMENT ON COLUMN "AspNetRoles".is_clinical IS 
'Indicates if role requires clinical credentials and has access to clinical data (PHI). TRUE for doctors, nurses, clinical staff. FALSE for administrative, IT, finance staff.';

-- =====================================================
-- SECTION 4: VALIDATION QUERIES
-- =====================================================
-- Verify all changes were applied successfully
-- =====================================================

-- Check index counts
SELECT 
    schemaname,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY index_count DESC
LIMIT 10;

-- Check audit trigger coverage
SELECT 
    event_object_table,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;

-- Check is_clinical flag distribution
SELECT 
    is_clinical,
    COUNT(*) as role_count,
    STRING_AGG(name, ', ' ORDER BY name) as role_names
FROM "AspNetRoles"
WHERE deleted_at IS NULL
GROUP BY is_clinical;

-- Check performance (sample query with new indexes)
EXPLAIN ANALYZE
SELECT 
    u.user_name,
    u.email,
    d.department_name,
    b.name as branch_name
FROM "AspNetUsers" u
LEFT JOIN department d ON u.department_id = d.id
LEFT JOIN branch b ON u.branch_id = b.id
WHERE u.tenant_id = (SELECT id FROM tenant LIMIT 1)
    AND u.deleted_at IS NULL
ORDER BY u.created_at DESC
LIMIT 100;

-- =====================================================
-- END OF DAY 3 DATABASE ENHANCEMENTS
-- =====================================================
-- Summary:
-- - Added 50+ performance indexes for common query patterns
-- - Created audit triggers for 9 critical tables (PHI/PII)
-- - Added is_clinical flag to role table with proper defaults
-- - All changes are idempotent and safe to re-run
-- 
-- Next Steps:
-- - Run test_database_compliance.sql to verify 10/10 score
-- - Monitor query performance improvements
-- - Review audit_log table growth (set up retention policy)
-- =====================================================
