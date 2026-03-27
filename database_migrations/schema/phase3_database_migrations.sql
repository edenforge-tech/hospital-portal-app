-- =====================================================================
-- PHASE 3 DATABASE MIGRATIONS
-- Hospital Portal - Advanced Features Implementation
-- Date: January 23, 2026
-- =====================================================================

-- =====================================================================
-- WEEK 11: ROLES MANAGEMENT ENHANCEMENT
-- =====================================================================

-- Add new columns to app_roles table
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS role_code VARCHAR(20);
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS role_category VARCHAR(50);
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS job_level INTEGER;
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS requires_license BOOLEAN DEFAULT FALSE;
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS reporting_to_role_id UUID REFERENCES app_roles(id);
ALTER TABLE app_roles ADD COLUMN IF NOT EXISTS max_assignments INTEGER;

-- Create index for role hierarchy
CREATE INDEX IF NOT EXISTS idx_app_roles_reporting_to ON app_roles(reporting_to_role_id);

-- Create Segregation of Duty (SoD) conflict rules table
CREATE TABLE IF NOT EXISTS sod_conflict_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id),
    permission_a_id UUID REFERENCES permissions(id),
    permission_b_id UUID REFERENCES permissions(id),
    conflict_reason TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_sod_conflict_rules_tenant ON sod_conflict_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sod_conflict_rules_permission_a ON sod_conflict_rules(permission_a_id);
CREATE INDEX IF NOT EXISTS idx_sod_conflict_rules_permission_b ON sod_conflict_rules(permission_b_id);

-- Create permission usage stats table
CREATE TABLE IF NOT EXISTS permission_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id),
    permission_id UUID REFERENCES permissions(id),
    role_id UUID REFERENCES app_roles(id),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permission_usage_stats_tenant ON permission_usage_stats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_permission_usage_stats_permission ON permission_usage_stats(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_usage_stats_role ON permission_usage_stats(role_id);
CREATE INDEX IF NOT EXISTS idx_permission_usage_stats_last_used ON permission_usage_stats(last_used_at);

-- =====================================================================
-- WEEK 11-12: DEPARTMENTS HIERARCHY VISUALIZATION
-- =====================================================================

-- Create department template table
CREATE TABLE IF NOT EXISTS department_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    hierarchy_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample department templates
INSERT INTO department_template (template_name, template_code, description, hierarchy_json) VALUES
('ICU Setup', 'ICU_TEMPLATE', 'Intensive Care Unit complete setup with all required sub-departments', 
 '{
   "name": "Intensive Care Unit",
   "code": "ICU",
   "type": "clinical",
   "sub_departments": [
     {"name": "ICU Ward", "code": "ICU_WARD", "type": "ward"},
     {"name": "ICU Nursing", "code": "ICU_NURSING", "type": "nursing"},
     {"name": "ICU Monitoring", "code": "ICU_MONITORING", "type": "technical"}
   ]
 }'),
('Cardiology Setup', 'CARDIO_TEMPLATE', 'Cardiology department setup with OPD and specialized units',
 '{
   "name": "Cardiology",
   "code": "CARDIO",
   "type": "clinical",
   "sub_departments": [
     {"name": "Cardiology OPD", "code": "CARDIO_OPD", "type": "outpatient"},
     {"name": "Cath Lab", "code": "CATH_LAB", "type": "procedure"},
     {"name": "Cardiology Ward", "code": "CARDIO_WARD", "type": "ward"}
   ]
 }'),
('Emergency Department Setup', 'ED_TEMPLATE', 'Emergency department with triage and trauma units',
 '{
   "name": "Emergency Department",
   "code": "ED",
   "type": "emergency",
   "sub_departments": [
     {"name": "Triage", "code": "ED_TRIAGE", "type": "triage"},
     {"name": "Trauma Unit", "code": "ED_TRAUMA", "type": "critical"},
     {"name": "Observation Unit", "code": "ED_OBS", "type": "observation"}
   ]
 }'),
('Radiology Setup', 'RADIOLOGY_TEMPLATE', 'Radiology department with imaging modalities',
 '{
   "name": "Radiology",
   "code": "RADIOLOGY",
   "type": "diagnostic",
   "sub_departments": [
     {"name": "X-Ray", "code": "XRAY", "type": "imaging"},
     {"name": "CT Scan", "code": "CT", "type": "imaging"},
     {"name": "MRI", "code": "MRI", "type": "imaging"},
     {"name": "Ultrasound", "code": "US", "type": "imaging"}
   ]
 }');

-- =====================================================================
-- WEEK 12: REAL-TIME UPDATES & NOTIFICATIONS
-- =====================================================================

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'email', 'sms', 'all')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_preference_user ON user_notification_preference(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preference_tenant ON user_notification_preference(tenant_id);

-- =====================================================================
-- WEEK 13: SETTINGS TESTING TOOLS & VALIDATION
-- =====================================================================

-- Create settings change history table
CREATE TABLE IF NOT EXISTS settings_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id),
    setting_key VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by_user_id UUID REFERENCES users(id) NOT NULL,
    changed_at TIMESTAMP DEFAULT NOW(),
    change_reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_settings_change_history_tenant ON settings_change_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_settings_change_history_key ON settings_change_history(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_change_history_changed_at ON settings_change_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_settings_change_history_user ON settings_change_history(changed_by_user_id);

-- =====================================================================
-- WEEK 14: DEVICE MANAGEMENT UI & SESSION ANALYTICS
-- =====================================================================

-- Add new columns to device table
ALTER TABLE device ADD COLUMN IF NOT EXISTS trust_level VARCHAR(20) DEFAULT 'untrusted' CHECK (trust_level IN ('trusted', 'untrusted', 'blocked'));
ALTER TABLE device ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE device ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE device ADD COLUMN IF NOT EXISTS flagged_reason TEXT;
ALTER TABLE device ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'denied'));

