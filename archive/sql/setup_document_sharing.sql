-- ============================================
-- DOCUMENT SHARING SETUP
-- Configure document types, sharing rules, and access policies
-- ============================================

-- Disable audit triggers temporarily
ALTER TABLE document_type DISABLE TRIGGER audit_changes_comprehensive;

-- ============================================
-- SEED DOCUMENT TYPES WITH SHARING RULES
-- ============================================

INSERT INTO document_type (
    id, tenant_id, name, description, category, is_system_type,
    requires_consent, retention_period_years, is_active, created_at, updated_at
) VALUES
-- Medical Records (High sensitivity, strict sharing)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Medical History', 'Complete patient medical history and records', 'Medical Records', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Lab Results', 'Laboratory test results and reports', 'Medical Records', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Imaging Reports', 'Radiology and imaging study reports', 'Medical Records', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Prescription Records', 'Medication prescriptions and history', 'Medical Records', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Clinical Notes', 'Doctor and nurse clinical notes', 'Medical Records', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Discharge Summary', 'Hospital discharge summaries', 'Medical Records', true, true, 7, true, NOW(), NOW()),

-- Administrative Documents (Medium sensitivity)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Insurance Documents', 'Insurance claims and policy documents', 'Administrative', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Billing Statements', 'Patient billing and payment records', 'Administrative', true, false, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Appointment Records', 'Appointment scheduling and history', 'Administrative', true, false, 3, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Registration Forms', 'Patient registration and intake forms', 'Administrative', true, true, 7, true, NOW(), NOW()),

-- Consent and Legal Documents (High sensitivity)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Treatment Consent', 'Patient consent for treatment forms', 'Legal', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Privacy Consent', 'HIPAA privacy consent forms', 'Legal', true, true, 7, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Advance Directives', 'Living wills and advance directives', 'Legal', true, true, 20, true, NOW(), NOW()),

-- Patient-Generated Documents (Variable sensitivity)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Patient Photos', 'Patient-uploaded photos and images', 'Patient Generated', false, true, 3, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Patient Notes', 'Patient personal notes and reminders', 'Patient Generated', false, false, 3, true, NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'External Records', 'Medical records from other providers', 'Patient Generated', false, true, 7, true, NOW(), NOW());

-- ============================================
-- CROSS-DEPARTMENT SHARING POLICIES
-- ============================================

-- Create a view for document sharing rules based on document type and user role
CREATE OR REPLACE VIEW document_sharing_policies AS
SELECT
    dt.id as document_type_id,
    dt.name as document_type,
    dt.category,
    dt.requires_consent,
    dt.retention_period_years,
    -- Define which roles can access which document types
    CASE
        WHEN dt.category = 'Medical Records' THEN
            ARRAY['Admin', 'Consultant', 'Senior Doctor', 'Doctor', 'Nurse', 'Nurse Manager', 'Medical Records Officer']
        WHEN dt.category = 'Administrative' THEN
            ARRAY['Admin', 'Consultant', 'Billing Clerk', 'Medical Records Officer', 'Receptionist']
        WHEN dt.category = 'Legal' THEN
            ARRAY['Admin', 'Consultant', 'Medical Records Officer']
        WHEN dt.category = 'Patient Generated' THEN
            ARRAY['Admin', 'Consultant', 'Senior Doctor', 'Doctor', 'Nurse', 'Nurse Manager', 'Medical Records Officer']
        ELSE ARRAY['Admin', 'Consultant']
    END as allowed_roles,
    -- Define cross-department sharing rules
    CASE
        WHEN dt.category = 'Medical Records' THEN 'restricted'  -- Only treating physicians and authorized staff
        WHEN dt.category = 'Administrative' THEN 'departmental' -- Within hospital departments
        WHEN dt.category = 'Legal' THEN 'restricted'           -- Legal/compliance only
        WHEN dt.category = 'Patient Generated' THEN 'shared'    -- Can be shared more broadly
        ELSE 'restricted'
    END as sharing_level,
    -- Emergency access rules
    CASE
        WHEN dt.category IN ('Medical Records', 'Legal') THEN true
        ELSE false
    END as emergency_access_allowed
FROM document_type dt
WHERE dt.is_active = true;

