-- ============================================================
-- Migration 91: Remove PreOpInProgress, rename PostOpInProgress → PostOp
-- ============================================================
-- Eliminates the unnecessary PreOpInProgress intermediary state.
-- Patients now remain in Expected throughout the entire pre-op checklist
-- and transition directly to Admitted when pre-op is approved.
--
-- Also renames PostOpInProgress → PostOp for consistency with the
-- frontend state labels.
-- ============================================================

BEGIN;

-- ── 1. Migrate any existing patients stuck in PreOpInProgress → Expected ──────
UPDATE patient_journey
SET    clinical_state    = 'Expected',
       updated_at        = NOW(),
       updated_by_user_id = updated_by_user_id
WHERE  clinical_state = 'PreOpInProgress'
  AND  deleted_at IS NULL;

-- ── 2. Rename PostOpInProgress → PostOp ──────────────────────────────────────
UPDATE patient_journey
SET    clinical_state    = 'PostOp',
       updated_at        = NOW(),
       updated_by_user_id = updated_by_user_id
WHERE  clinical_state = 'PostOpInProgress'
  AND  deleted_at IS NULL;

-- ── 3. Also update audit log old/new values so history remains accurate ───────
UPDATE journey_audit_log
SET    old_value = 'Expected'
WHERE  old_value = 'PreOpInProgress';

UPDATE journey_audit_log
SET    new_value = 'Expected'
WHERE  new_value = 'PreOpInProgress';

UPDATE journey_audit_log
SET    old_value = 'PostOp'
WHERE  old_value = 'PostOpInProgress';

UPDATE journey_audit_log
SET    new_value = 'PostOp'
WHERE  new_value = 'PostOpInProgress';

-- ── 4. Remove stale pre_op_clearance rows whose journey reverted to Expected ──
-- These are safe to leave as-is (they will be re-created on next PreOp init).
-- No action needed — clearances linked to Expected journeys are still valid.

COMMIT;
