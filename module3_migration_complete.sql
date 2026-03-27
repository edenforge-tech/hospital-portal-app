-- ============================================
-- Module 3 Database Migration (3.6-3.10)
-- Counseling & Surgery Package Management
-- Date: February 23, 2026
-- Tables: 13 new tables
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MODULE 3.6: INSURANCE PRE-AUTH WORKFLOW (4 tables)
-- ============================================

-- Table: insurance_pre_authorizations
CREATE TABLE IF NOT EXISTS insurance_pre_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Insurance Details
    insurance_company VARCHAR(200) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    policy_holder_name VARCHAR(200) NOT NULL,
    relationship_to_patient VARCHAR(50),
    policy_expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Treatment Information
    treatment_type VARCHAR(200) NOT NULL,
    treatment_description TEXT,
    icd_codes TEXT[],
    procedure_codes TEXT[],
    
    -- Financial Details
    estimated_amount DECIMAL(18,2) NOT NULL,
    approved_amount DECIMAL(18,2),
    itemized_breakdown JSONB,
    
    -- Workflow Status
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    current_approval_stage VARCHAR(50) DEFAULT 'NotStarted',
    workflow_id UUID,
    
    -- TPA Details
    tpa_name VARCHAR(200),
    tpa_reference_number VARCHAR(100),
    tpa_submission_date TIMESTAMP WITH TIME ZONE,
    tpa_response_date TIMESTAMP WITH TIME ZONE,
    tpa_approval_number VARCHAR(100),
    
    -- Documents
    document_ids TEXT[],
    
    -- Priority & Notes
    priority_level VARCHAR(20) DEFAULT 'Normal',
    internal_notes TEXT,
    rejection_reason TEXT,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE insurance_pre_authorizations IS 'Module 3.6 - Insurance pre-authorization requests for surgeries and treatments';

-- Table: insurance_approval_workflows
CREATE TABLE IF NOT EXISTS insurance_approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    pre_authorization_id UUID NOT NULL REFERENCES insurance_pre_authorizations(id),
    
    -- Workflow Stages
    insurance_dept_status VARCHAR(20) DEFAULT 'Pending',
    insurance_dept_approved_by UUID,
    insurance_dept_approved_at TIMESTAMP WITH TIME ZONE,
    insurance_dept_notes TEXT,
    
    payment_dept_status VARCHAR(20) DEFAULT 'Pending',
    payment_dept_approved_by UUID,
    payment_dept_approved_at TIMESTAMP WITH TIME ZONE,
    payment_dept_notes TEXT,
    
    tpa_submission_status VARCHAR(20) DEFAULT 'Pending',
    tpa_submitted_by UUID,
    tpa_submitted_at TIMESTAMP WITH TIME ZONE,
    
    tpa_review_status VARCHAR(20) DEFAULT 'Pending',
    tpa_reviewed_at TIMESTAMP WITH TIME ZONE,
    
    tpa_approval_status VARCHAR(20) DEFAULT 'Pending',
    tpa_approved_at TIMESTAMP WITH TIME ZONE,
    tpa_final_response TEXT,
    
    -- Overall Status
    overall_status VARCHAR(20) DEFAULT 'InProgress',
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE insurance_approval_workflows IS 'Module 3.6 - Multi-stage approval workflow for insurance pre-authorizations';

-- Table: insurance_documents
CREATE TABLE IF NOT EXISTS insurance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    pre_authorization_id UUID NOT NULL REFERENCES insurance_pre_authorizations(id),
    
    -- Document Details
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(300) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Submission
    submitted_to_tpa BOOLEAN DEFAULT false,
    submission_date TIMESTAMP WITH TIME ZONE,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE insurance_documents IS 'Module 3.6 - Documents for insurance pre-authorization submissions';

