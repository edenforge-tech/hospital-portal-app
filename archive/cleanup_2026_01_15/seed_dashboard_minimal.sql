-- Minimal seed data for dashboard - just audit logs and alerts
-- Tenants have already been seeded successfully

BEGIN;

-- Create audit_log table if not exists
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tenant_id UUID,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add recent activity logs (last 24 hours) - 1523 activities
DO $$
DECLARE
    v_user_ids UUID[];
    v_tenant_ids UUID[];
    v_actions TEXT[] := ARRAY[
        'user_login', 'user_logout', 'role_assignment', 'permission_change',
        'department_access', 'patient_view', 'profile_update', 'password_change',
        'document_upload', 'report_generation', 'appointment_scheduled', 'prescription_created'
    ];
    i INT;
BEGIN
    SELECT ARRAY_AGG(id) INTO v_user_ids FROM users WHERE "DeletedAt" IS NULL;
    SELECT ARRAY_AGG(id) INTO v_tenant_ids FROM tenant WHERE deleted_at IS NULL;
    
    IF array_length(v_user_ids, 1) IS NULL OR array_length(v_tenant_ids, 1) IS NULL THEN
        RAISE NOTICE 'Not enough data to create audit logs';
        RETURN;
    END IF;
    
    -- Clear existing audit logs first
    DELETE FROM audit_log;
    
    FOR i IN 1..1523 LOOP
        INSERT INTO audit_log (
            user_id, tenant_id, action_type, description, ip_address, created_at
        ) VALUES (
            v_user_ids[(random() * (array_length(v_user_ids, 1) - 1))::INT + 1],
            v_tenant_ids[(random() * (array_length(v_tenant_ids, 1) - 1))::INT + 1],
            v_actions[(random() * (array_length(v_actions, 1) - 1))::INT + 1],
            'System activity logged automatically',
            '192.168.1.' || (random() * 255)::INT,
            NOW() - (random() * 24 || ' hours')::INTERVAL
        );
    END LOOP;
    
    RAISE NOTICE 'Added 1523 activity logs for last 24 hours';
END $$;

-- Create system_alert table if not exists
CREATE TABLE IF NOT EXISTS system_alert (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    count INT DEFAULT 0,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Clear existing alerts and add new ones
DELETE FROM system_alert;

INSERT INTO system_alert (alert_type, severity, title, description, count, created_at) VALUES
('password_expiry', 'warning', 'Password Expiry Warning', '23 users have passwords expiring in the next 7 days', 23, NOW() - '10 minutes'::INTERVAL),
('security', 'error', 'Failed Login Attempts', '15 failed login attempts detected from IP 192.168.1.100', 15, NOW() - '30 minutes'::INTERVAL),
('system', 'info', 'System Update Available', 'A new system update is available for installation', 0, NOW() - '1 hour'::INTERVAL),
('compliance', 'warning', 'Compliance Review Due', 'Quarterly HIPAA compliance review is due in 3 days', 0, NOW() - '2 hours'::INTERVAL),
('security', 'warning', 'SSL Certificate Renewal', 'SSL certificate expires in 15 days', 0, NOW() - '3 hours'::INTERVAL);

COMMIT;

-- Display summary
SELECT 
    'Tenants' as entity,
    COUNT(*)::text as total,
    COUNT(*) FILTER (WHERE status = 'active')::text as active
FROM tenant WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Users',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE "UserStatus" = 'active' AND "DeletedAt" IS NULL)::text
FROM users
UNION ALL
SELECT 
    'Departments',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE status = 'active')::text
FROM department WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Branches',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE status = 'active')::text
FROM branch WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Audit Logs (24h)',
    COUNT(*)::text,
    COUNT(*)::text
FROM audit_log WHERE created_at > NOW() - '24 hours'::INTERVAL
UNION ALL
SELECT 
    'System Alerts',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE NOT is_dismissed)::text
FROM system_alert;
