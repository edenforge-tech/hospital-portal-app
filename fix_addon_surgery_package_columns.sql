-- ============================================================
-- AddOnSurgery Workflow: package snapshot columns
-- Applied to: counselling-service DB (patient_counselling table)
-- Idempotent: all statements use IF NOT EXISTS / DO NOTHING
-- ============================================================

-- 1. New columns for package-upgrade tracking in the Azure counselling service
ALTER TABLE patient_counselling
  ADD COLUMN IF NOT EXISTS previous_package_details  TEXT,
  ADD COLUMN IF NOT EXISTS previous_package_amount   NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS addon_reason              TEXT;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'patient_counselling'
  AND column_name IN ('previous_package_details', 'previous_package_amount', 'addon_reason')
ORDER BY column_name;
