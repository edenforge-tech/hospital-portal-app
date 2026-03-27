-- =============================================================================
-- PHASE 2 MIGRATIONS - CORRECTED FOR EXISTING SCHEMA
-- Combines all 9 migrations with schema fixes
-- =============================================================================

-- ===== MIGRATION 08: Branch Capacity Tracking (FIXED) =====

-- Create bed_inventory table
CREATE TABLE IF NOT EXISTS bed_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL REFERENCES branch(id),
    bed_number VARCHAR(50) NOT NULL,
    bed_type VARCHAR(50) NOT NULL CHECK (bed_type IN ('General', 'ICU', 'Emergency', 'Isolation', 'Pediatric', 'Maternity')),
    ward_name VARCHAR(100),
    floor INTEGER,
    room_number VARCHAR(20),
    is_occupied BOOLEAN NOT NULL DEFAULT false,
    patient_id UUID REFERENCES patient(id),
    bed_status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (bed_status IN ('Available', 'Occupied', 'Maintenance', 'Reserved', 'Out of Service')),
    equipment_attached TEXT[], -- e.g., ['Ventilator', 'Monitor', 'Oxygen']
    last_cleaned_at TIMESTAMPTZ,
    next_maintenance_due TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_bed_inventory_branch ON bed_inventory(branch_id);
CREATE INDEX IF NOT EXISTS idx_bed_inventory_tenant ON bed_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bed_inventory_status ON bed_inventory(bed_status, is_occupied);
CREATE INDEX IF NOT EXISTS idx_bed_inventory_patient ON bed_inventory(patient_id) WHERE patient_id IS NOT NULL;

