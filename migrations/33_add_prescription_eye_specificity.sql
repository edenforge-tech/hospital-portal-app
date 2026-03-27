-- =============================================
-- Migration: Add Eye Specificity to Prescriptions
-- Purpose: Add OD/OS/OU fields to prescription table for ophthalmology workflows
-- Author: Hospital Portal Team
-- Date: February 19, 2026
-- =============================================

-- Add eye_specificity column to prescription table
ALTER TABLE prescription 
ADD COLUMN IF NOT EXISTS eye_specificity VARCHAR(10) DEFAULT 'OU' CHECK (eye_specificity IN ('OD', 'OS', 'OU', 'Systemic'));

-- Add eye-specific instruction columns
ALTER TABLE prescription
ADD COLUMN IF NOT EXISTS od_instructions TEXT,
ADD COLUMN IF NOT EXISTS os_instructions TEXT,
ADD COLUMN IF NOT EXISTS ou_instructions TEXT;

-- Add medication route column for better tracking
ALTER TABLE prescription
ADD COLUMN IF NOT EXISTS route VARCHAR(50) CHECK (route IN ('Topical', 'Oral', 'Injectable', 'IV', 'Subconjunctival', 'Intravitreal'));

-- Add warning/allergy flag
ALTER TABLE prescription
ADD COLUMN IF NOT EXISTS has_contraindication BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS contraindication_notes TEXT,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by_user_id UUID REFERENCES users(id);

-- Create index for eye specificity searches
CREATE INDEX IF NOT EXISTS idx_prescription_eye_specificity ON prescription(eye_specificity) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prescription_patient_eye ON prescription(patient_id, eye_specificity) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prescription_contraindication ON prescription(has_contraindication) WHERE has_contraindication = true;

-- Update existing prescriptions to default OU (both eyes)
UPDATE prescription 
SET eye_specificity = 'OU', 
    ou_instructions = instructions
WHERE eye_specificity IS NULL 
  AND deleted_at IS NULL;

-- Create prescription print view with eye specificity
CREATE OR REPLACE VIEW v_prescription_print AS
SELECT 
    p.id AS prescription_id,
    p.patient_id,
    pat.first_name || ' ' || pat.last_name AS patient_name,
    pat.medical_record_number AS mrn,
    p.medication_name,
    p.dosage,
    p.frequency,
    p.duration,
    p.quantity,
    p.eye_specificity,
    CASE 
        WHEN p.eye_specificity = 'OD' THEN p.od_instructions
        WHEN p.eye_specificity = 'OS' THEN p.os_instructions
        WHEN p.eye_specificity = 'OU' THEN p.ou_instructions
        ELSE p.instructions
    END AS instructions,
    p.route,
    p.refills,
    p.start_date,
    p.end_date,
    p.prescribed_by_user_id,
    u.first_name || ' ' || u.last_name AS prescribed_by_name,
    u.email AS prescriber_email,
    p.created_at,
    t.name AS tenant_name,
    b.name AS branch_name,
    b.address AS branch_address,
    b.contact_number AS branch_phone
FROM prescription p
JOIN patient pat ON p.patient_id = pat.id
JOIN users u ON p.prescribed_by_user_id = u.id
JOIN tenant t ON p.tenant_id = t.id
LEFT JOIN branch b ON p.branch_id = b.id
WHERE p.deleted_at IS NULL
  AND p.status = 'active';

