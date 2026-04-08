-- Fix pre_admission_checklist_items: add migration 73 workflow columns
-- Root cause: Items table missing workflow_step, step_title, step_widget_component,
-- requires_dept_notification, notification_department columns → EF SELECT fails → 500 error

BEGIN;

-- 1. Add the 5 missing workflow columns
ALTER TABLE pre_admission_checklist_items
    ADD COLUMN IF NOT EXISTS workflow_step INTEGER,
    ADD COLUMN IF NOT EXISTS step_title VARCHAR(120),
    ADD COLUMN IF NOT EXISTS step_widget_component VARCHAR(100),
    ADD COLUMN IF NOT EXISTS requires_dept_notification BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS notification_department VARCHAR(50);

-- 2. Map all existing items to their correct workflow step (1-6)
UPDATE pre_admission_checklist_items SET
    workflow_step = CASE item_key
        WHEN 'labs_done'            THEN 1
        WHEN 'ecg_done'             THEN 1
        WHEN 'consent_signed'       THEN 1
        WHEN 'biometry_done'        THEN 2
        WHEN 'payment_confirmed'    THEN 3
        WHEN 'anesthesia_clearance' THEN 4
        WHEN 'bed_assigned'         THEN 5
        WHEN 'ot_slot_confirmed'    THEN 5
        ELSE NULL
    END,
    step_title = CASE item_key
        WHEN 'labs_done'            THEN 'Pre-Op Instructions'
        WHEN 'ecg_done'             THEN 'Pre-Op Instructions'
        WHEN 'consent_signed'       THEN 'Pre-Op Instructions'
        WHEN 'biometry_done'        THEN 'Imaging & Scans'
        WHEN 'payment_confirmed'    THEN 'Payment & Insurance'
        WHEN 'anesthesia_clearance' THEN 'Anaesthesia Type'
        WHEN 'bed_assigned'         THEN 'OT / Bed / Stock'
        WHEN 'ot_slot_confirmed'    THEN 'OT / Bed / Stock'
        ELSE NULL
    END,
    step_widget_component = CASE item_key
        WHEN 'labs_done'            THEN 'Step1PreOpInstructions'
        WHEN 'ecg_done'             THEN 'Step1PreOpInstructions'
        WHEN 'consent_signed'       THEN 'Step1PreOpInstructions'
        WHEN 'biometry_done'        THEN 'Step2ImagingScans'
        WHEN 'payment_confirmed'    THEN 'Step3PaymentInsurance'
        WHEN 'anesthesia_clearance' THEN 'Step4AnaesthesiaType'
        WHEN 'bed_assigned'         THEN 'Step5OTBedStock'
        WHEN 'ot_slot_confirmed'    THEN 'Step5OTBedStock'
        ELSE NULL
    END,
    requires_dept_notification = CASE item_key
        WHEN 'anesthesia_clearance' THEN TRUE
        WHEN 'ot_slot_confirmed'    THEN TRUE
        ELSE FALSE
    END,
    notification_department = CASE item_key
        WHEN 'anesthesia_clearance' THEN 'Anaesthesia'
        WHEN 'ot_slot_confirmed'    THEN 'OT'
        ELSE NULL
    END,
    display_order = CASE item_key
        WHEN 'labs_done'            THEN 1
        WHEN 'ecg_done'             THEN 2
        WHEN 'consent_signed'       THEN 3
        WHEN 'biometry_done'        THEN 1
        WHEN 'payment_confirmed'    THEN 1
        WHEN 'anesthesia_clearance' THEN 1
        WHEN 'bed_assigned'         THEN 1
        WHEN 'ot_slot_confirmed'    THEN 2
        ELSE display_order
    END;

-- 3. Insert Step 6 "Surgeon Confirmation" item for each template (if not already there)
INSERT INTO pre_admission_checklist_items (
    id, tenant_id, template_id, item_key, item_label, description,
    department_owner, department_color, is_mandatory, is_blocking,
    applies_if_age_below, requires_document, display_order, is_active,
    workflow_step, step_title, step_widget_component,
    requires_dept_notification, notification_department,
    created_at, updated_at, created_by_user_id, updated_by_user_id,
    deleted_at, status
)
SELECT
    gen_random_uuid(),
    t.tenant_id,
    t.id,
    'surgeon_confirmation',
    'Surgeon Confirmation',
    'Surgeon has reviewed the case and confirmed patient is ready for surgery',
    'Surgeon',
    '#7c3aed',
    TRUE,
    TRUE,
    NULL,
    FALSE,
    1,
    TRUE,
    6,
    'Surgeon Confirmation',
    'Step6SurgeonConfirmation',
    TRUE,
    'Surgeon',
    NOW(),
    NOW(),
    NULL,
    NULL,
    NULL,
    'active'
FROM pre_admission_checklist_templates t
WHERE NOT EXISTS (
    SELECT 1 FROM pre_admission_checklist_items i
    WHERE i.template_id = t.id AND i.item_key = 'surgeon_confirmation'
);

COMMIT;

-- Verify
SELECT
    workflow_step,
    step_title,
    COUNT(*) AS item_count,
    STRING_AGG(item_key, ', ' ORDER BY display_order) AS items
FROM pre_admission_checklist_items
WHERE workflow_step IS NOT NULL
  AND is_active = TRUE
GROUP BY workflow_step, step_title
ORDER BY workflow_step;
