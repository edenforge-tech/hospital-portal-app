-- ============================================================
-- Migration 105: Surgery Consumable Full State Machine
-- Adds: escalation_reason, returned_quantity, returned_at,
--       closed_at columns; renames legacy 'Issued' → 'IssuedInOT'
-- ============================================================

BEGIN;

ALTER TABLE inv_surgery_consumables
    ADD COLUMN IF NOT EXISTS escalation_reason  TEXT,
    ADD COLUMN IF NOT EXISTS returned_quantity  NUMERIC(12,3) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS returned_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_at          TIMESTAMPTZ;

-- Migrate legacy 'Issued' rows to new 'IssuedInOT' state
UPDATE inv_surgery_consumables
   SET consumable_status = 'IssuedInOT'
 WHERE consumable_status = 'Issued';

COMMIT;
