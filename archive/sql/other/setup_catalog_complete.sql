-- ============================================================================
-- COMPLETE SERVICE CATALOG + LAB TEST CATALOG DATABASE SETUP
-- Purpose  : One-stop idempotent migration.  Run this whenever the catalog
--            tables are missing, empty, or their schema drifts out of sync.
-- Order    : 1. DDL                   (all CREATE TABLE IF NOT EXISTS)
--            2. Schema patches        (ADD COLUMN IF NOT EXISTS)
--            3. Normalize pricing     (create variant_prices / iol_prices)
--            4. Migrate default_price → variant_prices / iol_prices
--            5. Seed service catalog  (categories → services → variants)
--            6. Seed IOL master
--            7. Seed variant_prices from service_variants.default_price
--            8. Seed iol_prices from iol_master.default_price
--            9. Seed global (tenant_id = NULL) lab_test_catalog items
-- Run against : Azure PostgreSQL — hospitalportal database
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 1: DDL — service catalog tables
-- ════════════════════════════════════════════════════════════════════════════

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

CREATE TABLE IF NOT EXISTS service_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_service_id  UUID          NOT NULL REFERENCES catalog_services(id) ON DELETE RESTRICT,
    variant_name        VARCHAR(200)  NOT NULL,
    variant_code        VARCHAR(50),
    default_price       NUMERIC(15,2) NOT NULL DEFAULT 0,
    price_type          VARCHAR(20)   NOT NULL DEFAULT 'PER_EYE',
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

