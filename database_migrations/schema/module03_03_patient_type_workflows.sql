-- =====================================================
-- Module 3: Counselor Management - Patient Type Workflows
-- Migration: module03_03_patient_type_workflows.sql
-- Description: Patient type configurations, document checklists
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. PATIENT TYPE CONFIGURATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_type_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Patient Type
    patient_type VARCHAR(50) NOT NULL UNIQUE CHECK (patient_type IN ('Cash', 'Insurance', 'CoPay', 'ESH', 'CGHS', 'Arograshree', 'SGHS', 'Camp')),
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Configuration JSON
    configuration_json JSONB NOT NULL,
    /* Example structure:
    {
        "requires_advance_payment": true,
        "advance_percentage": 50,
        "required_documents": ["ID Proof", "Address Proof"],
        "requires_pre_authorization": false,
        "zero_advance_payment": false,
        "billing_mode": "direct",
        "max_pre_auth_wait_hours": 72,
        "skip_insurance": true
    }
    */
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    
    -- Constraints
    CONSTRAINT fk_patient_type_config_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. PATIENT TYPE DOCUMENT CHECKLIST
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_type_document_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Session Link
    session_id UUID NOT NULL,
    patient_type VARCHAR(50) NOT NULL,
    
    -- Document Details
    document_name VARCHAR(200) NOT NULL,
    document_description TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    
    -- Upload Status
    is_uploaded BOOLEAN DEFAULT FALSE,
    uploaded_file_path VARCHAR(500),
    uploaded_at TIMESTAMPTZ,
    uploaded_by_user_id UUID,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    rejection_reason TEXT,
    
    -- Status
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Uploaded', 'Verified', 'Rejected')),
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_document_checklist_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_checklist_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_checklist_uploaded_by FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_document_checklist_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_patient_type_config_tenant ON patient_type_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patient_type_config_active ON patient_type_configurations(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_document_checklist_session ON patient_type_document_checklist(session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_document_checklist_status ON patient_type_document_checklist(status) WHERE is_mandatory = TRUE;
CREATE INDEX IF NOT EXISTS idx_document_checklist_verification ON patient_type_document_checklist(is_verified) WHERE is_mandatory = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE patient_type_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_type_document_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patient_type_config ON patient_type_configurations
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_document_checklist ON patient_type_document_checklist
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- SEED DATA: Patient Type Configurations
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO patient_type_configurations (tenant_id, patient_type, display_name, description, configuration_json, is_active, display_order) VALUES
        (v_tenant_id, 'Cash', 'Cash Patient', 'Direct payment by patient', 
         '{"requires_advance_payment": true, "advance_percentage": 50, "required_documents": ["ID Proof", "Address Proof"], "skip_insurance": true, "billing_mode": "direct"}'::JSONB, 
         TRUE, 1),
        
        (v_tenant_id, 'Insurance', 'Insurance Patient', 'Insurance company cashless treatment', 
         '{"requires_pre_authorization": true, "max_pre_auth_wait_hours": 72, "required_documents": ["Insurance Card", "Policy Document", "ID Proof", "Employer Letter"], "skip_advance_if_approved": true, "billing_mode": "cashless"}'::JSONB, 
         TRUE, 2),
        
        (v_tenant_id, 'CoPay', 'Co-Pay Patient', 'Insurance with patient co-payment', 
         '{"requires_pre_authorization": true, "patient_pays_percentage": 20, "required_documents": ["Insurance Card", "ID Proof"], "copay_due_at": "admission", "billing_mode": "split"}'::JSONB, 
         TRUE, 3),
        
        (v_tenant_id, 'ESH', 'ESH (Employee State Health)', 'ESH government scheme', 
         '{"requires_claim_form": true, "claim_forms": ["ESH Form 1", "ESH Form 2"], "required_documents": ["ESH Card", "Employee ID", "Salary Slip"], "zero_advance_payment": true, "billing_mode": "direct_billing"}'::JSONB, 
         TRUE, 4),
        
        (v_tenant_id, 'CGHS', 'CGHS (Central Govt Health Scheme)', 'CGHS government scheme', 
         '{"requires_pre_approval": true, "approval_authority": "CGHS Wellness Center", "required_documents": ["CGHS Card", "Referral from CGHS Dispensary"], "zero_advance_payment": true, "billing_mode": "reimbursement"}'::JSONB, 
         TRUE, 5),
        
        (v_tenant_id, 'Arograshree', 'Arograshree (Karnataka State Scheme)', 'Karnataka state health scheme for BPL families', 
         '{"requires_pre_approval": true, "approval_authority": "District Health Officer", "income_certificate_required": true, "required_documents": ["Income Certificate", "Ration Card", "ID Proof"], "zero_advance_payment": true, "billing_mode": "government_reimbursement"}'::JSONB, 
         TRUE, 6),
        
        (v_tenant_id, 'SGHS', 'SGHS (State Govt Health Scheme)', 'State government employee health scheme', 
         '{"requires_departmental_approval": true, "required_documents": ["SGHS Card", "Employee ID"], "zero_advance_payment": true, "billing_mode": "direct_billing"}'::JSONB, 
         TRUE, 7),
        
        (v_tenant_id, 'Camp', 'Camp Patient (Sponsored)', 'Free surgery camp sponsored by NGO/CSR', 
         '{"zero_cost_surgery": true, "sponsor": "NGO/CSR", "required_documents": ["Camp Registration Form", "Income Certificate"], "zero_advance_payment": true, "billing_mode": "sponsored"}'::JSONB, 
         TRUE, 8);
        
        RAISE NOTICE 'Seeded 8 patient type configurations for tenant %', v_tenant_id;
    END IF;
END $$;

COMMENT ON TABLE patient_type_configurations IS 'Configuration for different patient types (Cash, Insurance, Government Schemes)';
COMMENT ON TABLE patient_type_document_checklist IS 'Dynamic document checklist based on patient type';
