-- =====================================================================
-- Surgery Package Seed Data
-- Version: 54
-- Purpose: Populate surgery package templates and item catalog
-- Tables: surgery_package_templates, surgery_package_items_catalog
-- =====================================================================

-- Use first available tenant and user
DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
BEGIN
    -- Get first available tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    -- Get first available user
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- If no tenant/user found, use fallback
    IF v_tenant_id IS NULL THEN
        v_tenant_id := '11b26293-9d9c-4633-927e-3294bff2a8d7'::UUID;
    END IF;
    
    IF v_user_id IS NULL THEN
        v_user_id := 'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID;
    END IF;
    
    RAISE NOTICE 'Using Tenant ID: %, User ID: %', v_tenant_id, v_user_id;
    
    -- =====================================================================
    -- PART 1: Surgery Package Item Catalog (Reusable Components)
    -- =====================================================================
    
    -- Consultation Services (Professional Fee category)
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Pre-Op Consultation', 'CONS-PREOP', 'Professional Fee', 'Pre-operative consultation with surgeon', 500, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Post-Op Follow-up (Day 1)', 'CONS-POST-D1', 'Professional Fee', 'First day post-operative check', 300, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Post-Op Follow-up (Week 1)', 'CONS-POST-W1', 'Professional Fee', 'Week 1 post-operative check', 300, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Post-Op Follow-up (Month 1)', 'CONS-POST-M1', 'Professional Fee', 'Month 1 post-operative check', 300, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Post-Op Follow-up (Month 3)', 'CONS-POST-M3', 'Professional Fee', 'Month 3 post-operative check', 300, 'INR', 'Service', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Anesthesia Services (Professional Fee category)
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Topical Anesthesia', 'ANES-TOPICAL', 'Professional Fee', 'Eye drops anesthesia', 500, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Peribulbar Block', 'ANES-PERI', 'Professional Fee', 'Peribulbar anesthesia injection', 2000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'General Anesthesia', 'ANES-GA', 'Professional Fee', 'Full general anesthesia with monitoring', 10000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- IOL (Intraocular Lens) Options
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Standard Monofocal IOL', 'IOL-MONO-STD', 'IOL', 'Basic monofocal lens (Indian make)', 2000, 'INR', 'Unit', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Premium Monofocal IOL', 'IOL-MONO-PREM', 'IOL', 'Premium monofocal lens (Imported)', 8000, 'INR', 'Unit', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Toric IOL', 'IOL-TORIC', 'IOL', 'Astigmatism correction lens', 15000, 'INR', 'Unit', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Multifocal IOL', 'IOL-MULTI', 'IOL', 'Near and far vision lens', 40000, 'INR', 'Unit', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Extended Depth of Focus (EDOF) IOL', 'IOL-EDOF', 'IOL', 'Advanced extended focus lens', 60000, 'INR', 'Unit', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Surgical Procedures
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Phacoemulsification Surgery', 'SURG-PHACO', 'Surgery', 'Modern cataract surgery with ultrasound', 15000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'ECCE Surgery', 'SURG-ECCE', 'Surgery', 'Manual cataract extraction', 10000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Trabeculectomy', 'SURG-TRAB', 'Surgery', 'Glaucoma drainage surgery', 35000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Ahmed Valve Implantation', 'SURG-AHMED', 'Surgery', 'Glaucoma device implantation', 50000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Vitrectomy', 'SURG-VIT', 'Surgery', 'Retinal surgery', 60000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Scleral Buckle', 'SURG-BUCKLE', 'Surgery', 'Retinal detachment surgery', 50000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'LASIK Surgery', 'SURG-LASIK', 'Surgery', 'Laser vision correction', 35000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'PRK Surgery', 'SURG-PRK', 'Surgery', 'Surface ablation laser', 30000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Corneal Transplant (PKP)', 'SURG-PKP', 'Surgery', 'Full thickness transplant', 60000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'DSEK/DMEK', 'SURG-DSEK', 'Surgery', 'Endothelial keratoplasty', 80000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Medications & Supplies
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, requires_prescription, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Post-Op Medication Kit', 'MED-KIT-POSTOP', 'Medication', 'Antibiotic & anti-inflammatory drops', 1500, 'INR', 'Kit', true, false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Pre-Op Medication Kit', 'MED-KIT-PREOP', 'Medication', 'Dilating & antiseptic drops', 500, 'INR', 'Kit', true, false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Pain Management Kit', 'MED-KIT-PAIN', 'Medication', 'Oral pain medications', 300, 'INR', 'Kit', true, true, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Surgical Consumables', 'SUPP-CONS', 'Consumable', 'Disposable surgical supplies', 2000, 'INR', 'Kit', false, false, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Hospitalization & Room Charges
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Day Care Charges', 'ROOM-DAYCARE', 'Facility Fee', 'Same day surgery facility', 2000, 'INR', 'Day', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'General Ward (Per Day)', 'ROOM-GENERAL', 'Facility Fee', 'General ward bed per day', 1500, 'INR', 'Day', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Semi-Private Room (Per Day)', 'ROOM-SEMIPVT', 'Facility Fee', 'Semi-private room per day', 3000, 'INR', 'Day', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Private Room (Per Day)', 'ROOM-PRIVATE', 'Facility Fee', 'Private room with amenities', 5000, 'INR', 'Day', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Diagnostic Tests
    INSERT INTO surgery_package_items_catalog (id, tenant_id, item_name, item_code, item_category, description, default_price, currency, unit_of_measure, is_optional, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Pre-Op Blood Tests', 'TEST-BLOOD', 'Diagnostic', 'CBC, Sugar, HIV, HBsAg', 1000, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'ECG', 'TEST-ECG', 'Diagnostic', 'Electrocardiogram', 300, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Biometry', 'TEST-BIO', 'Diagnostic', 'IOL power calculation', 800, 'INR', 'Service', false, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'OCT Scan', 'TEST-OCT', 'Diagnostic', 'Optical coherence tomography', 2000, 'INR', 'Service', true, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- =====================================================================
    -- PART 2: Surgery Package Templates (Master Packages)
    -- =====================================================================

    -- Cataract Surgery Packages
    INSERT INTO surgery_package_templates (id, tenant_id, package_name, package_code, package_category, description, base_price, currency, max_discount_percent, applicable_surgery_types, included_services, validity_days, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Standard Cataract PHACO Package', 'PKG-CAT-STD', 'Standard', 'Basic cataract surgery with Indian IOL', 25000, 'INR', 10, 
         ARRAY['PHACO'], 
         ARRAY['Pre-op consultation', 'PHACO surgery', 'Standard IOL', 'Topical anesthesia', 'Post-op medications', '3 follow-ups', 'Day care facility'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'Premium Cataract PHACO Package', 'PKG-CAT-PREM', 'Premium', 'Premium cataract surgery with imported IOL', 35000, 'INR', 15, 
         ARRAY['PHACO'], 
         ARRAY['Pre-op consultation', 'PHACO surgery', 'Premium IOL', 'Peribulbar anesthesia', 'Post-op medications', '4 follow-ups', 'Day care facility', 'Pre-op tests'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'Super Premium Multi-focal IOL Package', 'PKG-CAT-SUPER', 'Deluxe', 'Top-tier multi-focal IOL for spectacle freedom', 75000, 'INR', 10, 
         ARRAY['PHACO'], 
         ARRAY['Pre-op consultation', 'PHACO surgery', 'Multifocal IOL', 'Peribulbar anesthesia', 'Post-op medications', '5 follow-ups', 'Private room', 'Pre-op tests', 'Biometry'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'Toric IOL Astigmatism Correction Package', 'PKG-CAT-TORIC', 'Premium', 'Toric IOL for astigmatism correction', 45000, 'INR', 12, 
         ARRAY['PHACO'], 
         ARRAY['Pre-op consultation', 'PHACO surgery', 'Toric IOL', 'Peribulbar anesthesia', 'Post-op medications', '4 follow-ups', 'Semi-private room', 'Biometry'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'EDOF Premium Vision Package', 'PKG-CAT-EDOF', 'Deluxe', 'Extended depth of focus IOL package', 85000, 'INR', 10, 
         ARRAY['PHACO'], 
         ARRAY['Pre-op consultation', 'PHACO surgery', 'EDOF IOL', 'Peribulbar anesthesia', 'Post-op medications', '5 follow-ups', 'Private room', 'Pre-op tests', 'Biometry', 'OCT scan'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Glaucoma Surgery Packages
    INSERT INTO surgery_package_templates (id, tenant_id, package_name, package_code, package_category, description, base_price, currency, max_discount_percent, applicable_surgery_types, included_services, validity_days, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Trabeculectomy Standard Package', 'PKG-GLAUC-TRAB', 'Premium', 'Standard glaucoma filtration surgery', 50000, 'INR', 15, 
         ARRAY['TRAB'], 
         ARRAY['Pre-op consultation', 'Trabeculectomy', 'General anesthesia', 'Post-op medications', '2 days general ward', '5 follow-ups', 'Pre-op tests'], 
         120, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'Ahmed Valve Premium Package', 'PKG-GLAUC-AHMED', 'Deluxe', 'Advanced glaucoma drainage device', 90000, 'INR', 12, 
         ARRAY['AHMED'], 
         ARRAY['Pre-op consultation', 'Ahmed valve surgery', 'General anesthesia', 'Post-op medications', '3 days semi-private room', '6 follow-ups', 'Pre-op tests'], 
         120, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Retina Surgery Packages
    INSERT INTO surgery_package_templates (id, tenant_id, package_name, package_code, package_category, description, base_price, currency, max_discount_percent, applicable_surgery_types, included_services, validity_days, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Vitrectomy Standard Package', 'PKG-RET-VIT', 'Deluxe', 'Standard vitreoretinal surgery', 80000, 'INR', 15, 
         ARRAY['VIT'], 
         ARRAY['Pre-op consultation', 'Vitrectomy', 'General anesthesia', 'Post-op medications', '2 days general ward', '5 follow-ups', 'Pre-op tests', 'OCT scan'], 
         120, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'Scleral Buckle Package', 'PKG-RET-BUCKLE', 'Deluxe', 'Retinal detachment repair', 70000, 'INR', 15, 
         ARRAY['BUCKLE'], 
         ARRAY['Pre-op consultation', 'Scleral buckle', 'General anesthesia', 'Post-op medications', '2 days general ward', '5 follow-ups', 'Pre-op tests'], 
         120, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Refractive Surgery Packages
    INSERT INTO surgery_package_templates (id, tenant_id, package_name, package_code, package_category, description, base_price, currency, max_discount_percent, applicable_surgery_types, included_services, validity_days, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'LASIK Standard Package (Per Eye)', 'PKG-REFR-LASIK', 'Premium', 'Laser vision correction standard', 45000, 'INR', 20, 
         ARRAY['LASIK'], 
         ARRAY['Pre-op consultation', 'LASIK surgery', 'Topical anesthesia', 'Post-op medications', '4 follow-ups', 'Day care facility', 'Pre-op tests'], 
         60, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'PRK Package (Per Eye)', 'PKG-REFR-PRK', 'Premium', 'Surface ablation laser correction', 38000, 'INR', 20, 
         ARRAY['PRK'], 
         ARRAY['Pre-op consultation', 'PRK surgery', 'Topical anesthesia', 'Post-op medications', '4 follow-ups', 'Day care facility', 'Pre-op tests'], 
         60, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Corneal Transplant Packages
    INSERT INTO surgery_package_templates (id, tenant_id, package_name, package_code, package_category, description, base_price, currency, max_discount_percent, applicable_surgery_types, included_services, validity_days, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Penetrating Keratoplasty (PKP) Package', 'PKG-CORN-PKP', 'Deluxe', 'Full thickness corneal transplant', 100000, 'INR', 10, 
         ARRAY['PKP'], 
         ARRAY['Pre-op consultation', 'PKP surgery', 'General anesthesia', 'Donor cornea', 'Post-op medications', '3 days semi-private room', '6 follow-ups', 'Pre-op tests'], 
         180, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'DSEK/DMEK Premium Package', 'PKG-CORN-DSEK', 'Deluxe', 'Endothelial keratoplasty', 130000, 'INR', 10, 
         ARRAY['DSEK'], 
         ARRAY['Pre-op consultation', 'DSEK surgery', 'General anesthesia', 'Donor tissue', 'Post-op medications', '3 days private room', '7 follow-ups', 'Pre-op tests', 'OCT scan'], 
         180, true, 'active', NOW(), NOW(), v_user_id, v_user_id);

    -- Other Surgery Packages
    INSERT INTO surgery_package_templates (id, tenant_id, package_name, package_code, package_category, description, base_price, currency, max_discount_percent, applicable_surgery_types, included_services, validity_days, is_active, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Squint Surgery Package', 'PKG-OTHER-SQUINT', 'Premium', 'Eye muscle alignment surgery', 40000, 'INR', 15, 
         ARRAY['SQUINT'], 
         ARRAY['Pre-op consultation', 'Squint surgery', 'General anesthesia', 'Post-op medications', 'Day care facility', '4 follow-ups', 'Pre-op tests'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id),
        
        (gen_random_uuid(), v_tenant_id, 'DCR (Dacryocystorhinostomy) Package', 'PKG-OTHER-DCR', 'Premium', 'Tear duct drainage surgery', 45000, 'INR', 15, 
         ARRAY['DCR'], 
         ARRAY['Pre-op consultation', 'DCR surgery', 'General anesthesia', 'Post-op medications', '1 day general ward', '4 follow-ups', 'Pre-op tests'], 
         90, true, 'active', NOW(), NOW(), v_user_id, v_user_id);
    
    RAISE NOTICE 'Surgery package templates and catalog items seeded successfully!';
    
END $$;

-- =====================================================================
-- Verification Query
-- =====================================================================
SELECT 'Package Templates' AS table_name, COUNT(*) AS row_count FROM surgery_package_templates
UNION ALL
SELECT 'Package Item Catalog', COUNT(*) FROM surgery_package_items_catalog;
