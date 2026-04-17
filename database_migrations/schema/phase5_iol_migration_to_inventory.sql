-- =============================================================================
-- Phase 5: IOL Migration — auth-service iol_inventory → inventory-service
-- =============================================================================
-- Purpose : One-time migration that copies IOL items from the legacy
--           auth-service `iol_inventory` table into the inventory-service
--           `inv_item_master` and `inv_stock_batch` tables so that IOL
--           stock is managed centrally by the inventory service going forward.
--
-- Pre-conditions:
--   • inv_item_master, inv_stock_batch, inv_purchase_category tables exist
--   • Extension uuid-ossp enabled (SELECT uuid_generate_v4() works)
--   • Both schemas live in the same PostgreSQL instance / database
--
-- Idempotent : Running twice is safe — items are matched by sku first.
--
-- Usage:
--   psql -h <host> -U <user> -d <database> -f phase5_iol_migration_to_inventory.sql
-- =============================================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Ensure an "IOL Lenses" purchase category exists per tenant
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO inv_purchase_category (
    id, tenant_id, category_name, category_type,
    created_at, updated_at, status
)
SELECT
    uuid_generate_v4(),
    i.tenant_id,
    'IOL Lenses',
    'Optical',
    NOW(), NOW(), 'active'
FROM (
    SELECT DISTINCT tenant_id FROM iol_inventory WHERE deleted_at IS NULL
) i
WHERE NOT EXISTS (
    SELECT 1 FROM inv_purchase_category pc
    WHERE pc.tenant_id = i.tenant_id
      AND pc.category_name = 'IOL Lenses'
      AND pc.deleted_at IS NULL
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Insert IOL items into inv_item_master (skip already-migrated items by sku)
-- ──────────────────────────────────────────────────────────────────────────────
-- Mapping:
--   iol_inventory.model           → item_name
--   iol_inventory.manufacturer    → brand
--   iol_inventory.sku             → generic_name (+ barcode field)
--   iol_inventory.type            → item_type prefix stored in generic_name
--   iol_inventory.unit_price      → default_gst_rate (GST 12% for medical devices)
--   iol_inventory.reorder_quantity → reorder_quantity
--   iol_inventory.minimum_stock   → reorder_level
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO inv_item_master (
    id,
    tenant_id,
    category_id,
    item_name,
    generic_name,
    brand,
    item_type,
    unit,
    hsn_code,
    schedule_type,
    default_gst_rate,
    reorder_level,
    reorder_quantity,
    requires_cold_storage,
    is_barcode_tracked,
    is_active,
    notes,
    created_at,
    updated_at,
    status
)
SELECT
    uuid_generate_v4()                                          AS id,
    src.tenant_id,
    (
        SELECT pc.id FROM inv_purchase_category pc
        WHERE pc.tenant_id = src.tenant_id
          AND pc.category_name = 'IOL Lenses'
          AND pc.deleted_at IS NULL
        LIMIT 1
    )                                                           AS category_id,
    src.model                                                   AS item_name,
    COALESCE(src.sku, src.model)                                AS generic_name,
    src.manufacturer                                             AS brand,
    'IOL'                                                        AS item_type,
    'Nos'                                                        AS unit,
    '9001'                                                       AS hsn_code,      -- Medical optical instruments
    NULL                                                         AS schedule_type,
    '12'                                                         AS default_gst_rate, -- GST 12% medical devices
    COALESCE(src.minimum_stock, 2)                              AS reorder_level,
    COALESCE(src.reorder_quantity, 5)                           AS reorder_quantity,
    FALSE                                                        AS requires_cold_storage,
    TRUE                                                         AS is_barcode_tracked,
    TRUE                                                         AS is_active,
    CONCAT(
        'Migrated from IOL Inventory. Type: ', src.type,
        '. A-Constant: ', COALESCE(src.a_constant::TEXT, 'N/A'),
        '. Power: ', COALESCE(src.power_range_min::TEXT, '?'),
        ' to ', COALESCE(src.power_range_max::TEXT, '?'), 'D'
    )                                                            AS notes,
    NOW()                                                        AS created_at,
    NOW()                                                        AS updated_at,
    'active'                                                     AS status
FROM iol_inventory src
WHERE src.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM inv_item_master im
      WHERE im.tenant_id = src.tenant_id
        AND im.generic_name = COALESCE(src.sku, src.model)
        AND im.item_type = 'IOL'
        AND im.deleted_at IS NULL
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Create opening stock batches for migrated IOL items
-- ──────────────────────────────────────────────────────────────────────────────
-- One stock batch per IOL item, seeded with current_stock from iol_inventory.
-- Uses the first active store for the tenant (fallback: skip if no store exists).
-- ──────────────────────────────────────────────────────────────────────────────
WITH iol_mapped AS (
    SELECT
        src.tenant_id,
        src.sku,
        src.model,
        src.manufacturer,
        src.current_stock,
        src.unit_price,
        src.batch_number,
        src.expiry_date,
        src.location,
        im.id AS inv_item_id
    FROM iol_inventory src
    JOIN inv_item_master im
        ON im.tenant_id = src.tenant_id
       AND im.generic_name = COALESCE(src.sku, src.model)
       AND im.item_type = 'IOL'
       AND im.deleted_at IS NULL
    WHERE src.deleted_at IS NULL
      AND src.current_stock > 0
),
first_store AS (
    SELECT DISTINCT ON (tenant_id) tenant_id, id AS store_id
    FROM inv_store_master
    WHERE is_active = TRUE AND deleted_at IS NULL
    ORDER BY tenant_id, created_at
)
INSERT INTO inv_stock_batch (
    id,
    tenant_id,
    store_id,
    item_id,
    batch_number,
    barcode,
    quantity_received,
    quantity_available,
    cost_price,
    expiry_date,
    location_in_store,
    is_active,
    created_at,
    updated_at,
    status
)
SELECT
    uuid_generate_v4()                                      AS id,
    m.tenant_id,
    fs.store_id,
    m.inv_item_id,
    COALESCE(m.batch_number, CONCAT('IOL-MIGRATE-', TO_CHAR(NOW(), 'YYYYMMDD'))),
    m.sku                                                   AS barcode,
    m.current_stock                                         AS quantity_received,
    m.current_stock                                         AS quantity_available,
    COALESCE(m.unit_price, 0)                               AS cost_price,
    m.expiry_date,
    m.location                                              AS location_in_store,
    TRUE                                                    AS is_active,
    NOW()                                                   AS created_at,
    NOW()                                                   AS updated_at,
    'active'                                                AS status
FROM iol_mapped m
JOIN first_store fs ON fs.tenant_id = m.tenant_id
WHERE NOT EXISTS (
    SELECT 1 FROM inv_stock_batch sb
    WHERE sb.tenant_id = m.tenant_id
      AND sb.item_id = m.inv_item_id
      AND sb.batch_number = COALESCE(m.batch_number, CONCAT('IOL-MIGRATE-', TO_CHAR(NOW(), 'YYYYMMDD')))
      AND sb.deleted_at IS NULL
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Mark migrated iol_inventory records
--    Add a migration_note column if it does NOT already exist (safe DDL)
-- ──────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'iol_inventory' AND column_name = 'migrated_to_inventory'
    ) THEN
        ALTER TABLE iol_inventory ADD COLUMN migrated_to_inventory BOOLEAN DEFAULT FALSE;
        ALTER TABLE iol_inventory ADD COLUMN migrated_at TIMESTAMPTZ;
    END IF;
END;
$$;

UPDATE iol_inventory src
SET
    migrated_to_inventory = TRUE,
    migrated_at = NOW()
FROM inv_item_master im
WHERE im.tenant_id = src.tenant_id
  AND im.generic_name = COALESCE(src.sku, src.model)
  AND im.item_type = 'IOL'
  AND im.deleted_at IS NULL
  AND src.deleted_at IS NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Verification report
-- ──────────────────────────────────────────────────────────────────────────────
SELECT
    'IOL Items Migrated'                     AS metric,
    COUNT(*)::TEXT                           AS value
FROM inv_item_master
WHERE item_type = 'IOL' AND deleted_at IS NULL

UNION ALL

SELECT
    'IOL Stock Batches Created',
    COUNT(*)::TEXT
FROM inv_stock_batch sb
JOIN inv_item_master im ON im.id = sb.item_id
WHERE im.item_type = 'IOL' AND sb.deleted_at IS NULL

UNION ALL

SELECT
    'Source IOL Items Marked Migrated',
    COUNT(*)::TEXT
FROM iol_inventory
WHERE migrated_to_inventory = TRUE;

COMMIT;
