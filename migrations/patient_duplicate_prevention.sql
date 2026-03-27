-- ============================================
-- Patient Duplicate Prevention Migration
-- Created: February 6, 2026
-- Purpose: Add indexes for duplicate patient detection
-- ============================================

-- Add unique constraint on MRN (Medical Record Number) within tenant
-- This prevents exact duplicate MRNs for the same tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_mrn_unique 
ON patient(tenant_id, medical_record_number) 
WHERE deleted_at IS NULL;

-- Add index for duplicate detection based on name + DOB
-- Speeds up queries looking for patients with same name and date of birth
CREATE INDEX IF NOT EXISTS idx_patient_duplicate_check 
ON patient(tenant_id, LOWER(first_name), LOWER(last_name), date_of_birth) 
WHERE deleted_at IS NULL;

-- Add index for phone number duplicate check
-- Helps detect if phone number already exists for another patient
CREATE INDEX IF NOT EXISTS idx_patient_phone_duplicate_check 
ON patient(tenant_id, contact_number) 
WHERE deleted_at IS NULL AND contact_number IS NOT NULL;

-- Add index for email duplicate check
-- Helps detect if email already exists for another patient
CREATE INDEX IF NOT EXISTS idx_patient_email_duplicate_check 
ON patient(tenant_id, LOWER(email)) 
WHERE deleted_at IS NULL AND email IS NOT NULL;

-- Verification query to check indexes were created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'patient' 
AND (indexname LIKE 'idx_patient_%duplicate%' OR indexname LIKE 'idx_patient_mrn%')
ORDER BY indexname;

-- Expected output: 4 indexes
-- 1. idx_patient_mrn_unique
-- 2. idx_patient_duplicate_check
-- 3. idx_patient_phone_duplicate_check
-- 4. idx_patient_email_duplicate_check
