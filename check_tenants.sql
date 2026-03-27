-- Check tenants and surgery_types tenant distribution
SELECT 'tenants' AS tbl, id, name FROM tenant WHERE deleted_at IS NULL;
SELECT 'surgery_types_tenant_dist' AS tbl, tenant_id, COUNT(*) FROM surgery_types WHERE deleted_at IS NULL AND is_active = TRUE GROUP BY tenant_id;
SELECT 'admin_user_tenant' AS tbl, email, tenant_id FROM users WHERE email = 'admin@test.com';
