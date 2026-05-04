-- Migration 32: Vendor multi-bank accounts
-- Replaces the single bank-account fields embedded in inv_vendors with a
-- proper one-to-many table so a vendor can have multiple accounts.

BEGIN;

CREATE TABLE IF NOT EXISTS inv_vendor_bank_accounts (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID        NOT NULL,
    vendor_id            UUID        NOT NULL REFERENCES inv_vendors(id) ON DELETE CASCADE,

    account_holder_name  VARCHAR(200) NOT NULL,
    bank_name            VARCHAR(200) NOT NULL,
    account_number       VARCHAR(50)  NOT NULL,
    ifsc_code            VARCHAR(11)  NOT NULL,
    account_type         VARCHAR(20)  NOT NULL DEFAULT 'current'
                             CHECK (account_type IN ('current','savings','cc','od')),
    is_primary           BOOLEAN      NOT NULL DEFAULT FALSE,
    nickname             VARCHAR(100),

    -- Standard audit columns
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by_user_id   UUID,
    updated_by_user_id   UUID,
    deleted_at           TIMESTAMPTZ,
    status               VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_bank_accts_vendor
    ON inv_vendor_bank_accounts (tenant_id, vendor_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_bank_accts_primary
    ON inv_vendor_bank_accounts (tenant_id, vendor_id, is_primary)
    WHERE deleted_at IS NULL AND is_primary = TRUE;

-- Enforce at most one primary per vendor per tenant (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendor_bank_accts_primary
    ON inv_vendor_bank_accounts (tenant_id, vendor_id)
    WHERE deleted_at IS NULL AND is_primary = TRUE;

-- Row-Level Security
ALTER TABLE inv_vendor_bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON inv_vendor_bank_accounts;
CREATE POLICY tenant_isolation ON inv_vendor_bank_accounts
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Seed: copy existing embedded bank details from inv_vendors into the new table
INSERT INTO inv_vendor_bank_accounts (
    id, tenant_id, vendor_id,
    account_holder_name, bank_name, account_number, ifsc_code, account_type,
    is_primary, created_at, updated_at, status
)
SELECT
    gen_random_uuid(),
    tenant_id,
    id,
    COALESCE(bank_account_holder_name, name),
    bank_name,
    bank_account_number,
    COALESCE(bank_ifsc_code, 'UNKN0000000'),
    COALESCE(bank_account_type, 'current'),
    TRUE,
    NOW(),
    NOW(),
    'active'
FROM inv_vendors
WHERE bank_account_number IS NOT NULL
  AND bank_account_number <> ''
  AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- NOTE: Original columns on inv_vendors are kept for backward compatibility.

COMMIT;
