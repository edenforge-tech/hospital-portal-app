-- ============================================================
-- IP MANAGEMENT RESET + 15 FRESH COUNSELLOR PATIENTS
-- Re-runnable: cleans previous run before inserting.
-- Tenant : 155fe198-6ae5-4a01-9254-ead5b427247e
-- Branch : 74c014cf-9570-4824-bdf9-b369ea11a8f4
-- ============================================================

-- ── PART 1: Soft-delete all IP-management journey data ────────────────────────
DO $$
DECLARE
    v_tenant UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
BEGIN
    RAISE NOTICE 'PART 1 — Soft-deleting IP Management records...';

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'preop_section_clearance') THEN
        UPDATE preop_section_clearance
           SET deleted_at = NOW(), status = 'archived', updated_at = NOW()
         WHERE tenant_id = v_tenant AND deleted_at IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pre_op_clearance') THEN
        UPDATE pre_op_clearance
           SET deleted_at = NOW(), status = 'archived', updated_at = NOW()
         WHERE tenant_id = v_tenant AND deleted_at IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_journey') THEN
        UPDATE patient_journey
           SET deleted_at = NOW(), status = 'archived', updated_at = NOW()
         WHERE tenant_id = v_tenant AND deleted_at IS NULL;
    END IF;

    RAISE NOTICE 'PART 1 — Done.';
END $$;

-- ── PART 2: Soft-delete counselor queue & sessions ───────────────────────────
DO $$
DECLARE
    v_tenant UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
BEGIN
    RAISE NOTICE 'PART 2 — Clearing counselor queue and sessions...';

    UPDATE counselor_queue
       SET deleted_at = NOW(), status = 'Cancelled', updated_at = NOW()
     WHERE tenant_id = v_tenant AND deleted_at IS NULL;

    UPDATE counseling_sessions
       SET deleted_at = NOW(), status = 'Cancelled', updated_at = NOW()
     WHERE tenant_id = v_tenant AND deleted_at IS NULL;

    RAISE NOTICE 'PART 2 — Done.';
END $$;

-- ── PART 3: Hard-delete previous seed rows (fixed UUIDs) ─────────────────────
DO $$
BEGIN
    RAISE NOTICE 'PART 3 — Removing previous seed rows...';

    DELETE FROM counselor_queue
     WHERE id IN (
        'cc000001-3333-3333-3333-000000000001'::uuid,
        'cc000001-3333-3333-3333-000000000002'::uuid,
        'cc000001-3333-3333-3333-000000000003'::uuid,
        'cc000001-3333-3333-3333-000000000004'::uuid,
        'cc000001-3333-3333-3333-000000000005'::uuid,
        'cc000001-3333-3333-3333-000000000006'::uuid,
        'cc000001-3333-3333-3333-000000000007'::uuid,
        'cc000001-3333-3333-3333-000000000008'::uuid,
        'cc000001-3333-3333-3333-000000000009'::uuid,
        'cc000001-3333-3333-3333-000000000010'::uuid,
        'cc000001-3333-3333-3333-000000000011'::uuid,
        'cc000001-3333-3333-3333-000000000012'::uuid,
        'cc000001-3333-3333-3333-000000000013'::uuid,
        'cc000001-3333-3333-3333-000000000014'::uuid,
        'cc000001-3333-3333-3333-000000000015'::uuid
     );

    DELETE FROM counseling_sessions
     WHERE id IN (
        'bb000001-2222-2222-2222-000000000001'::uuid,
        'bb000001-2222-2222-2222-000000000002'::uuid,
        'bb000001-2222-2222-2222-000000000003'::uuid,
        'bb000001-2222-2222-2222-000000000004'::uuid,
        'bb000001-2222-2222-2222-000000000005'::uuid,
        'bb000001-2222-2222-2222-000000000006'::uuid,
        'bb000001-2222-2222-2222-000000000007'::uuid,
        'bb000001-2222-2222-2222-000000000008'::uuid,
        'bb000001-2222-2222-2222-000000000009'::uuid,
        'bb000001-2222-2222-2222-000000000010'::uuid,
        'bb000001-2222-2222-2222-000000000011'::uuid,
        'bb000001-2222-2222-2222-000000000012'::uuid,
        'bb000001-2222-2222-2222-000000000013'::uuid,
        'bb000001-2222-2222-2222-000000000014'::uuid,
        'bb000001-2222-2222-2222-000000000015'::uuid
     );

    DELETE FROM patient
     WHERE id IN (
        'aa000001-1111-1111-1111-000000000001'::uuid,
        'aa000001-1111-1111-1111-000000000002'::uuid,
        'aa000001-1111-1111-1111-000000000003'::uuid,
        'aa000001-1111-1111-1111-000000000004'::uuid,
        'aa000001-1111-1111-1111-000000000005'::uuid,
        'aa000001-1111-1111-1111-000000000006'::uuid,
        'aa000001-1111-1111-1111-000000000007'::uuid,
        'aa000001-1111-1111-1111-000000000008'::uuid,
        'aa000001-1111-1111-1111-000000000009'::uuid,
        'aa000001-1111-1111-1111-000000000010'::uuid,
        'aa000001-1111-1111-1111-000000000011'::uuid,
        'aa000001-1111-1111-1111-000000000012'::uuid,
        'aa000001-1111-1111-1111-000000000013'::uuid,
        'aa000001-1111-1111-1111-000000000014'::uuid,
        'aa000001-1111-1111-1111-000000000015'::uuid
     );

    RAISE NOTICE 'PART 3 — Done.';
