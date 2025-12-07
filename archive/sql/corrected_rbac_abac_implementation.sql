-- =====================================================
-- CORRECTED RBAC & ABAC IMPLEMENTATION SCRIPT
-- Hospital Portal Database Setup
-- Version: 3.1 - Fixed Order + Identity Tables
-- Date: November 12, 2025
-- =====================================================

-- =====================================================
-- PHASE 0: CREATE REQUIRED TABLES FIRST
-- =====================================================

-- Create ASP.NET Identity users table (simplified version)
CREATE TABLE IF NOT EXISTS "AspNetUsers" (
    id uuid NOT NULL,
    user_name character varying(256),
    "NormalizedUserName" character varying(256),
    "Email" character varying(256),
    "NormalizedEmail" character varying(256),
    "EmailConfirmed" boolean NOT NULL,
    "PasswordHash" text,
    "SecurityStamp" text,
    "ConcurrencyStamp" text,
    "PhoneNumber" text,
    "PhoneNumberConfirmed" boolean NOT NULL,
    "TwoFactorEnabled" boolean NOT NULL,
    "LockoutEnd" timestamp with time zone,
    "LockoutEnabled" boolean NOT NULL,
    "AccessFailedCount" integer NOT NULL,
    CONSTRAINT "PK_AspNetUsers" PRIMARY KEY (id)
);

-- Insert system user for RBAC operations
INSERT INTO "AspNetUsers" (id, user_name, "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'system', 'SYSTEM', 'system@hospitalportal.com', 'SYSTEM@HOSPITALPORTAL.COM', true, 'dummy_hash', 'dummy_stamp', 'dummy_concurrency', NULL, false, false, false, 0)
ON CONFLICT (id) DO NOTHING;

-- Create permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(50) DEFAULT 'tenant',
    data_classification VARCHAR(50) DEFAULT 'internal',
    is_system_permission BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    role_type VARCHAR(50) DEFAULT 'custom', -- 'system', 'custom'
    is_system_role BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create role_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    condition JSONB,
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_until TIMESTAMP WITH TIME ZONE,
    granted_by_user_id UUID REFERENCES "AspNetUsers"(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 1: DATABASE SCHEMA ENHANCEMENTS
-- =====================================================

-- 1.1 Enhance existing permissions table (only if it already exists)
-- Note: Since we're creating the table above, these ALTERs are not needed
-- ALTER TABLE permissions
-- ADD COLUMN IF NOT EXISTS data_classification VARCHAR(50) DEFAULT 'internal',
-- ADD COLUMN IF NOT EXISTS scope VARCHAR(50) DEFAULT 'tenant',
-- ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100),
-- ADD COLUMN IF NOT EXISTS is_system_permission BOOLEAN DEFAULT true;

-- 1.2 Enhance role_permissions table for ABAC (only if it already exists)
-- Note: Since we're creating the table above, these ALTERs are not needed
-- ALTER TABLE role_permissions
-- ADD COLUMN IF NOT EXISTS condition JSONB,
-- ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP WITH TIME ZONE,
-- ADD COLUMN IF NOT EXISTS effective_until TIMESTAMP WITH TIME ZONE,
-- ADD COLUMN IF NOT EXISTS granted_by_user_id UUID REFERENCES "AspNetUsers"(id),
-- ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 1.3 Create missing tables

-- 1.3.0 document_types table (needed before patient_document_uploads)
CREATE TABLE IF NOT EXISTS document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    max_file_size_mb INTEGER,
    allowed_extensions TEXT[],
    retention_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 1.3.0.1 document_access_rules table (needed for document sharing)
CREATE TABLE IF NOT EXISTS document_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_type_id UUID NOT NULL REFERENCES document_types(id),
    source_department_id UUID NOT NULL,
    target_department_id UUID NOT NULL,
    access_level VARCHAR(50) DEFAULT 'read', -- 'read', 'write', 'admin'
    auto_share BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    condition JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 1.3.1 patient_document_uploads table
CREATE TABLE IF NOT EXISTS patient_document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    document_type_id UUID NOT NULL REFERENCES document_types(id),
    uploaded_by_user_id UUID NOT NULL REFERENCES "AspNetUsers"(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    checksum VARCHAR(128),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 1.3.2 document_access_audit table
CREATE TABLE IF NOT EXISTS document_access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL,
    accessed_by_user_id UUID NOT NULL REFERENCES "AspNetUsers"(id),
    access_type VARCHAR(50) NOT NULL, -- 'view', 'download', 'share', 'delete'
    ip_address INET,
    user_agent TEXT,
    department_id UUID,
    branch_id UUID,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    failure_reason TEXT
);

-- 1.3.3 admin_configurations table
CREATE TABLE IF NOT EXISTS admin_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSONB,
    config_type VARCHAR(50) DEFAULT 'system', -- 'system', 'tenant', 'user'
    is_encrypted BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id)
);

