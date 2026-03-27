-- ==============================================================================
-- COMPREHENSIVE SEED: Surgery Confirmed + Followup (Pre & Post) Scenarios
-- Tenant:  155fe198-6ae5-4a01-9254-ead5b427247e  (India Eye Hospital Network)
-- Branch:  74c014cf-9570-4824-bdf9-b369ea11a8f4  (Downtown Hospital)
-- Theaters:
--   OT-1   aaa00001-0000-0000-0000-000000000001
--   OT-2   aaa00001-0000-0000-0000-000000000002
--   Laser  aaa00001-0000-0000-0000-000000000003
-- Surgeons (from existing OT schedules):
--   Surgeon A  6937802a-a536-46c1-8825-125e71b01e44
--   Surgeon B  251ff397-c62a-4469-af48-b118b75058f9
--   Surgeon C  2fdd4b1d-5d67-47d5-a9cb-0d1651471d81
--
-- All dates relative to 2026-03-19 (today)
-- Run: psql ... -f seed_surgery_scenarios.sql
-- ==============================================================================

BEGIN;

SET app.current_tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- ==============================================================================
-- STEP 1: Give test patients realistic names for the eye hospital context
-- ==============================================================================

UPDATE patient SET
    first_name = 'Revathi',        last_name = 'Sundar',
    updated_at = NOW()
WHERE id = '3dac80b6-82e3-4043-86aa-c83a7d4e346a';  -- P1

UPDATE patient SET
    first_name = 'Murugan',        last_name = 'Sivam',
    updated_at = NOW()
WHERE id = '381e8ddb-27d9-4525-b497-cdfe3ec8dd4a';  -- P2

UPDATE patient SET
    first_name = 'Priya',          last_name = 'Krishnan',
    updated_at = NOW()
WHERE id = '17ac2c40-20ab-4f3a-be5d-947cc58785d1';  -- P3

UPDATE patient SET
    first_name = 'Arjun',          last_name = 'Reddy',
    updated_at = NOW()
WHERE id = 'fbeb1512-2ae1-48f8-a6ff-ce7d6fbb8bb2';  -- P4

UPDATE patient SET
    first_name = 'Fatima',         last_name = 'Begum',
    updated_at = NOW()
WHERE id = '63171fca-ef35-4816-b37f-c44db926da36';  -- P5

UPDATE patient SET
    first_name = 'Suresh',         last_name = 'Babu',
    updated_at = NOW()
WHERE id = '9983ec89-9f6f-4829-ad5a-7e5c3b7d1050';  -- P6

UPDATE patient SET
    first_name = 'Meena',          last_name = 'Devi',
    updated_at = NOW()
WHERE id = 'ece2bd55-38d9-403e-ba35-50543adaaa68';  -- P7

UPDATE patient SET
    first_name = 'Deepak',         last_name = 'Kumar',
    updated_at = NOW()
WHERE id = '8bc16968-3808-4f79-8d82-900e0c416324';  -- P8

UPDATE patient SET
    first_name = 'Ananya',         last_name = 'Sharma',
    updated_at = NOW()
WHERE id = '81f1dd8e-7796-4afe-857d-3699c2d2edd2';  -- P9

UPDATE patient SET
    first_name = 'Kiran',          last_name = 'Patel',
    updated_at = NOW()
WHERE id = 'f587af9e-af7e-4bc8-add4-ac0ccb66d531';  -- P10

UPDATE patient SET
    first_name = 'Lakshmi',        last_name = 'Narayanan',
    updated_at = NOW()
WHERE id = '1d7b9d81-6185-440d-af1e-779e1368ab76';  -- P11

UPDATE patient SET
    first_name = 'Raj',            last_name = 'Gopal',
    updated_at = NOW()
WHERE id = '95911133-5c0f-4e74-8fd2-edcaf124712e';  -- P12

UPDATE patient SET
    first_name = 'Nalini',         last_name = 'Iyer',
    updated_at = NOW()
WHERE id = '292fd269-7159-4014-8cdb-da7f628db3b4';  -- P13

UPDATE patient SET
    first_name = 'Vinayak',        last_name = 'More',
    updated_at = NOW()
WHERE id = '79c79ad7-381c-45a0-b8b0-e5d2aa562630';  -- P14

UPDATE patient SET
    first_name = 'Sunita',         last_name = 'Rao',
    updated_at = NOW()
WHERE id = '4571e88c-3713-4a95-b8ac-205992553767';  -- P15

UPDATE patient SET
    first_name = 'Harish',         last_name = 'Nair',
    updated_at = NOW()
WHERE id = '6f77d43e-879f-42e7-91f2-ef17fabf5589';  -- P16

UPDATE patient SET
    first_name = 'Divya',          last_name = 'Menon',
    updated_at = NOW()
WHERE id = '4ed5a3f2-92f4-43cb-86fe-99c496923f4e';  -- P17

UPDATE patient SET
    first_name = 'Ganesh',         last_name = 'Pillai',
    updated_at = NOW()
WHERE id = '568c477e-13a4-46c7-9504-14a7b5b8e8f4';  -- P18

UPDATE patient SET
    first_name = 'Sridevi',        last_name = 'Venkat',
    updated_at = NOW()
WHERE id = '445f0c46-14df-4776-995a-e93737ef1f50';  -- P19

UPDATE patient SET
    first_name = 'Balamurugan',    last_name = 'Chettiar',
    updated_at = NOW()
WHERE id = '98f33bd6-1969-4126-b7bf-fd78fe6fa926';  -- P20

