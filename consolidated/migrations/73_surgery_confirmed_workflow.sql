-- ============================================================================
-- Migration 73: Surgery Confirmed Workflow — Schema Fixes & Expansion
-- Fixes:
--   B4  Fix FK ot_booking_schedule → ot_schedules in both migration-66 tables
--   B6  Expand dept_coordination_requests.department CHECK to 9 depts
--   B7  Add InitialApproved / FinalApproved statuses to insurance_preauth_requests
--   B8  Add surgical / ga_anaesthesia consent types to patient_consents
-- New:
--   §1  Add workflow_step columns to pre_admission_checklist_items
--   §2  Add extra columns to dept_coordination_requests (request_type, auto_created, priority)
--   §3  Add schedule-level pre-auth & discharge tracking columns to insurance_preauth_requests
--   §4  Add patient_upload_links table for pre-op document upload links
-- Date: 2026-06
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- B4 — Fix broken FK in ot_admission_checklist_completions
--      Migration 66 referenced ot_booking_schedule which does not exist;
--      the real table is ot_schedules.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Drop the bad FK if it still exists (idempotent)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'ot_admission_checklist_completions_schedule_id_fkey'
          AND table_name = 'ot_admission_checklist_completions'
    ) THEN
        ALTER TABLE ot_admission_checklist_completions
            DROP CONSTRAINT ot_admission_checklist_completions_schedule_id_fkey;
    END IF;

    -- Apply correct FK
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'ot_acc_schedule_id_fkey'
          AND table_name = 'ot_admission_checklist_completions'
    ) THEN
        ALTER TABLE ot_admission_checklist_completions
            ADD CONSTRAINT ot_acc_schedule_id_fkey
            FOREIGN KEY (schedule_id) REFERENCES ot_schedules(id) ON DELETE CASCADE;
    END IF;

    -- Also fix insurance_preauth_requests FK if still pointing at wrong table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'insurance_preauth_requests_schedule_id_fkey'
          AND table_name = 'insurance_preauth_requests'
    ) THEN
        -- Check what the FK points at
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.referential_constraints rc
            JOIN information_schema.table_constraints tc
                ON rc.unique_constraint_name = tc.constraint_name
            WHERE rc.constraint_name = 'insurance_preauth_requests_schedule_id_fkey'
              AND tc.table_name = 'ot_schedules'
        ) THEN
            ALTER TABLE insurance_preauth_requests
                DROP CONSTRAINT insurance_preauth_requests_schedule_id_fkey;
            ALTER TABLE insurance_preauth_requests
                ADD CONSTRAINT ipr_schedule_id_fkey
                FOREIGN KEY (schedule_id) REFERENCES ot_schedules(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- §1 — Add workflow_step columns to pre_admission_checklist_items
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE pre_admission_checklist_items
    ADD COLUMN IF NOT EXISTS workflow_step             INTEGER CHECK (workflow_step BETWEEN 1 AND 6),
    ADD COLUMN IF NOT EXISTS step_title                VARCHAR(120),
    ADD COLUMN IF NOT EXISTS step_widget_component     VARCHAR(100),   -- e.g. Step1PreOpInstructions
    ADD COLUMN IF NOT EXISTS requires_dept_notification BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS notification_department   VARCHAR(50);    -- dept to notify when this step completes

COMMENT ON COLUMN pre_admission_checklist_items.workflow_step IS
    '1=PreOpInstructions 2=ImagingScans 3=PaymentInsurance 4=Anaesthesia 5=OTBedStock 6=SurgeonConfirmation';

-- ─────────────────────────────────────────────────────────────────────────────
-- B6 — Expand dept_coordination_requests.department CHECK to 9 departments
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE dept_coordination_requests
    DROP CONSTRAINT IF EXISTS dept_coordination_requests_department_check;

ALTER TABLE dept_coordination_requests
    ADD CONSTRAINT dept_coordination_requests_department_check
    CHECK (department IN (
        'Admissions','Billing','Lab','Surgeon','Anesthesia',
        'OT','Pharmacy','Radiology','Nursing'
    ));

-- §2 — Add extra tracking columns to dept_coordination_requests
ALTER TABLE dept_coordination_requests
    ADD COLUMN IF NOT EXISTS request_type       VARCHAR(50) DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS auto_created       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS priority           VARCHAR(20) NOT NULL DEFAULT 'normal'
                                                    CHECK (priority IN ('normal','urgent','critical')),
    ADD COLUMN IF NOT EXISTS external_ref       VARCHAR(100),       -- e.g. bed number, OT slot confirmed
    ADD COLUMN IF NOT EXISTS confirmed_at       TIMESTAMPTZ,        -- when dept confirmed externally
    ADD COLUMN IF NOT EXISTS confirmed_by       UUID,               -- user who marked external confirmation
    ADD COLUMN IF NOT EXISTS workflow_step      INTEGER;            -- which pre-admission step this maps to

-- ─────────────────────────────────────────────────────────────────────────────
-- B7 — Add InitialApproved / FinalApproved to insurance_preauth_requests
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE insurance_preauth_requests
    DROP CONSTRAINT IF EXISTS insurance_preauth_status_check;

ALTER TABLE insurance_preauth_requests
    ADD CONSTRAINT insurance_preauth_status_check CHECK (
        preauth_status IN (
            'Draft', 'Applied', 'UnderReview', 'PendingDocs',
            'InitialApproved', 'Approved', 'FinalApproved',
            'Rejected', 'Expired', 'Cancelled'
        )
    );

-- Add schedule-level tracking columns
ALTER TABLE insurance_preauth_requests
    ADD COLUMN IF NOT EXISTS initial_approval_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS initial_approved_amount    DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS initial_approved_by        UUID,
    ADD COLUMN IF NOT EXISTS final_approval_at          TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS final_approved_amount      DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS final_approved_by          UUID,
    ADD COLUMN IF NOT EXISTS discharge_hold             BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS schedule_override          BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS override_reason            TEXT,
    ADD COLUMN IF NOT EXISTS override_by                UUID;

-- ─────────────────────────────────────────────────────────────────────────────
-- B8 — Add surgical + ga_anaesthesia to patient_consents.consent_type
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Drop old CHECK so we can expand it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'patient_consents'
          AND constraint_type = 'CHECK'
          AND constraint_name LIKE '%consent_type%'
    ) THEN
        ALTER TABLE patient_consents
            DROP CONSTRAINT IF EXISTS patient_consents_consent_type_check;
    END IF;
