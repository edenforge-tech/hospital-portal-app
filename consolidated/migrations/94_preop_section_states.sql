-- ============================================================
-- Migration 94: Pre-Op Section Extended States + Follow-Up Tasks
-- Adds urgency, rejection_reason columns to preop_section_clearance.
-- Widens the status CHECK constraint to include OnHold/Rejected/
-- NeedsInfo/Escalated workflow states.
-- Creates pre_op_follow_up_tasks for bypass accountability tracking.
-- ============================================================

-- ── 1. Add urgency column ─────────────────────────────────────────────────────

ALTER TABLE preop_section_clearance
    ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'Normal';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_preop_section_urgency'
          AND conrelid = 'preop_section_clearance'::regclass
    ) THEN
        ALTER TABLE preop_section_clearance
            ADD CONSTRAINT chk_preop_section_urgency
            CHECK (urgency IN ('Low','Normal','High','Urgent'));
    END IF;
END $$;

-- ── 2. Add rejection_reason column ───────────────────────────────────────────

ALTER TABLE preop_section_clearance
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ── 3. Widen status CHECK constraint ─────────────────────────────────────────
-- Drop old constraint and recreate with all valid states.

ALTER TABLE preop_section_clearance
    DROP CONSTRAINT IF EXISTS chk_preop_section_status;

ALTER TABLE preop_section_clearance
    ADD CONSTRAINT chk_preop_section_status
    CHECK (status IN (
        'NotRequested',
        'Requested',
        'RespondedClear',
        'RespondedConcerns',
        'WardConfirmed',
        'OnHold',
        'Rejected',
        'NeedsInfo',
        'Escalated'
    ));

-- ── 4. Refresh partial index to cover all active queue states ─────────────────

DROP INDEX IF EXISTS idx_preop_section_clearance_tenant_dept;

CREATE INDEX IF NOT EXISTS idx_preop_section_clearance_tenant_dept
    ON preop_section_clearance (tenant_id, responsible_department_code)
    WHERE deleted_at IS NULL
      AND status IN ('Requested','OnHold','NeedsInfo','Escalated');

-- ── 5. pre_op_follow_up_tasks — bypass accountability tracking ────────────────

CREATE TABLE IF NOT EXISTS pre_op_follow_up_tasks (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID        NOT NULL REFERENCES tenant(id),
    clearance_id         UUID        NOT NULL REFERENCES pre_op_clearance(id) ON DELETE CASCADE,
    patient_journey_id   UUID        NOT NULL REFERENCES patient_journey(id),

    section_category     TEXT        NOT NULL,
    item_key             TEXT        NOT NULL,
    item_label           TEXT        NOT NULL,
    bypass_reason        TEXT,

    -- Urgency / scheduling
    urgency              TEXT        NOT NULL DEFAULT 'Normal',
    due_by               TIMESTAMPTZ,

    -- Resolution
    task_status          TEXT        NOT NULL DEFAULT 'Pending'
                         CHECK (task_status IN ('Pending','InProgress','Completed','Cancelled')),
    completed_by_user_id UUID        REFERENCES users(id),
    completed_at         TIMESTAMPTZ,
    completion_notes     TEXT,

    -- Standard HIPAA audit
    created_by_user_id   UUID        REFERENCES users(id),
    updated_by_user_id   UUID        REFERENCES users(id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ,
    status               VARCHAR(20) NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','inactive','archived'))
);

CREATE INDEX IF NOT EXISTS idx_preop_followup_clearance
    ON pre_op_follow_up_tasks (clearance_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_preop_followup_tenant_pending
    ON pre_op_follow_up_tasks (tenant_id) WHERE deleted_at IS NULL AND task_status != 'Completed';

-- RLS tenant isolation
ALTER TABLE pre_op_follow_up_tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'pre_op_follow_up_tasks' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON pre_op_follow_up_tasks
            FOR ALL USING (
                tenant_id::text = current_setting('app.current_tenant_id', TRUE)
            );
    END IF;
END $$;

-- Auto-update updated_at trigger
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER trg_preop_followup_updated_at
            BEFORE UPDATE ON pre_op_follow_up_tasks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
