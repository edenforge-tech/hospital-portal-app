-- =============================================
-- Seed Sample Data for Device Management, Session Management, and Emergency Access
-- =============================================

BEGIN;

-- Get tenant and user IDs from existing data
DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_user_id UUID;
    v_doctor_user_id UUID;
    v_nurse_user_id UUID;
    
    -- Device IDs
    v_device1_id UUID := gen_random_uuid();
    v_device2_id UUID := gen_random_uuid();
    v_device3_id UUID := gen_random_uuid();
    v_device4_id UUID := gen_random_uuid();
    v_device5_id UUID := gen_random_uuid();
    
    -- Session IDs
    v_session1_id UUID := gen_random_uuid();
    v_session2_id UUID := gen_random_uuid();
    v_session3_id UUID := gen_random_uuid();
    v_session4_id UUID := gen_random_uuid();
    
    -- Emergency Access IDs
    v_emergency1_id UUID := gen_random_uuid();
    v_emergency2_id UUID := gen_random_uuid();
    v_emergency3_id UUID := gen_random_uuid();
    v_emergency4_id UUID := gen_random_uuid();
    
BEGIN
    -- Get first tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' LIMIT 1;
    
    -- Get users (admin, doctor, nurse)
    SELECT id INTO v_admin_user_id FROM users 
    WHERE email = 'admin@test.com' AND tenant_id = v_tenant_id LIMIT 1;
    
    SELECT id INTO v_doctor_user_id FROM users 
    WHERE "UserType" = 'Doctor' AND tenant_id = v_tenant_id LIMIT 1;
    
    SELECT id INTO v_nurse_user_id FROM users 
    WHERE "UserType" = 'Nurse' AND tenant_id = v_tenant_id LIMIT 1;
    
    RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Admin User ID: %', v_admin_user_id;
    RAISE NOTICE 'Doctor User ID: %', v_doctor_user_id;
    RAISE NOTICE 'Nurse User ID: %', v_nurse_user_id;
    
    -- =============================================
    -- 1. DEVICE MANAGEMENT - Sample Devices
    -- =============================================
    
    RAISE NOTICE '=== Seeding Device Management Data ===';
    
    -- Device 1: Admin's Primary Desktop (Windows)
    INSERT INTO device (
        id, tenant_id, user_id, device_id, device_name, device_type,
        trust_level, is_primary_device, is_blocked,
        operating_system, os_version, browser, browser_version,
        ip_address, location, user_agent,
        registered_at, last_seen_at, last_login_at,
        total_logins, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_device1_id, v_tenant_id, v_admin_user_id,
        'WIN-DESKTOP-' || substr(md5(random()::text), 1, 8),
        'Admin Desktop - Windows 11',
        'Desktop',
        'Trusted',
        true,
        false,
        'Windows',
        '11 Pro',
        'Chrome',
        '120.0.6099.129',
        '192.168.1.100',
        'New York, USA',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '5 minutes',
        NOW() - INTERVAL '5 minutes',
        245,
        'active',
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '5 minutes',
        v_admin_user_id,
        v_admin_user_id
    );
    
    -- Device 2: Admin's Mobile (iOS)
    INSERT INTO device (
        id, tenant_id, user_id, device_id, device_name, device_type,
        trust_level, is_primary_device, is_blocked,
        operating_system, os_version, browser, browser_version,
        ip_address, location, user_agent,
        registered_at, last_seen_at, last_login_at,
        total_logins, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_device2_id, v_tenant_id, v_admin_user_id,
        'IPHONE-' || substr(md5(random()::text), 1, 8),
        'iPhone 15 Pro',
        'Mobile',
        'Verified',
        false,
        false,
        'iOS',
        '17.2',
        'Safari',
        '17.2',
        '192.168.1.105',
        'New York, USA',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        87,
        'active',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '2 hours',
        v_admin_user_id,
        v_admin_user_id
    );
    
    -- Device 3: Doctor's Laptop (MacBook)
    INSERT INTO device (
        id, tenant_id, user_id, device_id, device_name, device_type,
        trust_level, is_primary_device, is_blocked,
        operating_system, os_version, browser, browser_version,
        ip_address, location, user_agent,
        registered_at, last_seen_at, last_login_at,
        total_logins, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_device3_id, v_tenant_id, v_doctor_user_id,
        'MACBOOK-' || substr(md5(random()::text), 1, 8),
        'MacBook Pro 16"',
        'Laptop',
        'Trusted',
        true,
        false,
        'macOS',
        '14.2 Sonoma',
        'Safari',
        '17.2',
        '192.168.1.120',
        'Boston, USA',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '10 minutes',
        156,
        'active',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '10 minutes',
        v_doctor_user_id,
        v_doctor_user_id
    );
    
    -- Device 4: Nurse's Tablet (iPad)
    INSERT INTO device (
        id, tenant_id, user_id, device_id, device_name, device_type,
        trust_level, is_primary_device, is_blocked,
        operating_system, os_version, browser, browser_version,
        ip_address, location, user_agent,
        registered_at, last_seen_at, last_login_at,
        total_logins, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_device4_id, v_tenant_id, v_nurse_user_id,
        'IPAD-' || substr(md5(random()::text), 1, 8),
        'iPad Pro 12.9"',
        'Tablet',
        'Verified',
        true,
        false,
        'iPadOS',
        '17.2',
        'Safari',
        '17.2',
        '192.168.1.130',
        'Boston, USA',
        'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '1 hour',
        98,
        'active',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '1 hour',
        v_nurse_user_id,
        v_nurse_user_id
    );
    
    -- Device 5: Blocked Device (Suspicious Activity)
    INSERT INTO device (
        id, tenant_id, user_id, device_id, device_name, device_type,
        trust_level, is_primary_device, is_blocked, block_reason,
        operating_system, os_version, browser, browser_version,
        ip_address, location, user_agent,
        registered_at, last_seen_at, last_login_at,
        total_logins, status,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_device5_id, v_tenant_id, v_admin_user_id,
        'UNKNOWN-' || substr(md5(random()::text), 1, 8),
        'Unknown Device',
        'Desktop',
        'Untrusted',
        false,
        true,
        'Suspicious login from unfamiliar location',
        'Linux',
        'Ubuntu 22.04',
        'Firefox',
        '121.0',
        '203.0.113.45',
        'Unknown Location, Russia',
        'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        3,
        'blocked',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        v_admin_user_id,
        v_admin_user_id
    );
    
    RAISE NOTICE 'Seeded 5 devices';
    
    -- =============================================
    -- 2. SESSION MANAGEMENT - Sample Sessions
    -- =============================================
    
    RAISE NOTICE '=== Seeding Session Management Data ===';
    
    -- Session 1: Admin - Active Desktop Session
    INSERT INTO user_session (
        id, tenant_id, user_id, device_id,
        session_id, token_id, refresh_token,
        session_type, login_method,
        login_time, last_activity_time, expires_at,
        ip_address, location, user_agent,
        is_active, status,
        suspicious_activity,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_session1_id, v_tenant_id, v_admin_user_id, v_device1_id,
        'sess_' || substr(md5(random()::text), 1, 16),
        'token_' || substr(md5(random()::text), 1, 16),
        'refresh_' || substr(md5(random()::text), 1, 32),
        'Web',
        'Password',
        NOW() - INTERVAL '5 minutes',
        NOW() - INTERVAL '30 seconds',
        NOW() + INTERVAL '23 hours 55 minutes',
        '192.168.1.100',
        'New York, USA',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        true,
        'active',
        false,
        NOW() - INTERVAL '5 minutes',
        NOW() - INTERVAL '30 seconds',
        v_admin_user_id,
        v_admin_user_id
    );
    
    -- Session 2: Admin - Active Mobile Session
    INSERT INTO user_session (
        id, tenant_id, user_id, device_id,
        session_id, token_id, refresh_token,
        session_type, login_method,
        login_time, last_activity_time, expires_at,
        ip_address, location, user_agent,
        is_active, status,
        suspicious_activity,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_session2_id, v_tenant_id, v_admin_user_id, v_device2_id,
        'sess_' || substr(md5(random()::text), 1, 16),
        'token_' || substr(md5(random()::text), 1, 16),
        'refresh_' || substr(md5(random()::text), 1, 32),
        'Mobile',
        'Password',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '5 minutes',
        NOW() + INTERVAL '22 hours',
        '192.168.1.105',
        'New York, USA',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        true,
        'active',
        false,
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '5 minutes',
        v_admin_user_id,
        v_admin_user_id
    );
    
    -- Session 3: Doctor - Active Laptop Session
    INSERT INTO user_session (
        id, tenant_id, user_id, device_id,
        session_id, token_id, refresh_token,
        session_type, login_method,
        login_time, last_activity_time, expires_at,
        ip_address, location, user_agent,
        is_active, status,
        suspicious_activity,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_session3_id, v_tenant_id, v_doctor_user_id, v_device3_id,
        'sess_' || substr(md5(random()::text), 1, 16),
        'token_' || substr(md5(random()::text), 1, 16),
        'refresh_' || substr(md5(random()::text), 1, 32),
        'Web',
        'SSO',
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '1 minute',
        NOW() + INTERVAL '23 hours 50 minutes',
        '192.168.1.120',
        'Boston, USA',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        true,
        'active',
        false,
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '1 minute',
        v_doctor_user_id,
        v_doctor_user_id
    );
    
    -- Session 4: Nurse - Expired Session (Auto-logged out)
    INSERT INTO user_session (
        id, tenant_id, user_id, device_id,
        session_id, token_id, refresh_token,
        session_type, login_method,
        login_time, logout_time, last_activity_time, expires_at,
        ip_address, location, user_agent,
        is_active, status,
        suspicious_activity,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_session4_id, v_tenant_id, v_nurse_user_id, v_device4_id,
        'sess_' || substr(md5(random()::text), 1, 16),
        'token_' || substr(md5(random()::text), 1, 16),
        'refresh_' || substr(md5(random()::text), 1, 32),
        'Mobile',
        'Password',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day',
        '192.168.1.130',
        'Boston, USA',
        'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        false,
        'expired',
        false,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day',
        v_nurse_user_id,
        v_nurse_user_id
    );
    
    RAISE NOTICE 'Seeded 4 sessions (3 active, 1 expired)';
    
    -- =============================================
    -- 3. EMERGENCY ACCESS - Sample Requests
    -- =============================================
    
    RAISE NOTICE '=== Seeding Emergency Access Data ===';
    
    -- Emergency Access 1: ACTIVE - Doctor accessing critical patient data
    INSERT INTO emergency_access (
        id, tenant_id, user_id,
        access_code, reason, emergency_type,
        scope, granted_permissions,
        start_time, end_time, duration_minutes,
        auto_revoke_enabled, requires_approval,
        approved_by, approved_at, approval_notes,
        status, is_active,
        notification_sent, suspicious_activity,
        audit_trail, actions_performed,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_emergency1_id, v_tenant_id, v_doctor_user_id,
        'EMRG-' || upper(substr(md5(random()::text), 1, 8)),
        'Patient experiencing cardiac arrest. Need immediate access to medical history and allergies.',
        'Medical Emergency',
        'patient_records,clinical_data',
        '["patient.view_critical", "medical_history.view", "allergies.view", "medications.view"]',
        NOW() - INTERVAL '15 minutes',
        NOW() + INTERVAL '45 minutes',
        60,
        true,
        true,
        v_admin_user_id,
        NOW() - INTERVAL '14 minutes',
        'Approved - Critical patient emergency. Access granted to save life.',
        'active',
        true,
        true,
        false,
        jsonb_build_array(
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '15 minutes',
                'action', 'Requested',
                'user_id', v_doctor_user_id
            ),
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '14 minutes',
                'action', 'Approved',
                'user_id', v_admin_user_id
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '13 minutes',
                'action', 'Viewed patient medical history',
                'resource_id', gen_random_uuid(),
                'resource_type', 'MedicalHistory'
            ),
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '12 minutes',
                'action', 'Viewed patient allergies',
                'resource_id', gen_random_uuid(),
                'resource_type', 'Allergies'
            )
        ),
        NOW() - INTERVAL '15 minutes',
        NOW() - INTERVAL '12 minutes',
        v_doctor_user_id,
        v_doctor_user_id
    );
    
    -- Emergency Access 2: PENDING - Nurse requesting after-hours access
    INSERT INTO emergency_access (
        id, tenant_id, user_id,
        access_code, reason, emergency_type,
        scope, granted_permissions,
        start_time, end_time, duration_minutes,
        auto_revoke_enabled, requires_approval,
        status, is_active,
        notification_sent, suspicious_activity,
        audit_trail,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_emergency2_id, v_tenant_id, v_nurse_user_id,
        'EMRG-' || upper(substr(md5(random()::text), 1, 8)),
        'Patient family member called with urgent questions about medication dosage. Need to access patient chart.',
        'After Hours Access',
        'patient_records',
        '["patient.view", "medications.view"]',
        NOW(),
        NOW() + INTERVAL '30 minutes',
        30,
        true,
        true,
        'pending',
        false,
        true,
        false,
        jsonb_build_array(
            jsonb_build_object(
                'timestamp', NOW(),
                'action', 'Requested',
                'user_id', v_nurse_user_id,
                'reason', 'After-hours patient care inquiry'
            )
        ),
        NOW(),
        NOW(),
        v_nurse_user_id,
        v_nurse_user_id
    );
    
    -- Emergency Access 3: EXPIRED - Previous emergency that timed out
    INSERT INTO emergency_access (
        id, tenant_id, user_id,
        access_code, reason, emergency_type,
        scope, granted_permissions,
        start_time, end_time, duration_minutes,
        auto_revoke_enabled, requires_approval,
        approved_by, approved_at, approval_notes,
        status, is_active,
        notification_sent, suspicious_activity,
        audit_trail, actions_performed,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_emergency3_id, v_tenant_id, v_doctor_user_id,
        'EMRG-' || upper(substr(md5(random()::text), 1, 8)),
        'Patient transferred from another facility. Need access to transfer records.',
        'Patient Transfer',
        'patient_records,transfer_documents',
        '["patient.view", "documents.view", "transfer_records.view"]',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours',
        60,
        true,
        true,
        v_admin_user_id,
        NOW() - INTERVAL '2 hours 59 minutes',
        'Approved - Legitimate patient transfer case.',
        'expired',
        false,
        true,
        false,
        jsonb_build_array(
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '3 hours',
                'action', 'Requested',
                'user_id', v_doctor_user_id
            ),
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '2 hours 59 minutes',
                'action', 'Approved',
                'user_id', v_admin_user_id
            ),
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '2 hours',
                'action', 'Auto-Revoked',
                'reason', 'Duration expired'
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '2 hours 55 minutes',
                'action', 'Viewed patient transfer documents',
                'resource_id', gen_random_uuid(),
                'resource_type', 'TransferDocument'
            )
        ),
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours',
        v_doctor_user_id,
        v_doctor_user_id
    );
    
    -- Emergency Access 4: REJECTED - Suspicious request
    INSERT INTO emergency_access (
        id, tenant_id, user_id,
        access_code, reason, emergency_type,
        scope, granted_permissions,
        start_time, end_time, duration_minutes,
        auto_revoke_enabled, requires_approval,
        rejected_by, rejected_at, rejection_reason,
        status, is_active,
        notification_sent, suspicious_activity,
        audit_trail,
        created_at, updated_at, created_by_user_id, updated_by_user_id
    ) VALUES (
        v_emergency4_id, v_tenant_id, v_nurse_user_id,
        'EMRG-' || upper(substr(md5(random()::text), 1, 8)),
        'Need to check patient records.',
        'General Access',
        'patient_records',
        '["patient.view_all"]',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '30 minutes',
        30,
        false,
        true,
        v_admin_user_id,
        NOW() - INTERVAL '23 hours 55 minutes',
        'Request rejected - Insufficient justification for emergency access. Please follow normal access request procedures.',
        'rejected',
        false,
        true,
        true,
        jsonb_build_array(
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '1 day',
                'action', 'Requested',
                'user_id', v_nurse_user_id,
                'flags', ARRAY['vague_reason', 'broad_scope']
            ),
            jsonb_build_object(
                'timestamp', NOW() - INTERVAL '23 hours 55 minutes',
                'action', 'Rejected',
                'user_id', v_admin_user_id,
                'reason', 'Insufficient emergency justification'
            )
        ),
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '23 hours 55 minutes',
        v_nurse_user_id,
        v_nurse_user_id
    );
    
    RAISE NOTICE 'Seeded 4 emergency access requests (1 active, 1 pending, 1 expired, 1 rejected)';
    
