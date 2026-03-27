-- ============================================================================
-- Migration 67: Insurance Pre-Authorization Request Table
-- Purpose: Full pre-auth workflow for Insurance/CoPay/CGHS/ESH/SGHS/Railway patients.
--          Applied → UnderReview → Approved/Rejected/PendingDocs/Expired
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS insurance_preauth_requests (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,

    -- Links
    session_id              UUID            NOT NULL REFERENCES counseling_sessions(id) ON DELETE RESTRICT,
    schedule_id             UUID            REFERENCES ot_booking_schedule(id) ON DELETE SET NULL,
    patient_id              UUID            REFERENCES patients(id) ON DELETE SET NULL,

    -- Insurance details
    insurance_provider      VARCHAR(200)    NOT NULL,
    tpa_name                VARCHAR(200),                   -- Third-party administrator
    policy_number           VARCHAR(100)    NOT NULL,
    member_id               VARCHAR(100),
    group_number            VARCHAR(100),

    -- Pre-auth identifiers
    preauth_request_number  VARCHAR(100),                   -- Internal reference
    insurer_reference_number VARCHAR(100),                  -- TPA/insurer-assigned ref

    -- Proposed surgery details (snapshot at time of request)
    proposed_surgery_name   VARCHAR(200),
    proposed_icd_code       VARCHAR(20),
    proposed_cpt_codes      JSONB,                          -- array of CPT/procedure codes
    estimated_cost          DECIMAL(12,2),
    requested_amount        DECIMAL(12,2),

    -- Status lifecycle
    preauth_status          VARCHAR(30)     NOT NULL DEFAULT 'Draft',
    applied_at              TIMESTAMPTZ,
    last_status_change_at   TIMESTAMPTZ,
    responded_at            TIMESTAMPTZ,
    expiry_date             DATE,                           -- Approved auth expires on this date

    -- Outcome
    approved_amount         DECIMAL(12,2),
    approved_procedures     JSONB,                          -- array of approved procedure names
    rejection_reason        TEXT,
    rejection_code          VARCHAR(50),
    pending_docs_list       JSONB,                          -- list of missing documents requested by insurer

    -- Documents
    documents_submitted     JSONB DEFAULT '[]'::jsonb,      -- [{name, url, uploadedAt}]

    -- Communication
    insurer_contact_name    VARCHAR(200),
    insurer_contact_phone   VARCHAR(20),
    insurer_contact_email   VARCHAR(200),
    notes                   TEXT,

    -- Audit
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active',

    CONSTRAINT insurance_preauth_status_check CHECK (
        preauth_status IN (
            'Draft', 'Applied', 'UnderReview', 'PendingDocs',
            'Approved', 'Rejected', 'Expired', 'Cancelled'
        )
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ipr_tenant ON insurance_preauth_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ipr_session ON insurance_preauth_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_ipr_schedule ON insurance_preauth_requests(schedule_id) WHERE schedule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ipr_status ON insurance_preauth_requests(tenant_id, preauth_status);
CREATE INDEX IF NOT EXISTS idx_ipr_patient ON insurance_preauth_requests(patient_id) WHERE patient_id IS NOT NULL;

-- Status change history table for audit trail
CREATE TABLE IF NOT EXISTS insurance_preauth_status_history (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL,
    preauth_id          UUID            NOT NULL REFERENCES insurance_preauth_requests(id) ON DELETE CASCADE,
    from_status         VARCHAR(30),
    to_status           VARCHAR(30)     NOT NULL,
    changed_by_user_id  UUID,
    change_reason       TEXT,
    changed_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ipsh_preauth ON insurance_preauth_status_history(preauth_id);

-- RLS
ALTER TABLE insurance_preauth_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON insurance_preauth_requests;
CREATE POLICY tenant_isolation ON insurance_preauth_requests
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

ALTER TABLE insurance_preauth_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON insurance_preauth_status_history;
CREATE POLICY tenant_isolation ON insurance_preauth_status_history
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMIT;
