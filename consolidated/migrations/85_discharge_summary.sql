-- ============================================================================
-- Migration 85: Discharge Summary
-- Purpose: Structured discharge document per patient journey
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS discharge_summary (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id) UNIQUE,

    -- ── Discharge condition ───────────────────────────────────────────────
    condition_at_discharge  VARCHAR(20)
                                CHECK (condition_at_discharge IN ('Good','Stable','Fair','Guarded')),
    discharge_date          DATE,
    discharge_time          TIME,

    -- ── Clinical content ──────────────────────────────────────────────────
    -- diagnosis_codes: array of ICD-10 codes [{code, description}]
    diagnosis_codes         JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- procedures_performed: array of procedure names/codes
    procedures_performed    JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary_text            TEXT,

    -- ── Format & status ───────────────────────────────────────────────────
    format_type             VARCHAR(20) NOT NULL DEFAULT 'Short'
                                CHECK (format_type IN ('Short','Detailed','Typed')),
    summary_status          VARCHAR(20) NOT NULL DEFAULT 'Draft'
                                CHECK (summary_status IN ('Draft','Final')),

    -- ── Financial close ───────────────────────────────────────────────────
    final_bill_amount       DECIMAL(12,2),
    final_settlement_status VARCHAR(30),
    summary_url             TEXT,   -- PDF URL if generated

    -- ── Finalization ──────────────────────────────────────────────────────
    finalized_at            TIMESTAMPTZ,
    finalized_by_user_id    UUID REFERENCES users(id),

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID REFERENCES users(id),
    updated_by_user_id      UUID REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived'))
);

CREATE INDEX IF NOT EXISTS idx_ds_journey ON discharge_summary(patient_journey_id);
CREATE INDEX IF NOT EXISTS idx_ds_tenant  ON discharge_summary(tenant_id) WHERE deleted_at IS NULL;

ALTER TABLE discharge_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON discharge_summary;
CREATE POLICY tenant_isolation ON discharge_summary
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE discharge_summary IS
    'Discharge document. summary_status Draft→Final. '
    'Finalization triggers patient_journey.clinical_state→Discharged and is_locked=true.';

COMMIT;
