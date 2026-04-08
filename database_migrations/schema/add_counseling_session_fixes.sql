-- =============================================================================
-- COUNSELING SESSION FIXES MIGRATION
-- Date: 2026-03-13
-- Purpose: 
--   1. Add new columns to counseling_sessions (surgery tentative, consent details, notes)
--   2. Add session_id FK to imaging_orders
--   3. Add session_id FK to lab_order
--   4. Create lab_test_catalog table with seeded prices
--   5. Activate patient_medical_history table with source tracking
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. NEW COLUMNS ON counseling_sessions
-- =============================================================================

ALTER TABLE counseling_sessions
    ADD COLUMN IF NOT EXISTS surgery_tentative_date        DATE,
    ADD COLUMN IF NOT EXISTS surgery_tentative_surgeon_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS surgery_tentative_time_slot   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS surgery_tentative_eye         VARCHAR(10),
    ADD COLUMN IF NOT EXISTS consent_witness_name          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS consent_witness_relation      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS video_consent_recorded        BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS consent_forms_status          JSONB,
    ADD COLUMN IF NOT EXISTS additional_notes              TEXT;

-- Index for surgeon lookup
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_surgeon
    ON counseling_sessions(surgery_tentative_surgeon_id);

-- =============================================================================
-- 2. ADD session_id FK TO imaging_orders
-- =============================================================================

ALTER TABLE imaging_orders
    ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES counseling_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_imaging_orders_session_id
    ON imaging_orders(session_id);

-- =============================================================================
-- 3. ADD session_id FK TO lab_order
-- =============================================================================

ALTER TABLE lab_order
    ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES counseling_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lab_order_session_id
    ON lab_order(session_id);

-- =============================================================================
-- 4. CREATE lab_test_catalog TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_test_catalog (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID,                          -- NULL = global/shared catalog
    test_name           VARCHAR(200) NOT NULL,
    test_code           VARCHAR(50)  NOT NULL UNIQUE,
    category            VARCHAR(100) NOT NULL,
    price               DECIMAL(12,2) NOT NULL DEFAULT 0,
    specimen_type       VARCHAR(100),
    turnaround_hours    INTEGER,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ
);

-- Seed lab test catalog with common ophthalmic + general blood tests
INSERT INTO lab_test_catalog (test_name, test_code, category, price, specimen_type, turnaround_hours) VALUES
-- Blood Sugar
('Fasting Blood Sugar (FBS)',             'FBS001',    'Blood Sugar',       150, 'Blood (Serum)',      4),
('Post Lunch Blood Sugar (PLBS)',         'PLBS001',   'Blood Sugar',       150, 'Blood (Serum)',      4),
('Random Blood Sugar (RBS)',              'RBS001',    'Blood Sugar',        80, 'Blood (Capillary)',  1),
('HbA1c (Glycated Haemoglobin)',         'HBA1C001',  'Blood Sugar',       350, 'Blood (EDTA)',       6),

-- Complete Blood Count
('Complete Blood Count (CBC)',            'CBC001',    'Haematology',       200, 'Blood (EDTA)',       4),
('Bleeding Time / Clotting Time (BT/CT)','BTCT001',   'Haematology',       100, 'Blood (cap)',        2),
('Prothrombin Time (PT/INR)',             'PTINR001',  'Haematology',       300, 'Blood (Citrate)',    6),

-- Renal / Liver
('Serum Creatinine',                     'SCREAT001', 'Biochemistry',      150, 'Blood (Serum)',      4),
('Blood Urea Nitrogen (BUN)',             'BUN001',    'Biochemistry',      150, 'Blood (Serum)',      4),
('Liver Function Test (LFT)',             'LFT001',    'Biochemistry',      450, 'Blood (Serum)',      6),
('Kidney Function Test (KFT)',            'KFT001',    'Biochemistry',      450, 'Blood (Serum)',      6),
('Serum Electrolytes (Na/K/Cl)',          'ELEC001',   'Biochemistry',      300, 'Blood (Serum)',      6),

-- Lipid
('Lipid Profile',                        'LIPID001',  'Biochemistry',      400, 'Blood (Serum)',      6),
('C-Reactive Protein (CRP)',             'CRP001',    'Biochemistry',      300, 'Blood (Serum)',      6),

-- Cardiac
('Electrocardiogram (ECG)',              'ECG001',    'Cardiac',           250, 'N/A',                1),
('Echo-2D (Echocardiography)',           'ECHO001',   'Cardiac',          1200, 'N/A',                2),

-- Viral Markers
('HBsAg (Hepatitis B)',                  'HBSAG001',  'Serology',          200, 'Blood (Serum)',      4),
('Anti-HIV 1 & 2',                       'HIV001',    'Serology',          300, 'Blood (Serum)',      4),
('Anti-HCV (Hepatitis C)',               'HCV001',    'Serology',          350, 'Blood (Serum)',      6),
('RT-PCR (COVID-19)',                    'RTPCR001',  'Molecular',         800, 'Nasopharyngeal',    12),

