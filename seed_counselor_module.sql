-- ============================================================
-- Counselor Module Seed Data (Corrected)
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Branch: 74c014cf-9570-4824-bdf9-b369ea11a8f4
-- ============================================================

-- STEP 1: Create 3 OT Theaters for tenant 155fe198
INSERT INTO ot_theaters (id, tenant_id, branch_id, theater_name, theater_code, specialization, is_active, is_operational, created_at, created_by_user_id)
VALUES
  ('aaa00001-0000-0000-0000-000000000001', '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4', 'Operating Theater 1', 'OT-01', 'Ophthalmology', true, true, NOW(), '019c88f8-a202-70ec-b486-d0ff3290f04c'),
  ('aaa00001-0000-0000-0000-000000000002', '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4', 'Operating Theater 2', 'OT-02', 'Ophthalmology', true, true, NOW(), '019c88f8-a202-70ec-b486-d0ff3290f04c'),
  ('aaa00001-0000-0000-0000-000000000003', '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4', 'Laser Suite', 'OT-03', 'Laser Surgery', true, true, NOW(), '019c88f8-a202-70ec-b486-d0ff3290f04c')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: Seed OT Schedules (Surgery Confirmed tab data)
-- 6 surgeries across today, tomorrow, and this week
-- Using existing patients and sessions from tenant 155fe198
-- ============================================================
INSERT INTO ot_schedules (
  id, tenant_id, branch_id, theater_id, session_id, patient_id,
  schedule_number, scheduled_date, start_time, end_time, duration_minutes,
  surgery_type, eye_operated, surgeon_id, status,
  created_at, created_by_user_id, updated_at
)
VALUES
  -- Today: Cataract Surgery for Michael Johnson (MRN383420)
  (
    'bbb00001-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',  -- counseling session
    '949c297f-fab4-4008-9833-29744bb6fb15',  -- Michael Johnson
    'OT/2026/0001',
    CURRENT_DATE,
    '09:00', '10:30', 90,
    'Phacoemulsification (Cataract)', 'Right',
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Confirmed',
    NOW() - INTERVAL '2 days', '019c88f8-a202-70ec-b486-d0ff3290f04c', NOW()
  ),
  -- Today: LASIK for Jane Smith (MRN844967)
  (
    'bbb00001-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000003',  -- counseling session
    'e562b1cf-541d-44af-baed-9990646cbe2c',  -- Jane Smith
    'OT/2026/0002',
    CURRENT_DATE,
    '11:00', '12:00', 60,
    'LASIK Refractive Surgery', 'Both',
    '251ff397-c62a-4469-af48-b118b75058f9',
    'Booked',
    NOW() - INTERVAL '1 day', '019c88f8-a202-70ec-b486-d0ff3290f04c', NOW()
  ),
  -- Tomorrow: Phaco for John Doe (MRN707876)
  (
    'bbb00001-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '2415c6ce-a8a7-43bc-ac2c-6df41949fe5a',
    '0fc0fd4b-e2aa-4b30-a326-8c94226c3720',  -- John Doe
    'OT/2026/0003',
    CURRENT_DATE + INTERVAL '1 day',
    '08:30', '10:00', 90,
    'Phacoemulsification (Cataract)', 'Left',
    '6937802a-a536-46c1-8825-125e71b01e44',
    'Confirmed',
    NOW() - INTERVAL '3 days', '019c88f8-a202-70ec-b486-d0ff3290f04c', NOW()
  ),
  -- Tomorrow: Trabeculectomy for Jane Smith (MRN126721)
  (
    'bbb00001-0000-0000-0000-000000000004',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',
    '03449e4d-e86d-43bf-b5e4-4f455910100e',
    'a1ab945e-4e02-4fd1-aa70-5add8069374e',  -- Jane Smith
    'OT/2026/0004',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00', '15:30', 90,
    'Trabeculectomy (Glaucoma)', 'Right',
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Booked',
    NOW() - INTERVAL '2 days', '019c88f8-a202-70ec-b486-d0ff3290f04c', NOW()
  ),
  -- 3 days out: ICL for Michael Johnson (MRN404241)
  (
    'bbb00001-0000-0000-0000-000000000005',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000002',
    'a90c690c-1945-4e52-8591-151e2c078acf',
    '9a88575c-1e5a-470e-9719-9735cb5d168e',  -- Michael Johnson
    'OT/2026/0005',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00', '11:30', 90,
    'ICL Implantation', 'Both',
    '251ff397-c62a-4469-af48-b118b75058f9',
    'Confirmed',
    NOW() - INTERVAL '4 days', '019c88f8-a202-70ec-b486-d0ff3290f04c', NOW()
  ),
  -- 5 days out: Pterygium Excision for Jane Smith (MRN557178)
  (
    'bbb00001-0000-0000-0000-000000000006',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',
    'f8a36568-f5ee-4401-91f0-810786736630',
    '82e944e8-04cf-40ad-8e1b-ce1ca17487cf',  -- Jane Smith
    'OT/2026/0006',
    CURRENT_DATE + INTERVAL '5 days',
    '09:30', '10:30', 60,
    'Pterygium Excision', 'Right',
    '6937802a-a536-46c1-8825-125e71b01e44',
    'Booked',
    NOW() - INTERVAL '1 day', '019c88f8-a202-70ec-b486-d0ff3290f04c', NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================
-- STEP 3: Update counseling sessions for Surgery Followup tab
-- Sessions where surgery was discussed but patient hasn't confirmed
-- Set pending_decision=true to show in followup queue
-- ============================================================
UPDATE counseling_sessions SET
  pending_decision = true,
  patient_agreed_to_surgery = NULL,  -- undecided
  reasons_for_delay = 'Financial',
  updated_at = NOW()
WHERE id = 'ebad5ae4-d682-478e-be1d-a4fd1e7a4e34'
  AND deleted_at IS NULL;

UPDATE counseling_sessions SET
  pending_decision = true,
  patient_agreed_to_surgery = NULL,  -- undecided
  reasons_for_delay = 'Fear',
  updated_at = NOW()
WHERE id = '8de375a5-76c1-49e5-ad87-b56c8d16f694'
  AND deleted_at IS NULL;

UPDATE counseling_sessions SET
  pending_decision = true,
  patient_agreed_to_surgery = NULL,  -- undecided
  reasons_for_delay = 'Family',
  updated_at = NOW()
WHERE id = '7e329cc9-df17-4f51-86ec-679dba31231f'
  AND deleted_at IS NULL;

UPDATE counseling_sessions SET
  pending_decision = true,
  patient_agreed_to_surgery = false,  -- declined
  reasons_for_delay = 'Competitor',
  updated_at = NOW()
WHERE id = '8d0d5420-8b13-4fea-b983-e7d156dc325c'
  AND deleted_at IS NULL;

-- Mark 2 sessions as agreed (they have OT schedules booked) 
UPDATE counseling_sessions SET
  pending_decision = false,
  patient_agreed_to_surgery = true,
  decision_date = CURRENT_DATE - INTERVAL '2 days',
  updated_at = NOW()
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '11111111-0000-0000-0000-000000000003',
  '2415c6ce-a8a7-43bc-ac2c-6df41949fe5a',
  '03449e4d-e86d-43bf-b5e4-4f455910100e',
  'a90c690c-1945-4e52-8591-151e2c078acf',
  'f8a36568-f5ee-4401-91f0-810786736630'
)
AND deleted_at IS NULL;

