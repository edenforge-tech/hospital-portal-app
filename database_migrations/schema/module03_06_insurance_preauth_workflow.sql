-- =====================================================
-- Module 3: Counselor Management - Insurance Pre-Authorization
-- Migration: module03_06_insurance_preauth_workflow.sql
-- Description: Insurance pre-auth workflow with multi-stage approvals and TPA communication
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. INSURANCE PRE-AUTHORIZATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_pre_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Session & Patient Links
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Pre-Auth Details
    pre_auth_number VARCHAR(100) UNIQUE,
    insurance_type VARCHAR(50) CHECK (insurance_type IN ('Private', 'Government', 'Corporate', 'TPA')),
    insurance_provider VARCHAR(200),
    tpa_name VARCHAR(200),
    policy_number VARCHAR(100),
    policy_holder_name VARCHAR(200),
    
    -- Surgery Details
    surgery_type VARCHAR(100) NOT NULL,
    planned_procedure TEXT,
    diagnosis_code VARCHAR(50), -- ICD-10
    procedure_code VARCHAR(50), -- CPT code
    eye_operated VARCHAR(10) CHECK (eye_operated IN ('OD', 'OS', 'OU')),
    
    -- Financial
    requested_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2),
    copay_amount DECIMAL(12,2) DEFAULT 0,
    deductible_amount DECIMAL(12,2) DEFAULT 0,
    patient_payable DECIMAL(12,2),
    
    -- Package Details
    package_id UUID, -- Links to counselor_packages
    itemized_breakdown JSONB,
    /* Example:
    [
        {"item": "Surgeon Fee", "cost": 25000, "insurance_covers": 20000, "patient_pays": 5000},
        {"item": "IOL Implant", "cost": 15000, "insurance_covers": 12000, "patient_pays": 3000},
        {"item": "OT Charges", "cost": 10000, "insurance_covers": 10000, "patient_pays": 0}
    ]
    */
    
    -- Status Workflow
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN (
        'Draft', 
        'PendingInsuranceDeptReview', 
        'InsuranceDeptReviewed', 
        'PendingPaymentDeptReview', 
        'PaymentDeptReviewed',
        'SubmittedToTPA', 
        'TPAUnderReview', 
        'TPAApproved', 
        'TPAPartiallyApproved',
        'TPADenied', 
        'QueryRaised', 
        'RevisedAndResubmitted',
        'Expired',
        'Cancelled'
    )),
    
    -- Submission Tracking
    submitted_to_tpa_at TIMESTAMPTZ,
    submitted_by_user_id UUID,
    expected_approval_date DATE,
    actual_approval_date DATE,
    
    -- TPA Response
    tpa_approval_number VARCHAR(100),
    tpa_approval_letter_url TEXT,
    tpa_response_notes TEXT,
    tpa_denial_reason TEXT,
    
    -- Query Handling
    queries_raised TEXT[],
    query_responses TEXT[],
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID,
    cancellation_reason TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_pre_auth_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_pre_auth_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_pre_auth_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_pre_auth_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_pre_auth_package FOREIGN KEY (package_id) REFERENCES counselor_packages(id),
    CONSTRAINT fk_pre_auth_submitted_by FOREIGN KEY (submitted_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_pre_auth_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_pre_auth_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 2. INSURANCE APPROVAL WORKFLOW (Multi-Stage Approvals)
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_approval_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Pre-Auth Link
    pre_auth_id UUID NOT NULL,
    
    -- Workflow Stage
    stage_name VARCHAR(50) NOT NULL CHECK (stage_name IN (
        'InsuranceDeptReview', 
        'PaymentDeptReview', 
        'TPASubmission', 
        'TPAReview', 
        'TPAApproval'
    )),
    stage_sequence INTEGER NOT NULL,
    
    -- Approver Details
    approver_user_id UUID,
    approver_role VARCHAR(50), -- 'InsuranceOfficer', 'PaymentManager', 'TPACoordinator'
    
    -- Action
    action_taken VARCHAR(30) CHECK (action_taken IN ('Approved', 'Rejected', 'QueryRaised', 'Pending', 'Skipped')),
    action_timestamp TIMESTAMPTZ,
    comments TEXT,
    
    -- Attachments
    documents_uploaded TEXT[],
    
    -- Status
    is_current_stage BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_approval_workflow_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_workflow_pre_auth FOREIGN KEY (pre_auth_id) REFERENCES insurance_pre_authorizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_workflow_approver FOREIGN KEY (approver_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. INSURANCE DOCUMENTS (Supporting Documents)
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Pre-Auth Link
    pre_auth_id UUID NOT NULL,
    
    -- Document Details
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'EstimationLetter',
        'OPDPrescription',
        'DoctorRecommendation',
        'DiagnosticReports',
        'PolicyDocuments',
        'IDProof',
        'ClaimForm',
        'ConsentForm',
        'TPAApprovalLetter',
        'TPAQueriesResponse',
        'Other'
    )),
    document_name VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    
    -- Provider
    uploaded_by_user_id UUID,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Verification
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_insurance_doc_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_insurance_doc_pre_auth FOREIGN KEY (pre_auth_id) REFERENCES insurance_pre_authorizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_insurance_doc_uploaded_by FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_insurance_doc_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 4. TPA COMMUNICATION LOG (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS tpa_communication_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Pre-Auth Link
    pre_auth_id UUID NOT NULL,
    
    -- Communication Details
    communication_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    communication_type VARCHAR(30) CHECK (communication_type IN ('Email', 'Phone', 'Portal', 'InPerson', 'Fax')),
    direction VARCHAR(20) CHECK (direction IN ('Outbound', 'Inbound')),
    
    -- Parties Involved
    hospital_contact_user_id UUID,
    tpa_contact_name VARCHAR(200),
    tpa_contact_phone VARCHAR(20),
    tpa_contact_email VARCHAR(200),
    
    -- Content
    subject VARCHAR(300),
    message TEXT,
    
    -- Response
    requires_response BOOLEAN DEFAULT FALSE,
    response_received BOOLEAN DEFAULT FALSE,
    response_date TIMESTAMPTZ,
    response_text TEXT,
    
    -- Attachments
    attachments_urls TEXT[],
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_tpa_comm_log_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_tpa_comm_log_pre_auth FOREIGN KEY (pre_auth_id) REFERENCES insurance_pre_authorizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_tpa_comm_log_hospital_contact FOREIGN KEY (hospital_contact_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Insurance Pre-Authorizations
CREATE INDEX IF NOT EXISTS idx_pre_auth_tenant_branch ON insurance_pre_authorizations(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pre_auth_session ON insurance_pre_authorizations(session_id);
CREATE INDEX IF NOT EXISTS idx_pre_auth_patient ON insurance_pre_authorizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_pre_auth_status ON insurance_pre_authorizations(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pre_auth_tpa ON insurance_pre_authorizations(tpa_name, insurance_provider) WHERE status IN ('SubmittedToTPA', 'TPAUnderReview');
CREATE INDEX IF NOT EXISTS idx_pre_auth_number ON insurance_pre_authorizations(pre_auth_number);
CREATE INDEX IF NOT EXISTS idx_pre_auth_policy ON insurance_pre_authorizations(policy_number);
CREATE INDEX IF NOT EXISTS idx_pre_auth_validity ON insurance_pre_authorizations(valid_until) WHERE status = 'TPAApproved' AND valid_until >= CURRENT_DATE;

-- Insurance Approval Workflow
CREATE INDEX IF NOT EXISTS idx_approval_workflow_pre_auth ON insurance_approval_workflow(pre_auth_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_approver ON insurance_approval_workflow(approver_user_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_current_stage ON insurance_approval_workflow(is_current_stage) WHERE is_current_stage = TRUE;
CREATE INDEX IF NOT EXISTS idx_approval_workflow_pending ON insurance_approval_workflow(action_taken) WHERE action_taken = 'Pending';

-- Insurance Documents
CREATE INDEX IF NOT EXISTS idx_insurance_docs_pre_auth ON insurance_documents(pre_auth_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_docs_type ON insurance_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_insurance_docs_verification ON insurance_documents(is_verified) WHERE is_verified = FALSE;

-- TPA Communication Log
CREATE INDEX IF NOT EXISTS idx_tpa_comm_log_pre_auth ON tpa_communication_log(pre_auth_id);
CREATE INDEX IF NOT EXISTS idx_tpa_comm_log_date ON tpa_communication_log(communication_date DESC);
CREATE INDEX IF NOT EXISTS idx_tpa_comm_log_follow_up ON tpa_communication_log(follow_up_date) WHERE follow_up_required = TRUE AND follow_up_completed = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE insurance_pre_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tpa_communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_pre_auth ON insurance_pre_authorizations
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_approval_workflow ON insurance_approval_workflow
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_insurance_docs ON insurance_documents
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_tpa_comm_log ON tpa_communication_log
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- TRIGGER: Auto-generate Pre-Auth Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_pre_auth_number()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_code VARCHAR(50);
    v_sequence INTEGER;
BEGIN
    -- Get branch code
    SELECT code INTO v_branch_code FROM branch WHERE id = NEW.branch_id;
    v_branch_code := COALESCE(v_branch_code, 'HQ');
    
    -- Get next sequence number for the day
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM insurance_pre_authorizations
    WHERE branch_id = NEW.branch_id
    AND DATE(created_at) = CURRENT_DATE
    AND deleted_at IS NULL;
    
    -- Generate pre-auth number: PREAUTH-<BRANCH>-<YYYYMMDD>-<SEQ>
    NEW.pre_auth_number := 'PREAUTH-' || v_branch_code || '-' || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_pre_auth_number
    BEFORE INSERT ON insurance_pre_authorizations
    FOR EACH ROW
    WHEN (NEW.pre_auth_number IS NULL)
    EXECUTE FUNCTION generate_pre_auth_number();

-- =====================================================
-- TRIGGER: Auto-create Approval Workflow Stages
-- =====================================================

CREATE OR REPLACE FUNCTION create_approval_workflow_stages()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default workflow stages for new pre-auth
    INSERT INTO insurance_approval_workflow (tenant_id, pre_auth_id, stage_name, stage_sequence, action_taken, is_current_stage)
    VALUES
        (NEW.tenant_id, NEW.id, 'InsuranceDeptReview', 1, 'Pending', TRUE),
        (NEW.tenant_id, NEW.id, 'PaymentDeptReview', 2, 'Pending', FALSE),
        (NEW.tenant_id, NEW.id, 'TPASubmission', 3, 'Pending', FALSE),
        (NEW.tenant_id, NEW.id, 'TPAReview', 4, 'Pending', FALSE),
        (NEW.tenant_id, NEW.id, 'TPAApproval', 5, 'Pending', FALSE);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_workflow_stages
    AFTER INSERT ON insurance_pre_authorizations
    FOR EACH ROW
    WHEN (NEW.status = 'Draft')
    EXECUTE FUNCTION create_approval_workflow_stages();

-- =====================================================
-- SEED DATA: Sample Insurance Pre-Authorization
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_session_id UUID;
    v_patient_id UUID;
    v_package_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_session_id FROM counseling_sessions WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_package_id FROM counselor_packages WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_tenant_id IS NOT NULL AND v_session_id IS NOT NULL THEN
        -- Sample pre-authorization
        INSERT INTO insurance_pre_authorizations (
            tenant_id, branch_id, session_id, patient_id, insurance_type, insurance_provider,
            tpa_name, policy_number, surgery_type, requested_amount, status, package_id,
            created_by_user_id
        )
        SELECT
            v_tenant_id, v_branch_id, v_session_id, v_patient_id, 'TPA', 'Star Health Insurance',
            'Medi Assist', 'SH/2024/12345', 'Cataract Surgery with IOL', 65000, 'Draft', v_package_id,
            id FROM users WHERE tenant_id = v_tenant_id LIMIT 1;
        
        RAISE NOTICE 'Seeded 1 sample insurance pre-authorization';
    END IF;
END $$;

COMMENT ON TABLE insurance_pre_authorizations IS 'Insurance pre-authorization requests with multi-stage workflow';
COMMENT ON TABLE insurance_approval_workflow IS 'Multi-stage approval workflow tracking for insurance pre-auth';
COMMENT ON TABLE insurance_documents IS 'Supporting documents for insurance claims and pre-authorizations';
COMMENT ON TABLE tpa_communication_log IS 'Audit trail of all communications with TPAs (Third Party Administrators)';
