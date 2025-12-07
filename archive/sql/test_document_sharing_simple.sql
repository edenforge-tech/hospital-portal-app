-- ============================================
-- CORRECTED DOCUMENT SHARING TEST
-- ============================================

-- ============================================
-- SIMPLE ACCESS TEST FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION test_document_access_simple()
RETURNS TABLE (
    test_description TEXT,
    result TEXT
) AS $$
DECLARE
    v_document_count INTEGER;
    v_policy_count INTEGER;
    v_sharing_docs INTEGER;
BEGIN
    -- Count documents
    SELECT COUNT(*) INTO v_document_count FROM patient_document_uploads;
    RETURN QUERY SELECT 'Total documents in system'::TEXT, v_document_count::TEXT;

    -- Count sharing policies
    SELECT COUNT(*) INTO v_policy_count FROM document_sharing_policies;
    RETURN QUERY SELECT 'Document sharing policies'::TEXT, v_policy_count::TEXT;

    -- Count documents with sharing rules
    SELECT COUNT(*) INTO v_sharing_docs
    FROM patient_document_uploads
    WHERE shared_to_departments IS NOT NULL OR shared_to_roles IS NOT NULL OR is_public = true;
    RETURN QUERY SELECT 'Documents with sharing rules'::TEXT, v_sharing_docs::TEXT;

    -- Test sharing policy view
    RETURN QUERY SELECT 'Sharing policy categories'::TEXT,
        string_agg(DISTINCT category, ', ' ORDER BY category) as result
    FROM document_sharing_policies;

END $$ LANGUAGE plpgsql;

-- ============================================
-- RUN SIMPLE TESTS
-- ============================================

SELECT * FROM test_document_access_simple();

-- ============================================
-- SHOW DOCUMENT SHARING STATUS
-- ============================================

-- Show document types and their sharing levels
SELECT
    dt.name as document_type,
    dt.category,
    dsp.sharing_level,
    dsp.allowed_roles,
    dsp.emergency_access_allowed
FROM document_type dt
LEFT JOIN document_sharing_policies dsp ON dt.name = dsp.document_type
ORDER BY dt.category, dt.name;

-- Show sample documents with sharing info
SELECT
    pdu.title,
    pdu.document_type,
    pdu.is_public,
    pdu.shared_to_departments,
    pdu.shared_to_roles,
    CASE
        WHEN pdu.is_public THEN 'Public'
        WHEN pdu.shared_to_departments IS NOT NULL OR pdu.shared_to_roles IS NOT NULL THEN 'Shared'
        ELSE 'Private'
    END as sharing_status
FROM patient_document_uploads pdu
ORDER BY pdu.document_type, pdu.title
LIMIT 10;