-- ============================================================
-- STEP 4: Add recommended surgery names to sessions shown in Followup tab
-- ============================================================
UPDATE counseling_sessions SET recommended_surgery = 'Phacoemulsification (Cataract)' WHERE id = 'ebad5ae4-d682-478e-be1d-a4fd1e7a4e34' AND deleted_at IS NULL;
UPDATE counseling_sessions SET recommended_surgery = 'LASIK Refractive Surgery' WHERE id = '8de375a5-76c1-49e5-ad87-b56c8d16f694' AND deleted_at IS NULL;
UPDATE counseling_sessions SET recommended_surgery = 'Trabeculectomy (Glaucoma)' WHERE id = '7e329cc9-df17-4f51-86ec-679dba31231f' AND deleted_at IS NULL;
UPDATE counseling_sessions SET recommended_surgery = 'ICL Implantation' WHERE id = '8d0d5420-8b13-4fea-b983-e7d156dc325c' AND deleted_at IS NULL;

-- ============================================================
-- STEP 5: Verify seeded data
-- ============================================================
SELECT 'OT Schedules seeded:' AS info, COUNT(*) as count FROM ot_schedules 
WHERE tenant_id='155fe198-6ae5-4a01-9254-ead5b427247e' AND deleted_at IS NULL;

SELECT 'Followup sessions (pending_decision=true):' AS info, COUNT(*) as count 
FROM counseling_sessions 
WHERE tenant_id='155fe198-6ae5-4a01-9254-ead5b427247e' AND pending_decision=true AND deleted_at IS NULL;

SELECT 'Surgery Agreed sessions:' AS info, COUNT(*) as count 
FROM counseling_sessions 
WHERE tenant_id='155fe198-6ae5-4a01-9254-ead5b427247e' AND patient_agreed_to_surgery=true AND deleted_at IS NULL;
