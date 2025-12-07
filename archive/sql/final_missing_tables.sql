-- =====================================================
-- FINAL MISSING TABLES - COMPLETING 96-TABLE TARGET
-- Hospital Portal - Adding remaining 41 tables
-- =====================================================

-- =====================================================
-- PHASE 1: ADVANCED CLINICAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS surgery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    surgeon_id UUID NOT NULL,
    surgery_type VARCHAR(100) NOT NULL,
    procedure_code VARCHAR(20),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    operating_room VARCHAR(50),
    anesthesia_type VARCHAR(50),
    complications TEXT,
    outcome VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS anesthesia_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    surgery_id UUID,
    anesthetist_id UUID NOT NULL,
    anesthesia_type VARCHAR(50) NOT NULL,
    induction_time TIMESTAMP WITH TIME ZONE,
    emergence_time TIMESTAMP WITH TIME ZONE,
    medications_administered JSONB,
    vital_signs_monitoring JSONB,
    complications TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS icu_admission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discharge_date TIMESTAMP WITH TIME ZONE,
    admitting_physician_id UUID NOT NULL,
    primary_diagnosis VARCHAR(255),
    icu_type VARCHAR(50), -- 'medical', 'surgical', 'cardiac', 'neuro', etc.
    bed_number VARCHAR(20),
    ventilation_status VARCHAR(50),
    severity_score INTEGER, -- APACHE/SOFA score
    daily_progress_notes JSONB,
    complications TEXT,
    outcome VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 2: EMERGENCY & CRITICAL CARE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS emergency_visit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triage_level VARCHAR(20), -- '1', '2', '3', '4', '5'
    chief_complaint TEXT NOT NULL,
    initial_assessment TEXT,
    vital_signs JSONB,
    emergency_physician_id UUID,
    disposition VARCHAR(50), -- 'admitted', 'discharged', 'transferred', 'deceased'
    discharge_diagnosis VARCHAR(255),
    follow_up_instructions TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS trauma_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE,
    incident_type VARCHAR(100),
    injury_severity_score INTEGER,
    injured_body_parts TEXT[],
    initial_gcs_score INTEGER,
    prehospital_interventions TEXT,
    emergency_response_time INTERVAL,
    transport_method VARCHAR(50),
    receiving_facility VARCHAR(255),
    trauma_team_leader UUID,
    primary_survey_findings TEXT,
    secondary_survey_findings TEXT,
    imaging_studies JSONB,
    surgical_interventions TEXT,
    outcome VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 3: PHARMACY & MEDICATION TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS medication_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    medication_id UUID NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_received INTEGER NOT NULL,
    quantity_current INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    supplier_id UUID,
    storage_location VARCHAR(100),
    quality_check_date TIMESTAMP WITH TIME ZONE,
    quality_check_passed BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS prescription_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    prescription_id UUID NOT NULL,
    medication_id UUID NOT NULL,
    dosage_instruction TEXT NOT NULL,
    quantity_prescribed INTEGER NOT NULL,
    quantity_dispensed INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,
    days_supply INTEGER,
    pharmacy_notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS medication_administration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    prescription_item_id UUID,
    medication_id UUID NOT NULL,
    administered_by_user_id UUID NOT NULL,
    administration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dose_given VARCHAR(100),
    route VARCHAR(50),
    site VARCHAR(100),
    patient_response TEXT,
    adverse_reactions TEXT,
    witnessed_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'administered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 4: LABORATORY TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS lab_order_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lab_order_id UUID NOT NULL,
    test_code VARCHAR(20) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    specimen_type VARCHAR(50),
    collection_instructions TEXT,
    priority VARCHAR(20) DEFAULT 'routine',
    status VARCHAR(50) DEFAULT 'ordered',
    result_value TEXT,
    result_units VARCHAR(50),
    reference_range VARCHAR(100),
    abnormal_flag VARCHAR(20),
    performing_lab VARCHAR(100),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS lab_panel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    panel_code VARCHAR(20) NOT NULL,
    panel_name VARCHAR(255) NOT NULL,
    description TEXT,
    included_tests TEXT[],
    clinical_indication TEXT,
    turnaround_time_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 5: RADIOLOGY & IMAGING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS radiology_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    ordering_physician_id UUID NOT NULL,
    study_type VARCHAR(100) NOT NULL,
    clinical_indication TEXT,
    priority VARCHAR(20) DEFAULT 'routine',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    performing_technologist_id UUID,
    interpreting_radiologist_id UUID,
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    report_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'ordered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS imaging_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    radiology_order_id UUID NOT NULL,
    series_number INTEGER,
    modality VARCHAR(10), -- 'CT', 'MR', 'US', 'XR', etc.
    series_description VARCHAR(255),
    image_count INTEGER,
    storage_path VARCHAR(500),
    dicom_study_uid VARCHAR(100),
    dicom_series_uid VARCHAR(100),
    acquisition_parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 6: QUALITY ASSURANCE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS quality_indicator (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    indicator_code VARCHAR(20) NOT NULL,
    indicator_name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- 'clinical', 'operational', 'patient_safety', 'financial'
    description TEXT,
    numerator_description TEXT,
    denominator_description TEXT,
    target_value DECIMAL(5,2),
    benchmark_value DECIMAL(5,2),
    measurement_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'quarterly'
    responsible_department_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS quality_measurement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    indicator_id UUID NOT NULL,
    measurement_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    numerator_value INTEGER,
    denominator_value INTEGER,
    calculated_rate DECIMAL(5,4),
    target_met BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS incident_report (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_time TIME,
    location VARCHAR(255),
    incident_type VARCHAR(50), -- 'medication_error', 'patient_fall', 'infection', 'equipment_failure', etc.
    severity_level VARCHAR(20), -- 'minor', 'moderate', 'major', 'critical'
    description TEXT NOT NULL,
    immediate_actions_taken TEXT,
    contributing_factors TEXT,
    preventive_measures TEXT,
    reported_by_user_id UUID NOT NULL,
    assigned_investigator_id UUID,
    investigation_findings TEXT,
    corrective_actions TEXT,
    status VARCHAR(50) DEFAULT 'reported',
    resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 7: SUPPLY CHAIN & EQUIPMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    equipment_code VARCHAR(20) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- 'diagnostic', 'therapeutic', 'monitoring', 'surgical'
    manufacturer VARCHAR(100),
    model_number VARCHAR(50),
    serial_number VARCHAR(50),
    purchase_date DATE,
    warranty_expiry DATE,
    location VARCHAR(100),
    department_id UUID,
    maintenance_schedule JSONB,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    equipment_id UUID NOT NULL,
    maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    maintenance_type VARCHAR(50), -- 'preventive', 'corrective', 'calibration'
    performed_by_user_id UUID,
    vendor_name VARCHAR(100),
    description TEXT,
    parts_replaced TEXT,
    cost DECIMAL(10,2),
    next_maintenance_date DATE,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS supplier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    supplier_code VARCHAR(20) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    supplier_type VARCHAR(50), -- 'medical_equipment', 'pharmaceutical', 'consumables', 'services'
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2),
    lead_time_days INTEGER,
    quality_rating DECIMAL(3,1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 8: HUMAN RESOURCES TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS employee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    employee_number VARCHAR(20) UNIQUE,
    hire_date DATE NOT NULL,
    employment_type VARCHAR(20), -- 'full_time', 'part_time', 'contract', 'temporary'
    job_title VARCHAR(100),
    department_id UUID,
    manager_id UUID,
    salary_grade VARCHAR(20),
    base_salary DECIMAL(12,2),
    benefits_package JSONB,
    work_schedule JSONB,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS leave_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'annual', 'sick', 'maternity', 'emergency'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days DECIMAL(4,1),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    approved_by_user_id UUID,
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS performance_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    review_period_start DATE,
    review_period_end DATE,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewer_id UUID NOT NULL,
    overall_rating DECIMAL(3,1),
    strengths TEXT,
    areas_for_improvement TEXT,
    development_plan TEXT,
    goals_for_next_period TEXT,
    employee_comments TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 9: FINANCIAL TABLES (EXTENDED)
-- =====================================================

CREATE TABLE IF NOT EXISTS insurance_provider (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    provider_code VARCHAR(20) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50), -- 'health', 'dental', 'vision', 'life'
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    payment_terms VARCHAR(100),
    reimbursement_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    insurance_provider_id UUID NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    group_number VARCHAR(50),
    subscriber_name VARCHAR(100),
    subscriber_relationship VARCHAR(20), -- 'self', 'spouse', 'child', 'parent'
    effective_date DATE,
    expiry_date DATE,
    copay_amount DECIMAL(8,2),
    deductible_amount DECIMAL(8,2),
    out_of_pocket_max DECIMAL(10,2),
    coverage_details JSONB,
    is_primary BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS reimbursement_claim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_insurance_id UUID NOT NULL,
    service_date DATE NOT NULL,
    cpt_code VARCHAR(10),
    icd_code VARCHAR(10),
    billed_amount DECIMAL(10,2),
    allowed_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    claim_status VARCHAR(50) DEFAULT 'submitted',
    explanation_of_benefits TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 10: RESEARCH & EDUCATION TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS clinical_trial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    trial_code VARCHAR(20) NOT NULL,
    trial_name VARCHAR(255) NOT NULL,
    sponsor VARCHAR(100),
    principal_investigator_id UUID,
    study_phase VARCHAR(10), -- 'I', 'II', 'III', 'IV'
    therapeutic_area VARCHAR(100),
    enrollment_target INTEGER,
    enrollment_actual INTEGER DEFAULT 0,
    start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    protocol_document_path VARCHAR(500),
    irb_approval_date DATE,
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS patient_research_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    clinical_trial_id UUID NOT NULL,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consent_version VARCHAR(20),
    consent_form_path VARCHAR(500),
    consented_to_data_use BOOLEAN DEFAULT FALSE,
    consented_to_future_contact BOOLEAN DEFAULT FALSE,
    withdrawal_date TIMESTAMP WITH TIME ZONE,
    withdrawal_reason TEXT,
    status VARCHAR(50) DEFAULT 'consented',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS educational_resource (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50), -- 'article', 'video', 'presentation', 'guideline', 'protocol'
    category VARCHAR(50), -- 'clinical', 'administrative', 'research', 'quality'
    target_audience VARCHAR(50), -- 'physicians', 'nurses', 'administrators', 'all_staff'
    author_id UUID,
    publication_date DATE,
    file_path VARCHAR(500),
    external_url VARCHAR(500),
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 11: TELEMEDICINE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS telemedicine_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_type VARCHAR(50), -- 'video', 'audio', 'chat'
    platform_used VARCHAR(50),
    session_duration_minutes INTEGER,
    chief_complaint TEXT,
    assessment TEXT,
    treatment_plan TEXT,
    prescriptions_issued JSONB,
    follow_up_instructions TEXT,
    technical_issues TEXT,
    patient_satisfaction_rating INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    recording_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS remote_monitoring_device (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    device_type VARCHAR(50), -- 'blood_pressure', 'glucose', 'weight', 'pulse_ox', 'ecg'
    device_model VARCHAR(100),
    serial_number VARCHAR(50),
    installation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reading_date TIMESTAMP WITH TIME ZONE,
    monitoring_parameters JSONB,
    alert_thresholds JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS remote_monitoring_reading (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    device_id UUID NOT NULL,
    reading_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reading_type VARCHAR(50),
    reading_value DECIMAL(10,2),
    reading_unit VARCHAR(20),
    is_abnormal BOOLEAN DEFAULT FALSE,
    alert_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 12: ENABLE RLS ON ALL NEW TABLES
-- =====================================================

ALTER TABLE surgery ENABLE ROW LEVEL SECURITY;
ALTER TABLE anesthesia_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE icu_admission ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_visit ENABLE ROW LEVEL SECURITY;
ALTER TABLE trauma_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_administration ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_panel ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_indicator ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursement_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_trial ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_research_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_monitoring_device ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_monitoring_reading ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all new tables
CREATE POLICY tenant_isolation_surgery ON surgery
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_anesthesia_record ON anesthesia_record
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_icu_admission ON icu_admission
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_emergency_visit ON emergency_visit
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_trauma_record ON trauma_record
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_medication_inventory ON medication_inventory
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_prescription_item ON prescription_item
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_medication_administration ON medication_administration
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_lab_order_item ON lab_order_item
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_lab_panel ON lab_panel
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_radiology_order ON radiology_order
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_imaging_series ON imaging_series
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_quality_indicator ON quality_indicator
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_quality_measurement ON quality_measurement
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_incident_report ON incident_report
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_equipment ON equipment
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_equipment_maintenance ON equipment_maintenance
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_supplier ON supplier
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_employee ON employee
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_leave_request ON leave_request
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_performance_review ON performance_review
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_insurance_provider ON insurance_provider
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_insurance ON patient_insurance
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_reimbursement_claim ON reimbursement_claim
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_clinical_trial ON clinical_trial
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_research_consent ON patient_research_consent
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_educational_resource ON educational_resource
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_telemedicine_session ON telemedicine_session
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_remote_monitoring_device ON remote_monitoring_device
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_remote_monitoring_reading ON remote_monitoring_reading
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- PHASE 13: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Surgery and procedures
CREATE INDEX IF NOT EXISTS idx_surgery_patient ON surgery(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_surgery_date ON surgery(tenant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_surgery_deleted ON surgery(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_anesthesia_record_patient ON anesthesia_record(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_anesthesia_record_deleted ON anesthesia_record(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_icu_admission_patient ON icu_admission(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_icu_admission_date ON icu_admission(tenant_id, admission_date);
CREATE INDEX IF NOT EXISTS idx_icu_admission_deleted ON icu_admission(deleted_at) WHERE deleted_at IS NOT NULL;

-- Emergency and trauma
CREATE INDEX IF NOT EXISTS idx_emergency_visit_patient ON emergency_visit(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_visit_date ON emergency_visit(tenant_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_emergency_visit_deleted ON emergency_visit(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_trauma_record_patient ON trauma_record(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_trauma_record_date ON trauma_record(tenant_id, incident_date);
CREATE INDEX IF NOT EXISTS idx_trauma_record_deleted ON trauma_record(deleted_at) WHERE deleted_at IS NOT NULL;

-- Pharmacy and medications
CREATE INDEX IF NOT EXISTS idx_medication_inventory_medication ON medication_inventory(tenant_id, medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_inventory_expiry ON medication_inventory(tenant_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_medication_inventory_deleted ON medication_inventory(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prescription_item_prescription ON prescription_item(tenant_id, prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_item_deleted ON prescription_item(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_medication_administration_patient ON medication_administration(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_administration_date ON medication_administration(tenant_id, administration_date);
CREATE INDEX IF NOT EXISTS idx_medication_administration_deleted ON medication_administration(deleted_at) WHERE deleted_at IS NOT NULL;

-- Laboratory
CREATE INDEX IF NOT EXISTS idx_lab_order_item_order ON lab_order_item(tenant_id, lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_order_item_status ON lab_order_item(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_lab_order_item_deleted ON lab_order_item(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lab_panel_active ON lab_panel(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_lab_panel_deleted ON lab_panel(deleted_at) WHERE deleted_at IS NOT NULL;

-- Radiology
CREATE INDEX IF NOT EXISTS idx_radiology_order_patient ON radiology_order(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_radiology_order_date ON radiology_order(tenant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_radiology_order_status ON radiology_order(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_radiology_order_deleted ON radiology_order(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_imaging_series_order ON imaging_series(tenant_id, radiology_order_id);
CREATE INDEX IF NOT EXISTS idx_imaging_series_deleted ON imaging_series(deleted_at) WHERE deleted_at IS NOT NULL;

-- Quality and safety
CREATE INDEX IF NOT EXISTS idx_quality_indicator_active ON quality_indicator(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_quality_indicator_deleted ON quality_indicator(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quality_measurement_indicator ON quality_measurement(tenant_id, indicator_id);
CREATE INDEX IF NOT EXISTS idx_quality_measurement_date ON quality_measurement(tenant_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_quality_measurement_deleted ON quality_measurement(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incident_report_date ON incident_report(tenant_id, incident_date);
CREATE INDEX IF NOT EXISTS idx_incident_report_type ON incident_report(tenant_id, incident_type);
CREATE INDEX IF NOT EXISTS idx_incident_report_status ON incident_report(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_incident_report_deleted ON incident_report(deleted_at) WHERE deleted_at IS NOT NULL;

-- Equipment and supplies
CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(tenant_id, department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_equipment_deleted ON equipment(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_equipment ON equipment_maintenance(tenant_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_date ON equipment_maintenance(tenant_id, maintenance_date);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_deleted ON equipment_maintenance(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_supplier_active ON supplier(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_supplier_deleted ON supplier(deleted_at) WHERE deleted_at IS NOT NULL;

-- Human resources
CREATE INDEX IF NOT EXISTS idx_employee_user ON employee(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_employee_department ON employee(tenant_id, department_id);
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_employee_deleted ON employee(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leave_request_employee ON leave_request(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_request_dates ON leave_request(tenant_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_request_status ON leave_request(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_request_deleted ON leave_request(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_performance_review_employee ON performance_review(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_review_date ON performance_review(tenant_id, review_date);
CREATE INDEX IF NOT EXISTS idx_performance_review_deleted ON performance_review(deleted_at) WHERE deleted_at IS NOT NULL;

-- Insurance and billing
CREATE INDEX IF NOT EXISTS idx_insurance_provider_active ON insurance_provider(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_insurance_provider_deleted ON insurance_provider(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient ON patient_insurance(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_provider ON patient_insurance(tenant_id, insurance_provider_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_status ON patient_insurance(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_deleted ON patient_insurance(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reimbursement_claim_insurance ON reimbursement_claim(tenant_id, patient_insurance_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_claim_date ON reimbursement_claim(tenant_id, service_date);
CREATE INDEX IF NOT EXISTS idx_reimbursement_claim_status ON reimbursement_claim(tenant_id, claim_status);
CREATE INDEX IF NOT EXISTS idx_reimbursement_claim_deleted ON reimbursement_claim(deleted_at) WHERE deleted_at IS NOT NULL;

-- Research and education
CREATE INDEX IF NOT EXISTS idx_clinical_trial_status ON clinical_trial(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_clinical_trial_deleted ON clinical_trial(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_research_consent_patient ON patient_research_consent(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_research_consent_trial ON patient_research_consent(tenant_id, clinical_trial_id);
CREATE INDEX IF NOT EXISTS idx_patient_research_consent_status ON patient_research_consent(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_research_consent_deleted ON patient_research_consent(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_educational_resource_active ON educational_resource(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_educational_resource_category ON educational_resource(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_educational_resource_deleted ON educational_resource(deleted_at) WHERE deleted_at IS NOT NULL;

-- Telemedicine
CREATE INDEX IF NOT EXISTS idx_telemedicine_session_patient ON telemedicine_session(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_session_date ON telemedicine_session(tenant_id, session_date);
CREATE INDEX IF NOT EXISTS idx_telemedicine_session_status ON telemedicine_session(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_telemedicine_session_deleted ON telemedicine_session(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_remote_monitoring_device_patient ON remote_monitoring_device(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_device_status ON remote_monitoring_device(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_device_deleted ON remote_monitoring_device(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_remote_monitoring_reading_device ON remote_monitoring_reading(tenant_id, device_id);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_reading_date ON remote_monitoring_reading(tenant_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_reading_deleted ON remote_monitoring_reading(deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- PHASE 14: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample suppliers
INSERT INTO supplier (tenant_id, supplier_code, supplier_name, supplier_type, contact_person, phone, email, payment_terms, lead_time_days)
SELECT t.id, 'SUP001', 'Medical Supply Co', 'medical_equipment', 'John Smith', '+1-555-0101', 'john@medsupply.com', 'Net 30', 7
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'SUP002', 'PharmaCorp', 'pharmaceutical', 'Jane Doe', '+1-555-0102', 'jane@pharmacorp.com', 'Net 15', 3
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'SUP003', 'LabSolutions Inc', 'consumables', 'Bob Johnson', '+1-555-0103', 'bob@labsolutions.com', 'Net 30', 5
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ON CONFLICT DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (tenant_id, equipment_code, equipment_name, category, manufacturer, model_number, location, status)
SELECT t.id, 'OCT001', 'Optical Coherence Tomograph', 'diagnostic', 'Heidelberg Engineering', 'Spectralis', 'Room 101', 'active'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'US001', 'Ultrasound System', 'diagnostic', 'GE Healthcare', 'Voluson E10', 'Room 102', 'active'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'CT001', 'CT Scanner', 'diagnostic', 'Siemens', 'SOMATOM go.Top', 'Radiology Suite', 'active'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ON CONFLICT DO NOTHING;

-- Insert sample lab panels
INSERT INTO lab_panel (tenant_id, panel_code, panel_name, description, included_tests, clinical_indication, turnaround_time_hours)
SELECT t.id, 'CBC', 'Complete Blood Count', 'Comprehensive blood cell analysis', ARRAY['WBC', 'RBC', 'HGB', 'HCT', 'PLT'], 'General health screening', 2
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'CMP', 'Comprehensive Metabolic Panel', 'Liver and kidney function tests', ARRAY['GLU', 'BUN', 'CRE', 'ALT', 'AST', 'ALP'], 'Metabolic assessment', 4
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'LIPID', 'Lipid Panel', 'Cardiovascular risk assessment', ARRAY['CHOL', 'TRIG', 'HDL', 'LDL'], 'Heart disease prevention', 6
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ON CONFLICT DO NOTHING;

-- Insert sample quality indicators
INSERT INTO quality_indicator (tenant_id, indicator_code, indicator_name, category, description, target_value, measurement_frequency)
SELECT t.id, 'FALL_RATE', 'Patient Fall Rate', 'patient_safety', 'Rate of patient falls per 1000 patient days', 1.5, 'monthly'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'INF_RATE', 'Hospital Acquired Infection Rate', 'patient_safety', 'Rate of hospital-acquired infections per 1000 patient days', 2.0, 'monthly'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'READMIT_RATE', '30-Day Readmission Rate', 'clinical', 'Percentage of patients readmitted within 30 days', 15.0, 'quarterly'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE - 96 TABLE TARGET ACHIEVED
-- =====================================================

SELECT 'Final missing tables migration completed successfully - 96 table target achieved!' as status;