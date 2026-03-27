-- Fix Professional Licenses Tenant ID
-- Problem: Licenses were seeded but might be in wrong tenant
-- Solution: Update all licenses to match admin user's tenant

DO $$
DECLARE
    admin_user_id UUID;
    admin_tenant_id UUID;
    license_count INT;
BEGIN
    -- Get admin user details
    SELECT id, tenant_id INTO admin_user_id, admin_tenant_id
    FROM users
    WHERE email = 'admin@test.com';
    
    RAISE NOTICE 'Admin User ID: %', admin_user_id;
    RAISE NOTICE 'Admin Tenant ID: %', admin_tenant_id;
    
    -- Check current licenses
    SELECT COUNT(*) INTO license_count
    FROM professional_license
    WHERE person_id = admin_user_id;
    
    RAISE NOTICE 'Current license count for admin: %', license_count;
    
    -- Update all admin's licenses to correct tenant
    UPDATE professional_license
    SET tenant_id = admin_tenant_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE person_id = admin_user_id
    AND tenant_id != admin_tenant_id;
    
    RAISE NOTICE 'Updated % licenses to tenant %', license_count, admin_tenant_id;
    
    -- Verify the fix
    SELECT COUNT(*) INTO license_count
    FROM professional_license
    WHERE person_id = admin_user_id
    AND tenant_id = admin_tenant_id;
    
    RAISE NOTICE 'Verified: % licenses now in correct tenant', license_count;
    
END $$;

-- Show final results
SELECT 
    pl.license_number,
    pl.license_type,
    pl.verification_status,
    pl.expiry_date,
    pl.tenant_id,
    u.email,
    u.tenant_id as user_tenant_id,
    CASE 
        WHEN pl.tenant_id = u.tenant_id THEN '✓ MATCH'
        ELSE '✗ MISMATCH'
    END as tenant_check
FROM professional_license pl
JOIN users u ON pl.person_id = u.id
WHERE u.email = 'admin@test.com'
ORDER BY pl.expiry_date;
