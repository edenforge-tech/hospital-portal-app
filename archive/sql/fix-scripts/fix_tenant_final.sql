-- Move all surgery_types to the tenant that all users belong to
-- India Eye Hospital Network: 155fe198-6ae5-4a01-9254-ead5b427247e
-- CareFirst Clinic (wrong):   11b26293-9d9c-4633-927e-3294bff2a8d7

UPDATE surgery_types
SET tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e', updated_at = NOW()
WHERE tenant_id = '11b26293-9d9c-4633-927e-3294bff2a8d7'
  AND deleted_at IS NULL;

-- Verify
SELECT tenant_id, COUNT(*) FROM surgery_types
WHERE deleted_at IS NULL AND is_active = TRUE
GROUP BY tenant_id;
