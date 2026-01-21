-- Seed data for Hospital Portal Admin Dashboard
-- This script adds realistic data to populate the dashboard with meaningful statistics

-- Current database state:
-- Tenants: 7
-- Users: 1
-- Departments: 166
-- Branches: 6

-- We need to seed:
-- 1. More tenants (to reach ~12)
-- 2. More users (to reach ~3847) - we'll add representative sample
-- 3. User activity logs
-- 4. System alerts

BEGIN;

-- Add more tenants (5 more to reach 12 total)
DO $$
DECLARE
    v_tenant_id UUID;
    v_tenant_name TEXT;
    v_tenant_names TEXT[] := ARRAY[
        'City General Hospital',
        'Regional Medical Center', 
        'Community Health Clinic',
        'Pediatric Care Center',
        'Orthopedic Specialty Hospital'
    ];
    v_idx INT;
BEGIN
    FOR v_idx IN 1..5 LOOP
        v_tenant_id := gen_random_uuid();
        v_tenant_name := v_tenant_names[v_idx];
        
        INSERT INTO tenant (
            id, name, code, status, subscription_type, 
            max_users, contact_person, contact_email, contact_phone,
            address, city, state, country, postal_code,
            created_at, updated_at, created_by_user_id, updated_by_user_id
        ) VALUES (
            v_tenant_id,
            v_tenant_name,
            'TENANT' || LPAD(v_idx::TEXT, 3, '0'),
            'active',
            CASE 
                WHEN v_idx % 3 = 0 THEN 'enterprise'
                WHEN v_idx % 3 = 1 THEN 'professional'
                ELSE 'basic'
            END,
            CASE 
                WHEN v_idx % 3 = 0 THEN 1000
                WHEN v_idx % 3 = 1 THEN 500
                ELSE 100
            END,
            'Admin ' || v_tenant_name,
            LOWER(REPLACE(v_tenant_name, ' ', '.')) || '@hospital.com',
            '+1-555-' || LPAD((1000 + v_idx)::TEXT, 4, '0'),
            v_idx || ' Medical Plaza, Healthcare District',
            CASE 
                WHEN v_idx = 1 THEN 'New York'
                WHEN v_idx = 2 THEN 'Los Angeles'
                WHEN v_idx = 3 THEN 'Chicago'
                WHEN v_idx = 4 THEN 'Houston'
                ELSE 'Phoenix'
            END,
            CASE 
                WHEN v_idx = 1 THEN 'NY'
                WHEN v_idx = 2 THEN 'CA'
                WHEN v_idx = 3 THEN 'IL'
                WHEN v_idx = 4 THEN 'TX'
                ELSE 'AZ'
            END,
            'USA',
            LPAD((10000 + v_idx * 100)::TEXT, 5, '0'),
            NOW() - (v_idx || ' months')::INTERVAL,
            NOW() - (v_idx || ' months')::INTERVAL,
            (SELECT "Id" FROM users LIMIT 1),
            (SELECT "Id" FROM users LIMIT 1)
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Added tenant: %', v_tenant_name;
    END LOOP;
END $$;

-- Add sample users (we'll add ~50 users as representatives)
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_email TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_user_names TEXT[][] := ARRAY[
        ARRAY['Sarah', 'Johnson'], ARRAY['Michael', 'Williams'], ARRAY['Emily', 'Brown'],
        ARRAY['David', 'Jones'], ARRAY['Jessica', 'Garcia'], ARRAY['James', 'Miller'],
        ARRAY['Linda', 'Davis'], ARRAY['Robert', 'Rodriguez'], ARRAY['Patricia', 'Martinez'],
        ARRAY['John', 'Hernandez'], ARRAY['Jennifer', 'Lopez'], ARRAY['William', 'Gonzalez'],
        ARRAY['Elizabeth', 'Wilson'], ARRAY['Richard', 'Anderson'], ARRAY['Barbara', 'Thomas'],
        ARRAY['Joseph', 'Taylor'], ARRAY['Susan', 'Moore'], ARRAY['Thomas', 'Jackson'],
        ARRAY['Karen', 'Martin'], ARRAY['Christopher', 'Lee'], ARRAY['Nancy', 'Perez'],
        ARRAY['Daniel', 'Thompson'], ARRAY['Margaret', 'White'], ARRAY['Matthew', 'Harris'],
        ARRAY['Lisa', 'Sanchez'], ARRAY['Donald', 'Clark'], ARRAY['Betty', 'Ramirez'],
        ARRAY['Paul', 'Lewis'], ARRAY['Sandra', 'Robinson'], ARRAY['Mark', 'Walker'],
        ARRAY['Ashley', 'Young'], ARRAY['Steven', 'Allen'], ARRAY['Donna', 'King'],
        ARRAY['Kenneth', 'Wright'], ARRAY['Carol', 'Scott'], ARRAY['Brian', 'Torres'],
        ARRAY['Amanda', 'Nguyen'], ARRAY['Kevin', 'Hill'], ARRAY['Melissa', 'Flores'],
        ARRAY['George', 'Green'], ARRAY['Deborah', 'Adams'], ARRAY['Timothy', 'Nelson'],
        ARRAY['Dorothy', 'Baker'], ARRAY['Ronald', 'Hall'], ARRAY['Helen', 'Rivera'],
        ARRAY['Jason', 'Campbell'], ARRAY['Michelle', 'Mitchell'], ARRAY['Larry', 'Carter'],
        ARRAY['Sharon', 'Roberts'], ARRAY['Jeffrey', 'Gomez']
    ];
    v_titles TEXT[] := ARRAY['Dr.', 'Nurse', 'Admin', 'Technician', 'Specialist'];
    v_idx INT;
    v_tenant_ids UUID[];
BEGIN
    -- Get all tenant IDs
    SELECT ARRAY_AGG(id) INTO v_tenant_ids FROM tenant WHERE deleted_at IS NULL;
    
    FOR v_idx IN 1..50 LOOP
        v_user_id := gen_random_uuid();
        v_first_name := v_user_names[v_idx][1];
        v_last_name := v_user_names[v_idx][2];
        v_email := LOWER(v_first_name || '.' || v_last_name) || v_idx || '@hospital.com';
        v_tenant_id := v_tenant_ids[(v_idx % array_length(v_tenant_ids, 1)) + 1];
        
        -- Insert into AspNetUsers (users table)
        INSERT INTO users (
            "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
            "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
            "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled",
            "AccessFailedCount", "FirstName", "LastName", "IsActive", "CreatedAt"
        ) VALUES (
            v_user_id,
            v_email,
            UPPER(v_email),
            v_email,
            UPPER(v_email),
            true,
            'AQAAAAIAAYagAAAAEKxXQZ8Uh4wd5qN1F9vXJ9mQGHrMM8zQm5VkZRp0FBhqXkN+wKrLM7cZ1rXqYw==', -- Password: User123!
            gen_random_uuid()::TEXT,
            gen_random_uuid()::TEXT,
            '+1-555-' || LPAD((2000 + v_idx)::TEXT, 4, '0'),
            true,
            false,
            false,
            0,
            v_first_name,
            v_last_name,
            CASE WHEN v_idx % 10 = 0 THEN false ELSE true END,
            NOW() - (random() * 90 || ' days')::INTERVAL
        )
        ON CONFLICT ("Id") DO NOTHING;
        
        -- Add user-tenant relationship
        INSERT INTO user_tenant (
            id, user_id, tenant_id, status,
            created_at, updated_at, created_by_user_id, updated_by_user_id
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_tenant_id,
            'active',
            NOW() - (random() * 90 || ' days')::INTERVAL,
            NOW() - (random() * 30 || ' days')::INTERVAL,
            (SELECT "Id" FROM users LIMIT 1),
            (SELECT "Id" FROM users LIMIT 1)
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Add user to first branch of the tenant
        INSERT INTO user_branch (
            id, user_id, branch_id, is_primary,
            created_at, updated_at, created_by_user_id, updated_by_user_id
        )
        SELECT
            gen_random_uuid(),
            v_user_id,
            b.id,
            true,
            NOW() - (random() * 90 || ' days')::INTERVAL,
            NOW() - (random() * 30 || ' days')::INTERVAL,
            (SELECT "Id" FROM users LIMIT 1),
            (SELECT "Id" FROM users LIMIT 1)
        FROM branch b
        WHERE b.tenant_id = v_tenant_id
        LIMIT 1
        ON CONFLICT (id) DO NOTHING;
        
        IF v_idx % 10 = 0 THEN
            RAISE NOTICE 'Added % users...', v_idx;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total users added: 50';
END $$;

-- Create audit log table if not exists
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

-- Add recent activity logs (last 24 hours)
DO $$
DECLARE
    v_user_ids UUID[];
    v_tenant_ids UUID[];
    v_actions TEXT[] := ARRAY[
        'user_registration', 'user_login', 'role_assignment', 'permission_change',
        'department_creation', 'branch_creation', 'profile_update', 'password_change',
        'document_upload', 'report_generation', 'patient_admission', 'appointment_scheduled'
    ];
    v_idx INT;
    v_random_user UUID;
    v_random_tenant UUID;
BEGIN
    SELECT ARRAY_AGG("Id") INTO v_user_ids FROM users WHERE "IsActive" = true;
    SELECT ARRAY_AGG(id) INTO v_tenant_ids FROM tenant WHERE deleted_at IS NULL;
    
    FOR v_idx IN 1..1523 LOOP
        v_random_user := v_user_ids[(random() * (array_length(v_user_ids, 1) - 1))::INT + 1];
        v_random_tenant := v_tenant_ids[(random() * (array_length(v_tenant_ids, 1) - 1))::INT + 1];
        
        INSERT INTO audit_log (
            user_id, tenant_id, action_type, description, ip_address, created_at
        ) VALUES (
            v_random_user,
            v_random_tenant,
            v_actions[(random() * (array_length(v_actions, 1) - 1))::INT + 1],
            'System activity logged automatically',
            '192.168.1.' || (random() * 255)::INT,
            NOW() - (random() * 24 || ' hours')::INTERVAL
        );
    END LOOP;
    
    RAISE NOTICE 'Added 1523 activity logs for last 24 hours';
END $$;

-- Create system_alerts table if not exists
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

-- Update statistics
ANALYZE tenant;
ANALYZE users;
ANALYZE department;
ANALYZE branch;
ANALYZE audit_log;
ANALYZE system_alert;

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
    COUNT(*) FILTER (WHERE "IsActive" = true)::text
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
    COUNT(*) FILTER (WHERE created_at > NOW() - '24 hours'::INTERVAL)::text
FROM audit_log
UNION ALL
SELECT 
    'System Alerts',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE NOT is_dismissed)::text
FROM system_alert;
