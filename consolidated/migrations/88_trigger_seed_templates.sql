-- ============================================================================
-- Migration 88: Trigger, Seeds, and Surgery Note Templates
-- Purpose:
--   1. SQL trigger: auto-create patient_journey when ot_finalize_schedule
--      transitions to status='OTPrepared'
--   2. Seed default nurse & surgeon checklist items
--   3. Create surgery_note_templates table (Add Format Heads feature)
-- Dependencies: patient_journey (81), nurse_checklist_items (84),
--               surgeon_checklist_items (84)
-- Date: 2026-03
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SQL trigger: create patient_journey on OTPrepared
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_create_patient_journey_on_ot_prepared()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_session_id        UUID;
    v_package_amount    DECIMAL(12,2);
    v_procedure_name    VARCHAR(300);
    v_eye_operated      VARCHAR(10);
    v_surgeon_id        UUID;
    v_anaesthesia       VARCHAR(100);
    v_surgery_date      TIMESTAMPTZ;
    v_iol_power         VARCHAR(50);
    v_patient_id        UUID;
    v_uhid              VARCHAR(50);
    v_tenant_id         UUID;
    v_branch_id         UUID;
BEGIN
    -- Only fire when status transitions TO 'OTPrepared'
    IF NEW.status <> 'OTPrepared' OR OLD.status = 'OTPrepared' THEN
        RETURN NEW;
    END IF;

    -- Skip if a journey already exists for this ot_finalize_schedule_id
    IF EXISTS (
        SELECT 1 FROM patient_journey
        WHERE ot_finalize_schedule_id = NEW.id
          AND deleted_at IS NULL
    ) THEN
        RETURN NEW;
    END IF;

    -- Pull context from ot_finalize_schedule
    v_patient_id     := NEW.patient_id;
    v_tenant_id      := NEW.tenant_id;
    v_branch_id      := NEW.branch_id;
    v_surgeon_id     := NEW.doctor_id;
    v_eye_operated   := CASE NEW.eye
                            WHEN 'RE' THEN 'OD'
                            WHEN 'LE' THEN 'OS'
                            WHEN 'BE' THEN 'OU'
                            ELSE NEW.eye
                        END;
    v_surgery_date   := NEW.start_time;
    v_procedure_name := NEW.surgery_name;
    -- uhid is denormalized on ot_finalize_schedule directly
    v_uhid           := NEW.uhid;

    -- Get package_amount, iol_power, and anesthesia from the linked counseling session
    -- ot_finalize_schedule uses counselling_session_id (double-l spelling)
    v_session_id := NEW.counselling_session_id;
    IF v_session_id IS NOT NULL THEN
        SELECT package_amount, iol_power, anesthesia_type_choice
          INTO v_package_amount, v_iol_power, v_anaesthesia
        FROM counseling_sessions
        WHERE id = v_session_id;
    END IF;

    -- Insert the journey record
    INSERT INTO patient_journey (
        tenant_id, branch_id,
        patient_id, uhid,
        ot_finalize_schedule_id, counseling_session_id,
        procedure_name, eye_operated,
        primary_surgeon_id, anaesthesia_type,
        surgery_scheduled_at, iol_power,
        package_amount,
        clinical_state, ot_state, financial_state, post_op_state,
        created_by_user_id
    ) VALUES (
        v_tenant_id, v_branch_id,
        v_patient_id, v_uhid,
        NEW.id, v_session_id,
        v_procedure_name, v_eye_operated,
        v_surgeon_id, v_anaesthesia,
        v_surgery_date, v_iol_power,
        COALESCE(v_package_amount, 0),
        'Expected', 'NotSent', 'NotCreated', 'NotStarted',
        NEW.updated_by_user_id
    );

    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS trg_create_patient_journey_on_ot_prepared ON ot_finalize_schedule;

CREATE TRIGGER trg_create_patient_journey_on_ot_prepared
    AFTER UPDATE ON ot_finalize_schedule
    FOR EACH ROW
    EXECUTE FUNCTION fn_create_patient_journey_on_ot_prepared();

COMMENT ON FUNCTION fn_create_patient_journey_on_ot_prepared() IS
    'Auto-creates a patient_journey row with clinical_state=Expected when '
    'ot_finalize_schedule.status transitions to OTPrepared. '
    'This is the sole handoff mechanism from the counsellor module. '
    'No counsellor backend code is modified.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Seed default nurse checklist items
--    Uses a system/seed tenant_id (all-zeros UUID) — backend seeds per-tenant
--    on first use if needed, or these serve as global defaults.
-- ─────────────────────────────────────────────────────────────────────────────
-- Note: actual tenant-scoped seeding is done by the backend service on first
-- journey creation. The items below are the canonical template:
-- 7 nurse items, 5 surgeon items (referenced in PostOpWorkflowService).

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Surgery Note Templates table (Add Format Heads feature on OT page)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surgery_note_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenant(id),
    field_label VARCHAR(200) NOT NULL,
    field_type  VARCHAR(30) NOT NULL DEFAULT 'text'
                    CHECK (field_type IN ('text','textarea','select','checkbox','number')),
    field_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    options     JSONB,   -- for select fields: [{label, value}]
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_snt_tenant ON surgery_note_templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_snt_order  ON surgery_note_templates(tenant_id, field_order) WHERE is_active = TRUE;

ALTER TABLE surgery_note_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON surgery_note_templates;
CREATE POLICY tenant_isolation ON surgery_note_templates
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE surgery_note_templates IS
    'Configurable surgery note field templates per tenant. '
    'Managed via Add Format Heads button on Operation Theatre page.';

COMMIT;
