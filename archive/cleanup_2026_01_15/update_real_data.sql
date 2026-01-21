-- =====================================================
-- UPDATE DATABASE WITH REAL-TIME NAMES AND BRANCHES
-- =====================================================
-- Based on documentation: India Eye Hospital Network with multiple branches
-- =====================================================

BEGIN;

-- Step 1: Update Tenant Name to match documentation
UPDATE tenant
SET 
    name = 'India Eye Hospital Network',
    tenant_code = 'INDIA_EYE_NET',
    company_email = 'contact@indiaeye.com',
    company_phone = '+91-98765-43210',
    primary_region = 'India',
    default_currency = 'INR',
    nabh_accredited = TRUE,
    max_branches = 20,
    max_users = 300,
    updated_at = CURRENT_TIMESTAMP
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 2: Update existing organizations to match documentation
-- Update Eye Care Network
UPDATE organization
SET 
    name = 'India Eye Hospital - Main Network',
    organization_code = 'IEHN_MAIN',
    status = 'Active',
    updated_at = CURRENT_TIMESTAMP
WHERE organization_code = 'EYE_CARE_NET';

-- Update ORG-DEFAULT
UPDATE organization
SET 
    name = 'India Eye Hospital - Regional Centers',
    organization_code = 'IEHN_REGIONAL',
    status = 'Active',
    updated_at = CURRENT_TIMESTAMP
WHERE organization_code = 'ORG-DEFAULT';

-- Step 3: Get organization IDs for branch insertion
DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_org_main_id UUID;
    v_org_regional_id UUID;
