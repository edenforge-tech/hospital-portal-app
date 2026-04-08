-- ============================================================================
-- Migration 89: Backfill patient_journey for pre-existing OTPrepared rows
-- Purpose:
--   The trigger in migration 88 fires only on AFTER UPDATE on ot_finalize_schedule.
--   Any rows that were already in status='OTPrepared' before migration 88 was run
--   never triggered the function and therefore have no patient_journey entry.
--   This script backfills those missing rows using the identical INSERT logic as
--   fn_create_patient_journey_on_ot_prepared().
-- Idempotent: uses NOT EXISTS guard — safe to run multiple times.
-- Dependencies: patient_journey (81), ot_finalize_schedule, patients,
--               counseling_sessions, tenant, branch, users tables
-- Date: 2026-03
-- ============================================================================

BEGIN;

INSERT INTO patient_journey (
    tenant_id,
    branch_id,
    patient_id,
    uhid,
    ot_finalize_schedule_id,
    counseling_session_id,
    procedure_name,
    eye_operated,
    primary_surgeon_id,
    anaesthesia_type,
    surgery_scheduled_at,
    iol_power,
    package_amount,
    clinical_state,
    ot_state,
    financial_state,
    post_op_state,
    created_by_user_id
)
SELECT
    ofs.tenant_id,
    -- branch_id: prefer session's branch, fallback to first active branch for tenant
    COALESCE(
        cs.branch_id,
        (SELECT id FROM branch WHERE tenant_id = ofs.tenant_id AND deleted_at IS NULL ORDER BY created_at LIMIT 1)
    )                                           AS branch_id,
    ofs.patient_id,
    ofs.uhid,                                   -- denormalized on ot_finalize_schedule
    ofs.id                                      AS ot_finalize_schedule_id,
    ofs.counselling_session_id                  AS counseling_session_id,
    ofs.surgery_name                            AS procedure_name,
    -- map ot_finalize_schedule eye notation to patient_journey check constraint
    CASE ofs.eye
        WHEN 'LE' THEN 'OS'
        WHEN 'RE' THEN 'OD'
        WHEN 'BE' THEN 'OU'
        WHEN 'OS' THEN 'OS'
        WHEN 'OD' THEN 'OD'
        WHEN 'OU' THEN 'OU'
        ELSE NULL
    END                                         AS eye_operated,
    ofs.doctor_id                               AS primary_surgeon_id,
    cs.anesthesia_type_choice                   AS anaesthesia_type,
    ofs.start_time                              AS surgery_scheduled_at,
    cs.iol_power,
    COALESCE(cs.package_amount, 0)              AS package_amount,
    'Expected'                                  AS clinical_state,
    'NotSent'                                   AS ot_state,
    'NotCreated'                                AS financial_state,
    'NotStarted'                                AS post_op_state,
    ofs.updated_by_user_id                      AS created_by_user_id
FROM ot_finalize_schedule ofs
LEFT JOIN counseling_sessions cs
    ON cs.id = ofs.counselling_session_id
WHERE ofs.status      = 'OTPrepared'
  AND NOT EXISTS (
      SELECT 1
      FROM   patient_journey pj
      WHERE  pj.ot_finalize_schedule_id = ofs.id
        AND  pj.deleted_at IS NULL
  );

COMMIT;

-- Verification query (informational — does not affect migration outcome)
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM patient_journey WHERE deleted_at IS NULL;
    RAISE NOTICE 'patient_journey rows after backfill: %', v_count;
END;
$$;
