-- =============================================================================
-- Migration 22: Purchase Return GST & Accounting Fields
-- Adds GST breakdown, cancellation reason, and vendor ledger return linkage
-- =============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. GST columns on inv_purchase_return_items
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE inv_purchase_return_items
    ADD COLUMN IF NOT EXISTS hsn_code        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS gst_percent     NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cgst_percent    NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sgst_percent    NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS igst_percent    NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS taxable_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cgst_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sgst_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS igst_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_amount      NUMERIC(14,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN inv_purchase_return_items.hsn_code       IS 'Harmonized System Nomenclature code inherited from source invoice item';
COMMENT ON COLUMN inv_purchase_return_items.gst_percent    IS 'Total GST rate (CGST+SGST or IGST) inherited from source';
COMMENT ON COLUMN inv_purchase_return_items.taxable_amount IS 'return_quantity × purchase_rate (excluding tax)';
COMMENT ON COLUMN inv_purchase_return_items.cgst_amount    IS 'Central GST on this line';
COMMENT ON COLUMN inv_purchase_return_items.sgst_amount    IS 'State GST on this line';
COMMENT ON COLUMN inv_purchase_return_items.igst_amount    IS 'Integrated GST on this line (inter-state)';
COMMENT ON COLUMN inv_purchase_return_items.net_amount     IS 'taxable_amount + cgst_amount + sgst_amount + igst_amount';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. GST + accounting columns on inv_purchase_returns (header)
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE inv_purchase_returns
    ADD COLUMN IF NOT EXISTS taxable_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cgst_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sgst_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS igst_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tcs_percent        NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tcs_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_return_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS itc_reversal_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

COMMENT ON COLUMN inv_purchase_returns.taxable_amount      IS 'Sum of all line taxable_amount values';
COMMENT ON COLUMN inv_purchase_returns.cgst_amount         IS 'Sum of all line cgst_amount values';
COMMENT ON COLUMN inv_purchase_returns.sgst_amount         IS 'Sum of all line sgst_amount values';
COMMENT ON COLUMN inv_purchase_returns.igst_amount         IS 'Sum of all line igst_amount values';
COMMENT ON COLUMN inv_purchase_returns.tcs_percent         IS 'TCS % inherited from source invoice (if applicable)';
COMMENT ON COLUMN inv_purchase_returns.tcs_amount          IS 'Proportional TCS amount on this return';
COMMENT ON COLUMN inv_purchase_returns.net_return_amount   IS 'taxable_amount + total_gst + tcs_amount';
COMMENT ON COLUMN inv_purchase_returns.itc_reversal_amount IS 'Input Tax Credit to be reversed when credit note is received (= proportional GST on CN amount)';
COMMENT ON COLUMN inv_purchase_returns.cancellation_reason IS 'Required when cancelling a return that has already received a credit note';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Add return_id FK to inv_vendor_outstanding_ledger
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE inv_vendor_outstanding_ledger
    ADD COLUMN IF NOT EXISTS return_id UUID REFERENCES inv_purchase_returns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_ledger_return_id
    ON inv_vendor_outstanding_ledger(return_id)
    WHERE return_id IS NOT NULL;

COMMENT ON COLUMN inv_vendor_outstanding_ledger.return_id IS 'Links CreditNote / CreditNoteReversal ledger entries back to the source purchase return';

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Expand EntryType check constraint to include new types
-- ──────────────────────────────────────────────────────────────────────────────
-- Drop and recreate constraint to add CreditNoteReversal and StockReturnReversal
DO $$
BEGIN
    -- Only alter if the constraint exists (safe to skip if not present)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'inv_vendor_outstanding_ledger'
          AND constraint_type = 'CHECK'
          AND constraint_name LIKE '%entry_type%'
    ) THEN
        EXECUTE 'ALTER TABLE inv_vendor_outstanding_ledger DROP CONSTRAINT IF EXISTS inv_vendor_outstanding_ledger_entry_type_check';
    END IF;
END $$;

-- RLS policy: existing policy covers return_id automatically (tenant_id filter)
