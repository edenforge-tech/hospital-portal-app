-- Department Structure Cross-Check and Completion Script
-- This script adds missing departments and sub-departments based on the comprehensive list provided

-- Disable audit triggers temporarily to avoid issues during bulk insert
ALTER TABLE departments DISABLE TRIGGER audit_trigger_departments;

-- Use the default tenant_id found in existing records
DO $$
DECLARE
    default_tenant_id UUID := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    -- Set session variable for tenant context
    PERFORM set_config('app.current_tenant_id', default_tenant_id::text, false);
END $$;

-- 1. Add missing Ophthalmology sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'OPH_CATR', 'Cataract', 'Cataract surgery and treatment', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Ophthalmology' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPH_UVEA', 'Uvea & Immunology', 'Uveitis and immunological eye conditions', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Ophthalmology' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPH_ORBT', 'Orbit', 'Orbital diseases and surgery', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Ophthalmology' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPH_TRMA', 'Trauma', 'Eye trauma and emergency care', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Ophthalmology' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPH_GEN', 'General Ophthalmology', 'General eye care and consultations', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Ophthalmology' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 2. Add missing Optometry sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'OPT_BINO', 'Binocular Vision', 'Binocular vision assessment and therapy', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Optometry' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPT_ORTH', 'Orthoptics', 'Orthoptic treatment and vision therapy', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Optometry' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 3. Add missing General OPD sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'GOPD_CASE', 'Case Desk', 'Patient case management and coordination', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'General OPD' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'GOPD_REVW', 'Review', 'Patient review and follow-up consultations', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'General OPD' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 4. Add missing Wards/IPD sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'IPD_DAYC', 'Day Care', 'Day care procedures and short-stay treatments', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Wards/IPD' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'IPD_PREO', 'Pre-Op', 'Pre-operative preparation and assessment', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Wards/IPD' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 5. Add missing Operation Theatre sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'OT_PREO', 'Pre-Op', 'Pre-operative preparation area', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Operation Theatre' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OT_POST', 'Post-Op', 'Post-operative recovery area', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Operation Theatre' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OT_ANES', 'Anesthesia', 'Anesthesia services and pain management', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Operation Theatre' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 6. Add missing Emergency/Casualty sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'EMR_DESK', 'Emergency Desk', 'Emergency reception and initial assessment', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Emergency/Casualty' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'EMR_TRIA', 'Triage', 'Emergency triage and prioritization', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Emergency/Casualty' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'EMR_TUNI', 'Trauma Unit', 'Dedicated eye trauma treatment unit', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Emergency/Casualty' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'EMR_EOT', 'Emergency OT', 'Emergency operation theatre', 'clinical', 'sub_department', (SELECT id FROM departments WHERE name = 'Emergency/Casualty' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 7. Add missing Laboratory sub-department
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'LAB_SMPC', 'Sample Collection', 'Blood and sample collection services', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Laboratory' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 8. Add missing Imaging sub-department
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'IMG_TOPO', 'Topography', 'Corneal topography and mapping', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Imaging' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 9. Add missing Pharmacy sub-department
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'PHA_NARC', 'Narcotics', 'Controlled substances and narcotics management', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Pharmacy' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 10. Add missing Optical Shop sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'OPTCL_DISP', 'Spectacle Dispensing', 'Eyeglass dispensing and fitting', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Optical Shop' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPTCL_CL', 'Contact Lenses', 'Contact lens fitting and dispensing', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Optical Shop' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'OPTCL_REP', 'Repairs', 'Eyewear repair and maintenance services', 'diagnostic', 'sub_department', (SELECT id FROM departments WHERE name = 'Optical Shop' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 11. Add missing administration departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'PUR', 'Purchase / Stores', 'Procurement, inventory, and store management', 'administrative', 'department', (SELECT id FROM departments WHERE name = 'Administration, Front Office & Support' AND department_type = 'main_category'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'LGPR', 'Legal / PR / Grievance', 'Patient relations, legal affairs, and public relations', 'regulatory', 'department', (SELECT id FROM departments WHERE name = 'Patient Experience, Outreach & Regulatory' AND department_type = 'main_category'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'RES', 'Research, Education, Training', 'Academic research, continuing medical education, and training programs', 'regulatory', 'department', (SELECT id FROM departments WHERE name = 'Patient Experience, Outreach & Regulatory' AND department_type = 'main_category'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- 12. Fix Billing & Accounts structure - Replace "Registration & Billing" with proper "Billing & Accounts" department
UPDATE departments
SET name = 'Billing & Accounts',
    department_code = 'BIL',
    description = 'Billing, payment, accounts, and financial transactions'
WHERE name = 'Registration & Billing' AND department_type = 'department';

-- Add Billing & Accounts sub-departments
INSERT INTO departments (tenant_id, department_code, name, description, category, department_type, parent_department_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'BIL_CASH', 'Cash Billing', 'Cash payment processing and billing', 'administrative', 'sub_department', (SELECT id FROM departments WHERE name = 'Billing & Accounts' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'BIL_INSU', 'Insurance Billing', 'Insurance claims and billing coordination', 'administrative', 'sub_department', (SELECT id FROM departments WHERE name = 'Billing & Accounts' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'BIL_CRED', 'Credit Control', 'Credit management and debt collection', 'administrative', 'sub_department', (SELECT id FROM departments WHERE name = 'Billing & Accounts' AND department_type = 'department'), 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'BIL_ACCT', 'Accountant', 'Financial accounting and reporting', 'administrative', 'sub_department', (SELECT id FROM departments WHERE name = 'Billing & Accounts' AND department_type = 'department'), 'active')
ON CONFLICT (department_code) DO NOTHING;

-- Re-enable audit triggers
ALTER TABLE departments ENABLE TRIGGER audit_trigger_departments;