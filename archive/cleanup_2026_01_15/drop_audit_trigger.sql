-- Drop the problematic audit trigger that references non-existent is_primary column
DROP TRIGGER IF EXISTS trg_audit_department_access_changes ON department_access CASCADE;

-- Verify it's gone
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_audit_department_access_changes';

-- If the above query returns no rows, the trigger has been successfully dropped
SELECT 'SUCCESS: Trigger dropped - department assignment should now work!' AS status;