-- Urine
('Urine Routine & Microscopy (Urine R/E)','URME001',  'Urine',             100, 'Urine (mid-stream)', 2),

-- Blood Group
('Blood Group & Rh Factor',             'BGRF001',   'Blood Bank',         80, 'Blood (EDTA)',       2),

-- Ophthalmic Investigations
('Biometry (IOL Power Calculation)',     'BIO001',    'Ophthalmic',        500, 'N/A',                1),
('OCT Macula (Macular OCT)',            'OCTM001',   'Ophthalmic',       1500, 'N/A',                1),
('OCT RNFL (Nerve Fibre Layer)',         'OCTR001',   'Ophthalmic',       1500, 'N/A',                1),
('AS-OCT (Anterior Segment OCT)',       'ASOCT001',  'Ophthalmic',       1500, 'N/A',                1),
('Visual Field (Perimetry)',             'VF001',     'Ophthalmic',       1000, 'N/A',                1),
('Pachymetry (Corneal Thickness)',       'PACH001',   'Ophthalmic',        500, 'N/A',                1),
('Fundus Photography',                  'FUNDUS001', 'Ophthalmic',        500, 'N/A',                1),
('A-Scan (Axial Length)',                'ASCAN001',  'Ophthalmic',       1500, 'N/A',                1),
('B-Scan (Ultrasound)',                  'BSCAN001',  'Ophthalmic',       1000, 'N/A',                1),
('Specular Microscopy (Endothelial Cell)','SPEC001',  'Ophthalmic',        800, 'N/A',                1),
('FFA (Fundus Fluorescein Angiography)','FFA001',    'Ophthalmic',       2000, 'N/A',                2),
('Corneal Topography',                   'TOPO001',   'Ophthalmic',        700, 'N/A',                1),
('Schirmer''s Test (Dry Eye)',           'SCHIRM001', 'Ophthalmic',        300, 'N/A',                1),
('Gonioscopy',                           'GON001',    'Ophthalmic',        400, 'N/A',                1)
ON CONFLICT (test_code) DO UPDATE SET
    test_name      = EXCLUDED.test_name,
    category       = EXCLUDED.category,
    price          = EXCLUDED.price,
    specimen_type  = EXCLUDED.specimen_type,
    turnaround_hours = EXCLUDED.turnaround_hours,
    updated_at     = NOW();

-- =============================================================================
-- 5. ACTIVATE patient_medical_history TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS patient_medical_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    condition_name      VARCHAR(255) NOT NULL,
    icd_code            VARCHAR(20),
    diagnosis_date      DATE,
    status              VARCHAR(50) NOT NULL DEFAULT 'active', -- active, resolved, chronic
    notes               TEXT,
    source              VARCHAR(50) NOT NULL DEFAULT 'Counselor', -- Optometrist, Doctor, Counselor, Nurse
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    created_by_user_id  UUID,
    updated_by_user_id  UUID
);

CREATE INDEX IF NOT EXISTS idx_patient_medical_history_patient
    ON patient_medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_tenant
    ON patient_medical_history(tenant_id);

-- Enable RLS
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation' AND tablename = 'patient_medical_history') THEN
        CREATE POLICY tenant_isolation ON patient_medical_history
            FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
    END IF;
END $$;

ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'catalog_read_all' AND tablename = 'lab_test_catalog') THEN
        CREATE POLICY catalog_read_all ON lab_test_catalog
            FOR SELECT USING (tenant_id IS NULL OR tenant_id::text = current_setting('app.current_tenant_id', true));
    END IF;
END $$;

-- =============================================================================
-- 6. CREATE counselor_lab_order_items TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS counselor_lab_order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    session_id          UUID NOT NULL REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    ordered_by_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    lab_test_catalog_id UUID REFERENCES lab_test_catalog(id) ON DELETE SET NULL,
    test_name           VARCHAR(200) NOT NULL,
    test_code           VARCHAR(50),
    price               DECIMAL(12,2),
    urgency             VARCHAR(20) NOT NULL DEFAULT 'Routine',
    status              VARCHAR(30) NOT NULL DEFAULT 'Pending',
    notes               TEXT,
    ordered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_counselor_lab_order_items_session
    ON counselor_lab_order_items(session_id);
CREATE INDEX IF NOT EXISTS idx_counselor_lab_order_items_patient
    ON counselor_lab_order_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_counselor_lab_order_items_tenant
    ON counselor_lab_order_items(tenant_id);

ALTER TABLE counselor_lab_order_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation' AND tablename = 'counselor_lab_order_items') THEN
        CREATE POLICY tenant_isolation ON counselor_lab_order_items
            FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
    END IF;
END $$;

COMMIT;
