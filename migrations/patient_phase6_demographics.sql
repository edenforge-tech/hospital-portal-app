-- Phase 6: Extended Demographics
-- Description: Add 7 demographic fields for international patients, cultural care, and communication preferences
-- Date: January 30, 2026

-- Add Middle Name (legal name matching)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
COMMENT ON COLUMN patient.middle_name IS 'Middle name for legal identification and name matching';

-- Add Title/Salutation (professional courtesy)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS title VARCHAR(10);
COMMENT ON COLUMN patient.title IS 'Title or salutation (Dr, Mr, Ms, Mrs, Master, Miss)';

-- Add Nationality (international patient support)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
COMMENT ON COLUMN patient.nationality IS 'Patient nationality for international patient tracking';

-- Add Occupation (risk assessment)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS occupation VARCHAR(200);
COMMENT ON COLUMN patient.occupation IS 'Patient occupation for risk assessment and demographics';

-- Add Marital Status (family history context)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
COMMENT ON COLUMN patient.marital_status IS 'Marital status (Single, Married, Divorced, Widowed, Separated)';

-- Add Religion (cultural and dietary care)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS religion VARCHAR(100);
COMMENT ON COLUMN patient.religion IS 'Religious preference for cultural and dietary care considerations';

-- Add Language Preference (communication)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS language_preference VARCHAR(50);
COMMENT ON COLUMN patient.language_preference IS 'Preferred language for patient communication';

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_patient_nationality ON patient(tenant_id, nationality) WHERE nationality IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_language ON patient(tenant_id, language_preference) WHERE language_preference IS NOT NULL;

-- Verification query
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'patient' 
  AND column_name IN ('middle_name', 'title', 'nationality', 'occupation', 'marital_status', 'religion', 'language_preference')
ORDER BY column_name;
