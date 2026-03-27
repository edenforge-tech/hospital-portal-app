-- =====================================================================
-- HIPAA PRESET ROLES MIGRATION
-- Hospital Portal - Phase 3 Advanced Permissions
-- Date: January 23, 2026
-- =====================================================================

-- First, ensure we have the necessary permissions defined
-- Insert HIPAA-specific permissions if they don't exist

INSERT INTO permissions (id, "Name", "NormalizedName", resource, action, description, category, created_at)
VALUES
    (gen_random_uuid(), 'patient.read', 'PATIENT.READ', 'patient', 'read', 'View patient information', 'clinical', NOW()),
    (gen_random_uuid(), 'audit.view', 'AUDIT.VIEW', 'audit', 'view', 'View audit logs', 'compliance', NOW()),
    (gen_random_uuid(), 'consent.manage', 'CONSENT.MANAGE', 'consent', 'manage', 'Manage patient consents', 'compliance', NOW()),
    (gen_random_uuid(), 'privacy_policy.update', 'PRIVACY_POLICY.UPDATE', 'policy', 'update', 'Update privacy policies', 'compliance', NOW()),
    (gen_random_uuid(), 'breach_notification.create', 'BREACH_NOTIFICATION.CREATE', 'breach', 'create', 'Create breach notifications', 'compliance', NOW()),
    (gen_random_uuid(), 'compliance_report.view', 'COMPLIANCE_REPORT.VIEW', 'compliance_report', 'view', 'View compliance reports', 'compliance', NOW()),
    (gen_random_uuid(), 'access_review.conduct', 'ACCESS_REVIEW.CONDUCT', 'access_review', 'conduct', 'Conduct access reviews', 'compliance', NOW()),
    (gen_random_uuid(), 'user.view', 'USER.VIEW', 'user', 'view', 'View user information', 'admin', NOW()),
    (gen_random_uuid(), 'role.view', 'ROLE.VIEW', 'role', 'view', 'View roles', 'admin', NOW()),
    (gen_random_uuid(), 'permission.view', 'PERMISSION.VIEW', 'permission', 'view', 'View permissions', 'admin', NOW()),
    (gen_random_uuid(), 'security_incident.manage', 'SECURITY_INCIDENT.MANAGE', 'security', 'manage', 'Manage security incidents', 'security', NOW()),
    (gen_random_uuid(), 'risk_assessment.conduct', 'RISK_ASSESSMENT.CONDUCT', 'risk', 'assess', 'Conduct risk assessments', 'security', NOW()),
    (gen_random_uuid(), 'access_control.manage', 'ACCESS_CONTROL.MANAGE', 'access', 'manage', 'Manage access controls', 'security', NOW()),
    (gen_random_uuid(), 'encryption.configure', 'ENCRYPTION.CONFIGURE', 'encryption', 'configure', 'Configure encryption settings', 'security', NOW()),
    (gen_random_uuid(), 'policy.read', 'POLICY.READ', 'policy', 'read', 'Read policies', 'compliance', NOW()),
    (gen_random_uuid(), 'access_review.view', 'ACCESS_REVIEW.VIEW', 'access_review', 'view', 'View access reviews', 'compliance', NOW())
ON CONFLICT ("NormalizedName") DO NOTHING;

-- Create HIPAA preset roles
INSERT INTO app_roles (id, "Name", "Description", role_code, role_category, job_level, requires_license, max_assignments, created_at)
VALUES
    (gen_random_uuid(), 
     'HIPAA Privacy Officer', 
     'Responsible for privacy compliance and patient data protection. Manages privacy policies, breach notifications, and access reviews.',
     'HIPAA_PRIV_OFF',
     'compliance',
     5,
     TRUE,
     3,
     NOW()),
    (gen_random_uuid(), 
     'HIPAA Security Officer', 
     'Responsible for security compliance and information security. Manages security incidents, risk assessments, and access controls.',
     'HIPAA_SEC_OFF',
     'compliance',
     5,
     TRUE,
     3,
     NOW()),
    (gen_random_uuid(), 
     'Compliance Auditor', 
     'External or internal auditor with read-only access to compliance data, policies, and audit logs.',
     'COMP_AUDITOR',
     'audit',
     3,
     FALSE,
     10,
     NOW())