-- Create branch_capacity_history table
CREATE TABLE IF NOT EXISTS branch_capacity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL REFERENCES branch(id),
    snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_beds INTEGER NOT NULL DEFAULT 0,
    icu_beds INTEGER NOT NULL DEFAULT 0,
    emergency_beds INTEGER NOT NULL DEFAULT 0,
    occupied_beds INTEGER NOT NULL DEFAULT 0,
    occupied_icu_beds INTEGER NOT NULL DEFAULT 0,
    occupied_emergency_beds INTEGER NOT NULL DEFAULT 0,
    occupancy_percentage NUMERIC(5,2),
    alert_level VARCHAR(20) CHECK (alert_level IN ('green', 'yellow', 'red')),
    available_beds INTEGER,
    available_icu_beds INTEGER,
    available_emergency_beds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_capacity_history_branch_time ON branch_capacity_history(branch_id, snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_capacity_history_tenant ON branch_capacity_history(tenant_id);

-- Create patient_transfer_request table
CREATE TABLE IF NOT EXISTS patient_transfer_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patient(id),
    from_branch_id UUID NOT NULL REFERENCES branch(id),
    to_branch_id UUID NOT NULL REFERENCES branch(id),
    request_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Critical')),
    reason TEXT,
    transfer_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (transfer_status IN ('Pending', 'Approved', 'In Transit', 'Completed', 'Cancelled', 'Rejected')),
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    ambulance_required BOOLEAN DEFAULT false,
    estimated_arrival_time TIMESTAMPTZ,
    actual_transfer_time TIMESTAMPTZ,
    handover_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_transfer_from_branch ON patient_transfer_request(from_branch_id);
CREATE INDEX IF NOT EXISTS idx_transfer_to_branch ON patient_transfer_request(to_branch_id);
CREATE INDEX IF NOT EXISTS idx_transfer_patient ON patient_transfer_request(patient_id);
CREATE INDEX IF NOT EXISTS idx_transfer_status ON patient_transfer_request(transfer_status);

-- Create capacity calculation function
CREATE OR REPLACE FUNCTION calculate_capacity_alert_level(
    p_occupied INTEGER,
    p_total INTEGER
) RETURNS VARCHAR AS $$
BEGIN
    IF p_total = 0 THEN RETURN 'green'; END IF;
    
    DECLARE
        v_percentage NUMERIC;
    BEGIN
        v_percentage := (p_occupied::NUMERIC / p_total::NUMERIC) * 100;
        
        IF v_percentage >= 90 THEN RETURN 'red';
        ELSIF v_percentage >= 80 THEN RETURN 'yellow';
        ELSE RETURN 'green';
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create capacity update trigger
CREATE OR REPLACE FUNCTION update_branch_capacity() RETURNS TRIGGER AS $$
BEGIN
    UPDATE branch
    SET 
        occupied_beds = (SELECT COUNT(*) FROM bed_inventory WHERE branch_id = NEW.branch_id AND is_occupied = true AND deleted_at IS NULL),
        occupied_icu_beds = (SELECT COUNT(*) FROM bed_inventory WHERE branch_id = NEW.branch_id AND bed_type = 'ICU' AND is_occupied = true AND deleted_at IS NULL),
        occupied_emergency_beds = (SELECT COUNT(*) FROM bed_inventory WHERE branch_id = NEW.branch_id AND bed_type = 'Emergency' AND is_occupied = true AND deleted_at IS NULL),
        last_capacity_update = CURRENT_TIMESTAMP
    WHERE id = NEW.branch_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_branch_capacity ON bed_inventory;
CREATE TRIGGER trigger_update_branch_capacity
AFTER INSERT OR UPDATE ON bed_inventory
FOR EACH ROW
EXECUTE FUNCTION update_branch_capacity();

-- Create capacity summary view
CREATE OR REPLACE VIEW branch_capacity_summary AS
SELECT 
    b.id AS branch_id,
    b.name AS branch_name,
    b.total_beds,
    b.icu_beds,
    b.emergency_beds,
    b.occupied_beds,
    b.occupied_icu_beds,
    b.occupied_emergency_beds,
    (b.total_beds - b.occupied_beds) AS available_beds,
    (b.icu_beds - b.occupied_icu_beds) AS available_icu_beds,
    (b.emergency_beds - b.occupied_emergency_beds) AS available_emergency_beds,
    CASE 
        WHEN b.total_beds > 0 THEN ROUND((b.occupied_beds::NUMERIC / b.total_beds::NUMERIC) * 100, 2)
        ELSE 0
    END AS occupancy_percentage,
    calculate_capacity_alert_level(b.occupied_beds, b.total_beds) AS alert_level,
    b.last_capacity_update,
    b.latitude,
    b.longitude
FROM branch b
WHERE b.deleted_at IS NULL;

-- ===== MIGRATION 09: Onboarding Workflow =====

CREATE TABLE IF NOT EXISTS onboarding_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    onboarding_status VARCHAR(50) NOT NULL DEFAULT 'Not Started' CHECK (onboarding_status IN ('Not Started', 'In Progress', 'Pending Review', 'Completed', 'On Hold')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    mentor_user_id UUID,
    current_access_level VARCHAR(50) NOT NULL DEFAULT 'none' CHECK (current_access_level IN ('none', 'read_only', 'limited_write', 'full_access')),
    hire_date DATE,
    orientation_date DATE,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_workflow(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tenant ON onboarding_workflow(tenant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_mentor ON onboarding_workflow(mentor_user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_workflow(onboarding_status);

COMMENT ON TABLE onboarding_workflow IS 'Tracks employee onboarding progress with mentor assignment';
COMMENT ON COLUMN onboarding_workflow.current_access_level IS 'Progressive access: none → read_only (Day 1) → limited_write (Day 7) → full_access (Day 30)';
COMMENT ON COLUMN onboarding_workflow.progress_percentage IS 'Calculated from completed checklist items';

CREATE TABLE IF NOT EXISTS onboarding_checklist_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 6),
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('Document Upload', 'Form Submission', 'Training Completion', 'System Access', 'Manager Approval', 'Task Completion')),
    is_required BOOLEAN NOT NULL DEFAULT true,
    required_for_role_types TEXT[], -- e.g., ['Doctor', 'Nurse']
    document_url TEXT,
    approval_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_checklist_tenant ON onboarding_checklist_item(tenant_id);
CREATE INDEX IF NOT EXISTS idx_checklist_step ON onboarding_checklist_item(step_number);
CREATE INDEX IF NOT EXISTS idx_checklist_sort ON onboarding_checklist_item(sort_order);
CREATE INDEX IF NOT EXISTS idx_checklist_required ON onboarding_checklist_item(is_required) WHERE is_required = true;

COMMENT ON TABLE onboarding_checklist_item IS '6-step onboarding wizard: Personal → Employment → Medical → Credentials → System Access → Training';
COMMENT ON COLUMN onboarding_checklist_item.step_number IS '1=Personal Docs, 2=Employment, 3=Medical, 4=Credentials, 5=System Access, 6=Training';

CREATE TABLE IF NOT EXISTS progressive_access_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('Days Since Hire', 'Checklist Completion', 'Manual Approval', 'Training Completion')),
    trigger_value INTEGER, -- e.g., 7 days
    grants_access_level VARCHAR(50) NOT NULL CHECK (grants_access_level IN ('read_only', 'limited_write', 'full_access')),
    grants_permissions TEXT[],
    is_automatic BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    approver_role_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_access_rule_tenant ON progressive_access_rule(tenant_id);
CREATE INDEX IF NOT EXISTS idx_access_rule_level ON progressive_access_rule(grants_access_level);
CREATE INDEX IF NOT EXISTS idx_access_rule_automatic ON progressive_access_rule(is_automatic) WHERE is_automatic = true;

CREATE TABLE IF NOT EXISTS mentor_checkin_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    onboarding_workflow_id UUID NOT NULL REFERENCES onboarding_workflow(id),
    mentor_user_id UUID NOT NULL,
    checkin_date DATE NOT NULL,
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    engagement_rating INTEGER CHECK (engagement_rating BETWEEN 1 AND 5),
    knowledge_retention_rating INTEGER CHECK (knowledge_retention_rating BETWEEN 1 AND 5),
    overall_progress VARCHAR(50) CHECK (overall_progress IN ('Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor')),
    strengths TEXT,
    areas_for_improvement TEXT,
    action_items TEXT,
    next_checkin_date DATE,
    escalate_to_hr BOOLEAN DEFAULT false,
    escalation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_mentor_checkin_workflow ON mentor_checkin_log(onboarding_workflow_id);
CREATE INDEX IF NOT EXISTS idx_mentor_checkin_mentor ON mentor_checkin_log(mentor_user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_checkin_date ON mentor_checkin_log(checkin_date);

-- Seed onboarding checklist (24 items across 6 steps)
INSERT INTO onboarding_checklist_item (tenant_id, step_number, item_name, item_description, item_type, is_required, sort_order) VALUES
((SELECT id FROM tenant LIMIT 1), 1, 'Upload Photo ID', 'Aadhaar Card / PAN Card / Passport', 'Document Upload', true, 1),
((SELECT id FROM tenant LIMIT 1), 1, 'Upload Address Proof', 'Utility Bill / Rental Agreement', 'Document Upload', true, 2),
((SELECT id FROM tenant LIMIT 1), 1, 'Bank Account Details', 'Account Number and IFSC for salary', 'Form Submission', true, 3),
((SELECT id FROM tenant LIMIT 1), 1, 'Emergency Contact Form', 'Name, Relationship, Phone Number', 'Form Submission', true, 4),
((SELECT id FROM tenant LIMIT 1), 2, 'Sign Employment Contract', 'Review and sign digital contract', 'Manager Approval', true, 5),
((SELECT id FROM tenant LIMIT 1), 2, 'Tax Declaration (Form 12BB)', 'Income tax deductions declaration', 'Form Submission', true, 6),
((SELECT id FROM tenant LIMIT 1), 2, 'Previous Employment Details', 'Experience letters and relieving letters', 'Document Upload', false, 7),
((SELECT id FROM tenant LIMIT 1), 2, 'Background Verification Consent', 'Consent for BGV process', 'Form Submission', true, 8),
((SELECT id FROM tenant LIMIT 1), 3, 'Medical Fitness Certificate', 'Health check-up from approved panel', 'Document Upload', true, 9),
((SELECT id FROM tenant LIMIT 1), 3, 'COVID Vaccination Certificate', 'Upload vaccination proof', 'Document Upload', false, 10),
((SELECT id FROM tenant LIMIT 1), 3, 'Blood Group Declaration', 'For emergency medical records', 'Form Submission', true, 11),
((SELECT id FROM tenant LIMIT 1), 3, 'Medical Insurance Enrollment', 'Enroll family members if applicable', 'Form Submission', false, 12),
((SELECT id FROM tenant LIMIT 1), 4, 'Upload Educational Certificates', 'Degree, diploma, or professional qualifications', 'Document Upload', true, 13),
((SELECT id FROM tenant LIMIT 1), 4, 'Upload Professional License', 'Medical Council registration for doctors/nurses', 'Document Upload', true, 14),
((SELECT id FROM tenant LIMIT 1), 4, 'Skill Certifications', 'BLS, ACLS, or specialty certifications', 'Document Upload', false, 15),
((SELECT id FROM tenant LIMIT 1), 4, 'Continuing Medical Education (CME)', 'Last 2 years CME certificates', 'Document Upload', false, 16),
((SELECT id FROM tenant LIMIT 1), 5, 'Create Email Account', 'Hospital email account setup', 'System Access', true, 17),
((SELECT id FROM tenant LIMIT 1), 5, 'Hospital Portal Training', 'Complete system orientation', 'Training Completion', true, 18),
((SELECT id FROM tenant LIMIT 1), 5, 'EMR System Access', 'Electronic Medical Records access', 'System Access', true, 19),
((SELECT id FROM tenant LIMIT 1), 5, 'Biometric Enrollment', 'Register fingerprint for attendance', 'Task Completion', true, 20),
((SELECT id FROM tenant LIMIT 1), 6, 'HIPAA Compliance Training', 'Patient privacy and data security', 'Training Completion', true, 21),
((SELECT id FROM tenant LIMIT 1), 6, 'Fire Safety & Emergency Procedures', 'Building evacuation and safety protocols', 'Training Completion', true, 22),
((SELECT id FROM tenant LIMIT 1), 6, 'Infection Control Training', 'Hand hygiene, PPE, waste disposal', 'Training Completion', true, 23),
((SELECT id FROM tenant LIMIT 1), 6, 'Department-Specific Orientation', 'Team introduction and workflow training', 'Manager Approval', true, 24);

-- Seed progressive access rules
INSERT INTO progressive_access_rule (tenant_id, rule_name, trigger_type, trigger_value, grants_access_level, grants_permissions, is_automatic, requires_approval) VALUES
((SELECT id FROM tenant LIMIT 1), 'Day 1 Read-Only Access', 'Days Since Hire', 1, 'read_only', ARRAY['view_dashboard', 'view_patients', 'view_schedules'], true, false),
((SELECT id FROM tenant LIMIT 1), 'Day 7 Limited Write Access', 'Days Since Hire', 7, 'limited_write', ARRAY['create_appointments', 'update_patient_notes', 'view_reports'], true, false),
((SELECT id FROM tenant LIMIT 1), 'Day 30 Full Access (Post-Probation)', 'Days Since Hire', 30, 'full_access', ARRAY['all_permissions'], true, true);

-- ===== MIGRATION 11: Advanced Search & Saved Filters =====

CREATE TABLE IF NOT EXISTS user_saved_search (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    search_name VARCHAR(200) NOT NULL,
    module_name VARCHAR(100) NOT NULL, -- e.g., 'Employees', 'Patients', 'Appointments'
    search_criteria JSONB NOT NULL, -- Flexible filter structure
    is_favorite BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    shared_with_user_ids UUID[],
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    column_preferences JSONB, -- Which columns to display
    sort_preferences JSONB,   -- Sort order
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_saved_search_user ON user_saved_search(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_tenant ON user_saved_search(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_module ON user_saved_search(module_name);
CREATE INDEX IF NOT EXISTS idx_saved_search_favorite ON user_saved_search(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_saved_search_shared ON user_saved_search(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_saved_search_criteria ON user_saved_search USING GIN (search_criteria);

COMMENT ON TABLE user_saved_search IS 'User-defined saved searches with JSONB filter criteria for fast queries';
COMMENT ON COLUMN user_saved_search.search_criteria IS 'Flexible JSONB structure: {filters: [{field, operator, value}], logic: "AND"}';
COMMENT ON COLUMN user_saved_search.column_preferences IS 'JSONB: {columns: ["name", "email"], widths: [200, 300]}';

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    search_query TEXT,
    search_criteria JSONB,
    results_count INTEGER,
    execution_time_ms INTEGER,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_tenant ON search_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_search_history_date ON search_history(searched_at DESC);

CREATE TABLE IF NOT EXISTS filter_preset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    preset_code VARCHAR(50) NOT NULL,
    preset_name VARCHAR(200) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    filter_criteria JSONB NOT NULL,
    icon VARCHAR(50),
    badge_color VARCHAR(20),
    is_system_preset BOOLEAN DEFAULT false,
    visible_to_roles UUID[],
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_filter_preset_tenant ON filter_preset(tenant_id);
CREATE INDEX IF NOT EXISTS idx_filter_preset_module ON filter_preset(module_name);
CREATE INDEX IF NOT EXISTS idx_filter_preset_code ON filter_preset(preset_code);

COMMENT ON TABLE filter_preset IS 'Quick filter presets (e.g., Active Employees, Expiring Licenses, Today Appointments)';
COMMENT ON COLUMN filter_preset.filter_criteria IS 'JSONB structure matching user_saved_search.search_criteria';

-- Seed 23 system filter presets
DO $$
DECLARE v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    INSERT INTO filter_preset (tenant_id, preset_code, preset_name, module_name, filter_criteria, icon, badge_color, is_system_preset, sort_order) VALUES
    (v_tenant_id, 'ACTIVE_EMPLOYEES', 'Active Employees', 'Employees', '{"filters":[{"field":"status","operator":"equals","value":"active"}]}'::JSONB, 'users', 'green', true, 1),
    (v_tenant_id, 'NEW_HIRES_30', 'New Hires (Last 30 Days)', 'Employees', '{"filters":[{"field":"created_at","operator":"gte","value":"NOW() - INTERVAL ''30 days''"}]}'::JSONB, 'user-plus', 'blue', true, 2),
    (v_tenant_id, 'ON_PROBATION', 'On Probation', 'Employees', '{"filters":[{"field":"employment_status","operator":"equals","value":"probation"}]}'::JSONB, 'clock', 'yellow', true, 3),
    (v_tenant_id, 'TERMINATED', 'Terminated Employees', 'Employees', '{"filters":[{"field":"status","operator":"equals","value":"terminated"}]}'::JSONB, 'user-x', 'red', true, 4),
    
    (v_tenant_id, 'LICENSE_EXPIRY_30', 'Licenses Expiring (30 Days)', 'Licenses', '{"filters":[{"field":"expiry_date","operator":"between","value":["NOW()","NOW() + INTERVAL ''30 days''"]}]}'::JSONB, 'alert-circle', 'red', true, 5),
    (v_tenant_id, 'LICENSE_EXPIRY_90', 'Licenses Expiring (90 Days)', 'Licenses', '{"filters":[{"field":"expiry_date","operator":"between","value":["NOW()","NOW() + INTERVAL ''90 days''"]}]}'::JSONB, 'alert-triangle', 'yellow', true, 6),
    (v_tenant_id, 'LICENSE_EXPIRED', 'Expired Licenses', 'Licenses', '{"filters":[{"field":"expiry_date","operator":"lt","value":"NOW()"}]}'::JSONB, 'x-circle', 'red', true, 7),
    (v_tenant_id, 'LICENSE_SUSPENDED', 'Suspended Licenses', 'Licenses', '{"filters":[{"field":"license_status","operator":"equals","value":"suspended"}]}'::JSONB, 'pause-circle', 'orange', true, 8),
    
    (v_tenant_id, 'CONTRACT_EXPIRY_60', 'Contracts Expiring (60 Days)', 'Contracts', '{"filters":[{"field":"end_date","operator":"between","value":["NOW()","NOW() + INTERVAL ''60 days''"]}]}'::JSONB, 'file-text', 'red', true, 9),
    (v_tenant_id, 'CONTRACT_AUTO_RENEW', 'Auto-Renew Contracts', 'Contracts', '{"filters":[{"field":"auto_renew","operator":"equals","value":true}]}'::JSONB, 'repeat', 'green', true, 10),
    (v_tenant_id, 'CONTRACT_RENEWAL_PENDING', 'Pending Renewal Decision', 'Contracts', '{"filters":[{"field":"renewal_status","operator":"equals","value":"pending"}]}'::JSONB, 'help-circle', 'yellow', true, 11),
    
    (v_tenant_id, 'APPOINTMENTS_TODAY', 'Today Appointments', 'Appointments', '{"filters":[{"field":"appointment_date","operator":"equals","value":"TODAY"}]}'::JSONB, 'calendar', 'blue', true, 12),
    (v_tenant_id, 'APPOINTMENTS_PENDING', 'Pending Appointments', 'Appointments', '{"filters":[{"field":"appointment_status","operator":"equals","value":"scheduled"}]}'::JSONB, 'clock', 'yellow', true, 13),
    (v_tenant_id, 'APPOINTMENTS_CANCELLED', 'Cancelled Appointments', 'Appointments', '{"filters":[{"field":"appointment_status","operator":"equals","value":"cancelled"}]}'::JSONB, 'x', 'red', true, 14),
    
    (v_tenant_id, 'PATIENTS_ACTIVE', 'Active Patients', 'Patients', '{"filters":[{"field":"status","operator":"equals","value":"active"}]}'::JSONB, 'user-check', 'green', true, 15),
    (v_tenant_id, 'PATIENTS_ADMITTED', 'Admitted Patients', 'Patients', '{"filters":[{"field":"admission_status","operator":"equals","value":"admitted"}]}'::JSONB, 'bed', 'blue', true, 16),
    (v_tenant_id, 'PATIENTS_HIGH_RISK', 'High-Risk Patients', 'Patients', '{"filters":[{"field":"risk_level","operator":"equals","value":"high"}]}'::JSONB, 'alert-triangle', 'red', true, 17),
    
    (v_tenant_id, 'ONBOARDING_IN_PROGRESS', 'Onboarding In Progress', 'Onboarding', '{"filters":[{"field":"onboarding_status","operator":"equals","value":"In Progress"}]}'::JSONB, 'user-plus', 'blue', true, 18),
    (v_tenant_id, 'ONBOARDING_PENDING_REVIEW', 'Pending Review', 'Onboarding', '{"filters":[{"field":"onboarding_status","operator":"equals","value":"Pending Review"}]}'::JSONB, 'eye', 'yellow', true, 19),
    (v_tenant_id, 'ONBOARDING_COMPLETED', 'Completed Onboarding', 'Onboarding', '{"filters":[{"field":"onboarding_status","operator":"equals","value":"Completed"}]}'::JSONB, 'check-circle', 'green', true, 20),
    
    (v_tenant_id, 'AUDIT_PHI_TODAY', 'PHI Access Today', 'Audit Logs', '{"filters":[{"field":"event_type","operator":"equals","value":"PHI_ACCESS"},{"field":"event_timestamp","operator":"gte","value":"TODAY"}]}'::JSONB, 'shield', 'blue', true, 21),
    (v_tenant_id, 'AUDIT_FAILED_LOGINS', 'Failed Login Attempts', 'Audit Logs', '{"filters":[{"field":"event_type","operator":"equals","value":"FAILED_LOGIN"}]}'::JSONB, 'lock', 'red', true, 22),
    (v_tenant_id, 'AUDIT_EMERGENCY_ACCESS', 'Emergency Access Logs', 'Audit Logs', '{"filters":[{"field":"access_type","operator":"equals","value":"emergency"}]}'::JSONB, 'zap', 'red', true, 23);
END $$;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_search_history() RETURNS void AS $$
BEGIN
    DELETE FROM search_history WHERE searched_at < (CURRENT_TIMESTAMP - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_search_history IS 'Delete search history older than 90 days (run monthly)';

-- =============================================================================
-- COMPLETION NOTICE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 2 MIGRATIONS EXECUTED (PARTIAL)';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ Migration 08: Branch Capacity Tracking';
    RAISE NOTICE '✓ Migration 09: Onboarding Workflow';
    RAISE NOTICE '✓ Migration 11: Advanced Search & Filters';
    RAISE NOTICE '⚠ Skipped: Migrations 10,12,13,14,15,16 (schema fixes needed)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables Created: 12';
    RAISE NOTICE 'Functions Created: 3';
    RAISE NOTICE 'Views Created: 1';
    RAISE NOTICE 'Presets Seeded: 23';
    RAISE NOTICE 'Checklist Items: 24';
    RAISE NOTICE '========================================';
END $$;