END $$;

-- ── PART 4: Insert 15 fresh patients ─────────────────────────────────────────
DO $$
DECLARE
    v_tenant UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
    v_admin  UUID := (SELECT id FROM users WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
                       AND email ILIKE '%admin%' LIMIT 1);
BEGIN
    RAISE NOTICE 'PART 4 — Inserting 15 fresh patients...';

    INSERT INTO patient (id, tenant_id, medical_record_number,
        first_name, last_name, date_of_birth, gender, contact_number, email,
        status, created_at, updated_at, created_by_user_id)
    VALUES
    ('aa000001-1111-1111-1111-000000000001'::uuid, v_tenant, 'FRESH-001',
     'Ramakrishna','Reddy',   '1958-03-12', 'male',   '+919800000001','ramakrishna.reddy@test.com',   'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000002'::uuid, v_tenant, 'FRESH-002',
     'Saraswathi', 'Naidu',   '1965-07-22', 'female', '+919800000002','saraswathi.naidu@test.com',    'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000003'::uuid, v_tenant, 'FRESH-003',
     'Suresh',     'Babu',    '1952-11-05', 'male',   '+919800000003','suresh.babu@test.com',         'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000004'::uuid, v_tenant, 'FRESH-004',
     'Vasantha',   'Kumari',  '1948-01-30', 'female', '+919800000004','vasantha.kumari@test.com',     'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000005'::uuid, v_tenant, 'FRESH-005',
     'Ravi',       'Shankar', '1960-09-18', 'male',   '+919800000005','ravi.shankar@test.com',        'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000006'::uuid, v_tenant, 'FRESH-006',
     'Meenakshi',  'Iyer',    '1955-04-14', 'female', '+919800000006','meenakshi.iyer@test.com',      'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000007'::uuid, v_tenant, 'FRESH-007',
     'Gopalkrishnan','Pillai','1950-12-25', 'male',   '+919800000007','gopalkrishnan.pillai@test.com','active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000008'::uuid, v_tenant, 'FRESH-008',
     'Annapurna',  'Devi',    '1967-06-08', 'female', '+919800000008','annapurna.devi@test.com',      'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000009'::uuid, v_tenant, 'FRESH-009',
     'Venkatesh',  'Murthy',  '1945-08-02', 'male',   '+919800000009','venkatesh.murthy@test.com',    'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000010'::uuid, v_tenant, 'FRESH-010',
     'Lakshmidevi','Krishnan','1970-02-19', 'female', '+919800000010','lakshmidevi.krishnan@test.com','active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000011'::uuid, v_tenant, 'FRESH-011',
     'Narayana',   'Swamy',   '1953-10-11', 'male',   '+919800000011','narayana.swamy@test.com',      'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000012'::uuid, v_tenant, 'FRESH-012',
     'Radha',      'Krishnamurthy','1962-05-27','female','+919800000012','radha.krishnamurthy@test.com','active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000013'::uuid, v_tenant, 'FRESH-013',
     'Balakrishna','Rao',     '1956-07-03', 'male',   '+919800000013','balakrishna.rao@test.com',     'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000014'::uuid, v_tenant, 'FRESH-014',
     'Deepa',      'Nair',    '1980-03-16', 'female', '+919800000014','deepa.nair@test.com',          'active',NOW(),NOW(),v_admin),
    ('aa000001-1111-1111-1111-000000000015'::uuid, v_tenant, 'FRESH-015',
     'Mohan',      'Lal',     '1959-11-21', 'male',   '+919800000015','mohan.lal@test.com',           'active',NOW(),NOW(),v_admin);

    RAISE NOTICE 'PART 4 — Done.';
