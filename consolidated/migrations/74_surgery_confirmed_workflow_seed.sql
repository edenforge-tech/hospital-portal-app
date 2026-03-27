-- ============================================================================
-- Migration 74: Surgery Confirmed — Default 6-Step Workflow Seed Data
-- Seeds the default template + 6-step checklist items so every tenant that
-- has not configured a custom template gets the standard pre-admission flow.
-- Date: 2026-06
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: only insert if a "Default Surgical Admission" template doesn't exist
-- for system-wide use (tenant_id = null not allowed → skip; tenants get seeded
-- per-tenant via the app's POST /api/pre-admission-checklist/templates endpoint)
-- This migration instead backfills ALL existing tenants with the default template
-- if they don't have one.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    v_tenant RECORD;
    v_template_id UUID;
BEGIN
    FOR v_tenant IN SELECT id FROM tenant WHERE deleted_at IS NULL AND status = 'active' LOOP

        -- Skip if this tenant already has any template
        IF EXISTS (
            SELECT 1 FROM pre_admission_checklist_templates
            WHERE tenant_id = v_tenant.id AND deleted_at IS NULL
        ) THEN
            CONTINUE;
        END IF;

        v_template_id := gen_random_uuid();

        -- Insert default template (NULL applicability = applies to all surgery types)
        INSERT INTO pre_admission_checklist_templates (
            id, tenant_id, template_name, description,
            patient_type, surgery_category, min_patient_age, max_patient_age,
            applies_to_eye, display_order, is_active,
            created_at, updated_at, status
        ) VALUES (
            v_template_id, v_tenant.id,
            'Default Pre-Admission Surgical Checklist',
            'Standard 6-step pre-admission workflow for all surgical patients.',
            NULL, NULL, NULL, NULL, NULL,
            0, TRUE, NOW(), NOW(), 'active'
        );

        -- ── STEP 1: Pre-Op Instructions ────────────────────────────────────
        INSERT INTO pre_admission_checklist_items (
            id, tenant_id, template_id,
            item_key, item_label, description,
            department_owner, department_color,
            is_mandatory, is_blocking, requires_document,
            workflow_step, step_title, step_widget_component,
            requires_dept_notification, notification_department,
            display_order, is_active, created_at, updated_at, status
        ) VALUES
        (gen_random_uuid(), v_tenant.id, v_template_id,
         'preop_instructions_given',
         'Pre-Op Instructions Given to Patient',
         'Counsel patient on NPO (nothing by mouth), medication holds, arrival time, and what to bring.',
         'Counselor','bg-indigo-100 text-indigo-700',
         TRUE, FALSE, FALSE,
         1, 'Pre-Op Instructions', 'Step1PreOpInstructions',
         FALSE, NULL, 10, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'preop_diet_instructions',
         'Fasting / Diet Instructions Explained',
         'Patient understands NPO window, clear liquids cut-off, and morning medication rules.',
         'Counselor','bg-indigo-100 text-indigo-700',
         TRUE, FALSE, FALSE,
         1, 'Pre-Op Instructions', 'Step1PreOpInstructions',
         FALSE, NULL, 11, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'preop_medication_hold',
         'Medication Hold List Confirmed',
         'Blood thinners, antihypertensives, and other relevant medications reviewed with patient.',
         'Counselor','bg-indigo-100 text-indigo-700',
         TRUE, FALSE, FALSE,
         1, 'Pre-Op Instructions', 'Step1PreOpInstructions',
         FALSE, NULL, 12, TRUE, NOW(), NOW(), 'active');

        -- ── STEP 2: Imaging & Scans ────────────────────────────────────────
        INSERT INTO pre_admission_checklist_items (
            id, tenant_id, template_id,
            item_key, item_label, description,
            department_owner, department_color,
            is_mandatory, is_blocking, requires_document,
            workflow_step, step_title, step_widget_component,
            requires_dept_notification, notification_department,
            display_order, is_active, created_at, updated_at, status
        ) VALUES
        (gen_random_uuid(), v_tenant.id, v_template_id,
         'biometry_done',
         'Biometry / IOL Power Calculation Done',
         'A-scan / IOL Master biometry completed and IOL power confirmed.',
         'Optometry','bg-teal-100 text-teal-700',
         TRUE, TRUE, TRUE,
         2, 'Imaging & Scans', 'Step2ImagingScans',
         TRUE, 'Lab', 20, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'corneal_topography_done',
         'Corneal Topography / Keratometry Done',
         'Topography/keratometry values recorded and reviewed for surgery planning.',
         'Optometry','bg-teal-100 text-teal-700',
         FALSE, FALSE, TRUE,
         2, 'Imaging & Scans', 'Step2ImagingScans',
         FALSE, NULL, 21, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'oct_done',
         'OCT (Macula / Optic Nerve) Done',
         'Optical coherence tomography completed if indicated.',
         'Optometry','bg-teal-100 text-teal-700',
         FALSE, FALSE, TRUE,
         2, 'Imaging & Scans', 'Step2ImagingScans',
         FALSE, NULL, 22, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'lab_tests_done',
         'Pre-Op Lab Tests Completed',
         'CBC, RBS, urine routine. Abnormal values reviewed by anaesthesiologist.',
         'Lab','bg-yellow-100 text-yellow-700',
         TRUE, TRUE, TRUE,
         2, 'Imaging & Scans', 'Step2ImagingScans',
         TRUE, 'Lab', 23, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'ecg_done',
         'ECG Done (age ≥ 40 or cardiac history)',
         'Electrocardiogram obtained and cleared by cardiologist if required.',
         'Cardiology','bg-red-100 text-red-700',
         FALSE, FALSE, TRUE,
         2, 'Imaging & Scans', 'Step2ImagingScans',
         FALSE, NULL, 24, TRUE, NOW(), NOW(), 'active');

        -- ── STEP 3: Payment & Insurance ────────────────────────────────────
        INSERT INTO pre_admission_checklist_items (
            id, tenant_id, template_id,
            item_key, item_label, description,
            department_owner, department_color,
            is_mandatory, is_blocking, requires_document,
            workflow_step, step_title, step_widget_component,
            requires_dept_notification, notification_department,
            display_order, is_active, created_at, updated_at, status
        ) VALUES
        (gen_random_uuid(), v_tenant.id, v_template_id,
         'payment_confirmed',
         'Payment / Insurance Pre-Auth Confirmed',
         'Cash payment collected or insurance pre-authorisation approved.',
         'Billing','bg-green-100 text-green-700',
         TRUE, TRUE, FALSE,
         3, 'Payment & Insurance', 'Step3PaymentInsurance',
         TRUE, 'Billing', 30, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'consent_forms_signed',
         'Consent Forms Signed',
         'Surgical consent, anaesthesia consent (and GA consent if applicable) obtained.',
         'Counselor','bg-indigo-100 text-indigo-700',
         TRUE, TRUE, TRUE,
         3, 'Payment & Insurance', 'Step3PaymentInsurance',
         FALSE, NULL, 31, TRUE, NOW(), NOW(), 'active');

        -- ── STEP 4: Anaesthesia ────────────────────────────────────────────
        INSERT INTO pre_admission_checklist_items (
            id, tenant_id, template_id,
            item_key, item_label, description,
            department_owner, department_color,
            is_mandatory, is_blocking, requires_document,
            workflow_step, step_title, step_widget_component,
            requires_dept_notification, notification_department,
            display_order, is_active, created_at, updated_at, status
        ) VALUES
        (gen_random_uuid(), v_tenant.id, v_template_id,
         'anaesthesia_type_confirmed',
         'Anaesthesia Type Confirmed',
         'Topical / Local / GA confirmed and patient counselled.',
         'Anesthesia','bg-purple-100 text-purple-700',
         TRUE, TRUE, FALSE,
         4, 'Anaesthesia', 'Step4AnaesthesiaType',
         TRUE, 'Anesthesia', 40, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'anaesthesia_clearance',
         'Anaesthesia Clearance Obtained',
         'Anaesthesiologist has reviewed patient and cleared for surgery.',
         'Anesthesia','bg-purple-100 text-purple-700',
         TRUE, TRUE, FALSE,
         4, 'Anaesthesia', 'Step4AnaesthesiaType',
         FALSE, NULL, 41, TRUE, NOW(), NOW(), 'active');

        -- ── STEP 5: OT / Bed / Stock ───────────────────────────────────────
        INSERT INTO pre_admission_checklist_items (
            id, tenant_id, template_id,
            item_key, item_label, description,
            department_owner, department_color,
            is_mandatory, is_blocking, requires_document,
            workflow_step, step_title, step_widget_component,
            requires_dept_notification, notification_department,
            display_order, is_active, created_at, updated_at, status
        ) VALUES
        (gen_random_uuid(), v_tenant.id, v_template_id,
         'ot_slot_confirmed',
         'OT Slot Confirmed',
         'Operating theater, date and time have been allocated and confirmed.',
         'OT','bg-orange-100 text-orange-700',
         TRUE, TRUE, FALSE,
         5, 'OT / Bed / Stock', 'Step5OTBedStock',
         TRUE, 'OT', 50, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'bed_reserved',
         'Bed / Day-Care Slot Reserved',
         'Admission bed or day-care recliner assigned for post-op recovery.',
         'Admissions','bg-gray-100 text-gray-700',
         TRUE, FALSE, FALSE,
         5, 'OT / Bed / Stock', 'Step5OTBedStock',
         TRUE, 'Admissions', 51, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'iol_stock_confirmed',
         'IOL / Implant Stock Confirmed',
         'Intended IOL or implant is in stock and reserved for this patient.',
         'OT','bg-orange-100 text-orange-700',
         TRUE, TRUE, FALSE,
         5, 'OT / Bed / Stock', 'Step5OTBedStock',
         TRUE, 'Pharmacy', 52, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'instruments_sterilized',
         'Surgical Instruments Sterilized',
         'OT nursing team confirms instruments and consumables are prepared.',
         'OT','bg-orange-100 text-orange-700',
         FALSE, FALSE, FALSE,
         5, 'OT / Bed / Stock', 'Step5OTBedStock',
         FALSE, NULL, 53, TRUE, NOW(), NOW(), 'active');

        -- ── STEP 6: Surgeon Confirmation ───────────────────────────────────
        INSERT INTO pre_admission_checklist_items (
            id, tenant_id, template_id,
            item_key, item_label, description,
            department_owner, department_color,
            is_mandatory, is_blocking, requires_document,
            workflow_step, step_title, step_widget_component,
            requires_dept_notification, notification_department,
            display_order, is_active, created_at, updated_at, status
        ) VALUES
        (gen_random_uuid(), v_tenant.id, v_template_id,
         'surgeon_confirmed',
         'Surgeon Has Confirmed the Booking',
         'Primary surgeon has reviewed and accepted this OT booking.',
         'Surgeon','bg-blue-100 text-blue-700',
         TRUE, TRUE, FALSE,
         6, 'Surgeon Confirmation', 'Step6SurgeonConfirmation',
         TRUE, 'Surgeon', 60, TRUE, NOW(), NOW(), 'active'),

        (gen_random_uuid(), v_tenant.id, v_template_id,
         'pre_op_notes_complete',
         'Pre-Op Surgical Notes Complete',
         'Surgeon has documented operative plan, special requirements, and risks.',
         'Surgeon','bg-blue-100 text-blue-700',
         TRUE, FALSE, FALSE,
         6, 'Surgeon Confirmation', 'Step6SurgeonConfirmation',
         FALSE, NULL, 61, TRUE, NOW(), NOW(), 'active');

        RAISE NOTICE 'Seeded default 6-step checklist template for tenant %', v_tenant.id;

    END LOOP;
END $$;

COMMIT;
