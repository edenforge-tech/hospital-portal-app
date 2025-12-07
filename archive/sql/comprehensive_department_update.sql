-- =====================================================
-- COMPREHENSIVE DEPARTMENT & SUB-DEPARTMENT UPDATE
-- Implement hierarchical department structure for eye hospital
-- =====================================================

-- Step 1: Add parent_department_id column for hierarchical structure
ALTER TABLE departments ADD COLUMN IF NOT EXISTS parent_department_id UUID REFERENCES departments(id);

-- Step 2: Add department_type column for categorization
ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_type VARCHAR(100);

-- Step 3: Update existing departments to fit new structure
-- Clear existing data and rebuild with proper hierarchy
DELETE FROM departments;

-- Step 4: Insert main department categories
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, is_active, status)
VALUES
-- Clinical/Patient Care Departments
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'CLINICAL', 'Clinical/Patient Care', 'All clinical and patient care departments', 'clinical', 'main_category', true, 'active'),
-- Diagnostic & Allied Services
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'DIAGNOSTIC', 'Diagnostic & Allied Services', 'Diagnostic and support services', 'diagnostic', 'main_category', true, 'active'),
-- Administration, Front Office, & Support
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'ADMIN_SUPPORT', 'Administration, Front Office & Support', 'Administrative and support functions', 'administrative', 'main_category', true, 'active'),
-- Patient Experience, Outreach, & Regulatory
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'PATIENT_REGULATORY', 'Patient Experience, Outreach & Regulatory', 'Patient experience and regulatory compliance', 'regulatory', 'main_category', true, 'active');

-- Step 5: Insert Clinical/Patient Care Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    dept_code,
    dept_name,
    dept_desc,
    'clinical',
    'department',
    (SELECT id FROM departments WHERE department_code = 'CLINICAL'),
    true,
    'active'
FROM (VALUES
    ('OPHTHALMOLOGY', 'Ophthalmology', 'Eye care and surgical services'),
    ('OPTOMETRY', 'Optometry', 'Vision care and refraction services'),
    ('GENERAL_OPD', 'General OPD', 'General outpatient department'),
    ('WARDS_IPD', 'Wards/IPD', 'Inpatient wards and care'),
    ('OPERATION_THEATRE', 'Operation Theatre', 'Surgical procedures and recovery'),
    ('EMERGENCY', 'Emergency/Casualty', 'Emergency eye care services')
) AS dept_data(dept_code, dept_name, dept_desc);

-- Step 6: Insert Ophthalmology Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'clinical',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'OPHTHALMOLOGY'),
    true,
    'active'
FROM (VALUES
    ('RETINA', 'Retina', 'Retinal diseases and surgery'),
    ('CORNEA', 'Cornea', 'Corneal diseases and transplants'),
    ('GLAUCOMA', 'Glaucoma', 'Glaucoma diagnosis and treatment'),
    ('PEDIATRIC', 'Pediatric Ophthalmology', 'Child eye care'),
    ('OCULOPLASTY', 'Oculoplasty', 'Eyelid and orbital surgery'),
    ('NEURO_OPHTHALMOLOGY', 'Neuro-Ophthalmology', 'Neurological eye conditions')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 7: Insert Optometry Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'clinical',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'OPTOMETRY'),
    true,
    'active'
FROM (VALUES
    ('REFRACTION', 'Refraction', 'Vision testing and correction'),
    ('CONTACT_LENS', 'Contact Lens', 'Contact lens fitting and care'),
    ('LVA', 'Low Vision Aid', 'Low vision assessment and aids'),
    ('VISION_THERAPY', 'Vision Therapy', 'Vision rehabilitation services')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 8: Insert General OPD Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'clinical',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'GENERAL_OPD'),
    true,
    'active'
FROM (VALUES
    ('REGISTRATION', 'Registration', 'Patient registration and check-in'),
    ('TRIAGE', 'Triage', 'Initial assessment and prioritization'),
    ('FOLLOW_UP', 'Follow-Up', 'Follow-up consultations and care')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 9: Insert Wards/IPD Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'clinical',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'WARDS_IPD'),
    true,
    'active'
