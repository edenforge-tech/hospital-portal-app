-- =====================================================
-- PATIENT REGISTRATION PHASE 1: Emergency Contact & Insurance
-- =====================================================
-- Adds 15 missing columns to patients table to fix data loss
-- Priority: P0 - CRITICAL
-- Date: January 30, 2026
-- =====================================================

-- EMERGENCY CONTACT FIELDS (5 columns)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(200);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS emergency_contact_email VARCHAR(255);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS emergency_contact_address VARCHAR(500);

-- INSURANCE FIELDS (6 columns)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(200);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS insurance_group_number VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS insurance_valid_from TIMESTAMPTZ;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS insurance_valid_to TIMESTAMPTZ;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS insurance_status VARCHAR(50);

-- AUDIT FIELDS (4 columns)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS updated_by_user_id UUID;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE patient ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ;

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_patient_emergency_contact_name ON patient(emergency_contact_name);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_provider ON patient(insurance_provider);
CREATE INDEX IF NOT EXISTS idx_patient_status ON patient(status);
CREATE INDEX IF NOT EXISTS idx_patient_created_by_user_id ON patient(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_patient_updated_by_user_id ON patient(updated_by_user_id);

-- ADD COMMENTS FOR DOCUMENTATION
COMMENT ON COLUMN patient.emergency_contact_name IS 'Name of emergency contact person';
COMMENT ON COLUMN patient.emergency_contact_phone IS 'Phone number of emergency contact';
COMMENT ON COLUMN patient.emergency_contact_relationship IS 'Relationship to patient (e.g., spouse, parent, sibling)';
COMMENT ON COLUMN patient.emergency_contact_email IS 'Email address of emergency contact';
COMMENT ON COLUMN patient.emergency_contact_address IS 'Physical address of emergency contact';

COMMENT ON COLUMN patient.insurance_provider IS 'Name of insurance provider/company';
COMMENT ON COLUMN patient.insurance_policy_number IS 'Insurance policy/member number';
COMMENT ON COLUMN patient.insurance_group_number IS 'Insurance group number (if applicable)';
COMMENT ON COLUMN patient.insurance_valid_from IS 'Insurance coverage start date';
COMMENT ON COLUMN patient.insurance_valid_to IS 'Insurance coverage end date';
COMMENT ON COLUMN patient.insurance_status IS 'Insurance status: Active, Expired, Pending, etc.';

COMMENT ON COLUMN patient.created_by_user_id IS 'User ID who created this patient record';
COMMENT ON COLUMN patient.updated_by_user_id IS 'User ID who last updated this patient record';
COMMENT ON COLUMN patient.status IS 'Patient record status: Active, Inactive, Archived, Deceased';
COMMENT ON COLUMN patient.deceased_date IS 'Date of death (if applicable)';

-- VERIFICATION QUERY
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patient' 
  AND column_name IN (
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
    'emergency_contact_email', 'emergency_contact_address',
    'insurance_provider', 'insurance_policy_number', 'insurance_group_number',
    'insurance_valid_from', 'insurance_valid_to', 'insurance_status',
    'created_by_user_id', 'updated_by_user_id', 'status', 'deceased_date'
  )
ORDER BY column_name;

-- Expected output: 15 rows confirming all columns were added
