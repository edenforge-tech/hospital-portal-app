-- ===================================================
-- HOSPITAL PORTAL - COMPLETE MASTER DATA SEED
-- Date: January 26, 2026
-- Description: Master data for ALL roles, departments, and permissions
--              with hospital-level customization support
-- ===================================================

-- ARCHITECTURE:
-- 1. Master Tables: role_definition, department, permission (system-wide baseline)
-- 2. Default Mappings: Roles have default departments & permissions
-- 3. Tenant-Level Customization: Hospitals can override via user-specific assignments
-- 4. Cross-Department Access: Supported via user_department_access table
-- 5. Permission Override: Supported via user_permission_override table

BEGIN;

-- ===================================================
-- STEP 1: CREATE CUSTOMIZATION/OVERRIDE TABLES
-- ===================================================

-- Table: role_department_mapping (Default department assignments for roles)
CREATE TABLE IF NOT EXISTS role_department_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(100) NOT NULL,
  department_code VARCHAR(100) NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_code, department_code)
);

CREATE INDEX IF NOT EXISTS idx_role_dept_role ON role_department_mapping(role_code);
CREATE INDEX IF NOT EXISTS idx_role_dept_dept ON role_department_mapping(department_code);

COMMENT ON TABLE role_department_mapping IS 'Default department assignments for roles (master baseline)';
COMMENT ON COLUMN role_department_mapping.is_primary IS 'True if this is the primary/home department for the role';

-- Table: user_department_access (Hospital-specific cross-department assignments)
-- NOTE: This table already exists, just ensure indexes are present
CREATE INDEX IF NOT EXISTS idx_user_dept_user ON user_department_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dept_tenant ON user_department_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_dept_status ON user_department_access(status, effective_to);

COMMENT ON TABLE user_department_access IS 'Hospital-specific cross-department access assignments (overrides defaults - EXISTING TABLE)';

-- Table: user_permission_override (Hospital-specific permission customizations)
CREATE TABLE IF NOT EXISTS user_permission_override (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  permission_code VARCHAR(255) NOT NULL,
  override_type VARCHAR(20) NOT NULL, -- grant, revoke
  granted_by_user_id UUID,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user_perm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_perm_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
  CONSTRAINT chk_override_type CHECK (override_type IN ('grant', 'revoke'))
);

