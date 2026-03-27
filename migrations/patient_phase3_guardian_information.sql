-- =====================================================
-- Phase 3: Guardian Information Enhancement
-- Purpose: Add guardian fields for minor patients (age < 18)
-- Date: January 30, 2026
-- =====================================================

-- Add guardian information columns
ALTER TABLE patient ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS guardian_relationship VARCHAR(50);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS guardian_email VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS guardian_address TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS guardian_id_proof VARCHAR(100);

-- Create indexes for common guardian searches
CREATE INDEX IF NOT EXISTS idx_patient_guardian_name ON patient(tenant_id, guardian_name) WHERE guardian_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_guardian_phone ON patient(tenant_id, guardian_phone) WHERE guardian_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_guardian_email ON patient(tenant_id, guardian_email) WHERE guardian_email IS NOT NULL;

-- Add check constraint for minors requiring guardian
-- Note: This is a soft validation - frontend should enforce, but database allows flexibility
-- for adult patients who may also have guardians (e.g., legally incapacitated)

-- Add comments for documentation
COMMENT ON COLUMN patient.guardian_name IS 'Full name of legal guardian (required for minors under 18)';
COMMENT ON COLUMN patient.guardian_relationship IS 'Relationship to patient (e.g., Parent, Legal Guardian, Grandparent)';
COMMENT ON COLUMN patient.guardian_phone IS 'Guardian contact phone number';
COMMENT ON COLUMN patient.guardian_email IS 'Guardian email address for communications';
COMMENT ON COLUMN patient.guardian_address IS 'Guardian residential address (may differ from patient)';
COMMENT ON COLUMN patient.guardian_id_proof IS 'Guardian ID proof document reference';

-- Verification query
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'patient' 
AND column_name IN ('guardian_name', 'guardian_relationship', 'guardian_phone', 'guardian_email', 'guardian_address', 'guardian_id_proof')
ORDER BY column_name;
