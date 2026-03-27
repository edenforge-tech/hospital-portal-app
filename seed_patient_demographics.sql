-- Update 3 seeded patients with realistic demographics for counselor demo

-- Patient 1: John Doe (5ea61d5d-...) → Add address, emergency contact, proper phone
UPDATE patient SET
  "contactNumber" = '+91 98001 10001',
  "email" = 'john.doe@email.com',
  "addressLine1" = '45, Church Street',
  "address" = '45, Church Street, Bangalore, Karnataka - 560001',
  "country" = 'India',
  "pinCode" = '560001',
  "emergencyContactName" = 'Mary Doe',
  "emergencyContactPhone" = '+91 98001 10002',
  "emergencyContactRelationship" = 'Spouse',
  "updatedAt" = NOW()
WHERE id = '5ea61d5d-eeae-4e2b-8302-376c2d4e32d3';

-- Patient 2: Michael Johnson (949c297f-...) → Add address, emergency contact
UPDATE patient SET
  "contactNumber" = '+91 97002 20001',
  "email" = 'michael.johnson@email.com',
  "addressLine1" = '12, MG Road',
  "address" = '12, MG Road, Bangalore, Karnataka - 560001',
  "country" = 'India',
  "pinCode" = '560001',
  "emergencyContactName" = 'Sarah Johnson',
  "emergencyContactPhone" = '+91 97002 20002',
  "emergencyContactRelationship" = 'Spouse',
  "updatedAt" = NOW()
WHERE id = '949c297f-fab4-4008-9833-29744bb6fb15';

-- Patient 3: Jane Smith (e562b1cf-...) → Add address, emergency contact
UPDATE patient SET
  "contactNumber" = '+91 96003 30001',
  "email" = 'jane.smith@email.com',
  "addressLine1" = '8, Residency Road',
  "address" = '8, Residency Road, Bangalore, Karnataka - 560025',
  "country" = 'India',
  "pinCode" = '560025',
  "emergencyContactName" = 'Robert Smith',
  "emergencyContactPhone" = '+91 96003 30002',
  "emergencyContactRelationship" = 'Son',
  "updatedAt" = NOW()
WHERE id = 'e562b1cf-541d-44af-baed-9990646cbe2c';

-- Update counseling sessions with surgery recommendations
UPDATE counseling_sessions SET
  recommended_surgery = 'Cataract Surgery (Phacoemulsification)',
  urgency = 'Urgent',
  updated_at = NOW()
WHERE id = '11111111-0000-0000-0000-000000000001';

UPDATE counseling_sessions SET
  recommended_surgery = 'LASIK Surgery',
  urgency = 'Routine',
  updated_at = NOW()
WHERE id = '11111111-0000-0000-0000-000000000002';

UPDATE counseling_sessions SET
  recommended_surgery = 'Vitreoretinal Surgery',
  urgency = 'Routine',
  updated_at = NOW()
WHERE id = '11111111-0000-0000-0000-000000000003';

-- Verify
SELECT id, "firstName", "lastName", "contactNumber", "email", "address", "emergencyContactName", "emergencyContactPhone"
FROM patient
WHERE id IN ('5ea61d5d-eeae-4e2b-8302-376c2d4e32d3','949c297f-fab4-4008-9833-29744bb6fb15','e562b1cf-541d-44af-baed-9990646cbe2c');

SELECT id, recommended_surgery, urgency FROM counseling_sessions
WHERE id IN ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000003');
