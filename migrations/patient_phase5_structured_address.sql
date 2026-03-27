-- =====================================================
-- Phase 5: Structured Address Fields Migration
-- =====================================================
-- Description: Add structured address fields for better location tracking
-- Fields Added: 6 (address_line_1, address_line_2, country, district, landmark, pin_code)
-- Author: Hospital Portal Dev Team
-- Date: January 2026
-- =====================================================

-- Add structured address columns to patient table
ALTER TABLE patient ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(200);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(200);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS landmark VARCHAR(200);
ALTER TABLE patient ADD COLUMN IF NOT EXISTS pin_code VARCHAR(20);

-- Create indexes for address-based searches
CREATE INDEX IF NOT EXISTS idx_patient_country ON patient(tenant_id, country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_district ON patient(tenant_id, district) WHERE district IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_pin_code ON patient(tenant_id, pin_code) WHERE pin_code IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN patient.address_line_1 IS 'Primary address line (building number, street name)';
COMMENT ON COLUMN patient.address_line_2 IS 'Secondary address line (apartment, suite, floor)';
COMMENT ON COLUMN patient.country IS 'Country of residence';
COMMENT ON COLUMN patient.district IS 'District or county';
COMMENT ON COLUMN patient.landmark IS 'Nearby landmark for easier location identification';
COMMENT ON COLUMN patient.pin_code IS 'Postal/ZIP code (alternative to postal_code)';

-- Verification query
SELECT 
    column_name, 
    data_type, 
    character_maximum_length as max_length,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_name = 'patient' 
  AND column_name IN ('address_line_1', 'address_line_2', 'country', 'district', 'landmark', 'pin_code')
ORDER BY column_name;
