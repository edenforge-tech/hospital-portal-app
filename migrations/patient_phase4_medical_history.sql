-- ====================================================================
-- Phase 4: Enhanced Medical History Migration
-- ====================================================================
-- Description: Add comprehensive medical history fields to patient table
-- Author: Hospital Portal Development Team
-- Date: January 30, 2026
-- Fields Added: 8 medical history columns
-- ====================================================================

-- Add Phase 4 columns: Enhanced Medical History
ALTER TABLE patient ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS current_medications TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS past_surgeries TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS family_medical_history TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS known_allergies_details TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS immunization_records TEXT;
ALTER TABLE patient ADD COLUMN IF NOT EXISTS disability_status VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- Add documentation comments
COMMENT ON COLUMN patient.chronic_conditions IS 'List of chronic illnesses and ongoing conditions';
COMMENT ON COLUMN patient.current_medications IS 'Active medications with dosages and schedules';
COMMENT ON COLUMN patient.past_surgeries IS 'Surgical history with dates and procedures';
COMMENT ON COLUMN patient.family_medical_history IS 'Hereditary conditions and family health background';
COMMENT ON COLUMN patient.known_allergies_details IS 'Detailed allergy information including severity and reactions';
COMMENT ON COLUMN patient.immunization_records IS 'Vaccination history with dates and types';
COMMENT ON COLUMN patient.disability_status IS 'Any disabilities or special medical conditions';
COMMENT ON COLUMN patient.special_needs IS 'Accessibility requirements and special care needs';

-- Verification query
SELECT 
    column_name,
    data_type,
    character_maximum_length as max_length,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_name = 'patient'
  AND column_name IN (
    'chronic_conditions',
    'current_medications',
    'past_surgeries',
    'family_medical_history',
    'known_allergies_details',
    'immunization_records',
    'disability_status',
    'special_needs'
  )
ORDER BY column_name;

-- ====================================================================
-- Migration Complete
-- Phase 4: 8 medical history columns added
-- Total Patient Fields: 38 + 8 = 46 fields
-- ====================================================================