-- ==============================================================================
-- STEP 2: Move existing OT schedules to future dates  (were in the past)
-- ==============================================================================

UPDATE ot_schedules SET
    scheduled_date = '2026-03-25',            -- 6 days from today
    updated_at     = NOW()
WHERE id = 'bbb00001-0000-0000-0000-000000000002'  -- LASIK
  AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

UPDATE ot_schedules SET
    scheduled_date = '2026-03-26',            -- 7 days
    updated_at     = NOW()
WHERE id = 'bbb00001-0000-0000-0000-000000000003'  -- Phacoemulsification
  AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

UPDATE ot_schedules SET
    scheduled_date = '2026-03-27',            -- 8 days
    updated_at     = NOW()
WHERE id = 'bbb00001-0000-0000-0000-000000000004'  -- Trabeculectomy
  AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

UPDATE ot_schedules SET
    scheduled_date = '2026-03-29',            -- 10 days
    updated_at     = NOW()
WHERE id = 'bbb00001-0000-0000-0000-000000000005'  -- ICL
  AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

UPDATE ot_schedules SET
    scheduled_date = '2026-04-02',            -- 14 days
    updated_at     = NOW()
WHERE id = 'bbb00001-0000-0000-0000-000000000006'  -- Pterygium
  AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- ==============================================================================
-- STEP 3: New OT Schedules — Surgery Confirmed Tab scenarios
--
-- Scenarios covered:
--  sc-01  Tomorrow     Phacoemulsification (Cataract) RE  Confirmed  P1 (Revathi) 
--  sc-02  2 days       ICL Implantation LE              Booked     P2 (Murugan)  IOL linked
--  sc-03  3 days       LASIK OU                         Confirmed  P3 (Priya)
--  sc-04  4 days       Retinal Detachment Repair RE      Booked     P5 (Fatima)
--  sc-05  5 days       Pterygium Excision RE             Confirmed  P6 (Suresh)
--  sc-06  8 days       PRK Refractive Surgery OU         Confirmed  P7 (Meena)
--  sc-07  10 days      Squint Correction LE              Booked     P8 (Deepak)
--  sc-08  14 days      Vitrectomy RE                     Booked     P9 (Ananya)
--  sc-09  21 days      DCR (Tear Duct)                   Confirmed  P10 (Kiran)
--  sc-10  28 days      Trabeculectomy (Glaucoma) RE      Booked     P4 (Arjun)
-- ==============================================================================

INSERT INTO ot_schedules (
    id, tenant_id, branch_id, theater_id,
    patient_id, surgeon_id,
    schedule_number, scheduled_date,
    start_time, end_time, duration_minutes,
    surgery_type, eye_operated, status,
    created_at, created_by_user_id, updated_at
) VALUES

