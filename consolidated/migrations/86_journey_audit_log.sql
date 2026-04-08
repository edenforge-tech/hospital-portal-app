-- ============================================================================
-- Migration 86: Journey Audit Log
-- Purpose: Immutable record of every state transition and action on a journey
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS journey_audit_log (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenant(id),
    patient_journey_id      UUID NOT NULL REFERENCES patient_journey(id),

    action                  VARCHAR(100) NOT NULL,  -- e.g. 'Admitted', 'SentToOT', 'SurgeryStarted'
    state_type              VARCHAR(50),            -- 'ClinicalState', 'OTState', 'FinancialState', 'PostOpState'
    old_value               VARCHAR(50),
    new_value               VARCHAR(50),

    -- Full state snapshot at time of action (for audit trail completeness)
    previous_state          JSONB,
    new_state               JSONB,

    notes                   TEXT,
    performed_by_user_id    UUID REFERENCES users(id),
    performed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jal_journey     ON journey_audit_log(patient_journey_id);
CREATE INDEX IF NOT EXISTS idx_jal_tenant      ON journey_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jal_performed   ON journey_audit_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_jal_action      ON journey_audit_log(action);

-- RLS
ALTER TABLE journey_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON journey_audit_log;
CREATE POLICY tenant_isolation ON journey_audit_log
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMENT ON TABLE journey_audit_log IS
    'Append-only audit trail for patient_journey. Every state transition, override, '
    'and user action is logged here. Displayed as Timeline in Journey Detail Overview tab.';

COMMIT;
