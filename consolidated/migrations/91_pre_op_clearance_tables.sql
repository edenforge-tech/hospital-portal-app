-- ============================================================================
-- Migration 91: Pre-Op Clearance Tables
-- Purpose: Structured pre-admission clearance workflow tables.
--          - pre_op_clearance: master record per patient_journey
--          - pre_op_section_items: reusable item catalog (seeded in migration 92)
--          - pre_op_completions: per-patient per-item completion tracking
--          - pre_op_documents: uploaded documents per item or clearance
--          Also adds optional context column to vital_sign for PreOp tagging.
-- Dependencies: patient_journey (81), vital_sign (via VitalSignService), tenant
-- Date: 2026-03
-- ============================================================================

BEGIN;

-- ── 1. pre_op_section_items (catalog — seeded in migration 92) ────────────────

CREATE TABLE IF NOT EXISTS pre_op_section_items (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID,           -- NULL = global default item (applies to all tenants)

    category                VARCHAR(50)     NOT NULL
                                CHECK (category IN (
                                    'Compliance','Investigations','Vitals','Consent',
                                    'Evaluation','Anaesthesia','Financial','Documents'
                                )),
    item_key                VARCHAR(100)    NOT NULL,   -- unique machine-readable key
    item_label              VARCHAR(200)    NOT NULL,
    description             TEXT,

    department_owner        VARCHAR(100),   -- Nursing|Optometry|Lab|Cardiology|Billing|Anaesthesia|Administration
    is_mandatory            BOOLEAN         NOT NULL DEFAULT TRUE,
    is_blocking             BOOLEAN         NOT NULL DEFAULT FALSE,   -- TRUE = "Admit Patient" stays disabled
    requires_document       BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Applicability filters (NULL = applies to all)
    patient_type_filter     VARCHAR(50),    -- Cash|Insurance|CGHS|ESI|Camp|Free|CoP|NULL=all
    surgery_type_filter     VARCHAR(100),   -- Cataract|LASIK|Retina|NULL=all

    display_order           INTEGER         NOT NULL DEFAULT 0,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,

    -- Audit
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived')),

    CONSTRAINT uq_preop_item_key UNIQUE (item_key)
);

