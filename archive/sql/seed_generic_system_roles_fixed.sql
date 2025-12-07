-- Create generic system roles (tenant-agnostic) for role-permission mappings
-- These are base roles that can be assigned across any tenant

-- System Administrator (Super Admin)
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',  -- System-level role (no specific tenant)
    'System Administrator',
    'SYSTEM ADMINISTRATOR',
    'Full system access with all permissions',
    1,
    true,
    true,
    NOW(),
    NOW(),
    'system'
) ON CONFLICT DO NOTHING;

-- Hospital Administrator
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Hospital Administrator',
    'HOSPITAL ADMINISTRATOR',
    'Hospital-wide administrative access',
    2,
    true,
    true,
    NOW(),
    'administrative'
) ON CONFLICT DO NOTHING;

-- Doctor
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Doctor',
    'DOCTOR',
    'Medical practitioner with clinical permissions',
    3,
    true,
    true,
    NOW(),
    'clinical'
) ON CONFLICT DO NOTHING;

-- Nurse
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Nurse',
    'NURSE',
    'Nursing staff with patient care permissions',
    4,
    true,
    true,
    NOW(),
    'clinical'
) ON CONFLICT DO NOTHING;

-- Pharmacist
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Pharmacist',
    'PHARMACIST',
    'Pharmacy staff with medication management permissions',
    5,
    true,
    true,
    NOW(),
    'clinical'
) ON CONFLICT DO NOTHING;

-- Lab Technician
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Lab Technician',
    'LAB TECHNICIAN',
    'Laboratory staff with diagnostic testing permissions',
    6,
    true,
    true,
    NOW(),
    'clinical'
) ON CONFLICT DO NOTHING;

-- Radiologist
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Radiologist',
    'RADIOLOGIST',
    'Radiology staff with imaging permissions',
    7,
    true,
    true,
    NOW(),
    'clinical'
) ON CONFLICT DO NOTHING;

-- Front Desk Officer
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Front Desk Officer',
    'FRONT DESK OFFICER',
    'Reception staff with patient registration permissions',
    8,
    true,
    true,
    NOW(),
    'administrative'
) ON CONFLICT DO NOTHING;

-- Billing Officer
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Billing Officer',
    'BILLING OFFICER',
    'Billing and finance staff with revenue cycle permissions',
    9,
    true,
    true,
    NOW(),
    'financial'
) ON CONFLICT DO NOTHING;

-- Inventory Manager
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Inventory Manager',
    'INVENTORY MANAGER',
    'Inventory and supply chain management permissions',
    10,
    true,
    true,
    NOW(),
    'operational'
) ON CONFLICT DO NOTHING;

-- HR Manager
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'HR Manager',
    'HR MANAGER',
    'Human resources management permissions',
    11,
    true,
    true,
    NOW(),
    'administrative'
) ON CONFLICT DO NOTHING;

-- Procurement Officer
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Procurement Officer',
    'PROCUREMENT OFFICER',
    'Vendor and procurement management permissions',
    12,
    true,
    true,
    NOW(),
    'operational'
) ON CONFLICT DO NOTHING;

-- Bed Coordinator
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Bed Coordinator',
    'BED COORDINATOR',
    'Bed and ward management permissions',
    13,
    true,
    true,
    NOW(),
    'operational'
) ON CONFLICT DO NOTHING;

-- Ambulance Operator
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Ambulance Operator',
    'AMBULANCE OPERATOR',
    'Ambulance and emergency transport permissions',
    14,
    true,
    true,
    NOW(),
    'operational'
) ON CONFLICT DO NOTHING;

-- IT Support
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'IT Support',
    'IT SUPPORT',
    'IT and technical support permissions',
    15,
    true,
    true,
    NOW(),
    'technical'
) ON CONFLICT DO NOTHING;

-- Quality Auditor
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Quality Auditor',
    'QUALITY AUDITOR',
    'Quality assurance and audit permissions',
    16,
    true,
    true,
    NOW(),
    'compliance'
) ON CONFLICT DO NOTHING;

-- Medical Records Officer
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Medical Records Officer',
    'MEDICAL RECORDS OFFICER',
    'Medical records and documentation permissions',
    17,
    true,
    true,
    NOW(),
    'administrative'
) ON CONFLICT DO NOTHING;

-- OT Manager
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'OT Manager',
    'OT MANAGER',
    'Operation theater management permissions',
    18,
    true,
    true,
    NOW(),
    'clinical'
) ON CONFLICT DO NOTHING;

-- Department Head
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Department Head',
    'DEPARTMENT HEAD',
    'Department-level management permissions',
    19,
    true,
    true,
    NOW(),
    'management'
) ON CONFLICT DO NOTHING;

-- Branch Manager
INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", role_type)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Branch Manager',
    'BRANCH MANAGER',
    'Branch-level management permissions',
    20,
    true,
    true,
    NOW(),
    'management'
) ON CONFLICT DO NOTHING;

-- Verification
SELECT 
    name,
    "NormalizedName",
    "RoleLevel"
FROM roles
WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
ORDER BY "RoleLevel";
