-- ============================================================================
-- Migration 87: IOL Returns
-- Purpose: Records IOL lenses returned to pharmacy/inventory when surgery
--          is cancelled or lens is swapped
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS iol_returns (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id),

    iol_power               VARCHAR(50),
    iol_batch               VARCHAR(100),   -- batch/lot number from barcode scan
    iol_barcode             VARCHAR(100),
    reason                  TEXT NOT NULL,  -- why the IOL was returned

    returned_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_by_user_id     UUID REFERENCES users(id),

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID REFERENCES users(id),
    updated_by_user_id      UUID REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived'))
);

CREATE INDEX IF NOT EXISTS idx_ir_journey ON iol_returns(patient_journey_id);
CREATE INDEX IF NOT EXISTS idx_ir_tenant  ON iol_returns(tenant_id) WHERE deleted_at IS NULL;

ALTER TABLE iol_returns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON iol_returns;
CREATE POLICY tenant_isolation ON iol_returns
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE iol_returns IS
    'Tracks IOL lenses returned to pharmacy inventory. Created via Return IOL action '
    'on OT page. Clears IOL fields on the parent patient_journey row.';

COMMIT;
