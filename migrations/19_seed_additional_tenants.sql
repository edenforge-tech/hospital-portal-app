-- =============================================================================
-- SEED 5 ADDITIONAL TENANTS
-- =============================================================================

DO $$
DECLARE
    v_carefirst_id UUID;
    v_apollo_id UUID;
    v_fortis_id UUID;
    v_aiims_id UUID;
    v_gramin_id UUID;
    v_org_id UUID;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING 5 ADDITIONAL TENANTS';
    RAISE NOTICE '========================================';
    
    -- Get first organization for reference
    SELECT id INTO v_org_id FROM organization LIMIT 1;
    
    -- 1. CareFirst Clinic (Small Clinic)
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE tenant_code = 'CAREFIRST') THEN
        INSERT INTO tenant (
            id, name, tenant_code, company_email, company_phone,
            status, subscription_type, max_branches, max_users, is_active,
            primary_region, default_currency, hipaa_compliant, nabh_accredited, 
            gdpr_compliant, dpa_compliant, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), 'CareFirst Clinic', 'CAREFIRST', 
            'admin@carefirst.com', '+91-9876543210',
            'active', 'basic', 1, 25, true,
            'Karnataka', 'INR', true, false, false, false,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_carefirst_id;
        
        INSERT INTO branch (tenant_id, organization_id, name, branch_code, region, is_main_branch, latitude, longitude, total_beds, icu_beds, emergency_beds, status)
        VALUES (v_carefirst_id, COALESCE(v_org_id, v_carefirst_id), 'CareFirst Bangalore', 'CF-BLR-01', 'South', true, 12.9716, 77.5946, 15, 0, 3, 'Active');
        
        RAISE NOTICE '✓ CareFirst Clinic created: 1 branch, 15 beds';
    ELSE
        RAISE NOTICE '⊘ CareFirst Clinic already exists, skipping';
    END IF;
    
    -- 2. Apollo Healthcare Network (Large Network)
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE tenant_code = 'APOLLO') THEN
        INSERT INTO tenant (
            id, name, tenant_code, company_email, company_phone,
            status, subscription_type, max_branches, max_users, is_active,
            primary_region, default_currency, hipaa_compliant, nabh_accredited,
            gdpr_compliant, dpa_compliant, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), 'Apollo Healthcare Network', 'APOLLO',
            'admin@apollohospitals.com', '+91-9999888877',
            'active', 'enterprise', 50, 500, true,
            'Tamil Nadu', 'INR', true, true, false, false,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_apollo_id;
        
        INSERT INTO branch (tenant_id, organization_id, name, branch_code, region, is_main_branch, latitude, longitude, total_beds, icu_beds, emergency_beds, status) VALUES
        (v_apollo_id, COALESCE(v_org_id, v_apollo_id), 'Apollo Chennai Greams Road', 'APL-CHN-01', 'South', true, 13.0569, 80.2506, 250, 40, 30, 'Active'),
        (v_apollo_id, COALESCE(v_org_id, v_apollo_id), 'Apollo Chennai OMR', 'APL-CHN-02', 'South', false, 12.9121, 80.2273, 150, 20, 15, 'Active'),
        (v_apollo_id, COALESCE(v_org_id, v_apollo_id), 'Apollo Chennai Vanagaram', 'APL-CHN-03', 'South', false, 13.1121, 80.1649, 100, 12, 10, 'Active'),
        (v_apollo_id, COALESCE(v_org_id, v_apollo_id), 'Apollo Bangalore', 'APL-BLR-01', 'South', false, 12.9141, 77.6101, 180, 25, 18, 'Active'),
        (v_apollo_id, COALESCE(v_org_id, v_apollo_id), 'Apollo Hyderabad', 'APL-HYD-01', 'South', false, 17.4126, 78.4406, 110, 15, 6, 'Active');
        
        RAISE NOTICE '✓ Apollo Healthcare Network created: 5 branches, 790 beds';
    ELSE
        RAISE NOTICE '⊘ Apollo Healthcare Network already exists, skipping';
    END IF;
    
    -- 3. Fortis Eye Institute (Specialized)
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE tenant_code = 'FORTIS_EYE') THEN
        INSERT INTO tenant (
            id, name, tenant_code, company_email, company_phone,
            status, subscription_type, max_branches, max_users, is_active,
            primary_region, default_currency, hipaa_compliant, nabh_accredited,
            gdpr_compliant, dpa_compliant, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), 'Fortis Eye Institute', 'FORTIS_EYE',
            'admin@fortiseye.com', '+91-8888777766',
            'active', 'professional', 5, 100, true,
            'NCR', 'INR', true, true, false, false,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_fortis_id;
        
        INSERT INTO branch (tenant_id, organization_id, name, branch_code, region, is_main_branch, latitude, longitude, total_beds, icu_beds, emergency_beds, status) VALUES
        (v_fortis_id, COALESCE(v_org_id, v_fortis_id), 'Fortis Eye Gurugram', 'FE-GGN-01', 'North', true, 28.4595, 77.0266, 50, 5, 5, 'Active'),
        (v_fortis_id, COALESCE(v_org_id, v_fortis_id), 'Fortis Eye Delhi', 'FE-DEL-01', 'North', false, 28.5355, 77.3910, 40, 4, 4, 'Active');
        
        RAISE NOTICE '✓ Fortis Eye Institute created: 2 branches, 90 beds';
    ELSE
        RAISE NOTICE '⊘ Fortis Eye Institute already exists, skipping';
    END IF;
    
    -- 4. AIIMS Teaching Hospital (Academic)
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE tenant_code = 'AIIMS') THEN
        INSERT INTO tenant (
            id, name, tenant_code, company_email, company_phone,
            status, subscription_type, max_branches, max_users, is_active,
            primary_region, default_currency, hipaa_compliant, nabh_accredited,
            gdpr_compliant, dpa_compliant, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), 'AIIMS Teaching Hospital', 'AIIMS',
            'admin@aiims.edu', '+91-11-26588500',
            'active', 'enterprise', 10, 750, true,
            'Delhi', 'INR', true, true, false, false,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_aiims_id;
        
        INSERT INTO branch (tenant_id, organization_id, name, branch_code, region, is_main_branch, latitude, longitude, total_beds, icu_beds, emergency_beds, status) VALUES
        (v_aiims_id, COALESCE(v_org_id, v_aiims_id), 'AIIMS Main Campus', 'AIIMS-DEL-01', 'North', true, 28.5672, 77.2100, 500, 80, 70, 'Active'),
        (v_aiims_id, COALESCE(v_org_id, v_aiims_id), 'AIIMS Trauma Center', 'AIIMS-DEL-02', 'North', false, 28.5682, 77.2110, 200, 40, 40, 'Active'),
        (v_aiims_id, COALESCE(v_org_id, v_aiims_id), 'AIIMS Research Block', 'AIIMS-DEL-03', 'North', false, 28.5662, 77.2090, 100, 20, 10, 'Active');
        
        RAISE NOTICE '✓ AIIMS Teaching Hospital created: 3 branches, 800 beds';
    ELSE
        RAISE NOTICE '⊘ AIIMS Teaching Hospital already exists, skipping';
    END IF;
    
    -- 5. Gramin Healthcare Trust (Rural)
    IF NOT EXISTS (SELECT 1 FROM tenant WHERE tenant_code = 'GRAMIN') THEN
        INSERT INTO tenant (
            id, name, tenant_code, company_email, company_phone,
            status, subscription_type, max_branches, max_users, is_active,
            primary_region, default_currency, hipaa_compliant, nabh_accredited,
            gdpr_compliant, dpa_compliant, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), 'Gramin Healthcare Trust', 'GRAMIN',
            'admin@graminhealthcare.org', '+91-7777666655',
            'active', 'basic', 3, 30, true,
            'Gujarat', 'INR', true, false, false, false,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_gramin_id;
        
        INSERT INTO branch (tenant_id, organization_id, name, branch_code, region, is_main_branch, latitude, longitude, total_beds, icu_beds, emergency_beds, status)
        VALUES (v_gramin_id, COALESCE(v_org_id, v_gramin_id), 'Gramin Health Center Anand', 'GHC-AND-01', 'West', true, 22.5645, 72.9289, 20, 0, 5, 'Active');
        
        RAISE NOTICE '✓ Gramin Healthcare Trust created: 1 branch, 20 beds';
    ELSE
        RAISE NOTICE '⊘ Gramin Healthcare Trust already exists, skipping';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TENANT SEEDING COMPLETE';
    RAISE NOTICE '========================================';
END $$;

-- Summary
SELECT 
    (SELECT COUNT(*) FROM tenant) as total_tenants,
    (SELECT COUNT(*) FROM branch) as total_branches,
    (SELECT SUM(total_beds) FROM branch) as total_beds;
