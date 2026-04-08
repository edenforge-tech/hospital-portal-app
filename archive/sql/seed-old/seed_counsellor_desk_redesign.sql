-- ============================================================================
-- Counsellor Desk UI Redesign: lab_test_catalog seed
-- Date: 2026-03-22
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Actual columns: id, tenant_id, test_name, test_code, category, price,
--                 specimen_type, turnaround_hours, is_active,
--                 created_at, updated_at, created_by_user_id, updated_by_user_id,
--                 deleted_at, test_type
-- Note: test_code has a UNIQUE constraint (no tenant scope)
-- ============================================================================

DO $$
DECLARE
  v_tenant UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN

-- ─── 1a. Reassign categories on existing Lab items ──────────────────────────

-- FBS, RBS, HbA1c → General Investigations
UPDATE lab_test_catalog
SET    category   = 'General Investigations',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Lab'
  AND  deleted_at IS NULL
  AND  test_name  ILIKE ANY(ARRAY['%fasting blood sugar%', '%random blood sugar%', '%HbA1c%']);

-- Blood Urea, Serum Creatinine → Pre-Operative Panel
UPDATE lab_test_catalog
SET    category   = 'Pre-Operative Panel',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Lab'
  AND  deleted_at IS NULL
  AND  test_name  ILIKE ANY(ARRAY['%blood urea%', '%serum creatinine%']);

-- CBC, PT/INR, Urine Routine, Surgical Profile → Pre-Operative Panel
UPDATE lab_test_catalog
SET    category   = 'Pre-Operative Panel',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Lab'
  AND  deleted_at IS NULL
  AND  test_name  ILIKE ANY(ARRAY['%complete blood count%', '%PT/INR%', '%urine routine%', '%surgical profile%']);

-- ─── 1b. Move ECG + BP from Scan → Lab with proper categories ───────────────

UPDATE lab_test_catalog
SET    test_type  = 'Lab',
       category   = 'Cardiac Investigations',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  deleted_at IS NULL
  AND  test_name  ILIKE '%ECG%';

UPDATE lab_test_catalog
SET    test_type  = 'Lab',
       category   = 'General Investigations',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  deleted_at IS NULL
  AND  test_name  ILIKE '%blood pressure%';

-- ─── 1c. Assign category to existing Imaging items ──────────────────────────

UPDATE lab_test_catalog
SET    category   = 'Diagnostic Scans',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Imaging'
  AND  deleted_at IS NULL
  AND  category   NOT IN ('Diagnostic Scans','Consultation Charges','Laser Procedures','Minor Procedures');

-- ─── 1d. Convert A-Scan Biometry + Humphrey VF → Imaging ───────────────────

UPDATE lab_test_catalog
SET    test_type  = 'Imaging',
       category   = 'Diagnostic Scans',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  deleted_at IS NULL
  AND  test_name  ILIKE ANY(ARRAY['%a-scan biometry%', '%humphrey visual field%', '%humphrey vf%']);

-- ─── 1e. New Imaging items ───────────────────────────────────────────────────
-- Note: test_code is globally unique. Use INSERT ... ON CONFLICT DO NOTHING.

-- Consultation Charges
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'Consultation Charges', 'CONSULT_CHG',
   'Consultation Charges', 500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- CCT
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'CCT', 'CCT',
   'Diagnostic Scans', 500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- OCT RNFL
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'OCT RNFL', 'OCT_RNFL',
   'Diagnostic Scans', 1500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- AS OCT
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'AS OCT', 'AS_OCT',
   'Diagnostic Scans', 1500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- Barrage Laser
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'Barrage Laser', 'BARRAGE_LASER',
   'Laser Procedures', 5000.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- PRP Laser
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'PRP Laser', 'PRP_LASER',
   'Laser Procedures', 3500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- YAG Capsulotomy
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'YAG Capsulotomy', 'YAG_CAPS',
   'Laser Procedures', 2500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- YAG PI
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'YAG PI', 'YAG_PI',
   'Laser Procedures', 3000.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- Chalazion Excision
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'Chalazion Excision', 'CHALAZION',
   'Minor Procedures', 5000.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- BCL
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'BCL', 'BCL',
   'Minor Procedures', 500.00, 'Imaging', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- ─── 1f. New Lab items ───────────────────────────────────────────────────────

