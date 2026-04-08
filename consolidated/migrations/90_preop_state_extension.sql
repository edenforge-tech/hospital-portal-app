-- ============================================================================
-- Migration 90: Extend clinical_state to include PreOpInProgress
-- Purpose: Inserts the new PreOpInProgress state between Expected and Admitted
--          in the patient_journey CHECK constraint.
-- Dependencies: patient_journey (81)
-- Date: 2026-03
-- ============================================================================

BEGIN;

-- Drop the old CHECK constraint and recreate it with the new state included.
-- PostgreSQL does not support ALTER CONSTRAINT, so we drop + add.
ALTER TABLE patient_journey
    DROP CONSTRAINT IF EXISTS patient_journey_clinical_state_check;

ALTER TABLE patient_journey
    ADD CONSTRAINT patient_journey_clinical_state_check
    CHECK (clinical_state IN (
        'Expected',
        'PreOpInProgress',
        'Admitted',
        'ReadyForSurgery',
        'SentToOT',
        'InOT',
        'SurgeryCompleted',
        'PostOpInProgress',
        'ReadyForDischarge',
        'Discharged'
    ));

COMMENT ON COLUMN patient_journey.clinical_state IS
    'State machine: Expected → PreOpInProgress → Admitted → ReadyForSurgery → '
    'SentToOT → InOT → SurgeryCompleted → PostOpInProgress → ReadyForDischarge → Discharged. '
    'PreOpInProgress added 2026-03 for pre-admission clearance workflow.';

COMMIT;
