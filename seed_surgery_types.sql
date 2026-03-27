-- Seed Surgery Types for Eye Hospital
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Branch: 74c014cf-9570-4824-bdf9-b369ea11a8f4 (Downtown Hospital)

INSERT INTO surgery_types (
    id,
    tenant_id,
    surgery_name,
    surgery_code,
    surgery_category,
    description,
    default_price,
    estimated_duration_minutes,
    display_order,
    is_active,
    requires_pre_auth,
    anesthesia_required,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id,
    status
) VALUES
-- Cataract Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Phacoemulsification with IOL', 'PHACO-IOL', 'Cataract', 
    'Standard cataract surgery with intraocular lens implantation', 45000.00, 45, 1, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Manual Small Incision Cataract Surgery (MSICS)', 'MSICS', 'Cataract', 
    'Manual cataract extraction with IOL', 35000.00, 60, 2, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Premium IOL Cataract Surgery', 'PHACO-PREMIUM', 'Cataract', 
    'Phaco with premium multifocal or toric IOL', 85000.00, 50, 3, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Retina Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Vitrectomy', 'VIT', 'Retina', 
    'Pars plana vitrectomy for retinal disorders', 75000.00, 90, 4, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Retinal Detachment Repair', 'RET-DETACH', 'Retina', 
    'Surgical repair of retinal detachment', 95000.00, 120, 5, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Macular Hole Repair', 'MH-REPAIR', 'Retina', 
    'Vitrectomy with ILM peeling for macular hole', 80000.00, 75, 6, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Glaucoma Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Trabeculectomy', 'TRAB', 'Glaucoma', 
    'Glaucoma filtration surgery', 55000.00, 75, 7, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Tube Shunt Surgery', 'TUBE-SHUNT', 'Glaucoma', 
    'Ahmed or Baerveldt tube implantation', 70000.00, 90, 8, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Laser Trabeculoplasty (SLT)', 'SLT', 'Glaucoma', 
    'Selective laser trabeculoplasty', 15000.00, 15, 9, true, false, false, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Cornea Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Corneal Transplant (PKP)', 'PKP', 'Cornea', 
    'Penetrating keratoplasty', 120000.00, 90, 10, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'DSEK/DMEK', 'DSEK', 'Cornea', 
    'Endothelial keratoplasty', 150000.00, 120, 11, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'PTK (Phototherapeutic Keratectomy)', 'PTK', 'Cornea', 
    'Laser corneal surface treatment', 25000.00, 20, 12, true, false, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Refractive Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'LASIK', 'LASIK', 'Refractive', 
    'Laser-assisted in situ keratomileusis', 60000.00, 30, 13, true, false, false, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'PRK', 'PRK', 'Refractive', 
    'Photorefractive keratectomy', 50000.00, 25, 14, true, false, false, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'ICL Implantation', 'ICL', 'Refractive', 
    'Implantable collamer lens', 90000.00, 30, 15, true, false, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Oculoplasty Surgeries
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Ptosis Correction', 'PTOSIS', 'Oculoplasty', 
    'Eyelid ptosis repair', 35000.00, 45, 16, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'DCR (Dacryocystorhinostomy)', 'DCR', 'Oculoplasty', 
    'Tear duct surgery', 40000.00, 60, 17, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Entropion/Ectropion Repair', 'ENTROP', 'Oculoplasty', 
    'Eyelid malposition correction', 30000.00, 40, 18, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Strabismus Surgery
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Strabismus Surgery', 'SQUINT', 'Strabismus', 
    'Eye muscle realignment surgery', 45000.00, 60, 19, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active'),

-- Emergency/Other
(gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'Evisceration/Enucleation', 'EVSC', 'Trauma', 
    'Eye removal surgery', 50000.00, 90, 20, true, true, true, 
    NOW(), NOW(), NULL, NULL, 'active');

-- Verify insertion
SELECT 
    COUNT(*) as total_inserted,
    surgery_category,
    COUNT(*) as count_per_category
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true
GROUP BY surgery_category
ORDER BY surgery_category;

-- List all inserted surgeries
SELECT 
    surgery_name,
    surgery_code,
    surgery_category,
    default_price,
    estimated_duration_minutes
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true
ORDER BY display_order;
