-- ============================================================
-- Phase 1.2: Seed 3 counseling sessions (separate transactions to avoid
-- session_number sequence collision within same transaction)
-- ============================================================

-- Disable session number trigger temporarily for seeding
ALTER TABLE counseling_sessions DISABLE TRIGGER generate_session_number_trigger;

-- Session 2: Insurance patient (session 1 already seeded: ee500001-...-001)
INSERT INTO counseling_sessions (
  id, tenant_id, branch_id, patient_id, referred_by_doctor_id, session_date,
  session_number,
  patient_type, package_amount, recommended_procedures,
  video_consent_recorded, patient_present, attender_is_decision_maker,
  anesthesia_consent, escalation_status, contact_attempt_count,
  created_at, updated_at, status
) VALUES (
  'ee500001-0000-0000-0000-000000000002',
  '155fe198-6ae5-4a01-9254-ead5b427247e',
  '74c014cf-9570-4824-bdf9-b369ea11a8f4',
  '381e8ddb-27d9-4525-b497-cdfe3ec8dd4a',
  '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
  '2026-03-20',
  'CS-DOWNTOWN_H-20260320-0002',
  'Insurance',
  45000.00,
  '["Phacoemulsification (Left Eye)", "IOL Implant (Toric Premium)"]',
  true, true, false,
  true, 'Normal', 1,
  NOW(), NOW(), 'Completed'
);

-- Session 3: CGHS patient
INSERT INTO counseling_sessions (
  id, tenant_id, branch_id, patient_id, referred_by_doctor_id, session_date,
  session_number,
  patient_type, package_amount, recommended_procedures,
  video_consent_recorded, patient_present, attender_is_decision_maker,
  anesthesia_consent, escalation_status, contact_attempt_count,
  created_at, updated_at, status
) VALUES (
  'ee500001-0000-0000-0000-000000000003',
  '155fe198-6ae5-4a01-9254-ead5b427247e',
  '74c014cf-9570-4824-bdf9-b369ea11a8f4',
  '17ac2c40-20ab-4f3a-be5d-947cc58785d1',
  '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
  '2026-03-20',
  'CS-DOWNTOWN_H-20260320-0003',
  'CGHS',
  NULL,
  '["Trabeculectomy (Right Eye)"]',
  false, false, true,
  false, 'Normal', 2,
  NOW(), NOW(), 'Completed'
);

-- Re-enable trigger
ALTER TABLE counseling_sessions ENABLE TRIGGER generate_session_number_trigger;

-- Link sessions to their OT schedules
UPDATE ot_schedules SET session_id = 'ee500001-0000-0000-0000-000000000001' WHERE id = 'ccc00001-0000-0000-0000-000000000001';
UPDATE ot_schedules SET session_id = 'ee500001-0000-0000-0000-000000000002' WHERE id = 'ccc00001-0000-0000-0000-000000000002';
UPDATE ot_schedules SET session_id = 'ee500001-0000-0000-0000-000000000003' WHERE id = 'ccc00001-0000-0000-0000-000000000003';

-- Verify
SELECT s.id AS sched_id, s.status AS sched_status, cs.patient_type, cs.package_amount, cs.session_number
FROM ot_schedules s
JOIN counseling_sessions cs ON cs.id = s.session_id
WHERE s.id IN (
  'ccc00001-0000-0000-0000-000000000001',
  'ccc00001-0000-0000-0000-000000000002',
  'ccc00001-0000-0000-0000-000000000003'
);
INSERT INTO counseling_sessions (
  id, tenant_id, branch_id, patient_id, referred_by_doctor_id, session_date,
  patient_type, package_amount, recommended_procedures,
  video_consent_recorded, patient_present, attender_is_decision_maker,
  anesthesia_consent, escalation_status, contact_attempt_count,
  created_at, updated_at, status
) VALUES (
  'ee500001-0000-0000-0000-000000000001',
  '155fe198-6ae5-4a01-9254-ead5b427247e',
  '74c014cf-9570-4824-bdf9-b369ea11a8f4',
  '3dac80b6-82e3-4043-86aa-c83a7d4e346a',
  '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
  '2026-03-20',
  'Cash',
  NULL,
  '["Phacoemulsification (Right Eye)", "IOL Implant (Monofocal)"]',
  false, true, true,
  false, 'Normal', 1,
  NOW(), NOW(), 'Completed'
);

-- Session 2: Insurance patient
INSERT INTO counseling_sessions (
  id, tenant_id, branch_id, patient_id, referred_by_doctor_id, session_date,
  patient_type, package_amount, recommended_procedures,
  video_consent_recorded, patient_present, attender_is_decision_maker,
  anesthesia_consent, escalation_status, contact_attempt_count,
  created_at, updated_at, status
) VALUES (
  'ee500001-0000-0000-0000-000000000002',
  '155fe198-6ae5-4a01-9254-ead5b427247e',
  '74c014cf-9570-4824-bdf9-b369ea11a8f4',
  '381e8ddb-27d9-4525-b497-cdfe3ec8dd4a',
  '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
  '2026-03-20',
  'Insurance',
  45000.00,
  '["Phacoemulsification (Left Eye)", "IOL Implant (Toric Premium)"]',
  true, true, false,
  true, 'Normal', 1,
  NOW(), NOW(), 'Completed'
);

-- Session 3: CGHS patient
INSERT INTO counseling_sessions (
  id, tenant_id, branch_id, patient_id, referred_by_doctor_id, session_date,
  patient_type, package_amount, recommended_procedures,
  video_consent_recorded, patient_present, attender_is_decision_maker,
  anesthesia_consent, escalation_status, contact_attempt_count,
  created_at, updated_at, status
) VALUES (
  'ee500001-0000-0000-0000-000000000003',
  '155fe198-6ae5-4a01-9254-ead5b427247e',
  '74c014cf-9570-4824-bdf9-b369ea11a8f4',
  '17ac2c40-20ab-4f3a-be5d-947cc58785d1',
  '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81',
  '2026-03-20',
  'CGHS',
  NULL,
  '["Trabeculectomy (Right Eye)"]',
  false, false, true,
  false, 'Normal', 2,
  NOW(), NOW(), 'Completed'
);

-- Link sessions to their OT schedules
UPDATE ot_schedules SET session_id = 'ee500001-0000-0000-0000-000000000001' WHERE id = 'ccc00001-0000-0000-0000-000000000001';
UPDATE ot_schedules SET session_id = 'ee500001-0000-0000-0000-000000000002' WHERE id = 'ccc00001-0000-0000-0000-000000000002';
UPDATE ot_schedules SET session_id = 'ee500001-0000-0000-0000-000000000003' WHERE id = 'ccc00001-0000-0000-0000-000000000003';

-- Verify
SELECT s.id AS sched_id, s.status AS sched_status, cs.patient_type, cs.package_amount
FROM ot_schedules s
JOIN counseling_sessions cs ON cs.id = s.session_id
WHERE s.id IN (
  'ccc00001-0000-0000-0000-000000000001',
  'ccc00001-0000-0000-0000-000000000002',
  'ccc00001-0000-0000-0000-000000000003'
);
