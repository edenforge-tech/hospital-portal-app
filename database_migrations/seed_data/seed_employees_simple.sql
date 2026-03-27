-- =====================================================
-- SIMPLIFIED EMPLOYEE SEED SCRIPT
-- =====================================================
-- Creates 10 test employees using existing admin user
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_dept_general UUID;
    v_dept_ophthalmology UUID;
    v_emp_type_fulltime UUID;
    v_emp_type_parttime UUID;
    v_emp_type_contract UUID;
    v_admin_user_id UUID;
    v_user_id UUID;
    v_employee_id UUID;
    v_counter INT := 1;
BEGIN
    -- Get existing tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please run migrations first.';
    END IF;
    
    -- Get branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Get departments
    SELECT id INTO v_dept_general FROM department WHERE department_name = 'General Administration' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_dept_ophthalmology FROM department WHERE department_name = 'Ophthalmology' AND tenant_id = v_tenant_id LIMIT 1;
    
    -- Get employment types
    SELECT id INTO v_emp_type_fulltime FROM employment_type_lookup WHERE type_code = 'FULL_TIME';
    SELECT id INTO v_emp_type_parttime FROM employment_type_lookup WHERE type_code = 'PART_TIME';
    SELECT id INTO v_emp_type_contract FROM employment_type_lookup WHERE type_code = 'CONTRACT';
    
    IF v_emp_type_fulltime IS NULL THEN
        INSERT INTO employment_type_lookup (id, type_code, type_name, description, status)
        VALUES (gen_random_uuid(), 'FULL_TIME', 'Full-Time', 'Full-time employment', 'active')
        RETURNING id INTO v_emp_type_fulltime;
    END IF;
    
    IF v_emp_type_parttime IS NULL THEN
        INSERT INTO employment_type_lookup (id, type_code, type_name, description, status)
        VALUES (gen_random_uuid(), 'PART_TIME', 'Part-Time', 'Part-time employment', 'active')
        RETURNING id INTO v_emp_type_parttime;
    END IF;
    
    IF v_emp_type_contract IS NULL THEN
        INSERT INTO employment_type_lookup (id, type_code, type_name, description, status)
        VALUES (gen_random_uuid(), 'CONTRACT', 'Contract', 'Contract-based employment', 'active')
        RETURNING id INTO v_emp_type_contract;
    END IF;
    
    -- Get admin user ID (from users table - lowercase)
    SELECT id INTO v_admin_user_id FROM users WHERE email = 'admin@test.com' LIMIT 1;
    
    IF v_admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found. Please ensure the backend has created the admin user.';
    END IF;
    
    RAISE NOTICE 'Creating employees for tenant: %, branch: %', v_tenant_id, v_branch_id;
    
    -- Create 10 test employees
    FOR i IN 1..10 LOOP
        v_user_id := gen_random_uuid();
        v_employee_id := gen_random_uuid();
        
        -- Create user in users table (lowercase)
        INSERT INTO users (
            id, tenant_id, user_name, normalized_user_name, email, normalized_email,
            email_confirmed, password_hash, security_stamp, concurrency_stamp,
            phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
            access_failed_count, first_name, last_name, user_type, user_status,
            created_at
        ) VALUES (
            v_user_id,
            v_tenant_id,
            'employee' || i,
            'EMPLOYEE' || i,
            'employee' || i || '@hospital.com',
            'EMPLOYEE' || i || '@HOSPITAL.COM',
            true,
            'AQAAAAIAAYagAAAAEKp8qH0Q7FQ3xZVqK5P4vN7xH6lYqJ8zN2mC1wR3tE4pD5oA8sV7kL9fY6uX3hG2wA==', -- Test@123456
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            '+1-555-' || LPAD(i::text, 4, '0'),
            true,
            false,
            false,
            0,
            'Employee',
            'User ' || i,
            'Staff',
            'active',
            CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
        
        -- Create employee record
        INSERT INTO employee (
            id,
            tenant_id,
            user_id,
            employee_number,
            job_title,
            department_id,
            branch_id,
            employment_type_id,
            date_of_joining,
            current_salary,
            emergency_contact_name,
            emergency_contact_phone,
            blood_group,
            status,
            created_at,
            updated_at,
            created_by_user_id,
            updated_by_user_id
        ) VALUES (
            v_employee_id,
            v_tenant_id,
            v_user_id,
            'EMP' || LPAD(i::text, 5, '0'),
            CASE 
                WHEN i <= 3 THEN 'Senior Doctor'
                WHEN i <= 6 THEN 'Nurse'
                WHEN i <= 8 THEN 'Technician'
                ELSE 'Administrative Staff'
            END,
            CASE WHEN i <= 6 THEN v_dept_ophthalmology ELSE v_dept_general END,
            v_branch_id,
            CASE 
                WHEN i <= 7 THEN v_emp_type_fulltime
                WHEN i <= 9 THEN v_emp_type_parttime
                ELSE v_emp_type_contract
            END,
            CURRENT_DATE - (i * 30 || ' days')::interval,
            50000.00 + (i * 5000),
            'Emergency Contact ' || i,
            '+1-555-9' || LPAD(i::text, 3, '0'),
            CASE (i % 4)
                WHEN 0 THEN 'A+'
                WHEN 1 THEN 'B+'
                WHEN 2 THEN 'O+'
                ELSE 'AB+'
            END,
            'active',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            v_admin_user_id,
            v_admin_user_id
        ) ON CONFLICT DO NOTHING;
        
        v_counter := v_counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Successfully created 10 test employees';
    
END $$;

-- Verify the results
SELECT 
    e.employee_number,
    u.first_name || ' ' || u.last_name as name,
    u.email as email,
    e.job_title,
    et.type_name as employment_type,
    d.department_name as department,
    e.status
FROM employee e
JOIN users u ON e.user_id = u.id
LEFT JOIN employment_type_lookup et ON e.employment_type_id = et.id
LEFT JOIN department d ON e.department_id = d.id
ORDER BY e.employee_number;
