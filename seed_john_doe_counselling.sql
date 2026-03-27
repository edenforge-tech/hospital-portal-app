-- =============================================================================
-- SEED: John Doe Counselling Session Data
-- Session: 11111111-0000-0000-0000-000000000001
-- Tenant:  155fe198-6ae5-4a01-9254-ead5b427247e
-- Values taken from screenshot (Indian Monofocal Lens RE + investigations)
-- =============================================================================

DO $$
DECLARE
  v_session_id  UUID := '11111111-0000-0000-0000-000000000001';
  v_tenant_id   UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
  v_variant_id  UUID;
  v_patient_id  UUID;
  v_user_id     UUID;
  v_blob        TEXT;
BEGIN

  -- ── 1. Resolve variant ID for "Indian Monofocal Lens" ────────────────────
  SELECT id INTO v_variant_id
  FROM service_variants
  WHERE variant_name ILIKE '%Indian Monofocal%'
    AND is_active = true
  LIMIT 1;

  IF v_variant_id IS NULL THEN
    RAISE EXCEPTION 'Variant "Indian Monofocal Lens" not found in service_variants. Run this after catalog seed.';
  END IF;

  RAISE NOTICE 'Found variant_id: %', v_variant_id;

  -- ── 2. Get patient_id + any counsellor user_id from the session ───────────
  SELECT patient_id, COALESCE(counselor_id, referred_by_doctor_id)
  INTO   v_patient_id, v_user_id
  FROM   counseling_sessions
  WHERE  id = v_session_id AND tenant_id = v_tenant_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Session % not found.', v_session_id;
  END IF;

  -- ── 3. Build package_addons_json blob ─────────────────────────────────────
  --      This is the same JSON handleSave() would write.
  v_blob := json_build_object(
    'selectedSurgeryId',  'type-' || v_variant_id::text || '-RE',
    'variantId',          v_variant_id::text,
    'eye',                'RE',
    'packageName',        'Retina Package',
    'paymentType',        'Cash',
    'decision',           'NeedsTime',
    'schedule',           '2026-03-31'
  )::text;

  -- ── 4. Patch the session row ──────────────────────────────────────────────
  UPDATE counseling_sessions
  SET
    package_addons_json   = v_blob,
    package_amount        = 35000,
    patient_agreed_to_surgery = false,
    pending_decision      = true,
    surgery_tentative_date = '2026-03-31',
    surgery_tentative_eye  = 'RE',
    patient_type           = 'Cash',
    updated_at             = now()
  WHERE id = v_session_id AND tenant_id = v_tenant_id;

  RAISE NOTICE 'Updated counseling_sessions.package_addons_json';

  -- ── 5. Remove stale investigation orders (re-seed cleanly) ────────────────
  DELETE FROM counselor_lab_order_items
  WHERE session_id = v_session_id AND tenant_id = v_tenant_id;

  -- ── 6. Insert investigation orders from screenshot ────────────────────────
  -- Imaging / Scans (RE eye)
  INSERT INTO counselor_lab_order_items
    (id, tenant_id, session_id, patient_id, ordered_by_user_id,
     test_name, test_type, price, urgency, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_tenant_id, v_session_id, v_patient_id, v_user_id,
     'OCT Macula',              'Imaging', 1500, 'Routine', 'Pending', now(), now()),
    (gen_random_uuid(), v_tenant_id, v_session_id, v_patient_id, v_user_id,
     'OCT Disc (RNFL)',         'Imaging', 1500, 'Routine', 'Pending', now(), now()),
    (gen_random_uuid(), v_tenant_id, v_session_id, v_patient_id, v_user_id,
     'B-Scan Ultrasonography',  'Imaging', 1200, 'Routine', 'Pending', now(), now()),
  -- Lab investigations
    (gen_random_uuid(), v_tenant_id, v_session_id, v_patient_id, v_user_id,
     'Fasting Blood Sugar (FBS)',       'Lab', 150,  'Routine', 'Pending', now(), now()),
    (gen_random_uuid(), v_tenant_id, v_session_id, v_patient_id, v_user_id,
     'LIPID Profile',                   'Lab', 400,  'Routine', 'Pending', now(), now()),
    (gen_random_uuid(), v_tenant_id, v_session_id, v_patient_id, v_user_id,
     'Surgical Profile (Pre-Op Panel)', 'Lab', 1950, 'Routine', 'Pending', now(), now());

  RAISE NOTICE 'Inserted 6 counselor_lab_order_items';

  RAISE NOTICE '=== SEED COMPLETE. Reload the John Doe session to verify. ===';

END $$;

-- ── Quick verification query ──────────────────────────────────────────────────
SELECT
  id,
  package_addons_json,
  package_amount,
  patient_type,
  surgery_tentative_eye,
  updated_at
FROM counseling_sessions
WHERE id = '11111111-0000-0000-0000-000000000001';

SELECT test_name, test_type, price, status
FROM counselor_lab_order_items
WHERE session_id = '11111111-0000-0000-0000-000000000001'
ORDER BY test_type, test_name;
