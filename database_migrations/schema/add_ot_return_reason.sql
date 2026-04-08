-- Migration: add ot_return_reason column to patient_journey
-- Purpose: Track the reason a patient was returned from OT to ward,
--          enabling the "OT Returned" view in counsellors-desk and
--          the warning badge on ward ReadyForSurgery rows.

ALTER TABLE patient_journey
  ADD COLUMN IF NOT EXISTS ot_return_reason TEXT DEFAULT NULL;

COMMENT ON COLUMN patient_journey.ot_return_reason IS
  'Reason the patient was returned from OT to ward (ReadyForSurgery). '
  'Null means the patient was not returned from OT.';
