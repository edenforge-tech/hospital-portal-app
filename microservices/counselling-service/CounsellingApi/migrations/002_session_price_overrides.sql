-- ============================================================================
-- SESSION PRICE OVERRIDES — Counselling Service Migration
-- Purpose:
--   Auditaable per-session price modification record.
--   Every time a counsellor changes the catalog price for a patient session,
--   a row is inserted here capturing what changed, why, who requested it,
--   and whether a notification was sent to the requesting staff member.
--
-- Run against: Azure PostgreSQL — hospitalportal database
-- Idempotent: uses IF NOT EXISTS / CREATE POLICY ... with DROP IF EXISTS guards.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS session_price_overrides (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    tenant_id               UUID NOT NULL,

    -- Which counselling session this override belongs to
    counselling_id          UUID NOT NULL REFERENCES patient_counselling(id),

    -- The service variant this price applies to (global catalog ID)
    variant_id              UUID NOT NULL,

    -- Snapshot of the variant name at time of override (catalog name may change later)
    variant_name            VARCHAR(200) NOT NULL,

    -- The catalog default price at the time of override (for audit reference)
    base_price              NUMERIC(12,2) NOT NULL,

    -- The price the counsellor is quoting to this patient
    overridden_price        NUMERIC(12,2) NOT NULL,

    -- Billing unit — mirrors service_variants.price_type
    price_type              VARCHAR(20)  NOT NULL DEFAULT 'FIXED',  -- PER_EYE | BOTH_EYES | FIXED

    -- Mandatory justification for the price change
    reason                  TEXT NOT NULL,

    -- Optional free-text additional remarks from counsellor
    remarks                 TEXT,

    -- 'SELF' = counsellor decided independently
    -- 'STAFF' = another staff member in the hospital requested this price
    requested_by_type       VARCHAR(10) NOT NULL
                                CHECK (requested_by_type IN ('SELF', 'STAFF')),

    -- Populated only when requested_by_type = 'STAFF'
    requested_by_user_id    UUID,
    requested_by_name       VARCHAR(255),    -- Snapshot of name at override time
    requested_by_contact    VARCHAR(255),    -- Snapshot of email/phone for notification routing

    -- Notification tracking — fires on session finalization only
    notification_sent       BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sent_at    TIMESTAMPTZ,

    -- HIPAA standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      VARCHAR(255),
    updated_by_user_id      VARCHAR(255),
    deleted_at              TIMESTAMPTZ,
    record_status           VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spo_counselling_id ON session_price_overrides (counselling_id);
CREATE INDEX IF NOT EXISTS idx_spo_tenant_id      ON session_price_overrides (tenant_id);
CREATE INDEX IF NOT EXISTS idx_spo_variant_id     ON session_price_overrides (variant_id);
CREATE INDEX IF NOT EXISTS idx_spo_notify_pending
    ON session_price_overrides (requested_by_type, notification_sent)
    WHERE requested_by_type = 'STAFF'
      AND notification_sent = FALSE
      AND deleted_at IS NULL;

-- RLS — tenant isolation
ALTER TABLE session_price_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON session_price_overrides;
CREATE POLICY tenant_isolation ON session_price_overrides
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- Updated_at trigger (reuses the set_updated_at function from 001_create_tables.sql)
DROP TRIGGER IF EXISTS trg_spo_updated_at ON session_price_overrides;
CREATE TRIGGER trg_spo_updated_at
    BEFORE UPDATE ON session_price_overrides
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
