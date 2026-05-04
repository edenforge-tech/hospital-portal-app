-- ============================================================
-- Migration 20: Bill Transfer & Invoice Settlement tables
-- Implements the post-GRN finance approval workflow
-- ============================================================

-- ── inv_bill_transfers ────────────────────────────────────────────────────────
-- One row per GRN approved bill forwarded to finance for dual-level approval
CREATE TABLE IF NOT EXISTS inv_bill_transfers (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL,

    grn_id              UUID            NOT NULL REFERENCES inv_grn_headers(id),
    invoice_id          UUID            NOT NULL REFERENCES inv_purchase_invoices(id),
    vendor_id           UUID            NOT NULL REFERENCES inv_vendors(id),

    -- Amounts for 3-way match (copied from GRN/invoice at generation time)
    grn_total_amount    NUMERIC(14,2)   NOT NULL DEFAULT 0,
    invoice_total_amount NUMERIC(14,2)  NOT NULL DEFAULT 0,
    cgst_amount         NUMERIC(14,2)   NOT NULL DEFAULT 0,
    sgst_amount         NUMERIC(14,2)   NOT NULL DEFAULT 0,
    igst_amount         NUMERIC(14,2)   NOT NULL DEFAULT 0,
    tcs_amount          NUMERIC(14,2)   NOT NULL DEFAULT 0,

    -- Workflow state
    -- NotGenerated | Generated | AccountsApproved | FinanceApproved
    -- | ReadyForSettlement | RejectedByAccounts | RejectedByFinance | Cancelled
    status              VARCHAR(32)     NOT NULL DEFAULT 'Generated',

    -- L1 (Accounts) approval
    l1_approved_by      UUID,
    l1_approved_at      TIMESTAMPTZ,
    l1_remarks          TEXT,

    -- L2 (Finance) approval
    l2_approved_by      UUID,
    l2_approved_at      TIMESTAMPTZ,
    l2_remarks          TEXT,

    -- General remarks / rejection reason
    remarks             TEXT,

    -- Document attachments (URL or reference strings)
    attachments         TEXT[]          NOT NULL DEFAULT '{}',

    -- Standard audit columns
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status_meta         VARCHAR(20)     NOT NULL DEFAULT 'active'
);

-- Prevent duplicate bill generation for the same GRN
CREATE UNIQUE INDEX IF NOT EXISTS uix_bill_transfers_grn_id
    ON inv_bill_transfers(grn_id)
    WHERE deleted_at IS NULL;

-- Fast lookups
CREATE INDEX IF NOT EXISTS idx_bill_transfers_tenant_status
    ON inv_bill_transfers(tenant_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bill_transfers_vendor
    ON inv_bill_transfers(tenant_id, vendor_id)
    WHERE deleted_at IS NULL;

-- RLS (tenant isolation — matches pattern on all 24 existing tables)
ALTER TABLE inv_bill_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bill_transfers_tenant_isolation ON inv_bill_transfers;
CREATE POLICY bill_transfers_tenant_isolation ON inv_bill_transfers
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_inv_bill_transfers_updated_at
    BEFORE UPDATE ON inv_bill_transfers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── inv_invoice_settlements ───────────────────────────────────────────────────
-- One settlement per FinanceApproved bill transfer;
-- tracks all installment payments until fully settled / written off
CREATE TABLE IF NOT EXISTS inv_invoice_settlements (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL,

    bill_transfer_id        UUID            NOT NULL REFERENCES inv_bill_transfers(id),
    vendor_id               UUID            NOT NULL REFERENCES inv_vendors(id),

    -- Financial reconciliation snapshot (computed at creation from bill transfer)
    gross_amount            NUMERIC(14,2)   NOT NULL DEFAULT 0,
    debit_note_adjustment   NUMERIC(14,2)   NOT NULL DEFAULT 0,  -- sum of PurchaseReturn.net_return_amount
    tcs_amount              NUMERIC(14,2)   NOT NULL DEFAULT 0,
    net_payable_amount      NUMERIC(14,2)   NOT NULL DEFAULT 0,  -- gross - debit_note_adj - tcs

    -- Payment tracking
    amount_paid             NUMERIC(14,2)   NOT NULL DEFAULT 0,
    balance_remaining       NUMERIC(14,2)   NOT NULL DEFAULT 0,

    -- Workflow state
    -- Pending | PartiallySettled | Settled | Overdue | OnHold | Cancelled | WrittenOff
    status                  VARCHAR(20)     NOT NULL DEFAULT 'Pending',

    due_date                DATE,
    settled_at              TIMESTAMPTZ,
    on_hold_reason          TEXT,
    cancellation_reason     TEXT,
    write_off_reason        TEXT,

    -- Standard audit columns
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status_meta             VARCHAR(20)     NOT NULL DEFAULT 'active'
);

-- One settlement per bill transfer
CREATE UNIQUE INDEX IF NOT EXISTS uix_settlements_bill_transfer_id
    ON inv_invoice_settlements(bill_transfer_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_settlements_tenant_status
    ON inv_invoice_settlements(tenant_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_settlements_due_date
    ON inv_invoice_settlements(tenant_id, due_date)
    WHERE deleted_at IS NULL AND status NOT IN ('Settled', 'Cancelled', 'WrittenOff');

-- RLS
ALTER TABLE inv_invoice_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_settlements_tenant_isolation ON inv_invoice_settlements;
CREATE POLICY invoice_settlements_tenant_isolation ON inv_invoice_settlements
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_inv_invoice_settlements_updated_at
    BEFORE UPDATE ON inv_invoice_settlements
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── inv_settlement_payments ───────────────────────────────────────────────────
-- Junction: each installment payment or credit note linked to a settlement
CREATE TABLE IF NOT EXISTS inv_settlement_payments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL,

    settlement_id       UUID            NOT NULL REFERENCES inv_invoice_settlements(id),
    payment_id          UUID            REFERENCES inv_vendor_payments(id),  -- null for credit note alloc

    amount_allocated    NUMERIC(14,2)   NOT NULL DEFAULT 0,

    -- Payment | CreditNote | Advance | Adjustment | Reversal
    allocation_type     VARCHAR(20)     NOT NULL DEFAULT 'Payment',

    reference           TEXT,           -- UTR / cheque no / credit note no
    applied_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_settlement_payments_settlement
    ON inv_settlement_payments(settlement_id)
    WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE inv_settlement_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settlement_payments_tenant_isolation ON inv_settlement_payments;
CREATE POLICY settlement_payments_tenant_isolation ON inv_settlement_payments
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_inv_settlement_payments_updated_at
    BEFORE UPDATE ON inv_settlement_payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
