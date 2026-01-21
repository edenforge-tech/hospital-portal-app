-- Simplified seed data for Hospital Portal Admin Dashboard
-- Focuses on adding realistic data for dashboard statistics

BEGIN;

-- Add 5 more tenants (to reach ~12 total from current 7)
DO $$
DECLARE
    v_tenant_id UUID;
    v_existing_user_id UUID;
    i INT;
BEGIN
    -- Get an existing user for created_by/updated_by
    SELECT id INTO v_existing_user_id FROM users LIMIT 1;
    
    FOR i IN 1..5 LOOP
        v_tenant_id := gen_random_uuid();
        
        INSERT INTO tenant (
            id, name, tenant_code, company_email, company_phone,
            status, subscription_type, max_branches, max_users, is_active,
            primary_region, default_currency, hipaa_compliant, nabh_accredited, gdpr_compliant, dpa_compliant,
            created_at, updated_at, created_by_user_id, updated_by_user_id
        ) VALUES (
            v_tenant_id,
            CASE i
                WHEN 1 THEN 'City General Hospital'
                WHEN 2 THEN 'Regional Medical Center'
                WHEN 3 THEN 'Community Health Clinic'
                WHEN 4 THEN 'Pediatric Care Center'
                ELSE 'Orthopedic Specialty Hospital'
            END,
            'TENANT' || LPAD(i::TEXT, 3, '0'),
            'admin' || i || '@hospital.com',
            '+1-555-' || LPAD((1000 + i)::TEXT, 4, '0'),
            'active',
            CASE i % 3
                WHEN 0 THEN 'enterprise'
                WHEN 1 THEN 'professional'
                ELSE 'basic'
            END,
            CASE i % 3
                WHEN 0 THEN 20
                WHEN 1 THEN 10
                ELSE 5
            END,
            CASE i % 3
                WHEN 0 THEN 1000
                WHEN 1 THEN 500
                ELSE 100
            END,
            true,
            'US',
            'USD',
            true,
            true,
            true,
            true,
            NOW() - (i || ' months')::INTERVAL,
            NOW() - (i || ' days')::INTERVAL,
            v_existing_user_id,
            v_existing_user_id
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Added 5 tenants';
END $$;

-- Add sample users (50 representative users from the 3847 total)
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_ids UUID[];
    v_existing_user_id UUID;
    v_first_names TEXT[] := ARRAY['Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Linda', 'Robert', 'Patricia', 'John',
                                    'Jennifer', 'William', 'Elizabeth', 'Richard', 'Barbara', 'Joseph', 'Susan', 'Thomas', 'Karen', 'Christopher',
                                    'Nancy', 'Daniel', 'Margaret', 'Matthew', 'Lisa', 'Donald', 'Betty', 'Paul', 'Sandra', 'Mark',
                                    'Ashley', 'Steven', 'Donna', 'Kenneth', 'Carol', 'Brian', 'Amanda', 'Kevin', 'Melissa', 'George',
                                    'Deborah', 'Timothy', 'Dorothy', 'Ronald', 'Helen', 'Jason', 'Michelle', 'Larry', 'Sharon', 'Jeffrey'];
    v_last_names TEXT[] := ARRAY['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
                                   'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
                                   'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
                                   'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
                                   'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez'];
    i INT;
BEGIN
    -- Get existing user and all tenant IDs
    SELECT id INTO v_existing_user_id FROM users LIMIT 1;
    SELECT ARRAY_AGG(id) INTO v_tenant_ids FROM tenant WHERE deleted_at IS NULL;
    
    FOR i IN 1..50 LOOP
        v_user_id := gen_random_uuid();
        
        INSERT INTO users (
            id, tenant_id,
            "FirstName", "LastName", 
            "Gender", "Designation", "EmployeeId", "UserStatus",
            created_at, updated_at, created_by_user_id, updated_by_user_id, "DeletedAt"
        ) VALUES (
            v_user_id,
            v_tenant_ids[(i % array_length(v_tenant_ids, 1)) + 1],
            v_first_names[i],
            v_last_names[i],
            CASE i % 3 WHEN 0 THEN 'Male' WHEN 1 THEN 'Female' ELSE 'Other' END,
            CASE i % 5 
                WHEN 0 THEN 'Doctor'
                WHEN 1 THEN 'Nurse'
                WHEN 2 THEN 'Technician'
                WHEN 3 THEN 'Admin'
                ELSE 'Specialist'
            END,
            'EMP' || LPAD(i::TEXT, 5, '0'),
            CASE WHEN i % 10 = 0 THEN 'inactive' ELSE 'active' END,
            NOW() - (random() * 90 || ' days')::INTERVAL,
            NOW() - (random() * 30 || ' days')::INTERVAL,
            v_existing_user_id,
            v_existing_user_id,
            CASE WHEN i % 10 = 0 THEN NOW() - '5 days'::INTERVAL ELSE NULL END
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Added 50 users';
END $$;

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
    SELECT ARRAY_AGG(id) INTO v_user_ids FROM users WHERE UserStatus = 'active';
    SELECT ARRAY_AGG(id) INTO v_tenant_ids FROM tenant WHERE deleted_at IS NULL;
    
    IF array_length(v_user_ids, 1) IS NULL OR array_length(v_tenant_ids, 1) IS NULL THEN
        RAISE NOTICE 'Not enough data to create audit logs';
        RETURN;
    END IF;
    
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

-- Add system alerts
INSERT INTO system_alert (alert_type, severity, title, description, count, created_at) VALUES
('password_expiry', 'warning', 'Password Expiry Warning', '23 users have passwords expiring in the next 7 days', 23, NOW() - '10 minutes'::INTERVAL),
('security', 'error', 'Failed Login Attempts', '15 failed login attempts detected from IP 192.168.1.100', 15, NOW() - '30 minutes'::INTERVAL),
('system', 'info', 'System Update Available', 'A new system update is available for installation', 0, NOW() - '1 hour'::INTERVAL),
('compliance', 'warning', 'Compliance Review Due', 'Quarterly HIPAA compliance review is due in 3 days', 0, NOW() - '2 hours'::INTERVAL),
('security', 'warning', 'SSL Certificate Renewal', 'SSL certificate expires in 15 days', 0, NOW() - '3 hours'::INTERVAL)
ON CONFLICT (id) DO NOTHING;

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
