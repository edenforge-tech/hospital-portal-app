-- =====================================================
-- IOL CATALOG SEED DATA
-- Purpose: Populate IOL catalog with hospital tariff pricing
-- Data Source: Hospital tariff documents (Feb 2026)
-- Created: 2026-02-25
-- Note: Replace {{TENANT_ID}} with actual tenant UUID before execution
-- =====================================================

-- Get current tenant ID (for local execution)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get the first active tenant (adjust as needed)
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' AND deleted_at IS NULL LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please create a tenant first.';
    END IF;
    
    -- Store in session variable for use in subsequent statements
    PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
END $$;

-- Insert IOL Catalog Data
INSERT INTO iol_catalog_master (
    tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category,
    default_price, power_range_min, power_range_max, power_increment,
    distance_range, material, display_order, product_code, is_active
) VALUES
-- MONOFOCAL IOLs - INDIAN
(
    current_setting('app.seed_tenant_id')::UUID,
    'Supraphob / Premium',
    'Indian Manufacturer',
    'Monofocal',
    'Indian',
    'Standard',
    35000.00,
    -10.00,
    35.00,
    0.50,
    'Standard Distance',
    'Hydrophobic Acrylic',
    1,
    'IOL-MONO-IND-001',
    TRUE
),

-- MONOFOCAL IOLs - IMPORTED
(
    current_setting('app.seed_tenant_id')::UUID,
    'Alcon SP / Sensor I',
    'Alcon',
    'Monofocal',
    'Imported',
    'Premium',
    40000.00,
    -10.00,
    35.00,
    0.50,
    'Standard Distance',
    'Hydrophobic Acrylic',
    2,
    'IOL-MONO-IMP-002',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Alcon IQ / Tecnis 1 / Clareon',
    'Alcon / Johnson & Johnson',
    'Monofocal',
    'Imported',
    'Premium',
    50000.00,
    -10.00,
    35.00,
    0.50,
    'Standard Distance',
    'Hydrophobic Acrylic',
    3,
    'IOL-MONO-IMP-003',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Pre-Load Lens',
    'Various Manufacturers',
    'Monofocal',
    'Imported',
    'Premium',
    55000.00,
    -10.00,
    35.00,
    0.50,
    'Standard Distance',
    'Hydrophobic Acrylic',
    4,
    'IOL-MONO-IMP-004',
    TRUE
),

-- ENHANCED DEPTH OF FOCUS (EDOF)
(
    current_setting('app.seed_tenant_id')::UUID,
    'Eyhance - 60cm-Distance',
    'Johnson & Johnson',
    'EDOF',
    'Imported',
    'Premium',
    60000.00,
    -10.00,
    35.00,
    0.50,
    '60cm-Distance',
    'Hydrophobic Acrylic',
    5,
    'IOL-EDOF-IMP-005',
    TRUE
),

-- TORIC IOLs (for Astigmatism)
(
    current_setting('app.seed_tenant_id')::UUID,
    'Toric Lens',
    'Various Manufacturers',
    'Toric',
    'Imported',
    'Premium',
    70000.00,
    -10.00,
    35.00,
    0.50,
    'Standard Distance',
    'Hydrophobic Acrylic',
    6,
    'IOL-TORIC-IMP-006',
    TRUE
),

-- MULTIFOCAL IOLs - 33cm Distance
(
    current_setting('app.seed_tenant_id')::UUID,
    'Indian Multifocal',
    'Indian Manufacturer',
    'Multifocal',
    'Indian',
    'Premium',
    60000.00,
    -10.00,
    35.00,
    0.50,
    '33cm-Distance',
    'Hydrophobic Acrylic',
    7,
    'IOL-MULTI-IND-007',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Imported Multifocal (Zeiss / J&J)',
    'Zeiss / Johnson & Johnson',
    'Multifocal',
    'Imported',
    'Deluxe',
    95000.00,
    -10.00,
    35.00,
    0.50,
    '33cm-Distance',
    'Hydrophobic Acrylic',
    8,
    'IOL-MULTI-IMP-008',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Multifocal - TORIC (Zeiss / J&J)',
    'Zeiss / Johnson & Johnson',
    'ToricMultifocal',
    'Imported',
    'Deluxe',
    120000.00,
    -10.00,
    35.00,
    0.50,
    '33cm-Distance',
    'Hydrophobic Acrylic',
    9,
    'IOL-MULTORIC-IMP-009',
    TRUE
),

