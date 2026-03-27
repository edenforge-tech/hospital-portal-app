-- Phase 8: Additional Medical/Lifestyle Fields Migration
-- Date: January 30, 2026
-- Description: Add 5 lifestyle and medical habit fields for comprehensive patient care

-- Add Exercise Habits field
ALTER TABLE patient ADD COLUMN IF NOT EXISTS exercise_habits VARCHAR(100);

-- Add Diet Type field
ALTER TABLE patient ADD COLUMN IF NOT EXISTS diet_type VARCHAR(100);

-- Add Smoking Status field
ALTER TABLE patient ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(50);

-- Add Alcohol Use field
ALTER TABLE patient ADD COLUMN IF NOT EXISTS alcohol_use VARCHAR(50);

-- Add Lifestyle Notes field (for detailed lifestyle information)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS lifestyle_notes TEXT;

-- Add indexes for commonly queried lifestyle fields
CREATE INDEX IF NOT EXISTS idx_patient_smoking_status 
ON patient(tenant_id, smoking_status) 
WHERE smoking_status IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_alcohol_use 
ON patient(tenant_id, alcohol_use) 
WHERE alcohol_use IS NOT NULL AND deleted_at IS NULL;

-- Add column documentation
COMMENT ON COLUMN patient.exercise_habits IS 'Patient exercise frequency and type (e.g., Daily walking, Gym 3x/week, Sedentary)';
COMMENT ON COLUMN patient.diet_type IS 'Dietary preferences or restrictions (e.g., Vegetarian, Vegan, Diabetic, Low-sodium)';
COMMENT ON COLUMN patient.smoking_status IS 'Smoking status (Never, Former, Current - Light, Current - Heavy)';
COMMENT ON COLUMN patient.alcohol_use IS 'Alcohol consumption (None, Occasional, Moderate, Heavy)';
COMMENT ON COLUMN patient.lifestyle_notes IS 'Additional lifestyle information relevant to patient care';

-- Verify columns were added
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'patient' 
    AND column_name IN ('exercise_habits', 'diet_type', 'smoking_status', 'alcohol_use', 'lifestyle_notes')
ORDER BY column_name;
