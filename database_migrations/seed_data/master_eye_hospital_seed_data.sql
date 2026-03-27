-- ===================================================
-- MASTER EYE HOSPITAL SEED DATA
-- Date: January 26, 2026
-- Description: Master permissions, roles, and departments for all eye hospitals
-- These are FIXED baseline data that apply to ALL tenants/hospitals/regions
-- ===================================================

-- NOTE: This script should be run ONCE during initial system setup
-- Future updates should be done via migration scripts

BEGIN;

-- ===================================================
-- STEP 1: CREATE MISSING PERMISSIONS (FOR 25 NEW ROLES)
-- ===================================================
-- Pattern: MODULE:RESOURCE:ACTION
-- Modules: admin, auth, billing, clinical, dashboard, license, reports

-- ===================== CLINICAL MODULE PERMISSIONS =====================

-- Anesthesia Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:ANESTHESIA:MANAGE', 'Manage Anesthesia', 'clinical', 'anesthesia', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:ANESTHESIA:VIEW', 'View Anesthesia Records', 'clinical', 'anesthesia', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:SURGERY:VIEW', 'View Surgery Schedule', 'clinical', 'surgery', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Orthoptics & Vision Therapy Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:ORTHOPTICS:MANAGE', 'Manage Orthoptics', 'clinical', 'orthoptics', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:VISION_THERAPY:MANAGE', 'Manage Vision Therapy', 'clinical', 'vision_therapy', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:VISION_THERAPY:VIEW', 'View Vision Therapy', 'clinical', 'vision_therapy', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Contact Lens Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:CONTACT_LENS:MANAGE', 'Manage Contact Lens Fitting', 'clinical', 'contact_lens', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:CONTACT_LENS:VIEW', 'View Contact Lens Records', 'clinical', 'contact_lens', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:REFRACTION:VIEW', 'View Refraction Data', 'clinical', 'refraction', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Low Vision & Rehabilitation Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:LOW_VISION:MANAGE', 'Manage Low Vision Services', 'clinical', 'low_vision', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:REHABILITATION:MANAGE', 'Manage Rehabilitation', 'clinical', 'rehabilitation', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Social Services & Charity Care Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:CHARITY_CARE:MANAGE', 'Manage Charity Care', 'admin', 'charity_care', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:FINANCIAL_COUNSELING:MANAGE', 'Manage Financial Counseling', 'admin', 'financial_counseling', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SOCIAL_SERVICES:MANAGE', 'Manage Social Services', 'admin', 'social_services', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Eye Camp Coordination Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:CAMP:MANAGE', 'Manage Eye Camps', 'admin', 'camp', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:OUTREACH:MANAGE', 'Manage Outreach Programs', 'admin', 'outreach', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:LOGISTICS:MANAGE', 'Manage Logistics', 'admin', 'logistics', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Retinopathy Screening Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:SCREENING:PERFORM', 'Perform Screening', 'clinical', 'screening', 'perform', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:SCREENING:VIEW', 'View Screening Results', 'clinical', 'screening', 'view', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:IMAGING:CAPTURE', 'Capture Medical Images', 'clinical', 'imaging', 'capture', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Fundus Photography & Angiography Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:FUNDUS_PHOTO:MANAGE', 'Manage Fundus Photography', 'clinical', 'fundus_photo', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:ANGIOGRAPHY:PERFORM', 'Perform Angiography', 'clinical', 'angiography', 'perform', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Electrophysiology Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:ELECTROPHYSIOLOGY:PERFORM', 'Perform Electrophysiology Tests', 'clinical', 'electrophysiology', 'perform', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:ERG:CONDUCT', 'Conduct ERG', 'clinical', 'erg', 'conduct', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:VEP:CONDUCT', 'Conduct VEP', 'clinical', 'vep', 'conduct', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Ocular Prosthetics Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:PROSTHETICS:FIT', 'Fit Ocular Prosthetics', 'clinical', 'prosthetics', 'fit', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PROSTHETICS:MANUFACTURE', 'Manufacture Prosthetics', 'clinical', 'prosthetics', 'manufacture', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Genetic Counseling Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:GENETIC_COUNSELING:CONDUCT', 'Conduct Genetic Counseling', 'clinical', 'genetic_counseling', 'conduct', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:FAMILY_HISTORY:ANALYZE', 'Analyze Family History', 'clinical', 'family_history', 'analyze', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- CSSD & Sterilization Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:STERILIZATION:MANAGE', 'Manage Sterilization', 'admin', 'sterilization', 'manage', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:EQUIPMENT:TRACK', 'Track Equipment', 'admin', 'equipment', 'track', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:INFECTION_CONTROL:COMPLY', 'Infection Control Compliance', 'admin', 'infection_control', 'comply', 'tenant', 'internal', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Quality & Accreditation Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:QUALITY:AUDIT', 'Perform Quality Audits', 'admin', 'quality', 'audit', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:ACCREDITATION:MANAGE', 'Manage Accreditation', 'admin', 'accreditation', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:COMPLIANCE:TRACK', 'Track Compliance', 'admin', 'compliance', 'track', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DOCUMENTATION:MANAGE', 'Manage Documentation', 'admin', 'documentation', 'manage', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- IOL Inventory & Management Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:IOL:MANAGE', 'Manage IOL Inventory', 'admin', 'iol', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:IOL_CALCULATION:PERFORM', 'Perform IOL Calculations', 'admin', 'iol_calculation', 'perform', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:BIOMETRY:VIEW', 'View Biometry Data', 'clinical', 'biometry', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- OT Technician Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:OT:ASSIST', 'Assist in OT', 'clinical', 'ot', 'assist', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SURGICAL_INSTRUMENTS:MANAGE', 'Manage Surgical Instruments', 'admin', 'surgical_instruments', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:SURGERY:SUPPORT', 'Support Surgery', 'clinical', 'surgery', 'support', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Optical Dispensing Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'BILLING:OPTICAL:DISPENSE', 'Dispense Optical Products', 'billing', 'optical', 'dispense', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PRESCRIPTION:VERIFY', 'Verify Prescriptions', 'clinical', 'prescription', 'verify', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:EYEWEAR:FIT', 'Fit Eyewear', 'billing', 'eyewear', 'fit', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Medical Transcription Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:TRANSCRIPTION:MANAGE', 'Manage Transcription', 'admin', 'transcription', 'manage', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DICTATION:TRANSCRIBE', 'Transcribe Dictation', 'admin', 'dictation', 'transcribe', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- HMIS & IT Support Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:SYSTEM:SUPPORT', 'Provide System Support', 'admin', 'system', 'support', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:HMIS:MANAGE', 'Manage HMIS', 'admin', 'hmis', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:USER_SUPPORT:PROVIDE', 'Provide User Support', 'admin', 'user_support', 'provide', 'tenant', 'internal', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Clinical Photography Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:CLINICAL_PHOTOGRAPHY:PERFORM', 'Perform Clinical Photography', 'clinical', 'clinical_photography', 'perform', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:EXTERNAL_EYE:PHOTOGRAPH', 'Photograph External Eye', 'clinical', 'external_eye', 'photograph', 'tenant', 'confidential', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:IMAGING:MANAGE', 'Manage Imaging', 'admin', 'imaging', 'manage', 'tenant', 'confidential', false, 'low', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Tele-Ophthalmology Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:TELEMEDICINE:COORDINATE', 'Coordinate Telemedicine', 'admin', 'telemedicine', 'coordinate', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:REMOTE_CONSULTATION:MANAGE', 'Manage Remote Consultations', 'clinical', 'remote_consultation', 'manage', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Medical Coding Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'BILLING:MEDICAL_CODING:PERFORM', 'Perform Medical Coding', 'billing', 'medical_coding', 'perform', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:ICD_CODING:MANAGE', 'Manage ICD Coding', 'billing', 'icd_coding', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'BILLING:CLAIMS:PROCESS', 'Process Insurance Claims', 'billing', 'claims', 'process', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Health Information Management Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:HIM:MANAGE', 'Manage Health Information', 'admin', 'him', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:MEDICAL_RECORDS:AUDIT', 'Audit Medical Records', 'admin', 'medical_records', 'audit', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:DOCUMENTATION:QUALITY_CHECK', 'Quality Check Documentation', 'admin', 'documentation', 'quality_check', 'tenant', 'internal', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Inventory & Stores Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:INVENTORY:MANAGE', 'Manage Inventory', 'admin', 'inventory', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:STOCK:TRACK', 'Track Stock', 'admin', 'stock', 'track', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:PURCHASE_REQUISITION:CREATE', 'Create Purchase Requisition', 'admin', 'purchase_requisition', 'create', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:SUPPLY:MANAGE', 'Manage Supply Chain', 'admin', 'supply', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Ambulance & Emergency Transport Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ADMIN:AMBULANCE:OPERATE', 'Operate Ambulance', 'admin', 'ambulance', 'operate', 'tenant', 'internal', false, 'high', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:EMERGENCY_TRANSPORT:MANAGE', 'Manage Emergency Transport', 'admin', 'emergency_transport', 'manage', 'tenant', 'internal', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:PATIENT:TRANSPORT', 'Transport Patients', 'clinical', 'patient', 'transport', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Diet & Nutrition Permissions
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:DIET:PLAN', 'Plan Diet', 'clinical', 'diet', 'plan', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:NUTRITION:COUNSEL', 'Nutrition Counseling', 'clinical', 'nutrition', 'counsel', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:DIABETIC_DIET:MANAGE', 'Manage Diabetic Diet', 'clinical', 'diabetic_diet', 'manage', 'tenant', 'confidential', false, 'high', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Common Permissions (already should exist but adding for completeness)
INSERT INTO permission (id, code, name, module, resource, action, scope, data_classification, is_system, risk_level, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'CLINICAL:PATIENT:VIEW', 'View Patient Information', 'clinical', 'patient', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:RECORD:VIEW', 'View Medical Records', 'clinical', 'medical_record', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW()),
  (gen_random_uuid(), 'CLINICAL:APPOINTMENT:CREATE', 'Create Appointments', 'clinical', 'appointment', 'create', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'REPORTS:GENERATE', 'Generate Reports', 'reports', 'report', 'generate', 'tenant', 'internal', false, 'low', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN:MEDICAL_RECORDS:VIEW', 'View Medical Records (Admin)', 'admin', 'medical_records', 'view', 'tenant', 'confidential', false, 'medium', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ===================================================
-- STEP 2: ADD 25 MISSING CRITICAL ROLES
-- ===================================================
-- These roles are MASTER data - same for all tenants

-- ===================== CLINICAL & PATIENT CARE ROLES (6) =====================

-- 1. Anesthesiologist (CRITICAL - for surgeries)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions,
  approval_workflow_template, onboarding_checklist_template, mandatory_training
) VALUES (
  gen_random_uuid(),
  'ANESTHESIOLOGIST',
  'Anesthesiologist / Anesthetist',
  'Clinical Support',
  'hospital',
  30,
  NULL,
  true,
  '["MD Anesthesia", "DA (Diploma in Anesthesiology)", "DNB Anesthesia"]'::jsonb,
  true,
  '["BLS Certification", "ACLS Certification"]'::jsonb,
  true,
  '["CLINICAL:SURGERY:VIEW", "CLINICAL:PATIENT:VIEW", "CLINICAL:ANESTHESIA:MANAGE", "CLINICAL:RECORD:VIEW"]'::jsonb,
  NULL,
  NULL,
  '["Hospital Safety Protocols", "Emergency Response", "Anesthesia Equipment Training"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 2. Orthoptist (Vision Therapy Specialist)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'ORTHOPTIST',
  'Orthoptist / Vision Therapist',
  'Clinical Support',
  'department',
  50,
  'PEDIATRIC_OPHTHALMOLOGIST',
  true,
  '["B.Sc Optometry with Orthoptics Specialization", "Diploma in Orthoptics"]'::jsonb,
  false,
  NULL,
  true,
  '["CLINICAL:PATIENT:VIEW", "CLINICAL:ORTHOPTICS:MANAGE", "CLINICAL:VISION_THERAPY:MANAGE", "CLINICAL:RECORD:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 3. Contact Lens Specialist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'CONTACT_LENS_SPECIALIST',
  'Contact Lens Specialist',
  'Optometry',
  'department',
  55,
  'SR_OPTOMETRIST',
  true,
  '["B.Sc Optometry", "M.Optom (Contact Lens Specialization)"]'::jsonb,
  true,
  '["Advanced Contact Lens Fitting Certification", "RGP Lens Fitting"]'::jsonb,
  true,
  '["CLINICAL:PATIENT:VIEW", "CLINICAL:CONTACT_LENS:MANAGE", "CLINICAL:REFRACTION:VIEW", "BILLING:OPTICAL:DISPENSE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 4. Low Vision Therapist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'LOW_VISION_THERAPIST',
  'Low Vision Therapist / Rehabilitation Specialist',
  'Clinical Support',
  'department',
  52,
  'SR_OPTOMETRIST',
  true,
  '["B.Sc Optometry", "Diploma in Low Vision Rehabilitation"]'::jsonb,
  false,
  NULL,
  true,
  '["CLINICAL:PATIENT:VIEW", "CLINICAL:LOW_VISION:MANAGE", "CLINICAL:REHABILITATION:MANAGE", "CLINICAL:RECORD:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 5. Medical Social Worker
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'SOCIAL_WORKER',
  'Medical Social Worker',
  'Patient Services',
  'hospital',
  60,
  NULL,
  false,
  '["MSW (Medical Social Work)", "BSW"]'::jsonb,
  false,
  NULL,
  true,
  '["CLINICAL:PATIENT:VIEW", "ADMIN:CHARITY_CARE:MANAGE", "ADMIN:FINANCIAL_COUNSELING:MANAGE", "ADMIN:SOCIAL_SERVICES:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 6. Eye Camp Coordinator
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'CAMP_COORDINATOR',
  'Eye Camp Coordinator',
  'Operations & Facilities',
  'hospital',
  65,
  'OPERATIONS_MANAGER',
  false,
  NULL,
  false,
  NULL,
  true,
  '["ADMIN:CAMP:MANAGE", "ADMIN:OUTREACH:MANAGE", "CLINICAL:PATIENT:VIEW", "ADMIN:LOGISTICS:MANAGE", "CLINICAL:APPOINTMENT:CREATE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- ===================== DIAGNOSTIC & TECHNICAL ROLES (5) =====================

-- 7. Diabetic Retinopathy Screener
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'RETINOPATHY_SCREENER',
  'Diabetic Retinopathy Screener',
  'Diagnostic & Technical Support',
  'department',
  58,
  'IMAGING_TECHNICIAN',
  true,
  '["Diploma in Ophthalmic Technology", "Certificate in Retinal Imaging"]'::jsonb,
  true,
  '["Diabetic Retinopathy Screening Certification"]'::jsonb,
  true,
  '["CLINICAL:SCREENING:PERFORM", "CLINICAL:PATIENT:VIEW", "CLINICAL:IMAGING:CAPTURE", "REPORTS:GENERATE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 8. Fundus Photographer / Imaging Specialist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'FUNDUS_PHOTOGRAPHER',
  'Fundus Photographer / Imaging Specialist',
  'Diagnostic & Technical Support',
  'department',
  57,
  'IMAGING_TECHNICIAN',
  true,
  '["Diploma in Ophthalmic Technology", "B.Sc Optometry"]'::jsonb,
  true,
  '["Fundus Photography Certification", "Fluorescein Angiography Training"]'::jsonb,
  true,
  '["CLINICAL:IMAGING:CAPTURE", "CLINICAL:FUNDUS_PHOTO:MANAGE", "CLINICAL:ANGIOGRAPHY:PERFORM", "CLINICAL:PATIENT:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 9. Electrophysiology Technician
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'ELECTROPHYSIOLOGY_TECH',
  'Electrophysiology Technician (ERG/VEP/EOG)',
  'Diagnostic & Technical Support',
  'department',
  59,
  'IMAGING_TECHNICIAN',
  true,
  '["Diploma in Ophthalmic Technology", "B.Sc Medical Technology"]'::jsonb,
  true,
  '["Electrophysiology Testing Certification"]'::jsonb,
  true,
  '["CLINICAL:ELECTROPHYSIOLOGY:PERFORM", "CLINICAL:ERG:CONDUCT", "CLINICAL:VEP:CONDUCT", "CLINICAL:PATIENT:VIEW", "REPORTS:GENERATE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 10. Ocular Prosthetics Specialist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'OCULAR_PROSTHETICIST',
  'Ocular Prosthetics Specialist',
  'Clinical Support',
  'department',
  62,
  NULL,
  true,
  '["Diploma in Ocular Prosthetics", "Certificate in Artificial Eye Fabrication"]'::jsonb,
  true,
  '["Ocular Prosthetics Fitting Certification"]'::jsonb,
  true,
  '["CLINICAL:PROSTHETICS:FIT", "CLINICAL:PROSTHETICS:MANUFACTURE", "CLINICAL:PATIENT:VIEW", "CLINICAL:RECORD:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 11. Genetic Counselor (Ophthalmology)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'GENETIC_COUNSELOR',
  'Genetic Counselor (Ophthalmology)',
  'Clinical Support',
  'department',
  63,
  NULL,
  true,
  '["M.Sc Genetic Counseling", "Certificate in Ophthalmic Genetics"]'::jsonb,
  true,
  '["Board Certified Genetic Counselor"]'::jsonb,
  true,
  '["CLINICAL:GENETIC_COUNSELING:CONDUCT", "CLINICAL:PATIENT:VIEW", "CLINICAL:FAMILY_HISTORY:ANALYZE", "CLINICAL:RECORD:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- ===================== OPERATIONS & QUALITY ROLES (2) =====================

-- 12. CSSD Technician / Sterile Supply Officer
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'CSSD_TECHNICIAN',
  'CSSD Technician / Sterile Supply Officer',
  'Operations & Facilities',
  'department',
  68,
  'OPERATIONS_MANAGER',
  false,
  '["Diploma in CSSD Technology", "Certificate in Sterilization Techniques"]'::jsonb,
  true,
  '["CSSD Certification", "Infection Control Training"]'::jsonb,
  true,
  '["ADMIN:STERILIZATION:MANAGE", "ADMIN:EQUIPMENT:TRACK", "ADMIN:INFECTION_CONTROL:COMPLY", "ADMIN:INVENTORY:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 13. NABH/JCI Accreditation Officer
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'ACCREDITATION_OFFICER',
  'NABH/JCI Accreditation Officer',
  'Medical Records & Quality',
  'hospital',
  45,
  'QUALITY_ASSURANCE_OFFICER',
  false,
  '["MBA Healthcare", "Post Graduate Diploma in Hospital Administration"]'::jsonb,
  true,
  '["NABH Auditor Certification", "ISO 9001 Internal Auditor"]'::jsonb,
  true,
  '["ADMIN:QUALITY:AUDIT", "ADMIN:ACCREDITATION:MANAGE", "ADMIN:COMPLIANCE:TRACK", "REPORTS:GENERATE", "ADMIN:DOCUMENTATION:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- ===================== TECHNICAL & SUPPORT ROLES (7) =====================

-- 14. IOL Coordinator (CRITICAL for cataract surgeries)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'IOL_COORDINATOR',
  'IOL Coordinator',
  'Diagnostic & Technical Support',
  'department',
  56,
  'BIOMETRY_TECHNICIAN',
  true,
  '["Diploma in Ophthalmic Technology", "Certificate in IOL Calculations"]'::jsonb,
  true,
  '["IOL Master Certification", "Advanced Biometry Training"]'::jsonb,
  true,
  '["ADMIN:IOL:MANAGE", "ADMIN:INVENTORY:MANAGE", "CLINICAL:BIOMETRY:VIEW", "CLINICAL:PATIENT:VIEW", "ADMIN:IOL_CALCULATION:PERFORM"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 15. OT Technician / Scrub Nurse
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'OT_TECHNICIAN',
  'OT Technician / Scrub Nurse',
  'Nursing & Clinical Support',
  'department',
  54,
  'REGISTERED_NURSE_OT',
  true,
  '["GNM (General Nursing Midwifery)", "B.Sc Nursing", "Diploma in OT Technology"]'::jsonb,
  true,
  '["OT Technician Certification", "Infection Control Training"]'::jsonb,
  true,
  '["CLINICAL:OT:ASSIST", "ADMIN:SURGICAL_INSTRUMENTS:MANAGE", "CLINICAL:PATIENT:VIEW", "CLINICAL:SURGERY:SUPPORT"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 16. Optician (Licensed Optical Dispenser)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'OPTICIAN',
  'Optician (Licensed Optical Dispenser)',
  'Pharmacy & Optical',
  'department',
  61,
  'OPTICAL_MANAGER',
  true,
  '["Diploma in Opticianry", "Certificate in Optical Dispensing"]'::jsonb,
  true,
  '["Licensed Optician Certification"]'::jsonb,
  true,
  '["BILLING:OPTICAL:DISPENSE", "CLINICAL:PRESCRIPTION:VERIFY", "BILLING:EYEWEAR:FIT", "CLINICAL:PATIENT:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 17. Medical Transcriptionist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'MEDICAL_TRANSCRIPTIONIST',
  'Medical Transcriptionist',
  'Medical Records & Quality',
  'hospital',
  70,
  NULL,
  false,
  '["Certificate in Medical Transcription", "Diploma in Healthcare Documentation"]'::jsonb,
  true,
  '["Medical Transcription Certification"]'::jsonb,
  true,
  '["ADMIN:TRANSCRIPTION:MANAGE", "ADMIN:MEDICAL_RECORDS:VIEW", "ADMIN:DICTATION:TRANSCRIBE", "ADMIN:DOCUMENTATION:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 18. HMIS Officer / IT Support (Healthcare)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'HMIS_OFFICER',
  'HMIS Officer / IT Support (Healthcare)',
  'Operations & Facilities',
  'hospital',
  66,
  NULL,
  false,
  '["B.Tech Computer Science", "Diploma in Healthcare IT"]'::jsonb,
  false,
  NULL,
  true,
  '["ADMIN:SYSTEM:SUPPORT", "ADMIN:HMIS:MANAGE", "ADMIN:USER_SUPPORT:PROVIDE", "REPORTS:GENERATE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 19. Clinical Photographer (External Eye Photography)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'CLINICAL_PHOTOGRAPHER',
  'Clinical Photographer (External Eye Photography)',
  'Diagnostic & Technical Support',
  'department',
  64,
  NULL,
  true,
  '["Diploma in Medical Photography", "Certificate in Ophthalmic Photography"]'::jsonb,
  false,
  NULL,
  true,
  '["CLINICAL:CLINICAL_PHOTOGRAPHY:PERFORM", "CLINICAL:EXTERNAL_EYE:PHOTOGRAPH", "CLINICAL:PATIENT:VIEW", "ADMIN:IMAGING:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 20. Tele-Ophthalmology Coordinator
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'TELEOPHTH_COORDINATOR',
  'Tele-Ophthalmology Coordinator',
  'Front Desk & Patient Services',
  'department',
  67,
  'APPOINTMENT_COORDINATOR',
  false,
  NULL,
  true,
  '["Telemedicine Coordinator Certification"]'::jsonb,
  true,
  '["ADMIN:TELEMEDICINE:COORDINATE", "CLINICAL:REMOTE_CONSULTATION:MANAGE", "CLINICAL:APPOINTMENT:CREATE", "CLINICAL:PATIENT:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- ===================== HOSPITAL OPERATIONS ROLES (5) =====================

-- 21. Medical Coder (ICD-10/CPT)
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'MEDICAL_CODER',
  'Medical Coder (ICD-10/CPT)',
  'Medical Records & Quality',
  'hospital',
  69,
  'MEDICAL_RECORDS_MANAGER',
  false,
  NULL,
  true,
  '["CPC Certification (Certified Professional Coder)", "CCS Certification (Certified Coding Specialist)"]'::jsonb,
  true,
  '["BILLING:MEDICAL_CODING:PERFORM", "BILLING:ICD_CODING:MANAGE", "BILLING:CLAIMS:PROCESS", "ADMIN:MEDICAL_RECORDS:VIEW"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 22. Health Information Management Specialist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'HIM_SPECIALIST',
  'Health Information Management Specialist',
  'Medical Records & Quality',
  'hospital',
  71,
  'MEDICAL_RECORDS_MANAGER',
  false,
  '["Bachelor in Health Information Management", "Post Graduate Diploma in HIM"]'::jsonb,
  true,
  '["RHIA Certification (Registered Health Information Administrator)"]'::jsonb,
  true,
  '["ADMIN:HIM:MANAGE", "ADMIN:MEDICAL_RECORDS:AUDIT", "ADMIN:DOCUMENTATION:QUALITY_CHECK", "ADMIN:COMPLIANCE:TRACK"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 23. Stores Officer / Inventory Manager
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'STORES_OFFICER',
  'Stores Officer / Inventory Manager',
  'Operations & Facilities',
  'hospital',
  72,
  'OPERATIONS_MANAGER',
  false,
  NULL,
  false,
  NULL,
  true,
  '["ADMIN:INVENTORY:MANAGE", "ADMIN:STOCK:TRACK", "ADMIN:PURCHASE_REQUISITION:CREATE", "ADMIN:SUPPLY:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 24. Ambulance Driver / Emergency Driver
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'AMBULANCE_DRIVER',
  'Ambulance Driver / Emergency Driver',
  'Operations & Facilities',
  'hospital',
  73,
  'OPERATIONS_MANAGER',
  true,
  '["Valid Driving License (Heavy Vehicle)", "Ambulance Driving License"]'::jsonb,
  true,
  '["First Aid Certification", "Basic Life Support (BLS)"]'::jsonb,
  true,
  '["ADMIN:AMBULANCE:OPERATE", "ADMIN:EMERGENCY_TRANSPORT:MANAGE", "CLINICAL:PATIENT:TRANSPORT"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- 25. Dietitian / Clinical Nutritionist
INSERT INTO role_definition (
  id, role_code, role_name, role_category, role_scope, hierarchy_level,
  parent_role_code, requires_license, license_types, requires_certification,
  required_certifications, requires_contract, default_permissions
) VALUES (
  gen_random_uuid(),
  'DIETITIAN',
  'Dietitian / Clinical Nutritionist',
  'Clinical Support',
  'hospital',
  74,
  NULL,
  true,
  '["M.Sc Nutrition & Dietetics", "B.Sc Nutrition", "PG Diploma in Dietetics"]'::jsonb,
  true,
  '["Registered Dietitian Certification"]'::jsonb,
  true,
  '["CLINICAL:DIET:PLAN", "CLINICAL:NUTRITION:COUNSEL", "CLINICAL:PATIENT:VIEW", "CLINICAL:DIABETIC_DIET:MANAGE"]'::jsonb
) ON CONFLICT (role_code) DO NOTHING;

-- Log role additions
INSERT INTO audit_log (action, entity, details, performed_at)
VALUES ('INSERT', 'role_definition', 'Added 25 missing critical roles for eye hospital (6 clinical, 5 diagnostic, 2 operations, 7 technical/support, 5 hospital operations)', NOW());

COMMENT ON COLUMN role_definition.default_permissions IS 'JSON array of permission codes automatically granted to this role. Format: ["MODULE:RESOURCE:ACTION"]';

-- ===================================================
-- STEP 3: ADD MISSING DEPARTMENTS FOR ALL TENANTS
-- ===================================================
-- These departments will be created for EVERY tenant in the system

DO $$
DECLARE
  dept_record RECORD;
  tenant_record RECORD;
  admin_user_id UUID;
BEGIN
  -- Get admin user ID (fallback to first user if admin not found)
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@hospitalportal.com' LIMIT 1;
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM users LIMIT 1;
  END IF;

  -- Define all departments to be added
  FOR dept_record IN 
    SELECT * FROM (VALUES
      ('GENETIC_COUNSELING', 'Genetic Counseling (Inherited Eye Diseases)'),
      ('TELE_OPHTHALMOLOGY', 'Tele-Ophthalmology Services'),
      ('ORTHOPTICS', 'Orthoptics & Vision Therapy'),
      ('RETINOPATHY_SCREENING', 'Diabetic Retinopathy Screening'),
      ('ELECTROPHYSIOLOGY', 'Electrophysiology Lab (ERG/VEP/EOG)'),
      ('PROSTHETIC_EYE', 'Ocular Prosthetics'),
      ('FUNDUS_IMAGING', 'Fundus Photography & Imaging'),
      ('EYE_BANK', 'Eye Bank & Cornea Donation Center'),
      ('CAMP_COORDINATION', 'Eye Camp Coordination'),
      ('LOW_VISION_REHAB', 'Low Vision Rehabilitation'),
      ('SOCIAL_SERVICES', 'Social Services / Charity Care'),
      ('CSSD', 'Central Sterile Supply Department'),
      ('NABH_ACCREDITATION', 'NABH/JCI Accreditation Cell'),
      ('BUSINESS_DEVELOPMENT', 'Business Development / Corporate Sales'),
      ('IOL_INVENTORY', 'IOL Inventory & Management'),
      ('STORES', 'Stores & Inventory Management'),
      ('AMBULANCE_SERVICES', 'Ambulance & Emergency Transport'),
      ('DIET_NUTRITION', 'Diet & Nutrition Services'),
      ('PHOTOGRAPHY', 'Clinical Photography Department')
    ) AS dept(code, name)
  LOOP
    -- Insert department for each tenant
    FOR tenant_record IN SELECT id FROM tenant
    LOOP
      INSERT INTO department (
        id, tenant_id, department_code, department_name, 
        status, created_at, updated_at, created_by_user_id, updated_by_user_id
      )
      SELECT 
        gen_random_uuid(),
        tenant_record.id,
        dept_record.code,
        dept_record.name,
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

  -- Log department additions
  INSERT INTO audit_log (action, entity, details, performed_at)
  VALUES ('INSERT', 'department', 'Added 19 missing eye hospital departments for all tenants', NOW());
  
END $$;

-- ===================================================
-- STEP 4: VERIFICATION QUERIES
-- ===================================================

-- Count new permissions added
DO $$
DECLARE
  perm_count INTEGER;
  role_count INTEGER;
  dept_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count FROM permission WHERE created_at::date = CURRENT_DATE;
  SELECT COUNT(*) INTO role_count FROM role_definition WHERE role_code IN (
    'ANESTHESIOLOGIST', 'ORTHOPTIST', 'CONTACT_LENS_SPECIALIST', 'LOW_VISION_THERAPIST',
    'SOCIAL_WORKER', 'CAMP_COORDINATOR', 'RETINOPATHY_SCREENER', 'FUNDUS_PHOTOGRAPHER',
    'ELECTROPHYSIOLOGY_TECH', 'OCULAR_PROSTHETICIST', 'GENETIC_COUNSELOR', 'CSSD_TECHNICIAN',
    'ACCREDITATION_OFFICER', 'IOL_COORDINATOR', 'OT_TECHNICIAN', 'OPTICIAN',
    'MEDICAL_TRANSCRIPTIONIST', 'HMIS_OFFICER', 'CLINICAL_PHOTOGRAPHER', 'TELEOPHTH_COORDINATOR',
    'MEDICAL_CODER', 'HIM_SPECIALIST', 'STORES_OFFICER', 'AMBULANCE_DRIVER', 'DIETITIAN'
  );
  
  SELECT COUNT(DISTINCT department_code) INTO dept_count FROM department 
  WHERE department_code IN (
    'GENETIC_COUNSELING', 'TELE_OPHTHALMOLOGY', 'ORTHOPTICS', 'RETINOPATHY_SCREENING',
    'ELECTROPHYSIOLOGY', 'PROSTHETIC_EYE', 'FUNDUS_IMAGING', 'EYE_BANK',
    'CAMP_COORDINATION', 'LOW_VISION_REHAB', 'SOCIAL_SERVICES', 'CSSD',
    'NABH_ACCREDITATION', 'BUSINESS_DEVELOPMENT', 'IOL_INVENTORY', 'STORES',
    'AMBULANCE_SERVICES', 'DIET_NUTRITION', 'PHOTOGRAPHY'
  );
  
  RAISE NOTICE 'Master Data Seeded Successfully!';
  RAISE NOTICE 'New Permissions Added: %', perm_count;
  RAISE NOTICE 'New Roles Added: %', role_count;
  RAISE NOTICE 'New Department Types: %', dept_count;
  RAISE NOTICE 'Total Roles in System: %', (SELECT COUNT(*) FROM role_definition);
  RAISE NOTICE 'Total Departments Across All Tenants: %', (SELECT COUNT(*) FROM department);
END $$;

COMMIT;

-- ===================================================
-- ROLLBACK SCRIPT (USE ONLY IF NEEDED)
-- ===================================================
-- Uncomment and run this section ONLY if you need to rollback

/*
BEGIN;

-- Delete permissions added
DELETE FROM permission WHERE code IN (
  'CLINICAL:ANESTHESIA:MANAGE', 'CLINICAL:ANESTHESIA:VIEW', 'CLINICAL:SURGERY:VIEW',
  'CLINICAL:ORTHOPTICS:MANAGE', 'CLINICAL:VISION_THERAPY:MANAGE', 'CLINICAL:VISION_THERAPY:VIEW',
  'CLINICAL:CONTACT_LENS:MANAGE', 'CLINICAL:CONTACT_LENS:VIEW', 'CLINICAL:REFRACTION:VIEW',
  'CLINICAL:LOW_VISION:MANAGE', 'CLINICAL:REHABILITATION:MANAGE',
  'ADMIN:CHARITY_CARE:MANAGE', 'ADMIN:FINANCIAL_COUNSELING:MANAGE', 'ADMIN:SOCIAL_SERVICES:MANAGE',
  'ADMIN:CAMP:MANAGE', 'ADMIN:OUTREACH:MANAGE', 'ADMIN:LOGISTICS:MANAGE',
  'CLINICAL:SCREENING:PERFORM', 'CLINICAL:SCREENING:VIEW', 'CLINICAL:IMAGING:CAPTURE',
  'CLINICAL:FUNDUS_PHOTO:MANAGE', 'CLINICAL:ANGIOGRAPHY:PERFORM',
  'CLINICAL:ELECTROPHYSIOLOGY:PERFORM', 'CLINICAL:ERG:CONDUCT', 'CLINICAL:VEP:CONDUCT',
  'CLINICAL:PROSTHETICS:FIT', 'CLINICAL:PROSTHETICS:MANUFACTURE',
  'CLINICAL:GENETIC_COUNSELING:CONDUCT', 'CLINICAL:FAMILY_HISTORY:ANALYZE',
  'ADMIN:STERILIZATION:MANAGE', 'ADMIN:EQUIPMENT:TRACK', 'ADMIN:INFECTION_CONTROL:COMPLY',
  'ADMIN:QUALITY:AUDIT', 'ADMIN:ACCREDITATION:MANAGE', 'ADMIN:COMPLIANCE:TRACK',
  'ADMIN:IOL:MANAGE', 'ADMIN:IOL_CALCULATION:PERFORM', 'CLINICAL:BIOMETRY:VIEW',
  'CLINICAL:OT:ASSIST', 'ADMIN:SURGICAL_INSTRUMENTS:MANAGE', 'CLINICAL:SURGERY:SUPPORT',
  'BILLING:OPTICAL:DISPENSE', 'CLINICAL:PRESCRIPTION:VERIFY', 'BILLING:EYEWEAR:FIT',
  'ADMIN:TRANSCRIPTION:MANAGE', 'ADMIN:DICTATION:TRANSCRIBE',
  'ADMIN:SYSTEM:SUPPORT', 'ADMIN:HMIS:MANAGE', 'ADMIN:USER_SUPPORT:PROVIDE',
  'CLINICAL:CLINICAL_PHOTOGRAPHY:PERFORM', 'CLINICAL:EXTERNAL_EYE:PHOTOGRAPH', 'ADMIN:IMAGING:MANAGE',
  'ADMIN:TELEMEDICINE:COORDINATE', 'CLINICAL:REMOTE_CONSULTATION:MANAGE',
  'BILLING:MEDICAL_CODING:PERFORM', 'BILLING:ICD_CODING:MANAGE', 'BILLING:CLAIMS:PROCESS',
  'ADMIN:HIM:MANAGE', 'ADMIN:MEDICAL_RECORDS:AUDIT', 'ADMIN:DOCUMENTATION:QUALITY_CHECK',
  'ADMIN:STOCK:TRACK', 'ADMIN:PURCHASE_REQUISITION:CREATE', 'ADMIN:SUPPLY:MANAGE',
  'ADMIN:AMBULANCE:OPERATE', 'ADMIN:EMERGENCY_TRANSPORT:MANAGE', 'CLINICAL:PATIENT:TRANSPORT',
  'CLINICAL:DIET:PLAN', 'CLINICAL:NUTRITION:COUNSEL', 'CLINICAL:DIABETIC_DIET:MANAGE'
);

-- Delete roles added
DELETE FROM role_definition WHERE role_code IN (
  'ANESTHESIOLOGIST', 'ORTHOPTIST', 'CONTACT_LENS_SPECIALIST', 'LOW_VISION_THERAPIST',
  'SOCIAL_WORKER', 'CAMP_COORDINATOR', 'RETINOPATHY_SCREENER', 'FUNDUS_PHOTOGRAPHER',
  'ELECTROPHYSIOLOGY_TECH', 'OCULAR_PROSTHETICIST', 'GENETIC_COUNSELOR', 'CSSD_TECHNICIAN',
  'ACCREDITATION_OFFICER', 'IOL_COORDINATOR', 'OT_TECHNICIAN', 'OPTICIAN',
  'MEDICAL_TRANSCRIPTIONIST', 'HMIS_OFFICER', 'CLINICAL_PHOTOGRAPHER', 'TELEOPHTH_COORDINATOR',
  'MEDICAL_CODER', 'HIM_SPECIALIST', 'STORES_OFFICER', 'AMBULANCE_DRIVER', 'DIETITIAN'
);

-- Delete departments added
DELETE FROM department WHERE department_code IN (
  'GENETIC_COUNSELING', 'TELE_OPHTHALMOLOGY', 'ORTHOPTICS', 'RETINOPATHY_SCREENING',
  'ELECTROPHYSIOLOGY', 'PROSTHETIC_EYE', 'FUNDUS_IMAGING', 'EYE_BANK',
  'CAMP_COORDINATION', 'LOW_VISION_REHAB', 'SOCIAL_SERVICES', 'CSSD',
  'NABH_ACCREDITATION', 'BUSINESS_DEVELOPMENT', 'IOL_INVENTORY', 'STORES',
  'AMBULANCE_SERVICES', 'DIET_NUTRITION', 'PHOTOGRAPHY'
);

-- Delete audit log entries
DELETE FROM audit_log WHERE details LIKE '%25 missing critical roles%' OR details LIKE '%19 missing eye hospital departments%';

COMMIT;
*/