-- ============================================
-- DEPARTMENT-SPECIFIC ACCESS RULES
-- ============================================

-- Create a function to check document access permissions
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
    -- Get user role and department
    SELECT ar.name, uda.department_name INTO v_user_role, v_user_department
    FROM asp_net_users anu
    JOIN asp_net_user_roles anur ON anu.id = anur.user_id
    JOIN asp_net_roles anr ON anur.role_id = anr.id
    JOIN app_roles ar ON anr.name = ar.name
    LEFT JOIN user_department_access uda ON anu.id = uda.user_id
    WHERE anu.id = p_user_id
    LIMIT 1;

    -- Get document details
    SELECT
        pdu.document_type,
        dt.category,
        pdu.patient_id,
        CASE WHEN pdu.uploaded_by = p_user_id THEN true ELSE false END,
        CASE WHEN pdu.is_public THEN true
             WHEN pdu.shared_to_departments IS NOT NULL AND v_user_department = ANY(pdu.shared_to_departments) THEN true
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
    ELSIF v_is_shared THEN
        -- Document is explicitly shared
        RETURN QUERY SELECT true, NULL::TEXT, 'shared_access'::TEXT;
    ELSIF v_user_role = ANY(v_allowed_roles) THEN
        -- User role is in allowed list
        IF v_sharing_level = 'restricted' AND p_requested_action IN ('update', 'delete') THEN
            -- Restricted documents can't be modified by non-owners
            RETURN QUERY SELECT false, 'Modification not allowed for restricted documents', 'role_restricted'::TEXT;
        ELSE
            RETURN QUERY SELECT true, NULL::TEXT, 'role_access'::TEXT;
        END IF;
    ELSIF v_emergency_access AND p_requested_action = 'read' THEN
        -- Emergency access for reading critical documents
        RETURN QUERY SELECT true, NULL::TEXT, 'emergency_access'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Access denied: insufficient permissions', 'access_denied'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUDIT TRIGGER FOR DOCUMENT ACCESS
-- ============================================

-- Create trigger function for document access logging
CREATE OR REPLACE FUNCTION audit_document_access()
RETURNS TRIGGER AS $$
DECLARE
    v_access_result RECORD;
    v_user_email TEXT;
    v_user_role TEXT;
BEGIN
    -- Get user details
    SELECT anu.email, ar.name INTO v_user_email, v_user_role
    FROM asp_net_users anu
    JOIN asp_net_user_roles anur ON anu.id = anur.user_id
    JOIN asp_net_roles anr ON anur.role_id = anr.id
    JOIN app_roles ar ON anr.name = ar.name
    WHERE anu.id = NEW.user_id;

    -- Check access permissions
    SELECT * INTO v_access_result
    FROM check_document_access(NEW.user_id, NEW.document_id, NEW.action);

    -- Log the access attempt
    INSERT INTO document_access_audit (
        id, tenant_id, user_id, user_email, user_role,
        document_id, document_type, document_title, patient_id,
        action, action_result, access_granted, denial_reason, permission_used
    ) VALUES (
        gen_random_uuid(),
        (SELECT tenant_id FROM patient_document_uploads WHERE id = NEW.document_id),
        NEW.user_id, v_user_email, v_user_role,
        NEW.document_id, NEW.document_type, NEW.document_title, NEW.patient_id,
        NEW.action, NEW.action_result,
        COALESCE(v_access_result.access_granted, false),
        v_access_result.denial_reason,
        v_access_result.permission_used
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The audit trigger would be attached to document access events
-- This would typically be called from the application layer when documents are accessed

-- ============================================
-- VERIFICATION
-- ============================================

-- Re-enable audit triggers
ALTER TABLE document_type ENABLE TRIGGER audit_changes_comprehensive;

-- Show document types and sharing policies
SELECT 'Document Types Created:' as info, COUNT(*) as count FROM document_type;

SELECT
    category,
    COUNT(*) as types_count,
    array_agg(name ORDER BY name) as document_types
FROM document_type
GROUP BY category
ORDER BY category;

-- Show sharing policies
SELECT
    document_type,
    category,
    sharing_level,
    array_length(allowed_roles, 1) as allowed_role_count,
    emergency_access_allowed
FROM document_sharing_policies
ORDER BY category, document_type;