CREATE TABLE IF NOT EXISTS iol_master (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name          VARCHAR(200)  NOT NULL,
    brand_manufacturer  VARCHAR(200)  NOT NULL,
    iol_type            VARCHAR(50)   NOT NULL DEFAULT 'Monofocal',
    origin              VARCHAR(50)   NOT NULL DEFAULT 'Imported',
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

CREATE TABLE IF NOT EXISTS variant_prices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID NOT NULL REFERENCES service_variants(id),
    branch_id           UUID,
    amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from      DATE,
    effective_to        DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS iol_prices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iol_master_id       UUID NOT NULL REFERENCES iol_master(id),
    branch_id           UUID,
    amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from      DATE,
    effective_to        DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 2: Schema patches — add columns that the EF model expects
-- ════════════════════════════════════════════════════════════════════════════

-- sub_options TEXT[] — used by ServiceVariant.SubOptions in EF model
ALTER TABLE service_variants
    ADD COLUMN IF NOT EXISTS sub_options TEXT[];

-- lab_test_catalog: test_type column (added after initial DDL)
ALTER TABLE lab_test_catalog
    ADD COLUMN IF NOT EXISTS test_type VARCHAR(20) NOT NULL DEFAULT 'Lab';

-- lab_test_catalog: is_pre_operative (used by EF model)
ALTER TABLE lab_test_catalog
    ADD COLUMN IF NOT EXISTS is_pre_operative BOOLEAN NOT NULL DEFAULT FALSE;

-- lab_test_catalog: description
ALTER TABLE lab_test_catalog
    ADD COLUMN IF NOT EXISTS description TEXT;

-- lab_test_catalog: specimen_type column (the EF model maps SampleType → specimen_type)
-- The older DDL used specimen_type; ensure it exists
ALTER TABLE lab_test_catalog
    ADD COLUMN IF NOT EXISTS specimen_type VARCHAR(100);

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 3: Indexes
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_catalog_services_category_id        ON catalog_services(category_id);
CREATE INDEX IF NOT EXISTS idx_service_variants_catalog_service_id ON service_variants(catalog_service_id);
CREATE INDEX IF NOT EXISTS idx_variant_iol_variant_id              ON variant_iol_mapping(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_iol_iol_master_id           ON variant_iol_mapping(iol_master_id);
CREATE INDEX IF NOT EXISTS idx_vp_variant_id                       ON variant_prices(variant_id);
CREATE INDEX IF NOT EXISTS idx_vp_lookup                           ON variant_prices(variant_id, branch_id, effective_to)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ip_iol_master_id                    ON iol_prices(iol_master_id);
CREATE INDEX IF NOT EXISTS idx_ip_lookup                           ON iol_prices(iol_master_id, branch_id, effective_to)
    WHERE deleted_at IS NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 4: Seed service_categories + catalog_services + service_variants
-- ════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
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

    v_var_preloaded     UUID;
    v_iol_ct_lucia      UUID;
    v_iol_tecnis        UUID;
BEGIN

    -- ── service_categories ──────────────────────────────────────────────────
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

    -- ── catalog_services ────────────────────────────────────────────────────
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

    -- ── service_variants ────────────────────────────────────────────────────

    -- CATARACT
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_cataract, 'Phaco + Indian Monofocal',      'CAT-PHACO-IND',   35000, 'PER_EYE', FALSE, 1),
      (v_svc_cataract, 'Phaco + Imported Monofocal',    'CAT-PHACO-IMP',   45000, 'PER_EYE', FALSE, 2),
      (v_svc_cataract, 'SICS (Manual Small Incision)',  'CAT-SICS',        25000, 'PER_EYE', FALSE, 3),
      (v_svc_cataract, 'Femto Laser Cataract (LenSx)',  'CAT-FEMTO',       75000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- PREMIUM LENSES — Preloaded variant links to IOL sub-options
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_premium, 'Multifocal IOL Package',          'PREM-MULTI',      85000, 'PER_EYE', FALSE, 1),
      (v_svc_premium, 'Trifocal IOL Package',            'PREM-TRIFOCAL',  100000, 'PER_EYE', FALSE, 2),
      (v_svc_premium, 'EDOF IOL Package',                'PREM-EDOF',       95000, 'PER_EYE', FALSE, 3),
      (v_svc_premium, 'Toric IOL Package',               'PREM-TORIC',      70000, 'PER_EYE', FALSE, 4),
      (v_svc_premium, 'Preloaded IOL (choose below)',    'PREM-PRELOAD',    55000, 'PER_EYE', TRUE,  5)
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_var_preloaded FROM service_variants WHERE variant_code = 'PREM-PRELOAD';

    -- LASIK
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_lasik, 'Standard LASIK',             'LASIK-STD',    70000, 'BOTH_EYES', FALSE, 1),
      (v_svc_lasik, 'Wavefront LASIK',            'LASIK-WAVE',  100000, 'BOTH_EYES', FALSE, 2),
      (v_svc_lasik, 'SMILE Pro (Keyhole Laser)',  'LASIK-SMILE', 130000, 'BOTH_EYES', FALSE, 3),
      (v_svc_lasik, 'TransPRK (No-Touch)',        'LASIK-PRK',    80000, 'BOTH_EYES', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- ICL
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_icl, 'EVO ICL Standard', 'ICL-STD',   140000, 'BOTH_EYES', FALSE, 1),
      (v_svc_icl, 'EVO ICL Toric',    'ICL-TORIC', 160000, 'BOTH_EYES', FALSE, 2)
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
      (v_svc_retina, 'Intravitreal Injection (IVT)',           'RET-IVT',    18000, 'PER_EYE', FALSE, 1),
      (v_svc_retina, 'Retinal Laser Photocoagulation',         'RET-LASER',  15000, 'PER_EYE', FALSE, 2),
      (v_svc_retina, 'Vitreo-Retinal Surgery (VRS)',           'RET-VRS',   175000, 'PER_EYE', FALSE, 3),
      (v_svc_retina, 'Anti-VEGF Injection (Avastin/Lucentis)', 'RET-VEGF',   22000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- GLAUCOMA
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_glaucoma, 'Trabeculectomy',                           'GLC-TRAB',   90000, 'PER_EYE', FALSE, 1),
      (v_svc_glaucoma, 'Ahmed/Baerveldt Valve (GDD)',              'GLC-VALVE', 150000, 'PER_EYE', FALSE, 2),
      (v_svc_glaucoma, 'Selective Laser Trabeculoplasty (SLT)',    'GLC-SLT',   20000, 'PER_EYE', FALSE, 3),
      (v_svc_glaucoma, 'iStent / MIGS',                            'GLC-MIGS',  80000, 'PER_EYE', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- OCULOPLASTY
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_oc, 'Ptosis Correction',           'OC-PTOSIS',  60000, 'PER_EYE',   FALSE, 1),
      (v_svc_oc, 'DCR (Dacryocystorhinostomy)', 'OC-DCR',     75000, 'PER_EYE',   FALSE, 2),
      (v_svc_oc, 'Entropion / Ectropion',       'OC-ENT',     50000, 'PER_EYE',   FALSE, 3),
      (v_svc_oc, 'Blepharoplasty',              'OC-BLEPH',   65000, 'BOTH_EYES', FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- SQUINT & CORNEA
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_sc, 'Strabismus (Squint) Surgery',        'SC-SQUINT',  80000, 'BOTH_EYES', FALSE, 1),
      (v_svc_sc, 'DALK (Deep Anterior Lamellar Keratoplasty)', 'SC-DALK', 170000, 'PER_EYE', FALSE, 2),
      (v_svc_sc, 'Pterygium Excision',                 'SC-PTER',    30000, 'PER_EYE',   FALSE, 3),
      (v_svc_sc, 'PKP (Penetrating Keratoplasty)',     'SC-PKP',    180000, 'PER_EYE',   FALSE, 4)
    ON CONFLICT DO NOTHING;

    -- DIAGNOSTICS (shown in Imaging Orders tab; DIAGNOSTICS category is read by frontend)
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_diag, 'IOL Master (Biometry)',                'DIAG-BIOM',  1500, 'PER_EYE',   FALSE,  1),
      (v_svc_diag, 'Corneal Topography',                  'DIAG-TOP',   2000, 'PER_EYE',   FALSE,  2),
      (v_svc_diag, 'OCT Macula',                          'DIAG-OCTM',  1500, 'PER_EYE',   FALSE,  3),
      (v_svc_diag, 'OCT Disc (RNFL)',                     'DIAG-OCTD',  1500, 'PER_EYE',   FALSE,  4),
      (v_svc_diag, 'Specular Microscopy',                 'DIAG-SPEC',  1500, 'PER_EYE',   FALSE,  5),
      (v_svc_diag, 'B-Scan Ultrasonography',              'DIAG-BSCAN', 1200, 'PER_EYE',   FALSE,  6),
      (v_svc_diag, 'Visual Field (Perimetry)',             'DIAG-VF',    1200, 'PER_EYE',   FALSE,  7),
      (v_svc_diag, 'Fundus Photography',                  'DIAG-FP',    1000, 'PER_EYE',   FALSE,  8),
      (v_svc_diag, 'HRT (Heidelberg Retina Tomograph)',   'DIAG-HRT',   2000, 'PER_EYE',   FALSE,  9),
      (v_svc_diag, 'FFA (Fluorescein Angiography)',       'DIAG-FFA',   5000, 'BOTH_EYES', FALSE, 10),
      (v_svc_diag, 'USG Orbit',                           'DIAG-USG',   1500, 'PER_EYE',   FALSE, 11),
      (v_svc_diag, 'Anterior Segment OCT',                'DIAG-ASOCT', 1500, 'PER_EYE',   FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- INVESTIGATIONS (pre-op lab tests)
    INSERT INTO service_variants (catalog_service_id, variant_name, variant_code, default_price, price_type, has_iol_options, display_order)
    VALUES
      (v_svc_inv, 'CBC (Complete Blood Count)',         'LAB-CBC',    500,  'FIXED', FALSE,  1),
      (v_svc_inv, 'Blood Sugar Fasting',                'LAB-BSF',    200,  'FIXED', FALSE,  2),
      (v_svc_inv, 'HbA1c',                              'LAB-HBA1C',  800,  'FIXED', FALSE,  3),
      (v_svc_inv, 'LFT (Liver Function Test)',          'LAB-LFT',   1200,  'FIXED', FALSE,  4),
      (v_svc_inv, 'KFT (Kidney Function Test)',         'LAB-KFT',   1000,  'FIXED', FALSE,  5),
      (v_svc_inv, 'Sr. Creatinine',                     'LAB-CREAT',  400,  'FIXED', FALSE,  6),
      (v_svc_inv, 'PT / INR',                           'LAB-PTINR',  500,  'FIXED', FALSE,  7),
      (v_svc_inv, 'HIV + HBsAg + HCV Panel',           'LAB-VIRAL',  800,  'FIXED', FALSE,  8),
      (v_svc_inv, 'ECG',                                'LAB-ECG',    500,  'FIXED', FALSE,  9),
      (v_svc_inv, 'Chest X-Ray (PA view)',              'LAB-CXR',    800,  'FIXED', FALSE, 10),
      (v_svc_inv, 'Urine Routine & Microscopy',         'LAB-URINE',  300,  'FIXED', FALSE, 11),
      (v_svc_inv, 'Blood Group & Rh Factor',            'LAB-BG',     300,  'FIXED', FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- ── iol_master ──────────────────────────────────────────────────────────
    INSERT INTO iol_master (model_name, brand_manufacturer, iol_type, origin, material, a_constant,
                            power_range_min, power_range_max, power_increment, default_price,
                            product_code, display_order)
    VALUES
      ('CT Lucia 601P (Preloaded)',  'Carl Zeiss Meditec', 'Monofocal', 'Imported',
       'Hydrophobic Acrylic', 118.4, 0.00, 35.00, 0.50,  8500.00, 'ZEISS-CTL-601P', 1),
      ('Tecnis 1-Piece Preloaded',   'Johnson & Johnson',  'Monofocal', 'Imported',
       'Hydrophobic Acrylic', 119.3, 5.00, 34.00, 0.50, 12000.00, 'JJ-TECNIS-1P',  2),
      ('AcrySof IQ Monofocal',       'Alcon',              'Monofocal', 'Imported',
       'Hydrophobic Acrylic', 118.7, 6.00, 34.00, 0.50,  9500.00, 'ALCON-ACRYSOF', 3),
      ('Aurovue Monofocal (Indian)', 'Aurolab',            'Monofocal', 'Indian',
       'PMMA',                118.0, 5.00, 30.00, 0.50,  2500.00, 'AURO-MNF',      4),
      ('PanOptix Trifocal',          'Alcon',              'Trifocal',  'Imported',
       'Hydrophobic Acrylic', 119.0, 6.00, 34.00, 0.50, 45000.00, 'ALCON-PANOPTIX',5),
      ('Symfony EDOF',               'Johnson & Johnson',  'EDOF',      'Imported',
       'Hydrophobic Acrylic', 119.1, 6.00, 34.00, 0.50, 40000.00, 'JJ-SYMFONY',    6)
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_iol_ct_lucia FROM iol_master WHERE product_code = 'ZEISS-CTL-601P';
    SELECT id INTO v_iol_tecnis   FROM iol_master WHERE product_code = 'JJ-TECNIS-1P';

    -- ── variant_iol_mapping ─────────────────────────────────────────────────
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

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 5: Populate variant_prices from default_price (if column exists)
-- This is idempotent — ON CONFLICT DO NOTHING skips existing rows.
-- ════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_variants'
          AND column_name = 'default_price'
    ) THEN
        INSERT INTO variant_prices (variant_id, branch_id, amount, is_active, created_at, updated_at, status)
        SELECT id, NULL, default_price, TRUE, NOW(), NOW(), 'active'
        FROM   service_variants
        WHERE  default_price IS NOT NULL
          AND  default_price > 0
          AND  deleted_at IS NULL
          AND  id NOT IN (SELECT variant_id FROM variant_prices WHERE branch_id IS NULL AND deleted_at IS NULL)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'variant_prices populated from service_variants.default_price';
    ELSE
        RAISE NOTICE 'default_price column not found on service_variants — skipping price migration';
    END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 6: Populate iol_prices from iol_master.default_price
-- ════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'iol_master'
          AND column_name = 'default_price'
    ) THEN
        INSERT INTO iol_prices (iol_master_id, branch_id, amount, is_active, created_at, updated_at, status)
        SELECT id, NULL, default_price, TRUE, NOW(), NOW(), 'active'
        FROM   iol_master
        WHERE  default_price IS NOT NULL
          AND  default_price > 0
          AND  deleted_at IS NULL
          AND  id NOT IN (SELECT iol_master_id FROM iol_prices WHERE branch_id IS NULL AND deleted_at IS NULL)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'iol_prices populated from iol_master.default_price';
    ELSE
        RAISE NOTICE 'default_price column not found on iol_master — skipping price migration';
    END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 7: Seed global lab_test_catalog (tenant_id = NULL = shared catalog)
