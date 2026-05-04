-- ============================================================
-- Migration 26: Bill Transfer Governance Foundation (Phase 1)
-- DB-101: inv_bill_transfer_policy   – tenant-level threshold policy
-- DB-102: inv_bill_transfer_event_log – immutable audit trail
-- DB-103: version_no on inv_bill_transfers + inv_invoice_settlements
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- DB-101  inv_bill_transfer_policy
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_bill_transfer_policy (
    tenant_id                       UUID        PRIMARY KEY REFERENCES tenant(id),
    low_value_override_threshold    NUMERIC(14,2) NOT NULL DEFAULT 50000.00,
    allow_low_value_flex_override   BOOLEAN     NOT NULL DEFAULT TRUE,
    require_override_reason         BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_by_user_id              UUID,
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill every existing tenant with the INR 50,000 default
INSERT INTO inv_bill_transfer_policy (tenant_id)
SELECT id FROM tenant
ON CONFLICT (tenant_id) DO NOTHING;

-- RLS
ALTER TABLE inv_bill_transfer_policy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON inv_bill_transfer_policy;
CREATE POLICY tenant_isolation ON inv_bill_transfer_policy
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- DB-102  inv_bill_transfer_event_log  (insert-only audit)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_bill_transfer_event_log (
    event_id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL,
    bill_transfer_id    UUID        NOT NULL,
    from_status         TEXT,
    to_status           TEXT        NOT NULL,
    action              TEXT        NOT NULL,
    actor_user_id       UUID        NOT NULL,
    actor_role          TEXT,
    reason_code         TEXT,
    reason_text         TEXT,
    override_applied    BOOLEAN     NOT NULL DEFAULT FALSE,
    correlation_id      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance index for timeline queries
CREATE INDEX IF NOT EXISTS idx_bt_event_log_bt_id
    ON inv_bill_transfer_event_log (tenant_id, bill_transfer_id, created_at DESC);

-- Prevent accidental updates or deletes – this is an append-only log
CREATE OR REPLACE RULE no_update_bt_event_log AS
    ON UPDATE TO inv_bill_transfer_event_log DO INSTEAD NOTHING;

CREATE OR REPLACE RULE no_delete_bt_event_log AS
    ON DELETE TO inv_bill_transfer_event_log DO INSTEAD NOTHING;

-- RLS
ALTER TABLE inv_bill_transfer_event_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON inv_bill_transfer_event_log;
CREATE POLICY tenant_isolation ON inv_bill_transfer_event_log
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- DB-103  version_no – optimistic concurrency columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE inv_bill_transfers
    ADD COLUMN IF NOT EXISTS version_no BIGINT NOT NULL DEFAULT 1;

ALTER TABLE inv_invoice_settlements
    ADD COLUMN IF NOT EXISTS version_no BIGINT NOT NULL DEFAULT 1;

-- Triggers to auto-increment version_no on every update
CREATE OR REPLACE FUNCTION increment_version_no()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.version_no := OLD.version_no + 1;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bt_version ON inv_bill_transfers;
CREATE TRIGGER trg_bt_version
    BEFORE UPDATE ON inv_bill_transfers
    FOR EACH ROW EXECUTE FUNCTION increment_version_no();

DROP TRIGGER IF EXISTS trg_settlement_version ON inv_invoice_settlements;
CREATE TRIGGER trg_settlement_version
    BEFORE UPDATE ON inv_invoice_settlements
    FOR EACH ROW EXECUTE FUNCTION increment_version_no();
