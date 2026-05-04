-- ============================================================
-- Migration 27: Bill Transfer Reason Catalog (Phase 2 DB-201)
-- inv_bt_reason_catalog – structured reason codes for reject / resubmit / override
-- ============================================================

CREATE TABLE IF NOT EXISTS inv_bt_reason_catalog (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID,                               -- NULL = global (system) code
    reason_code     TEXT        NOT NULL,
    reason_label    TEXT        NOT NULL,
    category        TEXT        NOT NULL,               -- 'Reject' | 'Resubmit' | 'Override' | 'Cancel'
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    sort_order      INT         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uix_bt_reason_tenant_code
    ON inv_bt_reason_catalog (COALESCE(tenant_id::text, ''), reason_code, category);

-- Seed global reason codes
INSERT INTO inv_bt_reason_catalog (reason_code, reason_label, category, sort_order) VALUES
  -- Reject reasons
  ('MISMATCH_AMOUNT',     'Amount mismatch with PO/GRN',       'Reject',   1),
  ('MISSING_DOCS',        'Missing supporting documents',       'Reject',   2),
  ('DUPLICATE_INVOICE',   'Possible duplicate invoice',         'Reject',   3),
  ('VENDOR_COMPLIANCE',   'Vendor compliance issue',            'Reject',   4),
  ('TAX_DISCREPANCY',     'Tax / GST discrepancy',              'Reject',   5),
  ('OTHER_REJECT',        'Other (specify in remarks)',         'Reject',  99),
  -- Resubmit reasons
  ('DOCS_ATTACHED',       'Documents now attached',             'Resubmit', 1),
  ('AMOUNT_CORRECTED',    'Amount corrected after clarification','Resubmit',2),
  ('OTHER_RESUBMIT',      'Other (specify in remarks)',         'Resubmit',99),
  -- Override (low-value flex)
  ('LOW_VALUE_SINGLE_OP', 'Single operator - low-value bill',  'Override', 1),
  ('EMERGENCY_PAYMENT',   'Emergency payment authorisation',   'Override', 2),
  ('BRANCH_DIRECTIVE',    'Branch-head directive',             'Override', 3),
  ('OTHER_OVERRIDE',      'Other (specify in remarks)',        'Override', 99),
  -- Cancel
  ('ENTERED_IN_ERROR',    'Entered in error',                  'Cancel',   1),
  ('VENDOR_DISPUTE',      'Vendor dispute – to be re-raised',  'Cancel',   2),
  ('OTHER_CANCEL',        'Other (specify in remarks)',        'Cancel',   99)
ON CONFLICT DO NOTHING;

-- RLS (tenant rows isolated; global rows visible to all via bypass)
ALTER TABLE inv_bt_reason_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON inv_bt_reason_catalog;
CREATE POLICY tenant_isolation ON inv_bt_reason_catalog
    FOR ALL USING (
        tenant_id IS NULL OR
        tenant_id::text = current_setting('app.current_tenant_id', true)
    );

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at_bt_reason()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_bt_reason_updated ON inv_bt_reason_catalog;
CREATE TRIGGER trg_bt_reason_updated
    BEFORE UPDATE ON inv_bt_reason_catalog
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_bt_reason();