BEGIN
    -- Get organization IDs
    SELECT id INTO v_org_main_id FROM organization WHERE organization_code = 'IEHN_MAIN';
    SELECT id INTO v_org_regional_id FROM organization WHERE organization_code = 'IEHN_REGIONAL';

    -- Insert branches for Main Network
    INSERT INTO branch (
        id, tenant_id, organization_id, name, branch_code, region, timezone,
        currency_code, language_primary, address_line_1, city, state_province,
        postal_code, country, phone, email, operational_hours_start,
        operational_hours_end, emergency_support_24_7, status,
        created_at, updated_at
    ) VALUES
    -- Main Network Branches
    (
        gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Delhi Eye Center - Connaught Place', 'DELHI_CP', 'North India', 'Asia/Kolkata',
        'INR', 'en', 'Connaught Place, Block A', 'Delhi', 'Delhi',
        '110001', 'India', '+91-11-2345-6789', 'delhi.cp@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Delhi Eye Center - South Extension', 'DELHI_SE', 'North India', 'Asia/Kolkata',
        'INR', 'en', 'South Extension Part 2', 'Delhi', 'Delhi',
        '110049', 'India', '+91-11-4567-8901', 'delhi.se@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Mumbai Eye Center - Andheri', 'MUMBAI_ANDHERI', 'West India', 'Asia/Kolkata',
        'INR', 'en', 'Andheri West, Link Road', 'Mumbai', 'Maharashtra',
        '400053', 'India', '+91-22-2345-6789', 'mumbai.andheri@indiaeye.com',
        '08:30'::TIME, '21:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Bangalore Eye Hospital - Koramangala', 'BANGALORE_KRM', 'South India', 'Asia/Kolkata',
        'INR', 'en', 'Koramangala 4th Block', 'Bangalore', 'Karnataka',
        '560034', 'India', '+91-80-4567-8901', 'bangalore.krm@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    -- Regional Centers Branches
    (
        gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Chennai Eye Care - T Nagar', 'CHENNAI_TNAGAR', 'South India', 'Asia/Kolkata',
        'INR', 'en', 'T Nagar, Usman Road', 'Chennai', 'Tamil Nadu',
        '600017', 'India', '+91-44-2345-6789', 'chennai.tnagar@indiaeye.com',
        '09:00'::TIME, '19:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Hyderabad Eye Clinic - Banjara Hills', 'HYDERABAD_BH', 'South India', 'Asia/Kolkata',
        'INR', 'en', 'Banjara Hills, Road No 12', 'Hyderabad', 'Telangana',
        '500034', 'India', '+91-40-2345-6789', 'hyderabad.bh@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Pune Eye Center - Koregaon Park', 'PUNE_KP', 'West India', 'Asia/Kolkata',
        'INR', 'en', 'Koregaon Park, North Main Road', 'Pune', 'Maharashtra',
        '411001', 'India', '+91-20-2345-6789', 'pune.kp@indiaeye.com',
        '09:00'::TIME, '19:00'::TIME, FALSE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Kolkata Eye Hospital - Salt Lake', 'KOLKATA_SL', 'East India', 'Asia/Kolkata',
        'INR', 'en', 'Salt Lake City, Sector V', 'Kolkata', 'West Bengal',
        '700091', 'India', '+91-33-2345-6789', 'kolkata.sl@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT (organization_id, branch_code) DO UPDATE SET
        name = EXCLUDED.name,
        region = EXCLUDED.region,
        city = EXCLUDED.city,
        state_province = EXCLUDED.state_province,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE 'Successfully inserted/updated 8 branches for India Eye Hospital Network';
END $$;

-- Step 4: Create standard departments for each branch
DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_branch RECORD;
    v_dept_ophthalmology_id UUID;
    v_dept_optometry_id UUID;
    v_dept_pharmacy_id UUID;
    v_dept_reception_id UUID;
BEGIN
    -- Loop through all branches
    FOR v_branch IN 
        SELECT id, name, branch_code 
        FROM branch 
        WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
    LOOP
        -- Create Ophthalmology department
        INSERT INTO department (
            id, tenant_id, branch_id, department_name, department_code, department_type,
            description, status, operating_hours_start, operating_hours_end,
            is_24x7, requires_approval, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch.id,
            'Ophthalmology', v_branch.branch_code || '_OPHTH', 'Clinical',
            'Eye examination and treatment department', 'Active',
            '09:00'::TIME, '20:00'::TIME, FALSE, TRUE,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (branch_id, department_code) DO NOTHING;

        -- Create Optometry department
        INSERT INTO department (
            id, tenant_id, branch_id, department_name, department_code, department_type,
            description, status, operating_hours_start, operating_hours_end,
            is_24x7, requires_approval, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch.id,
            'Optometry', v_branch.branch_code || '_OPTOM', 'Clinical',
            'Vision testing and prescription department', 'Active',
            '09:00'::TIME, '20:00'::TIME, FALSE, FALSE,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (branch_id, department_code) DO NOTHING;

        -- Create Pharmacy department
        INSERT INTO department (
            id, tenant_id, branch_id, department_name, department_code, department_type,
            description, status, operating_hours_start, operating_hours_end,
            is_24x7, requires_approval, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch.id,
            'Pharmacy', v_branch.branch_code || '_PHARM', 'Support',
            'Medicine dispensary', 'Active',
            '08:30'::TIME, '21:00'::TIME, FALSE, FALSE,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (branch_id, department_code) DO NOTHING;

        -- Create Reception department
        INSERT INTO department (
            id, tenant_id, branch_id, department_name, department_code, department_type,
            description, status, operating_hours_start, operating_hours_end,
            is_24x7, requires_approval, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_tenant_id, v_branch.id,
            'Reception & Front Office', v_branch.branch_code || '_RECEP', 'Administrative',
            'Patient registration and front desk', 'Active',
            '08:30'::TIME, '20:30'::TIME, FALSE, FALSE,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT (branch_id, department_code) DO NOTHING;

        RAISE NOTICE 'Created departments for branch: %', v_branch.name;
    END LOOP;
END $$;

COMMIT;

-- Verification queries
SELECT 'TENANT UPDATE:' as info;
SELECT name, tenant_code, primary_region, max_branches, max_users FROM tenant WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT '' as separator;
SELECT 'ORGANIZATIONS:' as info;
SELECT name, organization_code, status FROM organization WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL;

SELECT '' as separator;
SELECT 'BRANCHES COUNT:' as info;
SELECT COUNT(*) as total_branches FROM branch WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL;

SELECT '' as separator;
SELECT 'BRANCHES BY ORGANIZATION:' as info;
SELECT 
    o.name as organization,
    COUNT(b.id) as branch_count
FROM organization o
LEFT JOIN branch b ON o.id = b.organization_id AND b.deleted_at IS NULL
WHERE o.tenant_id = '11111111-1111-1111-1111-111111111111' AND o.deleted_at IS NULL
GROUP BY o.id, o.name
ORDER BY o.name;

SELECT '' as separator;
SELECT 'ALL BRANCHES:' as info;
SELECT 
    o.name as organization,
    b.name as branch_name,
    b.branch_code,
    b.city,
    b.state_province
FROM branch b
JOIN organization o ON b.organization_id = o.id
WHERE b.tenant_id = '11111111-1111-1111-1111-111111111111' 
AND b.deleted_at IS NULL
ORDER BY o.name, b.name;

SELECT '' as separator;
SELECT 'DEPARTMENTS COUNT:' as info;
SELECT COUNT(*) as total_departments FROM department WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL;
