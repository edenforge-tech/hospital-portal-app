-- ============================================================
-- Week 3 Migration: Vendor Performance Tracking + PO Receipt
-- ============================================================

-- 1. Add receipt-tracking columns to inv_purchase_orders
ALTER TABLE inv_purchase_orders
    ADD COLUMN IF NOT EXISTS actual_delivery_date  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS received_at           TIMESTAMPTZ;

-- 2. Add policy_id column to inv_purchase_requisitions
--    Enables auto-reorder to link generated requisitions to the active policy
ALTER TABLE inv_purchase_requisitions
    ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES inv_branch_procurement_policies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inv_req_policy_id
    ON inv_purchase_requisitions(policy_id)
    WHERE deleted_at IS NULL;

-- 3. Create inv_vendor_performance table
CREATE TABLE IF NOT EXISTS inv_vendor_performance (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID          NOT NULL,
    vendor_id               UUID          NOT NULL REFERENCES inv_vendors(id),
    po_id                   UUID          NOT NULL REFERENCES inv_purchase_orders(id),
    store_id                UUID          NOT NULL REFERENCES inv_store_master(id),
    expected_delivery_date  TIMESTAMPTZ,
    actual_delivery_date    TIMESTAMPTZ,
    on_time_delivery        BOOLEAN       NOT NULL DEFAULT FALSE,
    days_late               INT,
    total_ordered           NUMERIC(15,3) NOT NULL DEFAULT 0,
    total_received          NUMERIC(15,3) NOT NULL DEFAULT 0,
    fulfillment_rate        NUMERIC(6,2)  NOT NULL DEFAULT 0,  -- 0–100
    rating                  NUMERIC(3,1),                      -- 1.0–5.0
    notes                   TEXT,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)   NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_vp_vendor
    ON inv_vendor_performance(tenant_id, vendor_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inv_vp_po
    ON inv_vendor_performance(po_id)
    WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE inv_vendor_performance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'inv_vendor_performance'
          AND policyname = 'tenant_isolation_vp'
    ) THEN
        CREATE POLICY tenant_isolation_vp ON inv_vendor_performance
            FOR ALL
            USING (tenant_id::TEXT = current_setting('app.current_tenant_id', TRUE));
    END IF;
END $$;

-- 4. Materialized view refresh will pick up new PO statuses automatically
-- (mv_inv_stock_summary already covers StockBatch — no change needed)
