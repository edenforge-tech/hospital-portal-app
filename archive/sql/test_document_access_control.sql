-- ============================================
-- TEST DOCUMENT ACCESS CONTROL FUNCTION
-- ============================================

-- Test the check_document_access function with different scenarios
DO $$
DECLARE
    v_user_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd'; -- Existing user
    v_document_id UUID;
    v_result RECORD;
BEGIN
    RAISE NOTICE 'Testing Document Access Control Function';
    RAISE NOTICE '==============================================';

    -- Test 1: Admin accessing medical history (should succeed - role access)
    SELECT id INTO v_document_id FROM patient_document_uploads WHERE document_type = 'Medical History' LIMIT 1;
    SELECT * INTO v_result FROM check_document_access(v_user_id, v_document_id, 'read');
    RAISE NOTICE 'Test 1 - Admin reading Medical History: Access=%', v_result.access_granted;

    -- Test 2: Admin accessing billing document (should succeed - role access)
    SELECT id INTO v_document_id FROM patient_document_uploads WHERE document_type = 'Billing Statements' LIMIT 1;
    SELECT * INTO v_result FROM check_document_access(v_user_id, v_document_id, 'read');
    RAISE NOTICE 'Test 2 - Admin reading Billing Statement: Access=%', v_result.access_granted;

    -- Test 3: Admin accessing public patient photo (should succeed - public access)
    SELECT id INTO v_document_id FROM patient_document_uploads WHERE document_type = 'Patient Photos' LIMIT 1;
    SELECT * INTO v_result FROM check_document_access(v_user_id, v_document_id, 'read');
    RAISE NOTICE 'Test 3 - Admin reading Public Photo: Access=%', v_result.access_granted;

    -- Test 4: Admin trying to modify medical history (should fail - restricted modification)
    SELECT id INTO v_document_id FROM patient_document_uploads WHERE document_type = 'Medical History' LIMIT 1;
    SELECT * INTO v_result FROM check_document_access(v_user_id, v_document_id, 'update');
    RAISE NOTICE 'Test 4 - Admin modifying Medical History: Access=%', v_result.access_granted;

    RAISE NOTICE 'Access control tests completed successfully!';
END $$;

-- ============================================
-- SHOW DOCUMENT ACCESS SUMMARY
-- ============================================

-- Show all documents with their access control details
SELECT
    pdu.document_title,
    pdu.document_type,
    dt.category,
    pdu.is_public,
    CASE
        WHEN pdu.is_public THEN 'Public Access'
        WHEN pdu.shared_to_departments IS NOT NULL THEN 'Department Restricted'
        WHEN pdu.shared_to_roles IS NOT NULL THEN 'Role Restricted'
        ELSE 'Private'
    END as access_level,
    dsp.sharing_level,
    array_length(dsp.allowed_roles, 1) as allowed_role_count,
    dsp.allowed_roles
FROM patient_document_uploads pdu
LEFT JOIN document_type dt ON pdu.document_type = dt.name
LEFT JOIN document_sharing_policies dsp ON dt.name = dsp.document_type
ORDER BY dt.category, pdu.document_type;

-- Show sharing statistics
SELECT
    'Total Documents' as metric,
    COUNT(*) as count
FROM patient_document_uploads
UNION ALL
SELECT
    'Public Documents' as metric,
    COUNT(*) as count
FROM patient_document_uploads WHERE is_public = true
UNION ALL
SELECT
    'Department-Shared Documents' as metric,
    COUNT(*) as count
FROM patient_document_uploads WHERE shared_to_departments IS NOT NULL
UNION ALL
SELECT
    'Role-Shared Documents' as metric,
    COUNT(*) as count
FROM patient_document_uploads WHERE shared_to_roles IS NOT NULL
UNION ALL
SELECT
    'Private Documents' as metric,
    COUNT(*) as count
FROM patient_document_uploads
WHERE shared_to_departments IS NULL
  AND shared_to_roles IS NULL
  AND is_public = false;