-- =====================================================
-- SIMPLE EMPLOYEE SEED SCRIPT (Fixed for actual schema)
-- =====================================================
-- Creates 10 test employees using correct table structure
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_dept_id UUID;
    v_admin_user_id UUID;
    v_user_id UUID;
    v_employee_id UUID;
BEGIN
    -- Get existing tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE is_active = true LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please run migrations first.';
    END IF;
    
    -- Get branch
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Get a department
    SELECT id INTO v_dept_id FROM department WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- Get admin user ID
    SELECT id INTO v_admin_user_id FROM users WHERE email = 'admin@test.com' LIMIT 1;
    
    IF v_admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found. Please ensure backend created the admin user.';
    END IF;
    
    RAISE NOTICE 'Creating employees for tenant: %', v_tenant_id;
    
    -- Create 10 test employees
    FOR i IN 1..10 LOOP
        v_user_id := gen_random_uuid();
        v_employee_id := gen_random_uuid();
        
        -- Create user
        INSERT INTO users (
            id, tenant_id, user_name, normalized_user_name, email, normalized_email,
            email_confirmed, password_hash, security_stamp, concurrency_stamp,
            phone_number, phone_number_confirmed, two_factor_enabled, lockout_enabled,
            access_failed_count, "FirstName", "LastName", "UserType", "UserStatus",
            "MustChangePasswordOnLogin", "CreatedAt", "UpdatedAt", created_at
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
            'Number ' || i,
            'Staff',
            'active',
            false,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ) ON CONFLICT (normalized_user_name) DO NOTHING;
        
        -- Create employee record with correct column names
        INSERT INTO employee (
            id,
            tenant_id,
            user_id,
            employee_number,
            hire_date,
            employment_type,
            job_title,
            department_id,
            base_salary,
            emergency_contact_name,
            emergency_contact_phone,
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
            CURRENT_DATE - (i * 30 || ' days')::interval,
            CASE 
                WHEN i <= 7 THEN 'full-time'
                WHEN i <= 9 THEN 'part-time'
                ELSE 'contract'
            END,
            CASE 
                WHEN i <= 3 THEN 'Senior Doctor'
                WHEN i <= 6 THEN 'Nurse'
                WHEN i <= 8 THEN 'Technician'
                ELSE 'Administrative Staff'
            END,
            v_dept_id,
            50000.00 + (i * 5000),
            'Emergency Contact ' || i,
            '+1-555-9' || LPAD(i::text, 3, '0'),
            'active',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            v_admin_user_id,
            v_admin_user_id
        ) ON CONFLICT DO NOTHING;
        
    END LOOP;
    
    RAISE NOTICE 'Successfully created 10 test employees';
    
END $$;

-- Verify the results
SELECT 
    e.employee_number,
    u."FirstName" || ' ' || u."LastName" as name,
    u.email,
    e.job_title,
    e.employment_type,
    d.department_name as department,
    e.base_salary,
    e.status
FROM employee e
JOIN users u ON e.user_id = u.id
LEFT JOIN department d ON e.department_id = d.id
ORDER BY e.employee_number;
