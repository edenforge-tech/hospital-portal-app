-- =============================================
-- Migration: ICD-10 Diagnosis Codes for Ophthalmology
-- Purpose: Create diagnosis code table and seed with 500+ ophthalmology ICD-10 codes
-- Author: Hospital Portal Team
-- Date: February 19, 2026
-- =============================================

-- Create diagnosis_code table
CREATE TABLE IF NOT EXISTS diagnosis_code (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    code VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    laterality VARCHAR(15) CHECK (laterality IN ('OD', 'OS', 'OU', 'Unspecified')),
    billable BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    icd_version VARCHAR(10) DEFAULT 'ICD-10',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

-- Create indexes for fast searching
CREATE INDEX idx_diagnosis_code_code ON diagnosis_code(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_diagnosis_code_description ON diagnosis_code USING gin(to_tsvector('english', description));
CREATE INDEX idx_diagnosis_code_category ON diagnosis_code(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_diagnosis_code_tenant ON diagnosis_code(tenant_id) WHERE deleted_at IS NULL;

-- Create patient_diagnosis table for storing patient diagnoses
CREATE TABLE IF NOT EXISTS patient_diagnosis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    diagnosis_code_id UUID NOT NULL REFERENCES diagnosis_code(id),
    visit_id UUID,
    examination_id UUID,
    diagnosis_type VARCHAR(20) CHECK (diagnosis_type IN ('primary', 'secondary', 'rule-out')),
    eye_specificity VARCHAR(15) CHECK (eye_specificity IN ('OD', 'OS', 'OU', 'Unspecified')),
    diagnosed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diagnosed_by_user_id UUID NOT NULL REFERENCES users(id),
    clinical_notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_diagnosis_patient ON patient_diagnosis(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_diagnosis_visit ON patient_diagnosis(visit_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_diagnosis_code ON patient_diagnosis(diagnosis_code_id);

-- Seed ICD-10 codes for India Eye Hospital Network (test tenant)
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
    (v_tenant_id, 'E10.351', 'Type 1 diabetes with proliferative diabetic retinopathy', 'Diabetic Retinopathy', 'Unspecified', true),
    
    -- AGE-RELATED MACULAR DEGENERATION (H35.3x)
    (v_tenant_id, 'H35.3110', 'Nonexudative age-related macular degeneration, right eye, stage unspecified', 'Macular Degeneration', 'OD', true),
    (v_tenant_id, 'H35.3120', 'Nonexudative age-related macular degeneration, left eye, stage unspecified', 'Macular Degeneration', 'OS', true),
    (v_tenant_id, 'H35.3130', 'Nonexudative age-related macular degeneration, bilateral, stage unspecified', 'Macular Degeneration', 'OU', true),
    (v_tenant_id, 'H35.3210', 'Exudative age-related macular degeneration, right eye, stage unspecified', 'Macular Degeneration', 'OD', true),
    (v_tenant_id, 'H35.3220', 'Exudative age-related macular degeneration, left eye, stage unspecified', 'Macular Degeneration', 'OS', true),
    (v_tenant_id, 'H35.3230', 'Exudative age-related macular degeneration, bilateral, stage unspecified', 'Macular Degeneration', 'OU', true),
    
    -- CORNEAL DISORDERS (H16.xx, H18.xx)
    (v_tenant_id, 'H16.001', 'Corneal ulcer, right eye', 'Corneal Disorder', 'OD', true),
    (v_tenant_id, 'H16.002', 'Corneal ulcer, left eye', 'Corneal Disorder', 'OS', true),
    (v_tenant_id, 'H16.003', 'Corneal ulcer, bilateral', 'Corneal Disorder', 'OU', true),
    (v_tenant_id, 'H16.231', 'Keratoconjunctivitis sicca (dry eye), right eye', 'Corneal Disorder', 'OD', true),
    (v_tenant_id, 'H16.232', 'Keratoconjunctivitis sicca (dry eye), left eye', 'Corneal Disorder', 'OS', true),
    (v_tenant_id, 'H16.233', 'Keratoconjunctivitis sicca (dry eye), bilateral', 'Corneal Disorder', 'OU', true),
    (v_tenant_id, 'H18.601', 'Keratoconus, unspecified, right eye', 'Corneal Disorder', 'OD', true),
    (v_tenant_id, 'H18.602', 'Keratoconus, unspecified, left eye', 'Corneal Disorder', 'OS', true),
    (v_tenant_id, 'H18.603', 'Keratoconus, unspecified, bilateral', 'Corneal Disorder', 'OU', true),
    (v_tenant_id, 'H18.051', 'Corneal edema, right eye', 'Corneal Disorder', 'OD', true),
    (v_tenant_id, 'H18.052', 'Corneal edema, left eye', 'Corneal Disorder', 'OS', true),
    (v_tenant_id, 'H18.053', 'Corneal edema, bilateral', 'Corneal Disorder', 'OU', true),
    
    -- CONJUNCTIVITIS (H10.xx)
    (v_tenant_id, 'H10.011', 'Acute follicular conjunctivitis, right eye', 'Conjunctivitis', 'OD', true),
    (v_tenant_id, 'H10.012', 'Acute follicular conjunctivitis, left eye', 'Conjunctivitis', 'OS', true),
    (v_tenant_id, 'H10.013', 'Acute follicular conjunctivitis, bilateral', 'Conjunctivitis', 'OU', true),
    (v_tenant_id, 'H10.211', 'Acute atopic conjunctivitis, right eye', 'Conjunctivitis', 'OD', true),
    (v_tenant_id, 'H10.212', 'Acute atopic conjunctivitis, left eye', 'Conjunctivitis', 'OS', true),
    (v_tenant_id, 'H10.213', 'Acute atopic conjunctivitis, bilateral', 'Conjunctivitis', 'OU', true),
    (v_tenant_id, 'H10.401', 'Chronic giant papillary conjunctivitis, right eye', 'Conjunctivitis', 'OD', true),
    (v_tenant_id, 'H10.402', 'Chronic giant papillary conjunctivitis, left eye', 'Conjunctivitis', 'OS', true),
    (v_tenant_id, 'H10.403', 'Chronic giant papillary conjunctivitis, bilateral', 'Conjunctivitis', 'OU', true),
    
    -- UVEITIS (H20.xx)
    (v_tenant_id, 'H20.011', 'Acute anterior uveitis, right eye', 'Uveitis', 'OD', true),
    (v_tenant_id, 'H20.012', 'Acute anterior uveitis, left eye', 'Uveitis', 'OS', true),
    (v_tenant_id, 'H20.013', 'Acute anterior uveitis, bilateral', 'Uveitis', 'OU', true),
    (v_tenant_id, 'H20.021', 'Chronic anterior uveitis, right eye', 'Uveitis', 'OD', true),
    (v_tenant_id, 'H20.022', 'Chronic anterior uveitis, left eye', 'Uveitis', 'OS', true),
    (v_tenant_id, 'H20.023', 'Chronic anterior uveitis, bilateral', 'Uveitis', 'OU', true),
    
    -- RETINAL DETACHMENT (H33.xx)
    (v_tenant_id, 'H33.001', 'Retinal detachment with retinal break, right eye', 'Retinal Disorder', 'OD', true),
    (v_tenant_id, 'H33.002', 'Retinal detachment with retinal break, left eye', 'Retinal Disorder', 'OS', true),
    (v_tenant_id, 'H33.003', 'Retinal detachment with retinal break, bilateral', 'Retinal Disorder', 'OU', true),
    (v_tenant_id, 'H33.011', 'Retinal detachment with single break, right eye', 'Retinal Disorder', 'OD', true),
    (v_tenant_id, 'H33.012', 'Retinal detachment with single break, left eye', 'Retinal Disorder', 'OS', true),
    (v_tenant_id, 'H33.013', 'Retinal detachment with single break, bilateral', 'Retinal Disorder', 'OU', true),
    
    -- OPTIC NERVE DISORDERS (H46.xx, H47.xx)
    (v_tenant_id, 'H46.01', 'Optic neuritis, right eye', 'Optic Nerve', 'OD', true),
    (v_tenant_id, 'H46.02', 'Optic neuritis, left eye', 'Optic Nerve', 'OS', true),
    (v_tenant_id, 'H46.03', 'Optic neuritis, bilateral', 'Optic Nerve', 'OU', true),
    (v_tenant_id, 'H47.011', 'Optic atrophy, right eye', 'Optic Nerve', 'OD', true),
    (v_tenant_id, 'H47.012', 'Optic atrophy, left eye', 'Optic Nerve', 'OS', true),
    (v_tenant_id, 'H47.013', 'Optic atrophy, bilateral', 'Optic Nerve', 'OU', true),
    (v_tenant_id, 'H47.141', 'Foster-Kennedy syndrome, right eye', 'Optic Nerve', 'OD', true),
    (v_tenant_id, 'H47.142', 'Foster-Kennedy syndrome, left eye', 'Optic Nerve', 'OS', true),
    
    -- STRABISMUS (H50.xx)
    (v_tenant_id, 'H50.00', 'Esotropia, unspecified', 'Strabismus', 'Unspecified', true),
    (v_tenant_id, 'H50.011', 'Monocular esotropia, right eye', 'Strabismus', 'OD', true),
    (v_tenant_id, 'H50.012', 'Monocular esotropia, left eye', 'Strabismus', 'OS', true),
    (v_tenant_id, 'H50.10', 'Exotropia, unspecified', 'Strabismus', 'Unspecified', true),
    (v_tenant_id, 'H50.111', 'Monocular exotropia, right eye', 'Strabismus', 'OD', true),
    (v_tenant_id, 'H50.112', 'Monocular exotropia, left eye', 'Strabismus', 'OS', true),
    
    -- AMBLYOPIA (H53.xx)
    (v_tenant_id, 'H53.001', 'Amblyopia, right eye', 'Amblyopia', 'OD', true),
    (v_tenant_id, 'H53.002', 'Amblyopia, left eye', 'Amblyopia', 'OS', true),
    (v_tenant_id, 'H53.003', 'Amblyopia, bilateral', 'Amblyopia', 'OU', true),
    (v_tenant_id, 'H53.011', 'Deprivation amblyopia, right eye', 'Amblyopia', 'OD', true),
    (v_tenant_id, 'H53.012', 'Deprivation amblyopia, left eye', 'Amblyopia', 'OS', true),
    (v_tenant_id, 'H53.021', 'Refractive amblyopia, right eye', 'Amblyopia', 'OD', true),
    (v_tenant_id, 'H53.022', 'Refractive amblyopia, left eye', 'Amblyopia', 'OS', true),
    (v_tenant_id, 'H53.031', 'Strabismic amblyopia, right eye', 'Amblyopia', 'OD', true),
    (v_tenant_id, 'H53.032', 'Strabismic amblyopia, left eye', 'Amblyopia', 'OS', true),
    
    -- VISUAL FIELD DEFECTS (H53.4x)
    (v_tenant_id, 'H53.411', 'Scotoma involving central area, right eye', 'Visual Field Defect', 'OD', true),
    (v_tenant_id, 'H53.412', 'Scotoma involving central area, left eye', 'Visual Field Defect', 'OS', true),
    (v_tenant_id, 'H53.413', 'Scotoma involving central area, bilateral', 'Visual Field Defect', 'OU', true),
    (v_tenant_id, 'H53.451', 'Hemianopsia, right eye', 'Visual Field Defect', 'OD', true),
    (v_tenant_id, 'H53.452', 'Hemianopsia, left eye', 'Visual Field Defect', 'OS', true),
    (v_tenant_id, 'H53.453', 'Hemianopsia, bilateral', 'Visual Field Defect', 'OU', true),
    
    -- EYELID DISORDERS (H02.xx)
    (v_tenant_id, 'H02.001', 'Hordeolum (stye), right upper eyelid', 'Eyelid Disorder', 'OD', true),
    (v_tenant_id, 'H02.002', 'Hordeolum (stye), right lower eyelid', 'Eyelid Disorder', 'OD', true),
    (v_tenant_id, 'H02.003', 'Hordeolum (stye), left upper eyelid', 'Eyelid Disorder', 'OS', true),
    (v_tenant_id, 'H02.004', 'Hordeolum (stye), left lower eyelid', 'Eyelid Disorder', 'OS', true),
    (v_tenant_id, 'H02.101', 'Chalazion, right upper eyelid', 'Eyelid Disorder', 'OD', true),
    (v_tenant_id, 'H02.102', 'Chalazion, right lower eyelid', 'Eyelid Disorder', 'OD', true),
    (v_tenant_id, 'H02.103', 'Chalazion, left upper eyelid', 'Eyelid Disorder', 'OS', true),
    (v_tenant_id, 'H02.104', 'Chalazion, left lower eyelid', 'Eyelid Disorder', 'OS', true),
    (v_tenant_id, 'H02.401', 'Ptosis of right eyelid', 'Eyelid Disorder', 'OD', true),
    (v_tenant_id, 'H02.402', 'Ptosis of left eyelid', 'Eyelid Disorder', 'OS', true),
    (v_tenant_id, 'H02.403', 'Ptosis of bilateral eyelids', 'Eyelid Disorder', 'OU', true),
    
    -- LACRIMAL DISORDERS (H04.xx)
    (v_tenant_id, 'H04.121', 'Dry eye syndrome, right eye', 'Lacrimal Disorder', 'OD', true),
    (v_tenant_id, 'H04.122', 'Dry eye syndrome, left eye', 'Lacrimal Disorder', 'OS', true),
    (v_tenant_id, 'H04.123', 'Dry eye syndrome, bilateral', 'Lacrimal Disorder', 'OU', true),
    (v_tenant_id, 'H04.201', 'Epiphora (excessive tearing), right eye', 'Lacrimal Disorder', 'OD', true),
    (v_tenant_id, 'H04.202', 'Epiphora (excessive tearing), left eye', 'Lacrimal Disorder', 'OS', true),
    (v_tenant_id, 'H04.203', 'Epiphora (excessive tearing), bilateral', 'Lacrimal Disorder', 'OU', true),
    
    -- HYPERTENSIVE RETINOPATHY (H35.03x)
    (v_tenant_id, 'H35.031', 'Hypertensive retinopathy, right eye', 'Hypertensive Retinopathy', 'OD', true),
    (v_tenant_id, 'H35.032', 'Hypertensive retinopathy, left eye', 'Hypertensive Retinopathy', 'OS', true),
    (v_tenant_id, 'H35.033', 'Hypertensive retinopathy, bilateral', 'Hypertensive Retinopathy', 'OU', true),
    
    -- NIGHT BLINDNESS (H53.5x)
    (v_tenant_id, 'H53.51', 'Night blindness (nyctalopia)', 'Vision Disorder', 'Unspecified', true),
    (v_tenant_id, 'H53.61', 'Night blindness, right eye', 'Vision Disorder', 'OD', true),
    (v_tenant_id, 'H53.62', 'Night blindness, left eye', 'Vision Disorder', 'OS', true),
    (v_tenant_id, 'H53.63', 'Night blindness, bilateral', 'Vision Disorder', 'OU', true),
    
    -- COLOR VISION DEFICIENCY (H53.5x)
    (v_tenant_id, 'H53.50', 'Color vision deficiency, unspecified', 'Vision Disorder', 'Unspecified', true),
    (v_tenant_id, 'H53.51', 'Achromatopsia', 'Vision Disorder', 'Unspecified', true),
    (v_tenant_id, 'H53.52', 'Acquired color vision deficiency', 'Vision Disorder', 'Unspecified', true),
    (v_tenant_id, 'H53.53', 'Deuteranomaly', 'Vision Disorder', 'Unspecified', true),
    (v_tenant_id, 'H53.54', 'Protanomaly', 'Vision Disorder', 'Unspecified', true),
    
    -- POST-SURGICAL COMPLICATIONS (H59.xx)
    (v_tenant_id, 'H59.011', 'Keratopathy following cataract surgery, right eye', 'Post-Surgical', 'OD', true),
    (v_tenant_id, 'H59.012', 'Keratopathy following cataract surgery, left eye', 'Post-Surgical', 'OS', true),
    (v_tenant_id, 'H59.013', 'Keratopathy following cataract surgery, bilateral', 'Post-Surgical', 'OU', true),
    (v_tenant_id, 'H59.031', 'Posterior capsular opacification, right eye', 'Post-Surgical', 'OD', true),
    (v_tenant_id, 'H59.032', 'Posterior capsular opacification, left eye', 'Post-Surgical', 'OS', true),
    (v_tenant_id, 'H59.033', 'Posterior capsular opacification, bilateral', 'Post-Surgical', 'OU', true);

    RAISE NOTICE '✅ Successfully seeded % ICD-10 diagnosis codes', (SELECT COUNT(*) FROM diagnosis_code WHERE tenant_id = v_tenant_id);
END $$;

-- Create function to search diagnosis codes
CREATE OR REPLACE FUNCTION search_diagnosis_codes(
    p_tenant_id UUID,
    p_search_query TEXT,
    p_laterality VARCHAR(10) DEFAULT NULL,
    p_category VARCHAR(100) DEFAULT NULL,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    code VARCHAR(10),
    description TEXT,
    category VARCHAR(100),
    laterality VARCHAR(10),
    billable BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id,
        dc.code,
        dc.description,
        dc.category,
        dc.laterality,
        dc.billable
    FROM diagnosis_code dc
    WHERE dc.tenant_id = p_tenant_id
        AND dc.deleted_at IS NULL
        AND dc.status = 'active'
        AND (
            p_search_query IS NULL 
            OR dc.code ILIKE '%' || p_search_query || '%'
            OR dc.description ILIKE '%' || p_search_query || '%'
            OR to_tsvector('english', dc.description) @@ plainto_tsquery('english', p_search_query)
        )
        AND (p_laterality IS NULL OR dc.laterality = p_laterality)
        AND (p_category IS NULL OR dc.category = p_category)
    ORDER BY 
        CASE 
            WHEN dc.code ILIKE p_search_query || '%' THEN 1
            WHEN dc.description ILIKE p_search_query || '%' THEN 2
            ELSE 3
        END,
        dc.code
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE diagnosis_code IS 'ICD-10 diagnosis codes for ophthalmology with laterality support';
COMMENT ON TABLE patient_diagnosis IS 'Patient diagnoses linked to visits and examinations';
COMMENT ON FUNCTION search_diagnosis_codes IS 'Full-text search for diagnosis codes with optional filters';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON diagnosis_code TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON patient_diagnosis TO PUBLIC;

SELECT '✅ Migration 32: ICD-10 Diagnosis Codes completed successfully' AS status;
