-- Migration 72: Add Escalation + Contact Tracking Columns to counseling_sessions
-- Purpose: Enable overdue detection (>7 days no contact), escalation workflow, and SLA monitoring
-- Required by: FollowupPatientCard overdue badge, TodaysCallbacksWidget, CounselorAnalyticsTab

BEGIN;

-- Add escalation and contact tracking columns to counseling_sessions
ALTER TABLE counseling_sessions
    ADD COLUMN IF NOT EXISTS escalation_status       VARCHAR(30)  NOT NULL DEFAULT 'Normal'
                                                     CHECK (escalation_status IN ('Normal','Overdue','Escalated','SupervisorAlert','Closed')),
    ADD COLUMN IF NOT EXISTS last_contact_date       DATE,        -- Updated every time a comm_log entry is created
    ADD COLUMN IF NOT EXISTS contact_attempt_count   INTEGER      NOT NULL DEFAULT 0,  -- Total outbound contact attempts
    ADD COLUMN IF NOT EXISTS last_contact_outcome    VARCHAR(60), -- Mirrors counselor_communication_log.outcome from last contact
    ADD COLUMN IF NOT EXISTS escalated_at            TIMESTAMPTZ, -- When status became 'Escalated'
    ADD COLUMN IF NOT EXISTS escalated_to_user_id    UUID,        -- Supervisor/manager who received the escalation
    ADD COLUMN IF NOT EXISTS escalation_notes        TEXT,        -- Reason for escalation
    ADD COLUMN IF NOT EXISTS overdue_since_date      DATE,        -- Date when last_contact_date fell >7 days from today
    ADD COLUMN IF NOT EXISTS sla_breach_at           TIMESTAMPTZ; -- When the session breached SLA (auto-set by backend)

-- Index: fast lookup of overdue sessions per branch
CREATE INDEX IF NOT EXISTS idx_cs_escalation_status
    ON counseling_sessions(escalation_status, last_contact_date)
    WHERE deleted_at IS NULL AND escalation_status IN ('Overdue','Escalated','SupervisorAlert');

-- Index: overdue + surgery-confirmed combined filter
CREATE INDEX IF NOT EXISTS idx_cs_last_contact
    ON counseling_sessions(last_contact_date)
    WHERE deleted_at IS NULL AND last_contact_date IS NOT NULL;

-- ============================================================
-- BACKFILL: Set last_contact_date from existing comm log entries
-- (safe no-op if counselor_communication_log is still empty)
-- ============================================================
UPDATE counseling_sessions cs
SET last_contact_date = (
    SELECT MAX(DATE(cl.communication_at))
    FROM counselor_communication_log cl
    WHERE cl.session_id = cs.id
      AND cl.deleted_at IS NULL
)
WHERE EXISTS (
    SELECT 1 FROM counselor_communication_log cl
    WHERE cl.session_id = cs.id AND cl.deleted_at IS NULL
);

-- ============================================================
-- BACKFILL: Update contact_attempt_count from existing comm log
-- ============================================================
UPDATE counseling_sessions cs
SET contact_attempt_count = (
    SELECT COUNT(*)
    FROM counselor_communication_log cl
    WHERE cl.session_id = cs.id
      AND cl.direction = 'Outbound'
      AND cl.deleted_at IS NULL
)
WHERE EXISTS (
    SELECT 1 FROM counselor_communication_log cl
    WHERE cl.session_id = cs.id AND cl.deleted_at IS NULL
);

-- ============================================================
-- BACKFILL: Mark sessions as Overdue if last_contact_date > 7 days
-- (Only affects sessions that were in SurgeryFollowup / SurgeryDecision stages)
-- ============================================================
UPDATE counseling_sessions
SET escalation_status  = 'Overdue',
    overdue_since_date = CURRENT_DATE
WHERE deleted_at IS NULL
  AND escalation_status = 'Normal'
  AND last_contact_date IS NOT NULL
  AND CURRENT_DATE - last_contact_date > 7
  AND session_stage IN ('SurgeryFollowup', 'ImmediateFU', 'PendingDecision');

COMMIT;
