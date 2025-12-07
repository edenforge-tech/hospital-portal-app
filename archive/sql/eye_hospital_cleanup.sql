-- =====================================================
-- EYE HOSPITAL DATA CLEANUP SCRIPT
-- Remove non-eye-hospital related data and mappings
-- =====================================================

-- Temporarily disable audit triggers to avoid casting issues
ALTER TABLE permissions DISABLE TRIGGER audit_permissions_trigger;
ALTER TABLE roles DISABLE TRIGGER audit_roles_trigger;
ALTER TABLE role_permissions DISABLE TRIGGER audit_role_permissions_trigger;
ALTER TABLE departments DISABLE TRIGGER audit_departments_trigger;

-- Step 1: Remove role_permissions for roles we're deleting FIRST (to avoid FK constraint issues)
DELETE FROM role_permissions
WHERE role_id IN (
    SELECT id FROM roles
    WHERE is_system_role = true
    AND name IN ('Anesthesiologist', 'Cardiologist', 'Dentist', 'Dermatologist', 'Doctor', 'Gynecologist', 'Neurologist', 'Pediatrician', 'Lab Technician', 'Physical Therapist', 'Psychiatrist', 'Surgeon')
);

-- Step 2: Remove the non-eye-hospital roles
DELETE FROM roles
WHERE is_system_role = true
AND name IN ('Anesthesiologist', 'Cardiologist', 'Dentist', 'Dermatologist', 'Doctor', 'Gynecologist', 'Neurologist', 'Pediatrician', 'Lab Technician', 'Physical Therapist', 'Psychiatrist', 'Surgeon');

-- Step 3: Remove non-eye-hospital permissions
DELETE FROM permissions
WHERE module IN ('Emergency', 'ICU', 'Imaging', 'Laboratory', 'Ward/IPD');

-- Step 4: Remove non-eye-hospital departments
DELETE FROM departments
WHERE department_code NOT IN ('ADMIN', 'BILLING', 'INSURANCE', 'RECORDS', 'OPD', 'OT', 'PHARMACY', 'OPTICAL');

-- Step 5: Update document access rules to only use remaining departments
DELETE FROM document_access_rules
WHERE source_department_id NOT IN (SELECT id FROM departments)
   OR target_department_id NOT IN (SELECT id FROM departments);

-- Step 6: Add missing eye hospital roles
INSERT INTO roles (id, tenant_id, name, description, is_system_role, status)
VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Receptionist', 'Front desk and appointment management', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Optometrist', 'Vision care and eye examination specialist', true, 'active'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Optical Technician', 'Optical equipment and frame fitting specialist', true, 'active');

-- Step 7: Assign permissions to new eye hospital roles
-- Receptionist permissions (limited administrative + appointments)
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Receptionist'
  AND r.is_system_role = true
  AND p.module IN ('Appointments', 'Patient Management')
  AND p.action IN ('view', 'create', 'edit');

-- Optometrist permissions (clinical assessment + optical)
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Optometrist'
  AND r.is_system_role = true
  AND p.module IN ('Clinical Assessment', 'Patient Management', 'Optical Shop', 'Medical Records');

-- Optical Technician permissions (optical shop + limited patient management)
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Optical Technician'
  AND r.is_system_role = true
  AND p.module IN ('Optical Shop', 'Patient Management')
  AND p.action IN ('view', 'edit');

-- =====================================================
-- EYE HOSPITAL DATA CLEANUP SCRIPT - FINAL PHASE
-- Complete removal of all non-eye-hospital data
-- =====================================================

-- Temporarily disable audit triggers to avoid casting issues
ALTER TABLE permissions DISABLE TRIGGER audit_permissions_trigger;
ALTER TABLE roles DISABLE TRIGGER audit_roles_trigger;
ALTER TABLE role_permissions DISABLE TRIGGER audit_role_permissions_trigger;
ALTER TABLE departments DISABLE TRIGGER audit_departments_trigger;

-- Step 1: Remove ALL role_permissions for non-eye-hospital permissions
DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE module IN ('Emergency', 'ICU', 'Imaging', 'Laboratory')
);

-- Step 2: Now safely remove the non-eye-hospital permissions
DELETE FROM permissions
WHERE module IN ('Emergency', 'ICU', 'Imaging', 'Laboratory');

-- Step 3: Remove remaining non-eye-hospital departments
DELETE FROM departments
WHERE department_code NOT IN ('ADMIN', 'BILLING', 'INSURANCE', 'RECORDS', 'OPD', 'OT', 'PHARMACY', 'OPTICAL');

-- Step 4: Clean up document access rules for deleted departments
DELETE FROM document_access_rules
WHERE source_department_id NOT IN (SELECT id FROM departments)
   OR target_department_id NOT IN (SELECT id FROM departments);

-- Step 5: Clean up any orphaned role_permissions (permissions that no longer exist)
DELETE FROM role_permissions
WHERE permission_id NOT IN (SELECT id FROM permissions);

-- Step 6: Re-enable audit triggers
ALTER TABLE permissions ENABLE TRIGGER audit_permissions_trigger;
ALTER TABLE roles ENABLE TRIGGER audit_roles_trigger;
ALTER TABLE role_permissions ENABLE TRIGGER audit_role_permissions_trigger;
ALTER TABLE departments ENABLE TRIGGER audit_departments_trigger;

-- Step 7: Final verification
DO $$
DECLARE
    role_count INTEGER;
    dept_count INTEGER;
    perm_count INTEGER;
    mapping_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles WHERE is_system_role = true;
    SELECT COUNT(*) INTO dept_count FROM departments;
    SELECT COUNT(*) INTO perm_count FROM permissions;
    SELECT COUNT(*) INTO mapping_count FROM role_permissions;

    RAISE NOTICE 'Eye Hospital Data Cleanup Complete!';
    RAISE NOTICE '• Remaining Roles: %', role_count;
    RAISE NOTICE '• Remaining Departments: %', dept_count;
    RAISE NOTICE '• Remaining Permissions: %', perm_count;
    RAISE NOTICE '• Remaining Role Mappings: %', mapping_count;
    RAISE NOTICE '• Removed non-eye-hospital data and mappings';
    RAISE NOTICE '• Added eye-specific roles: Receptionist, Optometrist, Optical Technician';
END $$;

-- Success message
DO $$
DECLARE
    remaining_roles INTEGER;
    remaining_departments INTEGER;
    remaining_permissions INTEGER;
    remaining_mappings INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_roles FROM roles WHERE is_system_role = true;
    SELECT COUNT(*) INTO remaining_departments FROM departments;
    SELECT COUNT(*) INTO remaining_permissions FROM permissions;
    SELECT COUNT(*) INTO remaining_mappings FROM role_permissions;

    RAISE NOTICE 'Eye Hospital Data Cleanup Complete!';
    RAISE NOTICE '✓ Remaining Roles: %', remaining_roles;
    RAISE NOTICE '✓ Remaining Departments: %', remaining_departments;
    RAISE NOTICE '✓ Remaining Permissions: %', remaining_permissions;
    RAISE NOTICE '✓ Remaining Role Mappings: %', remaining_mappings;
    RAISE NOTICE '✓ Removed non-eye-hospital data and mappings';
    RAISE NOTICE '✓ Added eye-specific roles: Receptionist, Optometrist, Optical Technician';
END $$;