FROM (VALUES
    ('GENERAL_WARD', 'General Ward', 'Standard inpatient care'),
    ('PRIVATE_WARD', 'Private Ward', 'Private room inpatient care'),
    ('ICU', 'ICU', 'Intensive care unit for critical patients'),
    ('POST_OP', 'Post-Op Ward', 'Post-operative recovery and care')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 10: Insert Operation Theatre Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'clinical',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'OPERATION_THEATRE'),
    true,
    'active'
FROM (VALUES
    ('MAIN_OT', 'Main OT', 'Primary operating theatre'),
    ('PRE_RECOVERY', 'Pre-Post Recovery', 'Pre and post-operative care'),
    ('STERILIZATION', 'Sterilization', 'Equipment sterilization services')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 11: Insert Emergency Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'clinical',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'EMERGENCY'),
    true,
    'active'
FROM (VALUES
    ('EYE_TRAUMA', 'Eye Trauma', 'Emergency eye injury treatment'),
    ('FIRST_AID', 'First Aid', 'Initial emergency care and stabilization')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 12: Insert Diagnostic & Allied Services Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    dept_code,
    dept_name,
    dept_desc,
    'diagnostic',
    'department',
    (SELECT id FROM departments WHERE department_code = 'DIAGNOSTIC'),
    true,
    'active'
FROM (VALUES
    ('LABORATORY', 'Laboratory', 'Clinical laboratory services'),
    ('IMAGING', 'Imaging', 'Diagnostic imaging services'),
    ('PHARMACY', 'Pharmacy', 'Medication dispensing and management'),
    ('OPTICAL_SHOP', 'Optical Shop', 'Eyewear and optical services'),
    ('COUNSELING', 'Counseling', 'Patient counseling and education')
) AS dept_data(dept_code, dept_name, dept_desc);

-- Step 13: Insert Laboratory Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'diagnostic',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'LABORATORY'),
    true,
    'active'
FROM (VALUES
    ('CLINICAL_PATHOLOGY', 'Clinical Pathology', 'Blood and body fluid analysis'),
    ('MICROBIOLOGY', 'Microbiology', 'Microbial culture and sensitivity'),
    ('BIOCHEMISTRY', 'Biochemistry', 'Chemical analysis of body fluids')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 14: Insert Imaging Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'diagnostic',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'IMAGING'),
    true,
    'active'
FROM (VALUES
    ('OCT', 'OCT', 'Optical Coherence Tomography'),
    ('FUNDUS', 'Fundus Photography', 'Retinal imaging'),
    ('B_SCAN', 'B Scan', 'Ultrasound imaging of eye'),
    ('PERIMETRY', 'Perimetry', 'Visual field testing'),
    ('BIOMETRY', 'Biometry', 'Eye measurement for IOL calculation')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 15: Insert Pharmacy Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'pharmacy',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'PHARMACY'),
    true,
    'active'
FROM (VALUES
    ('OP_PHARMACY', 'OP Pharmacy', 'Outpatient medication dispensing'),
    ('IP_STORES', 'IP Stores', 'Inpatient medication management'),
    ('INVENTORY', 'Inventory', 'Medication stock management')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 16: Insert Optical Shop Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'specialty',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'OPTICAL_SHOP'),
    true,
    'active'
FROM (VALUES
    ('SPECTACLE', 'Spectacle', 'Eyeglass dispensing and fitting'),
    ('CONTACT_LENS', 'Contact Lens', 'Contact lens services'),
    ('REPAIRS', 'Repairs', 'Eyewear repair and maintenance'),
    ('FRAME_STOCK', 'Frame Stock', 'Frame inventory management')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 17: Insert Counseling Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'support',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'COUNSELING'),
    true,
    'active'
