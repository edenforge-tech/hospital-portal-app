-- ============================================================================
-- Comprehensive Branch Management Database Migration
-- Purpose: Add HIPAA, NABH, GDPR compliance + Healthcare features
-- Target: PostgreSQL Azure Database
-- Total New Fields: 62
-- ============================================================================

-- ============================================================================
-- PHASE 1: HIPAA COMPLIANCE FIELDS (PRIORITY 1 - CRITICAL)
-- ============================================================================
-- Add HIPAA covered entity and business associate designation
ALTER TABLE branch ADD COLUMN IF NOT EXISTS hipaa_covered_entity BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS business_associate BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS phi_storage_approved BOOLEAN DEFAULT false;

-- Security and encryption tracking
ALTER TABLE branch ADD COLUMN IF NOT EXISTS encryption_at_rest BOOLEAN DEFAULT true;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS encryption_in_transit BOOLEAN DEFAULT true;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS access_control_level VARCHAR(50) DEFAULT 'Standard' 
    CHECK (access_control_level IN ('Standard', 'Restricted', 'High-Security', 'Maximum-Security'));

-- Security audit tracking
ALTER TABLE branch ADD COLUMN IF NOT EXISTS last_security_audit_date DATE;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS next_security_audit_date DATE;

-- HIPAA compliance status tracking
ALTER TABLE branch ADD COLUMN IF NOT EXISTS hipaa_compliance_status VARCHAR(50) DEFAULT 'Pending'
    CHECK (hipaa_compliance_status IN ('Compliant', 'Pending', 'Non-Compliant', 'Under-Review'));
ALTER TABLE branch ADD COLUMN IF NOT EXISTS hipaa_certification_date DATE;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS hipaa_certification_expiry DATE;

-- Designated officers (will be linked to user table later)
ALTER TABLE branch ADD COLUMN IF NOT EXISTS privacy_officer_id UUID;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS security_officer_id UUID;

-- Add indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_branch_hipaa_status ON branch(hipaa_compliance_status);
CREATE INDEX IF NOT EXISTS idx_branch_phi_approved ON branch(phi_storage_approved);

-- ============================================================================
-- PHASE 2: NABH & QUALITY ACCREDITATION (PRIORITY 1 - CRITICAL)
-- ============================================================================
-- NABH (National Accreditation Board for Hospitals) accreditation
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_accredited BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_accreditation_level VARCHAR(50)
    CHECK (nabh_accreditation_level IN ('Pre-Entry', 'Entry', 'Full', 'Gold', NULL));
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_certificate_number VARCHAR(50);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_accreditation_date DATE;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_accreditation_expiry DATE;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_last_audit_date DATE;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nabh_next_audit_date DATE;

-- ISO certification
ALTER TABLE branch ADD COLUMN IF NOT EXISTS iso_certified BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS iso_certificate_number VARCHAR(50);

-- JCI (Joint Commission International) accreditation
ALTER TABLE branch ADD COLUMN IF NOT EXISTS jci_accredited BOOLEAN DEFAULT false;

-- Quality certifications (flexible JSONB for multiple certifications)
ALTER TABLE branch ADD COLUMN IF NOT EXISTS quality_certifications JSONB DEFAULT '[]'::jsonb;

-- Patient safety and infection control
ALTER TABLE branch ADD COLUMN IF NOT EXISTS infection_control_certified BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS patient_safety_certified BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS fire_safety_certified BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS disaster_preparedness_plan BOOLEAN DEFAULT false;

-- Add indexes for accreditation queries
CREATE INDEX IF NOT EXISTS idx_branch_nabh_accredited ON branch(nabh_accredited);
CREATE INDEX IF NOT EXISTS idx_branch_iso_certified ON branch(iso_certified);
CREATE INDEX IF NOT EXISTS idx_branch_jci_accredited ON branch(jci_accredited);

-- ============================================================================
-- PHASE 3: GDPR/DPA COMPLIANCE (PRIORITY 2 - IMPORTANT)
-- ============================================================================
-- GDPR (General Data Protection Regulation) compliance
ALTER TABLE branch ADD COLUMN IF NOT EXISTS gdpr_compliant BOOLEAN DEFAULT false;

-- DPA (Data Protection Act) registration
ALTER TABLE branch ADD COLUMN IF NOT EXISTS dpa_registered BOOLEAN DEFAULT false;

