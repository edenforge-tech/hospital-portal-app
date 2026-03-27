-- Phase 2 Diagnostic & Imaging Services - Additional Tables Migration
-- Add retinopathy_screenings, oct_imaging_scans, and electrophysiology_tests tables

-- 1. Retinopathy Screening Table
CREATE TABLE IF NOT EXISTS retinopathy_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    branch_id UUID,
    eye VARCHAR(10) NOT NULL,
    screening_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    screener_id UUID,
    device VARCHAR(100),
    device_model VARCHAR(100),
    dr_grade VARCHAR(50) NOT NULL DEFAULT 'None',
    macular_edema VARCHAR(50),
    hemorrhages_count INT,
    microaneurysms_count INT,
    hard_exudates BOOLEAN DEFAULT FALSE,
    soft_exudates BOOLEAN DEFAULT FALSE,
    neovascularization BOOLEAN DEFAULT FALSE,
    venous_beading BOOLEAN DEFAULT FALSE,
    irma BOOLEAN DEFAULT FALSE,
    image_paths TEXT,
    thumbnail_path VARCHAR(500),
    referral_required BOOLEAN DEFAULT FALSE,
    follow_up_months INT,
    treatment_recommended VARCHAR(200),
    notes TEXT,
    ai_grade VARCHAR(50),
    ai_confidence DECIMAL(5,2),
    grader_agreement BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    CONSTRAINT fk_retinopathy_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_retinopathy_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_retinopathy_branch FOREIGN KEY (branch_id) REFERENCES branch(id)
);

-- 2. OCT Imaging Scans Table
CREATE TABLE IF NOT EXISTS oct_imaging_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    branch_id UUID,
    eye VARCHAR(10) NOT NULL,
    scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    technician_id UUID,
    device VARCHAR(100),
    device_model VARCHAR(100),
    scan_type VARCHAR(50) NOT NULL DEFAULT 'Macula',
    scan_pattern VARCHAR(50),
    scan_size VARCHAR(50),
    central_thickness DECIMAL(10,2),
    average_thickness DECIMAL(10,2),
    volume DECIMAL(10,2),
    rnfl_average DECIMAL(10,2),
    gcl_thickness DECIMAL(10,2),
    pathology_detected BOOLEAN DEFAULT FALSE,
    pathology_type VARCHAR(200),
    fluid_detected BOOLEAN DEFAULT FALSE,
    fluid_type VARCHAR(100),
    image_paths TEXT,
    data_file_path VARCHAR(500),
    thumbnail_path VARCHAR(500),
    signal_strength INT,
    quality_score INT,
    diagnosis VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    CONSTRAINT fk_oct_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_oct_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_oct_branch FOREIGN KEY (branch_id) REFERENCES branch(id)
);

-- 3. Electrophysiology Tests Table
CREATE TABLE IF NOT EXISTS electrophysiology_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    branch_id UUID,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    technician_id UUID,
    device VARCHAR(100),
    test_type VARCHAR(50) NOT NULL DEFAULT 'ERG',
    test_protocol VARCHAR(100),
    eye_tested VARCHAR(10) NOT NULL DEFAULT 'OU',
    scotopic_a_wave DECIMAL(10,2),
    scotopic_b_wave DECIMAL(10,2),
    photopic_a_wave DECIMAL(10,2),
    photopic_b_wave DECIMAL(10,2),
    flicker_response DECIMAL(10,2),
    p100_latency DECIMAL(10,2),
    p100_amplitude DECIMAL(10,2),
    arden_ratio DECIMAL(10,2),
    light_peak DECIMAL(10,2),
    dark_trough DECIMAL(10,2),
    interpretation VARCHAR(100),
    abnormality_type VARCHAR(200),
    waveform_data TEXT,
    image_paths TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    CONSTRAINT fk_electro_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_electro_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_electro_branch FOREIGN KEY (branch_id) REFERENCES branch(id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_retinopathy_tenant_patient ON retinopathy_screenings(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_retinopathy_screening_date ON retinopathy_screenings(screening_date);
CREATE INDEX IF NOT EXISTS idx_retinopathy_dr_grade ON retinopathy_screenings(dr_grade);
CREATE INDEX IF NOT EXISTS idx_retinopathy_branch ON retinopathy_screenings(branch_id);

CREATE INDEX IF NOT EXISTS idx_oct_tenant_patient ON oct_imaging_scans(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_oct_scan_date ON oct_imaging_scans(scan_date);
CREATE INDEX IF NOT EXISTS idx_oct_scan_type ON oct_imaging_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_oct_branch ON oct_imaging_scans(branch_id);

CREATE INDEX IF NOT EXISTS idx_electro_tenant_patient ON electrophysiology_tests(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_electro_test_date ON electrophysiology_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_electro_test_type ON electrophysiology_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_electro_branch ON electrophysiology_tests(branch_id);

-- Comments
COMMENT ON TABLE retinopathy_screenings IS 'Diabetic retinopathy screening with DR grading (None, Mild/Moderate/Severe NPDR, PDR) and AI-assisted analysis';
COMMENT ON TABLE oct_imaging_scans IS 'OCT imaging scans for macula, optic disc, anterior segment with thickness measurements and pathology detection';
COMMENT ON TABLE electrophysiology_tests IS 'Electrophysiology tests (ERG, VEP, EOG) with waveform data and interpretation';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Phase 2 diagnostic tables (retinopathy, OCT, electrophysiology) created successfully!';
END $$;
