-- Migration: Add vital_sign and nurse_record tables for IP Management
-- Run after the existing IP management migrations.

-- ── vital_sign ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vital_sign (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                 UUID        NOT NULL,
    journey_id                UUID        NOT NULL REFERENCES patient_journey(id) ON DELETE CASCADE,
    recorded_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    temperature               NUMERIC(5,2),          -- Celsius
    blood_pressure_systolic   INTEGER,
    blood_pressure_diastolic  INTEGER,
    pulse_rate                INTEGER,
    respiratory_rate          INTEGER,
    oxygen_saturation         NUMERIC(5,2),           -- percentage
    weight                    NUMERIC(6,2),            -- kg
    height                    NUMERIC(5,2),            -- cm
    notes                     TEXT,
    recorded_by_user_id       UUID        NOT NULL,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at                TIMESTAMPTZ,
    status                    TEXT        NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_vital_sign_journey
    ON vital_sign (journey_id, tenant_id)
    WHERE deleted_at IS NULL;

ALTER TABLE vital_sign ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vital_sign_tenant_isolation ON vital_sign;
CREATE POLICY vital_sign_tenant_isolation ON vital_sign
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ── nurse_record ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS nurse_record (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID        NOT NULL,
    journey_id           UUID        NOT NULL REFERENCES patient_journey(id) ON DELETE CASCADE,
    recorded_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    shift_type           TEXT,                          -- Morning|Afternoon|Night
    nursing_notes        TEXT,
    medications_given    TEXT,
    intake_output_notes  TEXT,
    pain_score           INTEGER CHECK (pain_score BETWEEN 0 AND 10),
    alertness_level      TEXT,                          -- Alert|Drowsy|Confused|Unconscious
    recorded_by_user_id  UUID        NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at           TIMESTAMPTZ,
    status               TEXT        NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_nurse_record_journey
    ON nurse_record (journey_id, tenant_id)
    WHERE deleted_at IS NULL;

ALTER TABLE nurse_record ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nurse_record_tenant_isolation ON nurse_record;
CREATE POLICY nurse_record_tenant_isolation ON nurse_record
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));
