-- =============================================
-- Comprehensive Seed Data for Ophthalmology
-- Purpose: Add 75+ ICD-10 codes and medications
-- Date: February 19, 2026
-- =============================================

-- Clear existing test data and reseed
DELETE FROM diagnosis_code WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Seed 75 essential ICD-10 codes
INSERT INTO diagnosis_code (tenant_id, code, description, category, laterality, billable) VALUES
-- GLAUCOMA (20 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.10X0', 'Unspecified open-angle glaucoma', 'Glaucoma', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.111', 'Primary open-angle glaucoma, right eye, mild', 'Glaucoma', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.112', 'Primary open-angle glaucoma, left eye, mild', 'Glaucoma', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.113', 'Primary open-angle glaucoma, bilateral, mild', 'Glaucoma', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.121', 'Primary open-angle glaucoma, right eye, moderate', 'Glaucoma', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.122', 'Primary open-angle glaucoma, left eye, moderate', 'Glaucoma', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.123', 'Primary open-angle glaucoma, bilateral, moderate', 'Glaucoma', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.131', 'Primary open-angle glaucoma, right eye, severe', 'Glaucoma', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.132', 'Primary open-angle glaucoma, left eye, severe', 'Glaucoma', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.133', 'Primary open-angle glaucoma, bilateral, severe', 'Glaucoma', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.211', 'Acute angle-closure glaucoma, right eye', 'Glaucoma', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.212', 'Acute angle-closure glaucoma, left eye', 'Glaucoma', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.213', 'Acute angle-closure glaucoma, bilateral', 'Glaucoma', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.221', 'Chronic angle-closure glaucoma, right eye', 'Glaucoma', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.222', 'Chronic angle-closure glaucoma, left eye', 'Glaucoma', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.223', 'Chronic angle-closure glaucoma, bilateral', 'Glaucoma', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.051', 'Low-tension glaucoma, right eye', 'Glaucoma', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.052', 'Low-tension glaucoma, left eye', 'Glaucoma', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.053', 'Low-tension glaucoma, bilateral', 'Glaucoma', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H40.60X0', 'Glaucoma secondary to drugs', 'Glaucoma', 'Unspecified', true),

