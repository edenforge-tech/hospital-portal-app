-- =====================================================================
-- Counseling Consents Seed Data
-- Version: 58
-- Purpose: Create counseling consent records linking sessions to templates
-- Prerequisite: Run 54_seed_counseling_sessions.sql and 55_seed_consent_templates.sql
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_user_id UUID;
    v_session_ids UUID[];
    v_template_ids UUID[];
    v_patient_ids UUID[];
BEGIN
    -- Get first available tenant, branch, and user
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- Get counseling session IDs with their patient IDs
    SELECT ARRAY_AGG(id ORDER BY session_number) INTO v_session_ids
    FROM counseling_sessions WHERE tenant_id = v_tenant_id AND session_number LIKE 'CS-%' LIMIT 30;
    
    SELECT ARRAY_AGG(patient_id ORDER BY session_number) INTO v_patient_ids
    FROM counseling_sessions WHERE tenant_id = v_tenant_id AND session_number LIKE 'CS-%' LIMIT 30;
    
    -- Get consent template IDs
    SELECT ARRAY_AGG(id ORDER BY template_name) INTO v_template_ids
    FROM consent_form_templates WHERE tenant_id = v_tenant_id AND is_active = true;
    
    -- Fallbacks
    IF v_tenant_id IS NULL THEN
        v_tenant_id := '11b26293-9d9c-4633-927e-3294bff2a8d7'::UUID;
    END IF;
    
    IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id FROM branch LIMIT 1;
    END IF;
    
    IF v_user_id IS NULL THEN
        v_user_id := '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81'::UUID;
    END IF;
    
    IF v_session_ids IS NULL OR array_length(v_session_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No counseling sessions found. Please run 54_seed_counseling_sessions.sql first';
    END IF;
    
    IF v_template_ids IS NULL OR array_length(v_template_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No consent templates found. Please run 55_seed_consent_templates.sql first';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING COUNSELING CONSENTS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE 'Sessions: %, Templates: %',
                 array_length(v_session_ids, 1),
                 array_length(v_template_ids, 1);
    RAISE NOTICE '========================================';
    
    -- Delete existing sample consents
    DELETE FROM counseling_consents 
    WHERE tenant_id = v_tenant_id 
    AND session_id IN (SELECT unnest(v_session_ids));
    
    -- =====================================================================
    -- Insert Counseling Consents (1 per session)
    -- =====================================================================
    
    INSERT INTO counseling_consents (
        id, tenant_id, branch_id, template_id, patient_id, session_id,
        rendered_html, placeholder_values,
        patient_signature_base64, patient_signed_at,
        witness_signature_base64, witness_name, witness_relationship, witness_signed_at,
        consent_status, all_signatures_completed, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    )
    SELECT
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        v_template_ids[(i % array_length(v_template_ids, 1)) + 1],
        v_patient_ids[i],
        v_session_ids[i],
        '<div class="consent-document"><h2>SURGICAL CONSENT FORM</h2>' ||
        '<p><strong>Patient:</strong> Patient ' || i || '</p>' ||
        '<p><strong>Date:</strong> ' || TO_CHAR(CURRENT_DATE - ((i % 7) * INTERVAL '1 day'), 'DD-Mon-YYYY') || '</p>' ||
        '<p><strong>Procedure:</strong> ' || 
        CASE (i % 5)
            WHEN 0 THEN 'Phacoemulsification with IOL'
            WHEN 1 THEN 'Vitrectomy'
            WHEN 2 THEN 'Trabeculectomy'
            WHEN 3 THEN 'ECCE with IOL'
            ELSE 'Retinal Surgery'
        END || '</p>' ||
        '<h3>I understand and consent to:</h3>' ||
        '<ul><li>The nature of the surgical procedure</li>' ||
        '<li>Risks and benefits explained by the surgeon</li>' ||
        '<li>Alternative treatment options</li>' ||
        '<li>Post-operative care requirements</li></ul>' ||
        '<p>I have had the opportunity to ask questions and they have been answered to my satisfaction.</p>' ||
        '<div class="signature-block"><p>Patient Signature</p></div></div>',
        jsonb_build_object(
            'PATIENT_NAME', 'Patient ' || i,
            'MR_NUMBER', 'MRN' || LPAD(i::TEXT, 6, '0'),
            'CONSENT_DATE', TO_CHAR(CURRENT_DATE - ((i % 7) * INTERVAL '1 day'), 'DD-Mon-YYYY'),
            'PROCEDURE_TYPE', CASE (i % 5)
                WHEN 0 THEN 'Phacoemulsification with IOL'
                WHEN 1 THEN 'Vitrectomy'
                WHEN 2 THEN 'Trabeculectomy'
                WHEN 3 THEN 'ECCE with IOL'
                ELSE 'Retinal Surgery'
            END,
            'SURGEON_NAME', 'Dr. Sharma',
            'EYE_OPERATED', CASE (i % 3) WHEN 0 THEN 'OD (Right)' WHEN 1 THEN 'OS (Left)' ELSE 'OU (Both)' END
        ),
        CASE 
            WHEN i <= 10 THEN 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            ELSE NULL
        END,
        CASE WHEN i <= 10 THEN CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '14:30:00' ELSE NULL END,
        CASE 
            WHEN i <= 8 THEN 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            ELSE NULL
        END,
        CASE WHEN i <= 8 THEN 'Witness Name ' || i ELSE NULL END,
        CASE WHEN i <= 8 THEN CASE (i % 4) WHEN 0 THEN 'Spouse' WHEN 1 THEN 'Son' WHEN 2 THEN 'Daughter' ELSE 'Friend' END ELSE NULL END,
        CASE WHEN i <= 8 THEN CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '14:35:00' ELSE NULL END,
        CASE 
            WHEN i <= 10 THEN 'Signed'
            WHEN i <= 20 THEN 'Pending'
            ELSE 'Draft'
        END,
        CASE WHEN i <= 8 THEN true ELSE false END,
        'active',
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '10:00:00',
        CURRENT_DATE - ((i % 7) * INTERVAL '1 day') + TIME '10:00:00',
        v_user_id,
        v_user_id
    FROM generate_series(1, array_length(v_session_ids, 1)) AS i;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLETED: % counseling consents seeded', array_length(v_session_ids, 1);
    RAISE NOTICE '========================================';
END $$;

-- Verification queries
SELECT 'Counseling Consents by Status' AS report, consent_status, COUNT(*) AS count
FROM counseling_consents
WHERE deleted_at IS NULL
GROUP BY consent_status
ORDER BY consent_status;

SELECT 'Counseling Consents with Signatures' AS report,
       COUNT(*) FILTER (WHERE patient_signature_base64 IS NOT NULL) AS with_patient_signature,
       COUNT(*) FILTER (WHERE witness_signature_base64 IS NOT NULL) AS with_witness_signature,
       COUNT(*) FILTER (WHERE all_signatures_completed = true) AS fully_signed
FROM counseling_consents
WHERE deleted_at IS NULL;

SELECT 'Total Counseling Consents' AS report, COUNT(*) AS total
FROM counseling_consents
WHERE deleted_at IS NULL;
