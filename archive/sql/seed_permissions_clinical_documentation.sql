-- ============================================
-- Seed Script: Clinical Documentation Permissions (20)
-- Module: clinical_documentation
-- Created: November 10, 2025
-- Description: Granular CRUD permissions for clinical assessments, examinations,
--              diagnoses, clinical notes, treatment plans
-- ============================================

INSERT INTO permissions (
    id, code, name, module, action, resource_type, scope, description, 
    is_system_permission, is_active, created_at, updated_at
) VALUES
-- Clinical Assessment Permissions (4)
(gen_random_uuid(), 'clinical.assessment.create', 'Create Clinical Assessment', 'clinical_documentation', 'create', 'clinical_assessment', 'department', 'Create new clinical assessments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.assessment.read', 'Read Clinical Assessment', 'clinical_documentation', 'read', 'clinical_assessment', 'branch', 'View clinical assessments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.assessment.update', 'Update Clinical Assessment', 'clinical_documentation', 'update', 'clinical_assessment', 'own', 'Modify own clinical assessments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.assessment.delete', 'Delete Clinical Assessment', 'clinical_documentation', 'delete', 'clinical_assessment', 'tenant', 'Remove clinical assessments', true, true, NOW(), NOW()),

-- Assessment Findings Permissions (4)
(gen_random_uuid(), 'clinical.assessment_findings.create', 'Create Assessment Findings', 'clinical_documentation', 'create', 'assessment_findings', 'department', 'Record clinical findings from assessments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.assessment_findings.read', 'Read Assessment Findings', 'clinical_documentation', 'read', 'assessment_findings', 'branch', 'View assessment findings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.assessment_findings.update', 'Update Assessment Findings', 'clinical_documentation', 'update', 'assessment_findings', 'own', 'Modify assessment findings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.assessment_findings.delete', 'Delete Assessment Findings', 'clinical_documentation', 'delete', 'assessment_findings', 'tenant', 'Remove assessment findings', true, true, NOW(), NOW()),

-- Clinical Examination Permissions (4)
(gen_random_uuid(), 'clinical.examination.create', 'Create Clinical Examination', 'clinical_documentation', 'create', 'clinical_examination', 'department', 'Document clinical examinations', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.examination.read', 'Read Clinical Examination', 'clinical_documentation', 'read', 'clinical_examination', 'branch', 'View clinical examination records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.examination.update', 'Update Clinical Examination', 'clinical_documentation', 'update', 'clinical_examination', 'own', 'Modify clinical examinations', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.examination.delete', 'Delete Clinical Examination', 'clinical_documentation', 'delete', 'clinical_examination', 'tenant', 'Remove clinical examinations', true, true, NOW(), NOW()),

-- Diagnosis Permissions (4)
(gen_random_uuid(), 'clinical.diagnosis.create', 'Create Diagnosis', 'clinical_documentation', 'create', 'diagnosis', 'department', 'Create patient diagnoses', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.diagnosis.read', 'Read Diagnosis', 'clinical_documentation', 'read', 'diagnosis', 'branch', 'View patient diagnoses', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.diagnosis.update', 'Update Diagnosis', 'clinical_documentation', 'update', 'diagnosis', 'own', 'Modify diagnoses', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.diagnosis.delete', 'Delete Diagnosis', 'clinical_documentation', 'delete', 'diagnosis', 'tenant', 'Remove diagnoses', true, true, NOW(), NOW()),

-- Clinical Notes Permissions (4)
(gen_random_uuid(), 'clinical.clinical_notes.create', 'Create Clinical Notes', 'clinical_documentation', 'create', 'clinical_notes', 'own', 'Add clinical notes to patient records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.clinical_notes.read', 'Read Clinical Notes', 'clinical_documentation', 'read', 'clinical_notes', 'branch', 'View clinical notes', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.clinical_notes.update', 'Update Clinical Notes', 'clinical_documentation', 'update', 'clinical_notes', 'own', 'Modify own clinical notes', true, true, NOW(), NOW()),
(gen_random_uuid(), 'clinical.clinical_notes.delete', 'Delete Clinical Notes', 'clinical_documentation', 'delete', 'clinical_notes', 'tenant', 'Remove clinical notes', true, true, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

-- Verify insertion
DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count 
    FROM permissions 
    WHERE module = 'clinical_documentation';
    
    RAISE NOTICE '✓ Clinical Documentation: % permissions inserted', inserted_count;
END $$;