-- Table: tpa_communication_logs
CREATE TABLE IF NOT EXISTS tpa_communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    pre_authorization_id UUID NOT NULL REFERENCES insurance_pre_authorizations(id),
    
    -- Communication Details
    communication_type VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    communication_method VARCHAR(50),
    
    -- Content
    subject VARCHAR(500),
    message_body TEXT,
    attachments TEXT[],
    
    -- TPA Details
    tpa_reference_number VARCHAR(100),
    tpa_contact_person VARCHAR(200),
    tpa_response_required BOOLEAN DEFAULT false,
    tpa_response_received BOOLEAN DEFAULT false,
    tpa_response_date TIMESTAMP WITH TIME ZONE,
    tpa_response_content TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_notes TEXT,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE tpa_communication_logs IS 'Module 3.6 - Bidirectional communication logs with TPAs';

-- ============================================
-- MODULE 3.7: PAYMENT PROCESSING (3 tables)
-- ============================================

-- Table: payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Payment Details
    amount DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_category VARCHAR(50),
    
    -- Payment Breakdown (for mixed payments)
    payment_breakdown JSONB,
    
    -- Payment Gateway (Razorpay)
    gateway_name VARCHAR(50),
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(500),
    gateway_response JSONB,
    
    -- Card Details (masked)
    card_last_four VARCHAR(4),
    card_type VARCHAR(50),
    card_approval_code VARCHAR(50),
    
    -- UPI Details
    upi_transaction_id VARCHAR(100),
    upi_vpa VARCHAR(100),
    
    -- Cheque Details
    cheque_number VARCHAR(50),
    cheque_bank_name VARCHAR(200),
    cheque_date DATE,
    cheque_clearance_status VARCHAR(20),
    cheque_clearance_date DATE,
    
    -- Bank Transfer Details
    bank_transaction_id VARCHAR(100),
    bank_reference_number VARCHAR(100),
    
    -- Government Scheme Details
    government_scheme_name VARCHAR(100),
    scheme_claim_id UUID,
    
    -- Insurance Details
    insurance_policy_number VARCHAR(100),
    insurance_claim_number VARCHAR(100),
    
    -- Receipt & Status
    receipt_number VARCHAR(50),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- References
    package_id UUID,
    appointment_id UUID,
    invoice_id UUID,
    
    -- Notes
    notes TEXT,
    failure_reason TEXT,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE payment_transactions IS 'Module 3.7 - Payment transactions supporting 9 payment methods including mixed payments';

-- Table: payment_links
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Payment Link Details
    amount DECIMAL(18,2) NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    short_url VARCHAR(500),
    payment_link_url TEXT,
    
    -- Razorpay Details
    razorpay_payment_link_id VARCHAR(100),
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Notifications
    notify_via_sms BOOLEAN DEFAULT false,
    notify_via_email BOOLEAN DEFAULT false,
    notify_via_whatsapp BOOLEAN DEFAULT false,
    patient_mobile VARCHAR(20),
    patient_email VARCHAR(200),
    
    -- Status
    link_status VARCHAR(20) DEFAULT 'Active',
    payment_completed BOOLEAN DEFAULT false,
    payment_transaction_id UUID,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE payment_links IS 'Module 3.7 - Razorpay payment links for remote payments';

-- Table: government_scheme_claims
CREATE TABLE IF NOT EXISTS government_scheme_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Scheme Details
    scheme_name VARCHAR(100) NOT NULL,
    scheme_id_number VARCHAR(100) NOT NULL,
    beneficiary_name VARCHAR(200) NOT NULL,
    
    -- Claim Details
    claim_amount DECIMAL(18,2) NOT NULL,
    approved_amount DECIMAL(18,2),
    treatment_details TEXT,
    hospitalization_dates DATERANGE,
    
    -- Document Submission
    documents_submitted BOOLEAN DEFAULT false,
    document_ids TEXT[],
    submission_date TIMESTAMP WITH TIME ZONE,
    
    -- Claim Processing
    claim_reference_number VARCHAR(100),
    claim_status VARCHAR(50) DEFAULT 'Draft',
    submitted_to_authority BOOLEAN DEFAULT false,
    authority_submission_date TIMESTAMP WITH TIME ZONE,
    
    -- Approval Workflow
    pending_at_level VARCHAR(100),
    current_approver UUID,
    approval_history JSONB,
    
    -- Reimbursement
    reimbursement_amount DECIMAL(18,2),
    reimbursement_date TIMESTAMP WITH TIME ZONE,
    reimbursement_reference VARCHAR(100),
    
    -- Rejection/Query
    rejection_reason TEXT,
    query_raised BOOLEAN DEFAULT false,
    query_details TEXT,
    query_response TEXT,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE government_scheme_claims IS 'Module 3.7 - Government scheme claims (ESH, CGHS, Arograshree, SGHS)';

