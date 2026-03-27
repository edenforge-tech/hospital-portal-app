-- ========================================
-- SURGERY TYPES SEED DATA - COMPLETE VERSION
-- Hospital Portal - Counselor Module
-- ========================================
-- All 35+ procedures with hospital tariff pricing

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get first active tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE is_active = TRUE AND deleted_at IS NULL LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please create a tenant first.';
    END IF;
    
    PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
END $$;

-- ========================================
-- CATARACT PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type, typical_iol_types
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS)',
    'CATARACT-PHACO-MICS',
    'Cataract',
    'Surgical',
    30,
    FALSE,
    TRUE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    1,
    'Topical',
    'Monofocal,Multifocal,Trifocal,EDOF,Toric'
)
ON CONFLICT (procedure_code) DO UPDATE
SET default_price = 35000, requires_iol = TRUE, typical_iol_types = 'Monofocal,Multifocal,Trifocal,EDOF,Toric';

-- ========================================
-- RETINA PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type
) VALUES
-- Vitrectomy procedures
(
    current_setting('app.seed_tenant_id')::UUID,
    'Vitrectomy 20g (With Suture)',
    'RETINA-VIT-20G',
    'Retina',
    'Surgical',
    90,
    TRUE,
    FALSE,
    65000.00,
    'Per Eye',
    65000,
    65000,
    20,
    'Local'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Vitrectomy 23g (Sutureless)',
    'RETINA-VIT-23G',
    'Retina',
    'Surgical',
    75,
    TRUE,
    FALSE,
    85000.00,
    'Per Eye',
    85000,
    85000,
    21,
    'Local'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Vitrectomy 25g (Sutureless with disposable kit)',
    'RETINA-VIT-25G',
    'Retina',
    'Surgical',
    70,
    TRUE,
    FALSE,
    120000.00,
    'Per Eye',
    120000,
    120000,
    22,
    'Local'
),
-- Intravitreal injections
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection - IVTA (Triamcinolone)',
    'RETINA-IVTA',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    10000.00,
    'Per Eye',
    10000,
    10000,
    23,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection - Anti-VEGF (Avastin)',
    'RETINA-AVASTIN',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    15000.00,
    'Per Eye',
    15000,
    15000,
    24,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection - Anti-VEGF (Accentrix/Razumab)',
    'RETINA-ACCENTRIX',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    20000.00,
    'Per Eye',
    20000,
    20000,
    25,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection - Anti-VEGF (Lucentis)',
    'RETINA-LUCENTIS',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    40000.00,
    'Per Eye',
    40000,
    40000,
    26,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection - Anti-VEGF (Eylea)',
    'RETINA-EYLEA',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    75000.00,
    'Per Eye',
    75000,
    75000,
    27,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Retinal Laser Photocoagulation',
    'RETINA-LASER',
    'Retina',
    'Laser',
    30,
    FALSE,
    FALSE,
    15000.00,
    'Per Eye',
    15000,
    15000,
    28,
    'Topical'
)
ON CONFLICT (procedure_code) DO NOTHING;

-- ========================================
-- GLAUCOMA PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Trabeculectomy',
    'GLAUCOMA-TRAB',
    'Glaucoma',
    'Surgical',
    60,
    FALSE,
    FALSE,
    40000.00,
    'Per Eye',
    40000,
    40000,
    30,
    'Local'
)
ON CONFLICT (procedure_code) DO NOTHING;

-- ========================================
-- OCULOPLASTY PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'DCR (Dacryocystorhinostomy)',
    'OCULOPLASTY-DCR',
    'Oculoplasty',
    'Surgical',
    90,
    FALSE,
    FALSE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    40,
    'General'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DCT (Dacryocystectomy)',
    'OCULOPLASTY-DCT',
    'Oculoplasty',
    'Surgical',
    60,
    FALSE,
    FALSE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    41,
    'Local'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Ptosis Surgery',
    'OCULOPLASTY-PTOSIS',
    'Oculoplasty',
    'Surgical',
    60,
    FALSE,
    FALSE,
    50000.00,
    'Per Eye',
    50000,
    50000,
    42,
    'Local'
)
ON CONFLICT (procedure_code) DO NOTHING;

-- ========================================
-- SQUINT/STRABISMUS PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Squint Surgery (Per Muscle)',
    'SQUINT-MUSCLE',
    'Strabismus',
    'Surgical',
    45,
    FALSE,
    FALSE,
    30000.00,
    'Per Muscle',
    30000,
    30000,
    50,
    'General'
)
ON CONFLICT (procedure_code) DO NOTHING;

