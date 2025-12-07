-- =============================================
-- Create Sub-Department Hierarchy (FIXED)
-- Generated: November 11, 2025
-- Total Sub-Departments: 20
-- =============================================

SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

BEGIN;

-- Get the default branch for the tenant
DO $$
DECLARE
    v_branch_id UUID;
BEGIN
    -- Get any branch for this tenant
    SELECT id INTO v_branch_id 
    FROM branch 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' 
    AND deleted_at IS NULL
    LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant 11111111-1111-1111-1111-111111111111';
    END IF;

    -- ============================================
    -- Laboratory Sub-Departments (3)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(),
        '11111111-1111-1111-1111-111111111111',
        v_branch_id,
        'LAB-CP',
        'Clinical Pathology',
        'Diagnostic',
        'Blood tests, urine analysis, and clinical diagnostics',
        'Active',
        '0f56877a-223b-4619-830d-d45ac9002a2f',  -- Laboratory parent (LAB)
        INTERVAL '8 hours',
        INTERVAL '18 hours',
        FALSE,
        FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(),
        '11111111-1111-1111-1111-111111111111',
        v_branch_id,
        'LAB-MICRO',
        'Microbiology',
        'Diagnostic',
        'Bacterial culture and sensitivity testing',
        'Active',
        '0f56877a-223b-4619-830d-d45ac9002a2f',
        INTERVAL '8 hours',
        INTERVAL '18 hours',
        FALSE,
        FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(),
        '11111111-1111-1111-1111-111111111111',
        v_branch_id,
        'LAB-BIOCHEM',
        'Biochemistry',
        'Diagnostic',
        'Blood chemistry and metabolic panel testing',
        'Active',
        '0f56877a-223b-4619-830d-d45ac9002a2f',
        INTERVAL '8 hours',
        INTERVAL '18 hours',
        FALSE,
        FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Eye Imaging Center Sub-Departments (4)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'IMG-OCT', 'OCT Services', 'Diagnostic',
        'Optical Coherence Tomography imaging', 'Active', '7869f345-e1df-457d-9e7d-57637fc152f7',
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'IMG-FUNDUS', 'Fundus Photography', 'Diagnostic',
        'Retinal and fundus imaging services', 'Active', '7869f345-e1df-457d-9e7d-57637fc152f7',
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'IMG-BSCAN', 'B-Scan Ultrasound', 'Diagnostic',
        'Ocular ultrasound imaging', 'Active', '7869f345-e1df-457d-9e7d-57637fc152f7',
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'IMG-PERIM', 'Perimetry', 'Diagnostic',
        'Visual field testing and analysis', 'Active', '7869f345-e1df-457d-9e7d-57637fc152f7',
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Optical Shop Sub-Departments (2)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'OPT-RETAIL', 'Optical Retail', 'Retail',
        'Frame and lens retail sales', 'Active', '10834022-bcb7-4af0-a4a2-c56375bed055',
        INTERVAL '9 hours', INTERVAL '19 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'OPT-WORKSHOP', 'Optical Workshop', 'Retail',
        'Lens cutting, fitting, and repairs', 'Active', '10834022-bcb7-4af0-a4a2-c56375bed055',
        INTERVAL '9 hours', INTERVAL '19 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Cataract Surgery Sub-Departments (4)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'CAT-OT', 'Cataract OT Main', 'Surgical',
        'Primary cataract surgery operating theatre', 'Active', 'e154c960-1b28-42c2-92c0-fae09afe53dd',
        INTERVAL '7 hours', INTERVAL '18 hours', FALSE, TRUE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'CAT-PREP', 'Pre-Op Preparation', 'Surgical',
        'Patient preparation before cataract surgery', 'Active', 'e154c960-1b28-42c2-92c0-fae09afe53dd',
        INTERVAL '7 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'CAT-RECOVERY', 'Post-Op Recovery', 'Surgical',
        'Post-operative care and recovery monitoring', 'Active', 'e154c960-1b28-42c2-92c0-fae09afe53dd',
        INTERVAL '7 hours', INTERVAL '20 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'CAT-STERIL', 'Sterilization Unit', 'Surgical',
        'Surgical instrument sterilization', 'Active', 'e154c960-1b28-42c2-92c0-fae09afe53dd',
        INTERVAL '6 hours', INTERVAL '19 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Pediatric Ophthalmology Sub-Departments (3)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'PED-WARD', 'Pediatric General Ward', 'Clinical',
        'General ward for pediatric ophthalmology patients', 'Active', '6f3d4546-6b8d-4ece-9648-e903af75ab83',
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'PED-ICU', 'Pediatric ICU', 'Clinical',
        'Intensive care for pediatric eye patients', 'Active', '6f3d4546-6b8d-4ece-9648-e903af75ab83',
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, TRUE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'PED-POSTOP', 'Pediatric Post-Op Care', 'Clinical',
        'Post-operative care for pediatric patients', 'Active', '6f3d4546-6b8d-4ece-9648-e903af75ab83',
        INTERVAL '8 hours', INTERVAL '20 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Cornea Services Sub-Departments (2)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'COR-CLINIC', 'Cornea Clinic', 'Clinical',
        'Outpatient cornea consultation and treatment', 'Active', '782ff22f-2935-4067-b4da-8b225c5877ff',
        INTERVAL '8 hours', INTERVAL '17 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    ),
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'COR-SURGERY', 'Corneal Surgery', 'Surgical',
        'Corneal transplant and refractive surgery', 'Active', '782ff22f-2935-4067-b4da-8b225c5877ff',
        INTERVAL '7 hours', INTERVAL '16 hours', FALSE, TRUE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Glaucoma Services Sub-Departments (1)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'GLAU-LASER', 'Glaucoma Laser Unit', 'Surgical',
        'Laser treatment for glaucoma management', 'Active', 'cf6577f3-45bf-4d04-94fc-83bfd007ad6e',
        INTERVAL '8 hours', INTERVAL '17 hours', FALSE, FALSE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

    -- ============================================
    -- Retina and Vitreous Sub-Departments (1)
    -- ============================================
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    (
        gen_random_uuid(), '11111111-1111-1111-1111-111111111111', v_branch_id, 'RET-VIT-OT', 'Retina Surgery OT', 'Surgical',
        'Vitreoretinal surgery operating theatre', 'Active', 'b13c1ef0-f87c-43e4-a53c-4634336d69bb',
        INTERVAL '7 hours', INTERVAL '18 hours', FALSE, TRUE,
        NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
    );

END $$;

COMMIT;

-- Verification Query
SELECT 
    p.department_name as parent_department,
    d.department_code,
    d.department_name as sub_department,
    d.department_type,
    d.status,
    d.is_24x7
FROM department d
LEFT JOIN department p ON d.parent_department_id = p.id
WHERE d.tenant_id = '11111111-1111-1111-1111-111111111111'
    AND d.parent_department_id IS NOT NULL
    AND d.deleted_at IS NULL
ORDER BY p.department_name, d.department_name;

-- Summary Count
SELECT 
    COUNT(*) as total_sub_departments_created
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND parent_department_id IS NOT NULL
    AND deleted_at IS NULL;