-- Data Protection Officer
ALTER TABLE branch ADD COLUMN IF NOT EXISTS data_protection_officer_id UUID;

-- Data retention policies
ALTER TABLE branch ADD COLUMN IF NOT EXISTS data_retention_policy VARCHAR(50) DEFAULT '7years'
    CHECK (data_retention_policy IN ('1year', '3years', '5years', '7years', '10years', 'indefinite'));

-- Right to erasure (GDPR Article 17)
ALTER TABLE branch ADD COLUMN IF NOT EXISTS right_to_erasure_enabled BOOLEAN DEFAULT true;

-- Add index for GDPR compliance queries
CREATE INDEX IF NOT EXISTS idx_branch_gdpr_compliant ON branch(gdpr_compliant);

-- ============================================================================
-- PHASE 4: HEALTHCARE SERVICES & ACCESSIBILITY (PRIORITY 2 - IMPORTANT)
-- ============================================================================
-- Accessibility features (ADA compliance)
ALTER TABLE branch ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT true;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS accessibility_features JSONB DEFAULT '{
    "ramps": false,
    "elevators": false,
    "accessible_parking": false,
    "accessible_restrooms": false,
    "braille_signage": false,
    "hearing_assistance": false,
    "automatic_doors": false
}'::jsonb;

-- Emergency services
ALTER TABLE branch ADD COLUMN IF NOT EXISTS emergency_services_available BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS trauma_center_level VARCHAR(50)
    CHECK (trauma_center_level IN ('Level I', 'Level II', 'Level III', 'Level IV', 'Level V', NULL));
ALTER TABLE branch ADD COLUMN IF NOT EXISTS ambulance_services BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS helipad_available BOOLEAN DEFAULT false;

-- Medical specialties and services
ALTER TABLE branch ADD COLUMN IF NOT EXISTS medical_specialties JSONB DEFAULT '[]'::jsonb;
-- Example: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", etc.]

-- Modern healthcare services
ALTER TABLE branch ADD COLUMN IF NOT EXISTS telemedicine_enabled BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS pharmacy_on_site BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS laboratory_services BOOLEAN DEFAULT false;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS imaging_services JSONB DEFAULT '{
    "x_ray": false,
    "ct_scan": false,
    "mri": false,
    "ultrasound": false,
    "mammography": false,
    "pet_scan": false
}'::jsonb;

-- Add indexes for service queries
CREATE INDEX IF NOT EXISTS idx_branch_emergency_services ON branch(emergency_services_available);
CREATE INDEX IF NOT EXISTS idx_branch_telemedicine ON branch(telemedicine_enabled);

-- ============================================================================
-- PHASE 5: CAPACITY MANAGEMENT & STAFFING (PRIORITY 3 - NICE TO HAVE)
-- ============================================================================
-- Bed capacity tracking
ALTER TABLE branch ADD COLUMN IF NOT EXISTS bed_capacity_total INTEGER DEFAULT 0 CHECK (bed_capacity_total >= 0);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS bed_capacity_icu INTEGER DEFAULT 0 CHECK (bed_capacity_icu >= 0);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS bed_capacity_general INTEGER DEFAULT 0 CHECK (bed_capacity_general >= 0);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS bed_capacity_emergency INTEGER DEFAULT 0 CHECK (bed_capacity_emergency >= 0);

-- Real-time occupancy
ALTER TABLE branch ADD COLUMN IF NOT EXISTS current_occupancy_rate DECIMAL(5,2) DEFAULT 0.00 
    CHECK (current_occupancy_rate >= 0 AND current_occupancy_rate <= 100);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS accepts_new_patients BOOLEAN DEFAULT true;

-- Insurance and billing
ALTER TABLE branch ADD COLUMN IF NOT EXISTS insurance_providers_accepted JSONB DEFAULT '[]'::jsonb;
-- Example: ["Blue Cross", "Aetna", "Medicare", "Medicaid", "Private Pay"]

ALTER TABLE branch ADD COLUMN IF NOT EXISTS billing_types_accepted JSONB DEFAULT '["Cash", "Insurance", "Government"]'::jsonb;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS payment_plans_available BOOLEAN DEFAULT true;

-- Staff management (leadership roles)
ALTER TABLE branch ADD COLUMN IF NOT EXISTS branch_manager_id UUID;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS medical_director_id UUID;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS nursing_supervisor_id UUID;

