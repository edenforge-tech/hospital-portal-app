-- ============================================================================
-- Seed lab_test_catalog with Imaging, Scan, and additional Lab items
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- ============================================================================

DO $$
DECLARE
  v_tenant  UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
  v_user    UUID := '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81';
  v_session UUID := '321ba5af-3e13-437f-82b4-2d2059f75d06';
BEGIN

-- ── IMAGING items ────────────────────────────────────────────────────────────
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES
  (uuid_generate_v4(), v_tenant, 'IOL Biometry & Keratometry',          'BIOMETRY',    'Biometry',        1200, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Specular Microscopy (Endothelial Cell Count)', 'SPEC-MICRO', 'Corneal Imaging', 800, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Corneal Topography (Pentacam/Orbscan)', 'TOPO',       'Corneal Imaging', 1000, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'OCT Macula',                          'OCT-MACULA',  'Retinal Imaging', 1500, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'OCT Optic Disc (Glaucoma)',           'OCT-DISC',    'Glaucoma Imaging',1500, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'B-Scan Ultrasound',                   'B-SCAN',      'Ocular Ultrasound',600, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Fundus Photography',                  'FUNDUS-PHOTO','Retinal Imaging',  800, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'IOL Calculation (Barrett/Haigis)',    'IOL-CALC',    'Biometry',         400, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Fluorescein Angiography (FFA)',       'FFA',         'Retinal Imaging', 3500, 'Imaging', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'OCT Anterior Segment',               'OCT-ANT',     'Corneal Imaging', 1500, 'Imaging', true, NOW(), NOW(), v_user, v_user)
ON CONFLICT DO NOTHING;

-- ── SCAN items ───────────────────────────────────────────────────────────────
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES
  (uuid_generate_v4(), v_tenant, 'Intraocular Pressure (Non-Contact Tonometry)', 'IOP',      'Tonometry',  150, 'Scan', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Humphrey Visual Field (HVF 24-2)',  'HMS',          'Perimetry',  800, 'Scan', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Schirmer''s Test (Dry Eye)',        'SCHIRMER',     'Tear Film',  300, 'Scan', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'A-Scan Biometry (Immersion)',       'A-SCAN',       'Biometry',   600, 'Scan', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'ECG (12-Lead Resting)',             'ECG',          'Cardiac',    250, 'Scan', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Chest X-Ray (PA View)',             'CXR',          'Radiology',  400, 'Scan', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Blood Pressure Measurement',        'BP',           'Vitals',      50, 'Scan', true, NOW(), NOW(), v_user, v_user)
ON CONFLICT DO NOTHING;

-- ── Additional LAB items ─────────────────────────────────────────────────────
INSERT INTO lab_test_catalog
  (id, tenant_id, test_name, test_code, category, price, test_type, is_active, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES
  (uuid_generate_v4(), v_tenant, 'Complete Blood Count (CBC)',         'CBC',         'Haematology',    350, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Fasting Blood Sugar (FBS)',          'FBS',         'Biochemistry',   150, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Random Blood Sugar (RBS)',           'RBS',         'Biochemistry',   150, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'HbA1c (Glycated Haemoglobin)',       'HBA1C',       'Biochemistry',   450, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'PT/INR (Coagulation)',               'PT-INR',      'Coagulation',    400, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Urine Routine Examination',          'URINE-R',     'Urine',          150, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Serum Creatinine (Kidney Function)', 'S-CREAT',     'Biochemistry',   200, 'Lab', true, NOW(), NOW(), v_user, v_user),
  (uuid_generate_v4(), v_tenant, 'Blood Urea Nitrogen',                'BLOOD-UREA',  'Biochemistry',   150, 'Lab', true, NOW(), NOW(), v_user, v_user)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed counseling_session_audit_log with realistic history for John Doe
-- Session: 321ba5af-3e13-437f-82b4-2d2059f75d06
-- ============================================================================
INSERT INTO counseling_session_audit_log
  (id, tenant_id, session_id, change_type, old_value, new_value, reason, changed_by_user_id, changed_at)
VALUES
  (
    uuid_generate_v4(), v_tenant, v_session,
    'StageTransition',
    'Pending',
    'Processed',
    'Counsellor opened session',
    v_user,
    NOW() - INTERVAL '3 hours 45 minutes'
  ),
  (
    uuid_generate_v4(), v_tenant, v_session,
    'PatientTypeChanged',
    NULL,
    'General',
    NULL,
    v_user,
    NOW() - INTERVAL '3 hours 40 minutes'
  ),
  (
    uuid_generate_v4(), v_tenant, v_session,
    'PackageChanged',
    NULL,
    'Monofocal - Indian Lens (₹35,000)',
    'Patient preferred Indian lens option',
    v_user,
    NOW() - INTERVAL '3 hours 30 minutes'
  ),
  (
    uuid_generate_v4(), v_tenant, v_session,
    'PackageChanged',
    'Monofocal - Indian Lens (₹35,000)',
    'Eyhance - 60cm Distance (₹60,000)',
    'Patient interested in extended depth lens after explanation',
    v_user,
    NOW() - INTERVAL '3 hours 15 minutes'
  ),
  (
    uuid_generate_v4(), v_tenant, v_session,
    'DecisionMade',
    NULL,
    'DateForSurgery',
    'Patient agreed to proceed with Eyhance lens',
    v_user,
    NOW() - INTERVAL '3 hours 5 minutes'
  ),
  (
    uuid_generate_v4(), v_tenant, v_session,
    'ScheduleChanged',
    NULL,
    '2026-03-25 | 09:30 AM | OT-1 | Dr. Sharma',
    'Surgery booked for next Tuesday',
    v_user,
    NOW() - INTERVAL '3 hours'
  );

END $$;
