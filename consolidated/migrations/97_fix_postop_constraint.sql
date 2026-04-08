-- Migration 97: Fix patient_journey clinical_state CHECK constraint
-- Root cause: Migration 90 set the constraint with 'PostOpInProgress'.
-- Migration 91 renamed the data rows (PostOpInProgress → PostOp) but forgot
-- to update the constraint itself. This caused a PostgreSQL CHECK violation
-- whenever the backend attempted to write ClinicalState.PostOp = "PostOp".

BEGIN;

-- Fix any rows that still have the legacy PreOpInProgress state
-- (migration 91 renamed most rows but may have missed some).
-- PreOpInProgress maps to Admitted in the simplified state machine.
UPDATE patient_journey
SET clinical_state = 'Admitted'
WHERE clinical_state = 'PreOpInProgress';

ALTER TABLE patient_journey
    DROP CONSTRAINT IF EXISTS patient_journey_clinical_state_check;

ALTER TABLE patient_journey
    ADD CONSTRAINT patient_journey_clinical_state_check
    CHECK (clinical_state IN (
        'Expected',
        'Admitted',
        'ReadyForSurgery',
        'SentToOT',
        'InOT',
        'SurgeryCompleted',
        'PostOp',
        'ReadyForDischarge',
        'Discharged'
    ));

COMMENT ON COLUMN patient_journey.clinical_state IS
    'RLS-protected state machine: Expected → Admitted → ReadyForSurgery → SentToOT → InOT → SurgeryCompleted → PostOp → ReadyForDischarge → Discharged. '
    'PreOpInProgress removed in migration 91.';

COMMIT;
