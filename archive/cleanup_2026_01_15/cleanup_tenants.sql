-- =====================================================
-- CLEANUP: Keep only India Eye Hospital Network
-- =====================================================
-- Date: December 16, 2025
-- Purpose: Remove duplicate/test tenants, keep only INDIA_EYE_NET
-- =====================================================

BEGIN;

-- First, let's see all tenants
SELECT id, name, tenant_code, status, subscription_type
FROM tenant
ORDER BY created_at;

-- Keep only India Eye Hospital Network (INDIA_EYE_NET)
-- Delete all other tenants

-- Note: Due to CASCADE constraints, this will also delete:
-- - All users belonging to these tenants
-- - All branches, departments, organizations
-- - All related data

-- Delete tenants that are NOT India Eye Hospital Network
DELETE FROM tenant
WHERE tenant_code != 'INDIA_EYE_NET'
   OR tenant_code IS NULL;

-- Verify remaining tenant
SELECT id, name, tenant_code, status, subscription_type, max_users
FROM tenant;

COMMIT;

-- =====================================================
-- EXPECTED RESULT: Only 1 tenant remains
-- Name: India Eye Hospital Network
-- Code: INDIA_EYE_NET
-- =====================================================