CREATE INDEX IF NOT EXISTS idx_user_perm_user ON user_permission_override(user_id);
CREATE INDEX IF NOT EXISTS idx_user_perm_tenant ON user_permission_override(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_perm_active ON user_permission_override(is_active, valid_until);

COMMENT ON TABLE user_permission_override IS 'Hospital-specific permission grants/revokes (overrides role defaults)';
COMMENT ON COLUMN user_permission_override.override_type IS 'grant: Add extra permission, revoke: Remove default permission';

-- ===================================================
-- STEP 2: SEED ALL PERMISSIONS (~150 TOTAL)
-- ===================================================
-- Pattern: MODULE:RESOURCE:ACTION
-- Modules: admin, auth, billing, clinical, dashboard, license, reports

-- ===================== EXISTING PERMISSIONS (Already in DB) =====================
-- These should already exist, adding ON CONFLICT DO NOTHING for safety

-- Admin Module
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:USER:CREATE', 'Create Users', 'admin', 'user', 'create', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:USER:VIEW', 'View Users', 'admin', 'user', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:USER:EDIT', 'Edit Users', 'admin', 'user', 'edit', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:USER:DELETE', 'Delete Users', 'admin', 'user', 'delete', 'tenant', 'internal', false, 'critical', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:ROLE:ASSIGN', 'Assign Roles', 'admin', 'role', 'assign', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:BRANCH:CREATE', 'Create Branches', 'admin', 'branch', 'create', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:BRANCH:VIEW', 'View Branches', 'admin', 'branch', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DEPARTMENT:MANAGE', 'Manage Departments', 'admin', 'department', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SETTINGS:MANAGE', 'Manage Settings', 'admin', 'settings', 'manage', 'tenant', 'internal', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Clinical Module
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:PATIENT:CREATE', 'Create Patient', 'clinical', 'patient', 'create', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PATIENT:VIEW', 'View Patient Information', 'clinical', 'patient', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PATIENT:EDIT', 'Edit Patient Information', 'clinical', 'patient', 'edit', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:APPOINTMENT:CREATE', 'Create Appointments', 'clinical', 'appointment', 'create', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:APPOINTMENT:VIEW', 'View Appointments', 'clinical', 'appointment', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:APPOINTMENT:EDIT', 'Edit Appointments', 'clinical', 'appointment', 'edit', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:APPOINTMENT:CANCEL', 'Cancel Appointments', 'clinical', 'appointment', 'cancel', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:MEDICAL_RECORD:VIEW', 'View Medical Records', 'clinical', 'medical_record', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:MEDICAL_RECORD:CREATE', 'Create Medical Records', 'clinical', 'medical_record', 'create', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PRESCRIPTION:CREATE', 'Create Prescriptions', 'clinical', 'prescription', 'create', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PRESCRIPTION:VIEW', 'View Prescriptions', 'clinical', 'prescription', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PRESCRIPTION:VERIFY', 'Verify Prescriptions', 'clinical', 'prescription', 'verify', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Billing Module
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'BILLING:INVOICE:CREATE', 'Create Invoices', 'billing', 'invoice', 'create', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:INVOICE:VIEW', 'View Invoices', 'billing', 'invoice', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:PAYMENT:PROCESS', 'Process Payments', 'billing', 'payment', 'process', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:PAYMENT:VIEW', 'View Payments', 'billing', 'payment', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:INSURANCE:MANAGE', 'Manage Insurance', 'billing', 'insurance', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Reports Module
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'REPORTS:GENERATE', 'Generate Reports', 'reports', 'report', 'generate', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'REPORTS:VIEW', 'View Reports', 'reports', 'report', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'REPORTS:EXPORT', 'Export Reports', 'reports', 'report', 'export', 'tenant', 'internal', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Dashboard Module
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'DASHBOARD:VIEW', 'View Dashboard', 'dashboard', 'dashboard', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'DASHBOARD:ANALYTICS:VIEW', 'View Analytics', 'dashboard', 'analytics', 'view', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ===================== NEW PERMISSIONS FOR 25 NEW ROLES =====================

-- Anesthesia & Surgery Support
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:ANESTHESIA:MANAGE', 'Manage Anesthesia', 'clinical', 'anesthesia', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:ANESTHESIA:VIEW', 'View Anesthesia Records', 'clinical', 'anesthesia', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:SURGERY:VIEW', 'View Surgery Schedule', 'clinical', 'surgery', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:SURGERY:SUPPORT', 'Support Surgery', 'clinical', 'surgery', 'support', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:OT:ASSIST', 'Assist in OT', 'clinical', 'ot', 'assist', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Orthoptics & Vision Therapy
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:ORTHOPTICS:MANAGE', 'Manage Orthoptics', 'clinical', 'orthoptics', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:VISION_THERAPY:MANAGE', 'Manage Vision Therapy', 'clinical', 'vision_therapy', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:VISION_THERAPY:VIEW', 'View Vision Therapy', 'clinical', 'vision_therapy', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Contact Lens & Refraction
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:CONTACT_LENS:MANAGE', 'Manage Contact Lens Fitting', 'clinical', 'contact_lens', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:CONTACT_LENS:VIEW', 'View Contact Lens Records', 'clinical', 'contact_lens', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:REFRACTION:VIEW', 'View Refraction Data', 'clinical', 'refraction', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Low Vision & Rehabilitation
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:LOW_VISION:MANAGE', 'Manage Low Vision Services', 'clinical', 'low_vision', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:REHABILITATION:MANAGE', 'Manage Rehabilitation', 'clinical', 'rehabilitation', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Social Services & Charity Care
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:CHARITY_CARE:MANAGE', 'Manage Charity Care', 'admin', 'charity_care', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:FINANCIAL_COUNSELING:MANAGE', 'Manage Financial Counseling', 'admin', 'financial_counseling', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SOCIAL_SERVICES:MANAGE', 'Manage Social Services', 'admin', 'social_services', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Eye Camp & Outreach
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:CAMP:MANAGE', 'Manage Eye Camps', 'admin', 'camp', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:OUTREACH:MANAGE', 'Manage Outreach Programs', 'admin', 'outreach', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:LOGISTICS:MANAGE', 'Manage Logistics', 'admin', 'logistics', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Screening & Imaging
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:SCREENING:PERFORM', 'Perform Screening', 'clinical', 'screening', 'perform', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:SCREENING:VIEW', 'View Screening Results', 'clinical', 'screening', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:IMAGING:CAPTURE', 'Capture Medical Images', 'clinical', 'imaging', 'capture', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:FUNDUS_PHOTO:MANAGE', 'Manage Fundus Photography', 'clinical', 'fundus_photo', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:ANGIOGRAPHY:PERFORM', 'Perform Angiography', 'clinical', 'angiography', 'perform', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:IMAGING:MANAGE', 'Manage Imaging', 'admin', 'imaging', 'manage', 'tenant', 'confidential', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Electrophysiology
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:ELECTROPHYSIOLOGY:PERFORM', 'Perform Electrophysiology Tests', 'clinical', 'electrophysiology', 'perform', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:ERG:CONDUCT', 'Conduct ERG', 'clinical', 'erg', 'conduct', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:VEP:CONDUCT', 'Conduct VEP', 'clinical', 'vep', 'conduct', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Prosthetics & Genetic Counseling
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:PROSTHETICS:FIT', 'Fit Ocular Prosthetics', 'clinical', 'prosthetics', 'fit', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PROSTHETICS:MANUFACTURE', 'Manufacture Prosthetics', 'clinical', 'prosthetics', 'manufacture', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:GENETIC_COUNSELING:CONDUCT', 'Conduct Genetic Counseling', 'clinical', 'genetic_counseling', 'conduct', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:FAMILY_HISTORY:ANALYZE', 'Analyze Family History', 'clinical', 'family_history', 'analyze', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- CSSD & Quality
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:STERILIZATION:MANAGE', 'Manage Sterilization', 'admin', 'sterilization', 'manage', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:EQUIPMENT:TRACK', 'Track Equipment', 'admin', 'equipment', 'track', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:INFECTION_CONTROL:COMPLY', 'Infection Control Compliance', 'admin', 'infection_control', 'comply', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:QUALITY:AUDIT', 'Perform Quality Audits', 'admin', 'quality', 'audit', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:ACCREDITATION:MANAGE', 'Manage Accreditation', 'admin', 'accreditation', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:COMPLIANCE:TRACK', 'Track Compliance', 'admin', 'compliance', 'track', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DOCUMENTATION:MANAGE', 'Manage Documentation', 'admin', 'documentation', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DOCUMENTATION:QUALITY_CHECK', 'Quality Check Documentation', 'admin', 'documentation', 'quality_check', 'tenant', 'internal', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- IOL & Biometry
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:IOL:MANAGE', 'Manage IOL Inventory', 'admin', 'iol', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:IOL_CALCULATION:PERFORM', 'Perform IOL Calculations', 'admin', 'iol_calculation', 'perform', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:BIOMETRY:VIEW', 'View Biometry Data', 'clinical', 'biometry', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Optical & Eyewear
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'BILLING:OPTICAL:DISPENSE', 'Dispense Optical Products', 'billing', 'optical', 'dispense', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:EYEWEAR:FIT', 'Fit Eyewear', 'billing', 'eyewear', 'fit', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Medical Records & HIM
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:MEDICAL_RECORDS:VIEW', 'View Medical Records (Admin)', 'admin', 'medical_records', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:MEDICAL_RECORDS:AUDIT', 'Audit Medical Records', 'admin', 'medical_records', 'audit', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:TRANSCRIPTION:MANAGE', 'Manage Transcription', 'admin', 'transcription', 'manage', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DICTATION:TRANSCRIBE', 'Transcribe Dictation', 'admin', 'dictation', 'transcribe', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:HIM:MANAGE', 'Manage Health Information', 'admin', 'him', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Medical Coding & Billing
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'BILLING:MEDICAL_CODING:PERFORM', 'Perform Medical Coding', 'billing', 'medical_coding', 'perform', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:ICD_CODING:MANAGE', 'Manage ICD Coding', 'billing', 'icd_coding', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:CLAIMS:PROCESS', 'Process Insurance Claims', 'billing', 'claims', 'process', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- IT Support & HMIS
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:SYSTEM:SUPPORT', 'Provide System Support', 'admin', 'system', 'support', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:HMIS:MANAGE', 'Manage HMIS', 'admin', 'hmis', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:USER_SUPPORT:PROVIDE', 'Provide User Support', 'admin', 'user_support', 'provide', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Clinical Photography & Telemedicine
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:CLINICAL_PHOTOGRAPHY:PERFORM', 'Perform Clinical Photography', 'clinical', 'clinical_photography', 'perform', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:EXTERNAL_EYE:PHOTOGRAPH', 'Photograph External Eye', 'clinical', 'external_eye', 'photograph', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:TELEMEDICINE:COORDINATE', 'Coordinate Telemedicine', 'admin', 'telemedicine', 'coordinate', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:REMOTE_CONSULTATION:MANAGE', 'Manage Remote Consultations', 'clinical', 'remote_consultation', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Inventory & Stores
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:INVENTORY:MANAGE', 'Manage Inventory', 'admin', 'inventory', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:STOCK:TRACK', 'Track Stock', 'admin', 'stock', 'track', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:PURCHASE_REQUISITION:CREATE', 'Create Purchase Requisition', 'admin', 'purchase_requisition', 'create', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SUPPLY:MANAGE', 'Manage Supply Chain', 'admin', 'supply', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SURGICAL_INSTRUMENTS:MANAGE', 'Manage Surgical Instruments', 'admin', 'surgical_instruments', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Ambulance & Transport
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:AMBULANCE:OPERATE', 'Operate Ambulance', 'admin', 'ambulance', 'operate', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:EMERGENCY_TRANSPORT:MANAGE', 'Manage Emergency Transport', 'admin', 'emergency_transport', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PATIENT:TRANSPORT', 'Transport Patients', 'clinical', 'patient', 'transport', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Diet & Nutrition
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:DIET:PLAN', 'Plan Diet', 'clinical', 'diet', 'plan', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:NUTRITION:COUNSEL', 'Nutrition Counseling', 'clinical', 'nutrition', 'counsel', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:DIABETIC_DIET:MANAGE', 'Manage Diabetic Diet', 'clinical', 'diabetic_diet', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ===================================================
-- STEP 3: ADD 25 NEW ROLES (WITH DEFAULT PERMISSIONS)
-- ===================================================
-- These are added to the existing 77 roles = 102 total

-- Note: Existing 77 roles already have their default_permissions set
-- This section only adds the 25 new roles

INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions,
  is_clinical, is_active
) VALUES
-- 1. Anesthesiologist
(gen_random_uuid(), 'ANESTHESIOLOGIST', 'Anesthesiologist / Anesthetist', 'Clinical Support', 'hospital', 30,
 NULL, true, '["MD Anesthesia", "DA (Diploma in Anesthesiology)", "DNB Anesthesia"]'::jsonb, true,
 '["BLS Certification", "ACLS Certification"]'::jsonb, true,
 '["CLINICAL:SURGERY:VIEW", "CLINICAL:PATIENT:VIEW", "CLINICAL:ANESTHESIA:MANAGE", "CLINICAL:MEDICAL_RECORD:VIEW", "CLINICAL:ANESTHESIA:VIEW"]'::jsonb,
 true, true),