-- These rows appear for ALL tenants (backend now queries tenant_id IS NULL OR
-- tenant_id = <current tenant>).
-- test_code has a UNIQUE constraint so ON CONFLICT is safe.
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO lab_test_catalog
    (test_name, test_code, category, price, specimen_type, turnaround_hours, test_type, is_active)
VALUES
    -- Imaging
    ('IOL Master (Biometry)',                'IMG-BIOMETRY',  'Biometry',         1200, NULL, 1, 'Imaging', TRUE),
    ('Specular Microscopy',                  'IMG-SPEC-MICRO','Corneal Imaging',    800, NULL, 1, 'Imaging', TRUE),
    ('Corneal Topography (Pentacam)',        'IMG-TOPO',      'Corneal Imaging',   1000, NULL, 1, 'Imaging', TRUE),
    ('OCT Macula',                           'IMG-OCT-MACULA','Retinal Imaging',   1500, NULL, 1, 'Imaging', TRUE),
    ('OCT Optic Disc (Glaucoma)',            'IMG-OCT-DISC',  'Glaucoma Imaging',  1500, NULL, 1, 'Imaging', TRUE),
    ('B-Scan Ultrasound',                    'IMG-BSCAN',     'Ocular Ultrasound',  600, NULL, 1, 'Imaging', TRUE),
    ('Fundus Photography',                   'IMG-FUNDUS',    'Retinal Imaging',    800, NULL, 1, 'Imaging', TRUE),
    ('Fluorescein Angiography (FFA)',        'IMG-FFA',       'Retinal Imaging',   3500, NULL, 2, 'Imaging', TRUE),
    ('OCT Anterior Segment',                 'IMG-OCT-ANT',   'Corneal Imaging',   1500, NULL, 1, 'Imaging', TRUE),
    ('IOL Calculation (Barrett/Haigis)',     'IMG-IOL-CALC',  'Biometry',           400, NULL, 1, 'Imaging', TRUE),
    -- Scans / Functional
    ('Intraocular Pressure (Non-Contact)',   'SCN-IOP',       'Tonometry',          150, NULL, 1, 'Scan', TRUE),
    ('Humphrey Visual Field (HVF 24-2)',     'SCN-HVF',       'Perimetry',          800, NULL, 1, 'Scan', TRUE),
    ('Schirmer''s Test (Dry Eye)',           'SCN-SCHIRMER',  'Tear Film',          300, NULL, 1, 'Scan', TRUE),
    ('A-Scan Biometry (Immersion)',          'SCN-ASCAN',     'Biometry',           600, NULL, 1, 'Scan', TRUE),
    ('ECG (12-Lead Resting)',                'SCN-ECG',       'Cardiac',            250, NULL, 1, 'Scan', TRUE),
    ('Chest X-Ray (PA View)',                'SCN-CXR',       'Radiology',          400, NULL, 1, 'Scan', TRUE),
    ('Blood Pressure Measurement',          'SCN-BP',        'Vitals',              50, NULL, 1, 'Scan', TRUE),
    -- Lab
    ('Complete Blood Count (CBC)',           'LAB-GCBC',      'Haematology',        350, 'Blood (EDTA)',    4, 'Lab', TRUE),
    ('Fasting Blood Sugar (FBS)',            'LAB-GFBS',      'Biochemistry',       150, 'Blood (Serum)',   4, 'Lab', TRUE),
    ('Random Blood Sugar (RBS)',             'LAB-GRBS',      'Biochemistry',       150, 'Blood (Serum)',   2, 'Lab', TRUE),
    ('HbA1c (Glycated Haemoglobin)',         'LAB-GHBA1C',    'Biochemistry',       450, 'Blood (EDTA)',    6, 'Lab', TRUE),
    ('PT/INR (Coagulation)',                 'LAB-GPTINR',    'Coagulation',        400, 'Blood (Citrate)', 6, 'Lab', TRUE),
    ('Urine Routine Examination',            'LAB-GURINE',    'Urine',              150, 'Urine',           2, 'Lab', TRUE),
    ('Serum Creatinine',                     'LAB-GSCREAT',   'Biochemistry',       200, 'Blood (Serum)',   4, 'Lab', TRUE),
    ('Blood Urea Nitrogen',                  'LAB-GBUN',      'Biochemistry',       150, 'Blood (Serum)',   4, 'Lab', TRUE),
    ('LFT (Liver Function Test)',            'LAB-GLFT',      'Biochemistry',       450, 'Blood (Serum)',   6, 'Lab', TRUE),
    ('KFT (Kidney Function Test)',           'LAB-GKFT',      'Biochemistry',       450, 'Blood (Serum)',   6, 'Lab', TRUE),
    ('HBsAg (Hepatitis B)',                  'LAB-GHBSAG',    'Serology',           200, 'Blood (Serum)',   4, 'Lab', TRUE),
    ('Anti-HIV 1 & 2',                       'LAB-GHIV',      'Serology',           300, 'Blood (Serum)',   4, 'Lab', TRUE),
    ('Anti-HCV (Hepatitis C)',               'LAB-GHCV',      'Serology',           350, 'Blood (Serum)',   6, 'Lab', TRUE),
    ('Blood Group & Rh Factor',             'LAB-GBG',       'Blood Bank',          80, 'Blood (EDTA)',    2, 'Lab', TRUE),
    ('Surgical Profile (CBC + BG + BT/CT)', 'LAB-GSURGPROF', 'Pre-Operative Panel',600, 'Blood (EDTA)',    4, 'Lab', TRUE)
ON CONFLICT (test_code) DO UPDATE SET
    test_name        = EXCLUDED.test_name,
    category         = EXCLUDED.category,
    price            = EXCLUDED.price,
    specimen_type    = EXCLUDED.specimen_type,
    turnaround_hours = EXCLUDED.turnaround_hours,
    test_type        = EXCLUDED.test_type,
    updated_at       = NOW();

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICATION (run manually to check row counts)
-- ════════════════════════════════════════════════════════════════════════════
-- SELECT 'service_categories' AS tbl, COUNT(*) FROM service_categories
-- UNION ALL SELECT 'catalog_services',  COUNT(*) FROM catalog_services
-- UNION ALL SELECT 'service_variants',  COUNT(*) FROM service_variants
-- UNION ALL SELECT 'variant_prices',    COUNT(*) FROM variant_prices
-- UNION ALL SELECT 'iol_master',        COUNT(*) FROM iol_master
-- UNION ALL SELECT 'iol_prices',        COUNT(*) FROM iol_prices
-- UNION ALL SELECT 'lab_test_catalog (global)', COUNT(*) FROM lab_test_catalog WHERE tenant_id IS NULL;
