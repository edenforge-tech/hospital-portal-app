-- Fix License Tenant IDs - Permanent Solution
-- This updates all professional licenses to match the admin user's tenant_id

DO $$
DECLARE
    admin_tenant_id UUID;
    admin_user_id UUID;
    licenses_updated INTEGER;
BEGIN
    -- Get admin user's tenant_id and user_id
    SELECT id, tenant_id 
    INTO admin_user_id, admin_tenant_id
    FROM users 
    WHERE email = 'admin@test.com'
    LIMIT 1;

    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;

    RAISE NOTICE 'Admin User ID: %', admin_user_id;
    RAISE NOTICE 'Admin Tenant ID: %', admin_tenant_id;

    -- Update all licenses for this user to have the correct tenant_id
    UPDATE professional_license
    SET 
        tenant_id = admin_tenant_id,
        updated_at = NOW(),
        updated_by_user_id = admin_user_id
    WHERE person_id = admin_user_id
    AND tenant_id != admin_tenant_id;

    GET DIAGNOSTICS licenses_updated = ROW_COUNT;

    RAISE NOTICE '✓ Updated % professional licenses to tenant %', licenses_updated, admin_tenant_id;

    -- Verify the fix
    RAISE NOTICE '';
    RAISE NOTICE 'Verification - Current license count for admin:';
    
    PERFORM license_number, license_type, status, expiry_date
    FROM professional_license
    WHERE person_id = admin_user_id
    ORDER BY expiry_date;

    RAISE NOTICE '✓ All licenses now have matching tenant_id';
END $$;

-- Show final state
SELECT 
    pl.license_number,
    pl.license_type,
    pl.status,
    pl.expiry_date,
    pl.tenant_id,
    u.email,
    u.tenant_id as user_tenant_id,
    CASE 
        WHEN pl.tenant_id = u.tenant_id THEN '✓ Match'
        ELSE '✗ Mismatch'
    END as tenant_check
FROM professional_license pl
JOIN users u ON u.id = pl.person_id
WHERE u.email = 'admin@test.com'
ORDER BY pl.expiry_date;
