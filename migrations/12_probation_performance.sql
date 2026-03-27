-- =====================================================
-- MIGRATION 12: PROBATION & PERFORMANCE TRACKING
-- =====================================================
-- Hospital Portal - Employee Probation & Performance Reviews
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

-- =====================================================
-- 1. PERFORMANCE REVIEW TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Review details
    review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('probation', 'annual', 'mid_year', 'project_based', 'ad_hoc', 'exit')),
    review_period_start DATE,
    review_period_end DATE,
    review_date DATE NOT NULL,
    due_date DATE,
    
    -- Reviewer information
    reviewer_user_id UUID NOT NULL REFERENCES users(id),
    reviewer_relationship VARCHAR(50), -- 'direct_manager', 'skip_level', 'peer', 'hr'
    secondary_reviewer_user_id UUID REFERENCES users(id),
    
    -- Review status
    review_status VARCHAR(50) DEFAULT 'scheduled' CHECK (review_status IN ('scheduled', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'completed')),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by_user_id UUID REFERENCES users(id),
    
    -- Overall ratings
    overall_rating DECIMAL(3, 2) CHECK (overall_rating BETWEEN 1.00 AND 5.00), -- 1.00 to 5.00
    overall_rating_text VARCHAR(50), -- 'Exceeds Expectations', 'Meets Expectations', etc.
    
    -- Performance categories
    technical_skills_rating DECIMAL(3, 2) CHECK (technical_skills_rating BETWEEN 1.00 AND 5.00),
    communication_rating DECIMAL(3, 2) CHECK (communication_rating BETWEEN 1.00 AND 5.00),
    teamwork_rating DECIMAL(3, 2) CHECK (teamwork_rating BETWEEN 1.00 AND 5.00),
    punctuality_rating DECIMAL(3, 2) CHECK (punctuality_rating BETWEEN 1.00 AND 5.00),
    leadership_rating DECIMAL(3, 2) CHECK (leadership_rating BETWEEN 1.00 AND 5.00),
    
    -- Qualitative feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    achievements TEXT,
    goals_for_next_period TEXT,
    reviewer_comments TEXT,
    employee_comments TEXT,
    
    -- Probation-specific
    is_probation_review BOOLEAN DEFAULT false,
    probation_outcome VARCHAR(50) CHECK (probation_outcome IN ('confirmed', 'extended', 'terminated', 'pending')),
    probation_extension_months INTEGER,
    
    -- Recommendations
    promotion_recommended BOOLEAN DEFAULT false,
    salary_increment_recommended BOOLEAN DEFAULT false,
    recommended_increment_percentage DECIMAL(5, 2),
    training_recommended BOOLEAN DEFAULT false,
    recommended_training TEXT,
    
    -- Signatures
    employee_acknowledged BOOLEAN DEFAULT false,
    employee_acknowledged_at TIMESTAMPTZ,
    reviewer_signed BOOLEAN DEFAULT false,
    reviewer_signed_at TIMESTAMPTZ,
    hr_approved BOOLEAN DEFAULT false,
    hr_approved_at TIMESTAMPTZ,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_performance_review_tenant ON performance_review(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_performance_review_employee ON performance_review(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_performance_review_type ON performance_review(review_type, review_status);
CREATE INDEX IF NOT EXISTS idx_performance_review_due_date ON performance_review(due_date) WHERE review_status IN ('scheduled', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_performance_review_probation ON performance_review(is_probation_review, probation_outcome) WHERE is_probation_review = true;

COMMENT ON TABLE performance_review IS 'Employee performance reviews including probation, annual, and ad-hoc reviews';
COMMENT ON COLUMN performance_review.overall_rating IS '1.00 = Poor, 2.00 = Below Expectations, 3.00 = Meets Expectations, 4.00 = Exceeds Expectations, 5.00 = Outstanding';
COMMENT ON COLUMN performance_review.probation_outcome IS 'Probation result: confirmed (passed), extended (needs more time), terminated (failed), pending';

-- =====================================================
-- 2. PERFORMANCE CRITERION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_criterion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    performance_review_id UUID NOT NULL REFERENCES performance_review(id) ON DELETE CASCADE,
    
    -- Criterion details
    criterion_name VARCHAR(200) NOT NULL,
    criterion_description TEXT,
    criterion_category VARCHAR(100), -- 'Technical', 'Behavioral', 'Clinical', 'Administrative'
    
    -- Weighting
    weight_percentage DECIMAL(5, 2) DEFAULT 0.00, -- Contribution to overall rating
    
    -- Rating
    rating DECIMAL(3, 2) CHECK (rating BETWEEN 1.00 AND 5.00),
    rating_notes TEXT,
    
    -- Evidence/Examples
    evidence TEXT,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_performance_criterion_review ON performance_criterion(performance_review_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_performance_criterion_category ON performance_criterion(criterion_category);

COMMENT ON TABLE performance_criterion IS 'Individual performance criteria within a review (e.g., "Patient Care Quality", "Documentation Accuracy")';
COMMENT ON COLUMN performance_criterion.weight_percentage IS 'Contribution to overall score: 0-100, total should sum to 100';

-- =====================================================
-- 3. REVIEW APPROVAL WORKFLOW TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS review_approval_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    performance_review_id UUID NOT NULL REFERENCES performance_review(id) ON DELETE CASCADE,
    
    -- Workflow step
    approval_step INTEGER NOT NULL, -- 1, 2, 3
    approver_user_id UUID NOT NULL REFERENCES users(id),
    approver_role VARCHAR(100), -- 'Manager', 'HR Manager', 'Director'
    
    -- Approval status
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'skipped')),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    comments TEXT,
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMPTZ,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approval_workflow_review ON review_approval_workflow(performance_review_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_approver ON review_approval_workflow(approver_user_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_pending ON review_approval_workflow(approval_status, created_at) WHERE approval_status = 'pending';

COMMENT ON TABLE review_approval_workflow IS 'Multi-step approval workflow for performance reviews (Manager → HR → Director)';

-- =====================================================
-- 4. PROBATION ALERT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS probation_alert_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('probation_starting', 'probation_30_days', 'probation_60_days', 'probation_ending_7_days', 'probation_ending_today', 'probation_expired')),
    alert_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    probation_end_date DATE,
    days_until_end INTEGER,
    
    -- Recipients
    sent_to_employee BOOLEAN DEFAULT true,
    sent_to_manager BOOLEAN DEFAULT true,
    sent_to_hr BOOLEAN DEFAULT true,
    
    -- Notification channels
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_probation_alert_employee ON probation_alert_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_probation_alert_type ON probation_alert_log(alert_type, alert_sent_at DESC);

COMMENT ON TABLE probation_alert_log IS 'Automated probation review reminder alerts';

-- =====================================================
-- 5. SEED PERFORMANCE CRITERION TEMPLATES
-- =====================================================

-- Insert default criteria templates for different review types
INSERT INTO performance_criterion (
    tenant_id, performance_review_id, criterion_name, criterion_description, 
    criterion_category, weight_percentage
)
SELECT 
    t.id AS tenant_id,
    NULL AS performance_review_id, -- Template, will be cloned per review
    crit_name,
    crit_desc,
    crit_cat,
    weight_pct
FROM tenant t
CROSS JOIN (VALUES
    -- Clinical Staff Criteria
    ('Patient Care Quality', 'Quality of patient interactions, empathy, and care delivery', 'Clinical', 25.00),
    ('Clinical Knowledge', 'Medical knowledge, staying updated with latest practices', 'Technical', 20.00),
    ('Documentation Accuracy', 'Accuracy and timeliness of medical records', 'Administrative', 15.00),
    ('Team Collaboration', 'Ability to work effectively with interdisciplinary teams', 'Behavioral', 15.00),
    ('Punctuality & Attendance', 'Timeliness, attendance record, reliability', 'Behavioral', 10.00),
    ('Professional Ethics', 'Adherence to ethical standards and patient confidentiality', 'Behavioral', 10.00),
    ('Initiative & Learning', 'Proactive learning, professional development', 'Behavioral', 5.00),
    
    -- Administrative Staff Criteria
    ('Task Completion', 'Ability to complete assigned tasks accurately and on time', 'Administrative', 25.00),
    ('Communication Skills', 'Written and verbal communication effectiveness', 'Behavioral', 20.00),
    ('Problem Solving', 'Ability to identify and resolve issues independently', 'Technical', 15.00),
    ('Software Proficiency', 'Proficiency in hospital management systems', 'Technical', 15.00),
    ('Attention to Detail', 'Accuracy in data entry and record management', 'Administrative', 15.00),
    ('Customer Service', 'Quality of interactions with patients and staff', 'Behavioral', 10.00)
) AS criteria(crit_name, crit_desc, crit_cat, weight_pct)
WHERE t.status = 'active'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. FUNCTION TO AUTO-CREATE PROBATION REVIEW
-- =====================================================

CREATE OR REPLACE FUNCTION create_probation_review_on_hire()
RETURNS TRIGGER AS $$
DECLARE
    v_probation_end_date DATE;
    v_review_due_date DATE;
BEGIN
    -- Only for employees with probation period
    IF NEW.probation_end_date IS NOT NULL THEN
        v_probation_end_date := NEW.probation_end_date;
        v_review_due_date := v_probation_end_date - INTERVAL '7 days'; -- Review 7 days before probation ends
        
        -- Create performance review for probation
        INSERT INTO performance_review (
            tenant_id, employee_id, review_type, review_period_start, 
            review_period_end, review_date, due_date, reviewer_user_id,
            review_status, is_probation_review, probation_outcome
        )
        VALUES (
            NEW.tenant_id,
            NEW.id,
            'probation',
            NEW.hire_date,
            v_probation_end_date,
            v_probation_end_date,
            v_review_due_date,
            NEW.reports_to_user_id, -- Manager as reviewer
            'scheduled',
            true,
            'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_probation_review ON employee;
CREATE TRIGGER trigger_create_probation_review
    AFTER INSERT ON employee
    FOR EACH ROW
    WHEN (NEW.probation_end_date IS NOT NULL)
    EXECUTE FUNCTION create_probation_review_on_hire();

COMMENT ON FUNCTION create_probation_review_on_hire() IS 'Auto-create probation review when employee is hired with probation period';

-- =====================================================
-- 7. VIEW FOR PENDING PROBATION REVIEWS
-- =====================================================

CREATE OR REPLACE VIEW pending_probation_reviews_view AS
SELECT 
    pr.id AS review_id,
    pr.tenant_id,
    pr.employee_id,
    e.employee_number,
    u.first_name || ' ' || u.last_name AS employee_name,
    u.email AS employee_email,
    pr.due_date,
    pr.review_date,
    e.probation_end_date,
    (e.probation_end_date - CURRENT_DATE) AS days_until_probation_end,
    pr.review_status,
    pr.probation_outcome,
    
    -- Reviewer info
    reviewer.first_name || ' ' || reviewer.last_name AS reviewer_name,
    reviewer.email AS reviewer_email,
    
    -- Alert urgency
    CASE 
        WHEN (e.probation_end_date - CURRENT_DATE) <= 0 THEN 'overdue'
        WHEN (e.probation_end_date - CURRENT_DATE) <= 7 THEN 'critical'
        WHEN (e.probation_end_date - CURRENT_DATE) <= 14 THEN 'urgent'
        WHEN (e.probation_end_date - CURRENT_DATE) <= 30 THEN 'upcoming'
        ELSE 'scheduled'
    END AS urgency_level
FROM performance_review pr
INNER JOIN employee e ON pr.employee_id = e.id
INNER JOIN users u ON e.user_id = u.id
INNER JOIN users reviewer ON pr.reviewer_user_id = reviewer.id
WHERE pr.is_probation_review = true
  AND pr.review_status IN ('scheduled', 'in_progress')
  AND pr.deleted_at IS NULL
  AND e.probation_end_date >= CURRENT_DATE - INTERVAL '30 days';

COMMENT ON VIEW pending_probation_reviews_view IS 'Upcoming and overdue probation reviews with urgency levels';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 12: PROBATION & PERFORMANCE';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Created performance_review table';
    RAISE NOTICE '✓ Created performance_criterion table';
    RAISE NOTICE '✓ Created review_approval_workflow table';
    RAISE NOTICE '✓ Created probation_alert_log table';
    RAISE NOTICE '✓ Seeded performance criterion templates';
    RAISE NOTICE '✓ Created auto-review trigger on hire';
    RAISE NOTICE '✓ Created pending probation reviews view';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ready for: PerformanceReviewService';
    RAISE NOTICE '============================================';
END $$;
