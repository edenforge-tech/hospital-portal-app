-- Update System Administrator to India Eye Hospital Network tenant
UPDATE users 
SET tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
WHERE id IN (
  SELECT id 
  FROM users 
  WHERE tenant_id::text = '11111111-1111-1111-1111-111111111111' 
  LIMIT 1
);

-- Show result
SELECT 
  'Updated:' as status,
  id::text as user_id,
  email, 
  tenant_id::text as new_tenant_id,
  'India Eye Hospital Network' as tenant_name
FROM users 
WHERE id IN (
  SELECT id 
  FROM users 
  WHERE tenant_id::text = '155fe198-6ae5-4a01-9254-ead5b427247e' 
  ORDER BY created_at DESC
  LIMIT 1
);
