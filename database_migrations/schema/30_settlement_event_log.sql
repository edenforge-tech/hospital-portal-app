-- ============================================================
-- Migration 30: Settlement Event Log
-- Purpose  : Immutable audit trail for every settlement state
--             transition (Created, PaymentRecorded, CreditNoteApplied,
--             HoldPlaced, HoldResumed, Cancelled, WrittenOff,
--             MarkedOverdue, FullySettled)
-- Depends  : 20_bill_transfer_settlement.sql (inv_invoice_settlements)
-- ============================================================

BEGIN;

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_settlement_event_logs (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       UUID         NOT NULL,
    settlement_id   UUID         NOT NULL
        REFERENCES inv_invoice_settlements(id) ON DELETE CASCADE,
    from_status     TEXT         NOT NULL,
    to_status       TEXT         NOT NULL,
    event_type      TEXT         NOT NULL,   -- Created | PaymentRecorded | CreditNoteApplied | ...
    reason          TEXT,
    amount          NUMERIC(18,4),
    actor_user_id   UUID,
    actor_type      TEXT         NOT NULL DEFAULT 'user', -- 'user' | 'system'
    occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_settlement_event_logs         PRIMARY KEY (id),
    CONSTRAINT chk_sel_actor_type               CHECK (actor_type IN ('user', 'system')),
    CONSTRAINT chk_sel_event_type               CHECK (event_type IN (
        'Created','PaymentRecorded','CreditNoteApplied',
        'HoldPlaced','HoldResumed','Cancelled',
        'WrittenOff','MarkedOverdue','FullySettled'
    ))
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sel_settlement
    ON inv_settlement_event_logs (settlement_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_sel_tenant_time
    ON inv_settlement_event_logs (tenant_id, occurred_at DESC);

-- ----------------------------------------------------------
-- Row-Level Security (mirrors the pattern on parent table)
-- ----------------------------------------------------------
ALTER TABLE inv_settlement_event_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'inv_settlement_event_logs'
          AND policyname = 'tenant_isolation_settlement_event_logs'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY tenant_isolation_settlement_event_logs
            ON inv_settlement_event_logs
            FOR ALL
            USING (tenant_id::text = current_setting('app.current_tenant_id', true))
        $policy$;
    END IF;
END;
$$;

-- ----------------------------------------------------------
-- Audit trigger (auto-timestamp not needed – occurred_at is
-- set at insert time and the table is append-only)
-- ----------------------------------------------------------

COMMIT;
