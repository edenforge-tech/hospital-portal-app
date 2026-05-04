-- ============================================================
-- Migration 29: Bill Transfer SLA & Escalation (Phase 4 DB-401/402)
-- Adds SLA columns to inv_bill_transfers
-- Creates inv_bt_escalation_queue
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- DB-401  SLA columns on inv_bill_transfers
-- ─────────────────────────────────────────────────────────────
ALTER TABLE inv_bill_transfers
    ADD COLUMN IF NOT EXISTS l1_due_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS l2_due_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS sla_state   TEXT NOT NULL DEFAULT 'OnTrack';   -- OnTrack | AtRisk | Breached

-- Backfill l1_due_at for existing Draft/Resubmitted rows (48-hour SLA from creation)
UPDATE inv_bill_transfers
SET l1_due_at = created_at + INTERVAL '48 hours'
WHERE status IN ('Draft', 'Resubmitted')
  AND l1_due_at IS NULL
  AND deleted_at IS NULL;

-- Backfill l2_due_at for existing L1Approved rows
UPDATE inv_bill_transfers
SET l2_due_at = l1_approved_at + INTERVAL '48 hours'
WHERE status = 'L1Approved'
  AND l2_due_at IS NULL
  AND l1_approved_at IS NOT NULL
  AND deleted_at IS NULL;

-- Index for SLA evaluator queries
CREATE INDEX IF NOT EXISTS idx_bt_sla_pending
    ON inv_bill_transfers (tenant_id, status, l1_due_at, l2_due_at)
    WHERE deleted_at IS NULL AND status IN ('Draft', 'Resubmitted', 'L1Approved');

-- ─────────────────────────────────────────────────────────────
-- DB-402  inv_bt_escalation_queue
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_bt_escalation_queue (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL,
    bill_transfer_id    UUID        NOT NULL REFERENCES inv_bill_transfers(id),
    escalation_stage    TEXT        NOT NULL,   -- 'L1_AtRisk' | 'L1_Breached' | 'L2_AtRisk' | 'L2_Breached'
    notified_at         TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uix_bt_escalation_active
    ON inv_bt_escalation_queue (bill_transfer_id, escalation_stage)
    WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bt_escalation_tenant_unresolved
    ON inv_bt_escalation_queue (tenant_id, created_at)
    WHERE resolved_at IS NULL;

-- RLS
ALTER TABLE inv_bt_escalation_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON inv_bt_escalation_queue;
CREATE POLICY tenant_isolation ON inv_bt_escalation_queue
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at_bt_esc()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_bt_esc_updated ON inv_bt_escalation_queue;
CREATE TRIGGER trg_bt_esc_updated
    BEFORE UPDATE ON inv_bt_escalation_queue
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_bt_esc();