-- ============================================
-- MODULE 3.8: ADMISSION MANAGEMENT (2 tables)
-- ============================================

-- Table: patient_admissions
CREATE TABLE IF NOT EXISTS patient_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Admission Details
    admission_number VARCHAR(50) UNIQUE,
    admission_type VARCHAR(20) NOT NULL,
    admission_status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    
    -- Scheduling
    scheduled_admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_admission_date TIMESTAMP WITH TIME ZONE,
    estimated_discharge_date TIMESTAMP WITH TIME ZONE,
    actual_discharge_date TIMESTAMP WITH TIME ZONE,
    
    -- IPD-specific
    bed_id UUID,
    ward_id UUID,
    room_number VARCHAR(50),
    
    -- Day-care specific
    daycare_slot VARCHAR(50),
    scheduled_discharge_time TIMESTAMP WITH TIME ZONE,
    
    -- Clinical Details
    admission_purpose TEXT NOT NULL,
    admission_diagnosis TEXT,
    assigned_doctor_id UUID NOT NULL,
    attending_doctors UUID[],
    
    -- Requirements
    requires_bed_reservation BOOLEAN DEFAULT false,
    bed_reservation_id UUID,
    special_requirements TEXT,
    
    -- Discharge
    discharge_summary TEXT,
    discharge_instructions TEXT,
    discharge_approved_by UUID,
    
    -- Financial
    estimated_cost DECIMAL(18,2),
    final_bill_amount DECIMAL(18,2),
    payment_settlement_status VARCHAR(20) DEFAULT 'Pending',
    
    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by UUID,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE patient_admissions IS 'Module 3.8 - Patient admission management (DayCare, IPD, Emergency)';

-- Table: bed_reservations
CREATE TABLE IF NOT EXISTS bed_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Reservation Details
    patient_id UUID NOT NULL,
    admission_id UUID REFERENCES patient_admissions(id),
    bed_id UUID NOT NULL,
    
    -- Timing
    reservation_start TIMESTAMP WITH TIME ZONE NOT NULL,
    reservation_end TIMESTAMP WITH TIME ZONE NOT NULL,
    reserved_duration_hours INTEGER,
    
    -- Status
    reservation_status VARCHAR(20) NOT NULL DEFAULT 'Reserved',
    is_confirmed BOOLEAN DEFAULT false,
    confirmed_by UUID,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Release
    auto_release_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    release_reason TEXT,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE bed_reservations IS 'Module 3.8 - Bed reservations with 24-hour auto-release';

-- ============================================
-- MODULE 3.9: CONSENT MANAGEMENT (2 tables)
-- ============================================

-- Table: consent_form_templates
CREATE TABLE IF NOT EXISTS consent_form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Template Details
    template_name VARCHAR(200) NOT NULL,
    template_category VARCHAR(50) NOT NULL,
    template_version VARCHAR(20) DEFAULT '1.0',
    
    -- Content
    html_content TEXT NOT NULL,
    placeholders TEXT[],
    
    -- Signature Requirements
    requires_patient_signature BOOLEAN DEFAULT true,
    requires_witness_signature BOOLEAN DEFAULT false,
    requires_guardian_signature BOOLEAN DEFAULT false,
    
    -- Legal Compliance
    legal_compliance_notes TEXT,
    applicable_regulations TEXT[],
    
    -- Activation
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP WITH TIME ZONE,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE consent_form_templates IS 'Module 3.9 - HTML consent form templates with placeholders';

