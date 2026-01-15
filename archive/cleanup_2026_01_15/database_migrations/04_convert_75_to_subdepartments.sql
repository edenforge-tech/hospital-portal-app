-- =====================================================
-- MIGRATION: CONVERT 75 EXISTING DEPARTMENTS TO SUB-DEPARTMENTS
-- =====================================================
-- Purpose: Reorganize 75 existing departments under 14 standard departments
-- Tenant: India Eye Hospital Network (33333333-3333-3333-3333-333333333333)
-- Date: December 7, 2025
-- =====================================================

BEGIN;

DO $$
DECLARE
    v_tenant_id UUID := '33333333-3333-3333-3333-333333333333';
    v_std_doctor_id UUID;
    v_std_optometrist_id UUID;
    v_std_front_office_id UUID;
    v_std_imaging_id UUID;
    v_std_nurse_id UUID;
    v_std_pharmacy_id UUID;
    v_std_inventory_id UUID;
    v_std_laboratory_id UUID;
BEGIN
    -- Get IDs of standard departments
    SELECT id INTO v_std_doctor_id FROM department WHERE department_code = 'STD_DOCTOR' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_optometrist_id FROM department WHERE department_code = 'STD_OPTOMETRIST' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_front_office_id FROM department WHERE department_code = 'STD_FRONT_OFFICE' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_imaging_id FROM department WHERE department_code = 'STD_IMAGING' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_nurse_id FROM department WHERE department_code = 'STD_NURSE' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_pharmacy_id FROM department WHERE department_code = 'STD_PHARMACY' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_inventory_id FROM department WHERE department_code = 'STD_INVENTORY' AND tenant_id = v_tenant_id;
    SELECT id INTO v_std_laboratory_id FROM department WHERE department_code = 'STD_LABORATORY' AND tenant_id = v_tenant_id;
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_DOCTOR
    -- =====================================================
    -- Specialty clinics become sub-departments of Doctor
    
    UPDATE department
    SET 
        parent_department_id = v_std_doctor_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'RETINA', 'GLAUCOMA', 'CORNEA', 'CATARACT', 'PEDIATRIC_OPHTH',
          'OCULOPLASTY', 'NEURO_OPHTH', 'UVEA', 'LOW_VISION', 'LASIK',
          'DIABETIC_RETINOPATHY', 'SQUINT', 'VITREO_RETINAL', 'OCULAR_ONCOLOGY',
          'ORBIT', 'OPHTHALMIC_PLASTICS', 'COMMUNITY_OPHTH', 'TELE_OPHTH',
          'CARDIOLOGY', 'OPHTHALMOLOGY' -- General ophthalmology goes under doctor
      );
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_FRONT_OFFICE
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = v_std_front_office_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'OPD', 'OPD_REGISTRATION', 'OPD_CONSULTATION', 'GENERAL_OPD',
          'RECEPTION'
      );
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_IMAGING
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = v_std_imaging_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'OCT', 'FUNDUS_PHOTO', 'PERIMETRY', 'BIOMETRY', 'ULTRASOUND',
          'TOPOGRAPHY', 'PACHYMETRY', 'ELECTROPHYSIOLOGY', 'RADIOLOGY',
          'CONTACT_LENS' -- Contact lens fitting involves imaging
      );
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_NURSE
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = v_std_nurse_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'NURSING', 'ICU', 'IPD', 'OT', 'RECOVERY', 'DAYCARE',
          'MINOR_OT', 'ANESTHESIA', 'INFECTION_CONTROL', 'STERILIZATION',
          'BLOOD_BANK', 'EMERGENCY'
      );
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_PHARMACY
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = v_std_pharmacy_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'PHARMACY', 'IPD_PHARMACY', 'OPD_PHARMACY'
      );
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_INVENTORY
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = v_std_inventory_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'STORES', 'OT_STORE', 'LAUNDRY'
      );
    
    -- =====================================================
    -- CONVERT TO SUB-DEPARTMENTS UNDER STD_LABORATORY
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = v_std_laboratory_id,
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'LABORATORY'
      );
    
    -- =====================================================
    -- ADMINISTRATIVE DEPARTMENTS → STD_ADMIN SUB-DEPARTMENTS
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = (SELECT id FROM department WHERE department_code = 'STD_ADMIN' AND tenant_id = v_tenant_id),
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'ADMINISTRATION', 'HR', 'QUALITY_ASSURANCE', 'MEDICAL_RECORDS',
          'PATIENT_SERVICES', 'SCM_AUDIT', 'MARKETING', 'DISPATCH_CENTER',
          'CLINICAL_AUDIT', 'FINANCE_AUDIT', 'TRAINING', 'LIBRARY', 'ACCOUNTS'
      );
    
    -- =====================================================
    -- BILLING → STD_BILLING (merge with standard)
    -- =====================================================
    
    -- Delete the old BILLING department and use STD_BILLING instead
    UPDATE department
    SET 
        deleted_at = CURRENT_TIMESTAMP,
        status = 'Merged into STD_BILLING'
    WHERE tenant_id = v_tenant_id
      AND department_code = 'BILLING'
      AND deleted_at IS NULL;
    
    -- =====================================================
    -- INSURANCE → STD_INSURANCE (merge with standard)
    -- =====================================================
    
    -- Delete the old INSURANCE department and use STD_INSURANCE instead
    UPDATE department
    SET 
        deleted_at = CURRENT_TIMESTAMP,
        status = 'Merged into STD_INSURANCE'
    WHERE tenant_id = v_tenant_id
      AND department_code = 'INSURANCE'
      AND deleted_at IS NULL;
    
    -- =====================================================
    -- SUPPORT DEPARTMENTS → STD_INVENTORY SUB-DEPARTMENTS
    -- =====================================================
    
    UPDATE department
    SET 
        parent_department_id = (SELECT id FROM department WHERE department_code = 'STD_INVENTORY' AND tenant_id = v_tenant_id),
        department_level = 2,
        is_standard_department = false,
        inherit_permissions = true
    WHERE tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND department_code IN (
          'IT', 'BIOMEDICAL', 'HOUSEKEEPING', 'SECURITY', 'TRANSPORT'
      );
    
