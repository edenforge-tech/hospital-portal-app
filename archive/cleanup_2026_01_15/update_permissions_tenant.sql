-- Update all permissions to the correct tenant ID
UPDATE permissions SET "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Update all roles to the correct tenant ID
UPDATE app_roles SET "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Verify the updates
SELECT COUNT(*) as total_permissions FROM permissions WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e';
SELECT COUNT(*) as total_roles FROM app_roles WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e';
