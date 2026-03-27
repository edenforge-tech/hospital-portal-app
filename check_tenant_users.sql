-- Count users per tenant
SELECT t.name, t.id, COUNT(u.id) as user_count
FROM tenant t
LEFT JOIN users u ON u.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name
ORDER BY user_count DESC;
