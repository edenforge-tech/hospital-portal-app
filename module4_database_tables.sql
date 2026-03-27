-- =====================================================
-- MODULE 4: DATABASE TABLES MIGRATION
-- Creates emergency_override_log and visitor_log tables
-- with indexes, RLS policies, and audit triggers
-- Date: 2026-02-04
-- =====================================================

-- =====================================================
-- 1. EMERGENCY OVERRIDE LOG TABLE
-- =====================================================

-- Drop existing table if exists (for clean re-run)
DROP TABLE IF EXISTS emergency_override_log CASCADE;

-- Create emergency_override_log table
CREATE TABLE emergency_override_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointment(id) ON DELETE SET NULL,
    visit_id UUID,  -- FK to visit table removed temporarily (table doesn't exist yet)
    override_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_VALIDATION',
    approved_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approver_name VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    overridden_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- Add FK to visit table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'visit') THEN
        ALTER TABLE emergency_override_log 
        ADD CONSTRAINT fk_emergency_override_visit 
        FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE emergency_override_log IS 'Audit log for emergency check-in overrides (MODULE 4)';
COMMENT ON COLUMN emergency_override_log.override_type IS 'Type of override: PAYMENT_VALIDATION, OUTSTANDING_BILLS, OTHER';
COMMENT ON COLUMN emergency_override_log.reason IS 'Justification for emergency override (minimum 20 characters)';
COMMENT ON COLUMN emergency_override_log.overridden_at IS 'When the override was approved';

-- Indexes for emergency_override_log
CREATE INDEX idx_emergency_override_tenant ON emergency_override_log(tenant_id);
CREATE INDEX idx_emergency_override_patient ON emergency_override_log(patient_id);
CREATE INDEX idx_emergency_override_appointment ON emergency_override_log(appointment_id) WHERE appointment_id IS NOT NULL;
CREATE INDEX idx_emergency_override_visit ON emergency_override_log(visit_id) WHERE visit_id IS NOT NULL;
CREATE INDEX idx_emergency_override_approver ON emergency_override_log(approved_by_user_id);
CREATE INDEX idx_emergency_override_date ON emergency_override_log(overridden_at);
CREATE INDEX idx_emergency_override_type ON emergency_override_log(override_type);

-- RLS Policy for emergency_override_log
ALTER TABLE emergency_override_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON emergency_override_log;
CREATE POLICY tenant_isolation ON emergency_override_log
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT ON emergency_override_log TO hospital_admin;
GRANT SELECT ON emergency_override_log TO hospital_staff;

-- =====================================================
-- 2. VISITOR LOG TABLE
-- =====================================================

-- Drop existing table if exists (for clean re-run)
DROP TABLE IF EXISTS visitor_log CASCADE;

-- Create visitor_log table
CREATE TABLE visitor_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
    visitor_name VARCHAR(200) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    patient_id UUID REFERENCES patient(id) ON DELETE SET NULL,
    patient_name VARCHAR(200),
    patient_room_number VARCHAR(50),
    purpose VARCHAR(500) NOT NULL,
    pass_number VARCHAR(50),
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, checked-out
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Add comments
COMMENT ON TABLE visitor_log IS 'Visitor check-in/check-out log (MODULE 4)';
COMMENT ON COLUMN visitor_log.status IS 'Visitor status: active (in hospital), checked-out (left)';
COMMENT ON COLUMN visitor_log.pass_number IS 'Physical visitor pass number/barcode';
COMMENT ON COLUMN visitor_log.purpose IS 'Purpose of visit (meeting patient, delivery, consultation, etc.)';

