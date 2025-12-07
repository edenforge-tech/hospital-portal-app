-- =====================================================
-- ABAC (ATTRIBUTE-BASED ACCESS CONTROL) IMPLEMENTATION
-- Add conditional and time-limited permissions
-- =====================================================

-- Add time-limited permissions (temporary access examples)
-- Emergency access for doctors during night shifts
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, effective_from, effective_until, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"emergency_access": true, "shift": "night"}',
    NOW(),
    NOW() + INTERVAL '1 year',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Doctor', 'Nurse', 'Anesthesiologist', 'Surgeon')
  AND p.module = 'Emergency'
  AND p.action IN ('view', 'admit', 'stabilize');

-- Conditional permissions based on patient attributes
-- Pediatricians can only access patients under 18
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"patient_age": {"max": 18}, "department": "pediatrics"}',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Pediatrician'
  AND p.module = 'Patient Management'
  AND p.action IN ('view', 'edit', 'create');

-- Gynecologists access restricted to female patients
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"patient_gender": "female", "department": "gynecology"}',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Gynecologist'
  AND p.module IN ('Patient Management', 'Clinical Assessment')
  AND p.action IN ('view', 'edit', 'create');

-- ICU access with critical condition requirement
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"patient_condition": "critical", "requires_icu_care": true}',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Anesthesiologist', 'Surgeon', 'Doctor')
  AND p.module = 'ICU'
  AND p.action IN ('admit', 'monitor', 'manage_ventilators');

-- Time-limited training access for new staff
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, effective_from, effective_until, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"training_mode": true, "supervisor_approval_required": true}',
    NOW(),
    NOW() + INTERVAL '3 months',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Nurse', 'Lab Technician')
  AND p.module IN ('Patient Management', 'Laboratory')
  AND p.action = 'view';

-- Department-specific access restrictions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"allowed_departments": ["cardiology"], "patient_location": "cardiology_ward"}',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Cardiologist'
  AND p.module = 'Patient Management'
  AND p.action IN ('view', 'edit');

-- Emergency override conditions
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"emergency_situation": true, "life_threatening": true, "bypass_normal_procedures": true}',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Doctor', 'Surgeon', 'Anesthesiologist')
  AND p.module IN ('Operating Theatre', 'ICU', 'Emergency')
  AND p.action IN ('admit', 'transfer', 'stabilize');

-- Age-based access for psychiatrists (adult patients only)
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"patient_age": {"min": 18}, "mental_health_assessment_required": true}',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Psychiatrist'
  AND p.module = 'Clinical Assessment'
  AND p.action IN ('view', 'create', 'edit');

-- Time-limited administrative access for auditors
INSERT INTO role_permissions (role_id, permission_id, tenant_id, condition, effective_from, effective_until, granted_by_user_id, granted_at)
SELECT
    r.id,
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    '{"audit_purpose_only": true, "read_only_access": true}',
    NOW(),
    NOW() + INTERVAL '1 month',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Hospital Administrator'
  AND p.module IN ('Medical Records', 'Billing', 'Quality')
  AND p.action = 'view';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'ABAC conditions implemented successfully!';
    RAISE NOTICE '✓ Added time-limited permissions for temporary access';
    RAISE NOTICE '✓ Added conditional permissions based on patient attributes';
    RAISE NOTICE '✓ Added department-specific and emergency override conditions';
    RAISE NOTICE '✓ ABAC features now active in the system';
END $$;