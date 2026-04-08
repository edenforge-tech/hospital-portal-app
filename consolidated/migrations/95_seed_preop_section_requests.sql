-- ============================================================================
-- Migration 95: UAT Seed " Pre-Op Section Requests
-- Purpose: Seeds 2 UAT patient journeys with pre_op_clearance + 11-section
--          preop_section_clearance rows in mixed statuses for testing the
--          Pre-Op Department Queue and Ward Checklist UI.
-- Dependencies: 92_preop_section_clearance, 94_preop_section_states,
--               patient, patient_journey, pre_op_clearance, tenant, branch
-- Date: 2026-05
-- Run idempotently: ON CONFLICT DO NOTHING on all inserts.
-- ============================================================================

BEGIN;

DO $$
DECLARE
    v_tenant_id      UUID;
    v_branch_id      UUID;
    v_admin_id       UUID;

    v_patient1_id    UUID;
    v_journey1_id    UUID := '11111111-aa11-4000-8000-000000000001';
    v_clearance1_id  UUID := '11111111-aa11-4000-8000-000000000002';

    v_patient2_id    UUID;
    v_journey2_id    UUID := '11111111-aa22-4000-8000-000000000003';
    v_clearance2_id  UUID := '11111111-aa22-4000-8000-000000000004';

BEGIN
    -- Use the primary test tenant (India Eye Hospital Network)
    -- This must match the tenant in the System Administrator JWT
    v_tenant_id := '155fe198-6ae5-4a01-9254-ead5b427247e'::UUID;
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE id = v_tenant_id AND status = 'active') THEN
        RAISE NOTICE 'Tenant 155fe198 not found or inactive - UAT seed skipped.'; RETURN;
    END IF;

    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 1;
    IF v_branch_id IS NULL THEN RAISE NOTICE 'No active branch for tenant - UAT seed skipped.'; RETURN; END IF;

    SELECT id INTO v_admin_id FROM users WHERE tenant_id = v_tenant_id AND "DeletedAt" IS NULL LIMIT 1;

    -- "" Patient 1: UAT Ramesh Kumar (pending + on-hold mix) """"""""""""""""
    SELECT id INTO v_patient1_id FROM patient WHERE tenant_id = v_tenant_id AND medical_record_number = 'UAT-001' AND deleted_at IS NULL;
    IF v_patient1_id IS NULL THEN
        INSERT INTO patient (id, tenant_id, branch_id, first_name, last_name, medical_record_number,
                             date_of_birth, gender, contact_number, status,
                             created_at, updated_at, created_by_user_id, updated_by_user_id)
        VALUES (gen_random_uuid(), v_tenant_id, v_branch_id, 'UAT Ramesh', 'Kumar', 'UAT-001',
                '1965-08-20', 'Male', '9800000001', 'active', NOW(), NOW(), v_admin_id, v_admin_id)
        RETURNING id INTO v_patient1_id;
    END IF;

    INSERT INTO patient_journey (id, tenant_id, branch_id, patient_id, uhid,
        clinical_state, ot_state, financial_state, post_op_state,
        procedure_name, eye_operated, surgery_scheduled_at,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES (v_journey1_id, v_tenant_id, v_branch_id, v_patient1_id, 'UAT-001',
        'Expected', 'NotSent', 'NotCreated', 'NotStarted',
        'Cataract Phacoemulsification', 'OD', NOW() + INTERVAL '2 days',
        'active', NOW(), NOW(), v_admin_id, v_admin_id)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO pre_op_clearance (id, tenant_id, journey_id, overall_status,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES (v_clearance1_id, v_tenant_id, v_journey1_id, 'InProgress',
        'active', NOW(), NOW(), v_admin_id, v_admin_id)
    ON CONFLICT (id) DO NOTHING;

    -- Section clearances (11 sections) for Patient 1
    INSERT INTO preop_section_clearance (
        id, tenant_id, clearance_id, section_category, responsible_department_code,
        status, urgency, requested_by_user_id, requested_at,
        response_notes,
        created_at, updated_at, created_by_user_id, updated_by_user_id)
    SELECT
        gen_random_uuid(), v_tenant_id, v_clearance1_id,
        t.cat, t.dept, t.st, t.urg,
        CASE WHEN t.st <> 'NotRequested' THEN v_admin_id ELSE NULL END,
        CASE WHEN t.st <> 'NotRequested' THEN NOW() - (t.mins * INTERVAL '1 minute') ELSE NULL END,
        t.notes,
        NOW(), NOW(), v_admin_id, v_admin_id
    FROM (VALUES
        ('Compliance',           'STD_NURSE',      'Requested',    'Normal', 15, NULL::TEXT),
        ('Vitals',               'STD_NURSE',      'Requested',    'Normal', 12, NULL),
        ('Lab Tests',            'STD_LABORATORY', 'Requested',    'High',   10, NULL),
        ('Diagnostic Imaging',   'STD_IMAGING',    'Requested',    'Urgent',  8, NULL),
        ('Evaluation',           'STD_DOCTOR',     'NotRequested', 'Normal',  0, NULL),
        ('Anaesthesia',          'STD_DOCTOR',     'NotRequested', 'Normal',  0, NULL),
        ('Consent',              'STD_COUNSELOR',  'Requested',    'Normal', 20, NULL),
        ('Pharmacy Preparation', 'STD_PHARMACY',   'NotRequested', 'Normal',  0, NULL),
        ('Financial',            'STD_BILLING',    'OnHold',       'Normal', 30, 'Awaiting insurance pre-auth number before proceeding'),
        ('OT Preparation',       'STD_INVENTORY',  'NotRequested', 'Normal',  0, NULL),
        ('Documents',            'STD_ADMIN',      'NeedsInfo',    'Normal', 25, 'Please provide original ID proof and updated contact details')
    ) AS t(cat, dept, st, urg, mins, notes)
    ON CONFLICT (clearance_id, section_category) DO NOTHING;

    -- "" Patient 2: UAT Meena Iyer (escalated + rejected + cleared mix) """"
    SELECT id INTO v_patient2_id FROM patient WHERE tenant_id = v_tenant_id AND medical_record_number = 'UAT-002' AND deleted_at IS NULL;
    IF v_patient2_id IS NULL THEN
        INSERT INTO patient (id, tenant_id, branch_id, first_name, last_name, medical_record_number,
                             date_of_birth, gender, contact_number, status,
                             created_at, updated_at, created_by_user_id, updated_by_user_id)
        VALUES (gen_random_uuid(), v_tenant_id, v_branch_id, 'UAT Meena', 'Iyer', 'UAT-002',
                '1972-03-15', 'Female', '9800000002', 'active', NOW(), NOW(), v_admin_id, v_admin_id)
        RETURNING id INTO v_patient2_id;
    END IF;

    INSERT INTO patient_journey (id, tenant_id, branch_id, patient_id, uhid,
        clinical_state, ot_state, financial_state, post_op_state,
        procedure_name, eye_operated, surgery_scheduled_at,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES (v_journey2_id, v_tenant_id, v_branch_id, v_patient2_id, 'UAT-002',
        'Expected', 'NotSent', 'NotCreated', 'NotStarted',
        'LASIK Refractive Surgery', 'OU', NOW() + INTERVAL '1 day',
        'active', NOW(), NOW(), v_admin_id, v_admin_id)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO pre_op_clearance (id, tenant_id, journey_id, overall_status,
        status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES (v_clearance2_id, v_tenant_id, v_journey2_id, 'InProgress',
        'active', NOW(), NOW(), v_admin_id, v_admin_id)
    ON CONFLICT (id) DO NOTHING;

    -- Section clearances (11 sections) for Patient 2
    INSERT INTO preop_section_clearance (
        id, tenant_id, clearance_id, section_category, responsible_department_code,
        status, urgency, requested_by_user_id, requested_at,
        responded_by_user_id, responded_at, response_notes, rejection_reason,
        created_at, updated_at, created_by_user_id, updated_by_user_id)
    SELECT
        gen_random_uuid(), v_tenant_id, v_clearance2_id,
        t.cat, t.dept, t.st, t.urg,
        CASE WHEN t.st <> 'NotRequested' THEN v_admin_id ELSE NULL END,
        CASE WHEN t.st <> 'NotRequested' THEN NOW() - (t.req_m * INTERVAL '1 minute') ELSE NULL END,
        CASE WHEN t.st IN ('RespondedClear','RespondedConcerns','OnHold','Rejected','NeedsInfo','Escalated','WardConfirmed')
             THEN v_admin_id ELSE NULL END,
        CASE WHEN t.st IN ('RespondedClear','RespondedConcerns','OnHold','Rejected','NeedsInfo','Escalated','WardConfirmed')
             THEN NOW() - (t.resp_m * INTERVAL '1 minute') ELSE NULL END,
        t.notes,
        t.rejection,
        NOW(), NOW(), v_admin_id, v_admin_id
    FROM (VALUES
        ('Compliance',           'STD_NURSE',      'RespondedClear',    'Normal',  50, 40, 'Fasting confirmed " 10 hrs. Vitals stable.',                                                                 NULL::TEXT),
        ('Vitals',               'STD_NURSE',      'RespondedClear',    'Normal',  48, 38, 'BP 130/80, Pulse 76, SpO2 99%.',                                                                             NULL),
        ('Lab Tests',            'STD_LABORATORY', 'Escalated',         'High',    45,  5, 'Lab results delayed " urgent follow-up required.',                                                           NULL),
        ('Diagnostic Imaging',   'STD_IMAGING',    'OnHold',            'Normal',  40, 15, 'Scan machine under maintenance. Expected by end of day.',                                                    NULL),
        ('Evaluation',           'STD_DOCTOR',     'Requested',         'Normal',  30,  0, NULL,                                                                                                         NULL),
        ('Anaesthesia',          'STD_DOCTOR',     'Requested',         'Urgent',  25,  0, NULL,                                                                                                         NULL),
        ('Consent',              'STD_COUNSELOR',  'RespondedConcerns', 'Normal',  60, 20, 'Patient queries about post-op restrictions " another counselling session recommended prior to signing.',     NULL),
        ('Pharmacy Preparation', 'STD_PHARMACY',   'Requested',         'Normal',  20,  0, NULL,                                                                                                         NULL),
        ('Financial',            'STD_BILLING',    'Rejected',          'Normal',  55, 10, NULL,                                                                                                         'Insurance pre-auth number is invalid. Patient must contact insurer before financial clearance can be issued.'),
        ('OT Preparation',       'STD_INVENTORY',  'Requested',         'Normal',  18,  0, NULL,                                                                                                         NULL),
        ('Documents',            'STD_ADMIN',      'Requested',         'Normal',  16,  0, NULL,                                                                                                         NULL)
    ) AS t(cat, dept, st, urg, req_m, resp_m, notes, rejection)
    ON CONFLICT (clearance_id, section_category) DO NOTHING;

    RAISE NOTICE 'UAT Pre-Op seed completed. Journey IDs: % and %', v_journey1_id, v_journey2_id;
END $$;

COMMIT;