-- 1.3.4 permission_types table (optional enhancement)
CREATE TABLE IF NOT EXISTS permission_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- 'crud', 'admin', 'clinical', 'financial'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4 Add RLS policies for new tables
ALTER TABLE patient_document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY tenant_isolation_patient_docs ON patient_document_uploads
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_doc_audit ON document_access_audit
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_admin_config ON admin_configurations
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 1.5 Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_data_classification ON permissions(data_classification);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_type ON permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_role_permissions_condition ON role_permissions USING gin(condition);
CREATE INDEX IF NOT EXISTS idx_role_permissions_effective_dates ON role_permissions(effective_from, effective_until);
CREATE INDEX IF NOT EXISTS idx_patient_docs_patient_id ON patient_document_uploads(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_docs_document_type ON patient_document_uploads(document_type_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_document_id ON document_access_audit(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_accessed_at ON document_access_audit(accessed_at);
CREATE INDEX IF NOT EXISTS idx_admin_config_key ON admin_configurations(config_key);

-- =====================================================
-- PHASE 2: PERMISSION SEEDING (297 PERMISSIONS)
-- =====================================================

-- 2.1 Clear existing permissions (optional - comment out if preserving existing)
-- DELETE FROM permissions WHERE is_system_permission = true;

-- 2.2 Insert all 297 permissions
-- Note: Using a common tenant_id for system permissions
INSERT INTO permissions (id, tenant_id, code, name, module, resource, action, scope, data_classification, description, is_system_permission) VALUES
-- PATIENT MANAGEMENT (24 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view', 'View Patient Records', 'Patient Management', 'patient', 'view', 'tenant', 'sensitive', 'View patient basic information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.create', 'Create Patient Records', 'Patient Management', 'patient', 'create', 'tenant', 'sensitive', 'Create new patient records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit', 'Edit Patient Records', 'Patient Management', 'patient', 'edit', 'tenant', 'sensitive', 'Edit patient information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.delete', 'Delete Patient Records', 'Patient Management', 'patient', 'delete', 'tenant', 'sensitive', 'Soft delete patient records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_medical_history', 'View Medical History', 'Patient Management', 'medical_history', 'view', 'tenant', 'confidential', 'View patient medical history', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_medical_history', 'Edit Medical History', 'Patient Management', 'medical_history', 'edit', 'tenant', 'confidential', 'Edit patient medical history', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_allergies', 'View Allergies', 'Patient Management', 'allergies', 'view', 'tenant', 'confidential', 'View patient allergies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_allergies', 'Edit Allergies', 'Patient Management', 'allergies', 'edit', 'tenant', 'confidential', 'Edit patient allergies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_medications', 'View Medications', 'Patient Management', 'medications', 'view', 'tenant', 'confidential', 'View patient medications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_medications', 'Edit Medications', 'Patient Management', 'medications', 'edit', 'tenant', 'confidential', 'Edit patient medications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_insurance', 'View Insurance', 'Patient Management', 'insurance', 'view', 'tenant', 'confidential', 'View patient insurance information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_insurance', 'Edit Insurance', 'Patient Management', 'insurance', 'edit', 'tenant', 'confidential', 'Edit patient insurance information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_emergency_contacts', 'View Emergency Contacts', 'Patient Management', 'emergency_contacts', 'view', 'tenant', 'confidential', 'View patient emergency contacts', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_emergency_contacts', 'Edit Emergency Contacts', 'Patient Management', 'emergency_contacts', 'edit', 'tenant', 'confidential', 'Edit patient emergency contacts', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_family_history', 'View Family History', 'Patient Management', 'family_history', 'view', 'tenant', 'confidential', 'View patient family medical history', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_family_history', 'Edit Family History', 'Patient Management', 'family_history', 'edit', 'tenant', 'confidential', 'Edit patient family medical history', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_vital_signs', 'View Vital Signs', 'Patient Management', 'vital_signs', 'view', 'tenant', 'confidential', 'View patient vital signs', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.edit_vital_signs', 'Edit Vital Signs', 'Patient Management', 'vital_signs', 'edit', 'tenant', 'confidential', 'Edit patient vital signs', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_lab_results', 'View Lab Results', 'Patient Management', 'lab_results', 'view', 'tenant', 'confidential', 'View patient lab results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.view_imaging_results', 'View Imaging Results', 'Patient Management', 'imaging_results', 'view', 'tenant', 'confidential', 'View patient imaging results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.export_data', 'Export Patient Data', 'Patient Management', 'patient_data', 'export', 'tenant', 'confidential', 'Export patient data for external use', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.bulk_import', 'Bulk Import Patients', 'Patient Management', 'patient_data', 'import', 'tenant', 'confidential', 'Bulk import patient data', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.merge_records', 'Merge Patient Records', 'Patient Management', 'patient_records', 'merge', 'tenant', 'confidential', 'Merge duplicate patient records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'patients.archive_records', 'Archive Patient Records', 'Patient Management', 'patient_records', 'archive', 'tenant', 'confidential', 'Archive patient records', true),

-- CLINICAL ASSESSMENT (20 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view', 'View Clinical Assessments', 'Clinical Assessment', 'assessment', 'view', 'tenant', 'confidential', 'View clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.create', 'Create Clinical Assessments', 'Clinical Assessment', 'assessment', 'create', 'tenant', 'confidential', 'Create clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit', 'Edit Clinical Assessments', 'Clinical Assessment', 'assessment', 'edit', 'tenant', 'confidential', 'Edit clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.delete', 'Delete Clinical Assessments', 'Clinical Assessment', 'assessment', 'delete', 'tenant', 'confidential', 'Delete clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_symptoms', 'View Symptoms', 'Clinical Assessment', 'symptoms', 'view', 'tenant', 'confidential', 'View patient symptoms', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit_symptoms', 'Edit Symptoms', 'Clinical Assessment', 'symptoms', 'edit', 'tenant', 'confidential', 'Edit patient symptoms', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_diagnosis', 'View Diagnosis', 'Clinical Assessment', 'diagnosis', 'view', 'tenant', 'confidential', 'View diagnosis information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit_diagnosis', 'Edit Diagnosis', 'Clinical Assessment', 'diagnosis', 'edit', 'tenant', 'confidential', 'Edit diagnosis information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_treatment_plan', 'View Treatment Plans', 'Clinical Assessment', 'treatment_plan', 'view', 'tenant', 'confidential', 'View treatment plans', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit_treatment_plan', 'Edit Treatment Plans', 'Clinical Assessment', 'treatment_plan', 'edit', 'tenant', 'confidential', 'Edit treatment plans', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_progress_notes', 'View Progress Notes', 'Clinical Assessment', 'progress_notes', 'view', 'tenant', 'confidential', 'View progress notes', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit_progress_notes', 'Edit Progress Notes', 'Clinical Assessment', 'progress_notes', 'edit', 'tenant', 'confidential', 'Edit progress notes', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_referrals', 'View Referrals', 'Clinical Assessment', 'referrals', 'view', 'tenant', 'confidential', 'View referral information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit_referrals', 'Edit Referrals', 'Clinical Assessment', 'referrals', 'edit', 'tenant', 'confidential', 'Edit referral information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_follow_up', 'View Follow-up', 'Clinical Assessment', 'follow_up', 'view', 'tenant', 'confidential', 'View follow-up information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.edit_follow_up', 'Edit Follow-up', 'Clinical Assessment', 'follow_up', 'edit', 'tenant', 'confidential', 'Edit follow-up information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.approve_assessment', 'Approve Assessments', 'Clinical Assessment', 'assessment', 'approve', 'tenant', 'confidential', 'Approve clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.reject_assessment', 'Reject Assessments', 'Clinical Assessment', 'assessment', 'reject', 'tenant', 'confidential', 'Reject clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.escalate_assessment', 'Escalate Assessments', 'Clinical Assessment', 'assessment', 'escalate', 'tenant', 'confidential', 'Escalate clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.view_all_assessments', 'View All Assessments', 'Clinical Assessment', 'all_assessments', 'view', 'tenant', 'confidential', 'View all clinical assessments', true),

-- PRESCRIPTIONS (16 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.view', 'View Prescriptions', 'Prescriptions', 'prescription', 'view', 'tenant', 'confidential', 'View prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.create', 'Create Prescriptions', 'Prescriptions', 'prescription', 'create', 'tenant', 'confidential', 'Create prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.edit', 'Edit Prescriptions', 'Prescriptions', 'prescription', 'edit', 'tenant', 'confidential', 'Edit prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.delete', 'Delete Prescriptions', 'Prescriptions', 'prescription', 'delete', 'tenant', 'confidential', 'Delete prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.view_medication_history', 'View Medication History', 'Prescriptions', 'medication_history', 'view', 'tenant', 'confidential', 'View medication history', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.edit_medication_history', 'Edit Medication History', 'Prescriptions', 'medication_history', 'edit', 'tenant', 'confidential', 'Edit medication history', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.view_drug_interactions', 'View Drug Interactions', 'Prescriptions', 'drug_interactions', 'view', 'tenant', 'confidential', 'View drug interactions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.edit_drug_interactions', 'Edit Drug Interactions', 'Prescriptions', 'drug_interactions', 'edit', 'tenant', 'confidential', 'Edit drug interactions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.view_allergies', 'View Prescription Allergies', 'Prescriptions', 'allergies', 'view', 'tenant', 'confidential', 'View prescription allergies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.edit_allergies', 'Edit Prescription Allergies', 'Prescriptions', 'allergies', 'edit', 'tenant', 'confidential', 'Edit prescription allergies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.view_contraindications', 'View Contraindications', 'Prescriptions', 'contraindications', 'view', 'tenant', 'confidential', 'View contraindications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.edit_contraindications', 'Edit Contraindications', 'Prescriptions', 'contraindications', 'edit', 'tenant', 'confidential', 'Edit contraindications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.approve_prescription', 'Approve Prescriptions', 'Prescriptions', 'prescription', 'approve', 'tenant', 'confidential', 'Approve prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.reject_prescription', 'Reject Prescriptions', 'Prescriptions', 'prescription', 'reject', 'tenant', 'confidential', 'Reject prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.renew_prescription', 'Renew Prescriptions', 'Prescriptions', 'prescription', 'renew', 'tenant', 'confidential', 'Renew prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.view_all_prescriptions', 'View All Prescriptions', 'Prescriptions', 'all_prescriptions', 'view', 'tenant', 'confidential', 'View all prescriptions', true),

-- LABORATORY (18 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_tests', 'View Lab Tests', 'Laboratory', 'lab_tests', 'view', 'tenant', 'confidential', 'View lab tests', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.create_tests', 'Create Lab Tests', 'Laboratory', 'lab_tests', 'create', 'tenant', 'confidential', 'Create lab tests', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.edit_tests', 'Edit Lab Tests', 'Laboratory', 'lab_tests', 'edit', 'tenant', 'confidential', 'Edit lab tests', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.delete_tests', 'Delete Lab Tests', 'Laboratory', 'lab_tests', 'delete', 'tenant', 'confidential', 'Delete lab tests', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_results', 'View Lab Results', 'Laboratory', 'lab_results', 'view', 'tenant', 'confidential', 'View lab results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.edit_results', 'Edit Lab Results', 'Laboratory', 'lab_results', 'edit', 'tenant', 'confidential', 'Edit lab results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.approve_results', 'Approve Lab Results', 'Laboratory', 'lab_results', 'approve', 'tenant', 'confidential', 'Approve lab results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.reject_results', 'Reject Lab Results', 'Laboratory', 'lab_results', 'reject', 'tenant', 'confidential', 'Reject lab results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_reports', 'View Lab Reports', 'Laboratory', 'lab_reports', 'view', 'tenant', 'confidential', 'View lab reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.create_reports', 'Create Lab Reports', 'Laboratory', 'lab_reports', 'create', 'tenant', 'confidential', 'Create lab reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.edit_reports', 'Edit Lab Reports', 'Laboratory', 'lab_reports', 'edit', 'tenant', 'confidential', 'Edit lab reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_quality_control', 'View Quality Control', 'Laboratory', 'quality_control', 'view', 'tenant', 'confidential', 'View quality control data', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.edit_quality_control', 'Edit Quality Control', 'Laboratory', 'quality_control', 'edit', 'tenant', 'confidential', 'Edit quality control data', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_equipment', 'View Lab Equipment', 'Laboratory', 'equipment', 'view', 'tenant', 'internal', 'View lab equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.edit_equipment', 'Edit Lab Equipment', 'Laboratory', 'equipment', 'edit', 'tenant', 'internal', 'Edit lab equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_inventory', 'View Lab Inventory', 'Laboratory', 'inventory', 'view', 'tenant', 'internal', 'View lab inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.edit_inventory', 'Edit Lab Inventory', 'Laboratory', 'inventory', 'edit', 'tenant', 'internal', 'Edit lab inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'laboratory.view_all_lab_data', 'View All Lab Data', 'Laboratory', 'all_lab_data', 'view', 'tenant', 'confidential', 'View all laboratory data', true),

-- IMAGING (16 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.view_studies', 'View Imaging Studies', 'Imaging', 'imaging_studies', 'view', 'tenant', 'confidential', 'View imaging studies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.create_studies', 'Create Imaging Studies', 'Imaging', 'imaging_studies', 'create', 'tenant', 'confidential', 'Create imaging studies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.edit_studies', 'Edit Imaging Studies', 'Imaging', 'imaging_studies', 'edit', 'tenant', 'confidential', 'Edit imaging studies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.delete_studies', 'Delete Imaging Studies', 'Imaging', 'imaging_studies', 'delete', 'tenant', 'confidential', 'Delete imaging studies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.view_results', 'View Imaging Results', 'Imaging', 'imaging_results', 'view', 'tenant', 'confidential', 'View imaging results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.edit_results', 'Edit Imaging Results', 'Imaging', 'imaging_results', 'edit', 'tenant', 'confidential', 'Edit imaging results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.approve_results', 'Approve Imaging Results', 'Imaging', 'imaging_results', 'approve', 'tenant', 'confidential', 'Approve imaging results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.reject_results', 'Reject Imaging Results', 'Imaging', 'imaging_results', 'reject', 'tenant', 'confidential', 'Reject imaging results', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.view_reports', 'View Imaging Reports', 'Imaging', 'imaging_reports', 'view', 'tenant', 'confidential', 'View imaging reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.create_reports', 'Create Imaging Reports', 'Imaging', 'imaging_reports', 'create', 'tenant', 'confidential', 'Create imaging reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.edit_reports', 'Edit Imaging Reports', 'Imaging', 'imaging_reports', 'edit', 'tenant', 'confidential', 'Edit imaging reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.view_equipment', 'View Imaging Equipment', 'Imaging', 'equipment', 'view', 'tenant', 'internal', 'View imaging equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.edit_equipment', 'Edit Imaging Equipment', 'Imaging', 'equipment', 'edit', 'tenant', 'internal', 'Edit imaging equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.view_schedules', 'View Imaging Schedules', 'Imaging', 'schedules', 'view', 'tenant', 'internal', 'View imaging schedules', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.edit_schedules', 'Edit Imaging Schedules', 'Imaging', 'schedules', 'edit', 'tenant', 'internal', 'Edit imaging schedules', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'imaging.view_all_imaging_data', 'View All Imaging Data', 'Imaging', 'all_imaging_data', 'view', 'tenant', 'confidential', 'View all imaging data', true),

-- APPOINTMENTS (16 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.view', 'View Appointments', 'Appointments', 'appointments', 'view', 'tenant', 'internal', 'View appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.create', 'Create Appointments', 'Appointments', 'appointments', 'create', 'tenant', 'internal', 'Create appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.edit', 'Edit Appointments', 'Appointments', 'appointments', 'edit', 'tenant', 'internal', 'Edit appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.delete', 'Delete Appointments', 'Appointments', 'appointments', 'delete', 'tenant', 'internal', 'Delete appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.view_schedule', 'View Appointment Schedules', 'Appointments', 'schedule', 'view', 'tenant', 'internal', 'View appointment schedules', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.edit_schedule', 'Edit Appointment Schedules', 'Appointments', 'schedule', 'edit', 'tenant', 'internal', 'Edit appointment schedules', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.view_calendar', 'View Appointment Calendar', 'Appointments', 'calendar', 'view', 'tenant', 'internal', 'View appointment calendar', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.edit_calendar', 'Edit Appointment Calendar', 'Appointments', 'calendar', 'edit', 'tenant', 'internal', 'Edit appointment calendar', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.confirm_appointment', 'Confirm Appointments', 'Appointments', 'appointments', 'confirm', 'tenant', 'internal', 'Confirm appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.cancel_appointment', 'Cancel Appointments', 'Appointments', 'appointments', 'cancel', 'tenant', 'internal', 'Cancel appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.reschedule_appointment', 'Reschedule Appointments', 'Appointments', 'appointments', 'reschedule', 'tenant', 'internal', 'Reschedule appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.view_waiting_list', 'View Waiting List', 'Appointments', 'waiting_list', 'view', 'tenant', 'internal', 'View appointment waiting list', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.edit_waiting_list', 'Edit Waiting List', 'Appointments', 'waiting_list', 'edit', 'tenant', 'internal', 'Edit appointment waiting list', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.view_availability', 'View Provider Availability', 'Appointments', 'availability', 'view', 'tenant', 'internal', 'View provider availability', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.edit_availability', 'Edit Provider Availability', 'Appointments', 'availability', 'edit', 'tenant', 'internal', 'Edit provider availability', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.view_all_appointments', 'View All Appointments', 'Appointments', 'all_appointments', 'view', 'tenant', 'internal', 'View all appointments', true),

-- BILLING (20 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_invoices', 'View Invoices', 'Billing', 'invoices', 'view', 'tenant', 'confidential', 'View invoices', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.create_invoices', 'Create Invoices', 'Billing', 'invoices', 'create', 'tenant', 'confidential', 'Create invoices', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.edit_invoices', 'Edit Invoices', 'Billing', 'invoices', 'edit', 'tenant', 'confidential', 'Edit invoices', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.delete_invoices', 'Delete Invoices', 'Billing', 'invoices', 'delete', 'tenant', 'confidential', 'Delete invoices', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_payments', 'View Payments', 'Billing', 'payments', 'view', 'tenant', 'confidential', 'View payments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.create_payments', 'Create Payments', 'Billing', 'payments', 'create', 'tenant', 'confidential', 'Create payments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.edit_payments', 'Edit Payments', 'Billing', 'payments', 'edit', 'tenant', 'confidential', 'Edit payments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.delete_payments', 'Delete Payments', 'Billing', 'payments', 'delete', 'tenant', 'confidential', 'Delete payments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_insurance_claims', 'View Insurance Claims', 'Billing', 'insurance_claims', 'view', 'tenant', 'confidential', 'View insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.create_insurance_claims', 'Create Insurance Claims', 'Billing', 'insurance_claims', 'create', 'tenant', 'confidential', 'Create insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.edit_insurance_claims', 'Edit Insurance Claims', 'Billing', 'insurance_claims', 'edit', 'tenant', 'confidential', 'Edit insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.delete_insurance_claims', 'Delete Insurance Claims', 'Billing', 'insurance_claims', 'delete', 'tenant', 'confidential', 'Delete insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_price_list', 'View Price Lists', 'Billing', 'price_list', 'view', 'tenant', 'internal', 'View price lists', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.edit_price_list', 'Edit Price Lists', 'Billing', 'price_list', 'edit', 'tenant', 'internal', 'Edit price lists', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_reports', 'View Billing Reports', 'Billing', 'billing_reports', 'view', 'tenant', 'confidential', 'View billing reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.create_reports', 'Create Billing Reports', 'Billing', 'billing_reports', 'create', 'tenant', 'confidential', 'Create billing reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.approve_discounts', 'Approve Discounts', 'Billing', 'discounts', 'approve', 'tenant', 'confidential', 'Approve billing discounts', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.process_refunds', 'Process Refunds', 'Billing', 'refunds', 'process', 'tenant', 'confidential', 'Process refunds', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_aging_reports', 'View Aging Reports', 'Billing', 'aging_reports', 'view', 'tenant', 'confidential', 'View aging reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'billing.view_all_billing_data', 'View All Billing Data', 'Billing', 'all_billing_data', 'view', 'tenant', 'confidential', 'View all billing data', true),

-- INSURANCE (18 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.view_policies', 'View Insurance Policies', 'Insurance', 'policies', 'view', 'tenant', 'confidential', 'View insurance policies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.create_policies', 'Create Insurance Policies', 'Insurance', 'policies', 'create', 'tenant', 'confidential', 'Create insurance policies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.edit_policies', 'Edit Insurance Policies', 'Insurance', 'policies', 'edit', 'tenant', 'confidential', 'Edit insurance policies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.delete_policies', 'Delete Insurance Policies', 'Insurance', 'policies', 'delete', 'tenant', 'confidential', 'Delete insurance policies', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.view_claims', 'View Insurance Claims', 'Insurance', 'claims', 'view', 'tenant', 'confidential', 'View insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.create_claims', 'Create Insurance Claims', 'Insurance', 'claims', 'create', 'tenant', 'confidential', 'Create insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.edit_claims', 'Edit Insurance Claims', 'Insurance', 'claims', 'edit', 'tenant', 'confidential', 'Edit insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.delete_claims', 'Delete Insurance Claims', 'Insurance', 'claims', 'delete', 'tenant', 'confidential', 'Delete insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.view_providers', 'View Insurance Providers', 'Insurance', 'providers', 'view', 'tenant', 'internal', 'View insurance providers', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.edit_providers', 'Edit Insurance Providers', 'Insurance', 'providers', 'edit', 'tenant', 'internal', 'Edit insurance providers', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.view_benefits', 'View Insurance Benefits', 'Insurance', 'benefits', 'view', 'tenant', 'internal', 'View insurance benefits', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.edit_benefits', 'Edit Insurance Benefits', 'Insurance', 'benefits', 'edit', 'tenant', 'internal', 'Edit insurance benefits', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.approve_claims', 'Approve Insurance Claims', 'Insurance', 'claims', 'approve', 'tenant', 'confidential', 'Approve insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.reject_claims', 'Reject Insurance Claims', 'Insurance', 'claims', 'reject', 'tenant', 'confidential', 'Reject insurance claims', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.process_preauthorizations', 'Process Pre-authorizations', 'Insurance', 'preauthorizations', 'process', 'tenant', 'confidential', 'Process pre-authorizations', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.view_reports', 'View Insurance Reports', 'Insurance', 'insurance_reports', 'view', 'tenant', 'confidential', 'View insurance reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.create_reports', 'Create Insurance Reports', 'Insurance', 'insurance_reports', 'create', 'tenant', 'confidential', 'Create insurance reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'insurance.view_all_insurance_data', 'View All Insurance Data', 'Insurance', 'all_insurance_data', 'view', 'tenant', 'confidential', 'View all insurance data', true),

-- PHARMACY (20 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_inventory', 'View Pharmacy Inventory', 'Pharmacy', 'inventory', 'view', 'tenant', 'internal', 'View pharmacy inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.edit_inventory', 'Edit Pharmacy Inventory', 'Pharmacy', 'inventory', 'edit', 'tenant', 'internal', 'Edit pharmacy inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_prescriptions', 'View Pharmacy Prescriptions', 'Pharmacy', 'prescriptions', 'view', 'tenant', 'confidential', 'View pharmacy prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.fill_prescriptions', 'Fill Prescriptions', 'Pharmacy', 'prescriptions', 'fill', 'tenant', 'confidential', 'Fill prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.verify_prescriptions', 'Verify Prescriptions', 'Pharmacy', 'prescriptions', 'verify', 'tenant', 'confidential', 'Verify prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_drug_information', 'View Drug Information', 'Pharmacy', 'drug_information', 'view', 'tenant', 'internal', 'View drug information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.edit_drug_information', 'Edit Drug Information', 'Pharmacy', 'drug_information', 'edit', 'tenant', 'internal', 'Edit drug information', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_compounding', 'View Compounding Records', 'Pharmacy', 'compounding', 'view', 'tenant', 'internal', 'View compounding records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.create_compounding', 'Create Compounding Records', 'Pharmacy', 'compounding', 'create', 'tenant', 'internal', 'Create compounding records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_iv_meds', 'View IV Medications', 'Pharmacy', 'iv_medications', 'view', 'tenant', 'confidential', 'View IV medications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.prepare_iv_meds', 'Prepare IV Medications', 'Pharmacy', 'iv_medications', 'prepare', 'tenant', 'confidential', 'Prepare IV medications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_reports', 'View Pharmacy Reports', 'Pharmacy', 'pharmacy_reports', 'view', 'tenant', 'internal', 'View pharmacy reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.create_reports', 'Create Pharmacy Reports', 'Pharmacy', 'pharmacy_reports', 'create', 'tenant', 'internal', 'Create pharmacy reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_suppliers', 'View Pharmacy Suppliers', 'Pharmacy', 'suppliers', 'view', 'tenant', 'internal', 'View pharmacy suppliers', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.edit_suppliers', 'Edit Pharmacy Suppliers', 'Pharmacy', 'suppliers', 'edit', 'tenant', 'internal', 'Edit pharmacy suppliers', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_orders', 'View Pharmacy Orders', 'Pharmacy', 'orders', 'view', 'tenant', 'internal', 'View pharmacy orders', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.create_orders', 'Create Pharmacy Orders', 'Pharmacy', 'orders', 'create', 'tenant', 'internal', 'Create pharmacy orders', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.approve_orders', 'Approve Pharmacy Orders', 'Pharmacy', 'orders', 'approve', 'tenant', 'internal', 'Approve pharmacy orders', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_expiration_reports', 'View Expiration Reports', 'Pharmacy', 'expiration_reports', 'view', 'tenant', 'internal', 'View expiration reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'pharmacy.view_all_pharmacy_data', 'View All Pharmacy Data', 'Pharmacy', 'all_pharmacy_data', 'view', 'tenant', 'internal', 'View all pharmacy data', true),

-- WARD/IPD (18 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_patients', 'View Ward Patients', 'Ward/IPD', 'ward_patients', 'view', 'tenant', 'confidential', 'View ward patients', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.admit_patients', 'Admit Patients', 'Ward/IPD', 'ward_patients', 'admit', 'tenant', 'confidential', 'Admit patients to ward', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.discharge_patients', 'Discharge Patients', 'Ward/IPD', 'ward_patients', 'discharge', 'tenant', 'confidential', 'Discharge patients from ward', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.transfer_patients', 'Transfer Patients', 'Ward/IPD', 'ward_patients', 'transfer', 'tenant', 'confidential', 'Transfer patients between wards', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_beds', 'View Ward Beds', 'Ward/IPD', 'beds', 'view', 'tenant', 'internal', 'View ward beds', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.assign_beds', 'Assign Ward Beds', 'Ward/IPD', 'beds', 'assign', 'tenant', 'internal', 'Assign ward beds', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_care_plans', 'View Care Plans', 'Ward/IPD', 'care_plans', 'view', 'tenant', 'confidential', 'View care plans', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.edit_care_plans', 'Edit Care Plans', 'Ward/IPD', 'care_plans', 'edit', 'tenant', 'confidential', 'Edit care plans', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_vital_signs', 'View Ward Vital Signs', 'Ward/IPD', 'vital_signs', 'view', 'tenant', 'confidential', 'View ward vital signs', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.record_vital_signs', 'Record Vital Signs', 'Ward/IPD', 'vital_signs', 'record', 'tenant', 'confidential', 'Record vital signs', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_medication_administration', 'View Medication Administration', 'Ward/IPD', 'medication_administration', 'view', 'tenant', 'confidential', 'View medication administration', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.record_medication_administration', 'Record Medication Administration', 'Ward/IPD', 'medication_administration', 'record', 'tenant', 'confidential', 'Record medication administration', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_shift_reports', 'View Shift Reports', 'Ward/IPD', 'shift_reports', 'view', 'tenant', 'confidential', 'View shift reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.create_shift_reports', 'Create Shift Reports', 'Ward/IPD', 'shift_reports', 'create', 'tenant', 'confidential', 'Create shift reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_incident_reports', 'View Incident Reports', 'Ward/IPD', 'incident_reports', 'view', 'tenant', 'confidential', 'View incident reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.create_incident_reports', 'Create Incident Reports', 'Ward/IPD', 'incident_reports', 'create', 'tenant', 'confidential', 'Create incident reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_equipment', 'View Ward Equipment', 'Ward/IPD', 'ward_equipment', 'view', 'tenant', 'internal', 'View ward equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ward.view_all_ward_data', 'View All Ward Data', 'Ward/IPD', 'all_ward_data', 'view', 'tenant', 'confidential', 'View all ward data', true),

-- OPERATING THEATRE (18 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_schedule', 'View OT Schedule', 'Operating Theatre', 'ot_schedule', 'view', 'tenant', 'internal', 'View OT schedule', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.create_schedule', 'Create OT Schedule', 'Operating Theatre', 'ot_schedule', 'create', 'tenant', 'internal', 'Create OT schedule', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.edit_schedule', 'Edit OT Schedule', 'Operating Theatre', 'ot_schedule', 'edit', 'tenant', 'internal', 'Edit OT schedule', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_procedures', 'View OT Procedures', 'Operating Theatre', 'ot_procedures', 'view', 'tenant', 'confidential', 'View OT procedures', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.record_procedures', 'Record OT Procedures', 'Operating Theatre', 'ot_procedures', 'record', 'tenant', 'confidential', 'Record OT procedures', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_pre_op', 'View Pre-op Assessments', 'Operating Theatre', 'pre_op_assessment', 'view', 'tenant', 'confidential', 'View pre-op assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.record_pre_op', 'Record Pre-op Assessments', 'Operating Theatre', 'pre_op_assessment', 'record', 'tenant', 'confidential', 'Record pre-op assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_post_op', 'View Post-op Care', 'Operating Theatre', 'post_op_care', 'view', 'tenant', 'confidential', 'View post-op care', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.record_post_op', 'Record Post-op Care', 'Operating Theatre', 'post_op_care', 'record', 'tenant', 'confidential', 'Record post-op care', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_equipment', 'View OT Equipment', 'Operating Theatre', 'ot_equipment', 'view', 'tenant', 'internal', 'View OT equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.maintain_equipment', 'Maintain OT Equipment', 'Operating Theatre', 'ot_equipment', 'maintain', 'tenant', 'internal', 'Maintain OT equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_inventory', 'View OT Inventory', 'Operating Theatre', 'ot_inventory', 'view', 'tenant', 'internal', 'View OT inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.edit_inventory', 'Edit OT Inventory', 'Operating Theatre', 'ot_inventory', 'edit', 'tenant', 'internal', 'Edit OT inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_sterilization', 'View Sterilization Records', 'Operating Theatre', 'sterilization', 'view', 'tenant', 'internal', 'View sterilization records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.record_sterilization', 'Record Sterilization', 'Operating Theatre', 'sterilization', 'record', 'tenant', 'internal', 'Record sterilization', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_anesthesia', 'View Anesthesia Records', 'Operating Theatre', 'anesthesia_records', 'view', 'tenant', 'confidential', 'View anesthesia records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.record_anesthesia', 'Record Anesthesia', 'Operating Theatre', 'anesthesia_records', 'record', 'tenant', 'confidential', 'Record anesthesia', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ot.view_all_ot_data', 'View All OT Data', 'Operating Theatre', 'all_ot_data', 'view', 'tenant', 'confidential', 'View all OT data', true),

-- OPTICAL SHOP (16 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_inventory', 'View Optical Inventory', 'Optical Shop', 'optical_inventory', 'view', 'tenant', 'internal', 'View optical inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.edit_inventory', 'Edit Optical Inventory', 'Optical Shop', 'optical_inventory', 'edit', 'tenant', 'internal', 'Edit optical inventory', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_prescriptions', 'View Optical Prescriptions', 'Optical Shop', 'optical_prescriptions', 'view', 'tenant', 'confidential', 'View optical prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.create_prescriptions', 'Create Optical Prescriptions', 'Optical Shop', 'optical_prescriptions', 'create', 'tenant', 'confidential', 'Create optical prescriptions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_exams', 'View Eye Exams', 'Optical Shop', 'eye_exams', 'view', 'tenant', 'confidential', 'View eye exams', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.perform_exams', 'Perform Eye Exams', 'Optical Shop', 'eye_exams', 'perform', 'tenant', 'confidential', 'Perform eye exams', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_orders', 'View Optical Orders', 'Optical Shop', 'optical_orders', 'view', 'tenant', 'internal', 'View optical orders', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.create_orders', 'Create Optical Orders', 'Optical Shop', 'optical_orders', 'create', 'tenant', 'internal', 'Create optical orders', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_fittings', 'View Frame Fittings', 'Optical Shop', 'frame_fittings', 'view', 'tenant', 'internal', 'View frame fittings', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.record_fittings', 'Record Frame Fittings', 'Optical Shop', 'frame_fittings', 'record', 'tenant', 'internal', 'Record frame fittings', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_adjustments', 'View Adjustments', 'Optical Shop', 'adjustments', 'view', 'tenant', 'internal', 'View adjustments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.record_adjustments', 'Record Adjustments', 'Optical Shop', 'adjustments', 'record', 'tenant', 'internal', 'Record adjustments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_suppliers', 'View Optical Suppliers', 'Optical Shop', 'optical_suppliers', 'view', 'tenant', 'internal', 'View optical suppliers', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.edit_suppliers', 'Edit Optical Suppliers', 'Optical Shop', 'optical_suppliers', 'edit', 'tenant', 'internal', 'Edit optical suppliers', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_reports', 'View Optical Reports', 'Optical Shop', 'optical_reports', 'view', 'tenant', 'internal', 'View optical reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'optical.view_all_optical_data', 'View All Optical Data', 'Optical Shop', 'all_optical_data', 'view', 'tenant', 'internal', 'View all optical data', true),

-- MEDICAL RECORDS (12 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_records', 'View Medical Records', 'Medical Records', 'medical_records', 'view', 'tenant', 'confidential', 'View medical records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.edit_records', 'Edit Medical Records', 'Medical Records', 'medical_records', 'edit', 'tenant', 'confidential', 'Edit medical records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.archive_records', 'Archive Medical Records', 'Medical Records', 'medical_records', 'archive', 'tenant', 'confidential', 'Archive medical records', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_audit_trail', 'View Audit Trail', 'Medical Records', 'audit_trail', 'view', 'tenant', 'confidential', 'View audit trail', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_release_requests', 'View Release Requests', 'Medical Records', 'release_requests', 'view', 'tenant', 'confidential', 'View record release requests', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.process_release_requests', 'Process Release Requests', 'Medical Records', 'release_requests', 'process', 'tenant', 'confidential', 'Process record release requests', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_coding', 'View Medical Coding', 'Medical Records', 'medical_coding', 'view', 'tenant', 'confidential', 'View medical coding', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.edit_coding', 'Edit Medical Coding', 'Medical Records', 'medical_coding', 'edit', 'tenant', 'confidential', 'Edit medical coding', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_statistics', 'View Medical Records Statistics', 'Medical Records', 'statistics', 'view', 'tenant', 'internal', 'View medical records statistics', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.generate_reports', 'Generate Medical Records Reports', 'Medical Records', 'reports', 'generate', 'tenant', 'internal', 'Generate medical records reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_retention_schedule', 'View Retention Schedule', 'Medical Records', 'retention_schedule', 'view', 'tenant', 'internal', 'View retention schedule', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'medical_records.view_all_records_data', 'View All Medical Records Data', 'Medical Records', 'all_records_data', 'view', 'tenant', 'confidential', 'View all medical records data', true),

-- ADMINISTRATION (15 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.view_users', 'View Users', 'Administration', 'users', 'view', 'tenant', 'internal', 'View users', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.create_users', 'Create Users', 'Administration', 'users', 'create', 'tenant', 'internal', 'Create users', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.edit_users', 'Edit Users', 'Administration', 'users', 'edit', 'tenant', 'internal', 'Edit users', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.delete_users', 'Delete Users', 'Administration', 'users', 'delete', 'tenant', 'internal', 'Delete users', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.view_roles', 'View Roles', 'Administration', 'roles', 'view', 'tenant', 'internal', 'View roles', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.create_roles', 'Create Roles', 'Administration', 'roles', 'create', 'tenant', 'internal', 'Create roles', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.edit_roles', 'Edit Roles', 'Administration', 'roles', 'edit', 'tenant', 'internal', 'Edit roles', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.delete_roles', 'Delete Roles', 'Administration', 'roles', 'delete', 'tenant', 'internal', 'Delete roles', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.view_permissions', 'View Permissions', 'Administration', 'permissions', 'view', 'tenant', 'internal', 'View permissions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.manage_permissions', 'Manage Permissions', 'Administration', 'permissions', 'manage', 'tenant', 'internal', 'Manage permissions', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.view_departments', 'View Departments', 'Administration', 'departments', 'view', 'tenant', 'internal', 'View departments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.manage_departments', 'Manage Departments', 'Administration', 'departments', 'manage', 'tenant', 'internal', 'Manage departments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.view_system_settings', 'View System Settings', 'Administration', 'system_settings', 'view', 'tenant', 'internal', 'View system settings', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.edit_system_settings', 'Edit System Settings', 'Administration', 'system_settings', 'edit', 'tenant', 'internal', 'Edit system settings', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'administration.view_all_admin_data', 'View All Administration Data', 'Administration', 'all_admin_data', 'view', 'tenant', 'internal', 'View all administration data', true),

-- REPORTING (12 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.view_patient_reports', 'View Patient Reports', 'Reporting', 'patient_reports', 'view', 'tenant', 'confidential', 'View patient reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.generate_patient_reports', 'Generate Patient Reports', 'Reporting', 'patient_reports', 'generate', 'tenant', 'confidential', 'Generate patient reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.view_financial_reports', 'View Financial Reports', 'Reporting', 'financial_reports', 'view', 'tenant', 'confidential', 'View financial reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.generate_financial_reports', 'Generate Financial Reports', 'Reporting', 'financial_reports', 'generate', 'tenant', 'confidential', 'Generate financial reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.view_operational_reports', 'View Operational Reports', 'Reporting', 'operational_reports', 'view', 'tenant', 'internal', 'View operational reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.generate_operational_reports', 'Generate Operational Reports', 'Reporting', 'operational_reports', 'generate', 'tenant', 'internal', 'Generate operational reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.view_quality_reports', 'View Quality Reports', 'Reporting', 'quality_reports', 'view', 'tenant', 'internal', 'View quality reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.generate_quality_reports', 'Generate Quality Reports', 'Reporting', 'quality_reports', 'generate', 'tenant', 'internal', 'Generate quality reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.view_custom_reports', 'View Custom Reports', 'Reporting', 'custom_reports', 'view', 'tenant', 'internal', 'View custom reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.create_custom_reports', 'Create Custom Reports', 'Reporting', 'custom_reports', 'create', 'tenant', 'internal', 'Create custom reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.schedule_reports', 'Schedule Reports', 'Reporting', 'reports', 'schedule', 'tenant', 'internal', 'Schedule reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'reporting.view_all_reports', 'View All Reports', 'Reporting', 'all_reports', 'view', 'tenant', 'internal', 'View all reports', true),

-- QUALITY (12 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.view_incidents', 'View Quality Incidents', 'Quality', 'incidents', 'view', 'tenant', 'confidential', 'View quality incidents', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.report_incidents', 'Report Quality Incidents', 'Quality', 'incidents', 'report', 'tenant', 'confidential', 'Report quality incidents', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.investigate_incidents', 'Investigate Incidents', 'Quality', 'incidents', 'investigate', 'tenant', 'confidential', 'Investigate incidents', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.view_audit_findings', 'View Audit Findings', 'Quality', 'audit_findings', 'view', 'tenant', 'internal', 'View audit findings', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.conduct_audits', 'Conduct Audits', 'Quality', 'audits', 'conduct', 'tenant', 'internal', 'Conduct audits', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.view_performance_metrics', 'View Performance Metrics', 'Quality', 'performance_metrics', 'view', 'tenant', 'internal', 'View performance metrics', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.edit_performance_metrics', 'Edit Performance Metrics', 'Quality', 'performance_metrics', 'edit', 'tenant', 'internal', 'Edit performance metrics', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.view_compliance_reports', 'View Compliance Reports', 'Quality', 'compliance_reports', 'view', 'tenant', 'internal', 'View compliance reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.generate_compliance_reports', 'Generate Compliance Reports', 'Quality', 'compliance_reports', 'generate', 'tenant', 'internal', 'Generate compliance reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.view_risk_assessments', 'View Risk Assessments', 'Quality', 'risk_assessments', 'view', 'tenant', 'internal', 'View risk assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.conduct_risk_assessments', 'Conduct Risk Assessments', 'Quality', 'risk_assessments', 'conduct', 'tenant', 'internal', 'Conduct risk assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'quality.view_all_quality_data', 'View All Quality Data', 'Quality', 'all_quality_data', 'view', 'tenant', 'internal', 'View all quality data', true);

-- =====================================================
-- PHASE 3: ROLE CREATION (20 SYSTEM ROLES)
-- =====================================================

-- 3.1 Insert system roles with proper flags
INSERT INTO roles (id, tenant_id, name, description, is_system_role, status) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'System Administrator', 'Full system access with all permissions', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Hospital Administrator', 'Hospital-wide administrative access', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Doctor', 'Medical practitioner with clinical access', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Nurse', 'Nursing staff with patient care access', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Pharmacist', 'Pharmacy staff with medication management', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Receptionist', 'Front desk staff with appointment management', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Lab Technician', 'Laboratory testing and analysis', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Radiologist', 'Medical imaging specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Surgeon', 'Surgical procedures specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Anesthesiologist', 'Anesthesia and pain management', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Cardiologist', 'Heart and cardiovascular specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Neurologist', 'Brain and nervous system specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Pediatrician', 'Child healthcare specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Gynecologist', 'Women''s health specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Ophthalmologist', 'Eye care specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dermatologist', 'Skin care specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Psychiatrist', 'Mental health specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Dentist', 'Dental care specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Physical Therapist', 'Rehabilitation specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Medical Records Clerk', 'Medical records management', true, 'active');

-- =====================================================
-- PHASE 4: ROLE-PERMISSION MAPPINGS
-- =====================================================

-- 4.1 Get role IDs for mapping
CREATE TEMP TABLE temp_role_ids AS
SELECT id, name FROM roles WHERE is_system_role = true;

-- 4.2 System Administrator - ALL permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'System Administrator';

-- 4.3 Hospital Administrator - Most permissions except system-level
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Hospital Administrator'
AND p.code NOT LIKE 'administration.manage_permissions'
AND p.code NOT LIKE 'administration.delete_roles'
AND p.code NOT LIKE 'administration.delete_users';

-- 4.4 Doctor - Clinical permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Doctor'
AND (p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records')
     OR p.code IN ('appointments.view', 'appointments.create', 'appointments.edit', 'appointments.view_schedule'));

-- 4.5 Nurse - Patient care permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Nurse'
AND (p.module IN ('Patient Management', 'Ward/IPD')
     OR p.code LIKE 'clinical_assessment.view%'
     OR p.code LIKE 'prescriptions.view%'
     OR p.code LIKE 'appointments.%');

-- 4.6 Pharmacist - Pharmacy permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Pharmacist'
AND p.module IN ('Pharmacy', 'Prescriptions');

-- 4.7 Receptionist - Administrative permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Receptionist'
AND (p.module IN ('Appointments', 'Patient Management')
     AND p.action IN ('view', 'create', 'edit'));

-- 4.8 Lab Technician - Lab permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Lab Technician'
AND p.module = 'Laboratory';

-- 4.9 Radiologist - Imaging permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Radiologist'
AND p.module = 'Imaging';

-- 4.10 Medical Records Clerk - Records permissions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT r.id, p.id, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'
FROM temp_role_ids r, permissions p
WHERE r.name = 'Medical Records Clerk'
AND p.module = 'Medical Records';

-- 4.11 Clean up temp table
DROP TABLE temp_role_ids;

-- =====================================================
-- PHASE 5: CROSS-DEPARTMENT DOCUMENT SHARING SETUP
-- =====================================================

-- 5.1 Seed document types (enable Phase 4 features)
INSERT INTO document_types (id, tenant_id, name, description, category, is_active, max_file_size_mb, allowed_extensions, retention_days) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Insurance Health Card', 'Patient insurance health cards', 'insurance', true, 10, ARRAY['.pdf', '.jpg', '.png'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Lab Reports', 'Laboratory test results and reports', 'laboratory', true, 25, ARRAY['.pdf', '.jpg', '.png', '.tiff'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Prescriptions', 'Medical prescriptions and medication orders', 'pharmacy', true, 5, ARRAY['.pdf', '.jpg', '.png'], 1825),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Pharmacy Records', 'Pharmacy dispensing and medication records', 'pharmacy', true, 15, ARRAY['.pdf', '.jpg', '.png'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Bills & Invoices', 'Medical bills and insurance invoices', 'billing', true, 10, ARRAY['.pdf', '.jpg', '.png'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Medical Test Results', 'All medical test results (lab, imaging, etc.)', 'clinical', true, 50, ARRAY['.pdf', '.jpg', '.png', '.dicom', '.tiff'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Insurance Claims', 'Insurance claim documents and correspondence', 'insurance', true, 20, ARRAY['.pdf', '.jpg', '.png'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Patient Consent Forms', 'Medical consent and authorization forms', 'administrative', true, 5, ARRAY['.pdf', '.jpg', '.png'], 2555),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Medical Records', 'Complete patient medical records', 'clinical', true, 100, ARRAY['.pdf', '.jpg', '.png'], 2555);

-- 5.2 Seed document access rules
-- NOTE: Commented out because department table doesn't exist yet
-- INSERT INTO document_access_rules (id, tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition) VALUES
-- Insurance Health Card sharing
-- (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000',
--  (SELECT id FROM document_types WHERE name = 'Insurance Health Card'),
--  (SELECT id FROM department WHERE department_code = 'ADMIN'),
--  (SELECT id FROM department WHERE department_code = 'BILLING'), 'read', true, false, '{"purpose": "billing"}'),
-- (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000',
--  (SELECT id FROM document_types WHERE name = 'Insurance Health Card'),
--  (SELECT id FROM department WHERE department_code = 'ADMIN'),
--  (SELECT id FROM department WHERE department_code = 'INSURANCE'), 'read', true, false, '{"purpose": "claims"}'),

-- Lab Reports sharing
-- (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000',
--  (SELECT id FROM document_types WHERE name = 'Lab Reports'),
--  (SELECT id FROM department WHERE department_code = 'LAB'),
--  (SELECT id FROM department WHERE department_code = 'OPD'), 'read', true, false, '{"patient_consent": true}'),
-- (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000',
--  (SELECT id FROM document_types WHERE name = 'Lab Reports'),
--  (SELECT id FROM department WHERE department_code = 'LAB'),
--  (SELECT id FROM department WHERE department_code = 'IPD'), 'read', true, false, '{"patient_consent": true}'),

-- Prescriptions sharing
-- (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000',
--  (SELECT id FROM document_types WHERE name = 'Prescriptions'),
--  (SELECT id FROM department WHERE department_code = 'OPD'),
--  (SELECT id FROM department WHERE department_code = 'PHARMACY'), 'read', true, false, '{"medication_required": true}'),
-- (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000',
--  (SELECT id FROM document_types WHERE name = 'Prescriptions'),
--  (SELECT id FROM department WHERE department_code = 'IPD'),
--  (SELECT id FROM department WHERE department_code = 'PHARMACY'), 'read', true, false, '{"medication_required": true}');

-- =====================================================
-- PHASE 6: ADMIN CONFIGURATIONS
-- =====================================================

-- 6.1 Seed basic admin configurations
INSERT INTO admin_configurations (id, tenant_id, config_key, config_value, config_type, description) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'system.session_timeout', '{"value": 30, "unit": "minutes"}', 'system', 'User session timeout configuration'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'system.password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_digit": true, "require_special": true}', 'system', 'Password complexity requirements'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'system.audit_retention', '{"value": 7, "unit": "years"}', 'system', 'Audit log retention period'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'system.backup_frequency', '{"value": 24, "unit": "hours"}', 'system', 'Automated backup frequency'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'rbac.max_roles_per_user', '{"value": 5}', 'system', 'Maximum roles assignable to a single user'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'document_sharing.auto_approval_limit', '{"value": 10, "unit": "MB"}', 'system', 'File size limit for auto-approved sharing');

-- =====================================================
-- PHASE 7: VERIFICATION QUERIES
-- =====================================================

-- 7.1 Verification queries (run these after execution)
-- SELECT COUNT(*) as total_permissions FROM permissions; -- Should be 297
-- SELECT COUNT(*) as system_roles FROM roles WHERE is_system_role = true; -- Should be 20
-- SELECT COUNT(*) as document_types FROM document_types; -- Should be 9
-- SELECT COUNT(*) as role_permissions FROM role_permissions; -- Should be substantial
-- SELECT COUNT(*) as admin_configs FROM admin_configurations; -- Should be 6

-- =====================================================
-- IMPLEMENTATION COMPLETE
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RBAC & ABAC Implementation Complete!';
    RAISE NOTICE '✓ 297 permissions seeded';
    RAISE NOTICE '✓ 20 system roles created';
    RAISE NOTICE '✓ Role-permission mappings established';
    RAISE NOTICE '✓ Document sharing configured';
    RAISE NOTICE '✓ Admin configurations set';
    RAISE NOTICE '✓ RLS policies applied';
    RAISE NOTICE '✓ Indexes created for performance';
END $$;