ON CONFLICT ("Name") DO NOTHING;

-- Assign permissions to HIPAA Privacy Officer role
INSERT INTO role_permission (role_id, permission_id, created_at)
SELECT 
    r.id, 
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r."Name" = 'HIPAA Privacy Officer'
  AND p."NormalizedName" IN (
    'PATIENT.READ',
    'AUDIT.VIEW',
    'CONSENT.MANAGE',
    'PRIVACY_POLICY.UPDATE',
    'BREACH_NOTIFICATION.CREATE',
    'COMPLIANCE_REPORT.VIEW',
    'ACCESS_REVIEW.CONDUCT'
  )
ON CONFLICT DO NOTHING;

-- Assign permissions to HIPAA Security Officer role
INSERT INTO role_permission (role_id, permission_id, created_at)
SELECT 
    r.id, 
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r."Name" = 'HIPAA Security Officer'
  AND p."NormalizedName" IN (
    'USER.VIEW',
    'ROLE.VIEW',
    'PERMISSION.VIEW',
    'AUDIT.VIEW',
    'SECURITY_INCIDENT.MANAGE',
    'RISK_ASSESSMENT.CONDUCT',
    'ACCESS_CONTROL.MANAGE',
    'ENCRYPTION.CONFIGURE'
  )
ON CONFLICT DO NOTHING;

-- Assign permissions to Compliance Auditor role (read-only)
INSERT INTO role_permission (role_id, permission_id, created_at)
SELECT 
    r.id, 
    p.id,
    NOW()
FROM app_roles r
CROSS JOIN permissions p
WHERE r."Name" = 'Compliance Auditor'
  AND p."NormalizedName" IN (
    'AUDIT.VIEW',
    'COMPLIANCE_REPORT.VIEW',
    'POLICY.READ',
    'ACCESS_REVIEW.VIEW'
  )
ON CONFLICT DO NOTHING;

-- Insert permission dependencies (e.g., update requires read)
INSERT INTO permission_dependency (parent_permission_id, child_permission_id, dependency_reason)
SELECT 
    p1.id,
    p2.id,
    'Viewing is required before updating'
FROM permissions p1
CROSS JOIN permissions p2
WHERE p1."NormalizedName" = 'PATIENT.READ'
  AND p2."NormalizedName" = 'PATIENT.UPDATE'
ON CONFLICT DO NOTHING;

INSERT INTO permission_dependency (parent_permission_id, child_permission_id, dependency_reason)
SELECT 
    p1.id,
    p2.id,
    'Reading policy is required before updating'
FROM permissions p1
CROSS JOIN permissions p2
WHERE p1."NormalizedName" = 'POLICY.READ'
  AND p2."NormalizedName" = 'PRIVACY_POLICY.UPDATE'
ON CONFLICT DO NOTHING;

-- Verification query
DO $$
DECLARE
    privacy_officer_count INTEGER;
    security_officer_count INTEGER;
    auditor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO privacy_officer_count FROM app_roles WHERE "Name" = 'HIPAA Privacy Officer';
    SELECT COUNT(*) INTO security_officer_count FROM app_roles WHERE "Name" = 'HIPAA Security Officer';
    SELECT COUNT(*) INTO auditor_count FROM app_roles WHERE "Name" = 'Compliance Auditor';
    
    RAISE NOTICE 'HIPAA Preset Roles Created:';
    RAISE NOTICE '  - Privacy Officer: % role(s)', privacy_officer_count;
    RAISE NOTICE '  - Security Officer: % role(s)', security_officer_count;
    RAISE NOTICE '  - Compliance Auditor: % role(s)', auditor_count;
END $$;
