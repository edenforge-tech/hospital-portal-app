-- ============================================================
-- Fix: Investigation save FK violation + add eye column
-- 1. Drop the FK constraint so service-catalog IDs are accepted
-- 2. Add eye column for per-investigation eye tracking (RE/LE/BE)
-- ============================================================

-- Drop FK (IDs may now come from lab_test_catalog OR service catalog)
ALTER TABLE counselor_lab_order_items
    DROP CONSTRAINT IF EXISTS counselor_lab_order_items_lab_test_catalog_id_fkey;

-- Add eye column
ALTER TABLE counselor_lab_order_items
    ADD COLUMN IF NOT EXISTS eye VARCHAR(10);
