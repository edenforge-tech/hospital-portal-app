-- ============================================================
-- SERVICE CATALOG V2 MIGRATION
-- Purpose: Replace service_catalog, iol_catalog_master, surgery_types
--          with a 6-table schema: service_categories, catalog_services,
--          service_variants, iol_master, variant_iol_mapping,
--          branch_variant_pricing
-- Database: Azure PostgreSQL
-- All tables: UUID PKs, no tenant_id (global), no RLS
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 1. service_categories
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(50)  NOT NULL UNIQUE,
    description         TEXT,
    display_order       INTEGER      NOT NULL DEFAULT 0,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ────────────────────────────────────────────────────────────
-- 2. catalog_services
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_services (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         UUID         NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    service_name        VARCHAR(200) NOT NULL,
    service_code        VARCHAR(50),
    description         TEXT,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order       INTEGER      NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ────────────────────────────────────────────────────────────
-- 3. service_variants
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_service_id  UUID          NOT NULL REFERENCES catalog_services(id) ON DELETE RESTRICT,
    variant_name        VARCHAR(200)  NOT NULL,
    variant_code        VARCHAR(50),
    default_price       NUMERIC(15,2) NOT NULL DEFAULT 0,
    price_type          VARCHAR(20)   NOT NULL DEFAULT 'PER_EYE', -- PER_EYE | BOTH_EYES | FIXED
    has_iol_options     BOOLEAN       NOT NULL DEFAULT FALSE,
    description         TEXT,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    display_order       INTEGER       NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)   NOT NULL DEFAULT 'active'
);

-- ────────────────────────────────────────────────────────────
-- 4. iol_master
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS iol_master (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name          VARCHAR(200)  NOT NULL,
    brand_manufacturer  VARCHAR(200)  NOT NULL,
    iol_type            VARCHAR(50)   NOT NULL DEFAULT 'Monofocal',
    origin              VARCHAR(50)   NOT NULL DEFAULT 'Imported', -- Indian | Imported
    material            VARCHAR(100),
    a_constant          NUMERIC(5,2),
    power_range_min     NUMERIC(5,2),
    power_range_max     NUMERIC(5,2),
    power_increment     NUMERIC(4,2)  DEFAULT 0.50,
    default_price       NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency_code       VARCHAR(10)   NOT NULL DEFAULT 'INR',
    product_code        VARCHAR(100),
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    display_order       INTEGER       NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)   NOT NULL DEFAULT 'active'
);

-- ────────────────────────────────────────────────────────────
-- 5. variant_iol_mapping
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS variant_iol_mapping (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID         NOT NULL REFERENCES service_variants(id) ON DELETE CASCADE,
    iol_master_id       UUID         NOT NULL REFERENCES iol_master(id) ON DELETE CASCADE,
    is_default          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active',
    UNIQUE (variant_id, iol_master_id)
);

