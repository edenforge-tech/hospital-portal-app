-- ========================================================================
-- SURGERY TYPES SEED DATA — COMPLETE (Tariff-aligned)
-- Hospital: Sai Jyothi Eye Institute
-- Source: Official Tariff List (March 2026)
-- Safe to re-run: ON CONFLICT (tenant_id, surgery_code) DO UPDATE
-- ========================================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id
    FROM tenant
    WHERE deleted_at IS NULL
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found. Create a tenant first.';
    END IF;

    PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
    RAISE NOTICE 'Seeding surgery types for tenant: %', v_tenant_id;
END $$;

-- ========================================================================
-- 1. CATARACT
-- ========================================================================

-- Phacoemulsification (base procedure — IOL priced separately via IOL catalog)
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Monofocal Indian Lens',
    'CATARACT-PHACO-MONO-IND',
    'Cataract', 'Surgical',
    TRUE, 35000.00, 'Per Eye', 'Monofocal',
    30, FALSE, 'Topical',
    35000, 35000, 1, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    requires_iol = EXCLUDED.requires_iol,
    typical_iol_types = EXCLUDED.typical_iol_types,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Monofocal Imported Lens (Alcon SP/Sensor I)',
    'CATARACT-PHACO-MONO-IMP1',
    'Cataract', 'Surgical',
    TRUE, 40000.00, 'Per Eye', 'Monofocal',
    30, FALSE, 'Topical',
    40000, 40000, 2, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Alcon IQ/Tecnis 1/Clareon',
    'CATARACT-PHACO-MONO-IMP2',
    'Cataract', 'Surgical',
    TRUE, 50000.00, 'Per Eye', 'Monofocal',
    30, FALSE, 'Topical',
    50000, 50000, 3, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Pre-Load Lens',
    'CATARACT-PHACO-PRELOAD',
    'Cataract', 'Surgical',
    TRUE, 55000.00, 'Per Eye', 'Monofocal',
    30, FALSE, 'Topical',
    55000, 55000, 4, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Eyhance 60cm Distance (EDOF)',
    'CATARACT-PHACO-EDOF',
    'Cataract', 'Surgical',
    TRUE, 60000.00, 'Per Eye', 'EDOF',
    30, FALSE, 'Topical',
    60000, 60000, 5, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Toric Lens',
    'CATARACT-PHACO-TORIC',
    'Cataract', 'Surgical',
    TRUE, 70000.00, 'Per Eye', 'Toric',
    30, FALSE, 'Topical',
    70000, 70000, 6, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Indian Multifocal (33cm)',
    'CATARACT-PHACO-MULTI-IND',
    'Cataract', 'Surgical',
    TRUE, 60000.00, 'Per Eye', 'Multifocal',
    35, FALSE, 'Topical',
    60000, 60000, 7, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Imported Multifocal (Zeiss/J&J, 33cm)',
    'CATARACT-PHACO-MULTI-IMP',
    'Cataract', 'Surgical',
    TRUE, 95000.00, 'Per Eye', 'Multifocal',
    35, FALSE, 'Topical',
    95000, 95000, 8, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Multifocal TORIC (Zeiss/J&J)',
    'CATARACT-PHACO-MULTORIC',
    'Cataract', 'Surgical',
    TRUE, 120000.00, 'Per Eye', 'ToricMultifocal',
    35, FALSE, 'Topical',
    120000, 120000, 9, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Indian Trifocal (33–60cm)',
    'CATARACT-PHACO-TRI-IND',
    'Cataract', 'Surgical',
    TRUE, 70000.00, 'Per Eye', 'Trifocal',
    35, FALSE, 'Topical',
    70000, 70000, 10, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Imported Trifocal (Zeiss/Alcon/J&J)',
    'CATARACT-PHACO-TRI-IMP',
    'Cataract', 'Surgical',
    TRUE, 120000.00, 'Per Eye', 'Trifocal',
    35, FALSE, 'Topical',
    120000, 120000, 11, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Imported Trifocal TORIC (Zeiss/Alcon/J&J)',
    'CATARACT-PHACO-TRITORIC',
    'Cataract', 'Surgical',
    TRUE, 150000.00, 'Per Eye', 'ToricMultifocal',
    35, FALSE, 'Topical',
    150000, 150000, 12, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Imported EDOF Lens (Vivity/PureSee)',
    'CATARACT-PHACO-EDOF-IMP',
    'Cataract', 'Surgical',
    TRUE, 120000.00, 'Per Eye', 'EDOF',
    35, FALSE, 'Topical',
    120000, 120000, 13, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure, typical_iol_types,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Phacoemulsification (MICS) — Imported EDOF Toric (Vivity Toric/PureSee Toric)',
    'CATARACT-PHACO-EDOF-TORIC',
    'Cataract', 'Surgical',
    TRUE, 150000.00, 'Per Eye', 'Toric',
    35, FALSE, 'Topical',
    150000, 150000, 14, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- YAG Capsulotomy (post-cataract laser)
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'YAG Capsulotomy',
    'CATARACT-YAG-CAPSULO',
    'Cataract', 'Laser',
    FALSE, 2500.00, 'Per Eye',
    10, FALSE, 'Topical',
    2500, 2500, 15, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 2. RETINA
