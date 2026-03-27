-- ============================================================================
-- SEED TEST QUEUE ITEMS FOR DOCTOR'S DESK TESTING
-- ============================================================================
-- Purpose: Create 3 test queue items that match the frontend mock data
-- Use Case: Testing Doctor's Desk with real backend API
-- ============================================================================

-- First, ensure we have test patients
INSERT INTO patient (id, tenant_id, first_name, last_name, date_of_birth, gender, contact_number, mrn, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Ramesh', 'Kumar', '1959-01-15', 'Male', '9876543210', 'MRN001234', 'active', NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Lakshmi', 'Devi', '1966-03-20', 'Female', '9876543211', 'MRN005678', 'active', NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Suresh', 'Babu', '1952-08-10', 'Male', '9876543212', 'MRN009012', 'active', NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e')
ON CONFLICT (id) DO NOTHING;

-- Create queue items that match frontend mock data
INSERT INTO queue_item (id, patient_id, tenant_id, queue_type, status, priority, urgency, checked_in_at, token_number, doctor_id, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES 
  -- Patient 1: Ramesh Kumar (Routine, Waiting)
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Doctor', 'Waiting', 2, 'Routine', NOW() - INTERVAL '15 minutes', 'D001', NULL, NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e'),
  
  -- Patient 2: Lakshmi Devi (Emergency, Waiting)
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Doctor', 'Waiting', 0, 'Emergency', NOW() - INTERVAL '5 minutes', 'D002', NULL, NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e'),
  
  -- Patient 3: Suresh Babu (Urgent, Waiting)
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Doctor', 'Waiting', 1, 'Urgent', NOW() - INTERVAL '8 minutes', 'D003', NULL, NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e')
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 
  qi.id,
  qi.token_number,
  p.first_name || ' ' || p.last_name AS patient_name,
  p.mrn,
  qi.urgency,
  qi.status,
  qi.checked_in_at
FROM queue_item qi
JOIN patient p ON qi.patient_id = p.id
WHERE qi.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY qi.priority, qi.checked_in_at;

SELECT '✅ Test queue items created successfully!' AS result;