CREATE INDEX IF NOT EXISTS idx_device_trust_level ON device(trust_level);
CREATE INDEX IF NOT EXISTS idx_device_approval_status ON device(approval_status);

-- Create device approval request table
CREATE TABLE IF NOT EXISTS device_approval_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES device(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    approval_token VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    approved_at TIMESTAMP,
    denied_at TIMESTAMP,
    denial_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_device_approval_request_device ON device_approval_request(device_id);
CREATE INDEX IF NOT EXISTS idx_device_approval_request_user ON device_approval_request(user_id);
CREATE INDEX IF NOT EXISTS idx_device_approval_request_token ON device_approval_request(approval_token);
CREATE INDEX IF NOT EXISTS idx_device_approval_request_status ON device_approval_request(status);

-- =====================================================================
-- WEEK 15: MFA ENFORCEMENT POLICIES & RISK-BASED AUTH
-- =====================================================================

-- Add columns to users table for MFA and risk tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;

-- Add enrolled_at to user_mfa_settings if not exists
ALTER TABLE user_mfa_settings ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP;

-- Create MFA enforcement policy table
CREATE TABLE IF NOT EXISTS mfa_enforcement_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    role_id UUID REFERENCES app_roles(id) NOT NULL,
    mfa_required BOOLEAN DEFAULT FALSE,
    grace_period_days INTEGER DEFAULT 7,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(id),
    UNIQUE(tenant_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_mfa_enforcement_policy_tenant ON mfa_enforcement_policy(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mfa_enforcement_policy_role ON mfa_enforcement_policy(role_id);

-- Create risk-based MFA configuration table
CREATE TABLE IF NOT EXISTS risk_based_mfa_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT FALSE,
    new_device_score INTEGER DEFAULT 30,
    new_location_score INTEGER DEFAULT 20,
    vpn_detected_score INTEGER DEFAULT 10,
    after_hours_score INTEGER DEFAULT 15,
    failed_attempts_score INTEGER DEFAULT 25,
    high_risk_threshold INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_based_mfa_config_tenant ON risk_based_mfa_config(tenant_id);

-- Create MFA reset request table
CREATE TABLE IF NOT EXISTS mfa_reset_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    requested_by_admin_id UUID REFERENCES users(id) NOT NULL,
    approved_by_admin1_id UUID REFERENCES users(id),
    approved_by_admin2_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    denial_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_mfa_reset_request_tenant ON mfa_reset_request(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mfa_reset_request_user ON mfa_reset_request(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_reset_request_status ON mfa_reset_request(status);

-- =====================================================================
-- WEEK 15-16: COMPLIANCE REPORTING AUTOMATION
-- =====================================================================

-- Create compliance report table
CREATE TABLE IF NOT EXISTS compliance_report (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    compliance_score DECIMAL(5,2),
    report_data JSONB,
    generated_by_user_id UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    file_path TEXT
);

CREATE INDEX IF NOT EXISTS idx_compliance_report_tenant ON compliance_report(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_report_type ON compliance_report(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_report_generated_at ON compliance_report(generated_at);

-- Create compliance checklist table
CREATE TABLE IF NOT EXISTS compliance_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    compliance_standard VARCHAR(50) NOT NULL,
    checklist_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_compliance_checklist_tenant ON compliance_checklist(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checklist_standard ON compliance_checklist(compliance_standard);

-- Create compliance requirement table
CREATE TABLE IF NOT EXISTS compliance_requirement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES compliance_checklist(id) NOT NULL,
    requirement_number VARCHAR(20),
    requirement_text TEXT NOT NULL,
    completion_status VARCHAR(20) DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
    assigned_to_user_id UUID REFERENCES users(id),
    due_date DATE,
    evidence_document_path TEXT,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_requirement_checklist ON compliance_requirement(checklist_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requirement_status ON compliance_requirement(completion_status);
CREATE INDEX IF NOT EXISTS idx_compliance_requirement_assigned_to ON compliance_requirement(assigned_to_user_id);

-- Create breach detection event table
CREATE TABLE IF NOT EXISTS breach_detection_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    user_id UUID REFERENCES users(id),
    resource_type VARCHAR(50),
    resource_id UUID,
    event_details JSONB,
    detected_at TIMESTAMP DEFAULT NOW(),
    assigned_to_user_id UUID REFERENCES users(id),
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'investigating', 'resolved', 'false_positive')),
    resolved_at TIMESTAMP,
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_breach_detection_event_tenant ON breach_detection_event(tenant_id);
CREATE INDEX IF NOT EXISTS idx_breach_detection_event_severity ON breach_detection_event(severity);
CREATE INDEX IF NOT EXISTS idx_breach_detection_event_status ON breach_detection_event(resolution_status);
CREATE INDEX IF NOT EXISTS idx_breach_detection_event_detected_at ON breach_detection_event(detected_at);

-- Create scheduled compliance report table
CREATE TABLE IF NOT EXISTS scheduled_compliance_report (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    schedule_frequency VARCHAR(20) NOT NULL CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    schedule_cron VARCHAR(50),
    recipient_emails TEXT[],
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_compliance_report_tenant ON scheduled_compliance_report(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_compliance_report_next_run ON scheduled_compliance_report(next_run_at);

-- =====================================================================
-- WEEK 16: ADVANCED PERMISSION FEATURES & HIPAA PRESETS
-- =====================================================================

-- Create permission dependency table
CREATE TABLE IF NOT EXISTS permission_dependency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_permission_id UUID REFERENCES permissions(id) NOT NULL,
    child_permission_id UUID REFERENCES permissions(id) NOT NULL,
    dependency_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(parent_permission_id, child_permission_id)
);

CREATE INDEX IF NOT EXISTS idx_permission_dependency_parent ON permission_dependency(parent_permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_dependency_child ON permission_dependency(child_permission_id);

-- =====================================================================
-- WEEK 17: DOCUMENTATION, HELP & ACCESSIBILITY
-- =====================================================================

-- Create help article table
CREATE TABLE IF NOT EXISTS help_article (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category VARCHAR(50),
    video_url TEXT,
    search_tags TEXT[],
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_help_article_slug ON help_article(slug);
CREATE INDEX IF NOT EXISTS idx_help_article_category ON help_article(category);
CREATE INDEX IF NOT EXISTS idx_help_article_published ON help_article(is_published);

-- Create user help interaction table
CREATE TABLE IF NOT EXISTS user_help_interaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    article_id UUID REFERENCES help_article(id) NOT NULL,
    viewed_at TIMESTAMP DEFAULT NOW(),
    helpful_vote BOOLEAN,
    feedback_comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_help_interaction_user ON user_help_interaction(user_id);
CREATE INDEX IF NOT EXISTS idx_user_help_interaction_article ON user_help_interaction(article_id);

-- Create changelog entry table
CREATE TABLE IF NOT EXISTS changelog_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL,
    release_date DATE NOT NULL,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('feature', 'bugfix', 'breaking_change', 'improvement', 'security')),
    description TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_published BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_changelog_entry_version ON changelog_entry(version);
CREATE INDEX IF NOT EXISTS idx_changelog_entry_release_date ON changelog_entry(release_date DESC);

-- Create user changelog read tracking table
CREATE TABLE IF NOT EXISTS user_changelog_read (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    changelog_entry_id UUID REFERENCES changelog_entry(id) NOT NULL,
    read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, changelog_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_user_changelog_read_user ON user_changelog_read(user_id);

-- =====================================================================
-- INSERT INITIAL DATA
-- =====================================================================

-- Insert default notification preferences for existing users (only if tenant exists)
INSERT INTO user_notification_preference (user_id, tenant_id, notification_type, enabled, delivery_method)
SELECT u.id, u.tenant_id, 'new_user_created', TRUE, 'in_app' 
FROM users u
INNER JOIN tenant t ON u.tenant_id = t.id
WHERE NOT EXISTS (
    SELECT 1 FROM user_notification_preference WHERE user_id = u.id AND notification_type = 'new_user_created'
);

-- Insert sample SoD conflict rules (only if permissions exist)
INSERT INTO sod_conflict_rules (permission_a_id, permission_b_id, conflict_reason, severity)
SELECT 
    p1.id, 
    p2.id, 
    'Creating and approving invoices violates segregation of duty principles',
    'critical'
FROM permissions p1, permissions p2
WHERE LOWER(p1."Name") LIKE '%invoice%' 
  AND LOWER(p2."Name") LIKE '%payment%'
  AND p1.id < p2.id
  AND NOT EXISTS (
    SELECT 1 FROM sod_conflict_rules WHERE permission_a_id = p1.id AND permission_b_id = p2.id
)
LIMIT 1;

-- =====================================================================
-- GRANT PERMISSIONS (if using specific roles)
-- =====================================================================

-- Grant permissions to postgres user (or your database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify all new tables were created
DO $$
DECLARE
    tables_created INTEGER;
BEGIN
    SELECT COUNT(*) INTO tables_created
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'sod_conflict_rules',
        'permission_usage_stats',
        'department_template',
        'user_notification_preference',
        'settings_change_history',
        'device_approval_request',
        'mfa_enforcement_policy',
        'risk_based_mfa_config',
        'mfa_reset_request',
        'compliance_report',
        'compliance_checklist',
        'compliance_requirement',
        'breach_detection_event',
        'scheduled_compliance_report',
        'permission_dependency',
        'help_article',
        'user_help_interaction',
        'changelog_entry',
        'user_changelog_read'
    );
    
    RAISE NOTICE 'Phase 3 Migration Complete: % tables created/verified', tables_created;
END $$;