-- ========================================
-- CORNEAL PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Penetrating Keratoplasty (PK)',
    'CORNEA-PK',
    'Cornea',
    'Surgical',
    120,
    TRUE,
    FALSE,
    80000.00,
    'Per Eye',
    80000,
    80000,
    60,
    'General'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DALK (Deep Anterior Lamellar Keratoplasty)',
    'CORNEA-DALK',
    'Cornea',
    'Surgical',
    120,
    TRUE,
    FALSE,
    80000.00,
    'Per Eye',
    80000,
    80000,
    61,
    'General'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DSEK/DMEK',
    'CORNEA-DSEK',
    'Cornea',
    'Surgical',
    90,
    FALSE,
    FALSE,
    80000.00,
    'Per Eye',
    80000,
    80000,
    62,
    'Local'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Pterygium Excision with Conjunctival Autograft',
    'CORNEA-PTERYGIUM',
    'Cornea',
    'Surgical',
    45,
    FALSE,
    FALSE,
    20000.00,
    'Per Eye',
    20000,
    20000,
    63,
    'Local'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Corneal Collagen Cross-linking (C3R)',
    'CORNEA-C3R',
    'Cornea',
    'Laser',
    60,
    FALSE,
    FALSE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    64,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Amniotic Membrane Transplant',
    'CORNEA-AMT',
    'Cornea',
    'Surgical',
    30,
    FALSE,
    FALSE,
    25000.00,
    'Per Eye',
    25000,
    25000,
    65,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Intracorneal Ring Segments (ICRS)',
    'CORNEA-ICRS',
    'Cornea',
    'Surgical',
    30,
    FALSE,
    FALSE,
    50000.00,
    'Per Eye',
    50000,
    50000,
    66,
    'Topical'
)
ON CONFLICT (procedure_code) DO NOTHING;

-- ========================================
-- REFRACTIVE/LASIK PROCEDURES
-- ========================================
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    typical_duration_minutes, requires_admission, requires_iol, default_price,
    unit_of_measure, estimated_cost_min, estimated_cost_max, display_order,
    anesthesia_type
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK (Photorefractive Keratectomy)',
    'LASIK-PRK',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    35000.00,
    'Both Eyes',
    35000,
    35000,
    80,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'LASIK (Standard)',
    'LASIK-STANDARD',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    60000.00,
    'Both Eyes',
    60000,
    60000,
    81,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Bladeless LASIK (Femto LASIK)',
    'LASIK-FEMTO',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    90000.00,
    'Both Eyes',
    90000,
    90000,
    82,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Contoura Vision LASIK',
    'LASIK-CONTOURA',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    120000.00,
    'Both Eyes',
    120000,
    120000,
    83,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'TransPRK (No Touch LASIK)',
    'LASIK-TRANSPRK',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    100000.00,
    'Both Eyes',
    100000,
    100000,
    84,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'SMILE (Small Incision Lenticule Extraction)',
    'LASIK-SMILE',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    140000.00,
    'Both Eyes',
    140000,
    140000,
    85,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto Lasik (Bladeless)',
    'LASIK-FEMTO-BLADELESS',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    180000.00,
    'Both Eyes',
    180000,
    180000,
    86,
    'Topical'
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Smile Pro',
    'LASIK-SMILE-PRO',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    160000.00,
    'Both Eyes',
    160000,
    160000,
    87,
    'Topical'
)
ON CONFLICT (procedure_code) DO NOTHING;

-- Show summary
DO $$
DECLARE
    v_surgery_count INTEGER;
    v_cataract_count INTEGER;
    v_retina_count INTEGER;
    v_lasik_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_surgery_count FROM surgery_types 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID;
    
    SELECT COUNT(*) INTO v_cataract_count FROM surgery_types 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID AND surgery_category = 'Cataract';
    
    SELECT COUNT(*) INTO v_retina_count FROM surgery_types 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID AND surgery_category = 'Retina';
    
    SELECT COUNT(*) INTO v_lasik_count FROM surgery_types 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID AND surgery_category = 'Refractive';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SURGERY TYPES SEED COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Surgery Types: %', v_surgery_count;
    RAISE NOTICE '   - Cataract: %', v_cataract_count;
    RAISE NOTICE '   - Retina: %', v_retina_count;
    RAISE NOTICE '   - Refractive/LASIK: %', v_lasik_count;
    RAISE NOTICE '========================================';
END $$;
