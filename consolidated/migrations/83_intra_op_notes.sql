-- ============================================================================
-- Migration 83: Intra-Operative Notes (OT Surgery Form)
-- Purpose: Surgery form filled by OT team during/after the procedure
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS intra_op_notes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id),

    -- ── Surgical team ─────────────────────────────────────────────────────
    primary_surgeon_id      UUID REFERENCES users(id),
    assistant_surgeon_id    UUID REFERENCES users(id),
    anesthesiologist_id     UUID REFERENCES users(id),
    scrub_nurse_id          UUID REFERENCES users(id),

    -- ── Procedure details ─────────────────────────────────────────────────
    surgery_start_time      TIMESTAMPTZ,
    surgery_end_time        TIMESTAMPTZ,
    anesthesia_type         VARCHAR(100),
    anesthesia_notes        TEXT,
    procedure_performed     TEXT,
    eye_operated            VARCHAR(10) CHECK (eye_operated IN ('OD','OS','OU')),
    findings                TEXT,
    complications           TEXT,

    -- ── IOL implant (ophthalmology-specific) ──────────────────────────────
    implant_used            VARCHAR(200),    -- brand + model, e.g. "Alcon AcrySof"
    implant_power           VARCHAR(50),     -- e.g. "+20.5 D"

    -- ── Measurements ──────────────────────────────────────────────────────
    blood_loss_ml           INTEGER,
    iv_fluid_ml             INTEGER,
    specimen_sent           BOOLEAN NOT NULL DEFAULT FALSE,
    specimen_details        TEXT,

    -- ── Document status ───────────────────────────────────────────────────
    notes_status            VARCHAR(20) NOT NULL DEFAULT 'Draft'
                                CHECK (notes_status IN ('Draft','Signed','Locked')),
    signed_at               TIMESTAMPTZ,
    signed_by_user_id       UUID REFERENCES users(id),

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID REFERENCES users(id),
    updated_by_user_id      UUID REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ion_journey ON intra_op_notes(patient_journey_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ion_tenant  ON intra_op_notes(tenant_id)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ion_status  ON intra_op_notes(notes_status)       WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE intra_op_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON intra_op_notes;
CREATE POLICY tenant_isolation ON intra_op_notes
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE intra_op_notes IS
    'Intra-operative surgery form: procedure details, implant info, team. '
    'status Draft→Signed→Locked. Accessible via Surgery Notes modal on OT page.';

COMMIT;