-- 2. Orthoptist
(gen_random_uuid(), 'ORTHOPTIST', 'Orthoptist / Vision Therapist', 'Clinical Support', 'department', 50,
 'PEDIATRIC_OPHTHALMOLOGIST', true, '["B.Sc Optometry with Orthoptics", "Diploma in Orthoptics"]'::jsonb, false, NULL, true,
 '["CLINICAL:PATIENT:VIEW", "CLINICAL:ORTHOPTICS:MANAGE", "CLINICAL:VISION_THERAPY:MANAGE", "CLINICAL:MEDICAL_RECORD:VIEW", "CLINICAL:VISION_THERAPY:VIEW"]'::jsonb,
 true, true),

-- 3. Contact Lens Specialist
(gen_random_uuid(), 'CONTACT_LENS_SPECIALIST', 'Contact Lens Specialist', 'Optometry', 'department', 55,
 'SR_OPTOMETRIST', true, '["B.Sc Optometry", "M.Optom (Contact Lens)"]'::jsonb, true,
 '["Advanced Contact Lens Fitting", "RGP Lens Fitting"]'::jsonb, true,
 '["CLINICAL:PATIENT:VIEW", "CLINICAL:CONTACT_LENS:MANAGE", "CLINICAL:REFRACTION:VIEW", "BILLING:OPTICAL:DISPENSE", "CLINICAL:CONTACT_LENS:VIEW"]'::jsonb,
 true, true),