END $$;

-- ── PART 5: Insert counseling_sessions ───────────────────────────────────────
DO $$
DECLARE
    v_tenant  UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
    v_branch  UUID := '74c014cf-9570-4824-bdf9-b369ea11a8f4'::uuid;
    v_doctor  UUID := '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81'::uuid;
    v_admin   UUID := (SELECT id FROM users WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
                        AND email ILIKE '%admin%' LIMIT 1);
BEGIN
    RAISE NOTICE 'PART 5 — Inserting counseling sessions...';

    INSERT INTO counseling_sessions (
        id, tenant_id, branch_id, patient_id, referred_by_doctor_id,
        session_number, session_date, patient_type,
        recommended_surgery,
        status, created_at, updated_at, created_by_user_id
    ) VALUES
    ('bb000001-2222-2222-2222-000000000001'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000001'::uuid, v_doctor,
     'CS-FRESH-001', CURRENT_DATE, 'Cash',
     'Phacoemulsification RE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000002'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000002'::uuid, v_doctor,
     'CS-FRESH-002', CURRENT_DATE, 'Insurance',
     'Phacoemulsification LE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000003'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000003'::uuid, v_doctor,
     'CS-FRESH-003', CURRENT_DATE, 'Cash',
     'Phacoemulsification Bilateral',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000004'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000004'::uuid, v_doctor,
     'CS-FRESH-004', CURRENT_DATE, 'CGHS',
     'Phacoemulsification RE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000005'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000005'::uuid, v_doctor,
     'CS-FRESH-005', CURRENT_DATE, 'Cash',
     'Phacoemulsification LE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000006'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000006'::uuid, v_doctor,
     'CS-FRESH-006', CURRENT_DATE, 'Insurance',
     'Trabeculectomy RE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000007'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000007'::uuid, v_doctor,
     'CS-FRESH-007', CURRENT_DATE, 'Cash',
     'Trabeculectomy + Ahmed Glaucoma Valve LE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000008'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000008'::uuid, v_doctor,
     'CS-FRESH-008', CURRENT_DATE, 'Cash',
     'iStent Trabecular Micro-Bypass RE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000009'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000009'::uuid, v_doctor,
     'CS-FRESH-009', CURRENT_DATE, 'Insurance',
     'Pars Plana Vitrectomy RE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000010'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000010'::uuid, v_doctor,
     'CS-FRESH-010', CURRENT_DATE, 'Cash',
     'Intravitreal Injection Anti-VEGF LE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000011'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000011'::uuid, v_doctor,
     'CS-FRESH-011', CURRENT_DATE, 'CGHS',
     'Pars Plana Vitrectomy LE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000012'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000012'::uuid, v_doctor,
     'CS-FRESH-012', CURRENT_DATE, 'Insurance',
     'Deep Anterior Lamellar Keratoplasty DALK RE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000013'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000013'::uuid, v_doctor,
     'CS-FRESH-013', CURRENT_DATE, 'Cash',
     'DSAEK Corneal Transplant LE',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000014'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000014'::uuid, v_doctor,
     'CS-FRESH-014', CURRENT_DATE, 'Cash',
     'Squint Correction Strabismus Surgery Bilateral',
     'Scheduled', NOW(), NOW(), v_admin),
    ('bb000001-2222-2222-2222-000000000015'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000015'::uuid, v_doctor,
     'CS-FRESH-015', CURRENT_DATE, 'Insurance',
     'PRP Laser + Intravitreal Anti-VEGF Bilateral',
     'Scheduled', NOW(), NOW(), v_admin);

    RAISE NOTICE 'PART 5 — Done.';
