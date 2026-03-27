-- Migration 70: Counselor Callback Requests Table
-- Purpose: Scheduled callbacks/follow-up calls for the counselor team
-- Replaces the generic followups table usage; gives callbacks their own lifecycle + SLA tracking
-- Used by TodaysCallbacksWidget, CallbackSchedulerModal, and overdue detection

BEGIN;

-- ============================================================
-- TABLE: counselor_callback_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS counselor_callback_requests (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID            NOT NULL,
    session_id              UUID            NOT NULL,   -- FK → counseling_sessions.id
    patient_id              UUID            NOT NULL,   -- FK → patients.id (denormalized)
    branch_id               UUID            NOT NULL,   -- FK → branches.id  (for branch-level filtering)
    assigned_to_user_id     UUID            NOT NULL,   -- FK → users.id (counselor assigned)

    -- Callback details
    callback_type           VARCHAR(30)     NOT NULL DEFAULT 'General'
                                            CHECK (callback_type IN (
                                                'PreSurgery',
                                                'PostSurgery',
                                                'General',
                                                'Financial',
                                                'FearAnxiety',
                                                'DelayReason',
                                                'InsuranceFollowup',
                                                'DecisionPending'
                                            )),
    channel                 VARCHAR(30)     NOT NULL DEFAULT 'Phone'
                                            CHECK (channel IN ('Phone','WhatsApp','SMS','VideoCall')),
    callback_date           DATE            NOT NULL,
    callback_time           TIME,           -- Optional preferred time window
    callback_notes          TEXT,           -- Reason / context for the callback
    patient_preferred_time  VARCHAR(60),    -- e.g. "Morning (9-11 AM)", free-text patient preference

    -- Lifecycle status
    callback_status         VARCHAR(20)     NOT NULL DEFAULT 'Scheduled'
                                            CHECK (callback_status IN (
                                                'Scheduled',
                                                'Completed',
                                                'Missed',
                                                'Rescheduled',
                                                'Cancelled'
                                            )),

    -- Completion tracking
    completed_at            TIMESTAMPTZ,
    completed_by_user_id    UUID,           -- FK → users.id
    outcome_notes           TEXT,           -- What happened when the callback was made
    outcome                 VARCHAR(60)     CHECK (outcome IN (
                                                'Answered',
                                                'AnsweredInterested',
                                                'AnsweredNotInterested',
                                                'NoAnswer',
                                                'RescheduledByPatient',
                                                'Voicemail',
                                                'Cancelled'
                                            )),

    -- Rescheduling
    rescheduled_to_id       UUID,           -- FK → counselor_callback_requests.id (follow-on request)
    rescheduled_from_id     UUID,           -- FK → counselor_callback_requests.id (original request)

    -- Reminder tracking
    reminder_sent_at        TIMESTAMPTZ,    -- When the counselor was reminded (SMS/notification)
    patient_reminder_sent_at TIMESTAMPTZ,  -- When the patient was notified of the upcoming call

    -- Priority
    priority                SMALLINT        NOT NULL DEFAULT 2
                                            CHECK (priority BETWEEN 1 AND 5), -- 1=Urgent, 5=Low

    -- Standard audit columns (HIPAA)
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID            NOT NULL,
    updated_by_user_id      UUID            NOT NULL,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                            CHECK (status IN ('active','archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_callback_session_id
    ON counselor_callback_requests(session_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_callback_patient_id
    ON counselor_callback_requests(patient_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_callback_branch_date
    ON counselor_callback_requests(branch_id, callback_date)
    WHERE deleted_at IS NULL AND callback_status IN ('Scheduled','Missed');

CREATE INDEX IF NOT EXISTS idx_callback_assigned_user
    ON counselor_callback_requests(assigned_to_user_id, callback_date)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_callback_tenant
    ON counselor_callback_requests(tenant_id)
    WHERE deleted_at IS NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_counselor_callbacks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_counselor_callbacks_updated_at ON counselor_callback_requests;
CREATE TRIGGER trg_counselor_callbacks_updated_at
    BEFORE UPDATE ON counselor_callback_requests
    FOR EACH ROW EXECUTE FUNCTION update_counselor_callbacks_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) — Multi-tenant isolation
-- ============================================================
ALTER TABLE counselor_callback_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON counselor_callback_requests;
CREATE POLICY tenant_isolation ON counselor_callback_requests
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMIT;
