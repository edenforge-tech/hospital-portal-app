-- ============================================================================
-- Migration 84: Post-Op Checklists & Instructions
-- Purpose: Nurse checklist, surgeon checklist, and post-op instruction tables.
--          All 4 post-op items must be complete before discharge is allowed.
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Nurse checklist template items (seeded in migration 88)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nurse_checklist_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenant(id),
    item_label  VARCHAR(200) NOT NULL,
    item_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_nci_tenant ON nurse_checklist_items(tenant_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Nurse checklist responses (per journey × per item)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nurse_checklist_responses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id),
    checklist_item_id       UUID NOT NULL REFERENCES nurse_checklist_items(id),
    is_completed            BOOLEAN NOT NULL DEFAULT FALSE,
    notes                   TEXT,
    completed_by_user_id    UUID REFERENCES users(id),
    completed_at            TIMESTAMPTZ,

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ,

    UNIQUE (patient_journey_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_ncr_journey ON nurse_checklist_responses(patient_journey_id);
CREATE INDEX IF NOT EXISTS idx_ncr_tenant  ON nurse_checklist_responses(tenant_id);

ALTER TABLE nurse_checklist_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON nurse_checklist_responses;
CREATE POLICY tenant_isolation ON nurse_checklist_responses
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Surgeon checklist template items (seeded in migration 88)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surgeon_checklist_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenant(id),
    item_label  VARCHAR(200) NOT NULL,
    item_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_sci_tenant ON surgeon_checklist_items(tenant_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Surgeon checklist responses
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surgeon_checklist_responses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id),
    checklist_item_id       UUID NOT NULL REFERENCES surgeon_checklist_items(id),
    is_completed            BOOLEAN NOT NULL DEFAULT FALSE,
    notes                   TEXT,
    completed_by_user_id    UUID REFERENCES users(id),
    completed_at            TIMESTAMPTZ,

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ,

    UNIQUE (patient_journey_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_scr_journey ON surgeon_checklist_responses(patient_journey_id);
CREATE INDEX IF NOT EXISTS idx_scr_tenant  ON surgeon_checklist_responses(tenant_id);

ALTER TABLE surgeon_checklist_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON surgeon_checklist_responses;
CREATE POLICY tenant_isolation ON surgeon_checklist_responses
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Post-op instructions (per journey)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_op_instructions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id) UNIQUE,

    -- Medications as JSONB array: [{drug, dosage, frequency, duration, route}]
    medications             JSONB NOT NULL DEFAULT '[]'::jsonb,
    activity_restrictions   TEXT,
    dietary_instructions    TEXT,
    followup_date           DATE,
    followup_doctor_id      UUID REFERENCES users(id),
    eye_care_instructions   TEXT,
    -- Warning signs as JSONB array of strings
    warning_signs           JSONB NOT NULL DEFAULT '[]'::jsonb,

    is_saved                BOOLEAN NOT NULL DEFAULT FALSE,
    saved_at                TIMESTAMPTZ,
    saved_by_user_id        UUID REFERENCES users(id),

    -- Standard audit columns
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID REFERENCES users(id),
    updated_by_user_id      UUID REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived'))
);

CREATE INDEX IF NOT EXISTS idx_poi_journey ON post_op_instructions(patient_journey_id);
CREATE INDEX IF NOT EXISTS idx_poi_tenant  ON post_op_instructions(tenant_id);

ALTER TABLE post_op_instructions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON post_op_instructions;
CREATE POLICY tenant_isolation ON post_op_instructions
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE post_op_instructions IS
    'One row per patient journey. is_saved=true counts as the PostOpInstructions '
    'completion requirement for discharge gate.';

COMMIT;