END $$;

-- ── PART 6: Insert counselor_queue entries (status=Waiting → FE shows Pending) 
DO $$
DECLARE
    v_tenant  UUID := '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;
    v_branch  UUID := '74c014cf-9570-4824-bdf9-b369ea11a8f4'::uuid;
    v_admin   UUID := (SELECT id FROM users WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
                        AND email ILIKE '%admin%' LIMIT 1);
BEGIN
    RAISE NOTICE 'PART 6 — Inserting counselor queue entries...';

    INSERT INTO counselor_queue (
        id, tenant_id, branch_id, patient_id, session_id,
        token_number, queue_position, urgency_level, status,
        added_to_queue_at, created_at, updated_at
    ) VALUES
    ('cc000001-3333-3333-3333-000000000001'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000001'::uuid,'bb000001-2222-2222-2222-000000000001'::uuid,
     'TKN-101', 1,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000002'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000002'::uuid,'bb000001-2222-2222-2222-000000000002'::uuid,
     'TKN-102', 2,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000003'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000003'::uuid,'bb000001-2222-2222-2222-000000000003'::uuid,
     'TKN-103', 3,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000004'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000004'::uuid,'bb000001-2222-2222-2222-000000000004'::uuid,
     'TKN-104', 4,'High','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000005'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000005'::uuid,'bb000001-2222-2222-2222-000000000005'::uuid,
     'TKN-105', 5,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000006'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000006'::uuid,'bb000001-2222-2222-2222-000000000006'::uuid,
     'TKN-106', 6,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000007'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000007'::uuid,'bb000001-2222-2222-2222-000000000007'::uuid,
     'TKN-107', 7,'High','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000008'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000008'::uuid,'bb000001-2222-2222-2222-000000000008'::uuid,
     'TKN-108', 8,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000009'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000009'::uuid,'bb000001-2222-2222-2222-000000000009'::uuid,
     'TKN-109', 9,'High','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000010'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000010'::uuid,'bb000001-2222-2222-2222-000000000010'::uuid,
     'TKN-110',10,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000011'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000011'::uuid,'bb000001-2222-2222-2222-000000000011'::uuid,
     'TKN-111',11,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000012'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000012'::uuid,'bb000001-2222-2222-2222-000000000012'::uuid,
     'TKN-112',12,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000013'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000013'::uuid,'bb000001-2222-2222-2222-000000000013'::uuid,
     'TKN-113',13,'High','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000014'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000014'::uuid,'bb000001-2222-2222-2222-000000000014'::uuid,
     'TKN-114',14,'Normal','Waiting',NOW(),NOW(),NOW()),
    ('cc000001-3333-3333-3333-000000000015'::uuid, v_tenant, v_branch,
     'aa000001-1111-1111-1111-000000000015'::uuid,'bb000001-2222-2222-2222-000000000015'::uuid,
     'TKN-115',15,'Normal','Waiting',NOW(),NOW(),NOW());

    RAISE NOTICE 'PART 6 — Done.';
    RAISE NOTICE '=== RESET COMPLETE === 15 patients in counsellor waiting list (status=Waiting → FE shows Pending) ===';
END $$;