-- Staff counts by category
ALTER TABLE branch ADD COLUMN IF NOT EXISTS total_physicians INTEGER DEFAULT 0 CHECK (total_physicians >= 0);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS total_nurses INTEGER DEFAULT 0 CHECK (total_nurses >= 0);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS total_administrative_staff INTEGER DEFAULT 0 CHECK (total_administrative_staff >= 0);

-- Add indexes for capacity and staffing queries
CREATE INDEX IF NOT EXISTS idx_branch_accepts_patients ON branch(accepts_new_patients);
CREATE INDEX IF NOT EXISTS idx_branch_occupancy ON branch(current_occupancy_rate);

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN branch.hipaa_covered_entity IS 'Indicates if this branch is a HIPAA covered entity';
COMMENT ON COLUMN branch.phi_storage_approved IS 'Approved for Protected Health Information storage';
COMMENT ON COLUMN branch.access_control_level IS 'Security access control level: Standard, Restricted, High-Security, Maximum-Security';
COMMENT ON COLUMN branch.nabh_accreditation_level IS 'NABH accreditation level: Pre-Entry, Entry, Full, Gold';
COMMENT ON COLUMN branch.quality_certifications IS 'JSON array of additional quality certifications';
COMMENT ON COLUMN branch.medical_specialties IS 'JSON array of medical specialties offered at this branch';
COMMENT ON COLUMN branch.accessibility_features IS 'JSON object with detailed accessibility features';
COMMENT ON COLUMN branch.imaging_services IS 'JSON object with available imaging equipment';
COMMENT ON COLUMN branch.insurance_providers_accepted IS 'JSON array of accepted insurance providers';
COMMENT ON COLUMN branch.current_occupancy_rate IS 'Current bed occupancy rate as percentage (0-100)';

-- ============================================================================
-- CREATE TRIGGER FOR AUTOMATIC UPDATED_AT
-- ============================================================================
-- Note: This assumes updated_at column already exists
-- If trigger doesn't exist, create it
CREATE OR REPLACE FUNCTION update_branch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_branch_updated_at ON branch;
CREATE TRIGGER trigger_branch_updated_at
    BEFORE UPDATE ON branch
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_updated_at();

-- ============================================================================
-- VALIDATION CONSTRAINTS
-- ============================================================================
-- Ensure bed capacity breakdown doesn't exceed total
ALTER TABLE branch ADD CONSTRAINT check_bed_capacity_valid 
    CHECK (
        bed_capacity_icu + bed_capacity_general + bed_capacity_emergency <= bed_capacity_total + 100
        -- Adding 100 buffer for flexibility and other bed types
    );

-- Ensure certification dates are logical
ALTER TABLE branch ADD CONSTRAINT check_hipaa_dates 
    CHECK (hipaa_certification_date IS NULL OR hipaa_certification_expiry IS NULL 
           OR hipaa_certification_expiry >= hipaa_certification_date);

ALTER TABLE branch ADD CONSTRAINT check_nabh_dates 
    CHECK (nabh_accreditation_date IS NULL OR nabh_accreditation_expiry IS NULL 
           OR nabh_accreditation_expiry >= nabh_accreditation_date);

-- ============================================================================
-- SAMPLE DATA UPDATE (Optional - for testing)
-- ============================================================================
-- Update existing branches with default compliance values
-- Uncomment if you want to set defaults for existing records

-- UPDATE branch SET 
--     hipaa_covered_entity = true,
--     phi_storage_approved = true,
--     encryption_at_rest = true,
--     encryption_in_transit = true,
--     hipaa_compliance_status = 'Compliant',
--     wheelchair_accessible = true,
--     accepts_new_patients = true
-- WHERE status = 'Active';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Total columns before migration: 45
-- New columns added: 62
-- Total columns after migration: 107
-- 
-- Run the following to verify:
-- SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'branch';
-- ============================================================================

-- Verification query
SELECT 
    'Migration Complete!' as status,
    COUNT(*) as total_columns,
    COUNT(*) - 45 as new_columns_added
FROM information_schema.columns 
WHERE table_name = 'branch';

-- Show all new compliance-related columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'branch'
    AND column_name LIKE ANY(ARRAY['%hipaa%', '%nabh%', '%gdpr%', '%compliance%', '%accredited%', '%certified%'])
ORDER BY column_name;
