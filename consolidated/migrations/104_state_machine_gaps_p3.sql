-- ============================================================
-- Migration 104 — State Machine Gaps (P3)
-- Covers:
--   1. inv_vendor_quotes      — evaluation workflow fields
--   2. inv_item_master        — auto-reorder suppression fields
--   3. inv_surgery_consumables — consumable_status
-- ============================================================

-- ── 1. VendorQuote evaluation workflow fields ────────────────
ALTER TABLE inv_vendor_quotes
    ADD COLUMN IF NOT EXISTS rank_position               INTEGER,
    ADD COLUMN IF NOT EXISTS clarification_notes         TEXT,
    ADD COLUMN IF NOT EXISTS clarification_requested_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revised_at                  TIMESTAMPTZ;

-- ── 2. ItemMaster auto-reorder suppression ───────────────────
ALTER TABLE inv_item_master
    ADD COLUMN IF NOT EXISTS reorder_suppressed         BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reorder_suppressed_until   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_reorder_triggered_at  TIMESTAMPTZ;

-- ── 3. SurgeryConsumable status ─────────────────────────────
ALTER TABLE inv_surgery_consumables
    ADD COLUMN IF NOT EXISTS consumable_status  VARCHAR(30) NOT NULL DEFAULT 'Issued';

-- Back-fill existing rows (all historical rows are issued)
UPDATE inv_surgery_consumables
SET    consumable_status = 'Issued'
WHERE  consumable_status IS NULL
   OR  consumable_status = '';
