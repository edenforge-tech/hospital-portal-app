-- =====================================================
-- PATIENT REGISTRATION PHASE 2: Identity Documents
-- =====================================================
-- Adds identity document fields for patient verification
-- Priority: P0 - CRITICAL (Required for insurance claims)
-- Date: January 30, 2026
-- =====================================================

-- IDENTITY DOCUMENT FIELDS (6 columns)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS health_id VARCHAR(50);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(12);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS driving_license VARCHAR(50);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS id_proof_type VARCHAR(50);

-- CREATE UNIQUE CONSTRAINT FOR HEALTH_ID (UHID - Unique Hospital ID)
-- Health ID must be unique per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_unique_health_id 
ON patient(tenant_id, health_id) 
WHERE health_id IS NOT NULL AND deleted_at IS NULL;

-- CREATE INDEXES FOR COMMON SEARCHES
CREATE INDEX IF NOT EXISTS idx_patient_health_id ON patient(health_id) WHERE health_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_aadhaar ON patient(aadhaar_number) WHERE aadhaar_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_national_id ON patient(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_id_proof_type ON patient(id_proof_type);

-- ADD CHECK CONSTRAINT FOR AADHAAR (12 digits only for India)
ALTER TABLE patient ADD CONSTRAINT chk_aadhaar_format 
CHECK (aadhaar_number IS NULL OR aadhaar_number ~ '^[0-9]{12}$');

-- ADD COMMENTS FOR DOCUMENTATION
COMMENT ON COLUMN patient.health_id IS 'Unique Hospital ID (UHID) - auto-generated if not provided';
COMMENT ON COLUMN patient.aadhaar_number IS 'Aadhaar number (India) - 12 digits for insurance claims';
COMMENT ON COLUMN patient.national_id IS 'National ID / Social Security Number - varies by country';
COMMENT ON COLUMN patient.passport_number IS 'Passport number for international patients';
COMMENT ON COLUMN patient.driving_license IS 'Driving license number - alternative ID proof';
COMMENT ON COLUMN patient.id_proof_type IS 'Primary ID proof provided: Aadhaar, NationalID, Passport, DrivingLicense';

-- VERIFICATION QUERY
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patient' 
  AND column_name IN (
    'health_id', 'aadhaar_number', 'national_id',
    'passport_number', 'driving_license', 'id_proof_type'
  )
ORDER BY column_name;

-- Expected output: 6 rows confirming all identity document columns were added
