-- ============================================================
-- SAI JYOTHI EYE HOSPITAL — SERVICE CATALOG UPDATE
-- Purpose: Replace generic seed data with exact tariff list
-- Source:  Sai Jyothi Tariff List (Sai Jyothi Eye Institute)
-- Run:     psql -h <host> -U postgres -d hospitalportal -f this_file.sql
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 1: Clear existing surgical variants + IOL data
--         (variant_iol_mapping CASCADE-deletes with service_variants)
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM variant_iol_mapping;
DELETE FROM service_variants
WHERE catalog_service_id IN (
    SELECT cs.id FROM catalog_services cs
    JOIN service_categories sc ON sc.id = cs.category_id
    WHERE sc.code IN (
        'CATARACT','PREMIUM_LENSES','LASIK','ICL','KERATOCONUS',
        'RETINA','GLAUCOMA','OCCULOPLASTY','SQUINT_CORNEA'
    )
);
DELETE FROM iol_master;

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 2: Ensure sub_options column exists (idempotent)
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE service_variants
    ADD COLUMN IF NOT EXISTS sub_options TEXT[] DEFAULT NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 3: Insert all variants + IOL master per Sai Jyothi tariff list
-- ──────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_svc_cataract  UUID; v_svc_premium  UUID; v_svc_lasik    UUID;
    v_svc_icl       UUID; v_svc_kc       UUID; v_svc_retina   UUID;
    v_svc_glaucoma  UUID; v_svc_oc       UUID; v_svc_sc       UUID;

    -- Variants that get IOL sub-dropdown
    v_var_mono_alciq    UUID;
    v_var_multi_imp     UUID;
    v_var_trif_imp      UUID;
    v_var_edof          UUID;

    -- IOL master IDs
    v_iol_alcon_iq   UUID; v_iol_tecnis     UUID; v_iol_clareon    UUID;
    v_iol_zeiss_mul  UUID; v_iol_jj_mul     UUID;
    v_iol_alcon_trif UUID; v_iol_zeiss_trif UUID; v_iol_ray_trif   UUID;
    v_iol_vivity     UUID; v_iol_puresee    UUID;