-- ========================================================================

-- Vitrectomy procedures
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Vitrectomy 20g (With Suture)',
    'RETINA-VIT-20G',
    'Retina', 'Surgical',
    FALSE, 65000.00, 'Per Eye',
    90, TRUE, 'Local',
    65000, 65000, 20, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Vitrectomy 23g (Sutureless)',
    'RETINA-VIT-23G',
    'Retina', 'Surgical',
    FALSE, 85000.00, 'Per Eye',
    75, TRUE, 'Local',
    85000, 85000, 21, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Vitrectomy 25g (Sutureless with Disposable Kit)',
    'RETINA-VIT-25G',
    'Retina', 'Surgical',
    FALSE, 120000.00, 'Per Eye',
    70, TRUE, 'Local',
    120000, 120000, 22, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- Intravitreal injections — each drug is a separate line item per tariff
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection — IVTA (Triamcinolone)',
    'RETINA-IVTA',
    'Retina', 'Injection',
    FALSE, 10000.00, 'Per Eye',
    10, FALSE, 'Topical',
    10000, 10000, 23, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection — Razumab (Anti-VEGF)',
    'RETINA-IVT-RAZUMAB',
    'Retina', 'Injection',
    FALSE, 25000.00, 'Per Eye',
    10, FALSE, 'Topical',
    25000, 25000, 24, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection — Accentrix (Anti-VEGF)',
    'RETINA-IVT-ACCENTRIX',
    'Retina', 'Injection',
    FALSE, 35000.00, 'Per Eye',
    10, FALSE, 'Topical',
    35000, 35000, 25, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection — Paganex (Anti-VEGF)',
    'RETINA-IVT-PAGANEX',
    'Retina', 'Injection',
    FALSE, 45000.00, 'Per Eye',
    10, FALSE, 'Topical',
    45000, 45000, 26, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection — Ozurdex (Dexamethasone Implant)',
    'RETINA-IVT-OZURDEX',
    'Retina', 'Injection',
    FALSE, 45000.00, 'Per Eye',
    10, FALSE, 'Topical',
    45000, 45000, 27, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'IVT Injection — Eylea (Aflibercept)',
    'RETINA-IVT-EYLEA',
    'Retina', 'Injection',
    FALSE, 75000.00, 'Per Eye',
    10, FALSE, 'Topical',
    75000, 75000, 28, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- Retina Laser procedures
INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Barrage Laser',
    'RETINA-LASER-BARRAGE',
    'Retina', 'Laser',
    FALSE, 5000.00, 'Per Eye',
    20, FALSE, 'Topical',
    5000, 5000, 29, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRP Laser (Pan Retinal Photocoagulation)',
    'RETINA-LASER-PRP',
    'Retina', 'Laser',
    FALSE, 3500.00, 'Per Eye',
    30, FALSE, 'Topical',
    3500, 3500, 30, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 3. GLAUCOMA
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Trabeculectomy with MMC',
    'GLAUCOMA-TRAB-MMC',
    'Glaucoma', 'Surgical',
    FALSE, 40000.00, 'Per Eye',
    60, FALSE, 'Local',
    40000, 40000, 40, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'YAG PI (Peripheral Iridotomy)',
    'GLAUCOMA-YAG-PI',
    'Glaucoma', 'Laser',
    FALSE, 3000.00, 'Per Eye',
    10, FALSE, 'Topical',
    3000, 3000, 41, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 4. OCULOPLASTY
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'DCR (Dacryocystorhinostomy)',
    'OCULOPLASTY-DCR',
    'Oculoplasty', 'Surgical',
    FALSE, 50000.00, 'Per Eye',   -- tariff: ₹50k (was seeded as ₹35k — FIXED)
    90, FALSE, 'General',
    50000, 50000, 50, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DCT (Dacryocystectomy)',
    'OCULOPLASTY-DCT',
    'Oculoplasty', 'Surgical',
    FALSE, 35000.00, 'Per Eye',
    60, FALSE, 'Local',
    35000, 35000, 51, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Ptosis Surgery',
    'OCULOPLASTY-PTOSIS',
    'Oculoplasty', 'Surgical',
    FALSE, 35000.00, 'Per Eye',   -- tariff: ₹35k (was seeded as ₹50k — FIXED)
    60, FALSE, 'Local',
    35000, 35000, 52, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Chalazion Excision',
    'OCULOPLASTY-CHALAZION',
    'Oculoplasty', 'Surgical',
    FALSE, 5000.00, 'Per Eye',
    20, FALSE, 'Local',
    5000, 5000, 53, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 5. SQUINT / STRABISMUS
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Squint Surgery (Per Muscle)',
    'SQUINT-MUSCLE',
    'Strabismus', 'Surgical',
    FALSE, 30000.00, 'Per Muscle',
    45, FALSE, 'General',
    30000, 30000, 60, TRUE, NOW(), NOW()
) ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 6. CORNEA
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Penetrating Keratoplasty (PK)',
    'CORNEA-PK',
    'Cornea', 'Surgical',
    FALSE, 80000.00, 'Per Eye',
    120, TRUE, 'General',
    80000, 80000, 70, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Pterygium Excision',
    'CORNEA-PTERYGIUM-BASIC',
    'Cornea', 'Surgical',
    FALSE, 20000.00, 'Per Eye',
    30, FALSE, 'Local',
    20000, 20000, 71, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Pterygium Excision with Conjunctival Autograft (CAG)',
    'CORNEA-PTERYGIUM-CAG',
    'Cornea', 'Surgical',
    FALSE, 30000.00, 'Per Eye',   -- tariff: ₹30k (was seeded as ₹20k — FIXED)
    45, FALSE, 'Local',
    30000, 30000, 72, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Corneal Tattooing',
    'CORNEA-TATTOOING',
    'Cornea', 'Surgical',
    FALSE, 45000.00, 'Per Eye',
    30, FALSE, 'Local',
    45000, 45000, 73, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Keratoconus C3R — Isotonic',
    'CORNEA-C3R-ISOTONIC',
    'Cornea', 'Laser',
    FALSE, 45000.00, 'Per Eye',
    60, FALSE, 'Topical',
    45000, 45000, 74, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Keratoconus C3R — Hypotonic',
    'CORNEA-C3R-HYPOTONIC',
    'Cornea', 'Laser',
    FALSE, 55000.00, 'Per Eye',
    60, FALSE, 'Topical',
    55000, 55000, 75, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DALK (Deep Anterior Lamellar Keratoplasty)',
    'CORNEA-DALK',
    'Cornea', 'Surgical',
    FALSE, 80000.00, 'Per Eye',
    120, TRUE, 'General',
    80000, 80000, 76, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'DSEK / DMEK (Endothelial Keratoplasty)',
    'CORNEA-DSEK-DMEK',
    'Cornea', 'Surgical',
    FALSE, 80000.00, 'Per Eye',
    90, FALSE, 'Local',
    80000, 80000, 77, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Amniotic Membrane Transplant',
    'CORNEA-AMT',
    'Cornea', 'Surgical',
    FALSE, 25000.00, 'Per Eye',
    30, FALSE, 'Topical',
    25000, 25000, 78, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Intracorneal Ring Segments (ICRS)',
    'CORNEA-ICRS',
    'Cornea', 'Surgical',
    FALSE, 50000.00, 'Per Eye',
    30, FALSE, 'Topical',
    50000, 50000, 79, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 7. REFRACTIVE / LASIK
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
-- PRK variants
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Standard',
    'LASIK-PRK-STANDARD',
    'Refractive', 'Laser',
    FALSE, 35000.00, 'Both Eyes',
    20, FALSE, 'Topical',
    35000, 35000, 90, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Customized',
    'LASIK-PRK-CUSTOMIZED',
    'Refractive', 'Laser',
    FALSE, 65000.00, 'Both Eyes',
    20, FALSE, 'Topical',
    65000, 65000, 91, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Contoura',
    'LASIK-PRK-CONTOURA',
    'Refractive', 'Laser',
    FALSE, 95000.00, 'Both Eyes',
    20, FALSE, 'Topical',
    95000, 95000, 92, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'PRK + Wavelight Plus',
    'LASIK-PRK-WAVELIGHT',
    'Refractive', 'Laser',
    FALSE, 150000.00, 'Both Eyes',
    20, FALSE, 'Topical',
    150000, 150000, 93, TRUE, NOW(), NOW()
),
-- Femto LASIK variants
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto LASIK + Customized',
    'LASIK-FEMTO-CUSTOMIZED',
    'Refractive', 'Laser',
    FALSE, 100000.00, 'Both Eyes',
    25, FALSE, 'Topical',
    100000, 100000, 94, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto LASIK + Contoura',
    'LASIK-FEMTO-CONTOURA',
    'Refractive', 'Laser',
    FALSE, 120000.00, 'Both Eyes',
    25, FALSE, 'Topical',
    120000, 120000, 95, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Femto LASIK + Wavelight Plus',
    'LASIK-FEMTO-WAVELIGHT',
    'Refractive', 'Laser',
    FALSE, 180000.00, 'Both Eyes',
    25, FALSE, 'Topical',
    180000, 180000, 96, TRUE, NOW(), NOW()
),
-- SMILE Pro
(
    current_setting('app.seed_tenant_id')::UUID,
    'Smile Pro',
    'LASIK-SMILE-PRO',
    'Refractive', 'Laser',
    FALSE, 160000.00, 'Both Eyes',
    20, FALSE, 'Topical',
    160000, 160000, 97, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 8. ICL (Implantable Collamer Lens) — Surgery Types
--    Note: ICL lenses also exist in iol_catalog_master for lens selection.
--          These surgery_type records are for procedure scheduling/billing.
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'ICL Non-Toric — Indian (Phakic IOL)',
    'ICL-NONTORIC-INDIAN',
    'Refractive', 'Surgical',
    TRUE, 70000.00, 'Per Eye',
    30, FALSE, 'Topical',
    70000, 70000, 100, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'ICL Non-Toric — Imported (EVO ICL)',
    'ICL-NONTORIC-IMPORTED',
    'Refractive', 'Surgical',
    TRUE, 90000.00, 'Per Eye',
    30, FALSE, 'Topical',
    90000, 90000, 101, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'ICL Toric — Indian (Phakic IOL)',
    'ICL-TORIC-INDIAN',
    'Refractive', 'Surgical',
    TRUE, 90000.00, 'Per Eye',
    30, FALSE, 'Topical',
    90000, 90000, 102, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'ICL Toric — Imported (EVO Toric ICL)',
    'ICL-TORIC-IMPORTED',
    'Refractive', 'Surgical',
    TRUE, 120000.00, 'Per Eye',
    30, FALSE, 'Topical',
    120000, 120000, 103, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- 9. GENERAL / MISCELLANEOUS
-- ========================================================================

INSERT INTO surgery_types (
    tenant_id, surgery_name, surgery_code, surgery_category, procedure_type,
    requires_iol, default_price, unit_of_measure,
    typical_duration_minutes, requires_admission, anesthesia_type,
    estimated_cost_min, estimated_cost_max, display_order, is_active,
    created_at, updated_at
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'BCL Fitting (Bandage Contact Lens)',
    'GENERAL-BCL',
    'General', 'Procedure',
    FALSE, 500.00, 'Per Eye',
    5, FALSE, 'Topical',
    500, 500, 110, TRUE, NOW(), NOW()
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'General Anaesthesia (Add-on for any procedure)',
    'GENERAL-GA-ADDON',
    'General', 'Anaesthesia',
    FALSE, 10000.00, 'Per Procedure',
    0, FALSE, 'General',
    10000, 10000, 111, TRUE, NOW(), NOW()
)
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET
    surgery_name = EXCLUDED.surgery_name,
    default_price = EXCLUDED.default_price,
    updated_at = NOW();

-- ========================================================================
-- SUMMARY
-- ========================================================================

DO $$
DECLARE
    v_total INTEGER;
    v_tid UUID;
    r RECORD;
BEGIN
    SELECT current_setting('app.seed_tenant_id')::UUID INTO v_tid;
    SELECT COUNT(*) INTO v_total FROM surgery_types
    WHERE tenant_id = v_tid AND deleted_at IS NULL;

    RAISE NOTICE '==================================================';
    RAISE NOTICE ' SURGERY TYPES SEED COMPLETE';
    RAISE NOTICE ' Total records: %', v_total;
    RAISE NOTICE '==================================================';

    -- Per-category counts
    FOR r IN (
        SELECT surgery_category, COUNT(*) AS cnt
        FROM surgery_types
        WHERE tenant_id = v_tid AND deleted_at IS NULL
        GROUP BY surgery_category
        ORDER BY surgery_category
    ) LOOP
        RAISE NOTICE '  %-20s : %', r.surgery_category, r.cnt;
    END LOOP;
    RAISE NOTICE '==================================================';
END $$;
