-- =============================================
-- Quick Sample Data for Device/Session/Emergency Access
-- Uses existing admin user: dddddddd-dddd-dddd-dddd-dddddddddddd
-- Uses existing tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- =============================================

BEGIN;

-- Clear existing sample data first (if any)
DELETE FROM emergency_access;
DELETE FROM user_session;
DELETE FROM device;

-- =============================================
-- 1. DEVICES - 3 sample devices for admin user
-- =============================================

INSERT INTO device (
    id, tenant_id, user_id, device_id, device_name, device_type,
    trust_level, is_primary_device, is_blocked,
    operating_system, os_version, browser, browser_version,
    ip_address, location, user_agent,
    registered_at, last_seen_at, last_login_at,
    total_logins, status,
    created_at, updated_at, created_by_user_id, updated_by_user_id
) VALUES 
-- Device 1: Primary Desktop (Windows)
(
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
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
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
-- Device 2: Mobile (iPhone)
(
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
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
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    87,
    'active',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '2 hours',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
),
-- Device 3: Blocked Device (Suspicious)
(
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'UNKNOWN-' || substr(md5(random()::text), 1, 8),
    'Unknown Device',
    'Desktop',
    'Untrusted',
    false,
    true,
    'Linux',
    'Ubuntu 22.04',
    'Firefox',
    '121.0',
    '203.0.113.45',
    'Unknown Location',
    'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    3,
    'blocked',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- =============================================
-- 2. SESSIONS - 2 active sessions
-- =============================================

INSERT INTO user_session (
    id, tenant_id, user_id, device_id,
    session_id, token_id, refresh_token,
    session_type, login_method,
    login_time, last_activity_time, expires_at,
    ip_address, location, user_agent,
    is_active, status,
    suspicious_activity,
    created_at, updated_at, created_by_user_id, updated_by_user_id
)
SELECT 
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    d.id,
    'sess_' || substr(md5(random()::text), 1, 16),
    'token_' || substr(md5(random()::text), 1, 16),
    'refresh_' || substr(md5(random()::text), 1, 32),
    CASE WHEN d.device_type = 'Mobile' THEN 'Mobile' ELSE 'Web' END,
    'Password',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '2 minutes',
    NOW() + INTERVAL '23 hours',
    d.ip_address,
    d.location,
    d.user_agent,
    true,
    'active',
    false,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '2 minutes',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
FROM device d
WHERE d.is_blocked = false AND d.user_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
LIMIT 2;

-- =============================================
-- 3. EMERGENCY ACCESS - 4 different statuses
-- =============================================

-- Active Emergency Access (Currently Valid)
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
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'EMRG-' || upper(substr(md5(random()::text), 1, 8)),
    'Patient experiencing cardiac arrest. Need immediate access to medical history and allergies.',
    'Medical Emergency',
    'patient_records,clinical_data',
    '["patient.view_critical", "medical_history.view", "allergies.view"]',
    NOW() - INTERVAL '15 minutes',
    NOW() + INTERVAL '45 minutes',
    60,
    true,
    true,
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW() - INTERVAL '14 minutes',
    'Approved - Critical patient emergency. Access granted to save life.',
    'active',
    true,
    true,
    false,
    jsonb_build_array(
        jsonb_build_object('timestamp', NOW() - INTERVAL '15 minutes', 'action', 'Requested'),
        jsonb_build_object('timestamp', NOW() - INTERVAL '14 minutes', 'action', 'Approved')
    ),
    jsonb_build_array(
        jsonb_build_object('timestamp', NOW() - INTERVAL '13 minutes', 'action', 'Viewed patient medical history')
    ),
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '12 minutes',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- Pending Approval
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
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'EMRG-' || upper(substr(md5(random()::text), 1, 8)),
    'Patient family called with urgent medication questions. Need access to patient chart.',
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
        jsonb_build_object('timestamp', NOW(), 'action', 'Requested', 'reason', 'After-hours patient inquiry')
    ),
    NOW(),
    NOW(),
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- Expired Access
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
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
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
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW() - INTERVAL '2 hours 59 minutes',
    'Approved - Legitimate patient transfer case.',
    'expired',
    false,
    true,
    false,
    jsonb_build_array(
        jsonb_build_object('timestamp', NOW() - INTERVAL '3 hours', 'action', 'Requested'),
        jsonb_build_object('timestamp', NOW() - INTERVAL '2 hours 59 minutes', 'action', 'Approved'),
        jsonb_build_object('timestamp', NOW() - INTERVAL '2 hours', 'action', 'Auto-Revoked')
    ),
    jsonb_build_array(
        jsonb_build_object('timestamp', NOW() - INTERVAL '2 hours 55 minutes', 'action', 'Viewed transfer documents')
    ),
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- Rejected Request
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
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
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
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW() - INTERVAL '23 hours 55 minutes',
    'Request rejected - Insufficient justification. Use normal access procedures.',
    'rejected',
    false,
    true,
    true,
    jsonb_build_array(
        jsonb_build_object('timestamp', NOW() - INTERVAL '1 day', 'action', 'Requested'),
        jsonb_build_object('timestamp', NOW() - INTERVAL '23 hours 55 minutes', 'action', 'Rejected')
    ),
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '23 hours 55 minutes',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

COMMIT;

-- Verification
SELECT '✅ Sample data seeded successfully!' as message;

SELECT 
    'Devices' as feature,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_blocked = false) as active,
    COUNT(*) FILTER (WHERE is_blocked = true) as blocked
FROM device
UNION ALL
SELECT 
    'Sessions',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true),
    COUNT(*) FILTER (WHERE is_active = false)
FROM user_session
UNION ALL
SELECT 
    'Emergency Access',
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status IN ('pending', 'expired', 'rejected'))
FROM emergency_access;
