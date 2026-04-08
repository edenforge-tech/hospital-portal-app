-- =============================================================================
-- Pre-Op Investigations Pricing Migration
-- Ensures lab_test_catalog has is_pre_operative flag and correct columns,
-- seeds pre-op prices including Surgical Profile (moved from Imaging step).
-- =============================================================================

-- 1. Add missing columns to lab_test_catalog (IF NOT EXISTS guards — idempotent)
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS is_pre_operative   BOOLEAN      NOT NULL DEFAULT FALSE;
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS description         TEXT;
-- EF model uses sample_type; SQL seed used specimen_type — sync both columns
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS sample_type         VARCHAR(100);
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS created_by_user_id  UUID;
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS updated_by_user_id  UUID;

-- Backfill sample_type from specimen_type where specimen_type exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lab_test_catalog' AND column_name = 'specimen_type'
  ) THEN
    UPDATE lab_test_catalog
    SET sample_type = specimen_type
    WHERE sample_type IS NULL AND specimen_type IS NOT NULL;
  END IF;
END $$;

-- =============================================================================
-- 2. Mark existing seeded tests as pre-operative
-- =============================================================================
UPDATE lab_test_catalog
SET is_pre_operative = TRUE, updated_at = NOW()
WHERE test_code IN (
  'FBS001',      -- Fasting Blood Sugar
  'PLBS001',     -- Post Lunch Blood Sugar
  'RBS001',      -- Random Blood Sugar
  'HBA1C001',    -- HbA1c
  'ECG001',      -- ECG
  'ECHO001',     -- 2D Echo
  'LIPID001',    -- Lipid Profile
  'BUN001',      -- Blood Urea / BUN
  'HIV001',      -- HIV-I & II
  'HBSAG001',    -- HBsAg
  'HCV001',      -- HCV
  'RTPCR001',    -- RT-PCR
  'CBC001',      -- Complete Blood Count (CBP)
  'BTCT001',     -- BT/CT
  'SCREAT001'    -- Serum Creatinine
);

-- =============================================================================
-- 3. Insert Surgical Profile (moved from Imaging step) and Blood Pressure
--    ON CONFLICT DO NOTHING makes this idempotent
-- =============================================================================
INSERT INTO lab_test_catalog (
  id, tenant_id, test_name, test_code, category, price,
  sample_type, turnaround_hours, is_pre_operative, is_active,
  created_at, updated_at
)
VALUES
  -- Surgical Profile – pre-op blood panel bundle (was in ImagingOrderWidget)
  (
    gen_random_uuid(),
    NULL,                             -- NULL tenant_id = global/shared catalog entry
    'Surgical Profile',
    'SURG-PROF-001',
    'Pre-Operative Panel',
    1950.00,
    'Blood (Serum)',
    6,
    TRUE,
    TRUE,
    NOW(), NOW()
  ),
  -- Blood Pressure (vital) – no lab charge, included for documentation
  (
    gen_random_uuid(),
    NULL,
    'Blood Pressure (BP)',
    'BP-VITALS-001',
    'Clinical Vitals',
    0.00,
    NULL,
    NULL,
    TRUE,
    TRUE,
    NOW(), NOW()
  )
ON CONFLICT (test_code) DO UPDATE
  SET
    price            = EXCLUDED.price,
    is_pre_operative = TRUE,
    category         = EXCLUDED.category,
    updated_at       = NOW();

-- =============================================================================
-- 4. Verification query (optional – run manually to confirm)
-- =============================================================================
-- SELECT test_code, test_name, category, price, is_pre_operative
-- FROM lab_test_catalog
-- WHERE is_pre_operative = TRUE
-- ORDER BY category, test_name;