-- Table: counseling_consents
CREATE TABLE IF NOT EXISTS counseling_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- References
    template_id UUID NOT NULL REFERENCES consent_form_templates(id),
    patient_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Rendered Content
    rendered_html TEXT NOT NULL,
    placeholder_values JSONB,
    
    -- Digital Signatures (Base64 PNG images from HTML5 Canvas)
    patient_signature_base64 TEXT,
    patient_signed_at TIMESTAMP WITH TIME ZONE,
    
    witness_signature_base64 TEXT,
    witness_name VARCHAR(200),
    witness_relationship VARCHAR(100),
    witness_signed_at TIMESTAMP WITH TIME ZONE,
    
    guardian_signature_base64 TEXT,
    guardian_name VARCHAR(200),
    guardian_relationship VARCHAR(100),
    guardian_signed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    consent_status VARCHAR(20) DEFAULT 'Draft',
    all_signatures_completed BOOLEAN DEFAULT false,
    
    -- PDF Generation
    pdf_url VARCHAR(500),
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Consent Given Details
    consent_given_by UUID,
    consent_witnessed_by UUID,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE counseling_consents IS 'Module 3.9 - Patient consent forms with HTML5 Canvas digital signatures';

-- ============================================
-- MODULE 3.10: WORKFLOW ORCHESTRATION (2 tables)
-- ============================================

-- Table: counseling_workflow_states
CREATE TABLE IF NOT EXISTS counseling_workflow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- References
    session_id UUID NOT NULL UNIQUE,
    patient_id UUID NOT NULL,
    
    -- Current State (18 possible states)
    current_state VARCHAR(50) NOT NULL DEFAULT 'SessionStarted',
    
    -- Stage Tracking
    stages_completed TEXT[],
    stages_pending TEXT[],
    stages_blocked TEXT[],
    
    -- Dependencies (JSONB for flexible structure)
    dependencies_check JSONB,
    blocking_reasons JSONB,
    
    -- Progress Tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    milestones_achieved INTEGER DEFAULT 0,
    total_milestones INTEGER DEFAULT 16,
    
    -- Milestone Timestamps (13 key milestones)
    assessment_completed_at TIMESTAMP WITH TIME ZONE,
    package_built_at TIMESTAMP WITH TIME ZONE,
    documents_collected_at TIMESTAMP WITH TIME ZONE,
    tests_ordered_at TIMESTAMP WITH TIME ZONE,
    tests_completed_at TIMESTAMP WITH TIME ZONE,
    fitness_obtained_at TIMESTAMP WITH TIME ZONE,
    ot_booked_at TIMESTAMP WITH TIME ZONE,
    payment_initiated_at TIMESTAMP WITH TIME ZONE,
    payment_completed_at TIMESTAMP WITH TIME ZONE,
    insurance_processed_at TIMESTAMP WITH TIME ZONE,
    consents_signed_at TIMESTAMP WITH TIME ZONE,
    admission_scheduled_at TIMESTAMP WITH TIME ZONE,
    ready_for_surgery_at TIMESTAMP WITH TIME ZONE,
    session_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Blocking Issues
    has_blocking_issues BOOLEAN DEFAULT false,
    blocking_issue_count INTEGER DEFAULT 0,
    
    -- Standard Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

COMMENT ON TABLE counseling_workflow_states IS 'Module 3.10 - 18-state workflow orchestration engine for counseling sessions';

-- Table: workflow_stage_transitions
CREATE TABLE IF NOT EXISTS workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- References
    workflow_id UUID NOT NULL REFERENCES counseling_workflow_states(id),
    session_id UUID NOT NULL,
    
    -- Transition Details
    from_state VARCHAR(50) NOT NULL,
    to_state VARCHAR(50) NOT NULL,
    
    -- Trigger
    triggered_by VARCHAR(50) NOT NULL,
    trigger_details TEXT,
    
    -- Notes
    transition_notes TEXT,
    
    -- Timestamp
    transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transitioned_by_user_id UUID NOT NULL,
    
    -- Standard Columns (minimal for audit table)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE workflow_stage_transitions IS 'Module 3.10 - Complete audit trail of all workflow state transitions';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Module 3.6 Indexes