FROM (VALUES
    ('FINANCIAL_COUNSELING', 'Financial Counseling', 'Cost and payment counseling'),
    ('SURGERY_COUNSELING', 'Surgery Counseling', 'Pre and post-surgery counseling'),
    ('EDUCATION', 'Patient Education', 'Health education and awareness')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 18: Insert Administration, Front Office & Support Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    dept_code,
    dept_name,
    dept_desc,
    'administrative',
    'department',
    (SELECT id FROM departments WHERE department_code = 'ADMIN_SUPPORT'),
    true,
    'active'
FROM (VALUES
    ('FRONT_OFFICE', 'Front Office/Reception', 'Patient reception and coordination'),
    ('REGISTRATION_BILLING', 'Registration & Billing', 'Patient registration and billing'),
    ('INSURANCE_TPA', 'Insurance & TPA', 'Insurance coordination and claims'),
    ('MEDICAL_RECORDS', 'Medical Records (MRD)', 'Patient records management'),
    ('ADMINISTRATION', 'Administration', 'General administration'),
    ('HR', 'HR', 'Human resources management'),
    ('FINANCE', 'Finance', 'Financial management and accounting'),
    ('IT_HIS', 'IT/HIS Support', 'Information technology support'),
    ('HOUSEKEEPING', 'Housekeeping/Maintenance', 'Facility maintenance'),
    ('SECURITY', 'Security', 'Security and access control')
) AS dept_data(dept_code, dept_name, dept_desc);

-- Step 19: Insert Front Office Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'FRONT_OFFICE'),
    true,
    'active'
FROM (VALUES
    ('ENQUIRY', 'Enquiry', 'General inquiries and information'),
    ('APPOINTMENTS', 'Appointments', 'Appointment scheduling and management')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 20: Insert Registration & Billing Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'REGISTRATION_BILLING'),
    true,
    'active'
FROM (VALUES
    ('REGISTRATION', 'Registration', 'Patient registration'),
    ('CASH_BILLING', 'Cash Billing', 'Cash payment processing'),
    ('INSURANCE_BILLING', 'Insurance Billing', 'Insurance claim processing')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 21: Insert Medical Records Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'MEDICAL_RECORDS'),
    true,
    'active'
FROM (VALUES
    ('RECORD_ROOM', 'Record Room', 'Physical record storage'),
    ('DIGITIZATION', 'Digitization', 'Record digitization and EMR'),
    ('DATA_ENTRY', 'Data Entry', 'Medical data entry and coding')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 22: Insert Administration Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'ADMINISTRATION'),
    true,
    'active'
FROM (VALUES
    ('ADMIN_DESK', 'Admin Desk', 'General administrative services'),
    ('DUTY_ROSTER', 'Duty Roster', 'Staff scheduling and management')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 23: Insert HR Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'HR'),
    true,
    'active'
FROM (VALUES
    ('RECRUITMENT', 'Recruitment', 'Staff hiring and onboarding'),
    ('PAYROLL', 'Payroll', 'Salary and benefits management'),
    ('TRAINING', 'Training', 'Staff development and training')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 24: Insert Finance Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'FINANCE'),
    true,
    'active'
FROM (VALUES
    ('ACCOUNTS_PAYABLE', 'Accounts Payable', 'Vendor payments and expenses'),
    ('ACCOUNTS_RECEIVABLE', 'Accounts Receivable', 'Patient billing and collections'),
    ('GENERAL_LEDGER', 'General Ledger', 'Financial reporting and analysis')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 25: Insert IT/HIS Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'administrative',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'IT_HIS'),
    true,
    'active'
FROM (VALUES
    ('SOFTWARE_SUPPORT', 'Software Support', 'Application support and maintenance'),
    ('NETWORK_INFRA', 'Network Infrastructure', 'Network and hardware management'),
    ('SECURITY', 'Security', 'IT security and data protection')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 26: Insert Housekeeping Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'support',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'HOUSEKEEPING'),
    true,
    'active'
FROM (VALUES
    ('HOUSEKEEPING', 'Housekeeping', 'Cleaning and sanitation'),
    ('ENGINEERING', 'Engineering', 'Facility maintenance and repairs')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 27: Insert Security Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'support',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'SECURITY'),
    true,
    'active'
FROM (VALUES
    ('ACCESS_CONTROL', 'Access Control', 'Entry and exit management'),
    ('MONITORING', 'Monitoring', 'Security surveillance and patrols')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 28: Insert Patient Experience, Outreach & Regulatory Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    dept_code,
    dept_name,
    dept_desc,
    'regulatory',
    'department',
    (SELECT id FROM departments WHERE department_code = 'PATIENT_REGULATORY'),
    true,
    'active'
FROM (VALUES
    ('QUALITY_NABH', 'Quality & NABH/Compliance', 'Quality assurance and compliance'),
    ('GRIEVANCE_PR', 'Grievance/PR/Legal', 'Patient relations and legal affairs'),
    ('COMMUNITY_OUTREACH', 'Community Outreach/CSR', 'Community health programs'),
    ('RESEARCH_EDUCATION', 'Research/Education', 'Medical research and education')
) AS dept_data(dept_code, dept_name, dept_desc);

-- Step 29: Insert Quality & Compliance Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'regulatory',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'QUALITY_NABH'),
    true,
    'active'
