-- =====================================================
-- SURGERY TYPES SEED DATA
-- Purpose: Populate surgery catalog with hospital tariff pricing
-- Data Source: Hospital tariff documents (Feb 2026)
-- Created: 2026-02-25
-- Note: Replace {{TENANT_ID}} with actual tenant UUID before execution
-- =====================================================

-- Get current tenant ID (for local execution)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' AND deleted_at IS NULL LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please create a tenant first.';
    END IF;
    
    PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
END $$;

-- Update existing Phacoemulsification record if exists, otherwise insert
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

-- RETINA PROCEDURES
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
    'Local',
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
    'Local',
),
-- Intravitreal injections
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection - IVTA',
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
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Razumab (Anti-VEGF)',
    'RETINA-IVT-RAZUMAB',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    25000.00,
    'Per Eye',
    25000,
    25000,
    24,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Accentrix (Anti-VEGF)',
    'RETINA-IVT-ACCENTRIX',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    25,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Paganex (Anti-VEGF)',
    'RETINA-IVT-PAGANEX',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    45000.00,
    'Per Eye',
    45000,
    45000,
    26,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Ozurdex (Steroid Implant)',
    'RETINA-IVT-OZURDEX',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    45000.00,
    'Per Eye',
    45000,
    45000,
    27,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Eylea (Anti-VEGF)',
    'RETINA-IVT-EYLEA',
    'Retina',
    'Injection',
    10,
    FALSE,
    FALSE,
    75000.00,
    'Per Eye',
    75000,
    75000,
    28,
    'Topical',
),

-- GLAUCOMA PROCEDURES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Trabeculectomy With MMC',
    'GLAUCOMA-TRAB-MMC',
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
    'Local',
),

-- OCULOPLASTY PROCEDURES
(
    current_setting('app.seed_tenant_id')::UUID,
    'DCR (Dacryocystorhinostomy)',
    'OCULOPLASTY-DCR',
    'Oculoplasty',
    'Surgical',
    45,
    FALSE,
    FALSE,
    50000.00,
    'Per Eye',
    50000,
    50000,
    40,
    'Local',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DCT (Dacryocystectomy)',
    'OCULOPLASTY-DCT',
    'Oculoplasty',
    'Surgical',
    30,
    FALSE,
    FALSE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    41,
    'Local',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Ptosis Surgery',
    'OCULOPLASTY-PTOSIS',
    'Oculoplasty',
    'Surgical',
    45,
    FALSE,
    FALSE,
    35000.00,
    'Per Eye',
    35000,
    35000,
    42,
    'Local',
),

-- SQUINT SURGERY
(
    current_setting('app.seed_tenant_id')::UUID,
    'Squint Surgery (Per Muscle)',
    'SQUINT-PERMUSCLE',
    'Strabismus',
    'Surgical',
    30,
    FALSE,
    FALSE,
    30000.00,
    'Per Muscle',
    30000,
    30000,
    50,
    'General',
),

-- CORNEAL PROCEDURES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Corneal Tatooing',
    'CORNEAL-TATTOO',
    'Cornea',
    'Surgical',
    20,
    FALSE,
    FALSE,
    45000.00,
    'Per Eye',
    45000,
    45000,
    60,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Penetrating Keratoplasty',
    'CORNEAL-PKP',
    'Cornea',
    'Surgical',
    90,
    TRUE,
    FALSE,
    80000.00,
    'Per Eye',
    80000,
    80000,
    61,
    'Local',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Pterygium Excision',
    'CORNEAL-PTERYG',
    'Cornea',
    'Surgical',
    30,
    FALSE,
    FALSE,
    20000.00,
    'Per Eye',
    20000,
    20000,
    62,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Pterygium Excision with CAG Pterygium',
    'CORNEAL-PTERYG-CAG',
    'Cornea',
    'Surgical',
    45,
    FALSE,
    FALSE,
    30000.00,
    'Per Eye',
    30000,
    30000,
    63,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'General Anaesthesia extra for any procedure',
    'ANESTHESIA-GENERAL-EXTRA',
    'General',
    'Anesthesia',
    0,
    FALSE,
    FALSE,
    10000.00,
    'Per Procedure',
    10000,
    10000,
    64,
    'General',
),

-- KERATOCONUS (C3R - Corneal Collagen Cross-Linking)
(
    current_setting('app.seed_tenant_id')::UUID,
    'C3R Isotonic',
    'CORNEAL-C3R-ISO',
    'Cornea',
    'Crosslinking',
    45,
    FALSE,
    FALSE,
    45000.00,
    'Per Eye',
    45000,
    45000,
    70,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'C3R Hypotonic',
    'CORNEAL-C3R-HYPO',
    'Cornea',
    'Crosslinking',
    45,
    FALSE,
    FALSE,
    55000.00,
    'Per Eye',
    55000,
    55000,
    71,
    'Topical',
),

-- LASIK/REFRACTIVE PROCEDURES (Both Eyes pricing)
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Standard',
    'LASIK-PRK-STD',
    'Refractive',
    'Laser',
    15,
    FALSE,
    FALSE,
    35000.00,
    'Both Eyes',
    35000,
    35000,
    80,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Customized',
    'LASIK-PRK-CUSTOM',
    'Refractive',
    'Laser',
    15,
    FALSE,
    FALSE,
    65000.00,
    'Both Eyes',
    65000,
    65000,
    81,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Contoura',
    'LASIK-PRK-CONTOURA',
    'Refractive',
    'Laser',
    15,
    FALSE,
    FALSE,
    95000.00,
    'Both Eyes',
    95000,
    95000,
    82,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Wavelight Plus',
    'LASIK-PRK-WAVELIGHT',
    'Refractive',
    'Laser',
    15,
    FALSE,
    FALSE,
    150000.00,
    'Both Eyes',
    150000,
    150000,
    83,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto Lasik + Customized',
    'LASIK-FEMTO-CUSTOM',
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
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto Lasik + Contoura',
    'LASIK-FEMTO-CONTOURA',
    'Refractive',
    'Laser',
    20,
    FALSE,
    FALSE,
    120000.00,
    'Both Eyes',
    120000,
    120000,
    85,
    'Topical',
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto Lasik + Wavelight Plus',
    'LASIK-FEMTO-WAVELIGHT',
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
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID 
    AND surgery_category = 'Cataract';
    
    SELECT COUNT(*) INTO v_retina_count FROM surgery_types 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID 
    AND surgery_category = 'Retina';
    
    SELECT COUNT(*) INTO v_lasik_count FROM surgery_types 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID 
    AND surgery_category = 'Refractive';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SURGERY TYPES SEED COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Surgery Types: %', v_surgery_count;
    RAISE NOTICE '  - Cataract: %', v_cataract_count;
    RAISE NOTICE '  - Retina: %', v_retina_count;
    RAISE NOTICE '  - Refractive/LASIK: %', v_lasik_count;
    RAISE NOTICE '========================================';
END $$;
