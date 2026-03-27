-- =============================================================================
-- SEED 100 SAMPLE PATIENTS
-- =============================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_ids UUID[];
BEGIN
    -- Get first tenant and branch
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_tenant_id IS NULL OR v_branch_id IS NULL THEN
        RAISE NOTICE 'No tenant or branch found - skipping patient seeding';
        RETURN;
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 100 SAMPLE PATIENTS';
    RAISE NOTICE 'Tenant: %, Branch: %', v_tenant_id, v_branch_id;
    RAISE NOTICE '========================================';
    
    -- Delete existing sample patients to avoid duplicates
    DELETE FROM patient WHERE medical_record_number LIKE 'MRN%' AND tenant_id = v_tenant_id;
    
    WITH new_patients AS (
        INSERT INTO patient (
            id, tenant_id, branch_id, medical_record_number, first_name, last_name,
            date_of_birth, gender, contact_number, email, address, blood_group,
            created_at, updated_at, status
        )
        SELECT
            gen_random_uuid(),
            v_tenant_id,
            v_branch_id,
            'MRN' || LPAD(generate_series::TEXT, 6, '0'),
            (ARRAY['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Pooja', 'Arjun', 'Divya',
                   'Karan', 'Meera', 'Rohan', 'Kavya', 'Sanjay', 'Ritu', 'Nikhil', 'Swati', 'Arun', 'Neha',
                   'Suresh', 'Lakshmi', 'Manoj', 'Geeta', 'Vijay'])[1 + floor(random() * 25)::INT],
            (ARRAY['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Gupta', 'Shah', 'Mehta',
                   'Joshi', 'Desai', 'Nair', 'Iyer', 'Pillai', 'Menon', 'Kapoor', 'Malhotra', 'Chopra', 'Agarwal'])[1 + floor(random() * 20)::INT],
            CURRENT_DATE - (20 + floor(random() * 60)::INT * 365 + floor(random() * 365)::INT),
            CASE (random() * 2)::INTEGER WHEN 0 THEN 'Male' WHEN 1 THEN 'Female' ELSE 'Other' END,
            '+91-' || (9000000000 + floor(random() * 999999999)::BIGINT)::TEXT,
            'patient' || generate_series || '@example.com',
            (floor(random() * 999) + 1)::TEXT || ' ' || (ARRAY['MG Road', 'Nehru Street', 'Gandhi Nagar', 'Park Avenue', 'Main Road'])[1 + floor(random() * 5)::INT] || ', ' ||
            (ARRAY['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'])[1 + floor(random() * 6)::INT],
            (ARRAY['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'])[1 + floor(random() * 8)::INT],
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            'active'
        FROM generate_series(1, 100)
        RETURNING id
    )
    SELECT ARRAY_AGG(id) INTO v_patient_ids FROM new_patients;
    
    RAISE NOTICE '✓ Created % patients', array_length(v_patient_ids, 1);
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PATIENT SEEDING COMPLETE';
    RAISE NOTICE '========================================';
END $$;

-- Verify
SELECT COUNT(*) as total_patients FROM patient;
SELECT medical_record_number, first_name, last_name, gender, blood_group 
FROM patient 
WHERE medical_record_number LIKE 'MRN%' 
ORDER BY medical_record_number 
LIMIT 10;
