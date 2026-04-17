-- ============================================================================
-- 21_purchase_return_enhancements.sql
-- Extends Purchase Return tables to support:
--   • Multi-source returns: Invoice-linked, GRN-linked, Manual exception
--   • Richer lifecycle: Draft → Pending → SentToVendor → CreditNoteReceived → Settled / Cancelled
--   • Credit note capture: number, amount, date
--   • Line-level cause of return, free quantity, and batch/expiry snapshot
-- Run this ONCE against the target database after 99_inventory_module.sql
-- ============================================================================

-- ── inv_purchase_returns: header-level additions ─────────────────────────────

-- 1. Allow invoice_id to be NULL so manual and GRN-only returns are supported
ALTER TABLE inv_purchase_returns
    ALTER COLUMN invoice_id DROP NOT NULL;

-- 2. Track the originating GRN when return was auto-created from rejected items
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS grn_id             UUID;

-- 3. Purchase category mirrors the purchase invoice category
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS purchase_category  VARCHAR(100);

-- 4. Source type: Invoice | GRN | Manual
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS source_type        VARCHAR(20) NOT NULL DEFAULT 'Manual';

-- 5. Credit note details received from the vendor
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS credit_note_number VARCHAR(100);
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS credit_note_amount NUMERIC(14,2);
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS credit_note_date   DATE;

-- 6. Payment mode and reference
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS payment_mode       VARCHAR(50);
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS reference          VARCHAR(200);

-- 7. Lifecycle timestamps
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS sent_to_vendor_at  TIMESTAMPTZ;
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS settled_at         TIMESTAMPTZ;

-- 8. Extend settlement_status CHECK to include the full lifecycle
ALTER TABLE inv_purchase_returns
    DROP CONSTRAINT IF EXISTS inv_purchase_returns_settlement_status_check;
ALTER TABLE inv_purchase_returns
    ADD CONSTRAINT inv_purchase_returns_settlement_status_check
    CHECK (settlement_status IN (
        'Draft',
        'Pending',
        'SentToVendor',
        'CreditNoteReceived',
        'Settled',
        'Cancelled'
    ));

-- ── inv_purchase_return_items: line-level additions ──────────────────────────

-- 9. Line-level cause of return (more specific than the single header reason)
ALTER TABLE inv_purchase_return_items
    ADD COLUMN IF NOT EXISTS return_cause   VARCHAR(50);

-- 10. Free (bonus) quantity the vendor originally supplied; returned along with paid qty
ALTER TABLE inv_purchase_return_items
    ADD COLUMN IF NOT EXISTS free_quantity  NUMERIC(12,3) NOT NULL DEFAULT 0;

-- 11. Snapshot batch number and expiry at return time (batch state may change after)
ALTER TABLE inv_purchase_return_items
    ADD COLUMN IF NOT EXISTS batch_number   VARCHAR(100);
ALTER TABLE inv_purchase_return_items
    ADD COLUMN IF NOT EXISTS expiry_date    DATE;