CREATE INDEX IF NOT EXISTS idx_preop_items_category ON pre_op_section_items(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_items_tenant   ON pre_op_section_items(tenant_id) WHERE deleted_at IS NULL;

-- ── 2. pre_op_clearance (one per patient_journey) ────────────────────────────

CREATE TABLE IF NOT EXISTS pre_op_clearance (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID            NOT NULL REFERENCES patient_journey(id) ON DELETE CASCADE,

    overall_status          VARCHAR(30)     NOT NULL DEFAULT 'NotStarted'
                                CHECK (overall_status IN (
                                    'NotStarted','InProgress','Completed','Approved','Rejected','Deferred'
                                )),
    overall_clearance       BOOLEAN         NOT NULL DEFAULT FALSE,
    clearance_by_user_id    UUID            REFERENCES users(id),
    clearance_at            TIMESTAMPTZ,

    -- Deferral tracking
    is_deferred             BOOLEAN         NOT NULL DEFAULT FALSE,
    deferred_reason         TEXT,
    deferred_by_user_id     UUID            REFERENCES users(id),
    deferred_at             TIMESTAMPTZ,

    -- Financial context (copied from journey at start for item filtering)
    payment_mode_snapshot   VARCHAR(50),    -- Cash|Insurance|CGHS|ESI|Camp|Free|CoP

    -- Insurance pre-auth link
    insurance_preauth_id    UUID,           -- soft ref to insurance_preauth_requests

    -- Audit
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID            REFERENCES users(id),
    updated_by_user_id      UUID            REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived')),

    -- One clearance record per journey
    CONSTRAINT uq_preop_clearance_journey UNIQUE (patient_journey_id)
);

CREATE INDEX IF NOT EXISTS idx_preop_clearance_tenant  ON pre_op_clearance(tenant_id)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_clearance_journey ON pre_op_clearance(patient_journey_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_clearance_status  ON pre_op_clearance(overall_status)     WHERE deleted_at IS NULL;

ALTER TABLE pre_op_clearance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON pre_op_clearance;
CREATE POLICY tenant_isolation ON pre_op_clearance
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ── 3. pre_op_completions (per-patient per-item completion tracking) ──────────

CREATE TABLE IF NOT EXISTS pre_op_completions (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL REFERENCES tenant(id),
    clearance_id            UUID            NOT NULL REFERENCES pre_op_clearance(id) ON DELETE CASCADE,
    item_id                 UUID            NOT NULL REFERENCES pre_op_section_items(id),

    is_completed            BOOLEAN         NOT NULL DEFAULT FALSE,
    value                   VARCHAR(500),   -- Yes/No/text/numeric response

    completed_by_user_id    UUID            REFERENCES users(id),
    completed_at            TIMESTAMPTZ,
    department_completed    VARCHAR(100),

    notes                   TEXT,

    -- Override / bypass
    is_bypassed             BOOLEAN         NOT NULL DEFAULT FALSE,
    bypass_reason           TEXT,
    bypassed_by_user_id     UUID            REFERENCES users(id),
    bypassed_at             TIMESTAMPTZ,

    -- Audit
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID            REFERENCES users(id),
    updated_by_user_id      UUID            REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived')),

    CONSTRAINT uq_preop_completion UNIQUE (clearance_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_preop_completions_clearance ON pre_op_completions(clearance_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_completions_tenant    ON pre_op_completions(tenant_id)    WHERE deleted_at IS NULL;

ALTER TABLE pre_op_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON pre_op_completions;
CREATE POLICY tenant_isolation ON pre_op_completions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ── 4. pre_op_documents (uploaded files per completion or clearance) ──────────

CREATE TABLE IF NOT EXISTS pre_op_documents (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL REFERENCES tenant(id),
    clearance_id            UUID            NOT NULL REFERENCES pre_op_clearance(id) ON DELETE CASCADE,
    completion_id           UUID            REFERENCES pre_op_completions(id) ON DELETE SET NULL,  -- nullable

    file_name               VARCHAR(200)    NOT NULL,
    file_url                VARCHAR(1000)   NOT NULL,  -- Azure Blob URL
    file_type               VARCHAR(50),               -- image/png, application/pdf, etc.
    file_size_bytes         BIGINT,

    document_type           VARCHAR(100)    NOT NULL DEFAULT 'Other'
                                CHECK (document_type IN (
                                    'ConsentForm','LabReport','ImagingReport',
                                    'InsuranceDoc','GovernmentApproval',
                                    'FitnessCertificate','IdentityProof','Other'
                                )),

    uploaded_by_user_id     UUID            REFERENCES users(id),
    uploaded_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    is_verified             BOOLEAN         NOT NULL DEFAULT FALSE,
    verified_by_user_id     UUID            REFERENCES users(id),
    verified_at             TIMESTAMPTZ,

    -- Audit
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID            REFERENCES users(id),
    updated_by_user_id      UUID            REFERENCES users(id),
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','inactive','archived'))
);

CREATE INDEX IF NOT EXISTS idx_preop_docs_clearance   ON pre_op_documents(clearance_id)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_docs_completion  ON pre_op_documents(completion_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_docs_tenant      ON pre_op_documents(tenant_id)     WHERE deleted_at IS NULL;

ALTER TABLE pre_op_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON pre_op_documents;
CREATE POLICY tenant_isolation ON pre_op_documents
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ── 5. Add context column to vital_sign for PreOp tagging ────────────────────

ALTER TABLE vital_sign
    ADD COLUMN IF NOT EXISTS context VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN vital_sign.context IS
    'Optional context tag: PreOp | PostOp | Routine | NULL. '
    'PreOp vitals recorded during pre-admission clearance are tagged PreOp.';

CREATE INDEX IF NOT EXISTS idx_vital_sign_context ON vital_sign(context) WHERE context IS NOT NULL AND deleted_at IS NULL;

-- ── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE pre_op_section_items IS
    'Catalog of pre-admission checklist items. Global defaults (tenant_id=NULL) seeded in migration 92. '
    'Tenant-specific items can override or extend. Filtered by patient_type_filter and surgery_type_filter at runtime.';

COMMENT ON TABLE pre_op_clearance IS
    'Master pre-op clearance record per patient journey. Created when Pre-Op workflow starts from Ward page. '
    'overall_clearance=TRUE + overall_status=Approved gates the admission to Admitted state.';

COMMENT ON TABLE pre_op_completions IS
    'Per-patient completion status for each applicable pre_op_section_item. '
    'Seeded (all incomplete) when pre_op_clearance is created. Updated as staff fill in data.';

COMMENT ON TABLE pre_op_documents IS
    'Uploaded files (Azure Blob Storage URLs) for pre-op consent forms, lab reports, '
    'imaging reports, insurance documents, government approvals, fitness certificates, etc.';

COMMIT;
