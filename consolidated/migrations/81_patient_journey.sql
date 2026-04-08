-- ============================================================================
-- Migration 81: Patient Journey Master State Table
-- Purpose: Central state tracker for every IP patient — created automatically
--          by the SQL trigger in migration 88 when ot_finalize_schedule.status
--          transitions to 'OTPrepared'.
-- Dependencies: ward (80), patients, ot_finalize_schedule, patient_admissions,
--               counseling_sessions tables
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS patient_journey (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL REFERENCES tenant(id),
    branch_id                   UUID NOT NULL REFERENCES branch(id),

    -- ── Handoff source ────────────────────────────────────────────────────
    patient_id                  UUID NOT NULL REFERENCES patient(id),
    uhid                        VARCHAR(50),   -- denormalized for fast display
    ot_finalize_schedule_id     UUID REFERENCES ot_finalize_schedule(id),
    counseling_session_id       UUID,          -- FK to counseling_sessions (soft ref)
    admission_id                UUID,          -- set on Admit action
    ward_id                     UUID REFERENCES ward(id),

    -- ── State machine (all with CHECK + DEFAULT) ──────────────────────────
    clinical_state              VARCHAR(30) NOT NULL DEFAULT 'Expected'
                                    CHECK (clinical_state IN (
                                        'Expected','Admitted','ReadyForSurgery',
                                        'SentToOT','InOT','SurgeryCompleted',
                                        'PostOpInProgress','ReadyForDischarge','Discharged'
                                    )),
    ot_state                    VARCHAR(30) NOT NULL DEFAULT 'NotSent'
                                    CHECK (ot_state IN (
                                        'NotSent','SentToOT','Accepted','InProgress','Completed'
                                    )),
    financial_state             VARCHAR(30) NOT NULL DEFAULT 'NotCreated'
                                    CHECK (financial_state IN (
                                        'NotCreated','Draft','Estimated','Confirmed',
                                        'PartiallyPaid','Paid','Settled'
                                    )),
    post_op_state               VARCHAR(30) NOT NULL DEFAULT 'NotStarted'
                                    CHECK (post_op_state IN (
                                        'NotStarted','InProgress','Completed'
                                    )),

    -- ── Surgery context (denormalized from ot_finalize_schedule at trigger) ─
    procedure_name              VARCHAR(300),
    eye_operated                VARCHAR(10) CHECK (eye_operated IN ('OD','OS','OU')),
    primary_surgeon_id          UUID REFERENCES users(id),
    anaesthesia_type            VARCHAR(100),
    surgery_scheduled_at        TIMESTAMPTZ,

    -- ── IOL fields (editable on OT inline form) ───────────────────────────
    iol_power                   VARCHAR(50),
    iol_issued_from_ip          BOOLEAN NOT NULL DEFAULT FALSE,
    iol_barcode_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    iol_barcode                 VARCHAR(100),

    -- ── Surgical team (filled via OT inline form) ─────────────────────────
    anaesthetist_name           VARCHAR(200),
    operation_theatre_name      VARCHAR(100),
    assistant_name              VARCHAR(200),

    -- ── Ward / admission fields (set on Admit) ────────────────────────────
    admission_type              VARCHAR(20)
                                    CHECK (admission_type IN ('DayCare','IPD','Emergency')),
    admitting_doctor_id         UUID REFERENCES users(id),
    primary_nurse_id            UUID REFERENCES users(id),
    bed_number                  VARCHAR(50),
    room_number                 VARCHAR(50),
    attendant_name              VARCHAR(200),
    attendant_phone             VARCHAR(20),
    attendant_relationship      VARCHAR(50),
    admitted_at                 TIMESTAMPTZ,

    -- ── Timestamps ────────────────────────────────────────────────────────
    surgery_started_at          TIMESTAMPTZ,
    surgery_ended_at            TIMESTAMPTZ,
    discharged_at               TIMESTAMPTZ,

    -- ── Control flags ─────────────────────────────────────────────────────
    is_locked                   BOOLEAN NOT NULL DEFAULT FALSE,  -- L4: post-discharge
    is_billing_locked           BOOLEAN NOT NULL DEFAULT FALSE,  -- L3: surgery InProgress
    is_clinical_locked          BOOLEAN NOT NULL DEFAULT FALSE,
    is_discharged               BOOLEAN NOT NULL DEFAULT FALSE,

    -- ── Financial override / clearance flags ──────────────────────────────
    emergency_fc_applied        BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_fc_reason         TEXT,
    emergency_fc_approved_by    UUID REFERENCES users(id),
    emergency_fc_approved_at    TIMESTAMPTZ,
    government_approval_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    insurance_preauth_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    is_camp_patient             BOOLEAN NOT NULL DEFAULT FALSE,
    discharge_override_applied  BOOLEAN NOT NULL DEFAULT FALSE,
    discharge_override_reason   TEXT,
    discharge_override_by       UUID REFERENCES users(id),

    -- ── Financial snapshot (read-only from counseling_session) ────────────
    package_amount              DECIMAL(12,2),   -- copied at trigger time
    total_advances              DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_paid                  DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_due                 DECIMAL(12,2) GENERATED ALWAYS AS
                                    (COALESCE(package_amount, 0) - total_paid) STORED,

    -- ── Standard audit columns ────────────────────────────────────────────
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id          UUID REFERENCES users(id),
    updated_by_user_id          UUID REFERENCES users(id),
    deleted_at                  TIMESTAMPTZ,
    status                      VARCHAR(20) NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active','inactive','archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pj_tenant         ON patient_journey(tenant_id)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pj_patient        ON patient_journey(patient_id)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pj_clinical_state ON patient_journey(clinical_state)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pj_ot_state       ON patient_journey(ot_state)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pj_financial      ON patient_journey(financial_state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pj_ot_finalize    ON patient_journey(ot_finalize_schedule_id);
CREATE INDEX IF NOT EXISTS idx_pj_surgery_date   ON patient_journey(surgery_scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pj_uhid           ON patient_journey(uhid)            WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE patient_journey ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON patient_journey;
CREATE POLICY tenant_isolation ON patient_journey
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE patient_journey IS
    'Master state table for every IP patient episode. Created automatically by SQL trigger '
    'when ot_finalize_schedule.status transitions to OTPrepared. Drives the full Ward→OT→PostOp→Discharge workflow.';

COMMIT;
