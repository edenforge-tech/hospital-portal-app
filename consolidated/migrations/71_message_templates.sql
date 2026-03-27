-- Migration 71: Communication Message Templates
-- Purpose: Reusable SMS/Email/WhatsApp message templates with placeholder substitution
-- Used by CommunicationLogModal (template picker) and Twilio SMS integration
-- Templates can be tenant-specific (tenant_id set) or global (tenant_id = NULL)

BEGIN;

-- ============================================================
-- TABLE: communication_message_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS communication_message_templates (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID,           -- NULL = global template available to all tenants

    -- Identification
    template_name           VARCHAR(120)    NOT NULL,
    template_category       VARCHAR(60)     NOT NULL DEFAULT 'General'
                                            CHECK (template_category IN (
                                                'General',
                                                'SurgeryReminder',
                                                'PreAdmissionChecklist',
                                                'InsuranceFollowup',
                                                'CallbackConfirmation',
                                                'DecisionFollowup',
                                                'PostSurgeryWelcome',
                                                'NoShowFollowup',
                                                'EscalationAlert',
                                                'DelayReason'
                                            )),

    -- Channel
    channel                 VARCHAR(30)     NOT NULL DEFAULT 'SMS'
                                            CHECK (channel IN ('SMS','WhatsApp','Email','InApp')),

    -- Content
    subject                 VARCHAR(200),   -- For Email only
    body                    TEXT            NOT NULL,  -- Supports {{PATIENT_NAME}}, {{SURGERY_DATE}}, {{HOSPITAL_NAME}}, {{COUNSELOR_NAME}}, {{BRANCH_NAME}}, {{CALLBACK_TIME}}, {{AUTH_NUMBER}}

    -- Metadata
    delay_reason_target     VARCHAR(60),    -- If this template targets a specific delay reason (Fear, Financial, etc.)
    patient_type_target     VARCHAR(30),    -- Optional: target specific patient type (Insurance, CGHS, etc.)
    estimated_read_time_sec  INTEGER,       -- Approx seconds to read (for WhatsApp/SMS compliance metrics)

    -- Flags
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    is_global               BOOLEAN         NOT NULL DEFAULT FALSE, -- TRUE = show in all tenant dropdowns
    requires_approval       BOOLEAN         NOT NULL DEFAULT FALSE, -- Future: manager approval before sending

    -- Standard audit columns (HIPAA)
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,           -- NULL for seed/system templates
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active'
                                            CHECK (status IN ('active','archived'))
);

CREATE INDEX IF NOT EXISTS idx_msg_templates_tenant
    ON communication_message_templates(tenant_id)
    WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_msg_templates_channel_category
    ON communication_message_templates(channel, template_category)
    WHERE deleted_at IS NULL AND is_active = TRUE;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_msg_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_msg_templates_updated_at ON communication_message_templates;
CREATE TRIGGER trg_msg_templates_updated_at
    BEFORE UPDATE ON communication_message_templates
    FOR EACH ROW EXECUTE FUNCTION update_msg_templates_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- Global templates (tenant_id IS NULL) are visible to all.
-- Tenant-specific templates only visible to their tenant.
-- ============================================================
ALTER TABLE communication_message_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON communication_message_templates;
CREATE POLICY tenant_isolation ON communication_message_templates
    FOR ALL
    USING (
        tenant_id IS NULL
        OR tenant_id::text = current_setting('app.current_tenant_id', true)
    );

-- ============================================================
-- SEED: Global starter templates
-- ============================================================
INSERT INTO communication_message_templates
    (id, tenant_id, template_name, template_category, channel, body, is_global, is_active)
VALUES
    (
        gen_random_uuid(), NULL,
        'Surgery Date Reminder (SMS)',
        'SurgeryReminder', 'SMS',
        'Dear {{PATIENT_NAME}}, your surgery is scheduled on {{SURGERY_DATE}} at {{HOSPITAL_NAME}} ({{BRANCH_NAME}}). Please arrive 1 hour early and follow the pre-admission instructions sent to you. For queries call us anytime. – {{COUNSELOR_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'Pre-Admission Checklist (SMS)',
        'PreAdmissionChecklist', 'SMS',
        'Dear {{PATIENT_NAME}}, please complete the following before your surgery on {{SURGERY_DATE}}: 1) Fasting from midnight before surgery 2) Bring all original documents 3) Stop blood-thinners as advised. Contact us if you have questions. – {{HOSPITAL_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'Insurance Pre-Auth Status (SMS)',
        'InsuranceFollowup', 'SMS',
        'Dear {{PATIENT_NAME}}, your insurance pre-authorization (Ref: {{AUTH_NUMBER}}) is currently under review. We will update you within 48 hours. Please keep your ID card and policy documents ready. – {{COUNSELOR_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'Callback Confirmation (SMS)',
        'CallbackConfirmation', 'SMS',
        'Dear {{PATIENT_NAME}}, our counselor {{COUNSELOR_NAME}} will call you on {{CALLBACK_TIME}} regarding your surgery consultation. Please keep your phone available. – {{HOSPITAL_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'Decision Follow-up (SMS)',
        'DecisionFollowup', 'SMS',
        'Dear {{PATIENT_NAME}}, we understand you are still considering your treatment options. Our counselor {{COUNSELOR_NAME}} is here to answer any questions about costs, risks, or recovery. Please call {{BRANCH_NAME}} at your convenience. – {{HOSPITAL_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'Post-Surgery Welcome (SMS)',
        'PostSurgeryWelcome', 'SMS',
        'Dear {{PATIENT_NAME}}, congratulations on a successful procedure! Your care team at {{HOSPITAL_NAME}} will schedule a follow-up call within 48 hours. Please rest and follow the discharge instructions carefully. – {{COUNSELOR_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'No-Show Follow-up (SMS)',
        'NoShowFollowup', 'SMS',
        'Dear {{PATIENT_NAME}}, we noticed you missed your surgery appointment on {{SURGERY_DATE}} at {{BRANCH_NAME}}. Please contact our counselor {{COUNSELOR_NAME}} to reschedule at the earliest. We are here to help. – {{HOSPITAL_NAME}}',
        TRUE, TRUE
    ),
    (
        gen_random_uuid(), NULL,
        'Financial Concern Follow-up (SMS)',
        'DelayReason', 'SMS',
        'Dear {{PATIENT_NAME}}, we understand cost is a concern. {{HOSPITAL_NAME}} offers flexible payment options, EMI plans, and financial assistance for eligible patients. Speak with {{COUNSELOR_NAME}} to explore your options – there may be more support available than you think. – {{HOSPITAL_NAME}}',
        TRUE, TRUE
    )
ON CONFLICT DO NOTHING;

COMMIT;
