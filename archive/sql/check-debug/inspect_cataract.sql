-- Inspect current DB state for this tenant
SELECT surgery_code, surgery_name, surgery_category, requires_iol, default_price
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND deleted_at IS NULL AND is_active = TRUE
  AND surgery_category = 'Cataract'
ORDER BY display_order;
