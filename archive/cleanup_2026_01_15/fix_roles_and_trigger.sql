-- Update all roles to the correct tenant ID (snake_case for app_roles)
UPDATE app_roles SET tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Verify the updates
SELECT COUNT(*) as total_permissions FROM permissions WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e';
SELECT COUNT(*) as total_roles FROM app_roles WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Recreate the audit trigger on permissions table
DROP TRIGGER IF EXISTS audit_permissions_changes ON permissions;
CREATE TRIGGER audit_permissions_changes
    AFTER INSERT OR UPDATE OR DELETE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION audit_changes_comprehensive();
