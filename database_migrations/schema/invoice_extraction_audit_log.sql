-- ============================================================================
-- Migration: Invoice Extraction Audit Log table
-- Purpose  : Stores per-session audit trail for AI invoice extraction.
--            Document blobs are purged after 90 days; this row is kept
--            indefinitely for HIPAA compliance.
-- ============================================================================

CREATE TABLE IF NOT EXISTS inv_invoice_extraction_audit_logs (
    id                      UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id               UUID        NOT NULL,
    user_id                 UUID        NOT NULL,
    session_id              VARCHAR(64) NOT NULL,

    -- Outcome: 'Confirmed' | 'Abandoned'
    outcome                 VARCHAR(20) NOT NULL DEFAULT 'Confirmed',

    -- Document provenance
    original_filename       VARCHAR(255) NOT NULL DEFAULT '',
    document_url            TEXT,
    blob_purge_at           TIMESTAMPTZ  NOT NULL,  -- upload_date + 90 days
    blob_purged             BOOLEAN      NOT NULL DEFAULT FALSE,

    -- Provider metadata
    provider_model          VARCHAR(100) NOT NULL DEFAULT '',
    processing_ms           INTEGER      NOT NULL DEFAULT 0,

    -- Confidence distribution
    high_field_count        INTEGER      NOT NULL DEFAULT 0,
    review_field_count      INTEGER      NOT NULL DEFAULT 0,
    low_field_count         INTEGER      NOT NULL DEFAULT 0,
    line_item_count         INTEGER      NOT NULL DEFAULT 0,

    -- User override tracking
    field_override_count    INTEGER      NOT NULL DEFAULT 0,
    overridden_fields_json  TEXT,                   -- JSON array of field names

    -- Created entity links (null when outcome = 'Abandoned')
    created_invoice_id      UUID,
    created_grn_id          UUID,

    -- Immutable timestamp (no updated_at — rows are never mutated except blob_purged flag)
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Lookup by session
CREATE INDEX IF NOT EXISTS idx_inv_extraction_audit_session
    ON inv_invoice_extraction_audit_logs (tenant_id, session_id)
    WHERE blob_purged = FALSE;

-- Purge job index: find rows due for blob purge
CREATE INDEX IF NOT EXISTS idx_inv_extraction_audit_purge
    ON inv_invoice_extraction_audit_logs (tenant_id, blob_purge_at, blob_purged)
    WHERE blob_purged = FALSE;
