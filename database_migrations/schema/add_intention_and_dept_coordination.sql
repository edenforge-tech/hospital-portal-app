-- ============================================================================
-- Migration: Patient Intention, Anesthesia Choice + Dept Coordination Requests
-- Date: 2026-03-16
-- ============================================================================

-- Step 1: Add intention / anesthesia columns to counseling_sessions
ALTER TABLE counseling_sessions
    ADD COLUMN IF NOT EXISTS patient_intention VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS surgery_timeline VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS anesthesia_type_choice VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS anesthesia_consent BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN counseling_sessions.patient_intention IS
  'Values: WillingWeek, WillingMonth, WillingQuarter, WillingCallToConfirm, Undecided, WaitingFinancial, WaitingFear, Declined, ReferredElsewhere';
COMMENT ON COLUMN counseling_sessions.anesthesia_type_choice IS
  'Values: GA, Topical, Local';

-- Step 2: Create dept_coordination_requests table
CREATE TABLE IF NOT EXISTS dept_coordination_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    branch_id           UUID,
    session_id          UUID REFERENCES counseling_sessions(id),
    schedule_id         UUID,  -- FK to ot_schedules (nullable)
    patient_id          UUID NOT NULL,
    department          VARCHAR(50) NOT NULL
                            CHECK (department IN ('Admissions','Billing','Lab','Surgeon','Anesthesia')),
    request_status      VARCHAR(20) NOT NULL DEFAULT 'Pending'
                            CHECK (request_status IN ('Pending','Sent','InProgress','Completed','Rejected','Cancelled')),
    request_message     TEXT,
    response_message    TEXT,
    response_data       JSONB,
    requested_by        UUID,  -- FK to users (counselor)
    responded_by        UUID,  -- FK to users (dept staff)
    requested_at        TIMESTAMPTZ,
    responded_at        TIMESTAMPTZ,
    status              VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dept_coord_tenant ON dept_coordination_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dept_coord_session ON dept_coordination_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_dept_coord_schedule ON dept_coordination_requests(schedule_id);
CREATE INDEX IF NOT EXISTS idx_dept_coord_patient ON dept_coordination_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_dept_coord_dept_status ON dept_coordination_requests(department, request_status);

-- Row-Level Security
ALTER TABLE dept_coordination_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dept_coordination_requests' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON dept_coordination_requests
            FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
    END IF;
END $$;

-- Updated-at trigger (reuse existing function if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON dept_coordination_requests
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
