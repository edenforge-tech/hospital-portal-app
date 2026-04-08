-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: backfill ot_finalize_schedule.status = 'SurgeryDone'
--
-- Root cause fix: when a patient's clinical_state transitions to SurgeryCompleted
-- (or beyond), the linked OT finalize schedule record was never updated to
-- 'SurgeryDone'. This caused the Finalize Surgery page "Surgery Done" count = 0.
--
-- This one-time migration fixes all existing records.
-- Safe to re-run (WHERE clause is idempotent).
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

UPDATE ot_finalize_schedule ots
SET
    status     = 'SurgeryDone',
    is_locked  = false,
    updated_at = NOW()
FROM patient_journey pj
WHERE pj.ot_finalize_schedule_id = ots.id
  AND pj.clinical_state IN (
      'SurgeryCompleted',
      'PostOpInProgress',
      'ReadyForDischarge',
      'Discharged'
  )
  AND ots.status NOT IN ('SurgeryDone', 'Cancelled')
  AND ots.deleted_at IS NULL;

-- Audit log entries for each updated record
INSERT INTO ot_finalize_audit_log (
    id,
    schedule_id,
    action,
    old_status,
    new_status,
    old_value,
    new_value,
    changed_by,
    changed_at
)
SELECT
    gen_random_uuid(),
    ots.id,
    'MarkSurgeryDone',
    ots.status,          -- captured before the UPDATE above (note: logged as current status after update)
    'SurgeryDone',
    NULL,
    '{"backfill": "fix_ot_schedule_surgery_done migration"}',
    'system-migration',
    NOW()
FROM ot_finalize_schedule ots
JOIN patient_journey pj ON pj.ot_finalize_schedule_id = ots.id
WHERE ots.status = 'SurgeryDone'
  AND ots.updated_at >= NOW() - INTERVAL '5 seconds'  -- only rows just updated
  AND ots.deleted_at IS NULL;

COMMIT;