-- sc-01: Cataract tomorrow, Confirmed, P1 (Revathi Sundar)
(
    'ccc00001-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '3dac80b6-82e3-4043-86aa-c83a7d4e346a',  -- Revathi Sundar
    '6937802a-a536-46c1-8825-125e71b01e44',  -- Surgeon A
    'OTS-2026-0101',
    '2026-03-20',
    '08:00', '08:45', 45,
    'Phacoemulsification (Cataract)', 'OD', 'Confirmed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- sc-02: ICL in 2 days, Booked, P2 (Murugan Sivam) - lens surgery
(
    'ccc00001-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',  -- Laser Suite
    '381e8ddb-27d9-4525-b497-cdfe3ec8dd4a',  -- Murugan Sivam
    '251ff397-c62a-4469-af48-b118b75058f9',  -- Surgeon B
    'OTS-2026-0102',
    '2026-03-21',
    '10:00', '11:00', 60,
    'ICL Implantation', 'OS', 'Booked',
    NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- sc-03: LASIK in 3 days, Confirmed, P3 (Priya Krishnan)
(
    'ccc00001-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',  -- Laser Suite
    '17ac2c40-20ab-4f3a-be5d-947cc58785d1',  -- Priya Krishnan
    '251ff397-c62a-4469-af48-b118b75058f9',  -- Surgeon B
    'OTS-2026-0103',
    '2026-03-22',
    '09:00', '09:30', 30,
    'LASIK Refractive Surgery', 'OU', 'Confirmed',
    NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- sc-04: Retinal Detachment in 4 days, Booked, P5 (Fatima Begum)
(
    'ccc00001-0000-0000-0000-000000000004',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000002',  -- OT-2
    '63171fca-ef35-4816-b37f-c44db926da36',  -- Fatima Begum
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-2026-0104',
    '2026-03-23',
    '11:00', '13:00', 120,
    'Retinal Detachment Repair', 'OD', 'Booked',
    NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- sc-05: Pterygium in 5 days, Confirmed, P6 (Suresh Babu)
(
    'ccc00001-0000-0000-0000-000000000005',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',  -- OT-1
    '9983ec89-9f6f-4829-ad5a-7e5c3b7d1050',  -- Suresh Babu
    '6937802a-a536-46c1-8825-125e71b01e44',  -- Surgeon A
    'OTS-2026-0105',
    '2026-03-24',
    '14:00', '14:30', 30,
    'Pterygium Excision', 'OD', 'Confirmed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- sc-06: PRK in 8 days, Confirmed, P7 (Meena Devi)
(
    'ccc00001-0000-0000-0000-000000000006',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',  -- Laser Suite
    'ece2bd55-38d9-403e-ba35-50543adaaa68',  -- Meena Devi
    '251ff397-c62a-4469-af48-b118b75058f9',  -- Surgeon B
    'OTS-2026-0106',
    '2026-03-27',
    '09:00', '09:30', 30,
    'PRK (Photorefractive Keratectomy)', 'OU', 'Confirmed',
    NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- sc-07: Squint in 10 days, Booked, P8 (Deepak Kumar)
(
    'ccc00001-0000-0000-0000-000000000007',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',  -- OT-1
    '8bc16968-3808-4f79-8d82-900e0c416324',  -- Deepak Kumar
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-2026-0107',
    '2026-03-29',
    '10:00', '11:30', 90,
    'Squint Correction (Strabismus)', 'OS', 'Booked',
    NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- sc-08: Vitrectomy in 14 days, Booked, P9 (Ananya Sharma) - high urgency
(
    'ccc00001-0000-0000-0000-000000000008',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000002',  -- OT-2
    '81f1dd8e-7796-4afe-857d-3699c2d2edd2',  -- Ananya Sharma
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-2026-0108',
    '2026-04-02',
    '08:00', '10:30', 150,
    'Vitrectomy', 'OD', 'Booked',
    NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- sc-09: DCR (Tear Duct) in 21 days, Confirmed, P10 (Kiran Patel)
(
    'ccc00001-0000-0000-0000-000000000009',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',  -- OT-1
    'f587af9e-af7e-4bc8-add4-ac0ccb66d531',  -- Kiran Patel
    '6937802a-a536-46c1-8825-125e71b01e44',  -- Surgeon A
    'OTS-2026-0109',
    '2026-04-09',
    '11:00', '12:30', 90,
    'DCR (Dacryocystorhinostomy)', 'OD', 'Confirmed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- sc-10: Glaucoma in 28 days, Booked, P4 (Arjun Reddy)
(
    'ccc00001-0000-0000-0000-000000000010',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',  -- OT-1
    'fbeb1512-2ae1-48f8-a6ff-ce7d6fbb8bb2',  -- Arjun Reddy
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-2026-0110',
    '2026-04-16',
    '09:00', '10:30', 90,
    'Trabeculectomy (Glaucoma)', 'OD', 'Booked',
    NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
)

ON CONFLICT (id) DO UPDATE SET
    scheduled_date = EXCLUDED.scheduled_date,
    status         = EXCLUDED.status,
    updated_at     = NOW();


-- ==============================================================================
-- STEP 4: Counseling Sessions for Surgery Followup — PRE-SURGERY tab
--
-- Must have: status='Completed', pending_decision=true
-- NOTE: The session_number trigger counts WHERE session_date = CURRENT_DATE.
--   If all rows use different past dates, the counter stalls at the same value
--   and causes unique constraint violations.
-- STRATEGY: INSERT all 10 with session_date = CURRENT_DATE (trigger assigns
--   sequential unique numbers), then UPDATE session_date to desired past dates.
--
-- Scenarios after date fixup:
--  s-01  P11 (Lakshmi)   Agreed     0 callbacks  Cataract  Insurance  0 days
--  s-02  P12 (Raj)       Agreed     3 callbacks  LASIK     Cash       5 days
--  s-03  P13 (Nalini)    Undecided  1 callback   ICL       CGHS       2 days  Financial
--  s-04  P14 (Vinayak)   Undecided  0 callbacks  Retinal   Cash       7 days  Fear
--  s-05  P15 (Sunita)    Undecided  2 callbacks  Cataract  Railway    10 days Family
--  s-06  P16 (Harish)    Undecided  0 callbacks  Glaucoma  Insurance  14 days Medical
--  s-07  P17 (Divya)     Declined   1 callback   LASIK     Cash       3 days  Competitor
--  s-08  P18 (Ganesh)    Undecided  5 callbacks  Cataract  Cash       21 days Travel
--  s-09  P19 (Sridevi)   Undecided  1 callback   Pterygium CGHS       8 days  Unknown
--  s-10  P20 (Balamu)    Agreed     2 callbacks  ICL       Corporate  1 day
-- ==============================================================================

-- Clean up any previously attempted inserts
DELETE FROM counseling_sessions
WHERE id IN (
    'ddd00001-0000-0000-0000-000000000001',
    'ddd00001-0000-0000-0000-000000000002',
    'ddd00001-0000-0000-0000-000000000003',
    'ddd00001-0000-0000-0000-000000000004',
    'ddd00001-0000-0000-0000-000000000005',
    'ddd00001-0000-0000-0000-000000000006',
    'ddd00001-0000-0000-0000-000000000007',
    'ddd00001-0000-0000-0000-000000000008',
    'ddd00001-0000-0000-0000-000000000009',
    'ddd00001-0000-0000-0000-000000000010'
);

-- Phase A: INSERT all 10 with session_date = CURRENT_DATE so the counter
-- increments correctly for each row (trigger uses COUNT WHERE session_date=TODAY)
INSERT INTO counseling_sessions (
    id, tenant_id, branch_id, patient_id,
    referred_by_doctor_id,
    session_type, session_date,
    patient_type, recommended_surgery,
    patient_agreed_to_surgery, pending_decision,
    reasons_for_delay, contact_attempt_count, last_contact_date,
    status,
    created_at, created_by_user_id, updated_at
) VALUES
(   'ddd00001-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '1d7b9d81-6185-440d-af1e-779e1368ab76', '6937802a-a536-46c1-8825-125e71b01e44',
    'Initial', CURRENT_DATE, 'Insurance', 'Phacoemulsification (Cataract)',
    TRUE, TRUE, NULL, 0, NULL, 'Completed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),
(   'ddd00001-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '95911133-5c0f-4e74-8fd2-edcaf124712e', '6937802a-a536-46c1-8825-125e71b01e44',
    'Initial', CURRENT_DATE, 'Cash', 'LASIK Refractive Surgery',
    TRUE, TRUE, NULL, 3, CURRENT_DATE - 1, 'Completed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),
(   'ddd00001-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '292fd269-7159-4014-8cdb-da7f628db3b4', '251ff397-c62a-4469-af48-b118b75058f9',
    'Initial', CURRENT_DATE, 'CGHS', 'ICL Implantation',
    FALSE, TRUE, 'Financial', 1, CURRENT_DATE, 'Completed',
    NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),
(   'ddd00001-0000-0000-0000-000000000004',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '79c79ad7-381c-45a0-b8b0-e5d2aa562630', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Initial', CURRENT_DATE, 'Cash', 'Retinal Detachment Repair',
    FALSE, TRUE, 'Fear', 0, NULL, 'Completed',
    NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),
(   'ddd00001-0000-0000-0000-000000000005',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '4571e88c-3713-4a95-b8ac-205992553767', '6937802a-a536-46c1-8825-125e71b01e44',
    'Initial', CURRENT_DATE, 'ESH', 'Phacoemulsification (Cataract)',
    FALSE, TRUE, 'Family', 2, CURRENT_DATE - 5, 'Completed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),
(   'ddd00001-0000-0000-0000-000000000006',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '6f77d43e-879f-42e7-91f2-ef17fabf5589', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Initial', CURRENT_DATE, 'Insurance', 'Trabeculectomy (Glaucoma)',
    FALSE, TRUE, 'Medical', 0, NULL, 'Completed',
    NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),
(   'ddd00001-0000-0000-0000-000000000007',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '4ed5a3f2-92f4-43cb-86fe-99c496923f4e', '251ff397-c62a-4469-af48-b118b75058f9',
    'Initial', CURRENT_DATE, 'Cash', 'LASIK Refractive Surgery',
    FALSE, TRUE, 'Competitor', 1, CURRENT_DATE - 3, 'Completed',
    NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),
(   'ddd00001-0000-0000-0000-000000000008',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '568c477e-13a4-46c7-9504-14a7b5b8e8f4', '6937802a-a536-46c1-8825-125e71b01e44',
    'Initial', CURRENT_DATE, 'Cash', 'Phacoemulsification (Cataract)',
    FALSE, TRUE, 'Travel', 5, CURRENT_DATE - 7, 'Completed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),
(   'ddd00001-0000-0000-0000-000000000009',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '445f0c46-14df-4776-995a-e93737ef1f50', '251ff397-c62a-4469-af48-b118b75058f9',
    'Initial', CURRENT_DATE, 'CGHS', 'Pterygium Excision',
    NULL, TRUE, NULL, 1, CURRENT_DATE - 6, 'Completed',
    NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),
(   'ddd00001-0000-0000-0000-000000000010',
    '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '98f33bd6-1969-4126-b7bf-fd78fe6fa926', '6937802a-a536-46c1-8825-125e71b01e44',
    'Initial', CURRENT_DATE, 'CoPay', 'ICL Implantation',
    TRUE, TRUE, NULL, 2, CURRENT_DATE, 'Completed',
    NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW()
);

-- Phase B: Back-date session_date to create realistic "days since session" spread
-- (session_number already assigned from Monday's batch — safe to update session_date)
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 0,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000001';  -- Lakshmi: today
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 5,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000002';  -- Raj: 5 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 2,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000003';  -- Nalini: 2 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 7,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000004';  -- Vinayak: 7 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 10, updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000005';  -- Sunita: 10 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 14, updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000006';  -- Harish: 14 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 3,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000007';  -- Divya: 3 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 21, updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000008';  -- Ganesh: 21 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 8,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000009';  -- Sridevi: 8 days ago
UPDATE counseling_sessions SET session_date = CURRENT_DATE - 1,  updated_at = NOW() WHERE id = 'ddd00001-0000-0000-0000-000000000010'; -- Balamurugan: 1 day ago


-- ==============================================================================
-- STEP 5: Completed OT Schedules for Post-Surgery Followup tab
--
-- Get CounselorView: ot_schedules WHERE status='Completed' within last 30 days
--
-- Scenarios:
--  p-01  P11 (Lakshmi)   Cataract  1 day ago   OD   Good outcome   surgeon A
--  p-02  P12 (Raj)       LASIK     3 days ago  OU   Good           surgeon B
--  p-03  P13 (Nalini)    ICL       5 days ago  OS   Good + compl.  surgeon B
--  p-04  P14 (Vinayak)   Retinal   8 days ago  OD   Complicated    surgeon C
--  p-05  P15 (Sunita)    Cataract  12 days ago OD   Good           surgeon A
--  p-06  P16 (Harish)    Glaucoma  20 days ago OD   Good           surgeon C
--  p-07  P17 (Divya)     Squint    25 days ago OS   Good           surgeon C
--  p-08  P18 (Ganesh)    Pterygium 2 days ago  OD   Good  (no postop plan)
-- ==============================================================================

INSERT INTO ot_schedules (
    id, tenant_id, branch_id, theater_id,
    patient_id, surgeon_id,
    schedule_number, scheduled_date,
    start_time, end_time, duration_minutes,
    surgery_type, eye_operated, status,
    surgery_started_at, surgery_completed_at,
    actual_duration_minutes, outcome, complications,
    created_at, created_by_user_id, updated_at
) VALUES

-- p-01: Cataract 1 day ago, Good outcome, P11 (Lakshmi)
(
    'eee00001-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '1d7b9d81-6185-440d-af1e-779e1368ab76',  -- Lakshmi Narayanan
    '6937802a-a536-46c1-8825-125e71b01e44',  -- Surgeon A
    'OTS-COMP-0101',
    CURRENT_DATE - 1,
    '08:00', '08:45', 45,
    'Phacoemulsification (Cataract)', 'OD', 'Completed',
    (NOW() - INTERVAL '1 day 9 hours'),
    (NOW() - INTERVAL '1 day 8 hours 15 minutes'),
    45, 'Good', NULL,
    NOW() - INTERVAL '5 days', '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- p-02: LASIK 3 days ago, Good, P12 (Raj Gopal)
(
    'eee00001-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',
    '95911133-5c0f-4e74-8fd2-edcaf124712e',  -- Raj Gopal
    '251ff397-c62a-4469-af48-b118b75058f9',  -- Surgeon B
    'OTS-COMP-0102',
    CURRENT_DATE - 3,
    '09:00', '09:30', 30,
    'LASIK Refractive Surgery', 'OU', 'Completed',
    (NOW() - INTERVAL '3 days 8 hours'),
    (NOW() - INTERVAL '3 days 7 hours 30 minutes'),
    30, 'Good', NULL,
    NOW() - INTERVAL '7 days', '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- p-03: ICL 5 days ago, minor complication, P13 (Nalini Iyer)
(
    'eee00001-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000003',
    '292fd269-7159-4014-8cdb-da7f628db3b4',  -- Nalini Iyer
    '251ff397-c62a-4469-af48-b118b75058f9',  -- Surgeon B
    'OTS-COMP-0103',
    CURRENT_DATE - 5,
    '10:00', '11:00', 60,
    'ICL Implantation', 'OS', 'Completed',
    (NOW() - INTERVAL '5 days 8 hours'),
    (NOW() - INTERVAL '5 days 7 hours'),
    65, 'Good', 'Mild transient IOP spike post-op, resolved with medication',
    NOW() - INTERVAL '9 days', '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- p-04: Retinal 8 days ago, difficult case, P14 (Vinayak More)
(
    'eee00001-0000-0000-0000-000000000004',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000002',
    '79c79ad7-381c-45a0-b8b0-e5d2aa562630',  -- Vinayak More
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-COMP-0104',
    CURRENT_DATE - 8,
    '11:00', '13:00', 120,
    'Retinal Detachment Repair', 'OD', 'Completed',
    (NOW() - INTERVAL '8 days 8 hours'),
    (NOW() - INTERVAL '8 days 5 hours 50 minutes'),
    130, 'Fair', 'Extended procedure due to large detachment; tamponade placed',
    NOW() - INTERVAL '12 days', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- p-05: Cataract 12 days ago, routine, P15 (Sunita Rao)
(
    'eee00001-0000-0000-0000-000000000005',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '4571e88c-3713-4a95-b8ac-205992553767',  -- Sunita Rao
    '6937802a-a536-46c1-8825-125e71b01e44',  -- Surgeon A
    'OTS-COMP-0105',
    CURRENT_DATE - 12,
    '08:30', '09:15', 45,
    'Phacoemulsification (Cataract)', 'OD', 'Completed',
    (NOW() - INTERVAL '12 days 8 hours'),
    (NOW() - INTERVAL '12 days 7 hours 15 minutes'),
    45, 'Good', NULL,
    NOW() - INTERVAL '16 days', '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- p-06: Glaucoma 20 days ago, P16 (Harish Nair)
(
    'eee00001-0000-0000-0000-000000000006',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '6f77d43e-879f-42e7-91f2-ef17fabf5589',  -- Harish Nair
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-COMP-0106',
    CURRENT_DATE - 20,
    '09:00', '10:30', 90,
    'Trabeculectomy (Glaucoma)', 'OD', 'Completed',
    (NOW() - INTERVAL '20 days 8 hours'),
    (NOW() - INTERVAL '20 days 6 hours 30 minutes'),
    90, 'Good', NULL,
    NOW() - INTERVAL '24 days', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- p-07: Squint 25 days ago, P17 (Divya Menon)
(
    'eee00001-0000-0000-0000-000000000007',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '4ed5a3f2-92f4-43cb-86fe-99c496923f4e',  -- Divya Menon
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',  -- Surgeon C
    'OTS-COMP-0107',
    CURRENT_DATE - 25,
    '10:00', '11:30', 90,
    'Squint Correction (Strabismus)', 'OS', 'Completed',
    (NOW() - INTERVAL '25 days 8 hours'),
    (NOW() - INTERVAL '25 days 6 hours 30 minutes'),
    88, 'Good', NULL,
    NOW() - INTERVAL '29 days', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- p-08: Pterygium 2 days ago, P18 (Ganesh Pillai)  – no post-op care plan
(
    'eee00001-0000-0000-0000-000000000008',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'aaa00001-0000-0000-0000-000000000001',
    '568c477e-13a4-46c7-9504-14a7b5b8e8f4',  -- Ganesh Pillai
    '6937802a-a536-46c1-8825-125e71b01e44',  -- Surgeon A
    'OTS-COMP-0108',
    CURRENT_DATE - 2,
    '14:00', '14:30', 30,
    'Pterygium Excision', 'OD', 'Completed',
    (NOW() - INTERVAL '2 days 4 hours'),
    (NOW() - INTERVAL '2 days 3 hours 30 minutes'),
    30, 'Good', NULL,
    NOW() - INTERVAL '6 days', '6937802a-a536-46c1-8825-125e71b01e44', NOW()
)

ON CONFLICT (id) DO UPDATE SET
    status               = EXCLUDED.status,
    scheduled_date       = EXCLUDED.scheduled_date,
    surgery_completed_at = EXCLUDED.surgery_completed_at,
    outcome              = EXCLUDED.outcome,
    complications        = EXCLUDED.complications,
    updated_at           = NOW();


-- ==============================================================================
-- STEP 6: Post-Op Care Schedules (linked to p-01 through p-07; p-08 intentionally missing)
-- ==============================================================================

INSERT INTO post_op_care_schedule (
    id, tenant_id, patient_id, surgeon_id,
    surgery_type, surgery_date, surgery_eye,
    instructions, restrictions, status,
    created_at, created_by_user_id, updated_at
) VALUES

-- postop-01: Cataract Lakshmi (p-01)
(
    'fff00001-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '1d7b9d81-6185-440d-af1e-779e1368ab76',
    '6937802a-a536-46c1-8825-125e71b01e44',
    'Phacoemulsification (Cataract)', CURRENT_DATE - 1, 'OD',
    '["Use Tobramycin eye drops 4x daily","Use Prednisolone drops 4x daily","Wear eye shield at night for 1 week","Avoid rubbing the eye"]',
    '["No water in operated eye for 1 week","No eye makeup for 2 weeks","No driving until cleared","Avoid dusty environments"]',
    'active',
    NOW() - INTERVAL '1 day', '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- postop-02: LASIK Raj (p-02)
(
    'fff00001-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '95911133-5c0f-4e74-8fd2-edcaf124712e',
    '251ff397-c62a-4469-af48-b118b75058f9',
    'LASIK Refractive Surgery', CURRENT_DATE - 3, 'OU',
    '["Use lubricating eye drops every 1 hour for first 24 hours","Use Moxifloxacin drops 3x daily for 7 days","Wear protective eyewear outdoors for 1 week"]',
    '["No swimming for 2 weeks","No contact sports for 1 month","Avoid rubbing eyes for 1 month","Avoid dusty environments for 1 week"]',
    'active',
    NOW() - INTERVAL '3 days', '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- postop-03: ICL Nalini (p-03)
(
    'fff00001-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '292fd269-7159-4014-8cdb-da7f628db3b4',
    '251ff397-c62a-4469-af48-b118b75058f9',
    'ICL Implantation', CURRENT_DATE - 5, 'OS',
    '["Use Prednisolone drops 4x daily tapering over 4 weeks","Check IOP at Day 1 visit","Use aceclo drops if IOP > 24","Avoid strenuous activity for 2 weeks"]',
    '["No swimming for 4 weeks","No contact sports for 4 weeks","Avoid rubbing eyes","Report immediately if pain or vision loss"]',
    'active',
    NOW() - INTERVAL '5 days', '251ff397-c62a-4469-af48-b118b75058f9', NOW()
),

-- postop-04: Retinal Vinayak (p-04)
(
    'fff00001-0000-0000-0000-000000000004',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '79c79ad7-381c-45a0-b8b0-e5d2aa562630',
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Retinal Detachment Repair', CURRENT_DATE - 8, 'OD',
    '["Maintain face-down positioning for 2 weeks","Use Ciprofloxacin drops 4x daily","Use Prednisolone drops 6x daily for 1 week","Monitor for any new floaters or flashes"]',
    '["Strict face-down posture 45 min/hour for 2 weeks","No air travel until gas bubble absorbs","No heavy lifting for 4 weeks","Avoid bright lights"]',
    'active',
    NOW() - INTERVAL '8 days', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- postop-05: Cataract Sunita (p-05)
(
    'fff00001-0000-0000-0000-000000000005',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '4571e88c-3713-4a95-b8ac-205992553767',
    '6937802a-a536-46c1-8825-125e71b01e44',
    'Phacoemulsification (Cataract)', CURRENT_DATE - 12, 'OD',
    '["Tobramycin drops 4x daily for 2 weeks","Prednisolone drops tapering over 4 weeks","Eye shield at night for 1 week"]',
    '["No water in eye for 1 week","Avoid dusty environments","No swimming for 2 weeks"]',
    'active',
    NOW() - INTERVAL '12 days', '6937802a-a536-46c1-8825-125e71b01e44', NOW()
),

-- postop-06: Glaucoma Harish (p-06)
(
    'fff00001-0000-0000-0000-000000000006',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '6f77d43e-879f-42e7-91f2-ef17fabf5589',
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Trabeculectomy (Glaucoma)', CURRENT_DATE - 20, 'OD',
    '["Use Ciprofloxacin drops 4x daily for 2 weeks","Use Prednisolone drops 6x daily for 1 month","Bleb massage as instructed","Report if bleb deflates or pain worsens"]',
    '["No heavy lifting for 6 weeks","Avoid swimming for 6 weeks","Avoid eye rubbing","Protect from trauma"]',
    'active',
    NOW() - INTERVAL '20 days', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
),

-- postop-07: Squint Divya (p-07)
(
    'fff00001-0000-0000-0000-000000000007',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '4ed5a3f2-92f4-43cb-86fe-99c496923f4e',
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
    'Squint Correction (Strabismus)', CURRENT_DATE - 25, 'OS',
    '["Use Tobramycin drops 4x daily for 2 weeks","Wear patch as prescribed for amblyopia therapy","Eye exercises as instructed by orthoptist"]',
    '["Avoid swimming for 2 weeks","No contact sports for 2 weeks","No dusty environments"]',
    'active',
    NOW() - INTERVAL '25 days', '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW()
)

ON CONFLICT (id) DO UPDATE SET
    surgery_date   = EXCLUDED.surgery_date,
    instructions   = EXCLUDED.instructions,
    restrictions   = EXCLUDED.restrictions,
    updated_at     = NOW();


-- ==============================================================================
-- STEP 7: Post-Op Visits for each care schedule
--
-- postop-01 (Lakshmi Cataract, 1 day ago):
--   Day 1 = TODAY (pending), 1 Week = +6d, 1 Month = +29d, 3 Months = +2mo
--
-- postop-02 (Raj LASIK, 3 days ago):
--   Day 1 = 2 days ago (completed), 1 Week = 4d from now
--
-- postop-03 (Nalini ICL, 5 days ago):
--   Day 1 = 4 days ago (completed), 1 Week = 2d from now
--
-- postop-04 (Vinayak Retinal, 8 days ago):
--   Day 1 = 7 days ago (completed, complication noted), 1 Week = 1d from now
--
-- postop-05 (Sunita Cataract, 12 days ago):
--   Day 1 = 11d ago (completed), 1 Week = 5d ago (completed)
--
-- postop-06 (Harish Glaucoma, 20 days ago):
--   Day 1 = 19d ago (completed), 1 Week = 13d ago (completed), 1 Month = 10d from now
--
-- postop-07 (Divya Squint, 25 days ago):
--   Day 1 = 24d ago (completed), 1 Week = 18d ago (completed)
-- ==============================================================================

INSERT INTO post_op_visit (
    id, tenant_id, schedule_id,
    visit_name, scheduled_date,
    completed, completed_date, findings, visual_acuity, iop, complications,
    created_at, created_by_user_id, updated_at
) VALUES

-- postop-01: Lakshmi visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000001', 'Day 1 Post-Op',  CURRENT_DATE,      FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000001', '1 Week Post-Op', CURRENT_DATE + 6,  FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000001', '1 Month Post-Op',CURRENT_DATE + 29, FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000001', '3 Months Post-Op',CURRENT_DATE + 89,FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),

-- postop-02: Raj LASIK visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000002', 'Day 1 Post-Op',  CURRENT_DATE - 2, TRUE,  NOW() - INTERVAL '2 days', 'Clear cornea, no haze. Patient reports improved vision.', '6/6 OU', '14', NULL, NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000002', '1 Week Post-Op', CURRENT_DATE + 4, FALSE, NULL, NULL, NULL, NULL, NULL,          NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000002', '1 Month Post-Op',CURRENT_DATE + 25,FALSE, NULL, NULL, NULL, NULL, NULL,          NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),

-- postop-03: Nalini ICL visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000003', 'Day 1 Post-Op',  CURRENT_DATE - 4, TRUE,  NOW() - INTERVAL '4 days', 'ICL well-centred. IOP elevated at 28mmHg, started aceclo.', '6/12 OS', '28', 'Transient IOP spike 28mmHg - managed with Aceclo eye drops. Resolved within 4 hours.', NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000003', '1 Week Post-Op', CURRENT_DATE + 2, FALSE, NULL, NULL, NULL, NULL, NULL,          NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000003', '1 Month Post-Op',CURRENT_DATE + 23,FALSE, NULL, NULL, NULL, NULL, NULL,          NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),

-- postop-04: Vinayak Retinal visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000004', 'Day 1 Post-Op',  CURRENT_DATE - 7, TRUE,  NOW() - INTERVAL '7 days', 'Retina attached. Gas bubble present 80%. Patient maintaining face-down posture. IOP = 18.', '1/60 OD (gas obscuring)', '18', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000004', '1 Week Post-Op', CURRENT_DATE + 1, FALSE, NULL, NULL, NULL, NULL, NULL,          NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000004', '1 Month Post-Op',CURRENT_DATE + 21,FALSE, NULL, NULL, NULL, NULL, NULL,          NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),

-- postop-05: Sunita Cataract visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000005', 'Day 1 Post-Op',  CURRENT_DATE - 11, TRUE, NOW() - INTERVAL '11 days', 'Anterior chamber clear. IOL in place. No flare or cells.', '6/9 OD', '16', NULL, NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000005', '1 Week Post-Op', CURRENT_DATE - 5,  TRUE, NOW() - INTERVAL '5 days',  'Good recovery. IOL well-centred. Reduced steroid to 2x daily.', '6/6 OD', '14', NULL, NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000005', '1 Month Post-Op', CURRENT_DATE + 17,FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000005', '3 Months Post-Op',CURRENT_DATE + 77,FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),

-- postop-06: Harish Glaucoma visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000006', 'Day 1 Post-Op',  CURRENT_DATE - 19, TRUE, NOW() - INTERVAL '19 days', 'Bleb present, diffuse. IOP 8.', '6/12 OD', '8', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000006', '1 Week Post-Op', CURRENT_DATE - 13, TRUE, NOW() - INTERVAL '13 days', 'Bleb well-positioned. IOP 10. Continue 5-FU massage.', '6/9 OD', '10', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000006', '1 Month Post-Op', CURRENT_DATE + 10,FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000006', '3 Months Post-Op',CURRENT_DATE + 70,FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),

-- postop-07: Divya Squint visits
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000007', 'Day 1 Post-Op',  CURRENT_DATE - 24, TRUE, NOW() - INTERVAL '24 days', 'Alignment improved. Mild chemosis resolving.', '6/12 OS', '15', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000007', '1 Week Post-Op', CURRENT_DATE - 18, TRUE, NOW() - INTERVAL '18 days', 'Alignment stable. Good fusion noted. Patient doing patch therapy.', '6/9 OS', '14', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000007', '1 Month Post-Op', CURRENT_DATE - 0,  FALSE, NULL, NULL, NULL, NULL, NULL,         NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() );


-- ==============================================================================
-- STEP 8: Post-Op Medications
-- ==============================================================================

INSERT INTO post_op_medication (
    id, tenant_id, schedule_id,
    medication_name, dosage, frequency, start_date, end_date,
    adherence, adherence_notes, last_refill_date,
    created_at, created_by_user_id, updated_at
) VALUES

-- Lakshmi Cataract (postop-01)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000001', 'Tobramycin 0.3% Eye Drops',     '1 drop', '4 times daily', CURRENT_DATE - 1, CURRENT_DATE + 13, 'unknown', NULL, NULL, NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000001', 'Prednisolone 1% Eye Drops',      '1 drop', '4 times daily → taper', CURRENT_DATE - 1, CURRENT_DATE + 27, 'unknown', NULL, NULL, NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),

-- Raj LASIK (postop-02)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000002', 'Moxifloxacin 0.5% Eye Drops',   '1 drop', '3 times daily for 7 days', CURRENT_DATE - 3, CURRENT_DATE + 4, 'good', NULL, NULL, NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000002', 'Carboxymethyl Cellulose Drops',  '1 drop', 'Every 1 hour',          CURRENT_DATE - 3, CURRENT_DATE + 3, 'good', NULL, CURRENT_DATE - 1, NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),

-- Nalini ICL (postop-03)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000003', 'Prednisolone 1% Eye Drops',      '1 drop', '4 times daily → taper over 4 weeks', CURRENT_DATE - 5, CURRENT_DATE + 23, 'moderate', 'Patient reports forgetting night dose occasionally', NULL, NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000003', 'Aceclo Eye Drops 0.1%',          '1 drop', 'As needed (IOP > 24)',   CURRENT_DATE - 5, CURRENT_DATE + 25, 'good', NULL, NULL, NOW(), '251ff397-c62a-4469-af48-b118b75058f9', NOW() ),

-- Vinayak Retinal (postop-04)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000004', 'Ciprofloxacin 0.3% Eye Drops',  '1 drop', '4 times daily', CURRENT_DATE - 8, CURRENT_DATE + 6, 'poor', 'Patient struggling with face-down posture compliance - may affect medication schedule too', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000004', 'Prednisolone 1% Eye Drops',      '1 drop', '6 times daily for 1 week then 4 times daily', CURRENT_DATE - 8, CURRENT_DATE + 22, 'poor', 'Adherence difficult due to posturing requirement', NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),

-- Sunita Cataract (postop-05)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000005', 'Tobramycin 0.3% Eye Drops',     '1 drop', '4 times daily', CURRENT_DATE - 12, CURRENT_DATE + 2, 'good', NULL, CURRENT_DATE - 4, NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000005', 'Prednisolone 1% Eye Drops',      '1 drop', '2 times daily (reduced)', CURRENT_DATE - 5, CURRENT_DATE + 15, 'good', NULL, NULL, NOW(), '6937802a-a536-46c1-8825-125e71b01e44', NOW() ),

-- Harish Glaucoma (postop-06)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000006', 'Ciprofloxacin 0.3% Eye Drops',  '1 drop', '4 times daily for 2 weeks', CURRENT_DATE - 20, CURRENT_DATE - 6, 'good', NULL,        CURRENT_DATE - 15, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000006', 'Prednisolone 1% Eye Drops',      '1 drop', '6 times daily → tapering', CURRENT_DATE - 20, CURRENT_DATE + 10, 'moderate', 'Missed a few doses over the weekend', CURRENT_DATE - 8, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() ),

-- Divya Squint (postop-07)
( gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'fff00001-0000-0000-0000-000000000007', 'Tobramycin 0.3% Eye Drops',     '1 drop', '4 times daily for 2 weeks', CURRENT_DATE - 25, CURRENT_DATE - 11, 'good', NULL, NULL, NOW(), '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81', NOW() );


-- ==============================================================================
-- STEP 9: Patient Consents — SKIPPED
-- patient_consents.session_id is NOT NULL and requires a valid counseling
-- session. The three primary tabs (Surgery Confirmed, Pre-Surgery Followup,
-- Post-Surgery Followup) are fully seeded above without needing consents.
-- Consents can be seeded separately if the ConsentStatusWidget needs testing.
-- ==============================================================================

-- ==============================================================================
-- SUMMARY REPORT
-- ==============================================================================
SELECT '=== SEED COMPLETE ===' AS status;

SELECT 'ot_schedules (Booked/Confirmed)' AS thing,
       COUNT(*) AS count
FROM ot_schedules
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND status IN ('Booked','Confirmed')
  AND deleted_at IS NULL;

SELECT 'ot_schedules (Completed last 30d)' AS thing,
       COUNT(*) AS count
FROM ot_schedules
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND status = 'Completed'
  AND scheduled_date >= CURRENT_DATE - 30
  AND deleted_at IS NULL;

SELECT 'counseling_sessions (Completed+Pending)' AS thing,
       COUNT(*) AS count
FROM counseling_sessions
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND status = 'Completed'
  AND pending_decision = TRUE
  AND deleted_at IS NULL;

SELECT 'post_op_care_schedule' AS thing, COUNT(*) AS count
FROM post_op_care_schedule
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' AND deleted_at IS NULL;

SELECT 'patient_consents' AS thing, COUNT(*) AS count
FROM patient_consents
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' AND deleted_at IS NULL;

COMMIT;
