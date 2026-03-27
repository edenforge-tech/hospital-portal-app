-- Add specialized healthcare roles to reach 78 total
-- This adapts migration 02 for the existing app_roles schema

DO $$
DECLARE
    v_tenant_id UUID;
    v_created_by UUID;
BEGIN
    -- Get first tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    -- Get system user (fallback to first user if no system admin)
    SELECT id INTO v_created_by FROM users WHERE "UserType" ILIKE '%admin%' LIMIT 1;
    
    -- If no tenant found, create a default one
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenant (id, name, status, created_at, updated_at, created_by_user_id, updated_by_user_id) 
        VALUES (gen_random_uuid(), 'System Tenant', 'active', NOW(), NOW(), NULL, NULL)
        RETURNING id INTO v_tenant_id;
    END IF;
    
    -- Insert specialized roles (56 new roles to reach 78 total)
    INSERT INTO app_roles (id, tenant_id, "Description", "RoleCode", "RoleType", "RoleLevel", "Priority", "IsSystemRole", "IsActive", "CreatedAt", "UpdatedAt", "CreatedBy")
    SELECT 
        gen_random_uuid(),
        v_tenant_id,
        r.description,
        r.code,
        'clinical',
        3,
        50,
        false,
        true,
        NOW(),
        NOW(),
        v_created_by
    FROM (VALUES
        ('CARDIOLOGIST', 'Heart specialist'),
        ('NEUROLOGIST', 'Brain and nervous system specialist'),
        ('ORTHOPEDIC_SURGEON', 'Bone and joint surgeon'),
        ('PEDIATRICIAN', 'Children healthcare specialist'),
        ('GYNECOLOGIST', 'Women health specialist'),
        ('DERMATOLOGIST', 'Skin specialist'),
        ('PSYCHIATRIST', 'Mental health specialist'),
        ('RADIOLOGIST', 'Medical imaging specialist'),
        ('ANESTHESIOLOGIST', 'Anesthesia specialist'),
        ('PATHOLOGIST', 'Laboratory medicine specialist'),
        ('ONCOLOGIST', 'Cancer specialist'),
        ('GASTROENTEROLOGIST', 'Digestive system specialist'),
        ('PULMONOLOGIST', 'Lung specialist'),
        ('NEPHROLOGIST', 'Kidney specialist'),
        ('ENDOCRINOLOGIST', 'Hormone specialist'),
        ('OPHTHALMOLOGIST', 'Eye specialist'),
        ('ENT_SPECIALIST', 'Ear nose throat specialist'),
        ('UROLOGIST', 'Urinary system specialist'),
        ('RHEUMATOLOGIST', 'Arthritis specialist'),
        ('HEMATOLOGIST', 'Blood disorder specialist'),
        ('ALLERGIST', 'Allergy specialist'),
        ('INFECTIOUS_DISEASE', 'Infection specialist'),
        ('GERIATRICIAN', 'Elderly care specialist'),
        ('NEONATOLOGIST', 'Newborn specialist'),
        ('INTENSIVIST', 'ICU specialist'),
        ('EMERGENCY_MEDICINE', 'Emergency care specialist'),
        ('FAMILY_MEDICINE', 'Family doctor'),
        ('SPORTS_MEDICINE', 'Sports injury specialist'),
        ('PAIN_MANAGEMENT', 'Pain specialist'),
        ('PLASTIC_SURGEON', 'Cosmetic surgeon'),
        ('VASCULAR_SURGEON', 'Blood vessel surgeon'),
        ('THORACIC_SURGEON', 'Chest surgeon'),
        ('NEUROSURGEON', 'Brain surgeon'),
        ('PEDIATRIC_SURGEON', 'Children surgeon'),
        ('TRANSPLANT_SURGEON', 'Organ transplant surgeon'),
        ('CLINICAL_PHARMACIST', 'Medication specialist'),
        ('NURSE_PRACTITIONER', 'Advanced practice nurse'),
        ('PHYSICIAN_ASSISTANT', 'Physician assistant'),
        ('CLINICAL_PSYCHOLOGIST', 'Clinical psychologist'),
        ('MEDICAL_SOCIAL_WORKER', 'Medical social worker'),
        ('SPEECH_THERAPIST', 'Speech therapist'),
        ('OCCUPATIONAL_THERAPIST', 'Occupational therapist'),
        ('PHYSICAL_THERAPIST', 'Physical therapist'),
        ('RESPIRATORY_THERAPIST', 'Respiratory therapist'),
        ('DIETITIAN', 'Nutrition specialist'),
        ('AUDIOLOGIST', 'Hearing specialist'),
        ('OPTOMETRIST', 'Vision specialist'),
        ('PODIATRIST', 'Foot specialist'),
        ('CHIROPRACTOR', 'Spine specialist'),
        ('MEDICAL_TECHNOLOGIST', 'Lab technologist'),
        ('RADIOLOGIC_TECHNOLOGIST', 'Imaging technologist'),
        ('SURGICAL_TECHNOLOGIST', 'Surgery technologist'),
        ('DENTAL_HYGIENIST', 'Dental hygienist'),
        ('PARAMEDIC', 'Paramedic'),
        ('EMT', 'Emergency medical technician'),
        ('HEALTHCARE_ADMINISTRATOR', 'Healthcare administrator')
    ) AS r(code, description)
    WHERE NOT EXISTS (
        SELECT 1 FROM app_roles WHERE "RoleCode" = r.code
    );
    
    RAISE NOTICE 'Successfully added specialized healthcare roles';
END $$;

-- Verify count
SELECT COUNT(*) as total_roles FROM app_roles;
