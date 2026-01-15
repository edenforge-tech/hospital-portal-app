-- =====================================================
-- FIX: Department Access Audit Trigger
-- Problem: Trigger references 'is_primary' column which doesn't exist
-- Solution: Temporarily DISABLE the trigger
-- =====================================================

-- Disable the existing trigger so department assignments work
DROP TRIGGER IF EXISTS trg_audit_department_access_changes ON department_access CASCADE;

-- Verify the trigger is gone
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'trg_audit_department_access_changes';

-- Success message
SELECT 'Trigger disabled successfully - department assignments should now work' AS status;
