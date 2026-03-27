-- Migration 69: Counselor Communication Log Table
-- Purpose: Dedicated table for counselor→patient communication events (calls, SMS, email, in-person)
-- Replaces the generic notes-with-noteType='communication' workaround in counseling_session_notes
-- HIPAA: Full audit trail with soft delete; outcome + channel tracked for follow-up SLA compliance

BEGIN;

-- ============================================================
-- TABLE: counselor_communication_log
-- ============================================================
CREATE TABLE IF NOT EXISTS counselor_communication_log (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL,
    session_id              UUID            NOT NULL,   -- FK → counseling_sessions.id
    patient_id              UUID            NOT NULL,   -- FK → patients.id (denormalized for fast queries)
    counselor_id            UUID            NOT NULL,   -- FK → users.id (the counselor who made the contact)

    -- Communication metadata
    channel                 VARCHAR(30)     NOT NULL DEFAULT 'Phone'
                                            CHECK (channel IN ('Phone','SMS','WhatsApp','Email','InPerson','VideoCall')),
    direction               VARCHAR(10)     NOT NULL DEFAULT 'Outbound'
                                            CHECK (direction IN ('Outbound','Inbound')),
    communication_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Outcome
    outcome                 VARCHAR(60)     NOT NULL DEFAULT 'Answered'
                                            CHECK (outcome IN (
                                                'Answered',
                                                'AnsweredInterested',
                                                'AnsweredNotInterested',
                                                'AnsweredCallbackNeeded',
                                                'NoAnswer',
                                                'Voicemail',
                                                'Busy',
                                                'WrongNumber',
                                                'DeclinedContact',
                                                'MessageSent'
                                            )),
    call_duration_minutes   INTEGER,        -- NULL for non-phone channels
    message_body            TEXT,           -- SMS/Email body; or notes for phone calls
    response_summary        TEXT,           -- What the patient said / key points from conversation

    -- Next action tracking
    next_action             VARCHAR(60)     CHECK (next_action IN (
                                                'ScheduleCallback',
                                                'SendDocuments',
                                                'EscalateToManager',
                                                'WaitForPatient',
                                                'BookSurgery',
                                                'NoFurtherAction'
                                            )),
    next_action_date        DATE,           -- When to perform next_action

    -- Template reference (optional)
    template_id             UUID,           -- FK → communication_message_templates.id

    -- Standard audit columns (HIPAA)
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID            NOT NULL,
    updated_by_user_id      UUID            NOT NULL,
    deleted_at              TIMESTAMPTZ,    -- Soft delete (HIPAA: never hard delete)
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                            CHECK (status IN ('active','archived'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_counselor_comm_log_session_id
    ON counselor_communication_log(session_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_counselor_comm_log_patient_id
    ON counselor_communication_log(patient_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_counselor_comm_log_counselor_id
    ON counselor_communication_log(counselor_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_counselor_comm_log_tenant_id
    ON counselor_communication_log(tenant_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_counselor_comm_log_comm_at
    ON counselor_communication_log(communication_at DESC)
    WHERE deleted_at IS NULL;

-- Updated_at trigger (re-use or create a simple one)
CREATE OR REPLACE FUNCTION update_counselor_comm_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_counselor_comm_log_updated_at ON counselor_communication_log;
CREATE TRIGGER trg_counselor_comm_log_updated_at
    BEFORE UPDATE ON counselor_communication_log
    FOR EACH ROW EXECUTE FUNCTION update_counselor_comm_log_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) — Multi-tenant isolation
-- ============================================================
ALTER TABLE counselor_communication_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON counselor_communication_log;
CREATE POLICY tenant_isolation ON counselor_communication_log
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMIT;
