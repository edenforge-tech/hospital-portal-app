-- Seed Surgery Types for Eye Hospital (CORRECTED)
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e

INSERT INTO surgery_types (
    id,
    tenant_id,
    surgery_name,
    surgery_code,
    surgery_category,
    description,
    default_price,
    typical_duration_minutes,
    display_order,
    is_active,
    anesthesia_type,
    requires_admission,
    created_at,
    updated_at
) VALUES
-- Cataract Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Phacoemulsification with IOL', 'PHACO-IOL', 'Cataract', 
    'Standard cataract surgery with intraocular lens implantation', 45000.00, 45, 1, true, 'Local', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Manual Small Incision Cataract Surgery (MSICS)', 'MSICS', 'Cataract', 
    'Manual cataract extraction with IOL', 35000.00, 60, 2, true, 'Local', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Premium IOL Cataract Surgery', 'PHACO-PREMIUM', 'Cataract', 
    'Phaco with premium multifocal or toric IOL', 85000.00, 50, 3, true, 'Local', false,
    NOW(), NOW()),

-- Retina Surgeries  
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Vitrectomy', 'VIT', 'Retina', 
    'Pars plana vitrectomy for retinal disorders', 75000.00, 90, 4, true, 'General', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Retinal Detachment Repair', 'RET-DETACH', 'Retina', 
    'Surgical repair of retinal detachment', 95000.00, 120, 5, true, 'General', true,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Macular Hole Repair', 'MH-REPAIR', 'Retina', 
    'Vitrectomy with ILM peeling for macular hole', 80000.00, 75, 6, true, 'General', false,
    NOW(), NOW()),

-- Glaucoma Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Trabeculectomy', 'TRAB', 'Glaucoma', 
    'Glaucoma filtration surgery', 55000.00, 75, 7, true, 'Local', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Tube Shunt Surgery', 'TUBE-SHUNT', 'Glaucoma', 
    'Ahmed or Baerveldt tube implantation', 70000.00, 90, 8, true, 'Local', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Laser Trabeculoplasty (SLT)', 'SLT', 'Glaucoma', 
    'Selective laser trabeculoplasty', 15000.00, 15, 9, true, 'None', false,
    NOW(), NOW()),

-- Cornea Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Corneal Transplant (PKP)', 'PKP', 'Cornea', 
    'Penetrating keratoplasty', 120000.00, 90, 10, true, 'General', true,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'DSEK/DMEK', 'DSEK', 'Cornea', 
    'Endothelial keratoplasty', 150000.00, 120, 11, true, 'General', true,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'PTK (Phototherapeutic Keratectomy)', 'PTK', 'Cornea', 
    'Laser corneal surface treatment', 25000.00, 20, 12, true, 'Local', false,
    NOW(), NOW()),

-- Refractive Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'LASIK', 'LASIK', 'Refractive', 
    'Laser-assisted in situ keratomileusis', 60000.00, 30, 13, true, 'None', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'PRK', 'PRK', 'Refractive', 
    'Photorefractive keratectomy', 50000.00, 25, 14, true, 'None', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'ICL Implantation', 'ICL', 'Refractive', 
    'Implantable collamer lens', 90000.00, 30, 15, true, 'Local', false,
    NOW(), NOW()),

-- Oculoplasty Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Ptosis Correction', 'PTOSIS', 'Oculoplasty', 
    'Eyelid ptosis repair', 35000.00, 45, 16, true, 'Local', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'DCR (Dacryocystorhinostomy)', 'DCR', 'Oculoplasty', 
    'Tear duct surgery', 40000.00, 60, 17, true, 'Local', false,
    NOW(), NOW()),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Entropion/Ectropion Repair', 'ENTROP', 'Oculoplasty', 
    'Eyelid malposition correction', 30000.00, 40, 18, true, 'Local', false,
    NOW(), NOW()),

-- Strabismus Surgery
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Strabismus Surgery', 'SQUINT', 'Strabismus', 
    'Eye muscle realignment surgery', 45000.00, 60, 19, true, 'General', false,
    NOW(), NOW()),

-- Emergency/Other
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Evisceration/Enucleation', 'EVSC', 'General', 
    'Eye removal surgery', 50000.00, 90, 20, true, 'General', false,
    NOW(), NOW());

-- Verify insertion
SELECT 
    surgery_category,
    COUNT(*) as count_per_category
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true
GROUP BY surgery_category
ORDER BY surgery_category;

-- Total count
SELECT COUNT(*) as total_surgery_types
FROM surgery_types  
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true;

-- List all inserted surgeries
SELECT 
    surgery_name,
    surgery_code,
    surgery_category,
    default_price,
    typical_duration_minutes
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true
ORDER BY display_order;
