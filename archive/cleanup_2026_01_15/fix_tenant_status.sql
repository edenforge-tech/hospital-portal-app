-- Update all inactive tenants to Active status
UPDATE tenant 
SET status = 'Active', is_active = true, updated_at = CURRENT_TIMESTAMP 
WHERE status = 'Inactive' OR is_active = false;

-- Verify the update
SELECT id, name, tenant_code, status, is_active FROM tenant;