END $$;

COMMIT;

-- =============================================
-- Verification Queries
-- =============================================

-- Verify devices
SELECT 
    d.device_name,
    d.device_type,
    d.trust_level,
    d.is_primary_device,
    d.is_blocked,
    u."FirstName" || ' ' || u."LastName" as user_name,
    d.status
FROM device d
JOIN users u ON d.user_id = u.id
ORDER BY d.created_at DESC;

-- Verify sessions
SELECT 
    us.session_type,
    us.login_method,
    us.is_active,
    us.status,
    u."FirstName" || ' ' || u."LastName" as user_name,
    d.device_name,
    us.login_time,
    us.last_activity_time
FROM user_session us
JOIN users u ON us.user_id = u.id
LEFT JOIN device d ON us.device_id = d.id
ORDER BY us.created_at DESC;

-- Verify emergency access
SELECT 
    ea.access_code,
    ea.emergency_type,
    ea.status,
    ea.is_active,
    u."FirstName" || ' ' || u."LastName" as requesting_user,
    CASE 
        WHEN ea.approved_by IS NOT NULL THEN (SELECT "FirstName" || ' ' || "LastName" FROM users WHERE id = ea.approved_by)
        WHEN ea.rejected_by IS NOT NULL THEN (SELECT "FirstName" || ' ' || "LastName" FROM users WHERE id = ea.rejected_by)
        ELSE 'N/A'
    END as approver,
    ea.reason,
    ea.created_at
FROM emergency_access ea
JOIN users u ON ea.user_id = u.id
ORDER BY ea.created_at DESC;

-- Summary
SELECT 
    'Devices' as feature,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_blocked = false AND status = 'active') as active,
    COUNT(*) FILTER (WHERE is_blocked = true OR status = 'blocked') as blocked
FROM device
UNION ALL
SELECT 
    'Sessions' as feature,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_active = true AND status = 'active') as active,
    COUNT(*) FILTER (WHERE is_active = false OR status != 'active') as inactive
FROM user_session
UNION ALL
SELECT 
    'Emergency Access' as feature,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active,
    COUNT(*) FILTER (WHERE status IN ('expired', 'revoked', 'rejected')) as closed
FROM emergency_access;
