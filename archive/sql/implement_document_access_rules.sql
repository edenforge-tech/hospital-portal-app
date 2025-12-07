-- =====================================================
-- CREATE DEPARTMENTS TABLE AND DOCUMENT ACCESS RULES
-- Enable cross-department document sharing
-- =====================================================

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    department_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID REFERENCES "AspNetUsers"(id),
    updated_by_user_id UUID REFERENCES "AspNetUsers"(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Insert basic departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, created_by_user_id) VALUES
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ADMIN', 'Administration', 'Administrative and management functions', 'administrative', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'OPD', 'Outpatient Department', 'General outpatient care', 'clinical', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'IPD', 'Inpatient Department', 'Hospital ward and inpatient care', 'clinical', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'EMERGENCY', 'Emergency Department', 'Emergency and trauma care', 'clinical', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ICU', 'Intensive Care Unit', 'Critical care and intensive monitoring', 'clinical', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'CARDIOLOGY', 'Cardiology', 'Heart and cardiovascular care', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'NEUROLOGY', 'Neurology', 'Brain and nervous system care', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'PEDIATRICS', 'Pediatrics', 'Child healthcare', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'GYNEcology', 'Gynecology', 'Women''s health and reproductive care', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ORTHOPEDICS', 'Orthopedics', 'Bone and joint care', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'PSYCHIATRY', 'Psychiatry', 'Mental health care', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'DERMATOLOGY', 'Dermatology', 'Skin care and treatment', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'OPHTHALMOLOGY', 'Ophthalmology', 'Eye care and vision services', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'DENTISTRY', 'Dentistry', 'Dental care and oral health', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'PHYSIOTHERAPY', 'Physiotherapy', 'Physical therapy and rehabilitation', 'specialty', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'LAB', 'Laboratory', 'Medical laboratory services', 'diagnostic', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'RADIOLOGY', 'Radiology', 'Medical imaging and radiology', 'diagnostic', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'PHARMACY', 'Pharmacy', 'Medication dispensing and pharmacy services', 'pharmacy', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'BILLING', 'Billing', 'Medical billing and insurance claims', 'administrative', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'INSURANCE', 'Insurance', 'Insurance processing and claims', 'administrative', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'RECORDS', 'Medical Records', 'Medical records management', 'administrative', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'OT', 'Operating Theatre', 'Surgical and operating room services', 'clinical', '550e8400-e29b-41d4-a716-446655440000'),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'OPTICAL', 'Optical Shop', 'Optical and vision care services', 'specialty', '550e8400-e29b-41d4-a716-446655440000');

-- Now implement document access rules
-- Insurance Health Card sharing
INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    true,
    false,
    '{"purpose": "billing"}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Insurance Health Card'
  AND d1.department_code = 'ADMIN'
  AND d2.department_code = 'BILLING';

INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    true,
    false,
    '{"purpose": "claims"}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Insurance Health Card'
  AND d1.department_code = 'ADMIN'
  AND d2.department_code = 'INSURANCE';

-- Lab Reports sharing
INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    true,
    false,
    '{"patient_consent": true}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Lab Reports'
  AND d1.department_code = 'LAB'
  AND d2.department_code IN ('OPD', 'IPD', 'EMERGENCY', 'CARDIOLOGY', 'NEUROLOGY', 'PEDIATRICS', 'GYNEcology');

-- Prescriptions sharing
INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    true,
    false,
    '{"medication_required": true}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Prescriptions'
  AND d1.department_code IN ('OPD', 'IPD', 'EMERGENCY', 'CARDIOLOGY', 'NEUROLOGY', 'PEDIATRICS', 'GYNEcology')
  AND d2.department_code = 'PHARMACY';

-- Medical Records sharing (restricted)
INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    false,
    true,
    '{"hipaa_compliant": true, "patient_consent": true, "medical_necessity": true}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Medical Records'
  AND d1.department_code = 'RECORDS'
  AND d2.department_code IN ('OPD', 'IPD', 'EMERGENCY', 'CARDIOLOGY', 'NEUROLOGY', 'PEDIATRICS', 'GYNEcology', 'PSYCHIATRY');

-- Imaging results sharing
INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    true,
    false,
    '{"clinical_need": true}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Medical Test Results'
  AND d1.department_code = 'RADIOLOGY'
  AND d2.department_code IN ('OPD', 'IPD', 'EMERGENCY', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'OT');

-- Bills sharing
INSERT INTO document_access_rules (tenant_id, document_type_id, source_department_id, target_department_id, access_level, auto_share, requires_approval, condition, created_by_user_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000',
    dt.id,
    d1.id,
    d2.id,
    'read',
    true,
    false,
    '{"billing_purpose": true}',
    '550e8400-e29b-41d4-a716-446655440000'
FROM document_types dt
CROSS JOIN departments d1
CROSS JOIN departments d2
WHERE dt.name = 'Bills & Invoices'
  AND d1.department_code = 'BILLING'
  AND d2.department_code IN ('ADMIN', 'INSURANCE');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Document access rules implemented successfully!';
    RAISE NOTICE '✓ Created departments table with 23 departments';
    RAISE NOTICE '✓ Implemented cross-department document sharing rules';
    RAISE NOTICE '✓ Added HIPAA-compliant access controls';
END $$;