FROM (VALUES
    ('INTERNAL_AUDIT', 'Internal Audit', 'Quality audits and assessments'),
    ('TRAINING', 'Training', 'Compliance and quality training'),
    ('PATIENT_SAFETY', 'Patient Safety', 'Patient safety initiatives')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 30: Insert Grievance/PR Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'regulatory',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'GRIEVANCE_PR'),
    true,
    'active'
FROM (VALUES
    ('PATIENT_RELATIONS', 'Patient Relations', 'Patient feedback and relations'),
    ('LEGAL', 'Legal Desk', 'Legal affairs and documentation'),
    ('PUBLIC_RELATIONS', 'Public Relations', 'Media and community relations')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 31: Insert Community Outreach Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'outreach',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'COMMUNITY_OUTREACH'),
    true,
    'active'
FROM (VALUES
    ('CAMPS', 'Eye Camps', 'Community eye screening camps'),
    ('SCHOOL_SCREENING', 'School Screening', 'School vision screening programs'),
    ('AWARENESS', 'Health Awareness', 'Public health education campaigns')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 32: Insert Research/Education Sub-Departments
INSERT INTO departments (id, tenant_id, department_code, name, description, category, department_type, parent_department_id, is_active, status)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    sub_dept_code,
    sub_dept_name,
    sub_dept_desc,
    'education',
    'sub_department',
    (SELECT id FROM departments WHERE department_code = 'RESEARCH_EDUCATION'),
    true,
    'active'
FROM (VALUES
    ('TRAINING_PROGRAMS', 'Training Programs', 'Medical training and CME'),
    ('RESEARCH', 'Research', 'Clinical research and studies'),
    ('ACADEMIC_AFFAIRS', 'Academic Affairs', 'Educational partnerships')
) AS sub_dept_data(sub_dept_code, sub_dept_name, sub_dept_desc);

-- Step 33: Update document access rules to reference new departments
-- Clean up old rules and create new ones based on the hierarchical structure
DELETE FROM document_access_rules;

-- Step 34: Create document access rules for clinical departments
INSERT INTO document_access_rules (id, tenant_id, source_department_id, target_department_id, document_type, access_level, requires_approval, created_by_user_id)
SELECT
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    src.id,
    tgt.id,
    doc_type,
    access_lvl,
    req_approval,
    '550e8400-e29b-41d4-a716-446655440000'
FROM departments src
CROSS JOIN departments tgt
CROSS JOIN (VALUES
    ('medical_record', 'read', false),
    ('lab_report', 'read', false),
    ('imaging_report', 'read', false),
    ('prescription', 'read', false),
    ('discharge_summary', 'read', false)
) AS doc_rules(doc_type, access_lvl, req_approval)
WHERE src.category = 'clinical'
  AND tgt.category IN ('clinical', 'administrative')
  AND src.id != tgt.id;

-- Step 35: Final verification
DO $$
DECLARE
    main_cat_count INTEGER;
    dept_count INTEGER;
    sub_dept_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO main_cat_count FROM departments WHERE department_type = 'main_category';
    SELECT COUNT(*) INTO dept_count FROM departments WHERE department_type = 'department';
    SELECT COUNT(*) INTO sub_dept_count FROM departments WHERE department_type = 'sub_department';
    SELECT COUNT(*) INTO total_count FROM departments;

    RAISE NOTICE 'Comprehensive Department Structure Update Complete!';
    RAISE NOTICE '• Main Categories: %', main_cat_count;
    RAISE NOTICE '• Departments: %', dept_count;
    RAISE NOTICE '• Sub-Departments: %', sub_dept_count;
    RAISE NOTICE '• Total Departments: %', total_count;
    RAISE NOTICE '• Hierarchical structure implemented with parent-child relationships';
    RAISE NOTICE '• Document access rules updated for new structure';
END $$;