-- 4. Low Vision Therapist
(gen_random_uuid(), 'LOW_VISION_THERAPIST', 'Low Vision Therapist / Rehabilitation Specialist', 'Clinical Support', 'department', 52,
 'SR_OPTOMETRIST', true, '["B.Sc Optometry", "Diploma in Low Vision Rehab"]'::jsonb, false, NULL, true,
 '["CLINICAL:PATIENT:VIEW", "CLINICAL:LOW_VISION:MANAGE", "CLINICAL:REHABILITATION:MANAGE", "CLINICAL:MEDICAL_RECORD:VIEW"]'::jsonb,
 true, true),

-- 5. Medical Social Worker
(gen_random_uuid(), 'SOCIAL_WORKER', 'Medical Social Worker', 'Patient Services', 'hospital', 60,
 NULL, false, '["MSW (Medical Social Work)", "BSW"]'::jsonb, false, NULL, true,
 '["CLINICAL:PATIENT:VIEW", "ADMIN:CHARITY_CARE:MANAGE", "ADMIN:FINANCIAL_COUNSELING:MANAGE", "ADMIN:SOCIAL_SERVICES:MANAGE"]'::jsonb,
 false, true),

-- 6. Eye Camp Coordinator
(gen_random_uuid(), 'CAMP_COORDINATOR', 'Eye Camp Coordinator', 'Operations & Facilities', 'hospital', 65,
 'OPERATIONS_MANAGER', false, NULL, false, NULL, true,
 '["ADMIN:CAMP:MANAGE", "ADMIN:OUTREACH:MANAGE", "CLINICAL:PATIENT:VIEW", "ADMIN:LOGISTICS:MANAGE", "CLINICAL:APPOINTMENT:CREATE"]'::jsonb,
 false, true),

-- 7. Retinopathy Screener
(gen_random_uuid(), 'RETINOPATHY_SCREENER', 'Diabetic Retinopathy Screener', 'Diagnostic & Technical Support', 'department', 58,
 'IMAGING_TECHNICIAN', true, '["Diploma in Ophthalmic Technology", "Certificate in Retinal Imaging"]'::jsonb, true,
 '["Diabetic Retinopathy Screening Certification"]'::jsonb, true,
 '["CLINICAL:SCREENING:PERFORM", "CLINICAL:PATIENT:VIEW", "CLINICAL:IMAGING:CAPTURE", "REPORTS:GENERATE", "CLINICAL:SCREENING:VIEW"]'::jsonb,
 true, true),

-- 8. Fundus Photographer
(gen_random_uuid(), 'FUNDUS_PHOTOGRAPHER', 'Fundus Photographer / Imaging Specialist', 'Diagnostic & Technical Support', 'department', 57,
 'IMAGING_TECHNICIAN', true, '["Diploma in Ophthalmic Technology", "B.Sc Optometry"]'::jsonb, true,
 '["Fundus Photography Certification", "Fluorescein Angiography Training"]'::jsonb, true,
 '["CLINICAL:IMAGING:CAPTURE", "CLINICAL:FUNDUS_PHOTO:MANAGE", "CLINICAL:ANGIOGRAPHY:PERFORM", "CLINICAL:PATIENT:VIEW"]'::jsonb,
 true, true),

-- 9. Electrophysiology Technician
(gen_random_uuid(), 'ELECTROPHYSIOLOGY_TECH', 'Electrophysiology Technician (ERG/VEP/EOG)', 'Diagnostic & Technical Support', 'department', 59,
 'IMAGING_TECHNICIAN', true, '["Diploma in Ophthalmic Technology", "B.Sc Medical Technology"]'::jsonb, true,
 '["Electrophysiology Testing Certification"]'::jsonb, true,
 '["CLINICAL:ELECTROPHYSIOLOGY:PERFORM", "CLINICAL:ERG:CONDUCT", "CLINICAL:VEP:CONDUCT", "CLINICAL:PATIENT:VIEW", "REPORTS:GENERATE"]'::jsonb,
 true, true),

-- 10. Ocular Prostheticist
(gen_random_uuid(), 'OCULAR_PROSTHETICIST', 'Ocular Prosthetics Specialist', 'Clinical Support', 'department', 62,
 NULL, true, '["Diploma in Ocular Prosthetics", "Certificate in Artificial Eye Fabrication"]'::jsonb, true,
 '["Ocular Prosthetics Fitting Certification"]'::jsonb, true,
 '["CLINICAL:PROSTHETICS:FIT", "CLINICAL:PROSTHETICS:MANUFACTURE", "CLINICAL:PATIENT:VIEW", "CLINICAL:MEDICAL_RECORD:VIEW"]'::jsonb,
 true, true),

-- 11. Genetic Counselor
(gen_random_uuid(), 'GENETIC_COUNSELOR', 'Genetic Counselor (Ophthalmology)', 'Clinical Support', 'department', 63,
 NULL, true, '["M.Sc Genetic Counseling", "Certificate in Ophthalmic Genetics"]'::jsonb, true,
 '["Board Certified Genetic Counselor"]'::jsonb, true,
 '["CLINICAL:GENETIC_COUNSELING:CONDUCT", "CLINICAL:PATIENT:VIEW", "CLINICAL:FAMILY_HISTORY:ANALYZE", "CLINICAL:MEDICAL_RECORD:VIEW"]'::jsonb,
 true, true),

-- 12. CSSD Technician
(gen_random_uuid(), 'CSSD_TECHNICIAN', 'CSSD Technician / Sterile Supply Officer', 'Operations & Facilities', 'department', 68,
 'OPERATIONS_MANAGER', false, '["Diploma in CSSD Technology", "Certificate in Sterilization"]'::jsonb, true,
 '["CSSD Certification", "Infection Control Training"]'::jsonb, true,
 '["ADMIN:STERILIZATION:MANAGE", "ADMIN:EQUIPMENT:TRACK", "ADMIN:INFECTION_CONTROL:COMPLY", "ADMIN:INVENTORY:MANAGE"]'::jsonb,
 false, true),

