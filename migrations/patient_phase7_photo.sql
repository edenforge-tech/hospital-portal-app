-- Phase 7: Patient Photo Upload
-- Migration Date: January 30, 2026
-- Purpose: Add photo storage fields with Azure Blob Storage integration
-- Fields: 2 (photo_url, photo_uploaded_at)

-- Add photo URL field (stores Azure Blob Storage URL)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

-- Add photo upload timestamp (audit trail)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add photo thumbnail URL for performance (optional - can be generated from photo_url)
ALTER TABLE patient ADD COLUMN IF NOT EXISTS photo_thumbnail_url VARCHAR(500);

-- Index for performance when filtering/searching patients with photos
CREATE INDEX IF NOT EXISTS idx_patient_photo_url 
ON patient(tenant_id, photo_url) 
WHERE photo_url IS NOT NULL AND deleted_at IS NULL;

-- Index for audit queries (when was photo uploaded)
CREATE INDEX IF NOT EXISTS idx_patient_photo_uploaded_at 
ON patient(tenant_id, photo_uploaded_at DESC) 
WHERE photo_uploaded_at IS NOT NULL AND deleted_at IS NULL;

-- Documentation comments
COMMENT ON COLUMN patient.photo_url IS 'Azure Blob Storage URL for patient photo (full size)';
COMMENT ON COLUMN patient.photo_uploaded_at IS 'Timestamp when patient photo was uploaded';
COMMENT ON COLUMN patient.photo_thumbnail_url IS 'Azure Blob Storage URL for patient photo thumbnail (150x150)';

-- Verification query
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'patient' 
  AND column_name IN ('photo_url', 'photo_uploaded_at', 'photo_thumbnail_url')
ORDER BY column_name;
