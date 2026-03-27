-- =====================================================
-- Module 3: Counselor Management - Patient Type Mutability & Package Data
-- Migration: module03_04_patient_type_mutability.sql
-- Description: Adds controlled mutability for patient types, package data fields, and audit logging
-- Author: AI Assistant
-- Date: 2026-03-01
-- =====================================================

-- =====================================================
-- 1. ADD PACKAGE DATA FIELDS TO COUNSELING_SESSIONS
-- =====================================================

-- Add package selection data columns
ALTER TABLE counseling_sessions 
ADD COLUMN IF NOT EXISTS selected_package_id UUID,
ADD COLUMN IF NOT EXISTS package_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS package_addons_json TEXT,
ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50);

-- Add comments
COMMENT ON COLUMN counseling_sessions.selected_package_id IS 'Package selected during counseling session';
COMMENT ON COLUMN counseling_sessions.package_amount IS 'Total package amount including addons (for auto-fill in financial widgets)';
COMMENT ON COLUMN counseling_sessions.package_addons_json IS 'JSON string of selected package addons (Dictionary<string, bool>)';
COMMENT ON COLUMN counseling_sessions.current_stage IS 'Current workflow stage for validation (Initial, ClinicalReview, PackageSelection, Financial, etc.)';

-- Add index for package queries
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_package ON counseling_sessions(selected_package_id) WHERE selected_package_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_stage ON counseling_sessions(current_stage) WHERE current_stage IS NOT NULL;

-- =====================================================
-- 2. CREATE COUNSELING SESSION AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS counseling_session_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Session Link
    session_id UUID NOT NULL,
    
    -- Change Details
    change_type VARCHAR(50) NOT NULL, -- PatientTypeChanged, StatusChanged, StageTransition, PackageUpdated
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    
    -- Audit Fields
    changed_by_user_id UUID NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_session_audit_log_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_audit_log_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_audit_log_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. INDEXES FOR AUDIT LOG
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_session_audit_log_tenant ON counseling_session_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_session_audit_log_session ON counseling_session_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_session_audit_log_change_type ON counseling_session_audit_log(change_type);
CREATE INDEX IF NOT EXISTS idx_session_audit_log_changed_at ON counseling_session_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_audit_log_user ON counseling_session_audit_log(changed_by_user_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE counseling_session_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_session_audit_log ON counseling_session_audit_log
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 5. TRIGGER FOR AUTOMATIC PATIENT TYPE CHANGE LOGGING
-- =====================================================

-- Create trigger function to auto-log patient_type changes
CREATE OR REPLACE FUNCTION log_patient_type_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if patient_type actually changed and not NULL
    IF OLD.patient_type IS DISTINCT FROM NEW.patient_type AND NEW.patient_type IS NOT NULL THEN
        INSERT INTO counseling_session_audit_log (
            tenant_id,
            session_id,
            change_type,
            old_value,
            new_value,
            reason,
            changed_by_user_id,
            changed_at
        ) VALUES (
            NEW.tenant_id,
            NEW.id,
            'PatientTypeChanged',
            OLD.patient_type,
            NEW.patient_type,
            'Automatic trigger on update',
            COALESCE(NEW.updated_by_user_id, NEW.created_by_user_id),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_log_patient_type_change ON counseling_sessions;

CREATE TRIGGER trg_log_patient_type_change
    AFTER UPDATE ON counseling_sessions
    FOR EACH ROW
    WHEN (OLD.patient_type IS DISTINCT FROM NEW.patient_type)
    EXECUTE FUNCTION log_patient_type_change();

-- =====================================================
-- 6. VALIDATION FUNCTION FOR STAGE-BASED IMMUTABILITY
-- =====================================================

-- Create validation function (can be called from application or triggers)
CREATE OR REPLACE FUNCTION validate_patient_type_change(
    p_current_stage VARCHAR(50),
    p_old_type VARCHAR(50),
    p_new_type VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    lock_stages TEXT[] := ARRAY['Financial', 'Consent', 'PreSurgery', 'Scheduling', 'Admission', 'Followup', 'Completed'];
    valid_types TEXT[] := ARRAY['Cash', 'Insurance', 'CoPay', 'ESH', 'CGHS', 'Arograshree', 'SGHS', 'Camp'];
BEGIN
    -- If no change, allow
    IF p_old_type = p_new_type THEN
        RETURN TRUE;
    END IF;
    
    -- Check if current stage allows mutation
    IF p_current_stage = ANY(lock_stages) THEN
        RAISE EXCEPTION 'Patient type cannot be changed after % stage', p_current_stage;
    END IF;
    
    -- Validate new type is valid
    IF p_new_type != ALL(valid_types) THEN
        RAISE EXCEPTION 'Invalid patient type: %. Valid types: %', p_new_type, array_to_string(valid_types, ', ');
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT ON counseling_session_audit_log TO PUBLIC;

COMMENT ON TABLE counseling_session_audit_log IS 'Audit log for counseling session changes (patient type, stage transitions, etc.)';
COMMENT ON COLUMN counseling_session_audit_log.change_type IS 'Type of change: PatientTypeChanged, StatusChanged, StageTransition, PackageUpdated';
COMMENT ON FUNCTION log_patient_type_change() IS 'Auto-logs patient_type changes to audit log';
COMMENT ON FUNCTION validate_patient_type_change(VARCHAR, VARCHAR, VARCHAR) IS 'Validates whether patient type can be changed based on current stage';

-- =====================================================
-- MIGRATION VALIDATION
-- =====================================================

DO $$
DECLARE
    v_columns_added INT;
    v_table_exists BOOLEAN;
    v_trigger_exists BOOLEAN;
BEGIN
    -- Check if columns were added
    SELECT COUNT(*) INTO v_columns_added
    FROM information_schema.columns
    WHERE table_name = 'counseling_sessions'
    AND column_name IN ('selected_package_id', 'package_amount', 'package_addons_json', 'current_stage');
    
    -- Check if audit log table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'counseling_session_audit_log'
    ) INTO v_table_exists;
    
    -- Check if trigger exists
    SELECT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'trg_log_patient_type_change'
    ) INTO v_trigger_exists;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Migration Validation Results:';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Columns added to counseling_sessions: % of 4', v_columns_added;
    RAISE NOTICE '✓ Audit log table exists: %', v_table_exists;
    RAISE NOTICE '✓ Patient type change trigger exists: %', v_trigger_exists;
    RAISE NOTICE '============================================';
    
    IF v_columns_added < 4 OR NOT v_table_exists OR NOT v_trigger_exists THEN
        RAISE WARNING 'Migration may be incomplete. Please review.';
    ELSE
        RAISE NOTICE '✓ Migration completed successfully!';
    END IF;
END $$;

COMMIT;
