-- =====================================================
-- MIGRATION 09: ONBOARDING WORKFLOW SYSTEM
-- =====================================================
-- Hospital Portal - Employee Onboarding & Progressive Access
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

-- =====================================================
-- 1. ONBOARDING WORKFLOW TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Workflow tracking
    onboarding_status VARCHAR(50) DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'in_progress', 'pending_review', 'completed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Progress metrics
    total_checklist_items INTEGER DEFAULT 0,
    completed_checklist_items INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Role-specific configuration
    role_code VARCHAR(100),
    checklist_template VARCHAR(100), -- 'clinical_staff', 'admin_staff', 'support_staff'
    
    -- Mentor/buddy assignment
    mentor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mentor_assigned_at TIMESTAMPTZ,
    mentor_check_ins_completed INTEGER DEFAULT 0,
    mentor_check_ins_required INTEGER DEFAULT 4, -- Weekly check-ins for 1 month
    
    -- Key milestone dates
    hire_date DATE NOT NULL,
    orientation_date DATE,
    first_day_completed BOOLEAN DEFAULT false,
    week_one_review_date DATE,
    probation_review_date DATE,
    
    -- Progressive access model
    current_access_level VARCHAR(50) DEFAULT 'read_only' CHECK (current_access_level IN ('none', 'read_only', 'limited_write', 'full_access')),
    access_level_upgraded_at TIMESTAMPTZ,
    
    -- Auto-trigger tracking
    welcome_email_sent BOOLEAN DEFAULT false,
    welcome_email_sent_at TIMESTAMPTZ,
    ad_account_created BOOLEAN DEFAULT false,
    ad_account_created_at TIMESTAMPTZ,
    orientation_scheduled BOOLEAN DEFAULT false,
    orientation_scheduled_at TIMESTAMPTZ,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    
    CONSTRAINT unique_onboarding_per_employee UNIQUE (employee_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tenant ON onboarding_workflow(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_onboarding_employee ON onboarding_workflow(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_workflow(onboarding_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_onboarding_mentor ON onboarding_workflow(mentor_user_id) WHERE mentor_user_id IS NOT NULL;

COMMENT ON TABLE onboarding_workflow IS 'Employee onboarding workflow tracking with progressive access management';
COMMENT ON COLUMN onboarding_workflow.checklist_template IS 'Role-based checklist: clinical_staff, admin_staff, support_staff';
COMMENT ON COLUMN onboarding_workflow.current_access_level IS 'Progressive access: none → read_only (Day 1) → limited_write (Day 7) → full_access (Day 30)';

-- =====================================================
-- 2. ONBOARDING CHECKLIST ITEM TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_checklist_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    onboarding_workflow_id UUID NOT NULL REFERENCES onboarding_workflow(id) ON DELETE CASCADE,
    
    -- Checklist item details
    step_number INTEGER NOT NULL, -- 1-6 for the 6-step wizard
    step_name VARCHAR(100) NOT NULL, -- 'Personal Docs', 'Employment Docs', etc.
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    item_type VARCHAR(50) CHECK (item_type IN ('document_upload', 'form_submission', 'training_completion', 'system_access', 'review', 'acknowledgment')),
    
    -- Requirements
    is_required BOOLEAN DEFAULT true,
    required_for_role_types TEXT[], -- ['clinical', 'admin', 'all']
    due_date DATE,
    
    -- Completion tracking
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by_user_id UUID REFERENCES users(id),
    completion_notes TEXT,
    
    -- Document tracking
    document_url TEXT,
    document_type VARCHAR(100), -- 'ID Proof', 'Resume', 'License', etc.
    document_verified BOOLEAN DEFAULT false,
    verified_by_user_id UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Dependencies
    depends_on_item_id UUID REFERENCES onboarding_checklist_item(id),
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_checklist_tenant ON onboarding_checklist_item(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checklist_workflow ON onboarding_checklist_item(onboarding_workflow_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checklist_step ON onboarding_checklist_item(step_number, is_completed);
CREATE INDEX IF NOT EXISTS idx_checklist_completion ON onboarding_checklist_item(is_completed, completed_at);

COMMENT ON TABLE onboarding_checklist_item IS 'Individual checklist items within onboarding workflow (6-step wizard)';
COMMENT ON COLUMN onboarding_checklist_item.step_number IS 'Wizard step: 1=Personal Docs, 2=Employment Docs, 3=Medical Clearance, 4=Professional Credentials, 5=System Access, 6=Training';

-- =====================================================
-- 3. PROGRESSIVE ACCESS RULE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS progressive_access_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Rule definition
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    role_code VARCHAR(100), -- Apply to specific role or NULL for all roles
    
    -- Trigger conditions
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('days_after_hire', 'checklist_completion', 'manual_approval', 'training_complete', 'probation_end')),
    trigger_value INTEGER, -- e.g., 7 for "7 days after hire"
    required_checklist_percentage DECIMAL(5, 2), -- e.g., 50.00 for "50% checklist complete"
    required_training_ids UUID[], -- Array of training IDs that must be complete
    
    -- Access grant
    grants_access_level VARCHAR(50) NOT NULL CHECK (grants_access_level IN ('read_only', 'limited_write', 'full_access')),
    grants_permissions TEXT[], -- Array of permission codes
    grants_role_id UUID REFERENCES "AspNetRoles"(id),
    
    -- Auto-execution
    is_automatic BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    approver_role_code VARCHAR(100),
    
    -- Priority (lower number = higher priority)
    execution_order INTEGER DEFAULT 100,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_access_rule_tenant ON progressive_access_rule(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_access_rule_role ON progressive_access_rule(role_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_access_rule_trigger ON progressive_access_rule(trigger_type) WHERE is_active = true;

COMMENT ON TABLE progressive_access_rule IS 'Rules for granting progressive access during onboarding (Day 1 → Day 7 → Day 30)';
COMMENT ON COLUMN progressive_access_rule.trigger_type IS 'When to grant access: days_after_hire, checklist_completion, manual_approval, training_complete, probation_end';

-- =====================================================
-- 4. MENTOR CHECK-IN LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS mentor_checkin_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    onboarding_workflow_id UUID NOT NULL REFERENCES onboarding_workflow(id) ON DELETE CASCADE,
    
    -- Check-in details
    mentor_user_id UUID NOT NULL REFERENCES users(id),
    employee_user_id UUID NOT NULL REFERENCES users(id),
    checkin_date DATE NOT NULL,
    checkin_type VARCHAR(50) DEFAULT 'regular' CHECK (checkin_type IN ('regular', 'ad_hoc', 'milestone', 'escalation')),
    
    -- Discussion topics
    topics_discussed TEXT,
    challenges_identified TEXT,
    support_provided TEXT,
    
    -- Performance observations
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    engagement_rating INTEGER CHECK (engagement_rating BETWEEN 1 AND 5),
    skill_development_rating INTEGER CHECK (skill_development_rating BETWEEN 1 AND 5),
    overall_progress VARCHAR(50) CHECK (overall_progress IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'concerning')),
    
    -- Recommendations
    mentor_recommendations TEXT,
    action_items TEXT,
    next_checkin_date DATE,
    escalate_to_hr BOOLEAN DEFAULT false,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mentor_checkin_workflow ON mentor_checkin_log(onboarding_workflow_id);
CREATE INDEX IF NOT EXISTS idx_mentor_checkin_mentor ON mentor_checkin_log(mentor_user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_checkin_date ON mentor_checkin_log(checkin_date DESC);

COMMENT ON TABLE mentor_checkin_log IS 'Mentor-employee check-in logs during onboarding (mandatory 30-day mentorship)';

-- =====================================================
-- 5. SEED DEFAULT CHECKLIST TEMPLATES
-- =====================================================

-- Insert default checklist items for clinical staff
INSERT INTO onboarding_checklist_item (tenant_id, onboarding_workflow_id, step_number, step_name, item_name, item_description, item_type, is_required, required_for_role_types)
SELECT 
    t.id AS tenant_id,
    NULL AS onboarding_workflow_id, -- Will be cloned per employee
    step_num,
    step_nm,
    item_nm,
    item_desc,
    item_tp,
    is_req,
    ARRAY[role_type]::TEXT[] AS required_for_role_types
FROM tenant t
CROSS JOIN (VALUES
    -- Step 1: Personal Documents
    (1, 'Personal Documents', 'Government ID Proof', 'Upload Passport, Driving License, or Aadhar Card', 'document_upload', true, 'all'),
    (1, 'Personal Documents', 'Address Proof', 'Upload utility bill or rental agreement (within 3 months)', 'document_upload', true, 'all'),
    (1, 'Personal Documents', 'Education Certificates', 'Upload highest degree certificate and mark sheets', 'document_upload', true, 'all'),
    (1, 'Personal Documents', 'Resume/CV', 'Upload latest resume', 'document_upload', true, 'all'),
    
    -- Step 2: Employment Documents
    (2, 'Employment Documents', 'Offer Letter Signed', 'Sign and upload offer letter', 'document_upload', true, 'all'),
    (2, 'Employment Documents', 'Employment Contract', 'Sign and upload employment contract', 'document_upload', true, 'all'),
    (2, 'Employment Documents', 'Bank Account Details', 'Submit bank details for salary processing', 'form_submission', true, 'all'),
    (2, 'Employment Documents', 'PAN Card / Tax Forms', 'Upload PAN card and submit tax declaration', 'document_upload', true, 'all'),
    
    -- Step 3: Medical Clearance
    (3, 'Medical Clearance', 'Health Checkup Report', 'Complete pre-employment health checkup', 'document_upload', true, 'all'),
    (3, 'Medical Clearance', 'Vaccination Records', 'Submit vaccination records (Hepatitis B, COVID-19)', 'document_upload', true, 'clinical'),
    (3, 'Medical Clearance', 'TB Test', 'Complete tuberculosis screening test', 'document_upload', true, 'clinical'),
    (3, 'Medical Clearance', 'Blood Group Certificate', 'Submit blood group test report', 'document_upload', false, 'all'),
    
    -- Step 4: Professional Credentials (Clinical only)
    (4, 'Professional Credentials', 'Medical License', 'Upload valid medical council registration', 'document_upload', true, 'clinical'),
    (4, 'Professional Credentials', 'NPI Number', 'Provide National Provider Identifier', 'form_submission', true, 'clinical'),
    (4, 'Professional Credentials', 'Malpractice Insurance', 'Upload professional indemnity insurance', 'document_upload', true, 'clinical'),
    (4, 'Professional Credentials', 'Specialty Certifications', 'Upload board certifications (if applicable)', 'document_upload', false, 'clinical'),
    
    -- Step 5: System Access
    (5, 'System Access', 'Email Account Created', 'Hospital email account provisioned', 'system_access', true, 'all'),
    (5, 'System Access', 'Employee Badge Issued', 'Receive and acknowledge employee ID badge', 'acknowledgment', true, 'all'),
    (5, 'System Access', 'Locker Assigned', 'Locker key issued and documented', 'system_access', true, 'all'),
    (5, 'System Access', 'IT Orientation Completed', 'Attend IT systems orientation session', 'training_completion', true, 'all'),
    
    -- Step 6: Mandatory Trainings
    (6, 'Training', 'HIPAA Training', 'Complete HIPAA compliance training', 'training_completion', true, 'all'),
    (6, 'Training', 'Fire Safety Training', 'Complete fire safety and evacuation training', 'training_completion', true, 'all'),
    (6, 'Training', 'Infection Control', 'Complete infection control protocols training', 'training_completion', true, 'clinical'),
    (6, 'Training', 'Software Training', 'Complete hospital management software training', 'training_completion', true, 'all')
) AS checklist(step_num, step_nm, item_nm, item_desc, item_tp, is_req, role_type)
WHERE t.status = 'active'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. SEED DEFAULT PROGRESSIVE ACCESS RULES
-- =====================================================

INSERT INTO progressive_access_rule (
    tenant_id, rule_name, rule_description, trigger_type, trigger_value, 
    grants_access_level, is_automatic, execution_order
)
SELECT 
    t.id,
    'Day 1 - Read-Only Access',
    'Grant read-only access immediately on hire date',
    'days_after_hire',
    0,
    'read_only',
    true,
    1
FROM tenant t
WHERE t.status = 'active'
UNION ALL
SELECT 
    t.id,
    'Day 7 - Limited Write Access',
    'Grant limited write access after orientation completion (Day 7)',
    'days_after_hire',
    7,
    'limited_write',
    true,
    2
FROM tenant t
WHERE t.status = 'active'
UNION ALL
SELECT 
    t.id,
    'Day 30 - Full Access After Probation Review',
    'Grant full access after successful probation review',
    'probation_end',
    NULL,
    'full_access',
    false, -- Requires manual approval
    3
FROM tenant t
WHERE t.status = 'active'
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 09: ONBOARDING WORKFLOW SYSTEM';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Created onboarding_workflow table';
    RAISE NOTICE '✓ Created onboarding_checklist_item table';
    RAISE NOTICE '✓ Created progressive_access_rule table';
    RAISE NOTICE '✓ Created mentor_checkin_log table';
    RAISE NOTICE '✓ Seeded default checklist templates (24 items)';
    RAISE NOTICE '✓ Seeded progressive access rules (3 stages)';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ready for: OnboardingService implementation';
    RAISE NOTICE '============================================';
END $$;
