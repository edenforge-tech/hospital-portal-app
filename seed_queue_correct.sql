-- Fix admin user branch assignment
UPDATE users SET "BranchId" = '74c014cf-9570-4824-bdf9-b369ea11a8f4' 
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

-- Clean up old seeds (wrong tenant)
DELETE FROM counselor_queue WHERE id IN (
  '22222222-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000002',
  '22222222-0000-0000-0000-000000000003'
);
DELETE FROM counseling_sessions WHERE id IN (
  '11111111-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000003'
);

-- Seed counseling_sessions with correct tenant + branch + patients
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e (India Eye Hospital Network)
-- Branch: 74c014cf-9570-4824-bdf9-b369ea11a8f4 (Downtown Hospital)
-- Counselor: dddddddd-dddd-dddd-dddd-dddddddddddd (admin user)
-- Patients in this tenant: 5ea61d5d-..., 949c297f-..., e562b1cf-...
SET row_security = off;

INSERT INTO counseling_sessions (
  id, tenant_id, branch_id, patient_id, referred_by_doctor_id, counselor_id,
  session_number, session_type, session_date, patient_type, urgency, status,
  current_stage, package_discussed, patient_agreed_to_surgery, pending_decision,
  created_at, created_by_user_id, updated_at, updated_by_user_id
) VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '5ea61d5d-eeae-4e2b-8302-376c2d4e32d3',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'CS-2026-001', 'Urgent', CURRENT_DATE, 'Insurance', 'Urgent', 'Scheduled',
    'Initial', false, false, true,
    NOW(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW(), 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '949c297f-fab4-4008-9833-29744bb6fb15',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'CS-2026-002', 'Initial', CURRENT_DATE, 'Cash', 'Routine', 'Scheduled',
    'Initial', false, false, true,
    NOW(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW(), 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    'e562b1cf-541d-44af-baed-9990646cbe2c',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'CS-2026-003', 'Followup', CURRENT_DATE, 'CoPay', 'Routine', 'Scheduled',
    'Initial', false, false, true,
    NOW(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW(), 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  );

-- Seed counselor_queue linked to those sessions
INSERT INTO counselor_queue (
  id, tenant_id, branch_id, session_id, patient_id, token_number,
  queue_type, queue_position, priority_score, urgency_level,
  added_to_queue_at, estimated_wait_minutes, status, created_at
) VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '11111111-0000-0000-0000-000000000001',
    '5ea61d5d-eeae-4e2b-8302-376c2d4e32d3',
    'T-001', 'Counseling', 1, 85.00, 'High',
    NOW() - INTERVAL '25 minutes', 25, 'Waiting', NOW()
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '11111111-0000-0000-0000-000000000002',
    '949c297f-fab4-4008-9833-29744bb6fb15',
    'T-002', 'Counseling', 2, 55.00, 'Normal',
    NOW() - INTERVAL '18 minutes', 18, 'Waiting', NOW()
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    '74c014cf-9570-4824-bdf9-b369ea11a8f4',
    '11111111-0000-0000-0000-000000000003',
    'e562b1cf-541d-44af-baed-9990646cbe2c',
    'T-003', 'Counseling', 3, 30.00, 'Low',
    NOW() - INTERVAL '10 minutes', 10, 'Waiting', NOW()
  );

-- Verify
SELECT 'Counseling Sessions:' as info, COUNT(*) as count FROM counseling_sessions WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' AND id IN ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000003');
SELECT 'Queue Items:' as info, COUNT(*) as count FROM counselor_queue WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' AND id IN ('22222222-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000003');
SELECT 'Admin BranchId:' as info, "BranchId"::text as branch FROM users WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
