-- ============================================
-- UPDATE DOCUMENT ACCESS CONTROL FUNCTION
-- Fix to use correct table names
-- ============================================

CREATE OR REPLACE FUNCTION check_document_access(
    p_user_id UUID,
    p_document_id UUID,
    p_requested_action TEXT
) RETURNS TABLE (
    access_granted BOOLEAN,
    denial_reason TEXT,
    permission_used TEXT
) AS $$
DECLARE
    v_user_role TEXT;
    v_document_type TEXT;
    v_document_category TEXT;
    v_patient_id UUID;
    v_user_department TEXT;
    v_document_department TEXT;
    v_sharing_level TEXT;
    v_allowed_roles TEXT[];
    v_emergency_access BOOLEAN;
    v_is_owner BOOLEAN := false;
    v_is_shared BOOLEAN := false;
BEGIN
    -- Get user role from app_user_roles and app_roles
    SELECT ar.name INTO v_user_role
    FROM app_user_roles aur
    JOIN app_roles ar ON aur.role_id = ar.id
    WHERE aur.user_id = p_user_id
    LIMIT 1;

    -- Get document details
    SELECT
        pdu.document_type,
        dt.category,
        pdu.patient_id,
        CASE WHEN pdu.uploaded_by = p_user_id THEN true ELSE false END,
        CASE WHEN pdu.is_public THEN true
             WHEN pdu.shared_to_departments IS NOT NULL AND 'Administration' = ANY(pdu.shared_to_departments) THEN true
             WHEN pdu.shared_to_roles IS NOT NULL AND v_user_role = ANY(pdu.shared_to_roles) THEN true
             ELSE false END
    INTO v_document_type, v_document_category, v_patient_id, v_is_owner, v_is_shared
    FROM patient_document_uploads pdu
    LEFT JOIN document_type dt ON pdu.document_type = dt.name
    WHERE pdu.id = p_document_id;

    -- Get sharing policy
    SELECT sharing_level, allowed_roles, emergency_access_allowed
    INTO v_sharing_level, v_allowed_roles, v_emergency_access
    FROM document_sharing_policies
    WHERE document_type = v_document_type;

    -- Check access based on rules
    IF v_is_owner THEN
        -- Document owner has full access
        RETURN QUERY SELECT true, NULL::TEXT, 'owner_access'::TEXT;
    ELSIF v_sharing_level = 'restricted' AND p_requested_action IN ('update', 'delete') THEN
        -- Restricted documents can't be modified by anyone except owner
        RETURN QUERY SELECT false, 'Modification not allowed for restricted documents', 'restricted_modification'::TEXT;
    ELSIF v_is_shared THEN
        -- Document is explicitly shared
        RETURN QUERY SELECT true, NULL::TEXT, 'shared_access'::TEXT;
    ELSIF v_user_role = ANY(v_allowed_roles) THEN
        -- User role is in allowed list
        RETURN QUERY SELECT true, NULL::TEXT, 'role_access'::TEXT;
    ELSIF v_emergency_access AND p_requested_action = 'read' THEN
        -- Emergency access for reading critical documents
        RETURN QUERY SELECT true, NULL::TEXT, 'emergency_access'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Access denied: insufficient permissions', 'access_denied'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;