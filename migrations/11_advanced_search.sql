-- =====================================================
-- MIGRATION 11: ADVANCED SEARCH & SAVED FILTERS
-- =====================================================
-- Hospital Portal - User Saved Searches & Filter History
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

-- =====================================================
-- 1. USER SAVED SEARCH TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_saved_search (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Search details
    search_name VARCHAR(200) NOT NULL,
    search_description TEXT,
    module_name VARCHAR(100) NOT NULL, -- 'employees', 'patients', 'appointments', 'licenses', etc.
    
    -- Search criteria (stored as JSONB)
    search_criteria JSONB NOT NULL,
    -- Example: {"firstName": "John", "department": "Cardiology", "status": "active", "dateRange": {"from": "2024-01-01", "to": "2024-12-31"}}
    
    -- Metadata
    is_favorite BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false, -- Share with other users
    shared_with_user_ids UUID[], -- Specific users who can see this search
    shared_with_role_codes TEXT[], -- Roles that can see this search
    
    -- Usage tracking
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    
    -- Display preferences
    column_preferences JSONB, -- Which columns to show/hide
    sort_preferences JSONB, -- Default sorting
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_saved_search_tenant ON user_saved_search(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_search_user ON user_saved_search(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_search_module ON user_saved_search(module_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_search_favorite ON user_saved_search(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_saved_search_shared ON user_saved_search(is_shared) WHERE is_shared = true AND deleted_at IS NULL;

-- GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_saved_search_criteria_gin ON user_saved_search USING GIN (search_criteria);

COMMENT ON TABLE user_saved_search IS 'User-saved search queries with filters for all modules (13 admin modules)';
COMMENT ON COLUMN user_saved_search.search_criteria IS 'JSONB filter criteria: {field: value, dateRange: {from, to}, status: [], etc.}';
COMMENT ON COLUMN user_saved_search.module_name IS 'employees, patients, appointments, departments, branches, licenses, contracts, onboarding, training, audit_logs, etc.';

-- =====================================================
-- 2. SEARCH HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Search execution details
    module_name VARCHAR(100) NOT NULL,
    search_query TEXT, -- Raw search query (if text search)
    search_criteria JSONB, -- Filter criteria applied
    
    -- Results
    results_count INTEGER,
    execution_time_ms INTEGER, -- Query performance tracking
    
    -- Context
    searched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_module ON search_history(module_name, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_date ON search_history(searched_at DESC);

COMMENT ON TABLE search_history IS 'Search execution log for analytics and autocomplete suggestions';

-- =====================================================
-- 3. FILTER PRESET TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS filter_preset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Preset details
    preset_name VARCHAR(200) NOT NULL,
    preset_code VARCHAR(100) UNIQUE NOT NULL, -- 'ACTIVE_EMPLOYEES', 'EXPIRING_LICENSES_30_DAYS'
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Filter configuration
    filter_criteria JSONB NOT NULL,
    icon VARCHAR(50), -- Icon name for UI
    badge_color VARCHAR(50), -- 'red', 'yellow', 'green', 'blue'
    
    -- Visibility
    is_system_preset BOOLEAN DEFAULT false, -- System-defined vs user-defined
    is_visible_to_all BOOLEAN DEFAULT false,
    visible_to_roles TEXT[],
    
    -- Ordering
    display_order INTEGER DEFAULT 100,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_filter_preset_tenant ON filter_preset(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_filter_preset_code ON filter_preset(preset_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_filter_preset_module ON filter_preset(module_name) WHERE is_active = true;

COMMENT ON TABLE filter_preset IS 'Predefined filter presets for quick access (e.g., "Active Employees", "Expiring Licenses")';
COMMENT ON COLUMN filter_preset.is_system_preset IS 'System presets cannot be deleted by users';

-- =====================================================
-- 4. SEED SYSTEM FILTER PRESETS
-- =====================================================

INSERT INTO filter_preset (
    tenant_id, preset_name, preset_code, module_name, description, 
    filter_criteria, icon, badge_color, is_system_preset, is_visible_to_all, display_order
)
SELECT 
    t.id, preset_nm, preset_cd, mod_nm, desc_txt,
    criteria::JSONB, icn, badge, true, true, disp_ord
FROM tenant t
CROSS JOIN (VALUES
    -- Employee Presets
    ('Active Employees', 'ACTIVE_EMPLOYEES', 'employees', 'Currently active employees', '{"status": "active", "deleted_at": null}', 'user-check', 'green', 1),
    ('New Hires (Last 30 Days)', 'NEW_HIRES_30', 'employees', 'Employees joined in last 30 days', '{"dateRange": {"field": "hire_date", "from": "TODAY-30"}}', 'user-plus', 'blue', 2),
    ('Probation Period', 'ON_PROBATION', 'employees', 'Employees currently on probation', '{"is_on_probation": true}', 'clock', 'yellow', 3),
    ('Terminated Employees', 'TERMINATED', 'employees', 'Employees who left the organization', '{"status": "terminated"}', 'user-x', 'red', 4),
    
    -- License Presets
    ('Expiring in 30 Days', 'LICENSE_EXPIRY_30', 'licenses', 'Professional licenses expiring in next 30 days', '{"days_until_expiry": {"operator": "<=", "value": 30}}', 'alert-triangle', 'red', 10),
    ('Expiring in 90 Days', 'LICENSE_EXPIRY_90', 'licenses', 'Licenses expiring in next 90 days', '{"days_until_expiry": {"operator": "<=", "value": 90}}', 'alert-circle', 'yellow', 11),
    ('Expired Licenses', 'LICENSE_EXPIRED', 'licenses', 'Already expired licenses', '{"is_expired": true}', 'x-circle', 'red', 12),
    ('Auto-Suspended', 'LICENSE_SUSPENDED', 'licenses', 'Auto-suspended due to expiry', '{"is_suspended": true}', 'ban', 'red', 13),
    
    -- Contract Presets
    ('Expiring Contracts (60 Days)', 'CONTRACT_EXPIRY_60', 'contracts', 'Employment contracts expiring in 60 days', '{"days_until_expiry": {"operator": "<=", "value": 60}}', 'file-text', 'yellow', 20),
    ('Auto-Renew Contracts', 'CONTRACT_AUTO_RENEW', 'contracts', 'Contracts set for automatic renewal', '{"auto_renew": true}', 'refresh-cw', 'green', 21),
    ('Pending Renewal', 'CONTRACT_RENEWAL_PENDING', 'contracts', 'Contracts with renewal pending', '{"renewal_status": "renewal_pending"}', 'clock', 'yellow', 22),
    
    -- Appointment Presets
    ('Today Appointments', 'APPOINTMENTS_TODAY', 'appointments', 'Appointments scheduled for today', '{"appointment_date": "TODAY"}', 'calendar-check', 'blue', 30),
    ('Pending Appointments', 'APPOINTMENTS_PENDING', 'appointments', 'Pending appointment requests', '{"appointment_status": "pending"}', 'clock', 'yellow', 31),
    ('Cancelled Appointments', 'APPOINTMENTS_CANCELLED', 'appointments', 'Recently cancelled appointments', '{"appointment_status": "cancelled"}', 'x-circle', 'red', 32),
    
    -- Patient Presets
    ('Active Patients', 'PATIENTS_ACTIVE', 'patients', 'Currently active patients', '{"status": "active"}', 'user-check', 'green', 40),
    ('Admitted Patients', 'PATIENTS_ADMITTED', 'patients', 'Currently admitted in hospital', '{"is_admitted": true}', 'bed', 'blue', 41),
    ('High Risk Patients', 'PATIENTS_HIGH_RISK', 'patients', 'Patients with high-risk flags', '{"risk_level": "high"}', 'alert-triangle', 'red', 42),
    
    -- Onboarding Presets
    ('In Progress Onboarding', 'ONBOARDING_IN_PROGRESS', 'onboarding', 'Onboarding currently in progress', '{"onboarding_status": "in_progress"}', 'user-plus', 'blue', 50),
    ('Pending Review', 'ONBOARDING_PENDING_REVIEW', 'onboarding', 'Onboarding awaiting review', '{"onboarding_status": "pending_review"}', 'clipboard-check', 'yellow', 51),
    ('Completed Onboarding', 'ONBOARDING_COMPLETED', 'onboarding', 'Successfully completed onboarding', '{"onboarding_status": "completed"}', 'check-circle', 'green', 52),
    
    -- Audit Log Presets
    ('PHI Access Today', 'AUDIT_PHI_TODAY', 'audit_logs', 'PHI access logs for today', '{"event_category": "PHI_Access", "date": "TODAY"}', 'shield-alert', 'yellow', 60),
    ('Failed Login Attempts', 'AUDIT_FAILED_LOGINS', 'audit_logs', 'Failed authentication attempts', '{"event_type": "LoginFailed"}', 'lock', 'red', 61),
    ('Emergency Access', 'AUDIT_EMERGENCY_ACCESS', 'audit_logs', 'Emergency access breakglass events', '{"event_category": "Emergency_Access"}', 'alert-triangle', 'red', 62)
) AS presets(preset_nm, preset_cd, mod_nm, desc_txt, criteria, icn, badge, disp_ord)
WHERE t.status = 'active'
ON CONFLICT (preset_code) DO NOTHING;

-- =====================================================
-- 5. FUNCTION TO AUTO-DELETE OLD SEARCH HISTORY
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_search_history()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete search history older than 90 days
    DELETE FROM search_history
    WHERE searched_at < CURRENT_DATE - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_search_history() IS 'Delete search history older than 90 days (run daily via scheduled job)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 11: ADVANCED SEARCH & FILTERS';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Created user_saved_search table';
    RAISE NOTICE '✓ Created search_history table';
    RAISE NOTICE '✓ Created filter_preset table';
    RAISE NOTICE '✓ Seeded 23 system filter presets';
    RAISE NOTICE '✓ Created cleanup function for old searches';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ready for: SearchService + Fuse.js UI';
    RAISE NOTICE '============================================';
END $$;