CREATE INDEX idx_insurance_pre_auth_tenant_patient ON insurance_pre_authorizations(tenant_id, patient_id);
CREATE INDEX idx_insurance_pre_auth_session ON insurance_pre_authorizations(session_id);
CREATE INDEX idx_insurance_pre_auth_status ON insurance_pre_authorizations(status);
CREATE INDEX idx_insurance_approval_workflow_pre_auth ON insurance_approval_workflows(pre_authorization_id);
CREATE INDEX idx_insurance_documents_pre_auth ON insurance_documents(pre_authorization_id);
CREATE INDEX idx_tpa_communication_pre_auth ON tpa_communication_logs(pre_authorization_id);

-- Module 3.7 Indexes
CREATE INDEX idx_payment_transactions_tenant_patient ON payment_transactions(tenant_id, patient_id);
CREATE INDEX idx_payment_transactions_session ON payment_transactions(session_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(payment_date);
CREATE INDEX idx_payment_links_session ON payment_links(session_id);
CREATE INDEX idx_payment_links_status ON payment_links(link_status);
CREATE INDEX idx_government_claims_patient ON government_scheme_claims(patient_id);
CREATE INDEX idx_government_claims_status ON government_scheme_claims(claim_status);

-- Module 3.8 Indexes
CREATE INDEX idx_patient_admissions_tenant_patient ON patient_admissions(tenant_id, patient_id);
CREATE INDEX idx_patient_admissions_session ON patient_admissions(session_id);
CREATE INDEX idx_patient_admissions_status ON patient_admissions(admission_status);
CREATE INDEX idx_patient_admissions_date ON patient_admissions(scheduled_admission_date);
CREATE INDEX idx_bed_reservations_bed ON bed_reservations(bed_id);
CREATE INDEX idx_bed_reservations_status ON bed_reservations(reservation_status);
CREATE INDEX idx_bed_reservations_dates ON bed_reservations(reservation_start, reservation_end);

-- Module 3.9 Indexes
CREATE INDEX idx_consent_templates_category ON consent_form_templates(template_category);
CREATE INDEX idx_consent_templates_active ON consent_form_templates(is_active);
CREATE INDEX idx_counseling_consents_template ON counseling_consents(template_id);
CREATE INDEX idx_counseling_consents_patient ON counseling_consents(patient_id);
CREATE INDEX idx_counseling_consents_session ON counseling_consents(session_id);
CREATE INDEX idx_counseling_consents_status ON counseling_consents(consent_status);

-- Module 3.10 Indexes
CREATE INDEX idx_workflow_states_session ON counseling_workflow_states(session_id);
CREATE INDEX idx_workflow_states_patient ON counseling_workflow_states(patient_id);
CREATE INDEX idx_workflow_states_current_state ON counseling_workflow_states(current_state);
CREATE INDEX idx_workflow_transitions_workflow ON workflow_stage_transitions(workflow_id);
CREATE INDEX idx_workflow_transitions_session ON workflow_stage_transitions(session_id);
CREATE INDEX idx_workflow_transitions_date ON workflow_stage_transitions(transitioned_at);

-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all Module 3 tables
ALTER TABLE insurance_pre_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tpa_communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_scheme_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stage_transitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_isolation_insurance_pre_auth ON insurance_pre_authorizations
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_insurance_workflows ON insurance_approval_workflows
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_insurance_documents ON insurance_documents
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_tpa_logs ON tpa_communication_logs
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_payment_transactions ON payment_transactions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_payment_links ON payment_links
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_government_claims ON government_scheme_claims
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_admissions ON patient_admissions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_bed_reservations ON bed_reservations
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_consent_templates ON consent_form_templates
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_counseling_consents ON counseling_consents
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_workflow_states ON counseling_workflow_states
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_workflow_transitions ON workflow_stage_transitions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Module 3 Migration Complete (3.6-3.10)';
    RAISE NOTICE '   - 13 tables created';
    RAISE NOTICE '   - 31 indexes created';
    RAISE NOTICE '   - 13 RLS policies applied';
    RAISE NOTICE '   - Ready for Module 3 API integration';
END $$;
