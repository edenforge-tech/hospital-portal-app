-- ============================================
-- Complete 297 Permissions Seed Script
-- Hospital Portal RBAC Implementation
-- Generated: 2025-11-10 17.06.36
-- ============================================

-- Insert all 297 permissions
-- Using ON CONFLICT to avoid duplicates
-- Tenant ID: 00000000-0000-0000-0000-000000000000 (system-wide)

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_record.create',
    'Create Patient Record',
    'patient_management',
    'create',
    'patient_record',
    'global',
    'Create Patient Record permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_record.read',
    'Read Patient Record',
    'patient_management',
    'read',
    'patient_record',
    'global',
    'Read Patient Record permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_record.update',
    'Update Patient Record',
    'patient_management',
    'update',
    'patient_record',
    'global',
    'Update Patient Record permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_record.delete',
    'Delete Patient Record',
    'patient_management',
    'delete',
    'patient_record',
    'global',
    'Delete Patient Record permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_demographics.create',
    'Create Patient Demographics',
    'patient_management',
    'create',
    'patient_demographics',
    'global',
    'Create Patient Demographics permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_demographics.read',
    'Read Patient Demographics',
    'patient_management',
    'read',
    'patient_demographics',
    'global',
    'Read Patient Demographics permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_demographics.update',
    'Update Patient Demographics',
    'patient_management',
    'update',
    'patient_demographics',
    'global',
    'Update Patient Demographics permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_demographics.delete',
    'Delete Patient Demographics',
    'patient_management',
    'delete',
    'patient_demographics',
    'global',
    'Delete Patient Demographics permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_contact.create',
    'Create Patient Contact',
    'patient_management',
    'create',
    'patient_contact',
    'global',
    'Create Patient Contact permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_contact.read',
    'Read Patient Contact',
    'patient_management',
    'read',
    'patient_contact',
    'global',
    'Read Patient Contact permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_contact.update',
    'Update Patient Contact',
    'patient_management',
    'update',
    'patient_contact',
    'global',
    'Update Patient Contact permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_contact.delete',
    'Delete Patient Contact',
    'patient_management',
    'delete',
    'patient_contact',
    'global',
    'Delete Patient Contact permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_consent.create',
    'Create Patient Consent',
    'patient_management',
    'create',
    'patient_consent',
    'global',
    'Create Patient Consent permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_consent.read',
    'Read Patient Consent',
    'patient_management',
    'read',
    'patient_consent',
    'global',
    'Read Patient Consent permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_consent.update',
    'Update Patient Consent',
    'patient_management',
    'update',
    'patient_consent',
    'global',
    'Update Patient Consent permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_consent.delete',
    'Delete Patient Consent',
    'patient_management',
    'delete',
    'patient_consent',
    'global',
    'Delete Patient Consent permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_document.upload',
    'Upload Patient Document',
    'patient_management',
    'upload',
    'patient_document',
    'global',
    'Upload Patient Document permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_document.read',
    'Read Patient Document',
    'patient_management',
    'read',
    'patient_document',
    'global',
    'Read Patient Document permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_document.update',
    'Update Patient Document',
    'patient_management',
    'update',
    'patient_document',
    'global',
    'Update Patient Document permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_document.delete',
    'Delete Patient Document',
    'patient_management',
    'delete',
    'patient_document',
    'global',
    'Delete Patient Document permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_preferences.create',
    'Create Patient Preferences',
    'patient_management',
    'create',
    'patient_preferences',
    'global',
    'Create Patient Preferences permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_preferences.read',
    'Read Patient Preferences',
    'patient_management',
    'read',
    'patient_preferences',
    'global',
    'Read Patient Preferences permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_preferences.update',
    'Update Patient Preferences',
    'patient_management',
    'update',
    'patient_preferences',
    'global',
    'Update Patient Preferences permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'patient_management.patient_preferences.delete',
    'Delete Patient Preferences',
    'patient_management',
    'delete',
    'patient_preferences',
    'global',
    'Delete Patient Preferences permission for patient_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.assessment.create',
    'Create Clinical Assessment',
    'clinical_documentation',
    'create',
    'assessment',
    'global',
    'Create Clinical Assessment permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.assessment.read',
    'Read Clinical Assessment',
    'clinical_documentation',
    'read',
    'assessment',
    'global',
    'Read Clinical Assessment permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.assessment.update',
    'Update Clinical Assessment',
    'clinical_documentation',
    'update',
    'assessment',
    'global',
    'Update Clinical Assessment permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.assessment.delete',
    'Delete Clinical Assessment',
    'clinical_documentation',
    'delete',
    'assessment',
    'global',
    'Delete Clinical Assessment permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.diagnosis.create',
    'Create Diagnosis',
    'clinical_documentation',
    'create',
    'diagnosis',
    'global',
    'Create Diagnosis permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.diagnosis.read',
    'Read Diagnosis',
    'clinical_documentation',
    'read',
    'diagnosis',
    'global',
    'Read Diagnosis permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.diagnosis.update',
    'Update Diagnosis',
    'clinical_documentation',
    'update',
    'diagnosis',
    'global',
    'Update Diagnosis permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.diagnosis.delete',
    'Delete Diagnosis',
    'clinical_documentation',
    'delete',
    'diagnosis',
    'global',
    'Delete Diagnosis permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.clinical_notes.create',
    'Create Clinical Notes',
    'clinical_documentation',
    'create',
    'clinical_notes',
    'global',
    'Create Clinical Notes permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.clinical_notes.read',
    'Read Clinical Notes',
    'clinical_documentation',
    'read',
    'clinical_notes',
    'global',
    'Read Clinical Notes permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.clinical_notes.update',
    'Update Clinical Notes',
    'clinical_documentation',
    'update',
    'clinical_notes',
    'global',
    'Update Clinical Notes permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.clinical_notes.delete',
    'Delete Clinical Notes',
    'clinical_documentation',
    'delete',
    'clinical_notes',
    'global',
    'Delete Clinical Notes permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.examination.create',
    'Create Examination',
    'clinical_documentation',
    'create',
    'examination',
    'global',
    'Create Examination permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.examination.read',
    'Read Examination',
    'clinical_documentation',
    'read',
    'examination',
    'global',
    'Read Examination permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.examination.update',
    'Update Examination',
    'clinical_documentation',
    'update',
    'examination',
    'global',
    'Update Examination permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.examination.delete',
    'Delete Examination',
    'clinical_documentation',
    'delete',
    'examination',
    'global',
    'Delete Examination permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.treatment_plan.create',
    'Create Treatment Plan',
    'clinical_documentation',
    'create',
    'treatment_plan',
    'global',
    'Create Treatment Plan permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.treatment_plan.read',
    'Read Treatment Plan',
    'clinical_documentation',
    'read',
    'treatment_plan',
    'global',
    'Read Treatment Plan permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.treatment_plan.update',
    'Update Treatment Plan',
    'clinical_documentation',
    'update',
    'treatment_plan',
    'global',
    'Update Treatment Plan permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinical_documentation.treatment_plan.delete',
    'Delete Treatment Plan',
    'clinical_documentation',
    'delete',
    'treatment_plan',
    'global',
    'Delete Treatment Plan permission for clinical_documentation module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.prescription.create',
    'Create Prescription',
    'pharmacy',
    'create',
    'prescription',
    'global',
    'Create Prescription permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.prescription.read',
    'Read Prescription',
    'pharmacy',
    'read',
    'prescription',
    'global',
    'Read Prescription permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.prescription.update',
    'Update Prescription',
    'pharmacy',
    'update',
    'prescription',
    'global',
    'Update Prescription permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.prescription.delete',
    'Delete Prescription',
    'pharmacy',
    'delete',
    'prescription',
    'global',
    'Delete Prescription permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.medication_dispensing.create',
    'Create Medication Dispensing',
    'pharmacy',
    'create',
    'medication_dispensing',
    'global',
    'Create Medication Dispensing permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.medication_dispensing.read',
    'Read Medication Dispensing',
    'pharmacy',
    'read',
    'medication_dispensing',
    'global',
    'Read Medication Dispensing permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.medication_dispensing.update',
    'Update Medication Dispensing',
    'pharmacy',
    'update',
    'medication_dispensing',
    'global',
    'Update Medication Dispensing permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.medication_dispensing.delete',
    'Delete Medication Dispensing',
    'pharmacy',
    'delete',
    'medication_dispensing',
    'global',
    'Delete Medication Dispensing permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_inventory.create',
    'Create Drug Inventory',
    'pharmacy',
    'create',
    'drug_inventory',
    'global',
    'Create Drug Inventory permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_inventory.read',
    'Read Drug Inventory',
    'pharmacy',
    'read',
    'drug_inventory',
    'global',
    'Read Drug Inventory permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_inventory.update',
    'Update Drug Inventory',
    'pharmacy',
    'update',
    'drug_inventory',
    'global',
    'Update Drug Inventory permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_inventory.delete',
    'Delete Drug Inventory',
    'pharmacy',
    'delete',
    'drug_inventory',
    'global',
    'Delete Drug Inventory permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_interaction.create',
    'Create Drug Interaction',
    'pharmacy',
    'create',
    'drug_interaction',
    'global',
    'Create Drug Interaction permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_interaction.read',
    'Read Drug Interaction',
    'pharmacy',
    'read',
    'drug_interaction',
    'global',
    'Read Drug Interaction permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_interaction.update',
    'Update Drug Interaction',
    'pharmacy',
    'update',
    'drug_interaction',
    'global',
    'Update Drug Interaction permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'pharmacy.drug_interaction.delete',
    'Delete Drug Interaction',
    'pharmacy',
    'delete',
    'drug_interaction',
    'global',
    'Delete Drug Interaction permission for pharmacy module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_test.create',
    'Create Lab Test',
    'lab_diagnostics',
    'create',
    'lab_test',
    'global',
    'Create Lab Test permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_test.read',
    'Read Lab Test',
    'lab_diagnostics',
    'read',
    'lab_test',
    'global',
    'Read Lab Test permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_test.update',
    'Update Lab Test',
    'lab_diagnostics',
    'update',
    'lab_test',
    'global',
    'Update Lab Test permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_test.delete',
    'Delete Lab Test',
    'lab_diagnostics',
    'delete',
    'lab_test',
    'global',
    'Delete Lab Test permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_result.create',
    'Create Lab Result',
    'lab_diagnostics',
    'create',
    'lab_result',
    'global',
    'Create Lab Result permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_result.read',
    'Read Lab Result',
    'lab_diagnostics',
    'read',
    'lab_result',
    'global',
    'Read Lab Result permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_result.update',
    'Update Lab Result',
    'lab_diagnostics',
    'update',
    'lab_result',
    'global',
    'Update Lab Result permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_result.delete',
    'Delete Lab Result',
    'lab_diagnostics',
    'delete',
    'lab_result',
    'global',
    'Delete Lab Result permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.sample_collection.create',
    'Create Sample Collection',
    'lab_diagnostics',
    'create',
    'sample_collection',
    'global',
    'Create Sample Collection permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.sample_collection.read',
    'Read Sample Collection',
    'lab_diagnostics',
    'read',
    'sample_collection',
    'global',
    'Read Sample Collection permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.sample_collection.update',
    'Update Sample Collection',
    'lab_diagnostics',
    'update',
    'sample_collection',
    'global',
    'Update Sample Collection permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.sample_collection.delete',
    'Delete Sample Collection',
    'lab_diagnostics',
    'delete',
    'sample_collection',
    'global',
    'Delete Sample Collection permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_equipment.create',
    'Create Lab Equipment',
    'lab_diagnostics',
    'create',
    'lab_equipment',
    'global',
    'Create Lab Equipment permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_equipment.read',
    'Read Lab Equipment',
    'lab_diagnostics',
    'read',
    'lab_equipment',
    'global',
    'Read Lab Equipment permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_equipment.update',
    'Update Lab Equipment',
    'lab_diagnostics',
    'update',
    'lab_equipment',
    'global',
    'Update Lab Equipment permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lab_diagnostics.lab_equipment.delete',
    'Delete Lab Equipment',
    'lab_diagnostics',
    'delete',
    'lab_equipment',
    'global',
    'Delete Lab Equipment permission for lab_diagnostics module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_order.create',
    'Create Imaging Order',
    'radiology',
    'create',
    'imaging_order',
    'global',
    'Create Imaging Order permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_order.read',
    'Read Imaging Order',
    'radiology',
    'read',
    'imaging_order',
    'global',
    'Read Imaging Order permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_order.update',
    'Update Imaging Order',
    'radiology',
    'update',
    'imaging_order',
    'global',
    'Update Imaging Order permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_order.delete',
    'Delete Imaging Order',
    'radiology',
    'delete',
    'imaging_order',
    'global',
    'Delete Imaging Order permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_result.create',
    'Create Imaging Result',
    'radiology',
    'create',
    'imaging_result',
    'global',
    'Create Imaging Result permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_result.read',
    'Read Imaging Result',
    'radiology',
    'read',
    'imaging_result',
    'global',
    'Read Imaging Result permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_result.update',
    'Update Imaging Result',
    'radiology',
    'update',
    'imaging_result',
    'global',
    'Update Imaging Result permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.imaging_result.delete',
    'Delete Imaging Result',
    'radiology',
    'delete',
    'imaging_result',
    'global',
    'Delete Imaging Result permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.pacs_access.read',
    'PACS Access',
    'radiology',
    'read',
    'pacs_access',
    'global',
    'PACS Access permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.radiology_report.create',
    'Create Radiology Report',
    'radiology',
    'create',
    'radiology_report',
    'global',
    'Create Radiology Report permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.radiology_report.read',
    'Read Radiology Report',
    'radiology',
    'read',
    'radiology_report',
    'global',
    'Read Radiology Report permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'radiology.radiology_report.update',
    'Update Radiology Report',
    'radiology',
    'update',
    'radiology_report',
    'global',
    'Update Radiology Report permission for radiology module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgery_schedule.create',
    'Create Surgery Schedule',
    'ot_management',
    'create',
    'surgery_schedule',
    'global',
    'Create Surgery Schedule permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgery_schedule.read',
    'Read Surgery Schedule',
    'ot_management',
    'read',
    'surgery_schedule',
    'global',
    'Read Surgery Schedule permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgery_schedule.update',
    'Update Surgery Schedule',
    'ot_management',
    'update',
    'surgery_schedule',
    'global',
    'Update Surgery Schedule permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgery_schedule.delete',
    'Delete Surgery Schedule',
    'ot_management',
    'delete',
    'surgery_schedule',
    'global',
    'Delete Surgery Schedule permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.ot_booking.create',
    'Create OT Booking',
    'ot_management',
    'create',
    'ot_booking',
    'global',
    'Create OT Booking permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.ot_booking.read',
    'Read OT Booking',
    'ot_management',
    'read',
    'ot_booking',
    'global',
    'Read OT Booking permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.ot_booking.update',
    'Update OT Booking',
    'ot_management',
    'update',
    'ot_booking',
    'global',
    'Update OT Booking permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.ot_booking.delete',
    'Delete OT Booking',
    'ot_management',
    'delete',
    'ot_booking',
    'global',
    'Delete OT Booking permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgical_equipment.create',
    'Create Surgical Equipment',
    'ot_management',
    'create',
    'surgical_equipment',
    'global',
    'Create Surgical Equipment permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgical_equipment.read',
    'Read Surgical Equipment',
    'ot_management',
    'read',
    'surgical_equipment',
    'global',
    'Read Surgical Equipment permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.surgical_equipment.update',
    'Update Surgical Equipment',
    'ot_management',
    'update',
    'surgical_equipment',
    'global',
    'Update Surgical Equipment permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.post_op_care.create',
    'Create Post-Op Care',
    'ot_management',
    'create',
    'post_op_care',
    'global',
    'Create Post-Op Care permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.post_op_care.read',
    'Read Post-Op Care',
    'ot_management',
    'read',
    'post_op_care',
    'global',
    'Read Post-Op Care permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ot_management.post_op_care.update',
    'Update Post-Op Care',
    'ot_management',
    'update',
    'post_op_care',
    'global',
    'Update Post-Op Care permission for ot_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment.create',
    'Create Appointment',
    'appointments',
    'create',
    'appointment',
    'global',
    'Create Appointment permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment.read',
    'Read Appointment',
    'appointments',
    'read',
    'appointment',
    'global',
    'Read Appointment permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment.update',
    'Update Appointment',
    'appointments',
    'update',
    'appointment',
    'global',
    'Update Appointment permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment.delete',
    'Delete Appointment',
    'appointments',
    'delete',
    'appointment',
    'global',
    'Delete Appointment permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment.cancel',
    'Cancel Appointment',
    'appointments',
    'cancel',
    'appointment',
    'global',
    'Cancel Appointment permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment.reschedule',
    'Reschedule Appointment',
    'appointments',
    'reschedule',
    'appointment',
    'global',
    'Reschedule Appointment permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.waitlist.create',
    'Create Waitlist',
    'appointments',
    'create',
    'waitlist',
    'global',
    'Create Waitlist permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.waitlist.read',
    'Read Waitlist',
    'appointments',
    'read',
    'waitlist',
    'global',
    'Read Waitlist permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.waitlist.update',
    'Update Waitlist',
    'appointments',
    'update',
    'waitlist',
    'global',
    'Update Waitlist permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.slot_availability.read',
    'Read Slot Availability',
    'appointments',
    'read',
    'slot_availability',
    'global',
    'Read Slot Availability permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.slot_availability.update',
    'Update Slot Availability',
    'appointments',
    'update',
    'slot_availability',
    'global',
    'Update Slot Availability permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment_reminder.create',
    'Create Appointment Reminder',
    'appointments',
    'create',
    'appointment_reminder',
    'global',
    'Create Appointment Reminder permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment_reminder.read',
    'Read Appointment Reminder',
    'appointments',
    'read',
    'appointment_reminder',
    'global',
    'Read Appointment Reminder permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'appointments.appointment_reminder.update',
    'Update Appointment Reminder',
    'appointments',
    'update',
    'appointment_reminder',
    'global',
    'Update Appointment Reminder permission for appointments module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.invoice.create',
    'Create Invoice',
    'billing_revenue',
    'create',
    'invoice',
    'global',
    'Create Invoice permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.invoice.read',
    'Read Invoice',
    'billing_revenue',
    'read',
    'invoice',
    'global',
    'Read Invoice permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.invoice.update',
    'Update Invoice',
    'billing_revenue',
    'update',
    'invoice',
    'global',
    'Update Invoice permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.invoice.delete',
    'Delete Invoice',
    'billing_revenue',
    'delete',
    'invoice',
    'global',
    'Delete Invoice permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.payment.create',
    'Create Payment',
    'billing_revenue',
    'create',
    'payment',
    'global',
    'Create Payment permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.payment.read',
    'Read Payment',
    'billing_revenue',
    'read',
    'payment',
    'global',
    'Read Payment permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.payment.refund',
    'Refund Payment',
    'billing_revenue',
    'refund',
    'payment',
    'global',
    'Refund Payment permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.insurance_claim.create',
    'Create Insurance Claim',
    'billing_revenue',
    'create',
    'insurance_claim',
    'global',
    'Create Insurance Claim permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.insurance_claim.read',
    'Read Insurance Claim',
    'billing_revenue',
    'read',
    'insurance_claim',
    'global',
    'Read Insurance Claim permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.insurance_claim.update',
    'Update Insurance Claim',
    'billing_revenue',
    'update',
    'insurance_claim',
    'global',
    'Update Insurance Claim permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.insurance_claim.submit',
    'Submit Insurance Claim',
    'billing_revenue',
    'submit',
    'insurance_claim',
    'global',
    'Submit Insurance Claim permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.charge_item.create',
    'Create Charge Item',
    'billing_revenue',
    'create',
    'charge_item',
    'global',
    'Create Charge Item permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.charge_item.read',
    'Read Charge Item',
    'billing_revenue',
    'read',
    'charge_item',
    'global',
    'Read Charge Item permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.charge_item.update',
    'Update Charge Item',
    'billing_revenue',
    'update',
    'charge_item',
    'global',
    'Update Charge Item permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.discount.apply',
    'Apply Discount',
    'billing_revenue',
    'apply',
    'discount',
    'global',
    'Apply Discount permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.revenue_report.read',
    'Read Revenue Report',
    'billing_revenue',
    'read',
    'revenue_report',
    'global',
    'Read Revenue Report permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.revenue_report.export',
    'Export Revenue Report',
    'billing_revenue',
    'export',
    'revenue_report',
    'global',
    'Export Revenue Report permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'billing_revenue.payment_reconciliation.create',
    'Create Payment Reconciliation',
    'billing_revenue',
    'create',
    'payment_reconciliation',
    'global',
    'Create Payment Reconciliation permission for billing_revenue module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_item.create',
    'Create Stock Item',
    'inventory',
    'create',
    'stock_item',
    'global',
    'Create Stock Item permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_item.read',
    'Read Stock Item',
    'inventory',
    'read',
    'stock_item',
    'global',
    'Read Stock Item permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_item.update',
    'Update Stock Item',
    'inventory',
    'update',
    'stock_item',
    'global',
    'Update Stock Item permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_item.delete',
    'Delete Stock Item',
    'inventory',
    'delete',
    'stock_item',
    'global',
    'Delete Stock Item permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_transfer.create',
    'Create Stock Transfer',
    'inventory',
    'create',
    'stock_transfer',
    'global',
    'Create Stock Transfer permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_transfer.read',
    'Read Stock Transfer',
    'inventory',
    'read',
    'stock_transfer',
    'global',
    'Read Stock Transfer permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_transfer.approve',
    'Approve Stock Transfer',
    'inventory',
    'approve',
    'stock_transfer',
    'global',
    'Approve Stock Transfer permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.reorder_level.create',
    'Create Reorder Level',
    'inventory',
    'create',
    'reorder_level',
    'global',
    'Create Reorder Level permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.reorder_level.read',
    'Read Reorder Level',
    'inventory',
    'read',
    'reorder_level',
    'global',
    'Read Reorder Level permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.reorder_level.update',
    'Update Reorder Level',
    'inventory',
    'update',
    'reorder_level',
    'global',
    'Update Reorder Level permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_count.create',
    'Create Stock Count',
    'inventory',
    'create',
    'stock_count',
    'global',
    'Create Stock Count permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_count.read',
    'Read Stock Count',
    'inventory',
    'read',
    'stock_count',
    'global',
    'Read Stock Count permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.stock_count.approve',
    'Approve Stock Count',
    'inventory',
    'approve',
    'stock_count',
    'global',
    'Approve Stock Count permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'inventory.expiry_tracking.read',
    'Read Expiry Tracking',
    'inventory',
    'read',
    'expiry_tracking',
    'global',
    'Read Expiry Tracking permission for inventory module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.employee.create',
    'Create Employee',
    'hrm',
    'create',
    'employee',
    'global',
    'Create Employee permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.employee.read',
    'Read Employee',
    'hrm',
    'read',
    'employee',
    'global',
    'Read Employee permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.employee.update',
    'Update Employee',
    'hrm',
    'update',
    'employee',
    'global',
    'Update Employee permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.employee.delete',
    'Delete Employee',
    'hrm',
    'delete',
    'employee',
    'global',
    'Delete Employee permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.attendance.create',
    'Create Attendance',
    'hrm',
    'create',
    'attendance',
    'global',
    'Create Attendance permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.attendance.read',
    'Read Attendance',
    'hrm',
    'read',
    'attendance',
    'global',
    'Read Attendance permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.attendance.approve',
    'Approve Attendance',
    'hrm',
    'approve',
    'attendance',
    'global',
    'Approve Attendance permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.leave.create',
    'Create Leave',
    'hrm',
    'create',
    'leave',
    'global',
    'Create Leave permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.leave.read',
    'Read Leave',
    'hrm',
    'read',
    'leave',
    'global',
    'Read Leave permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.leave.approve',
    'Approve Leave',
    'hrm',
    'approve',
    'leave',
    'global',
    'Approve Leave permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.payroll.create',
    'Create Payroll',
    'hrm',
    'create',
    'payroll',
    'global',
    'Create Payroll permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.payroll.read',
    'Read Payroll',
    'hrm',
    'read',
    'payroll',
    'global',
    'Read Payroll permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.payroll.process',
    'Process Payroll',
    'hrm',
    'process',
    'payroll',
    'global',
    'Process Payroll permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.performance_review.create',
    'Create Performance Review',
    'hrm',
    'create',
    'performance_review',
    'global',
    'Create Performance Review permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.performance_review.read',
    'Read Performance Review',
    'hrm',
    'read',
    'performance_review',
    'global',
    'Read Performance Review permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'hrm.performance_review.update',
    'Update Performance Review',
    'hrm',
    'update',
    'performance_review',
    'global',
    'Update Performance Review permission for hrm module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor.create',
    'Create Vendor',
    'vendor_procurement',
    'create',
    'vendor',
    'global',
    'Create Vendor permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor.read',
    'Read Vendor',
    'vendor_procurement',
    'read',
    'vendor',
    'global',
    'Read Vendor permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor.update',
    'Update Vendor',
    'vendor_procurement',
    'update',
    'vendor',
    'global',
    'Update Vendor permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor.delete',
    'Delete Vendor',
    'vendor_procurement',
    'delete',
    'vendor',
    'global',
    'Delete Vendor permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.purchase_order.create',
    'Create Purchase Order',
    'vendor_procurement',
    'create',
    'purchase_order',
    'global',
    'Create Purchase Order permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.purchase_order.read',
    'Read Purchase Order',
    'vendor_procurement',
    'read',
    'purchase_order',
    'global',
    'Read Purchase Order permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.purchase_order.approve',
    'Approve Purchase Order',
    'vendor_procurement',
    'approve',
    'purchase_order',
    'global',
    'Approve Purchase Order permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.goods_receipt.create',
    'Create Goods Receipt',
    'vendor_procurement',
    'create',
    'goods_receipt',
    'global',
    'Create Goods Receipt permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.goods_receipt.read',
    'Read Goods Receipt',
    'vendor_procurement',
    'read',
    'goods_receipt',
    'global',
    'Read Goods Receipt permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor_payment.create',
    'Create Vendor Payment',
    'vendor_procurement',
    'create',
    'vendor_payment',
    'global',
    'Create Vendor Payment permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor_payment.read',
    'Read Vendor Payment',
    'vendor_procurement',
    'read',
    'vendor_payment',
    'global',
    'Read Vendor Payment permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.vendor_payment.approve',
    'Approve Vendor Payment',
    'vendor_procurement',
    'approve',
    'vendor_payment',
    'global',
    'Approve Vendor Payment permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.quotation.create',
    'Create Quotation',
    'vendor_procurement',
    'create',
    'quotation',
    'global',
    'Create Quotation permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'vendor_procurement.quotation.read',
    'Read Quotation',
    'vendor_procurement',
    'read',
    'quotation',
    'global',
    'Read Quotation permission for vendor_procurement module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed.create',
    'Create Bed',
    'bed_management',
    'create',
    'bed',
    'global',
    'Create Bed permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed.read',
    'Read Bed',
    'bed_management',
    'read',
    'bed',
    'global',
    'Read Bed permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed.update',
    'Update Bed',
    'bed_management',
    'update',
    'bed',
    'global',
    'Update Bed permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed_allocation.create',
    'Create Bed Allocation',
    'bed_management',
    'create',
    'bed_allocation',
    'global',
    'Create Bed Allocation permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed_allocation.read',
    'Read Bed Allocation',
    'bed_management',
    'read',
    'bed_allocation',
    'global',
    'Read Bed Allocation permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed_allocation.update',
    'Update Bed Allocation',
    'bed_management',
    'update',
    'bed_allocation',
    'global',
    'Update Bed Allocation permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed_transfer.create',
    'Create Bed Transfer',
    'bed_management',
    'create',
    'bed_transfer',
    'global',
    'Create Bed Transfer permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.bed_transfer.approve',
    'Approve Bed Transfer',
    'bed_management',
    'approve',
    'bed_transfer',
    'global',
    'Approve Bed Transfer permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.discharge.create',
    'Create Discharge',
    'bed_management',
    'create',
    'discharge',
    'global',
    'Create Discharge permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'bed_management.discharge.approve',
    'Approve Discharge',
    'bed_management',
    'approve',
    'discharge',
    'global',
    'Approve Discharge permission for bed_management module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.ambulance_booking.create',
    'Create Ambulance Booking',
    'ambulance',
    'create',
    'ambulance_booking',
    'global',
    'Create Ambulance Booking permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.ambulance_booking.read',
    'Read Ambulance Booking',
    'ambulance',
    'read',
    'ambulance_booking',
    'global',
    'Read Ambulance Booking permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.ambulance_booking.update',
    'Update Ambulance Booking',
    'ambulance',
    'update',
    'ambulance_booking',
    'global',
    'Update Ambulance Booking permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.ambulance_trip.create',
    'Create Ambulance Trip',
    'ambulance',
    'create',
    'ambulance_trip',
    'global',
    'Create Ambulance Trip permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.ambulance_trip.read',
    'Read Ambulance Trip',
    'ambulance',
    'read',
    'ambulance_trip',
    'global',
    'Read Ambulance Trip permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.ambulance_trip.complete',
    'Complete Ambulance Trip',
    'ambulance',
    'complete',
    'ambulance_trip',
    'global',
    'Complete Ambulance Trip permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.vehicle_maintenance.create',
    'Create Vehicle Maintenance',
    'ambulance',
    'create',
    'vehicle_maintenance',
    'global',
    'Create Vehicle Maintenance permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ambulance.vehicle_maintenance.read',
    'Read Vehicle Maintenance',
    'ambulance',
    'read',
    'vehicle_maintenance',
    'global',
    'Read Vehicle Maintenance permission for ambulance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_type.create',
    'Create Document Type',
    'document_sharing',
    'create',
    'document_type',
    'global',
    'Create Document Type permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_type.read',
    'Read Document Type',
    'document_sharing',
    'read',
    'document_type',
    'global',
    'Read Document Type permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_type.update',
    'Update Document Type',
    'document_sharing',
    'update',
    'document_type',
    'global',
    'Update Document Type permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_type.delete',
    'Delete Document Type',
    'document_sharing',
    'delete',
    'document_type',
    'global',
    'Delete Document Type permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.access_rule.create',
    'Create Access Rule',
    'document_sharing',
    'create',
    'access_rule',
    'global',
    'Create Access Rule permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.access_rule.read',
    'Read Access Rule',
    'document_sharing',
    'read',
    'access_rule',
    'global',
    'Read Access Rule permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.access_rule.update',
    'Update Access Rule',
    'document_sharing',
    'update',
    'access_rule',
    'global',
    'Update Access Rule permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.access_rule.delete',
    'Delete Access Rule',
    'document_sharing',
    'delete',
    'access_rule',
    'global',
    'Delete Access Rule permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_upload.create',
    'Upload Document',
    'document_sharing',
    'create',
    'document_upload',
    'global',
    'Upload Document permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_upload.read',
    'Read Document',
    'document_sharing',
    'read',
    'document_upload',
    'global',
    'Read Document permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_upload.download',
    'Download Document',
    'document_sharing',
    'download',
    'document_upload',
    'global',
    'Download Document permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_sharing.create',
    'Share Document',
    'document_sharing',
    'create',
    'document_sharing',
    'global',
    'Share Document permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_sharing.read',
    'Read Shared Documents',
    'document_sharing',
    'read',
    'document_sharing',
    'global',
    'Read Shared Documents permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.document_sharing.revoke',
    'Revoke Document Access',
    'document_sharing',
    'revoke',
    'document_sharing',
    'global',
    'Revoke Document Access permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.access_audit.read',
    'Read Access Audit',
    'document_sharing',
    'read',
    'access_audit',
    'global',
    'Read Access Audit permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.access_check.verify',
    'Verify Access',
    'document_sharing',
    'verify',
    'access_check',
    'global',
    'Verify Access permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.bulk_share.create',
    'Bulk Share Documents',
    'document_sharing',
    'create',
    'bulk_share',
    'global',
    'Bulk Share Documents permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'document_sharing.bulk_share.revoke',
    'Bulk Revoke Access',
    'document_sharing',
    'revoke',
    'bulk_share',
    'global',
    'Bulk Revoke Access permission for document_sharing module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.configuration.read',
    'Read Configuration',
    'system_settings',
    'read',
    'configuration',
    'global',
    'Read Configuration permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.configuration.update',
    'Update Configuration',
    'system_settings',
    'update',
    'configuration',
    'global',
    'Update Configuration permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.user.create',
    'Create User',
    'system_settings',
    'create',
    'user',
    'global',
    'Create User permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.user.read',
    'Read User',
    'system_settings',
    'read',
    'user',
    'global',
    'Read User permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.user.update',
    'Update User',
    'system_settings',
    'update',
    'user',
    'global',
    'Update User permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.user.delete',
    'Delete User',
    'system_settings',
    'delete',
    'user',
    'global',
    'Delete User permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.role.create',
    'Create Role',
    'system_settings',
    'create',
    'role',
    'global',
    'Create Role permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.role.read',
    'Read Role',
    'system_settings',
    'read',
    'role',
    'global',
    'Read Role permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.role.update',
    'Update Role',
    'system_settings',
    'update',
    'role',
    'global',
    'Update Role permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.role.delete',
    'Delete Role',
    'system_settings',
    'delete',
    'role',
    'global',
    'Delete Role permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.audit_log.read',
    'Read Audit Log',
    'system_settings',
    'read',
    'audit_log',
    'global',
    'Read Audit Log permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.backup.create',
    'Create Backup',
    'system_settings',
    'create',
    'backup',
    'global',
    'Create Backup permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.backup.restore',
    'Restore Backup',
    'system_settings',
    'restore',
    'backup',
    'global',
    'Restore Backup permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'system_settings.system_health.read',
    'Read System Health',
    'system_settings',
    'read',
    'system_health',
    'global',
    'Read System Health permission for system_settings module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.incident.create',
    'Create Incident',
    'quality_assurance',
    'create',
    'incident',
    'global',
    'Create Incident permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.incident.read',
    'Read Incident',
    'quality_assurance',
    'read',
    'incident',
    'global',
    'Read Incident permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.incident.update',
    'Update Incident',
    'quality_assurance',
    'update',
    'incident',
    'global',
    'Update Incident permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.incident.close',
    'Close Incident',
    'quality_assurance',
    'close',
    'incident',
    'global',
    'Close Incident permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.audit.create',
    'Create Audit',
    'quality_assurance',
    'create',
    'audit',
    'global',
    'Create Audit permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.audit.read',
    'Read Audit',
    'quality_assurance',
    'read',
    'audit',
    'global',
    'Read Audit permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.audit.complete',
    'Complete Audit',
    'quality_assurance',
    'complete',
    'audit',
    'global',
    'Complete Audit permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.compliance.read',
    'Read Compliance',
    'quality_assurance',
    'read',
    'compliance',
    'global',
    'Read Compliance permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.quality_report.create',
    'Create Quality Report',
    'quality_assurance',
    'create',
    'quality_report',
    'global',
    'Create Quality Report permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'quality_assurance.quality_report.read',
    'Read Quality Report',
    'quality_assurance',
    'read',
    'quality_report',
    'global',
    'Read Quality Report permission for quality_assurance module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count total permissions
SELECT COUNT(*) as total_permissions 
FROM permissions 
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000';

-- Count by module
SELECT "Module", COUNT(*) as count
FROM permissions
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000'
GROUP BY "Module"
ORDER BY "Module";

-- Expected counts:
-- patient_management: 24
-- clinical_documentation: 20
-- pharmacy: 16
-- lab_diagnostics: 16
-- radiology: 12
-- ot_management: 14
-- appointments: 14
-- billing_revenue: 18
-- inventory: 14
-- hrm: 16
-- vendor_procurement: 14
-- bed_management: 10
-- ambulance: 8
-- document_sharing: 18
-- system_settings: 14
-- quality_assurance: 10
-- TOTAL: 297

-- List all permission codes
SELECT "Code", "Name", "Module"
FROM permissions
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000'
ORDER BY "Module", "Code";
