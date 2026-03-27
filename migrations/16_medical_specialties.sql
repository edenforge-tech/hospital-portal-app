-- =====================================================
-- MIGRATION 16: MEDICAL SPECIALTIES & DEPARTMENTS
-- =====================================================
-- Hospital Portal - 40 Departments Across All Specialties
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_dept_counter INTEGER := 0;
BEGIN
    -- Get first active tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' ORDER BY created_at LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id AND status = 'active' LIMIT 1;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SEEDING 40 MEDICAL DEPARTMENTS';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE '============================================';
    
    -- =====================================================
    -- CATEGORY 1: EYE CARE SPECIALTIES (Primary Focus)
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Eye Specialties (8 departments)
        ('OPHTH', 'General Ophthalmology', 'Clinical', 'Comprehensive eye care, vision testing, and general eye diseases', 2, '+91-80-12345001', 'ophthalmology@hospital.com'),
        ('RETINA', 'Retina & Vitreous', 'Clinical', 'Retinal diseases, diabetic retinopathy, macular degeneration', 2, '+91-80-12345002', 'retina@hospital.com'),
        ('CORNEA', 'Cornea & External Diseases', 'Clinical', 'Corneal transplants, dry eye, keratoconus treatment', 2, '+91-80-12345003', 'cornea@hospital.com'),
        ('GLAUCOMA', 'Glaucoma Services', 'Clinical', 'Glaucoma diagnosis, laser treatment, surgical management', 2, '+91-80-12345004', 'glaucoma@hospital.com'),
        ('PEDO-OPHTH', 'Pediatric Ophthalmology', 'Clinical', 'Children eye care, amblyopia, strabismus, congenital disorders', 3, '+91-80-12345005', 'pediatric.eye@hospital.com'),
        ('OCULOPLASTY', 'Oculoplasty & Aesthetics', 'Clinical', 'Eyelid surgery, orbit surgery, cosmetic eye procedures', 3, '+91-80-12345006', 'oculoplasty@hospital.com'),
        ('NEURO-OPHTH', 'Neuro-Ophthalmology', 'Clinical', 'Visual pathway disorders, optic nerve diseases, eye-brain connection', 3, '+91-80-12345007', 'neuro.eye@hospital.com'),
        ('OPTOMETRY', 'Optometry & Vision Science', 'Clinical', 'Refraction, contact lenses, low vision aids, vision therapy', 1, '+91-80-12345008', 'optometry@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 8;
    RAISE NOTICE '✓ Created 8 Eye Care Specialties';
    
    -- =====================================================
    -- CATEGORY 2: GENERAL MEDICAL SPECIALTIES
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Medical Specialties (10 departments)
        ('CARDIO', 'Cardiology', 'Clinical', 'Heart diseases, cardiac catheterization, pacemaker implantation', 4, '+91-80-12345011', 'cardiology@hospital.com'),
        ('NEURO', 'Neurology', 'Clinical', 'Brain and nervous system disorders, stroke, epilepsy, Parkinson', 4, '+91-80-12345012', 'neurology@hospital.com'),
        ('ORTHO', 'Orthopedics', 'Clinical', 'Bone, joint, and musculoskeletal disorders', 5, '+91-80-12345013', 'orthopedics@hospital.com'),
        ('ENT', 'ENT (Ear Nose Throat)', 'Clinical', 'Head and neck surgery, hearing disorders, sinus treatment', 3, '+91-80-12345014', 'ent@hospital.com'),
        ('GASTRO', 'Gastroenterology', 'Clinical', 'Digestive system, liver diseases, endoscopy', 4, '+91-80-12345015', 'gastro@hospital.com'),
        ('PULMO', 'Pulmonology', 'Clinical', 'Respiratory diseases, asthma, COPD, lung infections', 4, '+91-80-12345016', 'pulmonology@hospital.com'),
        ('NEPHRO', 'Nephrology', 'Clinical', 'Kidney diseases, dialysis, renal transplantation', 5, '+91-80-12345017', 'nephrology@hospital.com'),
        ('ENDO', 'Endocrinology', 'Clinical', 'Diabetes, thyroid disorders, hormonal imbalances', 3, '+91-80-12345018', 'endocrinology@hospital.com'),
        ('ONCOLOGY', 'Oncology', 'Clinical', 'Cancer diagnosis, chemotherapy, radiation therapy', 6, '+91-80-12345019', 'oncology@hospital.com'),
        ('DERMA', 'Dermatology', 'Clinical', 'Skin diseases, cosmetic dermatology, laser treatments', 2, '+91-80-12345020', 'dermatology@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 10;
    RAISE NOTICE '✓ Created 10 General Medical Specialties';
    
    -- =====================================================
    -- CATEGORY 3: SURGICAL SPECIALTIES
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Surgical Departments (5 departments)
        ('GEN-SURG', 'General Surgery', 'Surgical', 'Abdominal surgery, hernia, appendectomy, gallbladder', 5, '+91-80-12345031', 'gen.surgery@hospital.com'),
        ('CARDIAC-SURG', 'Cardiac Surgery', 'Surgical', 'Heart surgery, bypass, valve replacement', 6, '+91-80-12345032', 'cardiac.surgery@hospital.com'),
        ('NEURO-SURG', 'Neurosurgery', 'Surgical', 'Brain and spine surgery, tumor removal', 6, '+91-80-12345033', 'neurosurgery@hospital.com'),
        ('PLASTIC-SURG', 'Plastic & Reconstructive Surgery', 'Surgical', 'Cosmetic surgery, burn reconstruction, hand surgery', 5, '+91-80-12345034', 'plastic.surgery@hospital.com'),
        ('UROLOGY', 'Urology', 'Surgical', 'Urinary tract, kidney stones, prostate surgery', 5, '+91-80-12345035', 'urology@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 5;
    RAISE NOTICE '✓ Created 5 Surgical Specialties';
    
    -- =====================================================
    -- CATEGORY 4: SUPPORT & EMERGENCY DEPARTMENTS
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Emergency & Critical Care (4 departments)
        ('EMERGENCY', 'Emergency Department', 'Support', '24/7 emergency care, trauma, critical stabilization', 1, '+91-80-12345041', 'emergency@hospital.com'),
        ('ICU', 'Intensive Care Unit', 'Support', 'Critical care, ventilator support, monitoring', 7, '+91-80-12345042', 'icu@hospital.com'),
        ('CCU', 'Coronary Care Unit', 'Support', 'Cardiac intensive care, heart attack, arrhythmia', 7, '+91-80-12345043', 'ccu@hospital.com'),
        ('NICU', 'Neonatal ICU', 'Support', 'Newborn intensive care, premature babies', 7, '+91-80-12345044', 'nicu@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 4;
    RAISE NOTICE '✓ Created 4 Emergency & Critical Care Departments';
    
    -- =====================================================
    -- CATEGORY 5: DIAGNOSTIC & IMAGING
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Diagnostics (4 departments)
        ('RADIOLOGY', 'Radiology & Imaging', 'Diagnostic', 'X-ray, CT scan, MRI, ultrasound, mammography', 1, '+91-80-12345051', 'radiology@hospital.com'),
        ('LAB', 'Laboratory Services', 'Diagnostic', 'Blood tests, pathology, microbiology, histopathology', 1, '+91-80-12345052', 'lab@hospital.com'),
        ('NUCLEAR-MED', 'Nuclear Medicine', 'Diagnostic', 'PET scan, bone scan, thyroid scan', 1, '+91-80-12345053', 'nuclear.med@hospital.com'),
        ('CARDIO-DIAG', 'Cardiac Diagnostics', 'Diagnostic', 'ECG, echocardiography, stress test, Holter monitoring', 4, '+91-80-12345054', 'cardiac.diag@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 4;
    RAISE NOTICE '✓ Created 4 Diagnostic & Imaging Departments';
    
    -- =====================================================
    -- CATEGORY 6: WOMEN & CHILD HEALTH
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Women & Child (3 departments)
        ('OBGYN', 'Obstetrics & Gynecology', 'Clinical', 'Pregnancy care, delivery, women health, infertility', 8, '+91-80-12345061', 'obgyn@hospital.com'),
        ('PEDIATRICS', 'Pediatrics', 'Clinical', 'Children health, vaccinations, growth monitoring', 8, '+91-80-12345062', 'pediatrics@hospital.com'),
        ('MATERNITY', 'Maternity Ward', 'Support', 'Labor room, delivery, postnatal care', 8, '+91-80-12345063', 'maternity@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 3;
    RAISE NOTICE '✓ Created 3 Women & Child Health Departments';
    
    -- =====================================================
    -- CATEGORY 7: ADMINISTRATIVE & SUPPORT
    -- =====================================================
    
    INSERT INTO department (
        tenant_id, department_code, department_name, department_category,
        head_of_department_user_id, description, floor, phone, email, status
    )
    SELECT 
        v_tenant_id, dept_code, dept_name, dept_cat,
        (SELECT id FROM users WHERE email LIKE '%@%' AND deleted_at IS NULL LIMIT 1),
        dept_desc, floor_num, phone, email, 'active'
    FROM (VALUES
        -- Admin & Support (6 departments)
        ('PHARMACY', 'Pharmacy', 'Administrative', 'Medication dispensing, drug information, inventory', 1, '+91-80-12345071', 'pharmacy@hospital.com'),
        ('NUTRITION', 'Nutrition & Dietetics', 'Support', 'Diet planning, nutritional counseling, therapeutic diets', 3, '+91-80-12345072', 'nutrition@hospital.com'),
        ('PHYSIOTHERAPY', 'Physiotherapy & Rehabilitation', 'Support', 'Physical therapy, rehab, sports medicine', 3, '+91-80-12345073', 'physiotherapy@hospital.com'),
        ('ANESTHESIA', 'Anesthesiology', 'Support', 'Surgical anesthesia, pain management, critical care', 5, '+91-80-12345074', 'anesthesia@hospital.com'),
        ('BLOOD-BANK', 'Blood Bank', 'Support', 'Blood donation, storage, transfusion services', 1, '+91-80-12345075', 'bloodbank@hospital.com'),
        ('MEDICAL-RECORDS', 'Medical Records', 'Administrative', 'Patient records, documentation, billing', 1, '+91-80-12345076', 'records@hospital.com')
    ) AS depts(dept_code, dept_name, dept_cat, dept_desc, floor_num, phone, email);
    
    v_dept_counter := v_dept_counter + 6;
    RAISE NOTICE '✓ Created 6 Administrative & Support Departments';
    
    -- =====================================================
    -- UPDATE DEPARTMENT STATISTICS
    -- =====================================================
    
    -- Update branch with total departments
    UPDATE branch 
    SET total_departments = v_dept_counter
    WHERE id = v_branch_id;
    
    -- =====================================================
    -- MIGRATION COMPLETE
    -- =====================================================
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 16: DEPARTMENTS SEEDING COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SUMMARY BY CATEGORY:';
    RAISE NOTICE '  Eye Care Specialties:         8 departments';
    RAISE NOTICE '  General Medical:              10 departments';
    RAISE NOTICE '  Surgical Specialties:         5 departments';
    RAISE NOTICE '  Emergency & Critical Care:    4 departments';
    RAISE NOTICE '  Diagnostic & Imaging:         4 departments';
    RAISE NOTICE '  Women & Child Health:         3 departments';
    RAISE NOTICE '  Administrative & Support:     6 departments';
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'TOTAL DEPARTMENTS CREATED:       % departments', v_dept_counter;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ready for Clinical Operations!';
    RAISE NOTICE '============================================';
    
END $$;
