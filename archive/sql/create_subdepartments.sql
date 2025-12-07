-- =============================================
-- Create Sub-Department Hierarchy
-- Generated: November 11, 2025
-- Total Sub-Departments: 20
-- =============================================

SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

BEGIN;

-- Get parent department IDs (we'll use these in INSERTs)
-- Laboratory: 10834022-bcb7-4af0-a4a2-c56375bed055
-- Eye Imaging Center: 7869f345-e1df-457d-9e7d-57637fc152f7
-- Optical Shop: d17e0b2b-c5ea-4b32-8cd7-47b2bddb02b1
-- Cataract Surgery: e154c960-1b28-42c2-92c0-fae09afe53dd
-- Pediatric Ophthalmology: 6f3d4546-6b8d-4ece-9648-e903af75ab83
-- Cornea Services: 43a7e5d6-f922-4f8e-94e7-19f1d8a0c8f6
-- Glaucoma Services: 82bb6453-e15c-4b0a-b0fa-4e62e0e37ec4
-- Retina and Vitreous: a6e42f31-97c8-4d24-8c3d-5d2b8f9e3a71

-- ============================================
-- Laboratory Sub-Departments (3)
-- ============================================
INSERT INTO department (
    id, tenant_id, branch_id, department_code, name, department_name, department_type,
    description, status, parent_department_id,
    working_hours_start, working_hours_end, is_24x7, requires_approval_workflow,
    created_at, created_by_user_id, updated_at, updated_by_user_id
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'LAB-CP',
    'Clinical Pathology',
    'Diagnostic',
    'Blood tests, urine analysis, and clinical diagnostics',
    'Active',
    '10834022-bcb7-4af0-a4a2-c56375bed055',  -- Laboratory parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'LAB-MICRO',
    'Microbiology',
    'Diagnostic',
    'Bacterial culture and sensitivity testing',
    'Active',
    '10834022-bcb7-4af0-a4a2-c56375bed055',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'LAB-BIOCHEM',
    'Biochemistry',
    'Diagnostic',
    'Blood chemistry and metabolic panel testing',
    'Active',
    '10834022-bcb7-4af0-a4a2-c56375bed055',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Eye Imaging Center Sub-Departments (4)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'IMG-OCT',
    'OCT Services',
    'Diagnostic',
    'Optical Coherence Tomography imaging',
    'Active',
    '7869f345-e1df-457d-9e7d-57637fc152f7',  -- Eye Imaging Center parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'IMG-FUNDUS',
    'Fundus Photography',
    'Diagnostic',
    'Retinal and fundus imaging services',
    'Active',
    '7869f345-e1df-457d-9e7d-57637fc152f7',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'IMG-BSCAN',
    'B-Scan Ultrasound',
    'Diagnostic',
    'Ocular ultrasound imaging',
    'Active',
    '7869f345-e1df-457d-9e7d-57637fc152f7',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'IMG-PERIM',
    'Perimetry',
    'Diagnostic',
    'Visual field testing and analysis',
    'Active',
    '7869f345-e1df-457d-9e7d-57637fc152f7',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Optical Shop Sub-Departments (2)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'OPT-RETAIL',
    'Optical Retail',
    'Retail',
    'Frame and lens retail sales',
    'Active',
    'd17e0b2b-c5ea-4b32-8cd7-47b2bddb02b1',  -- Optical Shop parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'OPT-WORKSHOP',
    'Optical Workshop',
    'Retail',
    'Lens cutting, fitting, and repairs',
    'Active',
    'd17e0b2b-c5ea-4b32-8cd7-47b2bddb02b1',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Cataract Surgery Sub-Departments (4)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'CAT-OT',
    'Cataract OT Main',
    'Surgical',
    'Primary cataract surgery operating theatre',
    'Active',
    'e154c960-1b28-42c2-92c0-fae09afe53dd',  -- Cataract Surgery parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'CAT-PREP',
    'Pre-Op Preparation',
    'Surgical',
    'Patient preparation before cataract surgery',
    'Active',
    'e154c960-1b28-42c2-92c0-fae09afe53dd',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'CAT-RECOVERY',
    'Post-Op Recovery',
    'Surgical',
    'Post-operative care and recovery monitoring',
    'Active',
    'e154c960-1b28-42c2-92c0-fae09afe53dd',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'CAT-STERIL',
    'Sterilization Unit',
    'Surgical',
    'Surgical instrument sterilization',
    'Active',
    'e154c960-1b28-42c2-92c0-fae09afe53dd',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Pediatric Ophthalmology Sub-Departments (3)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'PED-WARD',
    'Pediatric General Ward',
    'Clinical',
    'General ward for pediatric ophthalmology patients',
    'Active',
    '6f3d4546-6b8d-4ece-9648-e903af75ab83',  -- Pediatric Ophthalmology parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'PED-ICU',
    'Pediatric ICU',
    'Clinical',
    'Intensive care for pediatric eye patients',
    'Active',
    '6f3d4546-6b8d-4ece-9648-e903af75ab83',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'PED-POSTOP',
    'Pediatric Post-Op Care',
    'Clinical',
    'Post-operative care for pediatric patients',
    'Active',
    '6f3d4546-6b8d-4ece-9648-e903af75ab83',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Cornea Services Sub-Departments (2)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'COR-CLINIC',
    'Cornea Clinic',
    'Clinical',
    'Outpatient cornea consultation and treatment',
    'Active',
    '43a7e5d6-f922-4f8e-94e7-19f1d8a0c8f6',  -- Cornea Services parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'COR-SURGERY',
    'Corneal Surgery',
    'Surgical',
    'Corneal transplant and refractive surgery',
    'Active',
    '43a7e5d6-f922-4f8e-94e7-19f1d8a0c8f6',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Glaucoma Services Sub-Departments (1)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'GLAU-LASER',
    'Glaucoma Laser Unit',
    'Surgical',
    'Laser treatment for glaucoma management',
    'Active',
    '82bb6453-e15c-4b0a-b0fa-4e62e0e37ec4',  -- Glaucoma Services parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- ============================================
-- Retina and Vitreous Sub-Departments (1)
-- ============================================
INSERT INTO department (
    id, tenant_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    created_at, created_by, updated_at, updated_by
) VALUES 
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'RET-VIT-OT',
    'Retina Surgery OT',
    'Surgical',
    'Vitreoretinal surgery operating theatre',
    'Active',
    'a6e42f31-97c8-4d24-8c3d-5d2b8f9e3a71',  -- Retina and Vitreous parent
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

COMMIT;

-- Verification Query
SELECT 
    p.department_name as parent_department,
    d.department_code,
    d.department_name as sub_department,
    d.department_type,
    d.status
FROM department d
LEFT JOIN department p ON d.parent_department_id = p.id
WHERE d.tenant_id = '11111111-1111-1111-1111-111111111111'
    AND d.parent_department_id IS NOT NULL
    AND d.deleted_at IS NULL
ORDER BY p.department_name, d.department_name;

-- Summary Count
SELECT 
    'Total sub-departments created: ' || COUNT(*) as summary
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND parent_department_id IS NOT NULL
    AND deleted_at IS NULL;
