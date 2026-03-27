-- Seed test patients for examination pages
-- Assumes tenant 'India Eye Hospital Network' exists

DO $$
DECLARE
    v_tenant_id UUID;
    v_patient_id1 UUID := gen_random_uuid();
    v_patient_id2 UUID := gen_random_uuid();
    v_patient_id3 UUID := gen_random_uuid();
BEGIN
    -- Get first active tenant ID
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'Active' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found';
    END IF;
    
    -- Insert 3 test patients
    INSERT INTO patient (
        id, tenant_id, medical_record_number, first_name, last_name, 
        date_of_birth, gender, email, contact_number, blood_group,
        created_at, updated_at, status, deleted_at
    ) VALUES
    (
        v_patient_id1, v_tenant_id, 'MRN001', 'Ramesh', 'Kumar',
        '1980-05-15'::DATE, 'Male', 'ramesh.kumar@test.com', '9876543210', 'O+',
        NOW(), NOW(), 'Active', NULL
    ),
    (
        v_patient_id2, v_tenant_id, 'MRN002', 'Priya', 'Sharma',
        '1992-08-22'::DATE, 'Female', 'priya.sharma@test.com', '9876543211', 'B+',
        NOW(), NOW(), 'Active', NULL
    ),
    (
        v_patient_id3, v_tenant_id, 'MRN003', 'Amit', 'Patel',
        '1975-12-10'::DATE, 'Male', 'amit.patel@test.com', '9876543212', 'A+',
        NOW(), NOW(), 'Active', NULL
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Seeded 3 test patients for tenant: %', v_tenant_id;
    RAISE NOTICE 'Patient IDs: %, %, %', v_patient_id1, v_patient_id2, v_patient_id3;
END $$;

-- Verify patients were created
SELECT 
    id,
    medical_record_number as mrn,
    first_name || ' ' || last_name as name,
    email,
    status,
    created_at
FROM patient 
WHERE medical_record_number IN ('MRN001', 'MRN002', 'MRN003')
ORDER BY created_at DESC;
