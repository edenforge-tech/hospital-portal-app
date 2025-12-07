-- Create sample users with multi-department access assignments
-- This demonstrates the multi-department user access functionality

-- Set session variables to avoid audit trigger issues
SET app.user_id = '550e8400-e29b-41d4-a716-446655440000';
SET app.user_name = 'system';
SET app.session_id = 'sample_data_session';

-- Insert sample multi-department user assignments

-- Insert sample multi-department user assignments
-- Example 1: Doctor assigned to multiple departments

-- Doctor assigned to Ophthalmology (Primary) - All permissions
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111'::uuid, -- Mock doctor user ID
    (SELECT id FROM departments WHERE name = 'Ophthalmology' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    true, 'full', 'active', 'Primary department - Full access to ophthalmology services'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Doctor assigned to Optometry (Secondary) - All permissions
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111'::uuid, -- Same doctor user
    (SELECT id FROM departments WHERE name = 'Optometry' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'full', 'active', 'Secondary department - Full access to optometry services'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Doctor assigned to Operation Theatre (Read-only) - Limited permissions
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111'::uuid, -- Same doctor user
    (SELECT id FROM departments WHERE name = 'Operation Theatre' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'read_only', 'active', 'Read-only access for surgical observation'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Example 2: Nurse assigned to multiple departments

-- Nurse assigned to Wards/IPD (Primary)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '22222222-2222-2222-2222-222222222222'::uuid, -- Mock nurse user ID
    (SELECT id FROM departments WHERE name = 'Wards/IPD' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    true, 'full', 'active', 'Primary department - Full nursing care access'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Nurse assigned to Emergency/Casualty (Secondary)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '22222222-2222-2222-2222-222222222222'::uuid, -- Same nurse user
    (SELECT id FROM departments WHERE name = 'Emergency/Casualty' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'read_write', 'active', 'Secondary department - Emergency response access'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Nurse assigned to Operation Theatre (Approval-only)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '22222222-2222-2222-2222-222222222222'::uuid, -- Same nurse user
    (SELECT id FROM departments WHERE name = 'Operation Theatre' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'approval_only', 'active', 'Approval-only access for surgical assistance'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Example 3: Pharmacist with cross-department access

-- Pharmacist assigned to Pharmacy (Primary)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '33333333-3333-3333-3333-333333333333'::uuid, -- Mock pharmacist user ID
    (SELECT id FROM departments WHERE name = 'Pharmacy' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    true, 'full', 'active', 'Primary department - Full pharmacy management'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Pharmacist assigned to Laboratory (Read-only for drug testing)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '33333333-3333-3333-3333-333333333333'::uuid, -- Same pharmacist user
    (SELECT id FROM departments WHERE name = 'Laboratory' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'read_only', 'active', 'Read-only access for drug testing results'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Pharmacist assigned to Wards/IPD (Limited for medication administration)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '33333333-3333-3333-3333-333333333333'::uuid, -- Same pharmacist user
    (SELECT id FROM departments WHERE name = 'Wards/IPD' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'limited', 'active', 'Limited access for ward medication checks'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Example 4: Admin user with broad access

-- Admin assigned to Administration (Primary)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '44444444-4444-4444-4444-444444444444'::uuid, -- Mock admin user ID
    (SELECT id FROM departments WHERE name = 'Administration' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    true, 'full', 'active', 'Primary department - Administrative oversight'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Admin assigned to IT/HIS Support (Full access)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '44444444-4444-4444-4444-444444444444'::uuid, -- Same admin user
    (SELECT id FROM departments WHERE name = 'IT/HIS Support' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'full', 'active', 'IT support and system administration'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;

-- Admin assigned to Finance (Read-write access)
INSERT INTO user_department_access (
    tenant_id, user_id, department_id, is_primary, access_level, status, notes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '44444444-4444-4444-4444-444444444444'::uuid, -- Same admin user
    (SELECT id FROM departments WHERE name = 'Finance' AND tenant_id = '550e8400-e29b-41d4-a716-446655440000'),
    false, 'read_write', 'active', 'Financial oversight and reporting'
) ON CONFLICT (tenant_id, user_id, department_id, deleted_at) DO NOTHING;