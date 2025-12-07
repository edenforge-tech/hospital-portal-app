-- Create 20 generic system roles (tenant-agnostic) for RBAC permission mappings
-- These roles will be mapped to the 237 new permissions

-- Note: Using explicit NULL checks to avoid conflicts with existing tenant-specific roles

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'System Administrator',
    'SYSTEM ADMINISTRATOR',
    'Full system access with all permissions',
    1,
    true,
    true,
    NOW(),
    NOW(),
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'SYSTEM ADMINISTRATOR' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Hospital Administrator',
    'HOSPITAL ADMINISTRATOR',
    'Hospital-wide administrative access',
    2,
    true,
    true,
    NOW(),
    NOW(),
    'administrative'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'HOSPITAL ADMINISTRATOR' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Doctor',
    'DOCTOR',
    'Medical practitioner with clinical permissions',
    3,
    true,
    true,
    NOW(),
    NOW(),
    'clinical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'DOCTOR' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Nurse',
    'NURSE',
    'Nursing staff with patient care permissions',
    4,
    true,
    true,
    NOW(),
    NOW(),
    'clinical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'NURSE' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Pharmacist',
    'PHARMACIST',
    'Pharmacy staff with medication management permissions',
    5,
    true,
    true,
    NOW(),
    NOW(),
    'clinical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'PHARMACIST' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Lab Technician',
    'LAB TECHNICIAN',
    'Laboratory staff with diagnostic testing permissions',
    6,
    true,
    true,
    NOW(),
    NOW(),
    'clinical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'LAB TECHNICIAN' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Radiologist',
    'RADIOLOGIST',
    'Radiology staff with imaging permissions',
    7,
    true,
    true,
    NOW(),
    NOW(),
    'clinical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'RADIOLOGIST' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Front Desk Officer',
    'FRONT DESK OFFICER',
    'Reception staff with patient registration permissions',
    8,
    true,
    true,
    NOW(),
    NOW(),
    'administrative'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'FRONT DESK OFFICER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Billing Officer',
    'BILLING OFFICER',
    'Billing and finance staff with revenue cycle permissions',
    9,
    true,
    true,
    NOW(),
    NOW(),
    'financial'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'BILLING OFFICER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Inventory Manager',
    'INVENTORY MANAGER',
    'Inventory and supply chain management permissions',
    10,
    true,
    true,
    NOW(),
    NOW(),
    'operational'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'INVENTORY MANAGER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'HR Manager',
    'HR MANAGER',
    'Human resources management permissions',
    11,
    true,
    true,
    NOW(),
    NOW(),
    'administrative'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'HR MANAGER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Procurement Officer',
    'PROCUREMENT OFFICER',
    'Vendor and procurement management permissions',
    12,
    true,
    true,
    NOW(),
    NOW(),
    'operational'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'PROCUREMENT OFFICER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Bed Coordinator',
    'BED COORDINATOR',
    'Bed and ward management permissions',
    13,
    true,
    true,
    NOW(),
    NOW(),
    'operational'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'BED COORDINATOR' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Ambulance Operator',
    'AMBULANCE OPERATOR',
    'Ambulance and emergency transport permissions',
    14,
    true,
    true,
    NOW(),
    NOW(),
    'operational'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'AMBULANCE OPERATOR' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'IT Support',
    'IT SUPPORT',
    'IT and technical support permissions',
    15,
    true,
    true,
    NOW(),
    NOW(),
    'technical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'IT SUPPORT' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Quality Auditor',
    'QUALITY AUDITOR',
    'Quality assurance and audit permissions',
    16,
    true,
    true,
    NOW(),
    NOW(),
    'compliance'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'QUALITY AUDITOR' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Medical Records Officer',
    'MEDICAL RECORDS OFFICER',
    'Medical records and documentation permissions',
    17,
    true,
    true,
    NOW(),
    NOW(),
    'administrative'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'MEDICAL RECORDS OFFICER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'OT Manager',
    'OT MANAGER',
    'Operation theater management permissions',
    18,
    true,
    true,
    NOW(),
    NOW(),
    'clinical'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'OT MANAGER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Department Head',
    'DEPARTMENT HEAD',
    'Department-level management permissions',
    19,
    true,
    true,
    NOW(),
    NOW(),
    'management'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'DEPARTMENT HEAD' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO roles (id, tenant_id, name, "NormalizedName", "Description", "RoleLevel", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", role_type)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Branch Manager',
    'BRANCH MANAGER',
    'Branch-level management permissions',
    20,
    true,
    true,
    NOW(),
    NOW(),
    'management'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE "NormalizedName" = 'BRANCH MANAGER' AND tenant_id = '00000000-0000-0000-0000-000000000000'
);

-- Verification: Show newly created generic roles
SELECT 
    name,
    "NormalizedName",
    "RoleLevel",
    role_type
FROM roles
WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
ORDER BY "RoleLevel";

-- Count total
SELECT COUNT(*) as generic_system_roles_count
FROM roles
WHERE tenant_id = '00000000-0000-0000-0000-000000000000';