-- Indexes for visitor_log
CREATE INDEX idx_visitor_log_tenant ON visitor_log(tenant_id);
CREATE INDEX idx_visitor_log_branch ON visitor_log(branch_id);
CREATE INDEX idx_visitor_log_patient ON visitor_log(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_visitor_log_mobile ON visitor_log(mobile_number);
CREATE INDEX idx_visitor_log_status ON visitor_log(status);
CREATE INDEX idx_visitor_log_check_in ON visitor_log(check_in_time);
CREATE INDEX idx_visitor_log_check_out ON visitor_log(check_out_time) WHERE check_out_time IS NOT NULL;
CREATE INDEX idx_visitor_log_active_today ON visitor_log(branch_id, check_in_time) 
    WHERE status = 'active' AND check_in_time >= CURRENT_DATE;

-- RLS Policy for visitor_log
ALTER TABLE visitor_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON visitor_log;
CREATE POLICY tenant_isolation ON visitor_log
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON visitor_log TO hospital_admin;
GRANT SELECT, INSERT, UPDATE ON visitor_log TO hospital_staff;

-- =====================================================
-- 3. AUDIT TRIGGERS (HIPAA Compliance)
-- =====================================================

-- Emergency Override Log Audit Trigger
DROP TRIGGER IF EXISTS trg_audit_emergency_override_log ON emergency_override_log;
CREATE TRIGGER trg_audit_emergency_override_log
    AFTER INSERT OR UPDATE OR DELETE ON emergency_override_log
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- Visitor Log Audit Trigger
DROP TRIGGER IF EXISTS trg_audit_visitor_log ON visitor_log;
CREATE TRIGGER trg_audit_visitor_log
    AFTER INSERT OR UPDATE OR DELETE ON visitor_log
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- =====================================================
-- 4. UPDATE TIMESTAMP TRIGGERS
-- =====================================================

-- Auto-update updated_at for visitor_log
CREATE OR REPLACE FUNCTION update_visitor_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_visitor_log_timestamp ON visitor_log;
CREATE TRIGGER trg_update_visitor_log_timestamp
    BEFORE UPDATE ON visitor_log
    FOR EACH ROW
    EXECUTE FUNCTION update_visitor_log_timestamp();

-- =====================================================
-- 5. VALIDATION CONSTRAINTS
-- =====================================================

-- Emergency override reason must be at least 20 characters
ALTER TABLE emergency_override_log 
    ADD CONSTRAINT chk_emergency_override_reason_length 
    CHECK (length(trim(reason)) >= 20);

-- Visitor mobile number validation (basic format)
ALTER TABLE visitor_log 
    ADD CONSTRAINT chk_visitor_mobile_format 
    CHECK (mobile_number ~ '^\+?[0-9]{10,15}$');

-- Visitor status validation
ALTER TABLE visitor_log 
    ADD CONSTRAINT chk_visitor_status 
    CHECK (status IN ('active', 'checked-out'));

-- Override type validation
ALTER TABLE emergency_override_log 
    ADD CONSTRAINT chk_override_type 
    CHECK (override_type IN ('PAYMENT_VALIDATION', 'OUTSTANDING_BILLS', 'OTHER'));

-- Check-out time must be after check-in time
ALTER TABLE visitor_log 
    ADD CONSTRAINT chk_visitor_checkout_after_checkin 
    CHECK (check_out_time IS NULL OR check_out_time >= check_in_time);

-- =====================================================
-- 6. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample emergency override (if test data exists)
DO $$
DECLARE
    v_tenant_id UUID;
    v_patient_id UUID;
    v_user_id UUID;
    v_appointment_id UUID;
BEGIN
    -- Get test tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Get test patient
        SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;
        
        -- Get test user (admin)
        SELECT id INTO v_user_id FROM users WHERE tenant_id = v_tenant_id AND user_name = 'admin@test.com' LIMIT 1;
        
        -- Get test appointment
        SELECT id INTO v_appointment_id FROM appointment WHERE patient_id = v_patient_id LIMIT 1;
        
        IF v_patient_id IS NOT NULL AND v_user_id IS NOT NULL THEN
            -- Insert sample emergency override
            INSERT INTO emergency_override_log (
                id, tenant_id, patient_id, appointment_id, override_type,
                approved_by_user_id, approver_name, reason, overridden_at,
                created_at, created_by_user_id
            ) VALUES (
                gen_random_uuid(),
                v_tenant_id,
                v_patient_id,
                v_appointment_id,
                'PAYMENT_VALIDATION',
                v_user_id,
                'Dr. Admin Test',
                'Patient in critical condition requiring immediate care - payment to be collected later',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                v_user_id
            ) ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Sample emergency override log created';
        END IF;
    END IF;
END $$;

-- Insert sample visitor log (if test data exists)
DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_patient_id UUID;
    v_user_id UUID;
BEGIN
    -- Get test tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Get test branch
        SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
        
        -- Get test patient
        SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;
        
        -- Get test user
        SELECT id INTO v_user_id FROM users WHERE tenant_id = v_tenant_id LIMIT 1;
        
        IF v_branch_id IS NOT NULL THEN
            -- Insert sample visitor
            INSERT INTO visitor_log (
                id, tenant_id, branch_id, visitor_name, mobile_number,
                patient_id, patient_name, patient_room_number, purpose,
                pass_number, check_in_time, status, created_at, updated_at,
                created_by_user_id
            ) VALUES (
                gen_random_uuid(),
                v_tenant_id,
                v_branch_id,
                'John Smith',
                '+919876543210',
                v_patient_id,
                'Test Patient',
                'Room 301',
                'Visiting family member admitted for eye surgery',
                'PASS-001',
                CURRENT_TIMESTAMP,
                'active',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                v_user_id
            ) ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Sample visitor log created';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify tables created
SELECT 
    schemaname, tablename, tableowner 
FROM pg_tables 
WHERE tablename IN ('emergency_override_log', 'visitor_log')
ORDER BY tablename;

-- Verify indexes
SELECT 
    tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('emergency_override_log', 'visitor_log')
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('emergency_override_log', 'visitor_log')
ORDER BY tablename;

-- Verify triggers
SELECT 
    event_object_table, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('emergency_override_log', 'visitor_log')
ORDER BY event_object_table, trigger_name;

-- Count records
SELECT 
    (SELECT COUNT(*) FROM emergency_override_log) as override_count,
    (SELECT COUNT(*) FROM visitor_log) as visitor_count;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

RAISE NOTICE '✅ MODULE 4 Database Tables Migration Complete';
RAISE NOTICE '   - emergency_override_log table created';
RAISE NOTICE '   - visitor_log table created';
RAISE NOTICE '   - Indexes added (14 total)';
RAISE NOTICE '   - RLS policies enabled';
RAISE NOTICE '   - Audit triggers configured';
RAISE NOTICE '   - Validation constraints added';
