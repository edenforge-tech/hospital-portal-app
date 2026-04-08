-- ============================================================
-- Phase 1.1: Fix Step 1 Pre-Op Checklist Items
-- Move labs_done / ecg_done → Step 4 (Anaesthesia)
-- Delete consent_signed from Step 1 (Section C of widget handles it)
-- Insert 5 pre-op instruction items per template (7 templates)
-- ============================================================

BEGIN;

-- 1. Move labs_done → Step 4
UPDATE pre_admission_checklist_items
SET workflow_step            = 4,
    step_title               = 'Anaesthesia Type',
    step_widget_component    = 'Step4AnaesthesiaType',
    display_order            = 2,
    item_label               = 'Pre-op lab reports reviewed',
    updated_at               = NOW()
WHERE item_key = 'labs_done' AND workflow_step = 1;

-- 2. Move ecg_done → Step 4
UPDATE pre_admission_checklist_items
SET workflow_step            = 4,
    step_title               = 'Anaesthesia Type',
    step_widget_component    = 'Step4AnaesthesiaType',
    display_order            = 3,
    item_label               = 'ECG / Anaesthesia fitness reviewed',
    updated_at               = NOW()
WHERE item_key = 'ecg_done' AND workflow_step = 1;

-- 3. Delete consent_signed from Step 1
DELETE FROM pre_admission_checklist_items
WHERE item_key = 'consent_signed' AND workflow_step = 1;

-- 4a. Template d60b23c8 (tenant 11b26293-...)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), '11b26293-9d9c-4633-927e-3294bff2a8d7', 'd60b23c8-b65f-423a-9228-243f34cfaf59',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11b26293-9d9c-4633-927e-3294bff2a8d7', 'd60b23c8-b65f-423a-9228-243f34cfaf59',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11b26293-9d9c-4633-927e-3294bff2a8d7', 'd60b23c8-b65f-423a-9228-243f34cfaf59',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11b26293-9d9c-4633-927e-3294bff2a8d7', 'd60b23c8-b65f-423a-9228-243f34cfaf59',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11b26293-9d9c-4633-927e-3294bff2a8d7', 'd60b23c8-b65f-423a-9228-243f34cfaf59',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

-- 4b. Template 27b9e95b (tenant e32ddc5c-...)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), 'e32ddc5c-5ab2-49b5-9776-7dc49dbd7a23', '27b9e95b-3efe-4467-8b62-095fd1cace72',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e32ddc5c-5ab2-49b5-9776-7dc49dbd7a23', '27b9e95b-3efe-4467-8b62-095fd1cace72',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e32ddc5c-5ab2-49b5-9776-7dc49dbd7a23', '27b9e95b-3efe-4467-8b62-095fd1cace72',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e32ddc5c-5ab2-49b5-9776-7dc49dbd7a23', '27b9e95b-3efe-4467-8b62-095fd1cace72',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e32ddc5c-5ab2-49b5-9776-7dc49dbd7a23', '27b9e95b-3efe-4467-8b62-095fd1cace72',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

-- 4c. Template 7d4f0ca2 (tenant 155fe198-... TEST TENANT)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '7d4f0ca2-6b3d-4685-b93c-41526f2ccc8e',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '7d4f0ca2-6b3d-4685-b93c-41526f2ccc8e',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '7d4f0ca2-6b3d-4685-b93c-41526f2ccc8e',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '7d4f0ca2-6b3d-4685-b93c-41526f2ccc8e',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', '7d4f0ca2-6b3d-4685-b93c-41526f2ccc8e',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

-- 4d. Template 83213083 (tenant 11111111-...)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '83213083-4876-4e43-adf7-a93c96b74a62',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '83213083-4876-4e43-adf7-a93c96b74a62',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '83213083-4876-4e43-adf7-a93c96b74a62',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '83213083-4876-4e43-adf7-a93c96b74a62',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '83213083-4876-4e43-adf7-a93c96b74a62',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

