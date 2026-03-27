-- Migration 003: Add payment classification + field-level audit columns
-- Phase 2: unified payment type replaces separate patient_type + payment_mode
-- Phase 4: field-level diff columns for granular HIPAA audit trail

-- ── patient_counselling ───────────────────────────────────────────
ALTER TABLE patient_counselling
  ADD COLUMN IF NOT EXISTS payment_type      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS insurance_company VARCHAR(200);

COMMENT ON COLUMN patient_counselling.payment_type      IS 'Unified payment classification (Cash, Card, UPI, Insurance, CGHS, Free, etc.)';
COMMENT ON COLUMN patient_counselling.insurance_company IS 'Insurance / TPA company name (populated when payment_type is insurance-related)';

-- ── counselling_audit_log ─────────────────────────────────────────
ALTER TABLE counselling_audit_log
  ADD COLUMN IF NOT EXISTS field_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS old_value  TEXT,
  ADD COLUMN IF NOT EXISTS new_value  TEXT;

COMMENT ON COLUMN counselling_audit_log.field_name IS 'Camel-case field that changed (e.g. paymentType, packageName). Populated only when action = ''FieldChanged''.';
COMMENT ON COLUMN counselling_audit_log.old_value  IS 'Serialised previous value';
COMMENT ON COLUMN counselling_audit_log.new_value  IS 'Serialised new value';

-- Index: quickly fetch all field-change entries for a given session
CREATE INDEX IF NOT EXISTS idx_cal_field_changes
  ON counselling_audit_log (counselling_id, action)
  WHERE action = 'FieldChanged';
