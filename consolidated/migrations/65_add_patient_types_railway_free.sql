-- Migration: 65_add_patient_types_railway_free.sql
-- Adds 'Railway' and 'Free' to all patient_type CHECK constraints and seeds configuration rows.
-- Run AFTER existing migrations. Safe to re-run (uses DROP CONSTRAINT IF EXISTS + DO $$ blocks).

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. counseling_sessions — update patient_type CHECK constraint
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  -- Find the existing CHECK constraint on patient_type in counseling_sessions
  SELECT conname INTO v_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'counseling_sessions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%patient_type%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE counseling_sessions DROP CONSTRAINT %I', v_constraint_name);
    RAISE NOTICE 'Dropped constraint % from counseling_sessions', v_constraint_name;
  END IF;
END $$;

ALTER TABLE counseling_sessions
  ADD CONSTRAINT counseling_sessions_patient_type_check
  CHECK (patient_type IN (
    'Cash', 'Insurance', 'CoPay',
    'ESH', 'CGHS', 'Arograshree', 'SGHS',
    'Camp',
    'Railway', 'Free'
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. patient_type_configurations — update patient_type CHECK constraint
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT conname INTO v_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'patient_type_configurations'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%patient_type%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE patient_type_configurations DROP CONSTRAINT %I', v_constraint_name);
    RAISE NOTICE 'Dropped constraint % from patient_type_configurations', v_constraint_name;
  END IF;
END $$;

ALTER TABLE patient_type_configurations
  ADD CONSTRAINT patient_type_configurations_patient_type_check
  CHECK (patient_type IN (
    'Cash', 'Insurance', 'CoPay',
    'ESH', 'CGHS', 'Arograshree', 'SGHS',
    'Camp',
    'Railway', 'Free'
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Seed Railway and Free configuration rows per tenant
--    (Uses tenant table to iterate; skips if row already exists)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO patient_type_configurations (
  id, tenant_id, patient_type, display_name, description,
  configuration_json, is_active, display_order,
  created_at, updated_at, status
)
SELECT
  gen_random_uuid(),
  t.id,
  'Railway',
  'Railway (RELHS)',
  'Railway Employees Liberal Health Scheme',
  '{"scheme":"RELHS","requires_referral_letter":true,"required_documents":["Railway Beneficiary Card","RELHS Referral Letter","Employee ID"],"zero_advance_payment":true,"billing_mode":"direct_billing","requires_preauth":true,"pre_auth_authority":"Chief Medical Director"}'::jsonb,
  true,
  9,
  NOW(), NOW(), 'active'
FROM tenant t
WHERE NOT EXISTS (
  SELECT 1 FROM patient_type_configurations p
  WHERE p.tenant_id = t.id AND p.patient_type = 'Railway'
);

INSERT INTO patient_type_configurations (
  id, tenant_id, patient_type, display_name, description,
  configuration_json, is_active, display_order,
  created_at, updated_at, status
)
SELECT
  gen_random_uuid(),
  t.id,
  'Free',
  'Free / Charity',
  'Hospital charity / indigent care patients — waived fees',
  '{"zero_cost_surgery":true,"requires_social_worker_approval":true,"required_documents":["Income Certificate","BPL Card or Charity Approval Form"],"zero_advance_payment":true,"billing_mode":"charity","notes":"Approval from hospital management mandatory before scheduling"}'::jsonb,
  true,
  10,
  NOW(), NOW(), 'active'
FROM tenant t
WHERE NOT EXISTS (
  SELECT 1 FROM patient_type_configurations p
  WHERE p.tenant_id = t.id AND p.patient_type = 'Free'
);

COMMIT;
