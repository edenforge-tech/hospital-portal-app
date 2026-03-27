-- Seed Data for Master Data Tables (Corrected)
-- Run after 50_master_data_tables.sql

DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
BEGIN
    -- Get default tenant and admin user
    SELECT id INTO v_tenant_id FROM tenant WHERE name = 'Arogya Eye Hospital' LIMIT 1;
    SELECT id INTO v_user_id FROM users WHERE email = 'admin@test.com' LIMIT 1;

    IF v_tenant_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Seed Insurance Providers
        INSERT INTO insurance_providers (tenant_id, provider_name, provider_code, provider_type, contact_number, contact_email, is_active, display_order, created_by_user_id, updated_by_user_id) VALUES
        (v_tenant_id, 'Star Health Insurance', 'STAR', 'Both', '1800-425-2255', 'support@starhealth.in', true, 1, v_user_id, v_user_id),
        (v_tenant_id, 'HDFC ERGO Health Insurance', 'HDFC_ERGO', 'Both', '1800-266-9655', 'customersupport@hdfcergo.com', true, 2, v_user_id, v_user_id),
        (v_tenant_id, 'ICICI Lombard Health Insurance', 'ICICI_LOMBARD', 'Both', '1800-266-7766', 'customersupport@icicilombard.com', true, 3, v_user_id, v_user_id),
        (v_tenant_id, 'National Insurance Company', 'NATIONAL', 'Both', '1800-200-7710', 'customercare@nic.co.in', true, 4, v_user_id, v_user_id),
        (v_tenant_id, 'United India Insurance', 'UNITED_INDIA', 'Both', '1800-425-4414', 'customercare@uiic.co.in', true, 5, v_user_id, v_user_id),
        (v_tenant_id, 'Care Health Insurance', 'CARE_HEALTH', 'Both', '1800-102-4488', 'support@careinsurance.com', true, 6, v_user_id, v_user_id),
        (v_tenant_id, 'Max Bupa Health Insurance', 'MAX_BUPA', 'Cashless', '1800-102-4071', 'customer.care@maxbupa.com', true, 7, v_user_id, v_user_id),
        (v_tenant_id, 'Bajaj Allianz Health Insurance', 'BAJAJ_ALLIANZ', 'Both', '1800-209-5858', 'bagichelp@bajajallianz.co.in', true, 8, v_user_id, v_user_id),
        (v_tenant_id, 'Religare Health Insurance', 'RELIGARE', 'Both', '1800-103-4488', 'care@religare.com', true, 9, v_user_id, v_user_id),
        (v_tenant_id, 'New India Assurance', 'NEW_INDIA', 'Both', '1800-209-1415', 'niccare@newindia.co.in', true, 10, v_user_id, v_user_id)
        ON CONFLICT (tenant_id, provider_code) DO NOTHING;

        -- Seed TPA Providers
        INSERT INTO tpa_providers (tenant_id, tpa_name, tpa_code, contact_number, contact_email, helpline_number, is_active, display_order, created_by_user_id, updated_by_user_id) VALUES
        (v_tenant_id, 'Medi Assist Insurance TPA', 'MEDI_ASSIST', '1800-102-0627', 'support@mediassist.in', '080-6666-6666', true, 1, v_user_id, v_user_id),
        (v_tenant_id, 'Vidal Health TPA', 'VIDAL_HEALTH', '1800-425-8424', 'customercare@vidalhealth.com', '044-4567-8901', true, 2, v_user_id, v_user_id),
        (v_tenant_id, 'Paramount Health Services TPA', 'PARAMOUNT', '1800-419-8181', 'info@paramounttpa.com', '022-6666-7777', true, 3, v_user_id, v_user_id),
        (v_tenant_id, 'Health India TPA Services', 'HEALTH_INDIA', '1800-180-2000', 'customercare@healthindiatpa.com', '011-4567-8901', true, 4, v_user_id, v_user_id),
        (v_tenant_id, 'MD India Healthcare Services TPA', 'MD_INDIA', '1800-266-0018', 'support@mdindia.com', '080-4567-8901', true, 5, v_user_id, v_user_id),
        (v_tenant_id, 'Raksha TPA', 'RAKSHA', '1800-123-4000', 'customercare@rakshatpa.com', '044-2345-6789', true, 6, v_user_id, v_user_id),
        (v_tenant_id, 'Park Mediclaim Insurance TPA', 'PARK', '1800-102-7510', 'support@parktpa.com', '080-2345-6789', true, 7, v_user_id, v_user_id)
        ON CONFLICT (tenant_id, tpa_code) DO NOTHING;

        -- Seed Surgery Types
        INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, typical_duration_minutes, requires_admission, typical_admission_type, estimated_cost_min, estimated_cost_max, description, risks, is_active, display_order, created_by_user_id, updated_by_user_id) VALUES
        (v_tenant_id, 'Cataract Surgery - Phacoemulsification with IOL', 'PHACO_IOL', 'Cataract', 'Phacoemulsification', 30, true, 'DayCare', 25000, 150000, 'Modern cataract surgery using ultrasound to break up lens', 'Infection, bleeding, retinal detachment, posterior capsule rupture', true, 1, v_user_id, v_user_id),
        (v_tenant_id, 'Cataract Surgery - ECCE with IOL', 'ECCE_IOL', 'Cataract', 'Extracapsular', 45, true, 'DayCare', 15000, 50000, 'Traditional cataract extraction through larger incision', 'Infection, inflammation, astigmatism, posterior capsule opacification', true, 2, v_user_id, v_user_id),
        (v_tenant_id, 'Cataract Surgery - SICS with IOL', 'SICS_IOL', 'Cataract', 'Small Incision', 30, true, 'DayCare', 20000, 60000, 'Manual cataract surgery with small incision technique', 'Infection, corneal edema, wound leak', true, 3, v_user_id, v_user_id),
        (v_tenant_id, 'Glaucoma Surgery - Trabeculectomy', 'TRAB', 'Glaucoma', 'Trabeculectomy', 60, true, 'IPD', 40000, 80000, 'Creates drainage pathway to reduce intraocular pressure', 'Hypotony, infection, bleb failure, cataract formation', true, 4, v_user_id, v_user_id),
        (v_tenant_id, 'Glaucoma Surgery - Ahmed Valve Implant', 'AHMED_VALVE', 'Glaucoma', 'Tube Shunt', 90, true, 'IPD', 80000, 150000, 'Drainage device implantation for refractory glaucoma', 'Tube exposure, diplopia, corneal decompensation', true, 5, v_user_id, v_user_id),
        (v_tenant_id, 'Vitrectomy - Pars Plana', 'PPV', 'Retina', 'Vitrectomy', 90, true, 'IPD', 70000, 200000, 'Removal of vitreous gel for retinal conditions', 'Retinal detachment, cataract, infection, bleeding', true, 6, v_user_id, v_user_id),
        (v_tenant_id, 'Retinal Detachment Repair - Scleral Buckle', 'SB_RD', 'Retina', 'Scleral Buckle', 120, true, 'IPD', 60000, 120000, 'External approach to retinal detachment repair', 'Double vision, infection, redetachment', true, 7, v_user_id, v_user_id),
        (v_tenant_id, 'LASIK - Laser Vision Correction', 'LASIK', 'Refractive', 'Laser Refractive', 20, false, NULL, 40000, 100000, 'Corneal reshaping for myopia/hyperopia/astigmatism', 'Dry eye, under/overcorrection, flap complications', true, 8, v_user_id, v_user_id),
        (v_tenant_id, 'PRK - Photorefractive Keratectomy', 'PRK', 'Refractive', 'Laser Refractive', 15, false, NULL, 35000, 80000, 'Surface laser correction without flap creation', 'Haze, slow visual recovery, infection', true, 9, v_user_id, v_user_id),
        (v_tenant_id, 'Corneal Transplant - Penetrating Keratoplasty', 'PKP', 'Cornea', 'Full Thickness', 90, true, 'IPD', 80000, 150000, 'Full thickness corneal transplant', 'Rejection, infection, astigmatism, graft failure', true, 10, v_user_id, v_user_id),
        (v_tenant_id, 'Corneal Transplant - DSEK/DMEK', 'DSEK_DMEK', 'Cornea', 'Endothelial', 60, true, 'IPD', 100000, 200000, 'Selective endothelial transplant', 'Rejection, graft detachment, donor failure', true, 11, v_user_id, v_user_id),
        (v_tenant_id, 'Squint Surgery - Single Muscle', 'SQUINT_1M', 'Strabismus', 'Strabismus Correction', 45, true, 'DayCare', 25000, 50000, 'Corrective surgery for eye alignment', 'Under/overcorrection, infection, diplopia', true, 12, v_user_id, v_user_id),
        (v_tenant_id, 'DCR - Dacryocystorhinostomy', 'DCR', 'Oculoplasty', 'Lacrimal Surgery', 60, true, 'DayCare', 30000, 60000, 'Create bypass for blocked tear duct', 'Bleeding, scarring, failure', true, 13, v_user_id, v_user_id),
        (v_tenant_id, 'Pterygium Excision with Conjunctival Autograft', 'PTERYG_GRAFT', 'General', 'Pterygium Surgery', 30, false, NULL, 15000, 35000, 'Removal of pterygium with tissue graft', 'Recurrence, scarring, infection', true, 14, v_user_id, v_user_id),
        (v_tenant_id, 'Evisceration/Enucleation', 'EVISC_ENUC', 'Oculoplasty', 'Eye Removal', 60, true, 'IPD', 40000, 80000, 'Removal of eye contents or entire globe', 'Bleeding, infection, socket contracture, implant extrusion', true, 15, v_user_id, v_user_id)
        ON CONFLICT (tenant_id, surgery_code) DO NOTHING;

        -- Seed Anesthesia Types
        INSERT INTO anesthesia_types (tenant_id, anesthesia_name, anesthesia_code, anesthesia_category, description, typical_duration_minutes, recovery_time_minutes, additional_cost, contraindications, is_active, display_order, created_by_user_id, updated_by_user_id) VALUES
        (v_tenant_id, 'Topical Anesthesia (Eye Drops)', 'TOPICAL', 'Topical', 'Anesthetic eye drops applied to corneal surface', 5, 10, 500, 'Allergy to topical anesthetics, uncooperative patient', true, 1, v_user_id, v_user_id),
        (v_tenant_id, 'Peribulbar Block', 'PERIBULBAR', 'Regional', 'Injection around the eye for regional anesthesia', 15, 30, 2000, 'Bleeding disorders, anticoagulant therapy, axial myopia', true, 2, v_user_id, v_user_id),
        (v_tenant_id, 'Retrobulbar Block', 'RETROBULBAR', 'Regional', 'Injection behind the eye into muscle cone', 15, 30, 2000, 'High myopia, bleeding disorders, previous scleral buckle', true, 3, v_user_id, v_user_id),
        (v_tenant_id, 'Sub-Tenon''s Anesthesia', 'SUB_TENON', 'Regional', 'Injection under Tenon''s capsule for local anesthesia', 10, 20, 1500, 'Previous squint surgery, conjunctival scarring', true, 4, v_user_id, v_user_id),
        (v_tenant_id, 'General Anesthesia', 'GA', 'General', 'Full body anesthesia with airway management', 45, 120, 10000, 'Recent MI, uncontrolled hypertension, severe respiratory disease', true, 5, v_user_id, v_user_id)
        ON CONFLICT (tenant_id, anesthesia_code) DO NOTHING;

        -- Seed Government Schemes
        INSERT INTO government_schemes (tenant_id, scheme_name, scheme_code, scheme_type, implementing_authority, scheme_description, eligibility_criteria, max_coverage_amount, requires_beneficiary_id, beneficiary_id_type, helpline_number, is_active, effective_from, display_order, created_by_user_id, updated_by_user_id) VALUES
        (v_tenant_id, 'Ayushman Bharat - PMJAY', 'PMJAY', 'Central', 'National Health Authority', 'Pradhan Mantri Jan Arogya Yojana providing health cover to poor families', 'BPL families, priority households, occupational category workers', 500000, true, 'Ayushman Card Number', '14555', true, '2018-09-23', 1, v_user_id, v_user_id),
        (v_tenant_id, 'ESI Scheme', 'ESI', 'Central', 'Employees State Insurance Corporation', 'Social security scheme for employees earning up to Rs. 21,000/month', 'Employees earning ≤ Rs. 21,000/month in covered establishments', 0, true, 'ESI Number', '1800-123-4000', true, '1952-01-01', 2, v_user_id, v_user_id),
        (v_tenant_id, 'CGHS - Central Government Health Scheme', 'CGHS', 'Central', 'Ministry of Health and Family Welfare', 'Comprehensive health care for Central Government employees', 'Central Government employees, pensioners, and dependents', 0, true, 'CGHS Card Number', '1800-180-5233', true, '1954-01-01', 3, v_user_id, v_user_id),
        (v_tenant_id, 'Arogya Karnataka (State Scheme)', 'AROGRASHREE', 'State', 'Karnataka Health Department', 'Karnataka state health scheme for BPL families', 'BPL card holders in Karnataka', 200000, true, 'Arogya Karnataka Card', '080-2222-3333', true, '2018-01-01', 4, v_user_id, v_user_id),
        (v_tenant_id, 'ECHS - Ex-Servicemen Health Scheme', 'ECHS', 'Central', 'Ministry of Defence', 'Healthcare scheme for ex-servicemen and dependents', 'Ex-servicemen, war widows, and authorized dependents', 0, true, 'ECHS Card Number', '1800-102-1098', true, '2003-04-01', 5, v_user_id, v_user_id),
        (v_tenant_id, 'EWS - Economically Weaker Section', 'EWS', 'State', 'State Health Department', 'Free/subsidized healthcare for economically weaker sections', 'Income < Rs. 3 lakhs/year, no regular employment', 100000, false, NULL, '1800-425-8585', true, '2020-01-01', 6, v_user_id, v_user_id)
        ON CONFLICT (tenant_id, scheme_code) DO NOTHING;

        RAISE NOTICE 'Master data seeded successfully for tenant: %', v_tenant_id;
    ELSE
        RAISE NOTICE 'Default tenant or admin user not found. Tenant ID: %, User ID: %', v_tenant_id, v_user_id;
    END IF;
END $$;

-- Verification
SELECT 'Insurance Providers' as table_name, COUNT(*) as row_count FROM insurance_providers WHERE deleted_at IS NULL
UNION ALL
SELECT 'TPA Providers', COUNT(*) FROM tpa_providers WHERE deleted_at IS NULL
UNION ALL
SELECT 'Surgery Types', COUNT(*) FROM surgery_types WHERE deleted_at IS NULL
UNION ALL
SELECT 'Anesthesia Types', COUNT(*) FROM anesthesia_types WHERE deleted_at IS NULL
UNION ALL
SELECT 'Government Schemes', COUNT(*) FROM government_schemes WHERE deleted_at IS NULL;
