-- =====================================================
-- MIGRATION 15: ADDITIONAL TENANTS & BRANCHES
-- =====================================================
-- Hospital Portal - Multi-Tenant Expansion (5 New Tenants)
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_counter INTEGER := 1;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SEEDING 5 ADDITIONAL TENANTS';
    RAISE NOTICE '============================================';
    
    -- =====================================================
    -- TENANT 2: SMALL CLINIC
    -- =====================================================
    
    INSERT INTO tenant (
        id, name, subdomain, type, subscription_plan, subscription_status,
        contact_name, contact_email, contact_phone,
        address_line1, city, state, postal_code, country,
        total_branches, max_users, is_active, status
    )
    VALUES (
        gen_random_uuid(), 'CareFirst Clinic', 'carefirst', 'clinic', 'basic', 'active',
        'Dr. Ramesh Gupta', 'admin@carefirst.com', '+91-9876543210',
        '45, Brigade Road', 'Bangalore', 'Karnataka', '560001', 'India',
        1, 25, true, 'active'
    )
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE '✓ Created Tenant: CareFirst Clinic (ID: %)', v_tenant_id;
    
    -- Add branch for CareFirst Clinic
    INSERT INTO branch (
        tenant_id, branch_code, branch_name, branch_type,
        contact_person, contact_phone, contact_email,
        address_line1, city, state, postal_code, country,
        latitude, longitude, total_beds, icu_beds, emergency_beds,
        occupied_beds, occupied_icu_beds, occupied_emergency_beds,
        is_main_branch, status
    )
    VALUES (
        v_tenant_id, 'CF-001', 'CareFirst Main Clinic', 'clinic',
        'Dr. Ramesh Gupta', '+91-9876543210', 'contact@carefirst.com',
        '45, Brigade Road', 'Bangalore', 'Karnataka', '560001', 'India',
        12.9716, 77.5946, 15, 0, 3, -- Small clinic: 15 beds, no ICU, 3 emergency
        8, 0, 1,
        true, 'active'
    );
    
    RAISE NOTICE '  └─ Created Branch: CareFirst Main Clinic (15 beds)';
    
    -- =====================================================
    -- TENANT 3: LARGE HOSPITAL NETWORK
    -- =====================================================
    
    INSERT INTO tenant (
        id, name, subdomain, type, subscription_plan, subscription_status,
        contact_name, contact_email, contact_phone,
        address_line1, city, state, postal_code, country,
        total_branches, max_users, is_active, status
    )
    VALUES (
        gen_random_uuid(), 'Apollo Healthcare Network', 'apollo', 'hospital_network', 'enterprise', 'active',
        'Dr. Sunita Reddy', 'admin@apollonetwork.com', '+91-9988776655',
        '154, Greams Road', 'Chennai', 'Tamil Nadu', '600006', 'India',
        5, 500, true, 'active'
    )
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE '✓ Created Tenant: Apollo Healthcare Network (ID: %)', v_tenant_id;
    
    -- Add 5 branches for Apollo Network
    INSERT INTO branch (
        tenant_id, branch_code, branch_name, branch_type,
        contact_person, contact_phone, contact_email,
        address_line1, city, state, postal_code, country,
        latitude, longitude, total_beds, icu_beds, emergency_beds,
        occupied_beds, occupied_icu_beds, occupied_emergency_beds,
        is_main_branch, status
    ) VALUES
    (v_tenant_id, 'APL-001', 'Apollo Greams Road', 'hospital', 'Dr. Sunita Reddy', '+91-9988776655', 'greams@apollonetwork.com',
     '154, Greams Road', 'Chennai', 'Tamil Nadu', '600006', 'India',
     13.0500, 80.2500, 200, 30, 20, 150, 25, 15, true, 'active'),
    (v_tenant_id, 'APL-002', 'Apollo OMR', 'hospital', 'Dr. Vikram Sharma', '+91-9988776656', 'omr@apollonetwork.com',
     '320, Old Mahabalipuram Road', 'Chennai', 'Tamil Nadu', '600097', 'India',
     12.9900, 80.2400, 150, 20, 15, 120, 18, 12, false, 'active'),
    (v_tenant_id, 'APL-003', 'Apollo Vanagaram', 'specialty_center', 'Dr. Priya Menon', '+91-9988776657', 'vanagaram@apollonetwork.com',
     '64, Jawaharlal Nehru Road', 'Chennai', 'Tamil Nadu', '600095', 'India',
     13.1100, 80.1800, 100, 15, 10, 75, 12, 8, false, 'active'),
    (v_tenant_id, 'APL-004', 'Apollo Bangalore', 'hospital', 'Dr. Karthik Rao', '+91-9988776658', 'bangalore@apollonetwork.com',
     '154, Bannerghatta Road', 'Bangalore', 'Karnataka', '560076', 'India',
     12.9000, 77.6000, 180, 25, 18, 140, 22, 14, false, 'active'),
    (v_tenant_id, 'APL-005', 'Apollo Hyderabad', 'hospital', 'Dr. Anil Kumar', '+91-9988776659', 'hyderabad@apollonetwork.com',
     'Film Nagar', 'Hyderabad', 'Telangana', '500096', 'India',
     17.4300, 78.4500, 160, 22, 16, 125, 20, 12, false, 'active');
    
    RAISE NOTICE '  └─ Created 5 Branches (Total: 790 beds, 112 ICU, 79 Emergency)';
    
    -- =====================================================
    -- TENANT 4: SPECIALIZED HOSPITAL
    -- =====================================================
    
    INSERT INTO tenant (
        id, name, subdomain, type, subscription_plan, subscription_status,
        contact_name, contact_email, contact_phone,
        address_line1, city, state, postal_code, country,
        total_branches, max_users, is_active, status
    )
    VALUES (
        gen_random_uuid(), 'Fortis Eye Institute', 'fortiseye', 'specialty_hospital', 'professional', 'active',
        'Dr. Rajiv Mehta', 'admin@fortiseye.com', '+91-9123456789',
        '233, Sector 18', 'Gurugram', 'Haryana', '122015', 'India',
        2, 100, true, 'active'
    )
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE '✓ Created Tenant: Fortis Eye Institute (ID: %)', v_tenant_id;
    
    -- Add 2 branches for Fortis Eye
    INSERT INTO branch (
        tenant_id, branch_code, branch_name, branch_type,
        contact_person, contact_phone, contact_email,
        address_line1, city, state, postal_code, country,
        latitude, longitude, total_beds, icu_beds, emergency_beds,
        occupied_beds, occupied_icu_beds, occupied_emergency_beds,
        is_main_branch, status
    ) VALUES
    (v_tenant_id, 'FEI-001', 'Fortis Eye Gurugram', 'specialty_center', 'Dr. Rajiv Mehta', '+91-9123456789', 'gurugram@fortiseye.com',
     '233, Sector 18', 'Gurugram', 'Haryana', '122015', 'India',
     28.4600, 77.0300, 50, 5, 5, 35, 4, 3, true, 'active'),
    (v_tenant_id, 'FEI-002', 'Fortis Eye Delhi', 'specialty_center', 'Dr. Kavita Shah', '+91-9123456790', 'delhi@fortiseye.com',
     'Nehru Place', 'New Delhi', 'Delhi', '110019', 'India',
     28.5500, 77.2500, 40, 4, 4, 28, 3, 2, false, 'active');
    
    RAISE NOTICE '  └─ Created 2 Branches (Total: 90 beds, 9 ICU, 9 Emergency)';
    
    -- =====================================================
    -- TENANT 5: ACADEMIC MEDICAL CENTER
    -- =====================================================
    
    INSERT INTO tenant (
        id, name, subdomain, type, subscription_plan, subscription_status,
        contact_name, contact_email, contact_phone,
        address_line1, city, state, postal_code, country,
        total_branches, max_users, is_active, status
    )
    VALUES (
        gen_random_uuid(), 'AIIMS Teaching Hospital', 'aiims', 'academic_hospital', 'enterprise', 'active',
        'Prof. Dr. Sharma', 'admin@aiims.edu', '+91-9876501234',
        'Ansari Nagar', 'New Delhi', 'Delhi', '110029', 'India',
        3, 750, true, 'active'
    )
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE '✓ Created Tenant: AIIMS Teaching Hospital (ID: %)', v_tenant_id;
    
    -- Add 3 branches for AIIMS
    INSERT INTO branch (
        tenant_id, branch_code, branch_name, branch_type,
        contact_person, contact_phone, contact_email,
        address_line1, city, state, postal_code, country,
        latitude, longitude, total_beds, icu_beds, emergency_beds,
        occupied_beds, occupied_icu_beds, occupied_emergency_beds,
        is_main_branch, status
    ) VALUES
    (v_tenant_id, 'AIIMS-001', 'AIIMS Main Campus', 'hospital', 'Prof. Dr. Sharma', '+91-9876501234', 'main@aiims.edu',
     'Ansari Nagar', 'New Delhi', 'Delhi', '110029', 'India',
     28.5680, 77.2100, 500, 80, 50, 425, 72, 42, true, 'active'),
    (v_tenant_id, 'AIIMS-002', 'AIIMS Trauma Center', 'hospital', 'Dr. Ashok Verma', '+91-9876501235', 'trauma@aiims.edu',
     'Ansari Nagar East', 'New Delhi', 'Delhi', '110029', 'India',
     28.5700, 77.2110, 200, 40, 60, 175, 36, 52, false, 'active'),
    (v_tenant_id, 'AIIMS-003', 'AIIMS Research Block', 'specialty_center', 'Dr. Meera Chopra', '+91-9876501236', 'research@aiims.edu',
     'Ansari Nagar West', 'New Delhi', 'Delhi', '110029', 'India',
     28.5650, 77.2080, 100, 20, 10, 70, 16, 8, false, 'active');
    
    RAISE NOTICE '  └─ Created 3 Branches (Total: 800 beds, 140 ICU, 120 Emergency)';
    
    -- =====================================================
    -- TENANT 6: RURAL FACILITY
    -- =====================================================
    
    INSERT INTO tenant (
        id, name, subdomain, type, subscription_plan, subscription_status,
        contact_name, contact_email, contact_phone,
        address_line1, city, state, postal_code, country,
        total_branches, max_users, is_active, status
    )
    VALUES (
        gen_random_uuid(), 'Gramin Healthcare Trust', 'gramin', 'rural_hospital', 'basic', 'active',
        'Dr. Ramesh Patel', 'admin@gramin.org', '+91-9765432109',
        'Village Kheda', 'Anand', 'Gujarat', '388001', 'India',
        1, 30, true, 'active'
    )
    RETURNING id INTO v_tenant_id;
    
    RAISE NOTICE '✓ Created Tenant: Gramin Healthcare Trust (ID: %)', v_tenant_id;
    
    -- Add branch for Gramin Healthcare
    INSERT INTO branch (
        tenant_id, branch_code, branch_name, branch_type,
        contact_person, contact_phone, contact_email,
        address_line1, city, state, postal_code, country,
        latitude, longitude, total_beds, icu_beds, emergency_beds,
        occupied_beds, occupied_icu_beds, occupied_emergency_beds,
        is_main_branch, status
    )
    VALUES (
        v_tenant_id, 'GHT-001', 'Gramin Primary Health Center', 'clinic',
        'Dr. Ramesh Patel', '+91-9765432109', 'contact@gramin.org',
        'Village Kheda, Taluka Anand', 'Anand', 'Gujarat', '388001', 'India',
        22.5500, 72.9500, 20, 0, 5, -- Rural: 20 beds, no ICU, 5 emergency
        12, 0, 3,
        true, 'active'
    );
    
    RAISE NOTICE '  └─ Created Branch: Gramin Primary Health Center (20 beds)';
    
    -- =====================================================
    -- MIGRATION COMPLETE
    -- =====================================================
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 15: TENANTS & BRANCHES COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SUMMARY:';
    RAISE NOTICE '✓ Tenant 2: CareFirst Clinic (1 branch, 15 beds)';
    RAISE NOTICE '✓ Tenant 3: Apollo Network (5 branches, 790 beds)';
    RAISE NOTICE '✓ Tenant 4: Fortis Eye (2 branches, 90 beds)';
    RAISE NOTICE '✓ Tenant 5: AIIMS (3 branches, 800 beds)';
    RAISE NOTICE '✓ Tenant 6: Gramin (1 branch, 20 beds)';
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'Total: 5 Tenants, 12 Branches, 1,715 Beds';
    RAISE NOTICE '============================================';
    
END $$;