-- 13. Accreditation Officer
(gen_random_uuid(), 'ACCREDITATION_OFFICER', 'NABH/JCI Accreditation Officer', 'Medical Records & Quality', 'hospital', 45,
 'QUALITY_ASSURANCE_OFFICER', false, '["MBA Healthcare", "PGDHA"]'::jsonb, true,
 '["NABH Auditor", "ISO 9001 Internal Auditor"]'::jsonb, true,
 '["ADMIN:QUALITY:AUDIT", "ADMIN:ACCREDITATION:MANAGE", "ADMIN:COMPLIANCE:TRACK", "REPORTS:GENERATE", "ADMIN:DOCUMENTATION:MANAGE"]'::jsonb,
 false, true),

-- 14. IOL Coordinator
(gen_random_uuid(), 'IOL_COORDINATOR', 'IOL Coordinator', 'Diagnostic & Technical Support', 'department', 56,
 'BIOMETRY_TECHNICIAN', true, '["Diploma in Ophthalmic Technology", "Certificate in IOL Calculations"]'::jsonb, true,
 '["IOL Master Certification", "Advanced Biometry Training"]'::jsonb, true,
 '["ADMIN:IOL:MANAGE", "ADMIN:INVENTORY:MANAGE", "CLINICAL:BIOMETRY:VIEW", "CLINICAL:PATIENT:VIEW", "ADMIN:IOL_CALCULATION:PERFORM"]'::jsonb,
 true, true),

-- 15. OT Technician
(gen_random_uuid(), 'OT_TECHNICIAN', 'OT Technician / Scrub Nurse', 'Nursing & Clinical Support', 'department', 54,
 'REGISTERED_NURSE_OT', true, '["GNM", "B.Sc Nursing", "Diploma in OT Technology"]'::jsonb, true,
 '["OT Technician Certification", "Infection Control Training"]'::jsonb, true,
 '["CLINICAL:OT:ASSIST", "ADMIN:SURGICAL_INSTRUMENTS:MANAGE", "CLINICAL:PATIENT:VIEW", "CLINICAL:SURGERY:SUPPORT"]'::jsonb,
 true, true),

-- 16. Optician
(gen_random_uuid(), 'OPTICIAN', 'Optician (Licensed Optical Dispenser)', 'Pharmacy & Optical', 'department', 61,
 'OPTICAL_MANAGER', true, '["Diploma in Opticianry", "Certificate in Optical Dispensing"]'::jsonb, true,
 '["Licensed Optician Certification"]'::jsonb, true,
 '["BILLING:OPTICAL:DISPENSE", "CLINICAL:PRESCRIPTION:VERIFY", "BILLING:EYEWEAR:FIT", "CLINICAL:PATIENT:VIEW"]'::jsonb,
 false, true),

-- 17. Medical Transcriptionist
(gen_random_uuid(), 'MEDICAL_TRANSCRIPTIONIST', 'Medical Transcriptionist', 'Medical Records & Quality', 'hospital', 70,
 NULL, false, '["Certificate in Medical Transcription", "Diploma in Healthcare Documentation"]'::jsonb, true,
 '["Medical Transcription Certification"]'::jsonb, true,
 '["ADMIN:TRANSCRIPTION:MANAGE", "ADMIN:MEDICAL_RECORDS:VIEW", "ADMIN:DICTATION:TRANSCRIBE", "ADMIN:DOCUMENTATION:MANAGE"]'::jsonb,
 false, true),

-- 18. HMIS Officer
(gen_random_uuid(), 'HMIS_OFFICER', 'HMIS Officer / IT Support (Healthcare)', 'Operations & Facilities', 'hospital', 66,
 NULL, false, '["B.Tech Computer Science", "Diploma in Healthcare IT"]'::jsonb, false, NULL, true,
 '["ADMIN:SYSTEM:SUPPORT", "ADMIN:HMIS:MANAGE", "ADMIN:USER_SUPPORT:PROVIDE", "REPORTS:GENERATE"]'::jsonb,
 false, true),

-- 19. Clinical Photographer
(gen_random_uuid(), 'CLINICAL_PHOTOGRAPHER', 'Clinical Photographer (External Eye Photography)', 'Diagnostic & Technical Support', 'department', 64,
 NULL, true, '["Diploma in Medical Photography", "Certificate in Ophthalmic Photography"]'::jsonb, false, NULL, true,
 '["CLINICAL:CLINICAL_PHOTOGRAPHY:PERFORM", "CLINICAL:EXTERNAL_EYE:PHOTOGRAPH", "CLINICAL:PATIENT:VIEW", "ADMIN:IMAGING:MANAGE"]'::jsonb,
 true, true),

-- 20. Tele-Ophthalmology Coordinator
(gen_random_uuid(), 'TELEOPHTH_COORDINATOR', 'Tele-Ophthalmology Coordinator', 'Front Desk & Patient Services', 'department', 67,
 'APPOINTMENT_COORDINATOR', false, NULL, true, '["Telemedicine Coordinator Certification"]'::jsonb, true,
 '["ADMIN:TELEMEDICINE:COORDINATE", "CLINICAL:REMOTE_CONSULTATION:MANAGE", "CLINICAL:APPOINTMENT:CREATE", "CLINICAL:PATIENT:VIEW"]'::jsonb,
 false, true),

-- 21. Medical Coder
(gen_random_uuid(), 'MEDICAL_CODER', 'Medical Coder (ICD-10/CPT)', 'Medical Records & Quality', 'hospital', 69,
 'MEDICAL_RECORDS_MANAGER', false, NULL, true, '["CPC Certification", "CCS Certification"]'::jsonb, true,
 '["BILLING:MEDICAL_CODING:PERFORM", "BILLING:ICD_CODING:MANAGE", "BILLING:CLAIMS:PROCESS", "ADMIN:MEDICAL_RECORDS:VIEW"]'::jsonb,
 false, true),

