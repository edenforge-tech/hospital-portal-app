-- =====================================================
-- SPECIALIST ROLE PERMISSIONS ASSIGNMENT
-- Assign appropriate permissions to specialist roles
-- =====================================================

-- Get role IDs for specialists
CREATE TEMP TABLE specialist_roles AS
SELECT id, name FROM roles WHERE is_system_role = true AND name IN (
    'Cardiologist', 'Neurologist', 'Pediatrician', 'Gynecologist',
    'Ophthalmologist', 'Dermatologist', 'Dentist', 'Anesthesiologist',
    'Surgeon', 'Psychiatrist', 'Physical Therapist'
);

-- Base permissions for all specialists (similar to Doctor role)
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records')
   OR p.code IN ('appointments.view', 'appointments.create', 'appointments.edit', 'appointments.view_schedule');

-- Specialty-specific permissions

-- Cardiologist - Heart and cardiovascular focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Cardiologist'
  AND (p.module IN ('Imaging', 'Laboratory')
       OR p.resource LIKE '%cardio%'
       OR p.resource LIKE '%heart%'
       OR p.code LIKE '%cardio%');

-- Neurologist - Brain and nervous system focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Neurologist'
  AND (p.module IN ('Imaging', 'Laboratory')
       OR p.resource LIKE '%neuro%'
       OR p.resource LIKE '%brain%'
       OR p.code LIKE '%neuro%');

-- Pediatrician - Child healthcare focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Pediatrician'
  AND p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records', 'Laboratory');

-- Gynecologist - Women's health focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Gynecologist'
  AND (p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records', 'Laboratory', 'Imaging')
       OR p.resource LIKE '%gyneco%'
       OR p.resource LIKE '%women%'
       OR p.code LIKE '%gyneco%');

-- Ophthalmologist - Eye care focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Ophthalmologist'
  AND p.module IN ('Optical Shop', 'Imaging');

-- Dermatologist - Skin care focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Dermatologist'
  AND p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records');

-- Dentist - Dental care focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Dentist'
  AND p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records', 'Imaging');

-- Anesthesiologist - Anesthesia and pain management focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Anesthesiologist'
  AND p.module IN ('Operating Theatre', 'ICU', 'Patient Management', 'Clinical Assessment');

-- Surgeon - Surgical procedures focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Surgeon'
  AND p.module IN ('Operating Theatre', 'Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records');

-- Psychiatrist - Mental health focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Psychiatrist'
  AND p.module IN ('Patient Management', 'Clinical Assessment', 'Prescriptions', 'Medical Records');

-- Physical Therapist - Rehabilitation focus
INSERT INTO role_permissions (role_id, permission_id, tenant_id, granted_by_user_id)
SELECT
    sr.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
FROM specialist_roles sr
CROSS JOIN permissions p
WHERE sr.name = 'Physical Therapist'
  AND p.module IN ('Patient Management', 'Clinical Assessment', 'Medical Records');

-- Clean up
DROP TABLE specialist_roles;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Specialist role permissions assigned successfully!';
    RAISE NOTICE '✓ All 11 specialist roles now have appropriate permissions';
    RAISE NOTICE '✓ Base clinical permissions + specialty-specific permissions assigned';
END $$;