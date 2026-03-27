-- =====================================================
-- Module 3: Counselor Management - Pre-Op Test Management
-- Migration: module03_04_preop_test_management.sql
-- Description: Pre-operative test protocols, orders, results, fitness clearances
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. PRE-OP TEST PROTOCOLS (Templates by Surgery Type)
-- =====================================================
CREATE TABLE IF NOT EXISTS preop_test_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Protocol Details
    protocol_name VARCHAR(200) NOT NULL,
    protocol_code VARCHAR(50) UNIQUE,
    surgery_type VARCHAR(100) NOT NULL, -- Cataract, Retinal, Glaucoma, etc.
    description TEXT,
    
    -- Required Tests List
    required_tests JSONB NOT NULL,
    /* Example structure:
    [
        {"test_name": "ECG", "test_code": "ECG-001", "is_mandatory": true, "urgency": "Urgent"},
        {"test_name": "Complete Blood Count", "test_code": "CBC-001", "is_mandatory": true, "urgency": "Routine"},
        {"test_name": "Blood Sugar (Fasting)", "test_code": "BS-FAST", "is_mandatory": true, "urgency": "Routine"},
        {"test_name": "Viral Markers (HIV, HBsAg, HCV)", "test_code": "VIRAL-MKR", "is_mandatory": true, "urgency": "Routine"},
        {"test_name": "Chest X-Ray", "test_code": "CXR", "is_mandatory": false, "urgency": "Routine"}
    ]
    */
    
    -- Validity
    test_validity_days INTEGER DEFAULT 30, -- Tests valid for 30 days
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_preop_protocol_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. PRE-OP TEST ORDERS (Orders Created by Counselor)
-- =====================================================
CREATE TABLE IF NOT EXISTS preop_test_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Links
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    protocol_id UUID NOT NULL,
    lab_order_id UUID, -- Links to Lab module order
    
    -- Order Details
    order_number VARCHAR(50) UNIQUE,
    ordered_by_user_id UUID NOT NULL,
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Results Status
    results_received BOOLEAN DEFAULT FALSE,
    results_received_at TIMESTAMPTZ,
    results_within_normal BOOLEAN,
    cleared_for_surgery BOOLEAN DEFAULT FALSE,
    
    -- Notes
    special_instructions TEXT,
    counselor_notes TEXT,
    
    -- Status
    status VARCHAR(30) DEFAULT 'Ordered' CHECK (status IN ('Ordered', 'InProgress', 'Completed', 'Cancelled')),
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_preop_order_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_preop_order_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_preop_order_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_preop_order_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_preop_order_protocol FOREIGN KEY (protocol_id) REFERENCES preop_test_protocols(id),
    CONSTRAINT fk_preop_order_ordered_by FOREIGN KEY (ordered_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. PRE-OP TEST RESULTS (Individual Test Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS preop_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Links
    order_id UUID NOT NULL,
    lab_test_result_id UUID, -- Links to Lab module test result
    
    -- Test Details
    test_name VARCHAR(200) NOT NULL,
    test_code VARCHAR(50),
    result_value VARCHAR(500),
    result_unit VARCHAR(50),
    normal_range VARCHAR(200),
    
    -- Flags
    is_abnormal BOOLEAN DEFAULT FALSE,
    severity VARCHAR(20) CHECK (severity IN ('Normal', 'BorderlineHigh', 'BorderlineLow', 'Abnormal', 'Critical')),
    requires_clearance BOOLEAN DEFAULT FALSE,
    
    -- Interpretation
    interpretation TEXT,
    clinical_significance TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_preop_result_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_preop_result_order FOREIGN KEY (order_id) REFERENCES preop_test_orders(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. PRE-OP FITNESS CLEARANCES (Medical Clearances)
-- =====================================================
CREATE TABLE IF NOT EXISTS preop_fitness_clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Links
    order_id UUID NOT NULL,
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Clearance Request
    clearance_type VARCHAR(50) CHECK (clearance_type IN ('Cardiac', 'Pulmonary', 'Endocrine', 'Nephrology', 'General Physician', 'Anesthesia')),
    abnormal_tests TEXT, -- Comma-separated list
    reason_for_clearance TEXT NOT NULL,
    
    -- Referral
    referred_to_specialty VARCHAR(100),
    referred_to_doctor_id UUID,
    referral_date DATE,
    
    -- Clearance Status
    clearance_obtained BOOLEAN DEFAULT FALSE,
    cleared_by_doctor_id UUID,
    cleared_at TIMESTAMPTZ,
    clearance_notes TEXT,
    clearance_valid_until DATE,
    
    -- Conditions
    surgery_clearance_conditions TEXT, -- e.g., "Patient to continue medications on surgery day"
    anesthesia_precautions TEXT,
    
    -- Status
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Referred', 'Cleared', 'ConditionallyCleared', 'Denied')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Routine', 'Urgent', 'Emergency')),
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_fitness_clearance_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_fitness_clearance_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_fitness_clearance_order FOREIGN KEY (order_id) REFERENCES preop_test_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_fitness_clearance_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_fitness_clearance_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_fitness_clearance_referred_to FOREIGN KEY (referred_to_doctor_id) REFERENCES users(id),
    CONSTRAINT fk_fitness_clearance_cleared_by FOREIGN KEY (cleared_by_doctor_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Protocols
CREATE INDEX IF NOT EXISTS idx_preop_protocols_tenant ON preop_test_protocols(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_protocols_surgery_type ON preop_test_protocols(surgery_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_preop_protocols_active ON preop_test_protocols(is_active);

-- Orders
CREATE INDEX IF NOT EXISTS idx_preop_orders_tenant_branch ON preop_test_orders(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_orders_session ON preop_test_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_preop_orders_patient ON preop_test_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_preop_orders_protocol ON preop_test_orders(protocol_id);
CREATE INDEX IF NOT EXISTS idx_preop_orders_status ON preop_test_orders(status);
CREATE INDEX IF NOT EXISTS idx_preop_orders_cleared ON preop_test_orders(cleared_for_surgery);
CREATE INDEX IF NOT EXISTS idx_preop_orders_results ON preop_test_orders(results_received, results_within_normal);

-- Results
CREATE INDEX IF NOT EXISTS idx_preop_results_order ON preop_test_results(order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_preop_results_abnormal ON preop_test_results(is_abnormal, requires_clearance);

-- Fitness Clearances
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_tenant_branch ON preop_fitness_clearances(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_order ON preop_fitness_clearances(order_id);
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_session ON preop_fitness_clearances(session_id);
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_patient ON preop_fitness_clearances(patient_id);
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_status ON preop_fitness_clearances(status);
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_cleared ON preop_fitness_clearances(clearance_obtained);
CREATE INDEX IF NOT EXISTS idx_fitness_clearances_doctor ON preop_fitness_clearances(referred_to_doctor_id) WHERE status = 'Referred';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE preop_test_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE preop_test_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE preop_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE preop_fitness_clearances ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_preop_protocols ON preop_test_protocols
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_preop_orders ON preop_test_orders
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_preop_results ON preop_test_results
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_fitness_clearances ON preop_fitness_clearances
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- TRIGGER: Auto-generate Order Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_preop_order_number()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_code VARCHAR(50);
    v_sequence INTEGER;
BEGIN
    -- Get branch code
    SELECT code INTO v_branch_code FROM branch WHERE id = NEW.branch_id;
    v_branch_code := COALESCE(v_branch_code, 'HQ');
    
    -- Get next sequence number for today
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM preop_test_orders
    WHERE branch_id = NEW.branch_id
    AND DATE(ordered_at) = CURRENT_DATE
    AND deleted_at IS NULL;
    
    -- Generate order number: PREOP-<BRANCH>-<YYYYMMDD>-<SEQ>
    NEW.order_number := 'PREOP-' || v_branch_code || '-' || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_preop_order_number
    BEFORE INSERT ON preop_test_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_preop_order_number();

-- =====================================================
-- SEED DATA: Pre-Op Test Protocols
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Protocol 1: Cataract Surgery
        INSERT INTO preop_test_protocols (
            tenant_id, protocol_name, protocol_code, surgery_type, description, required_tests, test_validity_days, is_active
        ) VALUES (
            v_tenant_id, 
            'Cataract Surgery Pre-Op Tests', 
            'PROTO-CAT-001', 
            'Cataract',
            'Standard pre-operative tests for cataract surgery',
            '[
                {"test_name": "ECG", "test_code": "ECG-001", "is_mandatory": true, "urgency": "Urgent"},
                {"test_name": "Complete Blood Count", "test_code": "CBC-001", "is_mandatory": true, "urgency": "Routine"},
                {"test_name": "Blood Sugar (Fasting)", "test_code": "BS-FAST", "is_mandatory": true, "urgency": "Routine"},
                {"test_name": "Viral Markers (HIV, HBsAg, HCV)", "test_code": "VIRAL-MKR", "is_mandatory": true, "urgency": "Routine"}
            ]'::JSONB,
            30,
            TRUE
        );
        
        -- Protocol 2: Retinal Surgery
        INSERT INTO preop_test_protocols (
            tenant_id, protocol_name, protocol_code, surgery_type, description, required_tests, test_validity_days, is_active
        ) VALUES (
            v_tenant_id, 
            'Retinal Surgery Pre-Op Tests', 
            'PROTO-RET-001', 
            'Retinal',
            'Pre-operative tests for retinal detachment surgery',
            '[
                {"test_name": "ECG", "test_code": "ECG-001", "is_mandatory": true, "urgency": "Urgent"},
                {"test_name": "Complete Blood Count", "test_code": "CBC-001", "is_mandatory": true, "urgency": "Urgent"},
                {"test_name": "Coagulation Profile (PT/INR, aPTT)", "test_code": "COAG-PROF", "is_mandatory": true, "urgency": "Urgent"},
                {"test_name": "Blood Sugar (Fasting)", "test_code": "BS-FAST", "is_mandatory": true, "urgency": "Routine"},
                {"test_name": "Chest X-Ray", "test_code": "CXR", "is_mandatory": true, "urgency": "Routine"},
                {"test_name": "Viral Markers (HIV, HBsAg, HCV)", "test_code": "VIRAL-MKR", "is_mandatory": true, "urgency": "Routine"}
            ]'::JSONB,
            30,
            TRUE
        );
        
        -- Protocol 3: Glaucoma Surgery
        INSERT INTO preop_test_protocols (
            tenant_id, protocol_name, protocol_code, surgery_type, description, required_tests, test_validity_days, is_active
        ) VALUES (
            v_tenant_id, 
            'Glaucoma Surgery Pre-Op Tests', 
            'PROTO-GLAUC-001', 
            'Glaucoma',
            'Pre-operative tests for trabeculectomy',
            '[
                {"test_name": "ECG", "test_code": "ECG-001", "is_mandatory": true, "urgency": "Urgent"},
                {"test_name": "Complete Blood Count", "test_code": "CBC-001", "is_mandatory": true, "urgency": "Routine"},
                {"test_name": "Blood Sugar (Fasting)", "test_code": "BS-FAST", "is_mandatory": true, "urgency": "Routine"},
                {"test_name": "Blood Pressure Monitoring", "test_code": "BP-MON", "is_mandatory": true, "urgency": "Urgent"},
                {"test_name": "Viral Markers (HIV, HBsAg, HCV)", "test_code": "VIRAL-MKR", "is_mandatory": true, "urgency": "Routine"}
            ]'::JSONB,
            30,
            TRUE
        );
        
        RAISE NOTICE 'Seeded 3 pre-op test protocols for tenant %', v_tenant_id;
    END IF;
END $$;

COMMENT ON TABLE preop_test_protocols IS 'Protocol templates defining required pre-op tests by surgery type';
COMMENT ON TABLE preop_test_orders IS 'Pre-operative test orders created by counselors';
COMMENT ON TABLE preop_test_results IS 'Individual test results from Lab module';
COMMENT ON TABLE preop_fitness_clearances IS 'Medical fitness clearances for abnormal test results';