-- 22. HIM Specialist
(gen_random_uuid(), 'HIM_SPECIALIST', 'Health Information Management Specialist', 'Medical Records & Quality', 'hospital', 71,
 'MEDICAL_RECORDS_MANAGER', false, '["Bachelor in HIM", "PG Diploma in HIM"]'::jsonb, true,
 '["RHIA Certification"]'::jsonb, true,
 '["ADMIN:HIM:MANAGE", "ADMIN:MEDICAL_RECORDS:AUDIT", "ADMIN:DOCUMENTATION:QUALITY_CHECK", "ADMIN:COMPLIANCE:TRACK"]'::jsonb,
 false, true),

-- 23. Stores Officer
(gen_random_uuid(), 'STORES_OFFICER', 'Stores Officer / Inventory Manager', 'Operations & Facilities', 'hospital', 72,
 'OPERATIONS_MANAGER', false, NULL, false, NULL, true,
 '["ADMIN:INVENTORY:MANAGE", "ADMIN:STOCK:TRACK", "ADMIN:PURCHASE_REQUISITION:CREATE", "ADMIN:SUPPLY:MANAGE"]'::jsonb,
 false, true),

-- 24. Ambulance Driver
(gen_random_uuid(), 'AMBULANCE_DRIVER', 'Ambulance Driver / Emergency Driver', 'Operations & Facilities', 'hospital', 73,
 'OPERATIONS_MANAGER', true, '["Valid Driving License (Heavy Vehicle)", "Ambulance Driving License"]'::jsonb, true,
 '["First Aid Certification", "BLS"]'::jsonb, true,
 '["ADMIN:AMBULANCE:OPERATE", "ADMIN:EMERGENCY_TRANSPORT:MANAGE", "CLINICAL:PATIENT:TRANSPORT"]'::jsonb,
 false, true),

-- 25. Dietitian
(gen_random_uuid(), 'DIETITIAN', 'Dietitian / Clinical Nutritionist', 'Clinical Support', 'hospital', 74,
 NULL, true, '["M.Sc Nutrition & Dietetics", "B.Sc Nutrition", "PG Diploma in Dietetics"]'::jsonb, true,
 '["Registered Dietitian Certification"]'::jsonb, true,
 '["CLINICAL:DIET:PLAN", "CLINICAL:NUTRITION:COUNSEL", "CLINICAL:PATIENT:VIEW", "CLINICAL:DIABETIC_DIET:MANAGE"]'::jsonb,
 true, true)

ON CONFLICT (role_code) DO NOTHING;

-- ===================================================
-- STEP 4: SEED ROLE → DEPARTMENT DEFAULT MAPPINGS
-- ===================================================
-- Maps each role to its primary department(s)

INSERT INTO role_department_mapping (role_code, department_code, is_primary) VALUES
-- New Roles (25)
('ANESTHESIOLOGIST', 'OPERATION_THEATRE', true),
('ORTHOPTIST', 'ORTHOPTICS', true),
('CONTACT_LENS_SPECIALIST', 'OPTOMETRY', true),
('LOW_VISION_THERAPIST', 'LOW_VISION_REHAB', true),
('SOCIAL_WORKER', 'SOCIAL_SERVICES', true),
('CAMP_COORDINATOR', 'CAMP_COORDINATION', true),
('RETINOPATHY_SCREENER', 'RETINOPATHY_SCREENING', true),
('FUNDUS_PHOTOGRAPHER', 'FUNDUS_IMAGING', true),
('ELECTROPHYSIOLOGY_TECH', 'ELECTROPHYSIOLOGY', true),
('OCULAR_PROSTHETICIST', 'PROSTHETIC_EYE', true),
('GENETIC_COUNSELOR', 'GENETIC_COUNSELING', true),
('CSSD_TECHNICIAN', 'CSSD', true),
('ACCREDITATION_OFFICER', 'NABH_ACCREDITATION', true),
('IOL_COORDINATOR', 'IOL_INVENTORY', true),
('OT_TECHNICIAN', 'OPERATION_THEATRE', true),
('OPTICIAN', 'OPTICAL', true),
('MEDICAL_TRANSCRIPTIONIST', 'MEDICAL_RECORDS', true),
('HMIS_OFFICER', 'IT_SUPPORT', true),
('CLINICAL_PHOTOGRAPHER', 'PHOTOGRAPHY', true),
('TELEOPHTH_COORDINATOR', 'TELE_OPHTHALMOLOGY', true),
('MEDICAL_CODER', 'MEDICAL_RECORDS', true),
('HIM_SPECIALIST', 'MEDICAL_RECORDS', true),
('STORES_OFFICER', 'STORES', true),
('AMBULANCE_DRIVER', 'AMBULANCE_SERVICES', true),
('DIETITIAN', 'DIET_NUTRITION', true),

