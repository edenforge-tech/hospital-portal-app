-- Check surgery types for the tenant
SELECT 
    id,
    surgery_name,
    surgery_category,
    default_price,
    is_active,
    deleted_at,
    tenant_id
FROM surgery_type
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND deleted_at IS NULL
ORDER BY display_order, surgery_name
LIMIT 20;

-- Count total surgery types
SELECT 
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_count
FROM surgery_type
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';
