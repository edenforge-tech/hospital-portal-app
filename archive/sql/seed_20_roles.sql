-- ============================================
-- Seed Script: 20 System Roles
-- Hospital Portal RBAC Implementation
-- Created: November 10, 2025
-- ============================================

-- Insert 20 System Roles into roles table
INSERT INTO roles (
    id, name, "NormalizedName", "ConcurrencyStamp", 
    tenant_id, "Description", "IsSystemRole", "IsActive", 
    "CreatedAt", "UpdatedAt", "RoleLevel", role_type
) VALUES
-- 1. System Admin (Super User - ALL permissions)
(gen_random_uuid(), 'System Admin', 'SYSTEM ADMIN', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000', 
'Super administrator with full system access and all permissions', 
true, true, NOW(), NOW(), 1, 'system'),

-- 2. Hospital Administrator (Broad operational access)
(gen_random_uuid(), 'Hospital Administrator', 'HOSPITAL ADMINISTRATOR', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Hospital-wide administrative access, manages operations, staff, and configurations',
true, true, NOW(), NOW(), 2, 'system'),

-- 3. Doctor (Clinical focus - 15 permissions)
(gen_random_uuid(), 'Doctor', 'DOCTOR', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Medical practitioner with clinical documentation, prescriptions, and patient care access',
true, true, NOW(), NOW(), 3, 'system'),

-- 4. Nurse (Patient care focus - 12 permissions)
(gen_random_uuid(), 'Nurse', 'NURSE', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Nursing staff with patient care, medication administration, and vital signs access',
true, true, NOW(), NOW(), 3, 'system'),

-- 5. Pharmacist (Medication focus - 10 permissions)
(gen_random_uuid(), 'Pharmacist', 'PHARMACIST', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Pharmacy operations, medication dispensing, and inventory management',
true, true, NOW(), NOW(), 3, 'system'),

-- 6. Lab Technician (Lab focus - 8 permissions)
(gen_random_uuid(), 'Lab Technician', 'LAB TECHNICIAN', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Laboratory test processing, sample collection, and result entry',
true, true, NOW(), NOW(), 3, 'system'),

-- 7. Radiologist (Imaging focus - 8 permissions)
(gen_random_uuid(), 'Radiologist', 'RADIOLOGIST', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Radiology operations, imaging orders, PACS access, and report creation',
true, true, NOW(), NOW(), 3, 'system'),

-- 8. Front Desk (Reception focus - 6 permissions)
(gen_random_uuid(), 'Front Desk', 'FRONT DESK', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Reception and appointment management, patient registration, waitlist',
true, true, NOW(), NOW(), 4, 'system'),

-- 9. Billing Officer (Billing focus - 8 permissions)
(gen_random_uuid(), 'Billing Officer', 'BILLING OFFICER', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Billing operations, invoice generation, payment processing, insurance claims',
true, true, NOW(), NOW(), 4, 'system'),

-- 10. Inventory Manager (Inventory focus - 10 permissions)
(gen_random_uuid(), 'Inventory Manager', 'INVENTORY MANAGER', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Inventory and stock management, reordering, transfers, stock counts',
true, true, NOW(), NOW(), 3, 'system'),

-- 11. HR Manager (HR focus - 12 permissions)
(gen_random_uuid(), 'HR Manager', 'HR MANAGER', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Human resources, employee management, attendance, payroll, performance reviews',
true, true, NOW(), NOW(), 3, 'system'),

-- 12. Procurement Officer (Procurement focus - 10 permissions)
(gen_random_uuid(), 'Procurement Officer', 'PROCUREMENT OFFICER', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Vendor management, purchase orders, goods receipt, vendor payments',
true, true, NOW(), NOW(), 3, 'system'),

-- 13. Bed Coordinator (Bed management focus - 6 permissions)
(gen_random_uuid(), 'Bed Coordinator', 'BED COORDINATOR', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Bed allocation and management, patient admissions, transfers, discharges',
true, true, NOW(), NOW(), 4, 'system'),

-- 14. Ambulance Operator (Ambulance focus - 4 permissions)
(gen_random_uuid(), 'Ambulance Operator', 'AMBULANCE OPERATOR', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Ambulance booking, trip management, vehicle operations',
true, true, NOW(), NOW(), 4, 'system'),

-- 15. IT Support (System focus - 12 permissions)
(gen_random_uuid(), 'IT Support', 'IT SUPPORT', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'System configuration, user management, technical support, backups',
true, true, NOW(), NOW(), 3, 'system'),

-- 16. Quality Auditor (Quality focus - 8 permissions)
(gen_random_uuid(), 'Quality Auditor', 'QUALITY AUDITOR', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Quality assurance, incident reporting, audits, compliance monitoring',
true, true, NOW(), NOW(), 3, 'system'),

-- 17. Medical Records (MRD focus - 8 permissions)
(gen_random_uuid(), 'Medical Records', 'MEDICAL RECORDS', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Medical records department, document management, patient file access',
true, true, NOW(), NOW(), 3, 'system'),

-- 18. OT Manager (Operating theatre focus - 8 permissions)
(gen_random_uuid(), 'OT Manager', 'OT MANAGER', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Operating theatre management, surgery scheduling, equipment, post-op care',
true, true, NOW(), NOW(), 3, 'system'),

-- 19. Department Head (Department management - 20 permissions)
(gen_random_uuid(), 'Department Head', 'DEPARTMENT HEAD', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Department-level management, team oversight, department operations',
true, true, NOW(), NOW(), 2, 'system'),

-- 20. Branch Manager (Branch management - 15 permissions)
(gen_random_uuid(), 'Branch Manager', 'BRANCH MANAGER', gen_random_uuid()::text,
'00000000-0000-0000-0000-000000000000',
'Branch-level operations management, staff coordination, branch reporting',
true, true, NOW(), NOW(), 2, 'system')

ON CONFLICT ("NormalizedName", tenant_id) DO NOTHING;

-- Verification
DO $$
DECLARE
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count 
    FROM roles 
    WHERE "IsSystemRole" = true;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ System Roles Created: %', role_count;
    RAISE NOTICE '============================================';
END $$;

-- Display all roles
SELECT name, "Description", "IsActive" 
FROM roles 
WHERE "IsSystemRole" = true 
ORDER BY name;
