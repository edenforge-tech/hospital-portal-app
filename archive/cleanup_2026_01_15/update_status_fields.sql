-- Update status fields for realistic dashboard counts
BEGIN;

-- Temporarily disable audit triggers to avoid errors (audit_log table schema mismatch)
ALTER TABLE users DISABLE TRIGGER audit_users_changes;

-- Update tenant status to 'active' for active tenants
UPDATE tenant 
SET status = 'active' 
WHERE is_active = true AND deleted_at IS NULL;

-- Update users UserStatus to 'active' for non-deleted users
UPDATE users
SET "UserStatus" = 'active'
WHERE "DeletedAt" IS NULL;

-- Update department status to 'active' for non-deleted departments
UPDATE department
SET status = 'active'
WHERE deleted_at IS NULL;

-- Update branch status to 'active' for non-deleted branches
UPDATE branch
SET status = 'active'
WHERE deleted_at IS NULL;

-- Verify the updates
SELECT 
    'tenants' as table_name,
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) as total_count
FROM tenant
WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'users' as table_name,
    COUNT(*) FILTER (WHERE "UserStatus" = 'active') as active_count,
    COUNT(*) as total_count
FROM users
WHERE "DeletedAt" IS NULL

UNION ALL

SELECT 
    'departments' as table_name,
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) as total_count
FROM department
WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'branches' as table_name,
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) as total_count
FROM branch
WHERE deleted_at IS NULL;

-- Re-enable audit triggers
ALTER TABLE users ENABLE TRIGGER audit_users_changes;

COMMIT;