-- PLBS
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'PLBS', 'PLBS',
   'General Investigations', 150.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- 2D ECHO
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, '2D ECHO', '2D_ECHO',
   'Cardiac Investigations', 1200.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- LIPID Profile
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'LIPID Profile', 'LIPID',
   'Cardiac Investigations', 400.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- HIV-I & II
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'HIV-I & II', 'HIV',
   'Viral Markers', 300.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- HBsAg
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'HBsAg', 'HBSAG',
   'Viral Markers', 200.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- HCV
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'HCV', 'HCV',
   'Viral Markers', 350.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- CBP
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'CBP', 'CBP',
   'Viral Markers', 200.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- RT PCR
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'RT PCR', 'RT_PCR',
   'Viral Markers', 800.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

-- BT/CT
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_tenant, 'BT/CT', 'BT_CT',
   'Pre-Operative Panel', 100.00, 'Lab', true, NOW(), NOW())
ON CONFLICT (test_code) DO NOTHING;

END $$;

-- Verification query
SELECT test_type, category, COUNT(*) as item_count
FROM   lab_test_catalog
WHERE  tenant_id  = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND  deleted_at IS NULL
GROUP  BY test_type, category
ORDER  BY test_type, category;


DO $$
DECLARE
  v_tenant UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN

-- ─── 1a. Assign categories to existing Lab items ────────────────────────────

UPDATE lab_test_catalog
SET    category   = 'General Investigations',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Lab'
  AND  deleted_at IS NULL
  AND  UPPER(test_code) IN ('FBS', 'RBS', 'HBAIC', 'HBA1C');

UPDATE lab_test_catalog
SET    category   = 'Pre-Operative Panel',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Lab'
  AND  deleted_at IS NULL
  AND  UPPER(test_code) IN ('CBC', 'PT_INR', 'PT/INR', 'PTINR', 'URINE_R', 'SURGICAL_PRE_OP');

UPDATE lab_test_catalog
SET    category   = 'Pre-Operative Panel',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Lab'
  AND  deleted_at IS NULL
  AND  LOWER(test_name) IN ('blood urea', 'serum creatinine')
  AND  (category IS NULL OR category = '');

-- ─── 1b. Move ECG + BP from Scan → Lab with proper categories ───────────────

UPDATE lab_test_catalog
SET    test_type  = 'Lab',
       category   = 'Cardiac Investigations',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  deleted_at IS NULL
  AND  LOWER(test_name) = 'ecg';

UPDATE lab_test_catalog
SET    test_type  = 'Lab',
       category   = 'General Investigations',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  deleted_at IS NULL
  AND  LOWER(test_name) = 'bp';

-- ─── 1c. Assign category to all existing Imaging items ──────────────────────

UPDATE lab_test_catalog
SET    category   = 'Diagnostic Scans',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  test_type  = 'Imaging'
  AND  deleted_at IS NULL
  AND  (category IS NULL OR category = '');

-- ─── 1d. Convert A-Scan Biometry + Humphrey VF from Scan → Imaging ──────────

UPDATE lab_test_catalog
SET    test_type  = 'Imaging',
       category   = 'Diagnostic Scans',
       updated_at = NOW()
WHERE  tenant_id  = v_tenant
  AND  deleted_at IS NULL
  AND  LOWER(test_name) IN ('a-scan biometry', 'humphrey vf', 'humphrey visual field', 'humphrey visual fields');

-- ─── 1e. New Imaging items ───────────────────────────────────────────────────

-- Consultation Charges
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'Consultation Charges', 'CONSULT', 'Consultation Charges',
  'Standard consultation charge', 500.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'consultation charges' AND deleted_at IS NULL
);

-- Diagnostic Scans: CCT
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'CCT', 'CCT', 'Diagnostic Scans',
  'Central Corneal Thickness', 500.00, 'Imaging', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'CCT' AND deleted_at IS NULL
);

