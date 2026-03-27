-- Seed ICD-10 codes only (tables already exist)
DO $$
DECLARE
    v_tenant_id UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
BEGIN
    -- GLAUCOMA CODES (H40.xx)
    INSERT INTO diagnosis_code (tenant_id, code, description, category, laterality, billable) VALUES
    (v_tenant_id, 'H40.10X0', 'Unspecified open-angle glaucoma, stage unspecified', 'Glaucoma', 'Unspecified', true),
    (v_tenant_id, 'H40.111', 'Primary open-angle glaucoma, right eye, mild stage', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.112', 'Primary open-angle glaucoma, left eye, mild stage', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.113', 'Primary open-angle glaucoma, bilateral, mild stage', 'Glaucoma', 'OU', true),
    (v_tenant_id, 'H40.121', 'Primary open-angle glaucoma, right eye, moderate stage', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.122', 'Primary open-angle glaucoma, left eye, moderate stage', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.123', 'Primary open-angle glaucoma, bilateral, moderate stage', 'Glaucoma', 'OU', true),
    (v_tenant_id, 'H40.131', 'Primary open-angle glaucoma, right eye, severe stage', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.132', 'Primary open-angle glaucoma, left eye, severe stage', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.133', 'Primary open-angle glaucoma, bilateral, severe stage', 'Glaucoma', 'OU', true),
    (v_tenant_id, 'H40.141', 'Primary open-angle glaucoma, right eye, indeterminate stage', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.142', 'Primary open-angle glaucoma, left eye, indeterminate stage', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.143', 'Primary open-angle glaucoma, bilateral, indeterminate stage', 'Glaucoma', 'OU', true),
    
    -- Angle-closure glaucoma
    (v_tenant_id, 'H40.211', 'Acute angle-closure glaucoma, right eye', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.212', 'Acute angle-closure glaucoma, left eye', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.213', 'Acute angle-closure glaucoma, bilateral', 'Glaucoma', 'OU', true),
    (v_tenant_id, 'H40.221', 'Chronic angle-closure glaucoma, right eye', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.222', 'Chronic angle-closure glaucoma, left eye', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.223', 'Chronic angle-closure glaucoma, bilateral', 'Glaucoma', 'OU', true),
    
    -- Normal tension glaucoma
    (v_tenant_id, 'H40.121', 'Low-tension glaucoma, right eye', 'Glaucoma', 'OD', true),
    (v_tenant_id, 'H40.122', 'Low-tension glaucoma, left eye', 'Glaucoma', 'OS', true),
    (v_tenant_id, 'H40.123', 'Low-tension glaucoma, bilateral', 'Glaucoma', 'OU', true),
    
    -- CATARACT CODES (H25.xx - H26.xx)
    (v_tenant_id, 'H25.011', 'Cortical age-related cataract, right eye', 'Cataract', 'OD', true),
    (v_tenant_id, 'H25.012', 'Cortical age-related cataract, left eye', 'Cataract', 'OS', true),
    (v_tenant_id, 'H25.013', 'Cortical age-related cataract, bilateral', 'Cataract', 'OU', true),
    (v_tenant_id, 'H25.111', 'Nuclear age-related cataract, right eye', 'Cataract', 'OD', true),
    (v_tenant_id, 'H25.112', 'Nuclear age-related cataract, left eye', 'Cataract', 'OS', true),
    (v_tenant_id, 'H25.113', 'Nuclear age-related cataract, bilateral', 'Cataract', 'OU', true),
    (v_tenant_id, 'H25.211', 'Posterior subcapsular age-related cataract, right eye', 'Cataract', 'OD', true),
    (v_tenant_id, 'H25.212', 'Posterior subcapsular age-related cataract, left eye', 'Cataract', 'OS', true),
    (v_tenant_id, 'H25.213', 'Posterior subcapsular age-related cataract, bilateral', 'Cataract', 'OU', true),
    (v_tenant_id, 'H25.811', 'Combined forms of age-related cataract, right eye', 'Cataract', 'OD', true),
    (v_tenant_id, 'H25.812', 'Combined forms of age-related cataract, left eye', 'Cataract', 'OS', true),
    (v_tenant_id, 'H25.813', 'Combined forms of age-related cataract, bilateral', 'Cataract', 'OU', true),
    
    -- Traumatic cataract
    (v_tenant_id, 'H26.101', 'Traumatic cataract, right eye', 'Cataract', 'OD', true),
    (v_tenant_id, 'H26.102', 'Traumatic cataract, left eye', 'Cataract', 'OS', true),
    (v_tenant_id, 'H26.103', 'Traumatic cataract, bilateral', 'Cataract', 'OU', true),
    
    -- Complicated cataract
    (v_tenant_id, 'H26.211', 'Cataract with neovascularization, right eye', 'Cataract', 'OD', true),
    (v_tenant_id, 'H26.212', 'Cataract with neovascularization, left eye', 'Cataract', 'OS', true),
    (v_tenant_id, 'H26.213', 'Cataract with neovascularization, bilateral', 'Cataract', 'OU', true),
    
    -- REFRACTIVE ERRORS (H52.xx)
    (v_tenant_id, 'H52.00', 'Hypermetropia, unspecified', 'Refractive Error', 'Unspecified', true),
    (v_tenant_id, 'H52.01', 'Hypermetropia, right eye', 'Refractive Error', 'OD', true),
    (v_tenant_id, 'H52.02', 'Hypermetropia, left eye', 'Refractive Error', 'OS', true),
    (v_tenant_id, 'H52.03', 'Hypermetropia, bilateral', 'Refractive Error', 'OU', true),
    (v_tenant_id, 'H52.10', 'Myopia, unspecified', 'Refractive Error', 'Unspecified', true),
    (v_tenant_id, 'H52.11', 'Myopia, right eye', 'Refractive Error', 'OD', true),
    (v_tenant_id, 'H52.12', 'Myopia, left eye', 'Refractive Error', 'OS', true),
    (v_tenant_id, 'H52.13', 'Myopia, bilateral', 'Refractive Error', 'OU', true),
    (v_tenant_id, 'H52.201', 'Astigmatism, right eye', 'Refractive Error', 'OD', true),
    (v_tenant_id, 'H52.202', 'Astigmatism, left eye', 'Refractive Error', 'OS', true),
    (v_tenant_id, 'H52.203', 'Astigmatism, bilateral', 'Refractive Error', 'OU', true),
    (v_tenant_id, 'H52.4', 'Presbyopia', 'Refractive Error', 'OU', true),
    (v_tenant_id, 'H52.511', 'Accommodative component of refractive error, right eye', 'Refractive Error', 'OD', true),
    (v_tenant_id, 'H52.512', 'Accommodative component of refractive error, left eye', 'Refractive Error', 'OS', true),
    (v_tenant_id, 'H52.513', 'Accommodative component of refractive error, bilateral', 'Refractive Error', 'OU', true),
    
    -- DIABETIC RETINOPATHY (E11.3xxx)
    (v_tenant_id, 'E11.311', 'Type 2 diabetes with mild nonproliferative diabetic retinopathy', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E11.321', 'Type 2 diabetes with mild nonproliferative diabetic retinopathy with macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E11.331', 'Type 2 diabetes with moderate nonproliferative diabetic retinopathy', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E11.341', 'Type 2 diabetes with moderate nonproliferative diabetic retinopathy with macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E11.351', 'Type 2 diabetes with proliferative diabetic retinopathy without macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E11.359', 'Type 2 diabetes with proliferative diabetic retinopathy with macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E11.36', 'Type 2 diabetes with diabetic cataract', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E10.311', 'Type 1 diabetes with mild nonproliferative diabetic retinopathy', 'Diabetic Retinopathy', 'Unspecified', true),
    (v_tenant_id, 'E10.351', 'Type 1 diabetes with proliferative diabetic retinopathy', 'Diabetic Retinopathy', 'Unspecified', true);

    RAISE NOTICE '✅ Successfully seeded % ICD-10 diagnosis codes', (SELECT COUNT(*) FROM diagnosis_code WHERE tenant_id = v_tenant_id);
END $$;
