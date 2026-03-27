-- ============================================================================
-- SEED TEST QUEUE ITEMS FOR DOCTOR'S DESK TESTING (FIXED VERSION)
-- ============================================================================
-- Purpose: Create 3 test queue items that match the actual database schema
-- Use Case: Testing Doctor's Desk with real backend API
-- Schema: Matches QueueItem model and create_queue_item_table.sql
-- ============================================================================

-- Set tenant ID
DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    v_branch_id UUID;
    v_org_id UUID;
BEGIN
    -- Verify tenant exists
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE id = v_tenant_id) THEN
        RAISE EXCEPTION 'Tenant not found: %', v_tenant_id;
    END IF;
    
    -- Get or create organization
    SELECT id INTO v_org_id FROM organization WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_org_id IS NULL THEN
        INSERT INTO organization (id, tenant_id, name, organization_type, status, created_at, updated_at)
        VALUES (gen_random_uuid(), v_tenant_id, 'Test Hospital', 'Hospital', 'active', NOW(), NOW())
        RETURNING id INTO v_org_id;
        RAISE NOTICE 'Created organization: %', v_org_id;
    END IF;
    
    -- Get or create branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    IF v_branch_id IS NULL THEN
        INSERT INTO branch (id, tenant_id, organization_id, name, branch_type, region, is_main_branch, status, created_at, updated_at)
        VALUES (gen_random_uuid(), v_tenant_id, v_org_id, 'Main Branch', 'hospital', 'Central', true, 'active', NOW(), NOW())
        RETURNING id INTO v_branch_id;
        RAISE NOTICE 'Created branch: %', v_branch_id;
    END IF;
    
    RAISE NOTICE 'Using Tenant: %, Branch: %', v_tenant_id, v_branch_id;
END $$;

-- First, ensure we have test patients
INSERT INTO patient (id, tenant_id, first_name, last_name, date_of_birth, gender, contact_number, medical_record_number, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Ramesh', 'Kumar', '1959-01-15', 'Male', '9876543210', 'MRN001234', 'active', NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Lakshmi', 'Devi', '1966-03-20', 'Female', '9876543211', 'MRN005678', 'active', NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '155fe198-6ae5-4a01-9254-ead5b427247e', 'Suresh', 'Babu', '1952-08-10', 'Male', '9876543212', 'MRN009012', 'active', NOW(), NOW(), '155fe198-6ae5-4a01-9254-ead5b427247e', '155fe198-6ae5-4a01-9254-ead5b427247e')
ON CONFLICT (id) DO NOTHING;

-- Create queue items with correct schema (matches QueueItem model)
DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
    v_branch_id UUID;
    v_user_id UUID := '56eaf718-7180-44a4-9615-706b92ed6f8d';  -- receptionist1@hospital.com
BEGIN
    -- Get branch ID
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant %', v_tenant_id;
    END IF;
    
    -- Insert queue items
    INSERT INTO queue_item (
        id, 
        patient_id, 
        tenant_id, 
        branch_id,
        token_number,
        queue_type, 
        status, 
        priority,  -- STRING: 'normal', 'emergency', 'follow-up'
        checked_in_at, 
        created_at, 
        updated_at, 
        created_by_user_id, 
        updated_by_user_id
    )
    VALUES 
      -- Patient 1: Ramesh Kumar (Normal priority / Routine urgency)
      ('11111111-1111-1111-1111-111111111111', 
       'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
       v_tenant_id, 
       v_branch_id,
       'D001',
       'Doctor', 
       'waiting', 
       'normal',  -- String value
       NOW() - INTERVAL '15 minutes', 
       NOW(), 
       NOW(), 
       v_user_id, 
       v_user_id),
      
      -- Patient 2: Lakshmi Devi (Emergency priority)
      ('22222222-2222-2222-2222-222222222222', 
       'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
       v_tenant_id, 
       v_branch_id,
       'D002',
       'Doctor', 
       'waiting', 
       'emergency',  -- String value
       NOW() - INTERVAL '5 minutes', 
       NOW(), 
       NOW(), 
       v_user_id, 
       v_user_id),
      
      -- Patient 3: Suresh Babu (Follow-up priority / High IOP)
      ('33333333-3333-3333-3333-333333333333', 
       'cccccccc-cccc-cccc-cccc-cccccccccccc', 
       v_tenant_id, 
       v_branch_id,
       'D003',
       'Doctor', 
       'waiting', 
       'follow-up',  -- String value
       NOW() - INTERVAL '8 minutes', 
       NOW(), 
       NOW(), 
       v_user_id, 
       v_user_id)
    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW();
        
    RAISE NOTICE 'Queue items created/updated successfully with branch_id: %', v_branch_id;
END $$;

-- Verify the data
SELECT 
  qi.id,
  qi.token_number,
  p.first_name || ' ' || p.last_name AS patient_name,
  p.medical_record_number AS mrn,
  qi.priority,  -- Now VARCHAR: 'normal', 'emergency', 'follow-up'
  qi.status,
  qi.queue_type,
  qi.checked_in_at,
  EXTRACT(MINUTE FROM (NOW() - qi.checked_in_at)) AS wait_minutes
FROM queue_item qi
JOIN patient p ON qi.patient_id = p.id
WHERE qi.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY 
  CASE qi.priority
    WHEN 'emergency' THEN 0
    WHEN 'follow-up' THEN 1
    WHEN 'normal' THEN 2
  END,
  qi.checked_in_at;

SELECT '✅ Test queue items created successfully!' AS result;
SELECT '📋 Queue items match QueueItem C# model schema' AS note;
SELECT '🏥 Branch ID and organization created if missing' AS note2;