-- OCT RNFL
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'OCT RNFL', 'OCT_RNFL', 'Diagnostic Scans',
  'Optical Coherence Tomography - Retinal Nerve Fiber Layer', 1500.00, 'Imaging', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'oct rnfl' AND deleted_at IS NULL
);

-- AS OCT
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'AS OCT', 'AS_OCT', 'Diagnostic Scans',
  'Anterior Segment OCT', 1500.00, 'Imaging', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'as oct' AND deleted_at IS NULL
);

-- Laser Procedures: Barrage Laser
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'Barrage Laser', 'BARRAGE_LASER', 'Laser Procedures',
  'Barrage Laser procedure', 5000.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'barrage laser' AND deleted_at IS NULL
);

-- PRP Laser
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'PRP Laser', 'PRP_LASER', 'Laser Procedures',
  'Pan Retinal Photocoagulation Laser', 3500.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'prp laser' AND deleted_at IS NULL
);

-- YAG Capsulotomy
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'YAG Capsulotomy', 'YAG_CAPS', 'Laser Procedures',
  'YAG Laser Capsulotomy', 2500.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'yag capsulotomy' AND deleted_at IS NULL
);

-- YAG PI
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'YAG PI', 'YAG_PI', 'Laser Procedures',
  'YAG Peripheral Iridotomy', 3000.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'yag pi' AND deleted_at IS NULL
);

-- Minor Procedures: Chalazion Excision
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'Chalazion Excision', 'CHALAZION', 'Minor Procedures',
  'Chalazion Excision procedure', 5000.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = 'chalazion excision' AND deleted_at IS NULL
);

-- BCL (Bandage Contact Lens)
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'BCL', 'BCL', 'Minor Procedures',
  'Bandage Contact Lens', 500.00, 'Imaging', false, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'BCL' AND deleted_at IS NULL
);

-- ─── 1f. New Lab items ───────────────────────────────────────────────────────

-- PLBS
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'PLBS', 'PLBS', 'General Investigations',
  'Post Lunch Blood Sugar', 150.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'PLBS' AND deleted_at IS NULL
);

-- 2D ECHO
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, '2D ECHO', '2D_ECHO', 'Cardiac Investigations',
  '2-Dimensional Echocardiography', 1200.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND LOWER(test_name) = '2d echo' AND deleted_at IS NULL
);

-- LIPID Profile
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'LIPID Profile', 'LIPID', 'Cardiac Investigations',
  'Lipid Profile panel', 400.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'LIPID' AND deleted_at IS NULL
);

-- HIV-I & II
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'HIV-I & II', 'HIV', 'Viral Markers',
  'HIV-I and HIV-II antibody test', 300.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'HIV' AND deleted_at IS NULL
);

-- HBsAg
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'HBsAg', 'HBSAG', 'Viral Markers',
  'Hepatitis B surface Antigen', 200.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'HBSAG' AND deleted_at IS NULL
);

-- HCV
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'HCV', 'HCV', 'Viral Markers',
  'Hepatitis C Virus antibody test', 350.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'HCV' AND deleted_at IS NULL
);

-- CBP
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'CBP', 'CBP', 'Viral Markers',
  'Complete Blood Picture', 200.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'CBP' AND deleted_at IS NULL
);

-- RT PCR
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'RT PCR', 'RT_PCR', 'Viral Markers',
  'Reverse Transcription PCR', 800.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'RT_PCR' AND deleted_at IS NULL
);

-- BT/CT
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, description, price, test_type, is_pre_operative, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(), v_tenant, 'BT/CT', 'BT_CT', 'Pre-Operative Panel',
  'Bleeding Time / Clotting Time', 100.00, 'Lab', true, true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM lab_test_catalog
  WHERE tenant_id = v_tenant AND UPPER(test_code) = 'BT_CT' AND deleted_at IS NULL
);

END $$;

-- Verification query
SELECT test_type, category, COUNT(*) as item_count
FROM   lab_test_catalog
WHERE  tenant_id  = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND  deleted_at IS NULL
GROUP  BY test_type, category
ORDER  BY test_type, category;
