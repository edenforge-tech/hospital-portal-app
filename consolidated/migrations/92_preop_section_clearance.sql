-- ============================================================
-- Migration 92: Pre-Op Section Clearance Table
-- Multi-department coordination for pre-op workflow.
-- Each row represents one department section's clearance status
-- for a given pre_op_clearance record.
-- ============================================================

CREATE TABLE IF NOT EXISTS preop_section_clearance (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                 UUID        NOT NULL,
    clearance_id              UUID        NOT NULL REFERENCES pre_op_clearance(id) ON DELETE CASCADE,

    section_category          TEXT        NOT NULL,   -- e.g. Consents, Investigations, Billing, Anaesthesia, NursingNotes, Surgeon
    responsible_department_code TEXT      NOT NULL,   -- STD_COUNSELOR, STD_LABORATORY, STD_BILLING, STD_DOCTOR, STD_NURSE, STD_ADMIN

    status                    TEXT        NOT NULL DEFAULT 'NotRequested',
    -- NotRequested | Requested | RespondedClear | RespondedConcerns | WardConfirmed

    requested_by_user_id      UUID,
    requested_at              TIMESTAMPTZ,

    responded_by_user_id      UUID,
    responded_at              TIMESTAMPTZ,
    response_notes            TEXT,
    is_external_responder     BOOLEAN     NOT NULL DEFAULT FALSE,
    external_responder_name   TEXT,
    external_responder_contact TEXT,

    confirmed_by_user_id      UUID,
    confirmed_at              TIMESTAMPTZ,
    confirmation_notes        TEXT,

    -- Standard audit columns (HIPAA)
    created_by_user_id        UUID,
    updated_by_user_id        UUID,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                TIMESTAMPTZ,
    active_status             TEXT        NOT NULL DEFAULT 'active',

    CONSTRAINT chk_preop_section_status CHECK (
        status IN ('NotRequested','Requested','RespondedClear','RespondedConcerns','WardConfirmed')
    ),
    UNIQUE (clearance_id, section_category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_preop_section_clearance_clearance
    ON preop_section_clearance (clearance_id);

CREATE INDEX IF NOT EXISTS idx_preop_section_clearance_tenant_dept
    ON preop_section_clearance (tenant_id, responsible_department_code)
    WHERE deleted_at IS NULL AND status = 'Requested';

-- RLS tenant isolation
ALTER TABLE preop_section_clearance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'preop_section_clearance' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON preop_section_clearance
            FOR ALL USING (
                tenant_id::text = current_setting('app.current_tenant_id', TRUE)
            );
    END IF;
END $$;

-- Auto-update updated_at trigger (reuse existing function if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER trg_preop_section_clearance_updated_at
            BEFORE UPDATE ON preop_section_clearance
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================
-- Add responsible_department_code to pre-op section item catalogue
-- Seeds category-to-department mapping for the 7 standard sections
-- ============================================================
ALTER TABLE pre_op_section_items
    ADD COLUMN IF NOT EXISTS responsible_department_code TEXT;

-- Seed category → department mapping
-- Anaesthesia maps to STD_DOCTOR (internal doctors + visiting consultants)
UPDATE pre_op_section_items SET responsible_department_code = 'STD_COUNSELOR'
    WHERE LOWER(category) IN ('consent', 'consents');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_LABORATORY'
    WHERE LOWER(category) IN ('investigations', 'investigation', 'lab', 'laboratory');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_BILLING'
    WHERE LOWER(category) IN ('financial', 'billing', 'insurance');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_DOCTOR'
    WHERE LOWER(category) IN ('evaluation', 'anaesthesia', 'anesthesia', 'surgeon', 'doctor');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_NURSE'
    WHERE LOWER(category) IN ('compliance', 'vitals', 'nursing', 'nursingnotes');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_ADMIN'
    WHERE LOWER(category) IN ('documents', 'document', 'admin');
