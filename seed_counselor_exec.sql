-- STEP 1: Create 3 OT Theaters for tenant 155fe198
INSERT INTO ot_theaters (id, tenant_id, branch_id, theater_name, theater_code, specialization, is_active, is_operational, created_at, created_by_user_id)
VALUES
  ('aaa00001-0000-0000-0000-000000000001', '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4', 'Operating Theater 1', 'OT-01', 'Ophthalmology', true, true, NOW(), '019c88f8-a202-70ec-b486-d0ff3290f04c'),
  ('aaa00001-0000-0000-0000-000000000002', '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4', 'Operating Theater 2', 'OT-02', 'Ophthalmology', true, true, NOW(), '019c88f8-a202-70ec-b486-d0ff3290f04c'),
  ('aaa00001-0000-0000-0000-000000000003', '155fe198-6ae5-4a01-9254-ead5b427247e', '74c014cf-9570-4824-bdf9-b369ea11a8f4', 'Laser Suite', 'OT-03', 'Laser Surgery', true, true, NOW(), '019c88f8-a202-70ec-b486-d0ff3290f04c')
ON CONFLICT (id) DO NOTHING;