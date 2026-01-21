-- Direct SQL update script for real India Eye Hospital Network data
-- Run this from Azure Data Studio or any PostgreSQL client

BEGIN;

-- Step 1: Update Tenant
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
WHERE id = (SELECT id FROM tenant LIMIT 1);

-- Step 2: Update Organizations
UPDATE organization
SET 
    name = 'India Eye Hospital - Main Network',
    organization_code = 'IEHN_MAIN',
    status = 'Active',
    updated_at = CURRENT_TIMESTAMP
WHERE organization_code = 'EYE_CARE_NET';

UPDATE organization
SET 
    name = 'India Eye Hospital - Regional Centers',
    organization_code = 'IEHN_REGIONAL',
    status = 'Active',
    updated_at = CURRENT_TIMESTAMP
WHERE organization_code = 'ORG-DEFAULT';

-- Step 3: Insert new branches
DO $$
DECLARE
    v_tenant_id UUID;
    v_org_main_id UUID;
    v_org_regional_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_org_main_id FROM organization WHERE organization_code = 'IEHN_MAIN';
    SELECT id INTO v_org_regional_id FROM organization WHERE organization_code = 'IEHN_REGIONAL';

    INSERT INTO branch (
        id, tenant_id, organization_id, name, branch_code, region, timezone,
        currency_code, language_primary, address_line_1, city, state_province,
        postal_code, country, phone, email, operational_hours_start,
        operational_hours_end, emergency_support_24_7, status,
        created_at, updated_at
    ) VALUES
    (gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Delhi Eye Center - Connaught Place', 'DELHI_CP', 'North India', 'Asia/Kolkata',
        'INR', 'en', 'Connaught Place, Block A', 'Delhi', 'Delhi',
        '110001', 'India', '+91-11-2345-6789', 'delhi.cp@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Mumbai Eye Center - Andheri', 'MUMBAI_ANDHERI', 'West India', 'Asia/Kolkata',
        'INR', 'en', 'Andheri West, Link Road', 'Mumbai', 'Maharashtra',
        '400053', 'India', '+91-22-2345-6789', 'mumbai.andheri@indiaeye.com',
        '08:30'::TIME, '21:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), v_tenant_id, v_org_main_id,
        'Bangalore Eye Hospital - Koramangala', 'BANGALORE_KRM', 'South India', 'Asia/Kolkata',
        'INR', 'en', 'Koramangala 4th Block', 'Bangalore', 'Karnataka',
        '560034', 'India', '+91-80-4567-8901', 'bangalore.krm@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Chennai Eye Care - T Nagar', 'CHENNAI_TNAGAR', 'South India', 'Asia/Kolkata',
        'INR', 'en', 'T Nagar, Usman Road', 'Chennai', 'Tamil Nadu',
        '600017', 'India', '+91-44-2345-6789', 'chennai.tnagar@indiaeye.com',
        '09:00'::TIME, '19:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Hyderabad Eye Clinic - Banjara Hills', 'HYDERABAD_BH', 'South India', 'Asia/Kolkata',
        'INR', 'en', 'Banjara Hills, Road No 12', 'Hyderabad', 'Telangana',
        '500034', 'India', '+91-40-2345-6789', 'hyderabad.bh@indiaeye.com',
        '09:00'::TIME, '20:00'::TIME, TRUE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), v_tenant_id, v_org_regional_id,
        'Pune Eye Center - Koregaon Park', 'PUNE_KP', 'West India', 'Asia/Kolkata',
        'INR', 'en', 'Koregaon Park, North Main Road', 'Pune', 'Maharashtra',
        '411001', 'India', '+91-20-2345-6789', 'pune.kp@indiaeye.com',
        '09:00'::TIME, '19:00'::TIME, FALSE, 'Active',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    RAISE NOTICE 'Successfully inserted/updated 6 new branches';
END $$;

COMMIT;

-- Verification
SELECT 'TENANT:' as section, name, tenant_code FROM tenant;
SELECT '' as blank;
SELECT 'ORGANIZATIONS:' as section, name, organization_code FROM organization WHERE deleted_at IS NULL;
SELECT '' as blank;
SELECT 'BRANCHES BY ORG:' as section, o.name as organization, COUNT(b.id) as branches
FROM organization o
LEFT JOIN branch b ON o.id = b.organization_id AND b.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name ORDER BY o.name;
SELECT '' as blank;
SELECT 'ALL BRANCHES:' as section, o.name as organization, b.name as branch, b.city
FROM branch b
JOIN organization o ON b.organization_id = o.id
WHERE b.deleted_at IS NULL
ORDER BY o.name, b.name;