END $$;

-- Add the expanded constraint (covers pre-existing types + surgical/ga)
ALTER TABLE patient_consents
    ADD CONSTRAINT patient_consents_consent_type_check
    CHECK (consent_type IN (
        'general','procedure','anesthesia','photography','data_sharing',
        'telemedicine','research','surgical','ga_anaesthesia','topical_anaesthesia'
    ));

-- Add surgery_schedule_id link so consent can be tied to a specific OT booking
ALTER TABLE patient_consents
    ADD COLUMN IF NOT EXISTS surgery_schedule_id    UUID REFERENCES ot_schedules(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS consent_version         VARCHAR(20),
    ADD COLUMN IF NOT EXISTS witnessed_by            UUID;

-- ─────────────────────────────────────────────────────────────────────────────
-- §4 — patient_upload_links: pre-op document upload link management
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_upload_links (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id           UUID,
    schedule_id         UUID            REFERENCES ot_schedules(id) ON DELETE CASCADE,
    session_id          UUID            REFERENCES counseling_sessions(id) ON DELETE SET NULL,
    patient_id          UUID            NOT NULL,

    -- Link details
    link_token          VARCHAR(200)    NOT NULL UNIQUE,     -- random token in URL
    link_url            TEXT            NOT NULL,            -- full shareable URL
    purpose             VARCHAR(100)    NOT NULL DEFAULT 'pre_op_documents',
    description         TEXT,

    -- State
    expires_at          TIMESTAMPTZ     NOT NULL,
    used_at             TIMESTAMPTZ,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,

    -- Uploaded files
    uploaded_files      JSONB           NOT NULL DEFAULT '[]'::jsonb,  -- [{name, url, size, uploadedAt}]
    file_count          INTEGER         NOT NULL DEFAULT 0,

    -- Audit
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(20)     NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_pul_tenant     ON patient_upload_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pul_schedule   ON patient_upload_links(schedule_id) WHERE schedule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pul_token      ON patient_upload_links(link_token);
CREATE INDEX IF NOT EXISTS idx_pul_patient    ON patient_upload_links(patient_id);

ALTER TABLE patient_upload_links ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'patient_upload_links' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON patient_upload_links
            FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- §5 — ot_schedules: add pre-admission workflow status summary columns
--       (denormalised for fast dashboard queries)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE ot_schedules
    ADD COLUMN IF NOT EXISTS workflow_steps_completed   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS workflow_total_steps       INTEGER NOT NULL DEFAULT 6,
    ADD COLUMN IF NOT EXISTS workflow_on_hold           BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS workflow_hold_reason       TEXT,
    ADD COLUMN IF NOT EXISTS workflow_last_updated_at   TIMESTAMPTZ;

COMMIT;
