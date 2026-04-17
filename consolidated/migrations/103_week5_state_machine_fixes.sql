-- ============================================================
-- Migration 103 – Week 5 State Machine Fixes
-- Adds dispatched_by / dispatched_at / received_by / received_at
-- to inv_stock_transfers to support the full InTransit workflow.
-- All other state-machine fixes are pure C# changes (no schema change).
-- ============================================================

-- ── inv_stock_transfers: add InTransit/Received tracking columns ──────────────
ALTER TABLE inv_stock_transfers
    ADD COLUMN IF NOT EXISTS dispatched_by      UUID,
    ADD COLUMN IF NOT EXISTS dispatched_at      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS received_by        UUID,
    ADD COLUMN IF NOT EXISTS received_at        TIMESTAMPTZ;

-- Update the status check constraint to include new states
ALTER TABLE inv_stock_transfers
    DROP CONSTRAINT IF EXISTS inv_stock_transfers_transfer_status_check;

ALTER TABLE inv_stock_transfers
    ADD CONSTRAINT inv_stock_transfers_transfer_status_check
    CHECK (transfer_status IN ('Pending','Approved','InTransit','Completed','Cancelled'));

-- ── Update Requisition status constraint to include new states ─────────────────
-- IMPORTANT: Migrate existing data BEFORE adding the check constraint

-- Migrate old status values first
UPDATE inv_purchase_requisitions
   SET requisition_status = 'Draft'
 WHERE requisition_status = 'Pending';

UPDATE inv_purchase_requisitions
   SET requisition_status = 'ConvertedToPO'
 WHERE requisition_status = 'POCreated';

ALTER TABLE inv_purchase_requisitions
    DROP CONSTRAINT IF EXISTS inv_purchase_requisitions_requisition_status_check;

ALTER TABLE inv_purchase_requisitions
    ADD CONSTRAINT inv_purchase_requisitions_requisition_status_check
    CHECK (requisition_status IN (
        'Draft', 'Submitted', 'Approved',
        'ConvertedToRFQ', 'ConvertedToPO',
        'Rejected', 'Cancelled'
    ));

-- ── Update Policy status constraint to include Archived ───────────────────────
ALTER TABLE inv_branch_procurement_policies
    DROP CONSTRAINT IF EXISTS inv_branch_procurement_policies_policy_status_check;

ALTER TABLE inv_branch_procurement_policies
    ADD CONSTRAINT inv_branch_procurement_policies_policy_status_check
    CHECK (policy_status IN ('Draft','Published','Superseded','Archived'));

-- ── Verify ────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    RAISE NOTICE 'Migration 103 complete: StockTransfer InTransit columns, Requisition status fix, Policy Archived status added.';
END $$;
