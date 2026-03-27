-- ============================================================================
-- FIX + SEED: Surgery Types — Sai Jyothi Eye Institute Full Tariff
-- Date: March 2026
-- Safe to re-run: ON CONFLICT (tenant_id, surgery_code) DO UPDATE
-- Fixes: tenant_id mismatch, missing procedures, wrong prices, new categories
-- ============================================================================

-- Step 1: Resolve canonical tenant_id and fix mismatched rows
DO $$
DECLARE
    v_tenant_id UUID;
    v_deleted   INT;
    v_updated   INT;
BEGIN
    -- Get correct tenant_id from items visible in the UI
    SELECT DISTINCT tenant_id INTO v_tenant_id
    FROM surgery_types
    WHERE surgery_name IN (
        'Phacoemulsification with IOL',
        'Manual Small Incision Cataract Surgery (MSICS)',
        'Premium IOL Cataract Surgery'
    )
    AND deleted_at IS NULL
    LIMIT 1;

    -- Fallback: any active surgery_type row
    IF v_tenant_id IS NULL THEN
        SELECT DISTINCT tenant_id INTO v_tenant_id
        FROM surgery_types WHERE deleted_at IS NULL LIMIT 1;
    END IF;

    -- Final fallback: tenant table
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenant WHERE deleted_at IS NULL LIMIT 1;
    END IF;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found. Create a tenant first.';
    END IF;

    PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
    RAISE NOTICE 'Canonical tenant_id: %', v_tenant_id;

    -- Step A: Delete wrong-tenant rows whose surgery_code already exists under correct tenant
    -- (avoids unique constraint violation on subsequent UPDATE)
    DELETE FROM surgery_types
    WHERE tenant_id != v_tenant_id
      AND deleted_at IS NULL
      AND surgery_code IN (
          SELECT surgery_code FROM surgery_types
          WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
      );

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate wrong-tenant rows (dupe surgery_codes)', v_deleted;

    -- Step B: Reassign remaining wrong-tenant rows to correct tenant
    UPDATE surgery_types
    SET tenant_id = v_tenant_id, updated_at = NOW()
    WHERE tenant_id != v_tenant_id AND deleted_at IS NULL;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE 'Reassigned % rows to correct tenant', v_updated;
END $$;

-- ============================================================================
-- CATARACT (surgery_category = 'Cataract') — 15 variants
-- ============================================================================