-- CATARACT (15 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.011', 'Cortical age-related cataract, right eye', 'Cataract', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.012', 'Cortical age-related cataract, left eye', 'Cataract', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.013', 'Cortical age-related cataract, bilateral', 'Cataract', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.111', 'Nuclear age-related cataract, right eye', 'Cataract', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.112', 'Nuclear age-related cataract, left eye', 'Cataract', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.113', 'Nuclear age-related cataract, bilateral', 'Cataract', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.211', 'Posterior subcapsular cataract, right eye', 'Cataract', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.212', 'Posterior subcapsular cataract, left eye', 'Cataract', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.213', 'Posterior subcapsular cataract, bilateral', 'Cataract', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.811', 'Combined cataract, right eye', 'Cataract', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.812', 'Combined cataract, left eye', 'Cataract', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H25.813', 'Combined cataract, bilateral', 'Cataract', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H26.101', 'Traumatic cataract, right eye', 'Cataract', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H26.102', 'Traumatic cataract, left eye', 'Cataract', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H26.103', 'Traumatic cataract, bilateral', 'Cataract', 'OU', true),

-- REFRACTIVE ERRORS (12 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.00', 'Hypermetropia, unspecified', 'Refractive Error', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.01', 'Hypermetropia, right eye', 'Refractive Error', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.02', 'Hypermetropia, left eye', 'Refractive Error', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.03', 'Hypermetropia, bilateral', 'Refractive Error', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.10', 'Myopia, unspecified', 'Refractive Error', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.11', 'Myopia, right eye', 'Refractive Error', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.12', 'Myopia, left eye', 'Refractive Error', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.13', 'Myopia, bilateral', 'Refractive Error', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.201', 'Astigmatism, right eye', 'Refractive Error', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.202', 'Astigmatism, left eye', 'Refractive Error', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.203', 'Astigmatism, bilateral', 'Refractive Error', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H52.4', 'Presbyopia', 'Refractive Error', 'OU', true),

-- DIABETIC RETINOPATHY (10 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.311', 'Type 2 DM with mild nonprolif DR', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.319', 'Type 2 DM with mild nonprolif DR, unspecified eye', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.321', 'Type 2 DM with mild nonprolif DR with macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.331', 'Type 2 DM with moderate nonprolif DR', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.341', 'Type 2 DM with moderate nonprolif DR with macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.351', 'Type 2 DM with prolif DR without macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.359', 'Type 2 DM with prolif DR with macular edema', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E11.36', 'Type 2 DM with diabetic cataract', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E10.311', 'Type 1 DM with mild nonprolif DR', 'Diabetic Retinopathy', 'Unspecified', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'E10.351', 'Type 1 DM with prolif DR', 'Diabetic Retinopathy', 'Unspecified', true),

-- CONJUNCTIVITIS (6 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H10.011', 'Acute follicular conjunctivitis, right eye', 'Conjunctivitis', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H10.012', 'Acute follicular conjunctivitis, left eye', 'Conjunctivitis', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H10.013', 'Acute follicular conjunctivitis, bilateral', 'Conjunctivitis', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H10.211', 'Acute atopic conjunctivitis, right eye', 'Conjunctivitis', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H10.212', 'Acute atopic conjunctivitis, left eye', 'Conjunctivitis', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H10.213', 'Acute atopic conjunctivitis, bilateral', 'Conjunctivitis', 'OU', true),

-- DRY EYE (3 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H04.121', 'Dry eye syndrome, right eye', 'Dry Eye', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H04.122', 'Dry eye syndrome, left eye', 'Dry Eye', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H04.123', 'Dry eye syndrome, bilateral', 'Dry Eye', 'OU', true),

-- CORNEAL DISORDERS (6 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H16.001', 'Corneal ulcer, right eye', 'Corneal Disorder', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H16.002', 'Corneal ulcer, left eye', 'Corneal Disorder', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H16.003', 'Corneal ulcer, bilateral', 'Corneal Disorder', 'OU', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H18.601', 'Keratoconus, right eye', 'Corneal Disorder', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H18.602', 'Keratoconus, left eye', 'Corneal Disorder', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H18.603', 'Keratoconus, bilateral', 'Corneal Disorder', 'OU', true),

-- AMD (3 codes)
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H35.3110', 'Nonexudative AMD, right eye', 'AMD', 'OD', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H35.3120', 'Nonexudative AMD, left eye', 'AMD', 'OS', true),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'H35.3130', 'Nonexudative AMD, bilateral', 'AMD', 'OU', true);

-- Seed essential medications (simplified for reliable execution)
DELETE FROM ophth_medication;

INSERT INTO ophth_medication (generic_name, drug_class, route, contraindications, warnings) VALUES
('Timolol 0.5%', 'Beta-blocker', 'Topical', 'Asthma, COPD, Heart block, Severe cardiac failure', 'Monitor heart rate and blood pressure'),
('Latanoprost 0.005%', 'Prostaglandin analog', 'Topical', 'Pregnancy, Active intraocular inflammation', 'May cause iris darkening'),
('Brimonidine 0.2%', 'Alpha-2 agonist', 'Topical', 'MAO inhibitor therapy, Age <2 years', 'May cause drowsiness'),
('Dorzolamide 2%', 'Carbonic anhydrase inhibitor', 'Topical', 'Severe renal impairment, Sulfa allergy', 'Contains sulfonamide'),
('Acetazolamide 250mg', 'Carbonic anhydrase inhibitor', 'Oral', 'Sulfa allergy, Severe renal/hepatic disease', 'Monitor electrolytes'),
('Prednisolone Acetate 1%', 'Corticosteroid', 'Topical', 'Viral eye infections, Fungal eye diseases', 'Prolonged use may cause glaucoma'),
('Moxifloxacin 0.5%', 'Fluoroquinolone antibiotic', 'Topical', 'Fluoroquinolone hypersensitivity', 'Do not use with contact lenses'),
('Cyclosporine 0.05%', 'Immunomodulator', 'Topical', 'Active eye infection', 'Takes 3-6 months for full effect'),
('Tropicamide 1%', 'Mydriatic/Cycloplegic', 'Topical', 'Angle-closure glaucoma', 'Short-acting, warn about vision blur'),
('Atropine 1%', 'Cycloplegic/Mydriatic', 'Topical', 'Angle-closure glaucoma', 'Long-acting 7-14 days');

-- Report results
SELECT 
    (SELECT COUNT(*) FROM diagnosis_code) AS icd10_codes,
    (SELECT COUNT(*) FROM ophth_medication) AS medications,
    (SELECT COUNT(*) FROM drug_interaction) AS interactions;