BEGIN

    -- resolve catalog_service IDs (one service row per category)
    SELECT cs.id INTO v_svc_cataract  FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='CATARACT';
    SELECT cs.id INTO v_svc_premium   FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='PREMIUM_LENSES';
    SELECT cs.id INTO v_svc_lasik     FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='LASIK';
    SELECT cs.id INTO v_svc_icl       FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='ICL';
    SELECT cs.id INTO v_svc_kc        FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='KERATOCONUS';
    SELECT cs.id INTO v_svc_retina    FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='RETINA';
    SELECT cs.id INTO v_svc_glaucoma  FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='GLAUCOMA';
    SELECT cs.id INTO v_svc_oc        FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='OCCULOPLASTY';
    SELECT cs.id INTO v_svc_sc        FROM catalog_services cs JOIN service_categories sc ON sc.id=cs.category_id WHERE sc.code='SQUINT_CORNEA';

    -- ────────────────────────────────────────────────────────
    -- CATARACT  (Monofocal range + SICS + Femto)
    -- Tariff: Monofocal Indian ₹35k, Alcon SP ₹40k, Alcon IQ/Tecnis/Clareon ₹50k,
    --         Pre-Load ₹55k, Eye Hance ₹60k, Toric ₹70k, SICS ₹25k, Femto ₹75k
    -- NOTE:  Names are source-of-truth per Sai Jyothi tariff list (no "Phaco +" prefix)
    --        sub_options = internal-only brand/type choices shown to staff only
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_cataract, 'Indian Monofocal Lens',                 'CAT-MONO-IND',     35000, 'PER_EYE', FALSE, 1, ARRAY['Supraphob', 'Premium']),
      (v_svc_cataract, 'Imported Monofocal Lens',              'CAT-MONO-ALCSP',   40000, 'PER_EYE', FALSE, 2, ARRAY['Alcon SP', 'Sensor 1']),
      (v_svc_cataract, 'Imported Monofocal Lens',              'CAT-MONO-ALCIQ',   50000, 'PER_EYE', TRUE,  3, ARRAY['Alcon IQ', 'Tecnis', 'Clareon']),
      (v_svc_cataract, 'Pre-Load Monofocal Lens',              'CAT-MONO-PRELOAD',  55000, 'PER_EYE', FALSE, 4, ARRAY['CT Lucia', 'Tecnis']),
      (v_svc_cataract, 'Eye Hance 60cm-Distance (EDOF Mono)',  'CAT-EYEHANCE',     60000, 'PER_EYE', FALSE, 5, NULL),
      (v_svc_cataract, 'Toric Monofocal',                      'CAT-TORIC-MONO',   70000, 'PER_EYE', FALSE, 6, NULL),
      (v_svc_cataract, 'SICS (Manual Small Incision Cataract Surgery)', 'CAT-SICS', 25000, 'PER_EYE', FALSE, 7, NULL),
      (v_svc_cataract, 'Femto Laser Cataract (LenSx)',         'CAT-FEMTO',        75000, 'PER_EYE', FALSE, 8, NULL);

    SELECT id INTO v_var_mono_alciq FROM service_variants WHERE variant_code = 'CAT-MONO-ALCIQ';

    -- ────────────────────────────────────────────────────────
    -- PREMIUM IOL PACKAGES
    -- Tariff: Indian Multifocal ₹60k, Imported Multifocal ₹95k, MF Toric ₹1.2L,
    --         Indian Trifocal ₹70k, Imported Trifocal ₹1.2L, Trif Toric ₹1.5L,
    --         EDOF Vivity/PureSee ₹1.2L, EDOF Toric ₹1.5L
    -- sub_options = internal brand choices (staff-only)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_premium, 'Indian Multifocal (33cm-Distance)',           'PREM-MULTI-IND',    60000, 'PER_EYE', FALSE, 1, NULL),
      (v_svc_premium, 'Imported Multifocal',                         'PREM-MULTI-IMP',    95000, 'PER_EYE', TRUE,  2, ARRAY['Zeiss', 'J&J']),
      (v_svc_premium, 'Multifocal Toric',                            'PREM-MULTI-TORIC', 120000, 'PER_EYE', FALSE, 3, ARRAY['Zeiss', 'J&J']),
      (v_svc_premium, 'Indian Trifocal (33cm-60cm Distance)',        'PREM-TRIF-IND',     70000, 'PER_EYE', FALSE, 4, NULL),
      (v_svc_premium, 'Imported Trifocal',                           'PREM-TRIF-IMP',    120000, 'PER_EYE', TRUE,  5, ARRAY['Zeiss', 'Alcon', 'J&J']),
      (v_svc_premium, 'Trifocal Toric',                              'PREM-TRIF-TORIC',  150000, 'PER_EYE', FALSE, 6, ARRAY['Zeiss', 'Alcon', 'J&J']),
      (v_svc_premium, 'EDOF Lens (40cm-Distance)',                   'PREM-EDOF',        120000, 'PER_EYE', TRUE,  7, ARRAY['Vivity', 'PureSee']),
      (v_svc_premium, 'EDOF Toric',                                 'PREM-EDOF-TORIC',  150000, 'PER_EYE', FALSE, 8, ARRAY['Vivity Toric', 'PureSee Toric']);

    SELECT id INTO v_var_multi_imp FROM service_variants WHERE variant_code = 'PREM-MULTI-IMP';
    SELECT id INTO v_var_trif_imp  FROM service_variants WHERE variant_code = 'PREM-TRIF-IMP';
    SELECT id INTO v_var_edof      FROM service_variants WHERE variant_code = 'PREM-EDOF';

    -- ────────────────────────────────────────────────────────
    -- LASIK  (exact Sai Jyothi tariff names + prices — all BOTH_EYES)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_lasik, 'PRK + Standard',             'LASIK-PRK-STD',      35000, 'BOTH_EYES', FALSE, 1, NULL),
      (v_svc_lasik, 'PRK + Customized',           'LASIK-PRK-CUST',     65000, 'BOTH_EYES', FALSE, 2, NULL),
      (v_svc_lasik, 'PRK + Contoura',             'LASIK-PRK-CONT',     95000, 'BOTH_EYES', FALSE, 3, NULL),
      (v_svc_lasik, 'PRK + Wavelight Plus',       'LASIK-PRK-WAVE',    150000, 'BOTH_EYES', FALSE, 4, NULL),
      (v_svc_lasik, 'Femto Lasik + Customized',   'LASIK-FEMTO-CUST',  100000, 'BOTH_EYES', FALSE, 5, NULL),
      (v_svc_lasik, 'Femto Lasik + Contoura',     'LASIK-FEMTO-CONT',  120000, 'BOTH_EYES', FALSE, 6, NULL),
      (v_svc_lasik, 'Femto Lasik + Wavelight Plus','LASIK-FEMTO-WAVE',  180000, 'BOTH_EYES', FALSE, 7, NULL),
      (v_svc_lasik, 'Smile Pro',                   'LASIK-SMILE',       160000, 'BOTH_EYES', FALSE, 8, NULL);

    -- ────────────────────────────────────────────────────────
    -- ICL  (Non-Toric + Toric · Indian + Imported · PER_EYE)
    -- Tariff: Non-Toric Indian ₹70k, Non-Toric Imported ₹90k,
    --         Toric Indian ₹90k, Toric Imported ₹1.2L
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_icl, 'Non-Toric ICL — Indian',   'ICL-NONTORIC-IND',  70000, 'PER_EYE', FALSE, 1, NULL),
      (v_svc_icl, 'Non-Toric ICL — Imported', 'ICL-NONTORIC-IMP',  90000, 'PER_EYE', FALSE, 2, NULL),
      (v_svc_icl, 'Toric ICL — Indian',        'ICL-TORIC-IND',     90000, 'PER_EYE', FALSE, 3, NULL),
      (v_svc_icl, 'Toric ICL — Imported',      'ICL-TORIC-IMP',    120000, 'PER_EYE', FALSE, 4, NULL);

    -- ────────────────────────────────────────────────────────
    -- KERATOCONUS  (C3R — exact tariff names)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_kc, 'Isotonic C3R (Cross-Linking)',  'KC-C3R-ISO',   45000, 'PER_EYE', FALSE, 1, NULL),
      (v_svc_kc, 'Hypotonic C3R (Cross-Linking)', 'KC-C3R-HYPO',  55000, 'PER_EYE', FALSE, 2, NULL);

    -- ────────────────────────────────────────────────────────
    -- RETINA  (PPV gauges + IVT drugs + Lasers from tariff)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_retina, '20g PPV — With Suture',                          'RET-PPV-20G',    65000, 'PER_EYE', FALSE,  1, NULL),
      (v_svc_retina, '23g PPV — Sutureless',                           'RET-PPV-23G',    85000, 'PER_EYE', FALSE,  2, NULL),
      (v_svc_retina, '25g PPV — Sutureless with Disposable Kit',       'RET-PPV-25G',   120000, 'PER_EYE', FALSE,  3, NULL),
      (v_svc_retina, 'IVTA (Intravitreal Triamcinolone)',               'RET-IVTA',       10000, 'PER_EYE', FALSE,  4, NULL),
      (v_svc_retina, 'IVT Razumab (Biosimilar Ranibizumab)',            'RET-IVT-RAZ',    25000, 'PER_EYE', FALSE,  5, NULL),
      (v_svc_retina, 'IVT Accentrix (Ranibizumab)',                     'RET-IVT-ACC',    35000, 'PER_EYE', FALSE,  6, NULL),
      (v_svc_retina, 'IVT Paganex (Brolucizumab)',                      'RET-IVT-PAG',    45000, 'PER_EYE', FALSE,  7, NULL),
      (v_svc_retina, 'IVT Ozurdex (Dexamethasone Implant)',             'RET-IVT-OZU',    45000, 'PER_EYE', FALSE,  8, NULL),
      (v_svc_retina, 'IVT Eylea (Aflibercept)',                         'RET-IVT-EYL',    75000, 'PER_EYE', FALSE,  9, NULL),
      (v_svc_retina, 'Barrage Laser',                                   'RET-BARRAGE',     5000, 'PER_EYE', FALSE, 10, NULL),
      (v_svc_retina, 'PRP Laser (Pan-Retinal Photocoagulation)',        'RET-PRP',         3500, 'PER_EYE', FALSE, 11, NULL);

    -- ────────────────────────────────────────────────────────
    -- GLAUCOMA  (Trab With MMC + YAG procedures)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_glaucoma, 'Trab With MMC (Trabeculectomy)', 'GLC-TRAB-MMC', 40000, 'PER_EYE', FALSE, 1, NULL),
      (v_svc_glaucoma, 'YAG Capsulotomy',                'GLC-YAG-CAP',   2500, 'PER_EYE', FALSE, 2, NULL),
      (v_svc_glaucoma, 'YAG PI (Peripheral Iridotomy)',  'GLC-YAG-PI',    3000, 'PER_EYE', FALSE, 3, NULL);

    -- ────────────────────────────────────────────────────────
    -- OCULOPLASTY  (DCR, DCT, Ptosis, Chalazion, BCL)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_oc, 'DCR (Dacryocystorhinostomy)', 'OC-DCR',     50000, 'PER_EYE', FALSE, 1, NULL),
      (v_svc_oc, 'DCT (Dacryocystectomy)',       'OC-DCT',     35000, 'PER_EYE', FALSE, 2, NULL),
      (v_svc_oc, 'Ptosis Correction',            'OC-PTOSIS',  35000, 'PER_EYE', FALSE, 3, NULL),
      (v_svc_oc, 'Chalazion Excision',           'OC-CHALAZ',   5000, 'PER_EYE', FALSE, 4, NULL),
      (v_svc_oc, 'BCL (Bandage Contact Lens)',   'OC-BCL',       500, 'PER_EYE', FALSE, 5, NULL);

    -- ────────────────────────────────────────────────────────
    -- SQUINT & CORNEA  (exact tariff names)
    -- ────────────────────────────────────────────────────────
    INSERT INTO service_variants
        (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order, sub_options)
    VALUES
      (v_svc_sc, 'Squint Surgery (Per Muscle)',             'SC-SQUINT',      30000, 'PER_EYE', FALSE, 1, NULL),
      (v_svc_sc, 'Corneal Tattooing',                       'SC-TATTOO',      45000, 'PER_EYE', FALSE, 2, NULL),
      (v_svc_sc, 'Penetrating Keratoplasty (PKP)',          'SC-PKP',         80000, 'PER_EYE', FALSE, 3, NULL),
      (v_svc_sc, 'Pterygium Excision',                      'SC-PTER',        20000, 'PER_EYE', FALSE, 4, NULL),
      (v_svc_sc, 'Pterygium Excision with CAG Pterygium',   'SC-PTER-CAG',    30000, 'PER_EYE', FALSE, 5, NULL),
      (v_svc_sc, 'General Anaesthesia (extra for any proc)','SC-GA',          10000, 'FIXED',   FALSE, 6, NULL);

    -- ────────────────────────────────────────────────────────
    -- IOL MASTER — real brand models for IOL dropdown
    -- ────────────────────────────────────────────────────────
    INSERT INTO iol_master
        (model_name, brand_manufacturer, iol_type, origin, default_price, product_code, display_order)
    VALUES
      -- For CAT-MONO-ALCIQ (Alcon IQ / Tecnis / Clareon · ₹50,000)
      ('AcrySof IQ',             'Alcon',             'Monofocal',  'Imported',  50000, 'ALCON-IQ',       1),
      ('Tecnis 1-Piece',         'Johnson & Johnson', 'Monofocal',  'Imported',  50000, 'JJ-TECNIS',      2),
      ('Clareon Monofocal',      'Alcon',             'Monofocal',  'Imported',  50000, 'ALCON-CLAREON',  3),
      -- For PREM-MULTI-IMP (Imported Multifocal · ₹95,000)
      ('AT LISA 839MP',          'Carl Zeiss Meditec','Multifocal', 'Imported',  95000, 'ZEISS-ATLISA',   4),
      ('Synergy IOL',            'Johnson & Johnson', 'Multifocal', 'Imported',  95000, 'JJ-SYNERGY',     5),
      -- For PREM-TRIF-IMP (Imported Trifocal · ₹1,20,000)
      ('PanOptix Trifocal',      'Alcon',             'Trifocal',   'Imported', 120000, 'ALCON-PANOPTIX', 6),
      ('AT TRIESSA 939MP',       'Carl Zeiss Meditec','Trifocal',   'Imported', 120000, 'ZEISS-TRIESSA',  7),
      ('RayOne EMV Trifocal',    'Rayner',            'Trifocal',   'Imported', 120000, 'RAY-TRIEMV',     8),
      -- For PREM-EDOF (EDOF · ₹1,20,000)
      ('Vivity Extended Vision', 'Alcon',             'EDOF',       'Imported', 120000, 'ALCON-VIVITY',   9),
      ('PureSee EDOF',           'Hoya',              'EDOF',       'Imported', 120000, 'HOYA-PURESEE',  10);

    -- Fetch IOL IDs
    SELECT id INTO v_iol_alcon_iq   FROM iol_master WHERE product_code = 'ALCON-IQ';
    SELECT id INTO v_iol_tecnis     FROM iol_master WHERE product_code = 'JJ-TECNIS';
    SELECT id INTO v_iol_clareon    FROM iol_master WHERE product_code = 'ALCON-CLAREON';
    SELECT id INTO v_iol_zeiss_mul  FROM iol_master WHERE product_code = 'ZEISS-ATLISA';
    SELECT id INTO v_iol_jj_mul     FROM iol_master WHERE product_code = 'JJ-SYNERGY';
    SELECT id INTO v_iol_alcon_trif FROM iol_master WHERE product_code = 'ALCON-PANOPTIX';
    SELECT id INTO v_iol_zeiss_trif FROM iol_master WHERE product_code = 'ZEISS-TRIESSA';
    SELECT id INTO v_iol_ray_trif   FROM iol_master WHERE product_code = 'RAY-TRIEMV';
    SELECT id INTO v_iol_vivity     FROM iol_master WHERE product_code = 'ALCON-VIVITY';
    SELECT id INTO v_iol_puresee    FROM iol_master WHERE product_code = 'HOYA-PURESEE';

    -- ────────────────────────────────────────────────────────
    -- VARIANT → IOL MAPPINGS
    -- ────────────────────────────────────────────────────────

    -- CAT-MONO-ALCIQ: Alcon IQ (default), Tecnis, Clareon
    IF v_var_mono_alciq IS NOT NULL THEN
        IF v_iol_alcon_iq  IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_mono_alciq, v_iol_alcon_iq,  TRUE)  ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
        IF v_iol_tecnis    IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_mono_alciq, v_iol_tecnis,    FALSE) ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
        IF v_iol_clareon   IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_mono_alciq, v_iol_clareon,   FALSE) ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
    END IF;

    -- PREM-MULTI-IMP: Zeiss AT LISA (default), J&J Synergy
    IF v_var_multi_imp IS NOT NULL THEN
        IF v_iol_zeiss_mul IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_multi_imp, v_iol_zeiss_mul, TRUE)  ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
        IF v_iol_jj_mul    IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_multi_imp, v_iol_jj_mul,    FALSE) ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
    END IF;

    -- PREM-TRIF-IMP: Alcon PanOptix (default), Zeiss TRIESSA, Rayner
    IF v_var_trif_imp IS NOT NULL THEN
        IF v_iol_alcon_trif IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_trif_imp, v_iol_alcon_trif, TRUE)  ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
        IF v_iol_zeiss_trif IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_trif_imp, v_iol_zeiss_trif, FALSE) ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
        IF v_iol_ray_trif   IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_trif_imp, v_iol_ray_trif,   FALSE) ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
    END IF;

    -- PREM-EDOF: Alcon Vivity (default), Hoya PureSee
    IF v_var_edof IS NOT NULL THEN
        IF v_iol_vivity  IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_edof, v_iol_vivity,  TRUE)  ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
        IF v_iol_puresee IS NOT NULL THEN INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default) VALUES (v_var_edof, v_iol_puresee, FALSE) ON CONFLICT (variant_id, iol_master_id) DO NOTHING; END IF;
    END IF;

END $$;

COMMIT;
