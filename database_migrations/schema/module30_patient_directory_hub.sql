-- ============================================================================
-- Module 30: Patient Directory Hub - Database Migration
-- Created: February 9, 2026
-- Tables: patient_allergies, patient_consents, patient_communications,
--         lab_reports, patient_insurance, patient_notes, optical_orders
-- ============================================================================

BEGIN;

-- 1. Patient Allergies
CREATE TABLE IF NOT EXISTS patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    allergen_name VARCHAR(200) NOT NULL,
    allergen_type VARCHAR(50) DEFAULT 'medication',
    severity VARCHAR(20) DEFAULT 'moderate',
    reaction VARCHAR(500),
    onset_date TIMESTAMPTZ,
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(200),
    notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_allergies_tenant_patient ON patient_allergies(tenant_id, patient_id);
CREATE INDEX idx_patient_allergies_status ON patient_allergies(status) WHERE deleted_at IS NULL;

ALTER TABLE patient_allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_patient_allergies ON patient_allergies
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 2. Patient Consents
CREATE TABLE IF NOT EXISTS patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    consent_type VARCHAR(50) NOT NULL DEFAULT 'treatment',
    consent_name VARCHAR(300) NOT NULL,
    description VARCHAR(2000),
    is_granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    witness_name VARCHAR(200),
    document_url VARCHAR(500),
    signature_url VARCHAR(500),
    ip_address VARCHAR(50),
    notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_consents_tenant_patient ON patient_consents(tenant_id, patient_id);
CREATE INDEX idx_patient_consents_type ON patient_consents(consent_type) WHERE deleted_at IS NULL;

ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_patient_consents ON patient_consents
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 3. Patient Communications
CREATE TABLE IF NOT EXISTS patient_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    communication_type VARCHAR(30) NOT NULL DEFAULT 'sms',
    direction VARCHAR(20) NOT NULL DEFAULT 'outbound',
    subject VARCHAR(300),
    message VARCHAR(4000),
    recipient VARCHAR(200),
    sender VARCHAR(200),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    sent_by_user_id UUID,
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50),
    notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_comms_tenant_patient ON patient_communications(tenant_id, patient_id);
CREATE INDEX idx_patient_comms_sent_at ON patient_communications(sent_at) WHERE deleted_at IS NULL;

ALTER TABLE patient_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_patient_communications ON patient_communications
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 4. Lab Reports
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_id UUID REFERENCES visits(id),
    test_name VARCHAR(300) NOT NULL,
    test_code VARCHAR(50),
    test_category VARCHAR(100),
    ordered_by_name VARCHAR(200),
    ordered_by_id UUID,
    ordered_at TIMESTAMPTZ,
    sample_collected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result_value VARCHAR(200),
    result_unit VARCHAR(50),
    reference_range VARCHAR(200),
    interpretation VARCHAR(20),
    lab_name VARCHAR(200),
    technician_name VARCHAR(200),
    verified_by_name VARCHAR(200),
    specimen_type VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'routine',
    notes VARCHAR(2000),
    report_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'ordered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_lab_reports_tenant_patient ON lab_reports(tenant_id, patient_id);
CREATE INDEX idx_lab_reports_status ON lab_reports(status) WHERE deleted_at IS NULL;

ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lab_reports ON lab_reports
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 5. Patient Insurance
CREATE TABLE IF NOT EXISTS patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    provider_name VARCHAR(300) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    group_number VARCHAR(100),
    policy_type VARCHAR(50) DEFAULT 'primary',
    plan_name VARCHAR(200),
    subscriber_name VARCHAR(200),
    subscriber_id VARCHAR(100),
    subscriber_relation VARCHAR(50) DEFAULT 'self',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    copay_amount DECIMAL(10,2),
    deductible_amount DECIMAL(10,2),
    deductible_met DECIMAL(10,2),
    out_of_pocket_max DECIMAL(10,2),
    out_of_pocket_met DECIMAL(10,2),
    coverage_details VARCHAR(4000),
    pre_auth_required BOOLEAN DEFAULT FALSE,
    pre_auth_number VARCHAR(100),
    contact_phone VARCHAR(30),
    notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_insurance_tenant_patient ON patient_insurance(tenant_id, patient_id);
CREATE INDEX idx_patient_insurance_policy ON patient_insurance(policy_number) WHERE deleted_at IS NULL;

ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_patient_insurance ON patient_insurance
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 6. Patient Notes
CREATE TABLE IF NOT EXISTS patient_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_id UUID REFERENCES visits(id),
    note_type VARCHAR(50) NOT NULL DEFAULT 'general',
    title VARCHAR(300) NOT NULL,
    content VARCHAR(8000) NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal',
    author_id UUID,
    author_name VARCHAR(200),
    is_confidential BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_notes_tenant_patient ON patient_notes(tenant_id, patient_id);
CREATE INDEX idx_patient_notes_type ON patient_notes(note_type) WHERE deleted_at IS NULL;

ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_patient_notes ON patient_notes
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 7. Optical Orders
CREATE TABLE IF NOT EXISTS optical_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    visit_id UUID REFERENCES visits(id),
    order_number VARCHAR(50),
    order_type VARCHAR(50) NOT NULL DEFAULT 'eyeglasses',
    od_sphere DECIMAL(6,2),
    od_cylinder DECIMAL(6,2),
    od_axis INTEGER,
    od_add DECIMAL(6,2),
    od_prism VARCHAR(50),
    od_va VARCHAR(20),
    os_sphere DECIMAL(6,2),
    os_cylinder DECIMAL(6,2),
    os_axis INTEGER,
    os_add DECIMAL(6,2),
    os_prism VARCHAR(50),
    os_va VARCHAR(20),
    pd DECIMAL(5,2),
    pd_right DECIMAL(5,2),
    pd_left DECIMAL(5,2),
    seg_height DECIMAL(5,2),
    frame_type VARCHAR(100),
    frame_brand VARCHAR(200),
    frame_model VARCHAR(200),
    frame_color VARCHAR(100),
    lens_type VARCHAR(100),
    lens_material VARCHAR(100),
    lens_coating VARCHAR(200),
    tint VARCHAR(100),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estimated_delivery TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    prescribed_by_name VARCHAR(200),
    prescribed_by_id UUID,
    notes VARCHAR(2000),
    status VARCHAR(30) NOT NULL DEFAULT 'ordered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_optical_orders_tenant_patient ON optical_orders(tenant_id, patient_id);
CREATE INDEX idx_optical_orders_status ON optical_orders(status) WHERE deleted_at IS NULL;

ALTER TABLE optical_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_optical_orders ON optical_orders
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

COMMIT;
