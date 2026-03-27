-- ============================================================================
-- Migration 75: Surgery Workflow Fixes
-- P1  Add 'guardian' to patient_consents.consent_type CHECK
-- Note: Dept CHECK at 9 values (Admissions, Billing, Lab, Surgeon, Anesthesia,
--       OT, Pharmacy, Radiology, Nursing) is intentionally different from the
--       original plan which listed Optometry/Cardiology/Counselor. The current
--       set was chosen as more universally appropriate; the frontend ALL_DEPARTMENTS
--       array matches the current DB CHECK.
-- Date: 2026-03
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- P1 — Add 'guardian' consent type
--      Plan required surgical, ga_anaesthesia, guardian.
--      Migration 73 added surgical + ga_anaesthesia but missed guardian.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'patient_consents'
          AND constraint_type = 'CHECK'
          AND constraint_name = 'patient_consents_consent_type_check'
    ) THEN
        ALTER TABLE patient_consents
            DROP CONSTRAINT patient_consents_consent_type_check;
    END IF;
END $$;

ALTER TABLE patient_consents
    ADD CONSTRAINT patient_consents_consent_type_check
    CHECK (consent_type IN (
        'general','procedure','anesthesia','photography','data_sharing',
        'telemedicine','research',
        'surgical','ga_anaesthesia','topical_anaesthesia','guardian'
    ));

COMMENT ON COLUMN patient_consents.consent_type IS
    'guardian = consent given by parent/guardian for minor patients';

COMMIT;
