-- Migration 53: Add disable audit columns to master.master_value
-- Run AFTER migration 51 (which creates the master schema and table).
-- Idempotent: uses IF NOT EXISTS — safe to re-run.

ALTER TABLE master.master_value
    ADD COLUMN IF NOT EXISTS disabled_at           TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS disabled_by_user_id   UUID,
    ADD COLUMN IF NOT EXISTS disabled_reason       VARCHAR(500);

-- Backfill: rows that are already inactive but have no disabled_at should
-- get a placeholder timestamp so the audit trail is consistent.
UPDATE master.master_value
SET    disabled_at = updated_at
WHERE  is_active = false
  AND  disabled_at IS NULL;

COMMENT ON COLUMN master.master_value.disabled_at         IS 'Timestamp when value was disabled (is_active set to false)';
COMMENT ON COLUMN master.master_value.disabled_by_user_id IS 'User who disabled this value';
COMMENT ON COLUMN master.master_value.disabled_reason     IS 'Optional reason captured when disabling (max 500 chars)';
