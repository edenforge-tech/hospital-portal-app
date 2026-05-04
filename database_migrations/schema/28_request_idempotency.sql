-- ============================================================
-- Migration 28: Request Idempotency Log (Phase 3 DB-301)
-- inv_request_idempotency – prevents duplicate mutating requests
-- ============================================================

CREATE TABLE IF NOT EXISTS inv_request_idempotency (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL,
    endpoint_key        TEXT        NOT NULL,       -- e.g. 'l1-approve'
    idempotency_key     TEXT        NOT NULL,
    response_status     INT         NOT NULL,       -- HTTP status of first response
    response_body       TEXT,                       -- serialised JSON of first response
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

-- Unique constraint: same tenant + endpoint + key must only process once
CREATE UNIQUE INDEX IF NOT EXISTS uix_idempotency_tenant_endpoint_key
    ON inv_request_idempotency (tenant_id, endpoint_key, idempotency_key);

-- Index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_idempotency_expires
    ON inv_request_idempotency (expires_at);

-- RLS
ALTER TABLE inv_request_idempotency ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON inv_request_idempotency;
CREATE POLICY tenant_isolation ON inv_request_idempotency
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