-- 4e. Template 8f3bc531 (tenant e9928100-...)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), 'e9928100-c1b7-4a81-ab61-b14f3ad12699', '8f3bc531-ea85-4ca7-b0ca-375f0637c35f',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e9928100-c1b7-4a81-ab61-b14f3ad12699', '8f3bc531-ea85-4ca7-b0ca-375f0637c35f',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e9928100-c1b7-4a81-ab61-b14f3ad12699', '8f3bc531-ea85-4ca7-b0ca-375f0637c35f',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e9928100-c1b7-4a81-ab61-b14f3ad12699', '8f3bc531-ea85-4ca7-b0ca-375f0637c35f',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'e9928100-c1b7-4a81-ab61-b14f3ad12699', '8f3bc531-ea85-4ca7-b0ca-375f0637c35f',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

-- 4f. Template 92e0fdf2 (tenant cf508ce9-...)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), 'cf508ce9-6d25-47bd-a41c-190bad694524', '92e0fdf2-ba89-4386-b644-b0f62de50053',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'cf508ce9-6d25-47bd-a41c-190bad694524', '92e0fdf2-ba89-4386-b644-b0f62de50053',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'cf508ce9-6d25-47bd-a41c-190bad694524', '92e0fdf2-ba89-4386-b644-b0f62de50053',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'cf508ce9-6d25-47bd-a41c-190bad694524', '92e0fdf2-ba89-4386-b644-b0f62de50053',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), 'cf508ce9-6d25-47bd-a41c-190bad694524', '92e0fdf2-ba89-4386-b644-b0f62de50053',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

-- 4g. Template 1b591f68 (tenant 523bdf80-...)
INSERT INTO pre_admission_checklist_items
  (id, tenant_id, template_id, item_key, item_label, description,
   workflow_step, step_title, step_widget_component, display_order,
   is_mandatory, is_blocking, department_owner,
   created_at, updated_at, status)
VALUES
  (gen_random_uuid(), '523bdf80-d09d-43ae-8beb-0b1e991cf51a', '1b591f68-e3cc-4d9f-b431-966bb7c8b209',
   'fasting_instructed', 'Fasting instructions given (NPO from midnight)',
   'Patient/guardian told not to eat or drink from midnight before surgery',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 1, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '523bdf80-d09d-43ae-8beb-0b1e991cf51a', '1b591f68-e3cc-4d9f-b431-966bb7c8b209',
   'medication_hold_reviewed', 'Current medications reviewed (hold list given)',
   'Review medications — aspirin, BP meds, diabetic meds stop list given',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 2, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '523bdf80-d09d-43ae-8beb-0b1e991cf51a', '1b591f68-e3cc-4d9f-b431-966bb7c8b209',
   'escort_confirmed', 'Escort arrangement confirmed',
   'Patient must be accompanied by a responsible adult for discharge',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 3, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '523bdf80-d09d-43ae-8beb-0b1e991cf51a', '1b591f68-e3cc-4d9f-b431-966bb7c8b209',
   'arrival_time_explained', 'Arrival time and reporting location explained',
   'Patient told OT arrival time and which registration counter to report',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 4, true, false, 'Counselor', NOW(), NOW(), 'active'),
  (gen_random_uuid(), '523bdf80-d09d-43ae-8beb-0b1e991cf51a', '1b591f68-e3cc-4d9f-b431-966bb7c8b209',
   'documents_explained', 'Documents to bring explained',
   'ID proof, insurance card, reports, lens prescription if any',
   1, 'Pre-Op Instructions', 'Step1PreOpInstructions', 5, true, false, 'Counselor', NOW(), NOW(), 'active');

COMMIT;

-- Verify
SELECT workflow_step, item_key, count(*) AS cnt
FROM pre_admission_checklist_items
WHERE item_key IN (
  'labs_done','ecg_done','consent_signed',
  'fasting_instructed','medication_hold_reviewed',
  'escort_confirmed','arrival_time_explained','documents_explained'
)
GROUP BY workflow_step, item_key
ORDER BY workflow_step, item_key;