-- TRIFOCAL IOLs - 33cm to 60cm Distance
(
    current_setting('app.seed_tenant_id')::UUID,
    'Indian Trifocal',
    'Indian Manufacturer',
    'Trifocal',
    'Indian',
    'Premium',
    70000.00,
    -10.00,
    35.00,
    0.50,
    '33cm-60cm-Distance',
    'Hydrophobic Acrylic',
    10,
    'IOL-TRI-IND-010',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Imported Trifocal (Zeiss / Alcon / J&J)',
    'Zeiss / Alcon / Johnson & Johnson',
    'Trifocal',
    'Imported',
    'Deluxe',
    120000.00,
    -10.00,
    35.00,
    0.50,
    '33cm-60cm-Distance',
    'Hydrophobic Acrylic',
    11,
    'IOL-TRI-IMP-011',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Imported Trifocal -TORIC (Zeiss / Alcon / J&J)',
    'Zeiss / Alcon / Johnson & Johnson',
    'ToricMultifocal',
    'Imported',
    'Deluxe',
    150000.00,
    -10.00,
    35.00,
    0.50,
    '33cm-60cm-Distance',
    'Hydrophobic Acrylic',
    12,
    'IOL-TRITORIC-IMP-012',
    TRUE
),

-- EDOF LENSES - Extended Depth of Focus (40cm Distance)
(
    current_setting('app.seed_tenant_id')::UUID,
    'Imported EDOF lens (Vivity / PureSee)',
    'Johnson & Johnson / Bausch+Lomb',
    'EDOF',
    'Imported',
    'Deluxe',
    120000.00,
    -10.00,
    35.00,
    0.50,
    '40cm-Distance',
    'Hydrophobic Acrylic',
    13,
    'IOL-EDOF-IMP-013',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Imported EDOF Toric (Vivity Toric / PureSee Toric)',
    'Johnson & Johnson / Bausch+Lomb',
    'Toric',
    'Imported',
    'Deluxe',
    150000.00,
    -10.00,
    35.00,
    0.50,
    '40cm-Distance',
    'Hydrophobic Acrylic',
    14,
    'IOL-EDOF-TORIC-IMP-014',
    TRUE
);

-- Insert NON-TORIC ICL TARIFF (from hospital pricing sheet)
INSERT INTO iol_catalog_master (
    tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category,
    default_price, power_range_min, power_range_max, power_increment,
    distance_range, material, display_order, product_code, is_active
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'ICL - Indian',
    'Indian Manufacturer',
    'ICL',
    'Indian',
    'Standard',
    70000.00,
    -3.00,
    -25.00,
    0.50,
    'N/A (Phakic IOL)',
    'Collamer',
    15,
    'ICL-INDIAN-015',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'ICL - Imported',
    'STAAR Surgical',
    'ICL',
    'Imported',
    'Premium',
    90000.00,
    -3.00,
    -20.00,
    0.50,
    'N/A (Phakic IOL)',
    'Collamer',
    16,
    'ICL-IMPORTED-016',
    TRUE
);

-- Insert TORIC ICL TARIFF
INSERT INTO iol_catalog_master (
    tenant_id, model_name, brand_manufacturer, iol_type, origin, lens_category,
    default_price, power_range_min, power_range_max, power_increment,
    distance_range, material, display_order, product_code, is_active
) VALUES
(
    current_setting('app.seed_tenant_id')::UUID,
    'Toric ICL - Indian',
    'Indian Manufacturer',
    'Toric',
    'Indian',
    'Premium',
    90000.00,
    -3.00,
    -25.00,
    0.50,
    'N/A (Phakic IOL)',
    'Collamer',
    17,
    'ICL-TORIC-INDIAN-017',
    TRUE
),
(
    current_setting('app.seed_tenant_id')::UUID,
    'Toric ICL - Imported',
    'STAAR Surgical',
    'Toric',
    'Imported',
    'Deluxe',
    120000.00,
    -3.00,
    -20.00,
    0.50,
    'N/A (Phakic IOL)',
    'Collamer',
    18,
    'ICL-TORIC-IMPORTED-018',
    TRUE
);

-- Seed default consultation charges
INSERT INTO consultation_charges (
    tenant_id, charge_type, consultation_fee, follow_up_fee, validity_days, free_follow_ups_count
) VALUES (
    current_setting('app.seed_tenant_id')::UUID,
    'Default',
    500.00,
    0.00,
    30,
    1
);

-- Show summary
DO $$
DECLARE
    v_iol_count INTEGER;
    v_consultation_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_iol_count FROM iol_catalog_master 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID;
    
    SELECT COUNT(*) INTO v_consultation_count FROM consultation_charges 
    WHERE tenant_id = current_setting('app.seed_tenant_id')::UUID;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IOL CATALOG SEED COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IOL Catalog Items: %', v_iol_count;
    RAISE NOTICE 'Consultation Charges: %', v_consultation_count;
    RAISE NOTICE '========================================';
END $$;