-- Create function to check for duplicate prescriptions with eye specificity
CREATE OR REPLACE FUNCTION check_duplicate_prescription(
    p_patient_id UUID,
    p_medication_name VARCHAR(255),
    p_eye_specificity VARCHAR(10),
    p_visit_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    medication_name VARCHAR(255),
    eye_specificity VARCHAR(10),
    dosage VARCHAR(100),
    prescribed_date TIMESTAMPTZ,
    prescribed_by VARCHAR(255),
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.medication_name,
        pr.eye_specificity,
        pr.dosage,
        pr.created_at AS prescribed_date,
        u.first_name || ' ' || u.last_name AS prescribed_by,
        CASE 
            WHEN pr.status = 'active' AND (pr.end_date IS NULL OR pr.end_date > NOW()) THEN true
            ELSE false
        END AS is_active
    FROM prescription pr
    JOIN users u ON pr.prescribed_by_user_id = u.id
    WHERE pr.patient_id = p_patient_id
        AND pr.deleted_at IS NULL
        AND LOWER(pr.medication_name) = LOWER(p_medication_name)
        AND (
            pr.eye_specificity = p_eye_specificity
            OR pr.eye_specificity = 'OU'
            OR p_eye_specificity = 'OU'
        )
        AND (p_visit_id IS NULL OR pr.visit_id != p_visit_id)
        AND pr.created_at > NOW() - INTERVAL '90 days'
    ORDER BY pr.created_at DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create function to get patient's active prescriptions by eye
CREATE OR REPLACE FUNCTION get_patient_active_prescriptions(
    p_patient_id UUID,
    p_eye_specificity VARCHAR(10) DEFAULT NULL
)
RETURNS TABLE (
    medication_name VARCHAR(255),
    eye_specificity VARCHAR(10),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    instructions TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.medication_name,
        pr.eye_specificity,
        pr.dosage,
        pr.frequency,
        pr.route,
        pr.start_date,
        pr.end_date,
        CASE 
            WHEN pr.eye_specificity = 'OD' THEN pr.od_instructions
            WHEN pr.eye_specificity = 'OS' THEN pr.os_instructions
            WHEN pr.eye_specificity = 'OU' THEN pr.ou_instructions
            ELSE pr.instructions
        END AS instructions
    FROM prescription pr
    WHERE pr.patient_id = p_patient_id
        AND pr.deleted_at IS NULL
        AND pr.status = 'active'
        AND (pr.end_date IS NULL OR pr.end_date > NOW())
        AND (p_eye_specificity IS NULL OR pr.eye_specificity = p_eye_specificity OR pr.eye_specificity = 'OU')
    ORDER BY pr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create prescription statistics by eye
CREATE OR REPLACE VIEW v_prescription_stats_by_eye AS
SELECT 
    t.id AS tenant_id,
    t.name AS tenant_name,
    p.eye_specificity,
    COUNT(*) AS prescription_count,
    COUNT(DISTINCT p.patient_id) AS unique_patients,
    COUNT(DISTINCT p.medication_name) AS unique_medications,
    DATE_TRUNC('month', p.created_at) AS month
FROM prescription p
JOIN tenant t ON p.tenant_id = t.id
WHERE p.deleted_at IS NULL
  AND p.created_at >= NOW() - INTERVAL '12 months'
GROUP BY t.id, t.name, p.eye_specificity, DATE_TRUNC('month', p.created_at)
ORDER BY month DESC, prescription_count DESC;

-- Add comments
COMMENT ON COLUMN prescription.eye_specificity IS 'Eye specificity: OD (right eye), OS (left eye), OU (both eyes), Systemic (oral/IV)';
COMMENT ON COLUMN prescription.od_instructions IS 'Instructions specific to right eye (OD)';
COMMENT ON COLUMN prescription.os_instructions IS 'Instructions specific to left eye (OS)';
COMMENT ON COLUMN prescription.ou_instructions IS 'Instructions for both eyes (OU)';
COMMENT ON COLUMN prescription.route IS 'Route of administration: Topical, Oral, Injectable, IV, Subconjunctival, Intravitreal';
COMMENT ON COLUMN prescription.has_contraindication IS 'Flag indicating prescription has contraindications that were overridden';
COMMENT ON FUNCTION check_duplicate_prescription IS 'Check for duplicate prescriptions considering eye specificity';
COMMENT ON FUNCTION get_patient_active_prescriptions IS 'Get all active prescriptions for a patient, optionally filtered by eye';
COMMENT ON VIEW v_prescription_print IS 'Print-ready prescription view with eye-specific instructions';

-- Sample usage examples in comments
/*
EXAMPLE 1: Search for duplicate prescription
SELECT * FROM check_duplicate_prescription(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- patient_id
    'Timolol 0.5%',                         -- medication_name
    'OD'                                     -- eye_specificity
);

EXAMPLE 2: Get all active prescriptions for right eye
SELECT * FROM get_patient_active_prescriptions(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- patient_id
    'OD'                                     -- eye_specificity
);

EXAMPLE 3: Insert new eye-specific prescription
INSERT INTO prescription (
    tenant_id, patient_id, visit_id, medication_name, dosage, frequency, duration,
    eye_specificity, od_instructions, route, prescribed_by_user_id, status
) VALUES (
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL,
    'Latanoprost 0.005%',
    '1 drop',
    'Once daily at bedtime',
    '30 days',
    'OD',
    'Instill 1 drop in the right eye every evening. Avoid touching the dropper tip to any surface.',
    'Topical',
    '56eaf718-7180-44a4-9615-706b92ed6f8d',
    'active'
);
*/

SELECT '✅ Migration 33: Prescription Eye Specificity completed successfully' AS status;
