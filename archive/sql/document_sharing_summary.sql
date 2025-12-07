-- ============================================
-- DOCUMENT SHARING SETUP SUMMARY
-- ============================================

-- Show document types by category
SELECT
    category,
    COUNT(*) as document_types,
    string_agg(name, ', ' ORDER BY name) as types
FROM document_type
GROUP BY category
ORDER BY category;

-- Show sharing policies summary
SELECT
    category,
    sharing_level,
    COUNT(*) as types_with_policy,
    string_agg(document_type, ', ' ORDER BY document_type) as document_types
FROM document_sharing_policies
GROUP BY category, sharing_level
ORDER BY category, sharing_level;

-- Show role access summary
SELECT
    category,
    array_length(allowed_roles, 1) as roles_allowed,
    allowed_roles
FROM document_sharing_policies
GROUP BY category, allowed_roles
ORDER BY category;

-- Show emergency access documents
SELECT
    document_type,
    category,
    sharing_level
FROM document_sharing_policies
WHERE emergency_access_allowed = true
ORDER BY category, document_type;

-- Show current documents in system
SELECT
    document_title,
    document_type,
    is_public,
    CASE
        WHEN shared_to_departments IS NOT NULL THEN 'Department-shared'
        WHEN shared_to_roles IS NOT NULL THEN 'Role-shared'
        WHEN is_public THEN 'Public'
        ELSE 'Private'
    END as sharing_type,
    array_length(shared_to_departments, 1) as dept_count,
    array_length(shared_to_roles, 1) as role_count
FROM patient_document_uploads
ORDER BY document_type, document_title;

-- Overall statistics
SELECT
    'Document Types' as metric,
    COUNT(*)::text as value
FROM document_type
UNION ALL
SELECT
    'Sharing Policies' as metric,
    COUNT(*)::text as value
FROM document_sharing_policies
UNION ALL
SELECT
    'Documents in System' as metric,
    COUNT(*)::text as value
FROM patient_document_uploads
UNION ALL
SELECT
    'Shared Documents' as metric,
    COUNT(*)::text as value
FROM patient_document_uploads
WHERE shared_to_departments IS NOT NULL
   OR shared_to_roles IS NOT NULL
   OR is_public = true;