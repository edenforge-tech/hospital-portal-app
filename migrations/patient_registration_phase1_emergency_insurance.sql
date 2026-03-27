-- =====================================================
-- PATIENT REGISTRATION PHASE 1: FIX DATA LOSS
-- =====================================================
-- Adds Emergency Contact, Insurance, and Audit fields
-- Priority: P0 - CRITICAL (Frontend collects but backend doesn't save)
-- Date: January 30, 2026
-- =====================================================

BEGIN;

-- =====================================================
-- EMERGENCY CONTACT FIELDS (5 fields)
-- =====================================================
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_email VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_address VARCHAR(500);

-- =====================================================
-- INSURANCE FIELDS (6 fields)
-- =====================================================
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(200);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_group_number VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_valid_from TIMESTAMPTZ;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_valid_to TIMESTAMPTZ;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_status VARCHAR(50);

-- =====================================================
-- AUDIT FIELDS (4 fields)
-- =====================================================
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_by_user_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_patients_updated_by ON patients(updated_by_user_id);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN patients.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN patients.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN patients.emergency_contact_relationship IS 'Relationship to patient (Spouse, Parent, Child, etc.)';
COMMENT ON COLUMN patients.insurance_provider IS 'Insurance company name';
COMMENT ON COLUMN patients.insurance_policy_number IS 'Insurance policy/member ID number';
COMMENT ON COLUMN patients.insurance_status IS 'Insurance status: Active, Expired, Pending';
COMMENT ON COLUMN patients.status IS 'Patient status: Active, Inactive, Deceased, Transferred';
COMMENT ON COLUMN patients.created_by_user_id IS 'User ID who registered the patient';
COMMENT ON COLUMN patients.updated_by_user_id IS 'User ID who last updated the patient record';

COMMIT;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all columns were added:
/*
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patients' 
  AND column_name IN (
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
    'emergency_contact_email', 'emergency_contact_address',
    'insurance_provider', 'insurance_policy_number', 'insurance_group_number',
    'insurance_valid_from', 'insurance_valid_to', 'insurance_status',
    'created_by_user_id', 'updated_by_user_id', 'status', 'deceased_date'
  )
ORDER BY column_name;
*/

-- Expected result: 15 rows
