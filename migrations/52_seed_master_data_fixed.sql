-- =====================================================================
-- Master Data Seeding Script (Fixed Version)
-- Version: 52
-- Purpose: Populate master data tables with realistic data
-- Tables: insurance_providers, tpa_providers, surgery_types, 
--         anesthesia_types, government_schemes
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
    -- 1. Insurance Providers (10 providers)
    -- =====================================================================
    INSERT INTO insurance_providers (id, tenant_id, provider_name, provider_code, provider_type, contact_number, contact_email, website_url, is_active, display_order, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Star Health Insurance', 'STAR', 'Both', '+91-44-28288881', 'care@starhealth.in', 'https://www.starhealth.in', true, 1, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'HDFC ERGO', 'HDFC', 'Both', '1800-2700-700', 'customerservice@hdfcergo.com', 'https://www.hdfcergo.com', true, 2, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'ICICI Lombard', 'ICICI', 'Both', '1860-266-7766', 'customersupport@icicilombard.com', 'https://www.icicilombard.com', true, 3, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'National Insurance', 'NIC', 'Mediclaim', '1800-200-7710', 'nicmail@nic.co.in', 'https://www.nationalinsurance.nic.co.in', true, 4, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'United India Insurance', 'UII', 'Mediclaim', '1800-425-4530', 'customercare@uiic.co.in', 'https://www.uiic.co.in', true, 5, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Care Health Insurance', 'CARE', 'Both', '1800-102-4488', 'care@careinsurance.com', 'https://www.careinsurance.com', true, 6, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Max Bupa Health Insurance', 'MAXBUPA', 'Cashless', '1800-102-4488', 'online.query@maxbupa.com', 'https://www.maxbupa.com', true, 7, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Bajaj Allianz', 'BAJAJ', 'Both', '1800-209-0144', 'bagichelp@bajajallianz.co.in', 'https://www.bajajallianz.com', true, 8, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Religare Health Insurance', 'RHI', 'Both', '1800-103-4488', 'care@religarehi.com', 'https://www.religarehealthinsurance.com', true, 9, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'New India Assurance', 'NIA', 'Mediclaim', '1800-209-1415', 'customer.niac@newindia.co.in', 'https://www.newindia.co.in', true, 10, NOW(), NOW(), v_user_id, v_user_id)
    ON CONFLICT (tenant_id, provider_code) DO NOTHING;
    
    -- =====================================================================
    -- 2. TPA Providers (7 providers)
    -- =====================================================================
    INSERT INTO tpa_providers (id, tenant_id, tpa_name, tpa_code, helpline_number, contact_email, website_url, is_active, display_order, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Medi Assist', 'MEDI', '1800-102-4477', 'care@mediassist.in', 'https://www.mediassist.in', true, 1, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Vidal Health TPA', 'VIDAL', '1800-425-2255', 'customercare@vidalhealth.com', 'https://www.vidalhealth.com', true, 2, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Paramount Health Services', 'PARAMOUNT', '1800-102-4474', 'info@paramounttpa.com', 'https://www.paramounttpa.com', true, 3, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Health India TPA', 'HITPA', '1800-103-1090', 'hitpacare@healthindiatpa.com', 'https://www.healthindiatpa.com', true, 4, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'MD India Healthcare Services', 'MDTPA', '1800-102-4414', 'customercare@mdindia.com', 'https://www.mdindia.com', true, 5, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Raksha TPA', 'RAKSHA', '1800-103-0088', 'service@rakshatpa.com', 'https://www.rakshatpa.com', true, 6, NOW(), NOW(), v_user_id, v_user_id),
        (gen_random_uuid(), v_tenant_id, 'Park Mediclaim TPA', 'PARK', '1800-102-5699', 'help@parkmediclaim.com', 'https://www.parkmediclaim.com', true, 7, NOW(), NOW(), v_user_id, v_user_id)
    ON CONFLICT (tenant_id, tpa_code) DO NOTHING;
    
    -- =====================================================================
    -- 3. Surgery Types (15 types)
    -- =====================================================================
    INSERT INTO surgery_types (id, tenant_id, surgery_name, surgery_code, surgery_category, estimated_cost_min, estimated_cost_max, procedure_details, requires_hospitalization, display_order, created_at, updated_at, created_by_user_id, updated_by_user_id, status)
    VALUES
        -- Cataract Surgeries
        (gen_random_uuid(), v_tenant_id, 'Phacoemulsification with IOL', 'PHACO', 'Cataract', 25000, 150000, 'Modern cataract surgery with ultrasound and foldable IOL implant', true, 1, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'ECCE (Extracapsular Cataract Extraction)', 'ECCE', 'Cataract', 15000, 50000, 'Manual cataract extraction with rigid IOL', true, 2, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'SICS (Small Incision Cataract Surgery)', 'SICS', 'Cataract', 20000, 60000, 'Manual small incision technique with foldable IOL', true, 3, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        -- Glaucoma Surgeries
        (gen_random_uuid(), v_tenant_id, 'Trabeculectomy', 'TRAB', 'Glaucoma', 40000, 80000, 'Surgical creation of drainage pathway for IOP reduction', true, 4, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Ahmed Glaucoma Valve', 'AHMED', 'Glaucoma', 80000, 150000, 'Implantation of drainage device for refractory glaucoma', true, 5, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        -- Retina Surgeries
        (gen_random_uuid(), v_tenant_id, 'Vitrectomy', 'VIT', 'Retina', 70000, 200000, 'Removal of vitreous gel for retinal pathology', true, 6, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Scleral Buckle for RD', 'BUCKLE', 'Retina', 60000, 120000, 'External support for retinal detachment repair', true, 7, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        -- Refractive Surgeries
        (gen_random_uuid(), v_tenant_id, 'LASIK', 'LASIK', 'Refractive', 40000, 100000, 'Laser vision correction for refractive errors', false, 8, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'PRK (Photorefractive Keratectomy)', 'PRK', 'Refractive', 35000, 80000, 'Surface ablation laser vision correction', false, 9, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        -- Cornea Surgeries
        (gen_random_uuid(), v_tenant_id, 'Penetrating Keratoplasty (PKP)', 'PKP', 'Cornea', 80000, 150000, 'Full thickness corneal transplant', true, 10, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'DSEK/DMEK', 'DSEK', 'Cornea', 100000, 200000, 'Endothelial keratoplasty (partial corneal transplant)', true, 11, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        -- Other Surgeries
        (gen_random_uuid(), v_tenant_id, 'Squint Surgery', 'SQUINT', 'Strabismus', 30000, 70000, 'Extraocular muscle surgery for eye alignment', true, 12, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'DCR (Dacryocystorhinostomy)', 'DCR', 'Oculoplasty', 35000, 60000, 'Tear duct drainage surgery', true, 13, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Pterygium Excision', 'PTERYG', 'External', 15000, 40000, 'Removal of conjunctival growth', false, 14, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Evisceration/Enucleation', 'EVIS', 'Oculoplasty', 40000, 80000, 'Removal of eye contents or globe', true, 15, NOW(), NOW(), v_user_id, v_user_id, 'active')
    ON CONFLICT (tenant_id, surgery_code) DO NOTHING;
    
    -- =====================================================================
    -- 4. Anesthesia Types (5 types)
    -- =====================================================================
    INSERT INTO anesthesia_types (id, tenant_id, anesthesia_name, anesthesia_code, anesthesia_category, additional_cost, procedure_notes, display_order, created_at, updated_at, created_by_user_id, updated_by_user_id, status)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Topical Anesthesia', 'TOPICAL', 'Local', 500, 'Eye drops only, patient fully conscious', 1, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Peribulbar Block', 'PERIBULBAR', 'Regional', 2000, 'Injection around the eye, akinesia achieved', 2, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Retrobulbar Block', 'RETROBULBAR', 'Regional', 2000, 'Injection behind the eye, muscle paralysis', 3, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Sub-Tenon''s Block', 'SUBTENONS', 'Regional', 1500, 'Cannula under conjunctiva, painless technique', 4, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'General Anesthesia', 'GA', 'General', 10000, 'Full sedation, requires anesthetist and monitoring', 5, NOW(), NOW(), v_user_id, v_user_id, 'active')
    ON CONFLICT (tenant_id, anesthesia_code) DO NOTHING;
    
    -- =====================================================================
    -- 5. Government Schemes (6 schemes)
    -- =====================================================================
    INSERT INTO government_schemes (id, tenant_id, scheme_name, scheme_code, scheme_type, coverage_limit, eligibility_criteria, application_process, is_active, display_order, created_at, updated_at, created_by_user_id, updated_by_user_id, status)
    VALUES
        (gen_random_uuid(), v_tenant_id, 'Pradhan Mantri Jan Arogya Yojana (PMJAY)', 'PMJAY', 'Central', 500000, 'BPL families, 10.74 crore households', 'Aadhar-based verification via hospitals', true, 1, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Employees State Insurance (ESI)', 'ESI', 'Central', NULL, 'Employees earning up to ₹21,000/month', 'ESI card required, issued by employer', true, 2, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Central Government Health Scheme (CGHS)', 'CGHS', 'Central', NULL, 'Central government employees and pensioners', 'CGHS card required, empanelled hospitals', true, 3, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Arograshree (Karnataka)', 'AROGRASHREE', 'State', 200000, 'Karnataka BPL families', 'District hospital verification', true, 4, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Ex-Servicemen Contributory Health Scheme (ECHS)', 'ECHS', 'Central', NULL, 'Ex-servicemen and dependents', 'ECHS card verification', true, 5, NOW(), NOW(), v_user_id, v_user_id, 'active'),
        (gen_random_uuid(), v_tenant_id, 'Economically Weaker Section (EWS)', 'EWS', 'State', 100000, 'State-specific EWS families', 'Income certificate and EWS card', true, 6, NOW(), NOW(), v_user_id, v_user_id, 'active')
    ON CONFLICT (tenant_id, scheme_code) DO NOTHING;
    
END $$;

-- =====================================================================
-- Verification Query
-- =====================================================================
SELECT 'Insurance Providers' AS table_name, COUNT(*) AS row_count FROM insurance_providers
UNION ALL
SELECT 'TPA Providers', COUNT(*) FROM tpa_providers
UNION ALL
SELECT 'Surgery Types', COUNT(*) FROM surgery_types
UNION ALL
SELECT 'Anesthesia Types', COUNT(*) FROM anesthesia_types
UNION ALL
SELECT 'Government Schemes', COUNT(*) FROM government_schemes;
