-- ============================================================================
-- Migration 82: IP Billing Transactions
-- Purpose: Records all financial transactions per patient journey
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS ip_billing_transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    branch_id               UUID NOT NULL REFERENCES branch(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id),

    transaction_type        VARCHAR(20) NOT NULL
                                CHECK (transaction_type IN ('Advance','Payment','Discount','Refund')),
    amount                  DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_mode            VARCHAR(20) NOT NULL
                                CHECK (payment_mode IN ('Cash','Card','UPI','Insurance','CGHS')),
    reference_number        VARCHAR(100),   -- card/UPI transaction ref, insurance claim #
    notes                   TEXT,
    receipt_number          VARCHAR(50),    -- generated receipt #

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID REFERENCES users(id),
    updated_by_user_id      UUID REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ibt_journey  ON ip_billing_transactions(patient_journey_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ibt_tenant   ON ip_billing_transactions(tenant_id)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ibt_type     ON ip_billing_transactions(transaction_type)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ibt_created  ON ip_billing_transactions(created_at DESC)    WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE ip_billing_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ip_billing_transactions;
CREATE POLICY tenant_isolation ON ip_billing_transactions
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE ip_billing_transactions IS
    'All advance/payment/discount/refund transactions for an IP patient journey. '
    'Backend auto-recalculates patient_journey.total_paid and financial_state after every insert.';

COMMIT;