-- ────────────────────────────────────────────────────────────
-- 6. branch_variant_pricing
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branch_variant_pricing (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id           UUID          NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
    variant_id          UUID          NOT NULL REFERENCES service_variants(id) ON DELETE RESTRICT,
    override_price      NUMERIC(15,2),
    price_type          VARCHAR(20),
    effective_from      DATE,
    effective_to        DATE,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)   NOT NULL DEFAULT 'active',
    UNIQUE (branch_id, variant_id, effective_from)
);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_catalog_services_category_id      ON catalog_services(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_services_is_active         ON catalog_services(is_active);
CREATE INDEX IF NOT EXISTS idx_service_variants_catalog_service_id ON service_variants(catalog_service_id);
CREATE INDEX IF NOT EXISTS idx_service_variants_is_active         ON service_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_variant_iol_variant_id             ON variant_iol_mapping(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_iol_iol_master_id          ON variant_iol_mapping(iol_master_id);
CREATE INDEX IF NOT EXISTS idx_branch_variant_branch_id           ON branch_variant_pricing(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_variant_variant_id          ON branch_variant_pricing(variant_id);
CREATE INDEX IF NOT EXISTS idx_iol_master_is_active               ON iol_master(is_active);

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
    -- category IDs
    v_cat_cataract      UUID;
    v_cat_premium       UUID;
    v_cat_lasik         UUID;
    v_cat_icl           UUID;
    v_cat_kc            UUID;
    v_cat_retina        UUID;
    v_cat_glaucoma      UUID;
    v_cat_oc            UUID;
    v_cat_sc            UUID;
    v_cat_diag          UUID;
    v_cat_inv           UUID;

    -- catalog_service IDs
    v_svc_cataract      UUID;
    v_svc_premium       UUID;
    v_svc_lasik         UUID;
    v_svc_icl           UUID;
    v_svc_kc            UUID;
    v_svc_retina        UUID;
    v_svc_glaucoma      UUID;
    v_svc_oc            UUID;
    v_svc_sc            UUID;
    v_svc_diag          UUID;
    v_svc_inv           UUID;

    -- variant ID that links to iol_master (preloaded variant)
    v_var_preloaded     UUID;

    -- iol_master IDs
    v_iol_ct_lucia      UUID;
    v_iol_tecnis        UUID;
BEGIN

    -- ──────────────────────────────────────────────────────────
    -- service_categories
    -- ──────────────────────────────────────────────────────────
    INSERT INTO service_categories (name, code, description, display_order)
    VALUES
      ('Cataract Surgery',          'CATARACT',       'Standard and advanced cataract procedures',         1),
      ('Premium IOL Packages',      'PREMIUM_LENSES', 'Upgrade packages with premium intraocular lenses', 2),
      ('Laser Vision Correction',   'LASIK',          'LASIK, SMILE and PRK refractive procedures',       3),
      ('Implantable Collamer Lens', 'ICL',            'EVO ICL for high myopia / hyperopia',              4),
      ('Keratoconus Treatment',     'KERATOCONUS',    'Cross-linking, ICRS, corneal transplant',          5),
      ('Retina Services',           'RETINA',         'IVT injections, laser, vitreoretinal surgery',     6),
      ('Glaucoma Services',         'GLAUCOMA',       'Trabeculectomy, valve, laser procedures',          7),
      ('Oculoplasty Services',      'OCCULOPLASTY',   'Ptosis, DCR, entropion, eyelid surgery',           8),
      ('Squint & Cornea',           'SQUINT_CORNEA',  'Strabismus, cornea transplant, pterygium',         9),
      ('Diagnostic Procedures',     'DIAGNOSTICS',    'Ophthalmic diagnostic tests and scans',            10),
      ('Pre-Op Investigations',     'INVESTIGATIONS', 'Pre-operative laboratory and systemic tests',      11)
    ON CONFLICT (code) DO NOTHING;

    -- fetch IDs
    SELECT id INTO v_cat_cataract  FROM service_categories WHERE code = 'CATARACT';
    SELECT id INTO v_cat_premium   FROM service_categories WHERE code = 'PREMIUM_LENSES';
    SELECT id INTO v_cat_lasik     FROM service_categories WHERE code = 'LASIK';
    SELECT id INTO v_cat_icl       FROM service_categories WHERE code = 'ICL';
    SELECT id INTO v_cat_kc        FROM service_categories WHERE code = 'KERATOCONUS';
    SELECT id INTO v_cat_retina    FROM service_categories WHERE code = 'RETINA';
    SELECT id INTO v_cat_glaucoma  FROM service_categories WHERE code = 'GLAUCOMA';
    SELECT id INTO v_cat_oc        FROM service_categories WHERE code = 'OCCULOPLASTY';
    SELECT id INTO v_cat_sc        FROM service_categories WHERE code = 'SQUINT_CORNEA';
    SELECT id INTO v_cat_diag      FROM service_categories WHERE code = 'DIAGNOSTICS';
    SELECT id INTO v_cat_inv       FROM service_categories WHERE code = 'INVESTIGATIONS';

    -- ──────────────────────────────────────────────────────────
    -- catalog_services  (one parent per category)
    -- ──────────────────────────────────────────────────────────
    INSERT INTO catalog_services (category_id, service_name, service_code, display_order)
    VALUES
      (v_cat_cataract,  'Cataract Surgery',            'SVC-CATARACT',  1),
      (v_cat_premium,   'Premium IOL Upgrade',          'SVC-PREMIUM',   1),
      (v_cat_lasik,     'Laser Vision Correction',      'SVC-LASIK',     1),
      (v_cat_icl,       'EVO ICL Procedure',            'SVC-ICL',       1),
      (v_cat_kc,        'Keratoconus Treatment',        'SVC-KC',        1),
      (v_cat_retina,    'Retina & Vitreous Services',   'SVC-RETINA',    1),
      (v_cat_glaucoma,  'Glaucoma Surgery & Laser',     'SVC-GLAUCOMA',  1),
      (v_cat_oc,        'Oculoplasty Procedures',       'SVC-OCPLASTY',  1),
      (v_cat_sc,        'Squint & Cornea Procedures',   'SVC-SQUINT',    1),
      (v_cat_diag,      'Ophthalmic Diagnostics',       'SVC-DIAG',      1),
      (v_cat_inv,       'Pre-Op Laboratory Tests',      'SVC-LABS',      1)
    ON CONFLICT DO NOTHING;

    -- fetch service IDs
    SELECT id INTO v_svc_cataract  FROM catalog_services WHERE service_code = 'SVC-CATARACT';
    SELECT id INTO v_svc_premium   FROM catalog_services WHERE service_code = 'SVC-PREMIUM';
    SELECT id INTO v_svc_lasik     FROM catalog_services WHERE service_code = 'SVC-LASIK';
    SELECT id INTO v_svc_icl       FROM catalog_services WHERE service_code = 'SVC-ICL';
    SELECT id INTO v_svc_kc        FROM catalog_services WHERE service_code = 'SVC-KC';
    SELECT id INTO v_svc_retina    FROM catalog_services WHERE service_code = 'SVC-RETINA';
    SELECT id INTO v_svc_glaucoma  FROM catalog_services WHERE service_code = 'SVC-GLAUCOMA';
    SELECT id INTO v_svc_oc        FROM catalog_services WHERE service_code = 'SVC-OCPLASTY';
    SELECT id INTO v_svc_sc        FROM catalog_services WHERE service_code = 'SVC-SQUINT';
    SELECT id INTO v_svc_diag      FROM catalog_services WHERE service_code = 'SVC-DIAG';
    SELECT id INTO v_svc_inv       FROM catalog_services WHERE service_code = 'SVC-LABS';

    -- ──────────────────────────────────────────────────────────
    -- service_variants
    -- ──────────────────────────────────────────────────────────

    -- CATARACT
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_cataract, 'Phaco + Indian Monofocal',        'CAT-PHACO-IND',    35000, 'PER_EYE', FALSE, 1),
      (v_svc_cataract, 'Phaco + Imported Monofocal',      'CAT-PHACO-IMP',    45000, 'PER_EYE', FALSE, 2),
      (v_svc_cataract, 'SICS (Manual Small Incision)',    'CAT-SICS',         25000, 'PER_EYE', FALSE, 3),
      (v_svc_cataract, 'Femto Laser Cataract (LenSx)',   'CAT-FEMTO',        75000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- PREMIUM_LENSES — "Preloaded IOL" variant gets IOL sub-dropdown
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_premium, 'Multifocal IOL Package',            'PREM-MULTI',       85000,  'PER_EYE', FALSE, 1),
      (v_svc_premium, 'Trifocal IOL Package',              'PREM-TRIFOCAL',   100000,  'PER_EYE', FALSE, 2),
      (v_svc_premium, 'EDOF IOL Package',                  'PREM-EDOF',        95000,  'PER_EYE', FALSE, 3),
      (v_svc_premium, 'Toric IOL Package',                 'PREM-TORIC',       70000,  'PER_EYE', FALSE, 4),
      (v_svc_premium, 'Preloaded IOL (choose below)',      'PREM-PRELOAD',     55000,  'PER_EYE', TRUE,  5)
    ON CONFLICT DO NOTHING;

    -- capture preloaded variant ID for IOL mapping
    SELECT id INTO v_var_preloaded FROM service_variants WHERE variant_code = 'PREM-PRELOAD';

    -- LASIK
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_lasik, 'Standard LASIK',             'LASIK-STD',    70000,  'BOTH_EYES', FALSE, 1),
      (v_svc_lasik, 'Wavefront LASIK',            'LASIK-WAVE',  100000,  'BOTH_EYES', FALSE, 2),
      (v_svc_lasik, 'SMILE Pro (Keyhole Laser)', 'LASIK-SMILE', 130000,  'BOTH_EYES', FALSE, 3),
      (v_svc_lasik, 'TransPRK (No-Touch)',        'LASIK-PRK',    80000,  'BOTH_EYES', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- ICL
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_icl, 'EVO ICL Standard',  'ICL-STD',   140000, 'BOTH_EYES', FALSE, 1),
      (v_svc_icl, 'EVO ICL Toric',     'ICL-TORIC', 160000, 'BOTH_EYES', FALSE, 2)
    ON CONFLICT DO NOTHING;

    -- KERATOCONUS
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_kc, 'Corneal Cross-Linking (CXL)', 'KC-CXL',    40000, 'PER_EYE', FALSE, 1),
      (v_svc_kc, 'ICRS (Intrastromal Rings)',   'KC-ICRS',   85000, 'PER_EYE', FALSE, 2),
      (v_svc_kc, 'DALK / PKP (Transplant)',     'KC-DALK',  120000, 'PER_EYE', FALSE, 3)
    ON CONFLICT DO NOTHING;

    -- RETINA
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_retina, 'Intravitreal Injection (IVT)',       'RET-IVT',   18000,  'PER_EYE', FALSE, 1),
      (v_svc_retina, 'Retinal Laser Photocoagulation',     'RET-LASER', 15000,  'PER_EYE', FALSE, 2),
      (v_svc_retina, 'Vitreo-Retinal Surgery (VRS)',       'RET-VRS',  175000,  'PER_EYE', FALSE, 3),
      (v_svc_retina, 'Anti-VEGF Injection (Avastin/Lucentis)', 'RET-VEGF', 22000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- GLAUCOMA
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_glaucoma, 'Trabeculectomy',                'GLC-TRAB',   90000, 'PER_EYE', FALSE, 1),
      (v_svc_glaucoma, 'Ahmed/Baerveldt Valve (GDD)',   'GLC-VALVE', 150000, 'PER_EYE', FALSE, 2),
      (v_svc_glaucoma, 'Selective Laser Trabeculoplasty (SLT)', 'GLC-SLT', 20000, 'PER_EYE', FALSE, 3),
      (v_svc_glaucoma, 'iStent / MIGS',                 'GLC-MIGS',   80000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- OCULOPLASTY
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_oc, 'Ptosis Correction',           'OC-PTOSIS',  60000, 'PER_EYE', FALSE, 1),
      (v_svc_oc, 'DCR (Dacryocystorhinostomy)',  'OC-DCR',     75000, 'PER_EYE', FALSE, 2),
      (v_svc_oc, 'Entropion / Ectropion',        'OC-ENT',     50000, 'PER_EYE', FALSE, 3),
      (v_svc_oc, 'Blepharoplasty',               'OC-BLEPH',   65000, 'BOTH_EYES', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- SQUINT & CORNEA
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_sc, 'Strabismus (Squint) Surgery',  'SC-SQUINT',   80000, 'BOTH_EYES', FALSE, 1),
      (v_svc_sc, 'DALK (Deep Lamellar Keratoplasty)', 'SC-DALK', 170000, 'PER_EYE', FALSE, 2),
      (v_svc_sc, 'Pterygium Excision',           'SC-PTER',     30000, 'PER_EYE', FALSE, 3),
      (v_svc_sc, 'PKP (Penetrating Keratoplasty)', 'SC-PKP',   180000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- DIAGNOSTICS (these appear in Imaging Orders tab)
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_diag, 'IOL Master (Biometry)',        'DIAG-BIOM',  1500, 'PER_EYE', FALSE, 1),
      (v_svc_diag, 'Corneal Topography',           'DIAG-TOP',   2000, 'PER_EYE', FALSE, 2),
      (v_svc_diag, 'OCT Macula',                   'DIAG-OCTM',  1500, 'PER_EYE', FALSE, 3),
      (v_svc_diag, 'OCT Disc (RNFL)',              'DIAG-OCTD',  1500, 'PER_EYE', FALSE, 4),
      (v_svc_diag, 'Specular Microscopy',          'DIAG-SPEC',  1500, 'PER_EYE', FALSE, 5),
      (v_svc_diag, 'B-Scan Ultrasonography',       'DIAG-BSCAN', 1200, 'PER_EYE', FALSE, 6),
      (v_svc_diag, 'Visual Field (Perimetry)',      'DIAG-VF',    1200, 'PER_EYE', FALSE, 7),
      (v_svc_diag, 'Fundus Photography',            'DIAG-FP',    1000, 'PER_EYE', FALSE, 8),
      (v_svc_diag, 'HRT (Heidelberg Retina Tomograph)', 'DIAG-HRT', 2000, 'PER_EYE', FALSE, 9),
      (v_svc_diag, 'FFA (Fluorescein Angiography)', 'DIAG-FFA',  5000, 'BOTH_EYES', FALSE, 10),
      (v_svc_diag, 'USG Orbit',                    'DIAG-USG',   1500, 'PER_EYE', FALSE, 11),
      (v_svc_diag, 'Anterior Segment OCT',         'DIAG-ASOCT', 1500, 'PER_EYE', FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- INVESTIGATIONS (pre-op lab tests)
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_inv, 'CBC (Complete Blood Count)',         'LAB-CBC',     500,  'FIXED', FALSE, 1),
      (v_svc_inv, 'Blood Sugar Fasting',                'LAB-BSF',     200,  'FIXED', FALSE, 2),
      (v_svc_inv, 'HbA1c',                              'LAB-HBA1C',   800,  'FIXED', FALSE, 3),
      (v_svc_inv, 'LFT (Liver Function Test)',          'LAB-LFT',    1200,  'FIXED', FALSE, 4),
      (v_svc_inv, 'KFT (Kidney Function Test)',         'LAB-KFT',    1000,  'FIXED', FALSE, 5),
      (v_svc_inv, 'Sr. Creatinine',                     'LAB-CREAT',   400,  'FIXED', FALSE, 6),
      (v_svc_inv, 'PT / INR',                           'LAB-PTINR',   500,  'FIXED', FALSE, 7),
      (v_svc_inv, 'HIV + HBsAg + HCV Panel',           'LAB-VIRAL',   800,  'FIXED', FALSE, 8),
      (v_svc_inv, 'ECG',                                'LAB-ECG',     500,  'FIXED', FALSE, 9),
      (v_svc_inv, 'Chest X-Ray (PA view)',              'LAB-CXR',     800,  'FIXED', FALSE, 10),
      (v_svc_inv, 'Urine Routine & Microscopy',         'LAB-URINE',   300,  'FIXED', FALSE, 11),
      (v_svc_inv, 'Blood Group & Rh Factor',            'LAB-BG',      300,  'FIXED', FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- ──────────────────────────────────────────────────────────
    -- iol_master (2 entries)
    -- ──────────────────────────────────────────────────────────
    INSERT INTO iol_master (model_name, brand_manufacturer, iol_type, origin, material, a_constant,
                            power_range_min, power_range_max, power_increment, default_price,
                            product_code, display_order)
    VALUES
      ('CT Lucia 601P (Preloaded)',  'Carl Zeiss Meditec', 'Monofocal', 'Imported',
       'Hydrophobic Acrylic', 118.4, 0.00, 35.00, 0.50, 8500.00, 'ZEISS-CTL-601P', 1),
      ('Tecnis 1-Piece Preloaded',   'Johnson & Johnson',  'Monofocal', 'Imported',
       'Hydrophobic Acrylic', 119.3, 5.00, 34.00, 0.50, 12000.00, 'JJ-TECNIS-1P',  2)
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_iol_ct_lucia FROM iol_master WHERE product_code = 'ZEISS-CTL-601P';
    SELECT id INTO v_iol_tecnis   FROM iol_master WHERE product_code = 'JJ-TECNIS-1P';

    -- ──────────────────────────────────────────────────────────
    -- variant_iol_mapping  (Preloaded variant → both IOLs)
    -- ──────────────────────────────────────────────────────────
    IF v_var_preloaded IS NOT NULL AND v_iol_ct_lucia IS NOT NULL THEN
        INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default)
        VALUES (v_var_preloaded, v_iol_ct_lucia, TRUE)
        ON CONFLICT (variant_id, iol_master_id) DO NOTHING;
    END IF;

    IF v_var_preloaded IS NOT NULL AND v_iol_tecnis IS NOT NULL THEN
        INSERT INTO variant_iol_mapping (variant_id, iol_master_id, is_default)
        VALUES (v_var_preloaded, v_iol_tecnis, FALSE)
        ON CONFLICT (variant_id, iol_master_id) DO NOTHING;
    END IF;

END $$;

COMMIT;
