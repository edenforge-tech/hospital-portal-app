-- ============================================================
-- Migration 98: Seed IOL Catalog with Real Commercial Models
-- CORRECTED: brand_manufacturer column, valid CHECK constraint values
-- origin IN ('Indian','Imported')
-- lens_category IN ('Standard','Premium','Deluxe')
-- iol_type IN ('Monofocal','Multifocal','Trifocal','EDOF','Toric','ToricMultifocal','ICL')
-- Safe to re-run (ON CONFLICT (product_code) DO NOTHING)
-- ============================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' AND deleted_at IS NULL ORDER BY created_at LIMIT 1;
    IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'No active tenant found. Create a tenant first.'; END IF;
    PERFORM set_config('app.current_tenant_id', v_tenant_id::text, false);
    RAISE NOTICE 'Seeding IOL catalog for tenant: %', v_tenant_id;

    -- ─── Monofocal Hydrophobic Imported (Premium) ─────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AcrySof IQ SN60WF', 'Alcon', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 34.0, 0.5, 119.0, 8500.00, 'SN60WF', true, 10, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Clareon CNA0T0', 'Alcon', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 34.0, 0.5, 119.3, 9500.00, 'CNA0T0', true, 11, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Tecnis 1-Piece ZCB00', 'Johnson & Johnson Vision', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 5.0, 34.0, 0.5, 119.0, 8800.00, 'ZCB00', true, 12, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Eyhance ICB00', 'Johnson & Johnson Vision', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 5.0, 34.0, 0.5, 119.1, 9200.00, 'ICB00', true, 13, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'iMics1 NY-60', 'HOYA', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 35.0, 0.5, 119.2, 7800.00, 'NY-60', true, 14, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'HOYA XY1 Vivinex', 'HOYA', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 35.0, 0.5, 119.3, 9000.00, 'XY1', true, 15, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Bausch + Lomb enVista MX60E', 'Bausch + Lomb', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 35.0, 0.5, 119.1, 8200.00, 'MX60E', true, 16, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Bausch + Lomb LI61AO', 'Bausch + Lomb', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 35.0, 0.5, 119.1, 7900.00, 'LI61AO', true, 17, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'CT LUCIA 611P', 'Carl Zeiss Meditec', 'Monofocal', 'Imported', 'Premium', 'Hydrophobic Acrylic', 0.0, 32.0, 0.5, 119.0, 7500.00, 'CT611P', true, 18, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── Monofocal Hydrophilic Imported (Standard) ────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Akreos MICS MI60', 'Bausch + Lomb', 'Monofocal', 'Imported', 'Standard', 'Hydrophilic Acrylic', 0.0, 32.0, 0.5, 118.0, 6500.00, 'MI60', true, 19, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Rayner EMV 630F', 'Rayner', 'Monofocal', 'Imported', 'Standard', 'Hydrophilic Acrylic', 0.0, 35.0, 0.5, 118.6, 7200.00, 'EMV630F', true, 20, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Santen IncontinEX Q-Flex', 'Santen', 'Monofocal', 'Imported', 'Standard', 'Hydrophobic Acrylic', 0.0, 35.0, 0.5, 118.9, 8600.00, 'QFLEX', true, 21, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── Monofocal Indian (Standard) ──────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AUROFLEX AU00T', 'Aurolab', 'Monofocal', 'Indian', 'Standard', 'Hydrophobic Acrylic', 0.0, 34.0, 0.5, 118.8, 3200.00, 'AU00T', true, 50, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AUROLENS PMMA 570C', 'Aurolab', 'Monofocal', 'Indian', 'Standard', 'PMMA', 0.0, 34.0, 0.5, 118.1, 800.00, 'AURO570C', true, 51, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Appasamy Eyecryl Plus', 'Appasamy Associates', 'Monofocal', 'Indian', 'Standard', 'Hydrophilic Acrylic', 0.0, 34.0, 0.5, 118.2, 2500.00, 'EYECRYLP', true, 52, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Mediland MPC-60S', 'Mediland', 'Monofocal', 'Indian', 'Standard', 'Hydrophobic Acrylic', 0.0, 34.0, 0.5, 118.9, 3500.00, 'MPC60S', true, 53, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── Toric Imported (Premium) ──────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AcrySof IQ Toric SN6AT3', 'Alcon', 'Toric', 'Imported', 'Premium', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.0, 14500.00, 'SN6AT3', true, 60, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AcrySof IQ Toric SN6AT5', 'Alcon', 'Toric', 'Imported', 'Premium', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.0, 15000.00, 'SN6AT5', true, 61, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Clareon Toric CNA0T3', 'Alcon', 'Toric', 'Imported', 'Premium', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.3, 16000.00, 'CNA0T3', true, 62, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Tecnis Toric 1-Piece ZCT225', 'Johnson & Johnson Vision', 'Toric', 'Imported', 'Premium', 'Hydrophobic Acrylic', 5.0, 32.0, 0.5, 119.0, 14800.00, 'ZCT225', true, 63, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AT TORBI 709M', 'Carl Zeiss Meditec', 'Toric', 'Imported', 'Premium', 'Hydrophilic Acrylic', 0.0, 32.0, 0.5, 118.3, 15500.00, 'AT709M', true, 64, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── Toric Indian (Premium) ───────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Appasamy Eyecryl Toric', 'Appasamy Associates', 'Toric', 'Indian', 'Premium', 'Hydrophilic Acrylic', 0.0, 30.0, 0.5, 118.2, 7500.00, 'EYECRYLT', true, 65, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── Trifocal (Deluxe) ────────────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'PanOptix TFNT0', 'Alcon', 'Trifocal', 'Imported', 'Deluxe', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.0, 45000.00, 'TFNT0', true, 70, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AT LISA tri 839MP', 'Carl Zeiss Meditec', 'Trifocal', 'Imported', 'Deluxe', 'Hydrophilic Acrylic', 0.0, 32.0, 0.5, 118.4, 44000.00, 'AT839MP', true, 71, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'FineVision POD F GF', 'PhysIOL', 'Trifocal', 'Imported', 'Deluxe', 'Hydrophilic Acrylic', 0.0, 32.0, 0.5, 119.0, 48000.00, 'PODFGF', true, 72, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Rayner RayOne Trifocal', 'Rayner', 'Trifocal', 'Imported', 'Deluxe', 'Hydrophilic Acrylic', 0.0, 35.0, 0.5, 118.7, 46000.00, 'RAYONE_TF', true, 73, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── ToricMultifocal (Deluxe) ─────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'PanOptix Trifocal Toric TFNT25', 'Alcon', 'ToricMultifocal', 'Imported', 'Deluxe', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.0, 55000.00, 'TFNT25', true, 74, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'AT LISA tri toric 939MP', 'Carl Zeiss Meditec', 'ToricMultifocal', 'Imported', 'Deluxe', 'Hydrophilic Acrylic', 0.0, 32.0, 0.5, 118.4, 54000.00, 'AT939MP', true, 75, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Vivity Toric DFT015', 'Alcon', 'ToricMultifocal', 'Imported', 'Deluxe', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.3, 58000.00, 'DFT015', true, 76, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── Multifocal (Premium) ─────────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Lentis Comfort LS-313 MF15', 'Oculentis', 'Multifocal', 'Imported', 'Premium', 'Hydrophilic Acrylic', 0.0, 30.0, 0.5, 118.3, 38000.00, 'LS313MF15', true, 80, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── EDOF (Deluxe) ────────────────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Vivity DFR00V', 'Alcon', 'EDOF', 'Imported', 'Deluxe', 'Hydrophobic Acrylic', 6.0, 30.0, 0.5, 119.3, 42000.00, 'DFR00V', true, 85, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Symfony ZXR00V', 'Johnson & Johnson Vision', 'EDOF', 'Imported', 'Deluxe', 'Hydrophobic Acrylic', 5.0, 34.0, 0.5, 119.3, 40000.00, 'ZXR00V', true, 86, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Synergy ZFR00V', 'Johnson & Johnson Vision', 'EDOF', 'Imported', 'Deluxe', 'Hydrophobic Acrylic', 5.0, 34.0, 0.5, 119.2, 43000.00, 'ZFR00V', true, 87, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    -- ─── ICL / Phakic (Deluxe) ────────────────────────────────────────────────
    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Visian EVO ICL V4c', 'STAAR Surgical', 'ICL', 'Imported', 'Deluxe', 'Collamer', -20.0, 3.0, 0.5, NULL, 65000.00, 'EVO_V4C', true, 90, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    INSERT INTO iol_catalog_master (id, tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category, material, power_range_min, power_range_max, power_increment, a_constant, default_price, product_code, is_active, display_order, created_at, updated_at, status)
    VALUES (gen_random_uuid(), v_tenant_id, 'Visian EVO+ Toric ICL V4c', 'STAAR Surgical', 'ICL', 'Imported', 'Deluxe', 'Collamer', -20.0, 3.0, 0.5, NULL, 75000.00, 'EVO_TICL_V4C', true, 91, NOW(), NOW(), 'active')
    ON CONFLICT (product_code) DO NOTHING;

    RAISE NOTICE 'IOL catalog seed complete for tenant: %. Run: SELECT count(*), iol_type FROM iol_catalog_master GROUP BY iol_type;', v_tenant_id;
END $$;