END $$;

-- =====================================================
-- SOFT DELETE ANY REMAINING UNMAPPED DEPARTMENTS
-- =====================================================
-- Any departments that don't fit the new structure will be soft-deleted
-- Only standard departments should remain without parents

UPDATE department
SET 
    deleted_at = CURRENT_TIMESTAMP,
    deleted_by = (SELECT id FROM users WHERE user_name = 'system' LIMIT 1),
    status = 'Archived - Unmapped'
WHERE tenant_id = '33333333-3333-3333-3333-333333333333'
  AND deleted_at IS NULL
  AND parent_department_id IS NULL
  AND is_standard_department = false;

-- =====================================================
-- UPDATE DISPLAY ORDERS FOR SUB-DEPARTMENTS
-- =====================================================

-- Update display orders for all sub-departments using CTE
WITH ranked_depts AS (
    SELECT 
        id,
        parent_department_id,
        ROW_NUMBER() OVER (PARTITION BY parent_department_id ORDER BY department_name) as new_order
    FROM department
    WHERE tenant_id = '33333333-3333-3333-3333-333333333333'
      AND parent_department_id IS NOT NULL
      AND deleted_at IS NULL
)
UPDATE department d
SET display_order = r.new_order
FROM ranked_depts r
WHERE d.id = r.id;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count departments by level
SELECT 
    department_level,
    COUNT(*) as count,
    STRING_AGG(DISTINCT department_type, ', ') as types
FROM department
WHERE tenant_id = '33333333-3333-3333-3333-333333333333'
  AND deleted_at IS NULL
GROUP BY department_level
ORDER BY department_level;

-- Show standard departments with sub-department counts
SELECT 
    d.department_code,
    d.department_name,
    d.department_type,
    d.can_have_subdepartments,
    COUNT(sub.id) as subdepartment_count
FROM department d
LEFT JOIN department sub ON sub.parent_department_id = d.id AND sub.deleted_at IS NULL
WHERE d.tenant_id = '33333333-3333-3333-3333-333333333333'
  AND d.is_standard_department = true
  AND d.deleted_at IS NULL
GROUP BY d.id, d.department_code, d.department_name, d.department_type, d.can_have_subdepartments, d.display_order
ORDER BY d.display_order;

-- Show Doctor sub-departments
SELECT 
    d.department_code,
    d.department_name,
    d.department_type,
    d.display_order
FROM department d
WHERE d.tenant_id = '33333333-3333-3333-3333-333333333333'
  AND d.parent_department_id = (SELECT id FROM department WHERE department_code = 'STD_DOCTOR' AND tenant_id = '33333333-3333-3333-3333-333333333333')
  AND d.deleted_at IS NULL
ORDER BY d.display_order;

-- Show Imaging sub-departments
SELECT 
    d.department_code,
    d.department_name,
    d.department_type,
    d.display_order
FROM department d
WHERE d.tenant_id = '33333333-3333-3333-3333-333333333333'
  AND d.parent_department_id = (SELECT id FROM department WHERE department_code = 'STD_IMAGING' AND tenant_id = '33333333-3333-3333-3333-333333333333')
  AND d.deleted_at IS NULL
ORDER BY d.display_order;

-- Show Nurse sub-departments
SELECT 
    d.department_code,
    d.department_name,
    d.department_type,
    d.display_order
FROM department d
WHERE d.tenant_id = '33333333-3333-3333-3333-333333333333'
  AND d.parent_department_id = (SELECT id FROM department WHERE department_code = 'STD_NURSE' AND tenant_id = '33333333-3333-3333-3333-333333333333')
  AND d.deleted_at IS NULL
ORDER BY d.display_order;

-- Show independent departments (no parent, not standard)
SELECT 
    department_code,
    department_name,
    department_type
FROM department
WHERE tenant_id = '33333333-3333-3333-3333-333333333333'
  AND parent_department_id IS NULL
  AND is_standard_department = false
  AND deleted_at IS NULL
ORDER BY department_name;

-- Total count
SELECT 
    COUNT(*) FILTER (WHERE is_standard_department = true) as standard_count,
    COUNT(*) FILTER (WHERE department_level = 2) as subdepartment_count,
    COUNT(*) FILTER (WHERE parent_department_id IS NULL AND is_standard_department = false) as independent_count,
    COUNT(*) as total_active
FROM department
WHERE tenant_id = '33333333-3333-3333-3333-333333333333'
  AND deleted_at IS NULL;