-- Existing Roles (sample - using actual role codes from DB)
('OPHTHALMOLOGIST', 'OPHTHALMOLOGY', true),
('RETINA_SPECIALIST', 'RETINA', true),
('CORNEA_SPECIALIST', 'CORNEA', true),
('GLAUCOMA_SPECIALIST', 'GLAUCOMA', true),
('PEDIATRIC_OPHTHALMOLOGIST', 'PEDIATRIC_OPHTHALMOLOGY', true),
('CATARACT_SURGEON', 'OPHTHALMOLOGY', true),
('OCULOPLASTIC_SURGEON', 'OCULOPLASTY', true),
('NEURO_OPHTHALMOLOGIST', 'NEURO_OPHTHALMOLOGY', true),
('UVEA_SPECIALIST', 'UVEITIS', true),
('OPTOMETRIST', 'OPTOMETRY', true),
('SR_OPTOMETRIST', 'OPTOMETRY', true),
('REGISTERED_NURSE', 'NURSING', true),
('REGISTERED_NURSE_OT', 'OPERATION_THEATRE', true),
('NURSING_ASSISTANT', 'NURSING', true),
('CHIEF_NURSING_OFFICER', 'NURSING', true),
('SR_NURSING_SUPERVISOR', 'NURSING', true),
('RECEPTIONIST', 'FRONT_DESK', true),
('FRONT_DESK_MANAGER', 'FRONT_DESK', true),
('APPOINTMENT_COORDINATOR', 'FRONT_DESK', true),
('BILLING_EXECUTIVE', 'BILLING', true),
('BILLING_MANAGER', 'BILLING', true),
('CASHIER', 'BILLING', true),
('PHARMACIST', 'PHARMACY', true),
('CHIEF_PHARMACIST', 'PHARMACY', true),
('PHARMACY_ASSISTANT', 'PHARMACY', true),
('OPTICAL_MANAGER', 'OPTICAL', true),
('OPTICAL_ASSISTANT', 'OPTICAL', true),
('LAB_TECHNICIAN', 'LABORATORY', true),
('IMAGING_TECHNICIAN', 'IMAGING', true),
('BIOMETRY_TECHNICIAN', 'BIOMETRY', true),
('VISUAL_FIELD_TECHNICIAN', 'VISUAL_FIELDS', true),
('PATIENT_COUNSELLOR', 'COUNSELING', true),
('REFRACTION_COUNSELLOR', 'COUNSELING', true),
('SURGICAL_COUNSELLOR', 'COUNSELING', true),
('COUNSELLING_MANAGER', 'COUNSELING', true),
('INSURANCE_COORDINATOR', 'INSURANCE_TPA', true),
('TPA_LIAISON', 'INSURANCE_TPA', true),
('INSURANCE_MANAGER', 'INSURANCE_TPA', true),
('CLAIM_PROCESSOR', 'INSURANCE_TPA', true),
('MEDICAL_RECORDS_OFFICER', 'MEDICAL_RECORDS', true),
('MEDICAL_RECORDS_MANAGER', 'MEDICAL_RECORDS', true),
('QUALITY_ASSURANCE_OFFICER', 'QUALITY_ASSURANCE', true),
('INFECTION_CONTROL_NURSE', 'INFECTION_CONTROL', true),
('OPERATIONS_MANAGER', 'OPERATIONS', true),
('HR_MANAGER', 'HR', true),
('HR_EXECUTIVE', 'HR', true),
('HR_RECRUITER', 'HR', true),
('FINANCE_MANAGER', 'FINANCE', true),
('ACCOUNTS_MANAGER', 'ACCOUNTS', true),
('PAYROLL_OFFICER', 'HR', true),
('ATTENDANCE_LEAVE_OFFICER', 'HR', true),
('PURCHASE_OFFICER', 'PURCHASE', true),
('BIOMEDICAL_ENGINEER', 'BIOMEDICAL', true),
('HOUSEKEEPING_SUPERVISOR', 'HOUSEKEEPING', true),
('SECURITY_OFFICER', 'SECURITY', true),
('HOSPITAL_ADMINISTRATOR', 'ADMINISTRATION', true),
('HOSPITAL_DIRECTOR', 'ADMINISTRATION', true),
('MEDICAL_DIRECTOR', 'ADMINISTRATION', true),
('CHIEF_OPHTHALMOLOGIST', 'OPHTHALMOLOGY', true),
('SR_OPHTHALMOLOGIST', 'OPHTHALMOLOGY', true),
('JUNIOR_OPHTHALMOLOGIST', 'OPHTHALMOLOGY', true),
('VISITING_CONSULTANT', 'OPHTHALMOLOGY', true),
('INTERN', 'OPHTHALMOLOGY', true),
('HOSPITAL_COMPLIANCE_OFFICER', 'COMPLIANCE', true),
('PATIENT_RELATIONS_OFFICER', 'PATIENT_RELATIONS', true),
('CORPORATE_COORDINATOR', 'BUSINESS_DEVELOPMENT', true),
('OPHTHALMIC_ASSISTANT', 'OPHTHALMOLOGY', true),
('AUDITOR', 'FINANCE', true),
('EXTERNAL_AUDITOR', 'QUALITY_ASSURANCE', true)

ON CONFLICT (role_code, department_code) DO NOTHING;

-- ===================================================
-- STEP 5: ADD MISSING DEPARTMENTS FOR ALL TENANTS
-- ===================================================

DO $$
DECLARE
  dept_record RECORD;
  tenant_record RECORD;
  admin_user_id UUID;
