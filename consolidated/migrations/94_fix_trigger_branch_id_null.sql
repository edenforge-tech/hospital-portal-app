-- ============================================================================
-- Migration 94: Fix fn_create_patient_journey_on_ot_prepared trigger
-- Problem: When ot_finalize_schedule.branch_id IS NULL (counselor flow does
--          not populate it), the trigger fails with NOT NULL constraint on
--          patient_journey.branch_id.
-- Fix:     After reading NEW.branch_id, fall back to the linked counseling
--          session's branch_id, then to the tenant's first (oldest) branch.
-- ============================================================================

BEGIN;

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
    v_uhid           := NEW.uhid;

    -- Get package_amount, iol_power, and anesthesia from the linked counseling session
    v_session_id := NEW.counselling_session_id;
    IF v_session_id IS NOT NULL THEN
        SELECT package_amount, iol_power, anesthesia_type_choice,
               -- also pull branch_id from session as fallback
               branch_id
          INTO v_package_amount, v_iol_power, v_anaesthesia,
               v_branch_id
        FROM counseling_sessions
        WHERE id = v_session_id;

        -- Restore actual branch_id from schedule if it was set there
        IF NEW.branch_id IS NOT NULL THEN
            v_branch_id := NEW.branch_id;
        END IF;
    END IF;

    -- Final fallback: use the tenant's first (oldest) branch
    IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id
        FROM branch
        WHERE tenant_id = v_tenant_id
          AND deleted_at IS NULL
        ORDER BY created_at ASC
        LIMIT 1;
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

COMMENT ON FUNCTION fn_create_patient_journey_on_ot_prepared() IS
    'Auto-creates a patient_journey row with clinical_state=Expected when '
    'ot_finalize_schedule.status transitions to OTPrepared. '
    'branch_id resolution order: ot_finalize_schedule.branch_id → '
    'counseling_session.branch_id → tenant first branch. '
    'Fixed in migration 94 to handle NULL branch_id from counselor flow.';

COMMIT;