-- Monofocal Indian (₹35,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Monofocal Indian Lens (Supraphob/Premium)', 'CAT-MONO-IND-35K', 'Cataract', 'Surgical', TRUE, 35000, 'Per Eye', 'Monofocal', 30, FALSE, 'Topical', 35000, 35000, 1, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Monofocal Imported 40k (Alcon SP/Sensor I)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Monofocal Imported — Alcon SP/Sensor I (₹40,000)', 'CAT-MONO-IMP-40K', 'Cataract', 'Surgical', TRUE, 40000, 'Per Eye', 'Monofocal', 30, FALSE, 'Topical', 40000, 40000, 2, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Monofocal Imported 50k (Alcon IQ/Tecnis/Clareon)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Monofocal Imported — Alcon IQ/Tecnis/Clareon (₹50,000)', 'CAT-MONO-IMP-50K', 'Cataract', 'Surgical', TRUE, 50000, 'Per Eye', 'Monofocal', 30, FALSE, 'Topical', 50000, 50000, 3, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Monofocal Pre-Load Lens (₹55,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Pre-Load Monofocal Lens (₹55,000)', 'CAT-MONO-PRELOAD-55K', 'Cataract', 'Surgical', TRUE, 55000, 'Per Eye', 'Monofocal', 30, FALSE, 'Topical', 55000, 55000, 4, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Eyhance EDOF 60cm (₹60,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Eyhance 60cm Distance Lens (₹60,000)', 'CAT-EDOF-EYHANCE-60K', 'Cataract', 'Surgical', TRUE, 60000, 'Per Eye', 'EDOF', 30, FALSE, 'Topical', 60000, 60000, 5, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Toric Monofocal (₹70,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Toric Monofocal Lens (₹70,000)', 'CAT-TORIC-MONO-70K', 'Cataract', 'Surgical', TRUE, 70000, 'Per Eye', 'Toric', 30, FALSE, 'Topical', 70000, 70000, 6, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Indian Multifocal 33cm (₹60,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Indian Multifocal 33cm (₹60,000)', 'CAT-MULTI-IND-60K', 'Cataract', 'Surgical', TRUE, 60000, 'Per Eye', 'Multifocal', 30, FALSE, 'Topical', 60000, 60000, 7, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Imported Multifocal 33cm (₹95,000) - Zeiss/J&J
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Imported Multifocal 33cm — Zeiss/J&J (₹95,000)', 'CAT-MULTI-IMP-95K', 'Cataract', 'Surgical', TRUE, 95000, 'Per Eye', 'Multifocal', 30, FALSE, 'Topical', 95000, 95000, 8, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Multifocal Toric (₹1,20,000) - Zeiss/J&J
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Multifocal Toric — Zeiss/J&J (₹1,20,000)', 'CAT-MULTI-TORIC-120K', 'Cataract', 'Surgical', TRUE, 120000, 'Per Eye', 'ToricMultifocal', 30, FALSE, 'Topical', 120000, 120000, 9, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Indian Trifocal 33-60cm-Distance (₹70,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Indian Trifocal 33-60cm-Distance (₹70,000)', 'CAT-TRIFOCAL-IND-70K', 'Cataract', 'Surgical', TRUE, 70000, 'Per Eye', 'Trifocal', 30, FALSE, 'Topical', 70000, 70000, 10, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Imported Trifocal (₹1,20,000) - Zeiss/Alcon/J&J
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Imported Trifocal — Zeiss/Alcon/J&J (₹1,20,000)', 'CAT-TRIFOCAL-IMP-120K', 'Cataract', 'Surgical', TRUE, 120000, 'Per Eye', 'Trifocal', 30, FALSE, 'Topical', 120000, 120000, 11, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Imported Trifocal Toric (₹1,50,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Imported Trifocal Toric (₹1,50,000)', 'CAT-TRIFOCAL-TORIC-150K', 'Cataract', 'Surgical', TRUE, 150000, 'Per Eye', 'Trifocal', 30, FALSE, 'Topical', 150000, 150000, 12, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Imported EDOF Lens (₹1,20,000) - Vivity/PureSee
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Imported EDOF 40cm-Distance — Vivity/PureSee (₹1,20,000)', 'CAT-EDOF-IMP-120K', 'Cataract', 'Surgical', TRUE, 120000, 'Per Eye', 'EDOF', 30, FALSE, 'Topical', 120000, 120000, 13, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- Imported EDOF Toric (₹1,50,000) - Vivity Toric/PureSee Toric
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Phaco + Imported EDOF Toric — Vivity/PureSee Toric (₹1,50,000)', 'CAT-EDOF-TORIC-150K', 'Cataract', 'Surgical', TRUE, 150000, 'Per Eye', 'EDOF', 30, FALSE, 'Topical', 150000, 150000, 14, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- YAG Capsulotomy (₹2,500)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'YAG Laser Capsulotomy', 'CAT-YAG-CAPSULOTOMY', 'Cataract', 'Laser', FALSE, 2500, 'Per Eye', 10, FALSE, 'Topical', 2500, 2500, 15, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, default_price = EXCLUDED.default_price, updated_at = NOW();

-- MSICS (₹35,000) — keep the existing working row, just ensure consistent data
UPDATE surgery_types
SET surgery_category = 'Cataract', default_price = 35000, updated_at = NOW()
WHERE surgery_name ILIKE '%Manual Small Incision%'
AND tenant_id = current_setting('app.seed_tenant_id')::UUID
AND deleted_at IS NULL;

-- ============================================================================
-- RETINA (surgery_category = 'Retina') — 11 procedures
-- ============================================================================

-- 20g Vitrectomy
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Vitrectomy 20g', 'RET-VIT-20G', 'Retina', 'Surgical', FALSE, 65000, 'Per Eye', 90, TRUE, 'General', 65000, 65000, 101, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- 23g Vitrectomy
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Vitrectomy 23g', 'RET-VIT-23G', 'Retina', 'Surgical', FALSE, 85000, 'Per Eye', 90, TRUE, 'General', 85000, 85000, 102, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- 25g Vitrectomy
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Vitrectomy 25g', 'RET-VIT-25G', 'Retina', 'Surgical', FALSE, 120000, 'Per Eye', 90, TRUE, 'General', 120000, 120000, 103, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- IVTA (₹10,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'IVT Triamcinolone (IVTA)', 'RET-IVTA', 'Retina', 'Injection', FALSE, 10000, 'Per Eye', 15, FALSE, 'Topical', 10000, 10000, 104, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- IVT Razumab (₹25,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'IVT Razumab (Anti-VEGF)', 'RET-IVT-RAZUMAB', 'Retina', 'Injection', FALSE, 25000, 'Per Eye', 15, FALSE, 'Topical', 25000, 25000, 105, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- IVT Accentrix (₹35,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'IVT Accentrix (Anti-VEGF)', 'RET-IVT-ACCENTRIX', 'Retina', 'Injection', FALSE, 35000, 'Per Eye', 15, FALSE, 'Topical', 35000, 35000, 106, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- IVT Paganex (₹45,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'IVT Paganex (Anti-VEGF)', 'RET-IVT-PAGANEX', 'Retina', 'Injection', FALSE, 45000, 'Per Eye', 15, FALSE, 'Topical', 45000, 45000, 107, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- IVT Ozurdex (₹45,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'IVT Ozurdex (Dexamethasone Implant)', 'RET-IVT-OZURDEX', 'Retina', 'Injection', FALSE, 45000, 'Per Eye', 15, FALSE, 'Topical', 45000, 45000, 108, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- IVT Eylea (₹75,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'IVT Eylea (Aflibercept)', 'RET-IVT-EYLEA', 'Retina', 'Injection', FALSE, 75000, 'Per Eye', 15, FALSE, 'Topical', 75000, 75000, 109, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Barrage Laser (₹5,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Barrage Laser', 'RET-BARRAGE-LASER', 'Retina', 'Laser', FALSE, 5000, 'Per Eye', 20, FALSE, 'Topical', 5000, 5000, 110, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- PRP Laser (₹3,500)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'PRP Laser (Pan Retinal Photocoagulation)', 'RET-PRP-LASER', 'Retina', 'Laser', FALSE, 3500, 'Per Eye', 20, FALSE, 'Topical', 3500, 3500, 111, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Retina', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- GLAUCOMA (surgery_category = 'Glaucoma') — 3 procedures
-- ============================================================================

-- Trabeculectomy with MMC (₹40,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Trabeculectomy with MMC', 'GLAU-TRAB-MMC', 'Glaucoma', 'Surgical', FALSE, 40000, 'Per Eye', 60, TRUE, 'Peribulbar', 40000, 40000, 201, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Glaucoma', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Tube Shunt Surgery (₹70,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Tube Shunt Surgery', 'GLAU-TUBE-SHUNT', 'Glaucoma', 'Surgical', FALSE, 70000, 'Per Eye', 90, TRUE, 'General', 70000, 70000, 202, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Glaucoma', default_price = EXCLUDED.default_price, updated_at = NOW();

-- YAG PI (₹3,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'YAG Peripheral Iridotomy (YAG PI)', 'GLAU-YAG-PI', 'Glaucoma', 'Laser', FALSE, 3000, 'Per Eye', 10, FALSE, 'Topical', 3000, 3000, 203, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Glaucoma', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- CORNEA (surgery_category = 'Cornea') — 8 procedures
-- Note: Keratoconus C3R also lives here
-- ============================================================================

-- Penetrating Keratoplasty (₹80,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Penetrating Keratoplasty (Full Thickness Graft)', 'COR-PK', 'Cornea', 'Surgical', FALSE, 80000, 'Per Eye', 90, TRUE, 'General', 80000, 80000, 301, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Pterygium Excision Basic (₹20,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Pterygium Excision (Basic)', 'COR-PTERY-BASIC', 'Cornea', 'Surgical', FALSE, 20000, 'Per Eye', 30, FALSE, 'Peribulbar', 20000, 20000, 302, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Pterygium Excision with CAG (₹30,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Pterygium Excision with Conjunctival Autograft (CAG)', 'COR-PTERY-CAG', 'Cornea', 'Surgical', FALSE, 30000, 'Per Eye', 45, FALSE, 'Peribulbar', 30000, 30000, 303, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Corneal Tattooing (₹45,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Corneal Tattooing', 'COR-TATTOOING', 'Cornea', 'Surgical', FALSE, 45000, 'Per Eye', 45, FALSE, 'Peribulbar', 45000, 45000, 304, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Isotonic C3R (₹45,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Isotonic C3R (Collagen Cross-Linking)', 'COR-C3R-ISOTONIC', 'Cornea', 'Laser', FALSE, 45000, 'Per Eye', 60, FALSE, 'Topical', 45000, 45000, 305, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Hypotonic C3R (₹55,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Hypotonic C3R (Collagen Cross-Linking)', 'COR-C3R-HYPOTONIC', 'Cornea', 'Laser', FALSE, 55000, 'Per Eye', 60, FALSE, 'Topical', 55000, 55000, 306, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- BCL (Bandage Contact Lens) (₹500)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'BCL (Bandage Contact Lens) Fitting', 'COR-BCL', 'Cornea', 'Procedure', FALSE, 500, 'Per Eye', 5, FALSE, 'None', 500, 500, 307, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Cornea', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- REFRACTIVE (surgery_category = 'Refractive') — 10 procedures
-- ============================================================================

-- PRK Standard (₹35,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'PRK — Standard', 'REF-PRK-STD', 'Refractive', 'Laser', FALSE, 35000, 'Both Eyes', 30, FALSE, 'Topical', 35000, 35000, 401, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- PRK Customized (₹65,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'PRK — Customized', 'REF-PRK-CUSTOM', 'Refractive', 'Laser', FALSE, 65000, 'Both Eyes', 30, FALSE, 'Topical', 65000, 65000, 402, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- PRK Contoura (₹95,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'PRK — Contoura', 'REF-PRK-CONTOURA', 'Refractive', 'Laser', FALSE, 95000, 'Both Eyes', 30, FALSE, 'Topical', 95000, 95000, 403, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- PRK Wavelight Plus (₹1,50,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'PRK — Wavelight Plus', 'REF-PRK-WVPLUS', 'Refractive', 'Laser', FALSE, 150000, 'Both Eyes', 30, FALSE, 'Topical', 150000, 150000, 404, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Femto LASIK Customized (₹1,00,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Femto LASIK — Customized', 'REF-FEMTO-CUSTOM', 'Refractive', 'Laser', FALSE, 100000, 'Both Eyes', 20, FALSE, 'Topical', 100000, 100000, 405, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Femto LASIK Contoura (₹1,20,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Femto LASIK — Contoura', 'REF-FEMTO-CONTOURA', 'Refractive', 'Laser', FALSE, 120000, 'Both Eyes', 20, FALSE, 'Topical', 120000, 120000, 406, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Femto LASIK Wavelight Plus (₹1,80,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Femto LASIK — Wavelight Plus', 'REF-FEMTO-WVPLUS', 'Refractive', 'Laser', FALSE, 180000, 'Both Eyes', 20, FALSE, 'Topical', 180000, 180000, 407, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- SMILE Pro (₹1,60,000 Both Eyes)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'SMILE Pro', 'REF-SMILE-PRO', 'Refractive', 'Laser', FALSE, 160000, 'Both Eyes', 15, FALSE, 'Topical', 160000, 160000, 408, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ICL Non-Toric Indian (₹70,000 Per Eye)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'ICL Implantation — Non-Toric Indian (₹70,000)', 'REF-ICL-NONTORIC-IND', 'Refractive', 'Surgical', FALSE, 70000, 'Per Eye', 30, FALSE, 'Topical', 70000, 70000, 409, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ICL Non-Toric Imported (₹90,000 Per Eye)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'ICL Implantation — Non-Toric Imported (₹90,000)', 'REF-ICL-NONTORIC-IMP', 'Refractive', 'Surgical', FALSE, 90000, 'Per Eye', 30, FALSE, 'Topical', 90000, 90000, 410, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ICL Toric Indian (₹90,000 Per Eye)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'ICL Implantation — Toric Indian (₹90,000)', 'REF-ICL-TORIC-IND', 'Refractive', 'Surgical', FALSE, 90000, 'Per Eye', 30, FALSE, 'Topical', 90000, 90000, 411, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ICL Toric Imported (₹1,20,000 Per Eye)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'ICL Implantation — Toric Imported (₹1,20,000)', 'REF-ICL-TORIC-IMP', 'Refractive', 'Surgical', FALSE, 120000, 'Per Eye', 30, FALSE, 'Topical', 120000, 120000, 412, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Refractive', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- OCULOPLASTY (surgery_category = 'Oculoplasty') — 5 procedures
-- ============================================================================

-- DCR (₹50,000) — upsert with correct price
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'DCR (Dacryocystorhinostomy)', 'OCULO-DCR', 'Oculoplasty', 'Surgical', FALSE, 50000, 'Per Eye', 60, TRUE, 'General', 50000, 50000, 501, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Oculoplasty', default_price = 50000, estimated_cost_min = 50000, estimated_cost_max = 50000, updated_at = NOW();

-- DCT (₹35,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'DCT (Dacryocystostomy)', 'OCULO-DCT', 'Oculoplasty', 'Surgical', FALSE, 35000, 'Per Eye', 45, TRUE, 'General', 35000, 35000, 502, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Oculoplasty', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Ptosis (₹35,000) — upsert with correct price
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Ptosis Correction', 'OCULO-PTOSIS', 'Oculoplasty', 'Surgical', FALSE, 35000, 'Per Eye', 60, TRUE, 'General', 35000, 35000, 503, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Oculoplasty', default_price = 35000, estimated_cost_min = 35000, estimated_cost_max = 35000, updated_at = NOW();

-- Chalazion Excision (₹5,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Chalazion Excision', 'OCULO-CHALAZION', 'Oculoplasty', 'Surgical', FALSE, 5000, 'Per Eye', 20, FALSE, 'Local', 5000, 5000, 504, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Oculoplasty', default_price = EXCLUDED.default_price, updated_at = NOW();

-- Entropion/Ectropion Repair (₹30,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Entropion/Ectropion Repair', 'OCULO-ENTRO-ECTRO', 'Oculoplasty', 'Surgical', FALSE, 30000, 'Per Eye', 45, FALSE, 'Local', 30000, 30000, 505, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Oculoplasty', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- STRABISMUS (surgery_category = 'Strabismus') — 1 procedure
-- ============================================================================

-- Squint Surgery Per Muscle (₹30,000)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Squint Surgery (Per Muscle)', 'SQUINT-PER-MUSCLE', 'Strabismus', 'Surgical', FALSE, 30000, 'Per Eye', 45, TRUE, 'General', 30000, 30000, 601, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Strabismus', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- GENERAL (surgery_category = 'General') — 2 procedures
-- ============================================================================

-- BCL also in General (cross-listed from Cornea for standalone ordering)
INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'General Anaesthesia Add-On', 'GEN-GA-ADDON', 'General', 'Procedure', FALSE, 10000, 'Per Procedure', 0, FALSE, 'General', 10000, 10000, 701, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'General', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- DIAGNOSTIC (surgery_category = 'Diagnostic') — 10 procedures
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'A-Scan Biometry', 'DIAG-ASCAN', 'Diagnostic', 'Diagnostic', FALSE, 1500, 'Per Eye', 10, FALSE, 'None', 1500, 1500, 801, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'B-Scan Ultrasonography', 'DIAG-BSCAN', 'Diagnostic', 'Diagnostic', FALSE, 1000, 'Per Eye', 10, FALSE, 'None', 1000, 1000, 802, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Fundus Photography', 'DIAG-FUNDUS', 'Diagnostic', 'Diagnostic', FALSE, 500, 'Per Eye', 5, FALSE, 'None', 500, 500, 803, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'OCT (Optical Coherence Tomography)', 'DIAG-OCT', 'Diagnostic', 'Diagnostic', FALSE, 1500, 'Per Eye', 10, FALSE, 'None', 1500, 1500, 804, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'OCT Macula', 'DIAG-OCT-MACULA', 'Diagnostic', 'Diagnostic', FALSE, 1500, 'Per Eye', 10, FALSE, 'None', 1500, 1500, 805, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'CCT (Central Corneal Thickness)', 'DIAG-CCT', 'Diagnostic', 'Diagnostic', FALSE, 500, 'Per Eye', 5, FALSE, 'None', 500, 500, 806, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'OCT RNFL', 'DIAG-OCT-RNFL', 'Diagnostic', 'Diagnostic', FALSE, 1500, 'Per Eye', 10, FALSE, 'None', 1500, 1500, 807, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'AS-OCT (Anterior Segment OCT)', 'DIAG-AS-OCT', 'Diagnostic', 'Diagnostic', FALSE, 1500, 'Per Eye', 10, FALSE, 'None', 1500, 1500, 808, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'HVF Fields (Humphrey Visual Field)', 'DIAG-HVF', 'Diagnostic', 'Diagnostic', FALSE, 1000, 'Per Eye', 20, FALSE, 'None', 1000, 1000, 809, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at)
VALUES (current_setting('app.seed_tenant_id')::UUID, 'Surgical Profile', 'DIAG-SURGICAL-PROFILE', 'Diagnostic', 'Diagnostic', FALSE, 1950, 'Per Visit', 15, FALSE, 'None', 1950, 1950, 810, TRUE, NOW(), NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, surgery_category = 'Diagnostic', default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- VERIFY — final count per category
-- ============================================================================
SELECT surgery_category, COUNT(*) AS count_in_db
FROM surgery_types
WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID
AND deleted_at IS NULL AND is_active = TRUE
GROUP BY surgery_category
ORDER BY surgery_category;