BEGIN
  -- Get admin user (or first user)
  SELECT id INTO admin_user_id FROM users WHERE email LIKE '%admin%' LIMIT 1;
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM users LIMIT 1;
  END IF;

  -- Define all 19 new departments
  FOR dept_record IN 
    SELECT * FROM (VALUES
      ('GENETIC_COUNSELING', 'Genetic Counseling (Inherited Eye Diseases)', 'Clinical'),
      ('TELE_OPHTHALMOLOGY', 'Tele-Ophthalmology Services', 'Clinical'),
      ('ORTHOPTICS', 'Orthoptics & Vision Therapy', 'Clinical'),
      ('RETINOPATHY_SCREENING', 'Diabetic Retinopathy Screening', 'Diagnostic'),
      ('ELECTROPHYSIOLOGY', 'Electrophysiology Lab (ERG/VEP/EOG)', 'Diagnostic'),
      ('PROSTHETIC_EYE', 'Ocular Prosthetics', 'Clinical'),
      ('FUNDUS_IMAGING', 'Fundus Photography & Imaging', 'Diagnostic'),
      ('EYE_BANK', 'Eye Bank & Cornea Donation Center', 'Support Services'),
      ('CAMP_COORDINATION', 'Eye Camp Coordination', 'Administrative'),
      ('LOW_VISION_REHAB', 'Low Vision Rehabilitation', 'Clinical'),
      ('SOCIAL_SERVICES', 'Social Services / Charity Care', 'Support Services'),
      ('CSSD', 'Central Sterile Supply Department', 'Support Services'),
      ('NABH_ACCREDITATION', 'NABH/JCI Accreditation Cell', 'Administrative'),
      ('BUSINESS_DEVELOPMENT', 'Business Development / Corporate Sales', 'Administrative'),
      ('IOL_INVENTORY', 'IOL Inventory & Management', 'Support Services'),
      ('STORES', 'Stores & Inventory Management', 'Support Services'),
      ('AMBULANCE_SERVICES', 'Ambulance & Emergency Transport', 'Support Services'),
      ('DIET_NUTRITION', 'Diet & Nutrition Services', 'Clinical'),
      ('PHOTOGRAPHY', 'Clinical Photography Department', 'Diagnostic')
    ) AS dept(code, name, type)
  LOOP
    -- Insert for each tenant
    FOR tenant_record IN SELECT id FROM tenant
    LOOP
      INSERT INTO department (
        id, tenant_id, department_code, department_name, department_type,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id
      )
      SELECT 
        gen_random_uuid(),
        tenant_record.id,
        dept_record.code,
        dept_record.name,
        dept_record.type,
        'active',
        NOW(),
        NOW(),
        admin_user_id,
        admin_user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM department 
        WHERE department_code = dept_record.code 
        AND tenant_id = tenant_record.id
      );
    END LOOP;
  END LOOP;
END $$;

-- ===================================================
-- STEP 6: AUDIT LOG & VERIFICATION
-- ===================================================

-- Note: audit_log table structure differs - using compatible INSERT
-- Skipping audit log since it requires tenant_id and user context

-- INSERT INTO audit_log (action, resource_type, description, created_at, tenant_id)
-- VALUES 
--   ('MASTER_DATA_SEED', 'permission', 'Seeded ~150 permissions for complete eye hospital operations', NOW(), (SELECT id FROM tenant LIMIT 1)),
--   ('MASTER_DATA_SEED', 'role_definition', 'Seeded 25 new roles (total 102) with default permissions', NOW(), (SELECT id FROM tenant LIMIT 1)),
--   ('MASTER_DATA_SEED', 'department', 'Seeded 19 new departments for all tenants', NOW(), (SELECT id FROM tenant LIMIT 1)),
--   ('MASTER_DATA_SEED', 'role_department_mapping', 'Created default role→department mappings', NOW(), (SELECT id FROM tenant LIMIT 1));

-- Verification
DO $$
DECLARE
  perm_count INTEGER;
  role_count INTEGER;
  dept_count INTEGER;
  mapping_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count FROM permission;
  SELECT COUNT(*) INTO role_count FROM role_definition WHERE is_active = true;
  SELECT COUNT(DISTINCT department_code) INTO dept_count FROM department;
  SELECT COUNT(*) INTO mapping_count FROM role_department_mapping;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE 'MASTER DATA SEED COMPLETE';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total Permissions: %', perm_count;
  RAISE NOTICE 'Total Active Roles: %', role_count;
  RAISE NOTICE 'Unique Department Types: %', dept_count;
  RAISE NOTICE 'Role→Department Mappings: %', mapping_count;
  RAISE NOTICE '';
  RAISE NOTICE 'CUSTOMIZATION TABLES CREATED:';
  RAISE NOTICE '✓ role_department_mapping (default assignments)';
  RAISE NOTICE '✓ user_department_access (hospital-specific cross-department access)';
  RAISE NOTICE '✓ user_permission_override (hospital-specific permission grants/revokes)';
  RAISE NOTICE '';
  RAISE NOTICE 'Hospitals can now:';
  RAISE NOTICE '1. Assign users to multiple departments via user_department_access';
  RAISE NOTICE '2. Grant extra permissions via user_permission_override (type=grant)';
  RAISE NOTICE '3. Revoke default permissions via user_permission_override (type=revoke)';
  RAISE NOTICE '====================================';
END $$;

COMMIT;

-- ===================================================
-- USAGE EXAMPLES
-- ===================================================

-- Example 1: Give a doctor cross-department access
-- INSERT INTO user_department_access (user_id, tenant_id, department_id, access_level, reason, granted_by_user_id)
-- SELECT 
--   'user-uuid-here',
--   'tenant-uuid-here',
--   d.id,
--   'read_write',
--   'Doctor covers both Retina and Glaucoma departments',
--   'admin-user-uuid'
-- FROM department d
-- WHERE d.department_code IN ('RETINA', 'GLAUCOMA') AND d.tenant_id = 'tenant-uuid-here';

-- Example 2: Grant extra permission to a user
-- INSERT INTO user_permission_override (user_id, tenant_id, permission_code, override_type, reason, granted_by_user_id)
-- VALUES (
--   'user-uuid-here',
--   'tenant-uuid-here',
--   'ADMIN:USER:DELETE',
--   'grant',
--   'Temporary admin access for data cleanup project',
--   'admin-user-uuid'
-- );

-- Example 3: Revoke a default permission from a user
-- INSERT INTO user_permission_override (user_id, tenant_id, permission_code, override_type, reason, granted_by_user_id)
-- VALUES (
--   'user-uuid-here',
--   'tenant-uuid-here',
--   'CLINICAL:PRESCRIPTION:CREATE',
--   'revoke',
--   'User is on probation, cannot create prescriptions',
--   'admin-user-uuid'
-- );
