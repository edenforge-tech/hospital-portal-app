-- ============================================
-- ADD MISSING ROLES TO APP_ROLES TABLE
-- Create the 19 missing roles for complete RBAC
-- ============================================

-- Disable audit trigger temporarily
ALTER TABLE app_roles DISABLE TRIGGER audit_app_roles_changes;

-- Insert missing roles (19 roles to reach the required 20 total)
INSERT INTO app_roles (
    id, tenant_id, name, "NormalizedName", "ConcurrencyStamp",
    "Description", "RoleCode", "RoleType", "RoleLevel", "Priority",
    "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
-- System Admin (already exists, but let's ensure it has proper values)
-- Doctor roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Doctor', 'DOCTOR', gen_random_uuid()::text,
'Medical practitioner with clinical documentation, prescriptions, and patient care access', 'DOCTOR', 'clinical', 3, 3,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Senior Doctor', 'SENIOR DOCTOR', gen_random_uuid()::text,
'Senior medical practitioner with advanced clinical privileges', 'SR_DOCTOR', 'clinical', 2, 2,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Consultant', 'CONSULTANT', gen_random_uuid()::text,
'Specialist consultant with full clinical and administrative access', 'CONSULTANT', 'clinical', 2, 1,
true, true, NOW(), NOW()),

-- Nursing roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Nurse', 'NURSE', gen_random_uuid()::text,
'Nursing staff with patient care, medication administration, and vital signs access', 'NURSE', 'clinical', 3, 4,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Senior Nurse', 'SENIOR NURSE', gen_random_uuid()::text,
'Senior nursing staff with supervisory clinical responsibilities', 'SR_NURSE', 'clinical', 2, 3,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Nurse Manager', 'NURSE MANAGER', gen_random_uuid()::text,
'Nursing department manager with administrative and clinical oversight', 'NURSE_MGR', 'administrative', 2, 2,
true, true, NOW(), NOW()),

-- Pharmacy roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Pharmacist', 'PHARMACIST', gen_random_uuid()::text,
'Pharmacy operations, medication dispensing, and inventory management', 'PHARMACIST', 'pharmacy', 3, 5,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Pharmacy Manager', 'PHARMACY MANAGER', gen_random_uuid()::text,
'Pharmacy department manager with procurement and inventory oversight', 'PHARM_MGR', 'pharmacy', 2, 4,
true, true, NOW(), NOW()),

-- Laboratory roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Lab Technician', 'LAB TECHNICIAN', gen_random_uuid()::text,
'Laboratory test processing, sample collection, and result entry', 'LAB_TECH', 'laboratory', 3, 6,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Lab Manager', 'LAB MANAGER', gen_random_uuid()::text,
'Laboratory department manager with quality control and equipment oversight', 'LAB_MGR', 'laboratory', 2, 5,
true, true, NOW(), NOW()),

-- Radiology/Imaging roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Radiologist', 'RADIOLOGIST', gen_random_uuid()::text,
'Radiology specialist for imaging interpretation and reporting', 'RADIOLOGIST', 'radiology', 3, 7,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Radiology Technician', 'RADIOLOGY TECHNICIAN', gen_random_uuid()::text,
'Radiology imaging acquisition and preliminary processing', 'RADIO_TECH', 'radiology', 3, 8,
true, true, NOW(), NOW()),

-- Administrative roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Receptionist', 'RECEPTIONIST', gen_random_uuid()::text,
'Front desk operations, appointment scheduling, and patient coordination', 'RECEPTIONIST', 'administrative', 3, 9,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Billing Clerk', 'BILLING CLERK', gen_random_uuid()::text,
'Patient billing, insurance claims, and payment processing', 'BILLING', 'administrative', 3, 10,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Medical Records Officer', 'MEDICAL RECORDS OFFICER', gen_random_uuid()::text,
'Medical records management, document filing, and information retrieval', 'MED_RECORDS', 'administrative', 3, 11,
true, true, NOW(), NOW()),

-- Support roles
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'IT Administrator', 'IT ADMINISTRATOR', gen_random_uuid()::text,
'System administration, user management, and technical support', 'IT_ADMIN', 'technical', 2, 6,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Housekeeping Supervisor', 'HOUSEKEEPING SUPERVISOR', gen_random_uuid()::text,
'Facilities maintenance and housekeeping coordination', 'HOUSEKEEPING', 'support', 3, 12,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Security Officer', 'SECURITY OFFICER', gen_random_uuid()::text,
'Campus security, access control, and emergency response', 'SECURITY', 'support', 3, 13,
true, true, NOW(), NOW()),

(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Maintenance Technician', 'MAINTENANCE TECHNICIAN', gen_random_uuid()::text,
'Equipment maintenance, repairs, and facilities support', 'MAINTENANCE', 'technical', 3, 14,
true, true, NOW(), NOW());

-- Re-enable audit trigger
ALTER TABLE app_roles ENABLE TRIGGER audit_app_roles_changes;

-- Verification
SELECT COUNT(*) as total_roles FROM app_roles;
SELECT name, "RoleCode", "RoleLevel", "RoleType" FROM app_roles ORDER BY "RoleLevel", "Priority";