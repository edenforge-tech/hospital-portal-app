-- =====================================================
-- Module 3: Counselor Management - Workflow Orchestration
-- Migration: module03_10_workflow_orchestration.sql
-- Description: State machine for end-to-end counseling workflow orchestration
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. COUNSELING WORKFLOW STATE (State Machine)
-- =====================================================
CREATE TABLE IF NOT EXISTS counseling_workflow_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Session Link (One state machine per counseling session)
    session_id UUID NOT NULL UNIQUE,
    patient_id UUID NOT NULL,
    
    -- Current State
    current_stage VARCHAR(50) NOT NULL DEFAULT 'SessionStarted' CHECK (current_stage IN (
        'SessionStarted',
        'AssessmentInProgress',
        'PackageBuilt',
        'DocumentsCollected',
        'TestsOrdered',
        'TestsCompleted',
        'FitnessClearanceObtained',
        'OTBooked',
        'PaymentInitiated',
        'PaymentCompleted',
        'InsuranceProcessing',
        'InsuranceApproved',
        'ConsentsSigned',
        'AdmissionScheduled',
        'ReadyForSurgery',
        'SessionCompleted',
        'OnHold',
        'Cancelled'
    )),
    
    -- Stage Completion Tracking
    stages_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
    stages_pending TEXT[],
    stages_blocked TEXT[],
    blocking_reasons JSONB,
    /* Example:
    {
        "FitnessClearanceObtained": "Abnormal ECG result requires cardiologist clearance",
        "PaymentCompleted": "Pending cheque clearance"
    }
    */
    
    -- Progress Percentage (0-100)
    completion_percentage INTEGER DEFAULT 0,
    
    -- Dependencies Check
    dependencies_check JSONB,
    /* Example:
    {
        "package_built": true,
        "documents_collected": true,
        "tests_ordered": true,
        "tests_completed": false,
        "fitness_clearance": false,
        "ot_booked": true,
        "payment_received": false,
        "insurance_approved": true,
        "consents_signed": false,
        "admission_scheduled": true
    }
    */
    
    -- Milestones Achieved
    session_started_at TIMESTAMPTZ,
    package_built_at TIMESTAMPTZ,
    tests_ordered_at TIMESTAMPTZ,
    tests_completed_at TIMESTAMPTZ,
    fitness_clearance_at TIMESTAMPTZ,
    ot_booked_at TIMESTAMPTZ,
    payment_completed_at TIMESTAMPTZ,
    insurance_approved_at TIMESTAMPTZ,
    consents_signed_at TIMESTAMPTZ,
    admission_scheduled_at TIMESTAMPTZ,
    ready_for_surgery_at TIMESTAMPTZ,
    session_completed_at TIMESTAMPTZ,
    
    -- On-Hold Info
    on_hold BOOLEAN DEFAULT FALSE,
    on_hold_since TIMESTAMPTZ,
    on_hold_reason TEXT,
    expected_resolution_date DATE,
    
    -- Cancellation Info
    cancelled BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID,
    cancellation_reason TEXT,
    
    -- Next Action Required
    next_action_required VARCHAR(200),
    next_action_assigned_to_user_id UUID,
    next_action_due_date DATE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    
    -- Constraints
    CONSTRAINT fk_workflow_state_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_state_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_workflow_state_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_state_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_workflow_state_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_workflow_state_next_action_user FOREIGN KEY (next_action_assigned_to_user_id) REFERENCES users(id),
    CONSTRAINT fk_workflow_state_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 2. WORKFLOW STAGE TRANSITIONS (Audit Log)
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Workflow Link
    workflow_state_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Transition Details
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    transition_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Trigger Info
    triggered_by_user_id UUID,
    trigger_type VARCHAR(50), -- 'Manual', 'Automatic', 'SystemEvent'
    trigger_event VARCHAR(200), -- 'Payment Received', 'OT Booking Confirmed', 'Tests Completed'
    
    -- Transition Metadata
    metadata JSONB,
    /* Example:
    {
        "payment_transaction_id": "uuid",
        "amount_paid": 50000,
        "ot_schedule_id": "uuid",
        "consent_ids": ["uuid1", "uuid2"]
    }
    */
    
    -- Notes
    transition_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_transition_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_transition_workflow_state FOREIGN KEY (workflow_state_id) REFERENCES counseling_workflow_state(id) ON DELETE CASCADE,
    CONSTRAINT fk_transition_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_transition_triggered_by FOREIGN KEY (triggered_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. WORKFLOW NOTIFICATIONS (Real-Time Alerts)
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Workflow Link
    workflow_state_id UUID NOT NULL,
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Notification Details
    notification_type VARCHAR(50) CHECK (notification_type IN (
        'StageCompleted',
        'BlockingIssue',
        'ActionRequired',
        'Reminder',
        'Escalation',
        'MilestoneReached'
    )),
    
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    
    -- Content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Recipients
    recipient_user_id UUID,
    recipient_role VARCHAR(50), -- 'Counselor', 'Surgeon', 'InsuranceOfficer', 'PaymentStaff'
    
    -- Delivery
    delivery_method VARCHAR(30) CHECK (delivery_method IN ('InApp', 'SMS', 'Email', 'WhatsApp', 'Push')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status
    notification_status VARCHAR(30) DEFAULT 'Pending' CHECK (notification_status IN (
        'Pending',
        'Sent',
        'Delivered',
        'Read',
        'Acknowledged',
        'Failed'
    )),
    
    read_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    
    -- Action Link
    action_url TEXT, -- Deep link to relevant screen
    action_label VARCHAR(100), -- 'View Payment', 'Check Tests', 'Schedule OT'
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Retry (for failed deliveries)
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_notification_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_workflow_state FOREIGN KEY (workflow_state_id) REFERENCES counseling_workflow_state(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_notification_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Workflow State
CREATE INDEX IF NOT EXISTS idx_workflow_state_tenant_branch ON counseling_workflow_state(tenant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_workflow_state_session ON counseling_workflow_state(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_state_patient ON counseling_workflow_state(patient_id);
CREATE INDEX IF NOT EXISTS idx_workflow_state_current_stage ON counseling_workflow_state(current_stage);
CREATE INDEX IF NOT EXISTS idx_workflow_state_on_hold ON counseling_workflow_state(on_hold) WHERE on_hold = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflow_state_blocked ON counseling_workflow_state USING GIN (stages_blocked) WHERE array_length(stages_blocked, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_workflow_state_completion ON counseling_workflow_state(completion_percentage);

-- Stage Transitions
CREATE INDEX IF NOT EXISTS idx_transitions_workflow_state ON workflow_stage_transitions(workflow_state_id);
CREATE INDEX IF NOT EXISTS idx_transitions_session ON workflow_stage_transitions(session_id);
CREATE INDEX IF NOT EXISTS idx_transitions_timestamp ON workflow_stage_transitions(transition_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transitions_trigger_type ON workflow_stage_transitions(trigger_type);

-- Workflow Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_workflow_state ON workflow_notifications(workflow_state_id);
CREATE INDEX IF NOT EXISTS idx_notifications_session ON workflow_notifications(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON workflow_notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON workflow_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON workflow_notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON workflow_notifications(recipient_user_id, notification_status) WHERE notification_status IN ('Sent', 'Delivered');
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON workflow_notifications(priority, sent_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE counseling_workflow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_workflow_state ON counseling_workflow_state
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_stage_transitions ON workflow_stage_transitions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_notifications ON workflow_notifications
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- FUNCTION: Calculate Completion Percentage
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_workflow_completion(p_workflow_state_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_checks JSONB;
    v_total_checks INTEGER := 0;
    v_completed_checks INTEGER := 0;
    v_key TEXT;
    v_value BOOLEAN;
BEGIN
    -- Get dependencies check from workflow state
    SELECT dependencies_check INTO v_checks
    FROM counseling_workflow_state
    WHERE id = p_workflow_state_id;
    
    -- Count total checks and completed checks
    IF v_checks IS NOT NULL THEN
        FOR v_key, v_value IN SELECT * FROM jsonb_each_text(v_checks)
        LOOP
            v_total_checks := v_total_checks + 1;
            IF v_value::BOOLEAN = TRUE THEN
                v_completed_checks := v_completed_checks + 1;
            END IF;
        END LOOP;
    END IF;
    
    -- Calculate percentage
    IF v_total_checks > 0 THEN
        RETURN (v_completed_checks * 100 / v_total_checks);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-create Workflow State on Session Creation
-- =====================================================

CREATE OR REPLACE FUNCTION create_workflow_state_on_session()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO counseling_workflow_state (
        tenant_id,
        branch_id,
        session_id,
        patient_id,
        current_stage,
        session_started_at,
        dependencies_check
    ) VALUES (
        NEW.tenant_id,
        NEW.branch_id,
        NEW.id,
        NEW.patient_id,
        'SessionStarted',
        NEW.created_at,
        '{
            "package_built": false,
            "documents_collected": false,
            "tests_ordered": false,
            "tests_completed": false,
            "fitness_clearance": false,
            "ot_booked": false,
            "payment_received": false,
            "insurance_approved": false,
            "consents_signed": false,
            "admission_scheduled": false
        }'::JSONB
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_workflow_state
    AFTER INSERT ON counseling_sessions
    FOR EACH ROW
    EXECUTE FUNCTION create_workflow_state_on_session();

-- =====================================================
-- TRIGGER: Log Stage Transitions
-- =====================================================

CREATE OR REPLACE FUNCTION log_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if stage actually changed
    IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
        INSERT INTO workflow_stage_transitions (
            tenant_id,
            workflow_state_id,
            session_id,
            from_stage,
            to_stage,
            triggered_by_user_id,
            trigger_type
        ) VALUES (
            NEW.tenant_id,
            NEW.id,
            NEW.session_id,
            OLD.current_stage,
            NEW.current_stage,
            NEW.updated_by_user_id,
            'Manual' -- Default to manual, can be overridden
        );
        
        -- Update stages_completed array
        IF NOT (NEW.current_stage = ANY(NEW.stages_completed)) THEN
            NEW.stages_completed := array_append(NEW.stages_completed, NEW.current_stage);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_stage_transition
    BEFORE UPDATE ON counseling_workflow_state
    FOR EACH ROW
    WHEN (OLD.current_stage IS DISTINCT FROM NEW.current_stage)
    EXECUTE FUNCTION log_stage_transition();

-- =====================================================
-- TRIGGER: Update Completion Percentage
-- =====================================================

CREATE OR REPLACE FUNCTION update_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completion_percentage := calculate_workflow_completion(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_completion_percentage
    BEFORE UPDATE ON counseling_workflow_state
    FOR EACH ROW
    WHEN (OLD.dependencies_check IS DISTINCT FROM NEW.dependencies_check)
    EXECUTE FUNCTION update_completion_percentage();

-- =====================================================
-- FUNCTION: Advance Workflow Stage
-- =====================================================

CREATE OR REPLACE FUNCTION advance_workflow_stage(
    p_session_id UUID,
    p_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_workflow_id UUID;
    v_current_stage VARCHAR(50);
    v_next_stage VARCHAR(50);
    v_can_advance BOOLEAN := TRUE;
    v_dependencies JSONB;
BEGIN
    -- Get workflow state
    SELECT id, current_stage, dependencies_check
    INTO v_workflow_id, v_current_stage, v_dependencies
    FROM counseling_workflow_state
    WHERE session_id = p_session_id;
    
    -- Determine next stage based on current stage and dependencies
    v_next_stage := CASE v_current_stage
        WHEN 'SessionStarted' THEN 'AssessmentInProgress'
        WHEN 'AssessmentInProgress' THEN 'PackageBuilt'
        WHEN 'PackageBuilt' THEN 'DocumentsCollected'
        WHEN 'DocumentsCollected' THEN 'TestsOrdered'
        WHEN 'TestsOrdered' THEN 'TestsCompleted'
        WHEN 'TestsCompleted' THEN 'FitnessClearanceObtained'
        WHEN 'FitnessClearanceObtained' THEN 'OTBooked'
        WHEN 'OTBooked' THEN 'PaymentInitiated'
        WHEN 'PaymentInitiated' THEN 'PaymentCompleted'
        WHEN 'PaymentCompleted' THEN 'InsuranceProcessing'
        WHEN 'InsuranceProcessing' THEN 'InsuranceApproved'
        WHEN 'InsuranceApproved' THEN 'ConsentsSigned'
        WHEN 'ConsentsSigned' THEN 'AdmissionScheduled'
        WHEN 'AdmissionScheduled' THEN 'ReadyForSurgery'
        WHEN 'ReadyForSurgery' THEN 'SessionCompleted'
        ELSE v_current_stage
    END;
    
    -- Update workflow state
    IF v_can_advance AND v_next_stage != v_current_stage THEN
        UPDATE counseling_workflow_state
        SET 
            current_stage = v_next_stage,
            updated_at = NOW(),
            updated_by_user_id = p_user_id
        WHERE id = v_workflow_id;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA: Sample Workflow State
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_session_id UUID;
    v_patient_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_session_id FROM counseling_sessions WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT patient_id INTO v_patient_id FROM counseling_sessions WHERE id = v_session_id;
    
    IF v_tenant_id IS NOT NULL AND v_session_id IS NOT NULL THEN
        -- Check if workflow state already exists (trigger might have created it)
        IF NOT EXISTS (SELECT 1 FROM counseling_workflow_state WHERE session_id = v_session_id) THEN
            INSERT INTO counseling_workflow_state (
                tenant_id, branch_id, session_id, patient_id, current_stage,
                session_started_at, dependencies_check, completion_percentage
            ) VALUES (
                v_tenant_id, v_branch_id, v_session_id, v_patient_id, 'PackageBuilt',
                NOW() - INTERVAL '2 hours',
                '{
                    "package_built": true,
                    "documents_collected": true,
                    "tests_ordered": false,
                    "tests_completed": false,
                    "fitness_clearance": false,
                    "ot_booked": false,
                    "payment_received": false,
                    "insurance_approved": false,
                    "consents_signed": false,
                    "admission_scheduled": false
                }'::JSONB,
                20
            );
            
            RAISE NOTICE 'Seeded 1 sample workflow state';
        ELSE
            RAISE NOTICE 'Workflow state already exists for session %', v_session_id;
        END IF;
    END IF;
END $$;

COMMENT ON TABLE counseling_workflow_state IS 'State machine tracking end-to-end counseling workflow progress';
COMMENT ON TABLE workflow_stage_transitions IS 'Audit log of all workflow stage transitions';
COMMENT ON TABLE workflow_notifications IS 'Real-time notifications for workflow events and action items';
COMMENT ON FUNCTION advance_workflow_stage IS 'Helper function to advance workflow to next logical stage';
COMMENT ON FUNCTION calculate_workflow_completion IS 'Calculate workflow completion percentage based on dependencies';
