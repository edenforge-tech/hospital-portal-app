-- =============================================================================
-- CounsellingApi — Database Migration
-- Creates: patient_counselling, counselling_audit_log
--
-- Run once against Azure PostgreSQL (hospitalportal database).
-- Idempotent: uses IF NOT EXISTS / IF NOT EXISTS guards throughout.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. patient_counselling
--    State-machine-focused counselling workflow record.
--    Every row represents one patient's active counselling session lifecycle.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_counselling (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL,
    patient_id          UUID            NOT NULL,

    -- State machine
    status              VARCHAR(50)     NOT NULL DEFAULT 'Pending',
    previous_status     VARCHAR(50),

    -- Optimistic lock
    is_locked           BOOLEAN         NOT NULL DEFAULT FALSE,
    locked_by           VARCHAR(255),

    -- Decision outcome
    decision_type       VARCHAR(100),           -- Interested | NotInterested
    decision_timestamp  TIMESTAMPTZ,

    -- Scheduling
    scheduled_date      TIMESTAMPTZ,

    -- Package selection
    package_id          UUID,
    package_details     JSONB,                  -- arbitrary package payload

    -- HIPAA standard audit columns (required by project conventions)
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  VARCHAR(255),
    updated_by_user_id  VARCHAR(255),
    deleted_at          TIMESTAMPTZ,            -- soft delete (NEVER hard-delete)
    record_status       VARCHAR(50)     NOT NULL DEFAULT 'active'
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pc_patient_id  ON patient_counselling (patient_id);
CREATE INDEX IF NOT EXISTS idx_pc_tenant_id   ON patient_counselling (tenant_id);
CREATE INDEX IF NOT EXISTS idx_pc_status      ON patient_counselling (status);
CREATE INDEX IF NOT EXISTS idx_pc_deleted_at  ON patient_counselling (deleted_at) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 2. counselling_audit_log
--    Immutable audit trail — one row per action (HIPAA requirement).
--    Never updated or deleted.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS counselling_audit_log (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    counselling_id  UUID        NOT NULL REFERENCES patient_counselling (id),
    action          VARCHAR(100) NOT NULL,
    performed_by    VARCHAR(255) NOT NULL,
    performed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cal_counselling_id ON counselling_audit_log (counselling_id);
CREATE INDEX IF NOT EXISTS idx_cal_performed_at   ON counselling_audit_log (performed_at DESC);

-- ---------------------------------------------------------------------------
-- 3. Row-Level Security (RLS) — multi-tenant isolation (HIPAA requirement)
-- ---------------------------------------------------------------------------
ALTER TABLE patient_counselling   ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselling_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to allow idempotent re-runs
DROP POLICY IF EXISTS tenant_isolation ON patient_counselling;
CREATE POLICY tenant_isolation ON patient_counselling
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- Audit log is scoped through its FK to patient_counselling; add a bypass policy
-- for the audit-writer role so it can always insert.
DROP POLICY IF EXISTS audit_insert ON counselling_audit_log;
CREATE POLICY audit_insert ON counselling_audit_log
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS audit_select ON counselling_audit_log;
CREATE POLICY audit_select ON counselling_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_counselling pc
            WHERE pc.id = counselling_id
            AND   pc.tenant_id::text = current_setting('app.current_tenant_id', TRUE)
        )
    );

-- ---------------------------------------------------------------------------
-- 4. Updated_at auto-trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pc_updated_at ON patient_counselling;
CREATE TRIGGER trg_pc_updated_at
    BEFORE UPDATE ON patient_counselling
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
