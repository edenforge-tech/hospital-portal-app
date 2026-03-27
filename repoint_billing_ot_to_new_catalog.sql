-- ============================================================
-- REPOINT BILLING & OT TO NEW SERVICE CATALOG V2
-- Purpose: Alter opd_bill_items and ot_booking_validations to
--          reference new service_variants and iol_master tables
--          instead of service_catalog and iol_catalog_master.
-- Run AFTER: add_service_catalog_v2.sql
-- Note: Both tables are confirmed empty so no data migration needed
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- opd_bill_items: service_catalog_id → service_variant_id
-- ────────────────────────────────────────────────────────────

-- 1. Drop old FK and index
ALTER TABLE opd_bill_items
    DROP CONSTRAINT IF EXISTS "FK_opd_bill_items_service_catalog_service_catalog_id";

ALTER TABLE opd_bill_items
    DROP CONSTRAINT IF EXISTS fk_opd_bill_items_service_catalog_id;

DROP INDEX IF EXISTS "IX_opd_bill_items_service_catalog_id";
DROP INDEX IF EXISTS ix_opd_bill_items_service_catalog_id;

-- 2. Drop old column
ALTER TABLE opd_bill_items
    DROP COLUMN IF EXISTS service_catalog_id;

-- 3. Add new nullable column pointing to service_variants
ALTER TABLE opd_bill_items
    ADD COLUMN IF NOT EXISTS service_variant_id UUID;

-- 4. Add FK constraint (nullable — bill items for non-variant services allowed)
ALTER TABLE opd_bill_items
    ADD CONSTRAINT fk_opd_bill_items_service_variant_id
    FOREIGN KEY (service_variant_id)
    REFERENCES service_variants(id)
    ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED;

-- 5. Index
CREATE INDEX IF NOT EXISTS ix_opd_bill_items_service_variant_id
    ON opd_bill_items(service_variant_id);

-- ────────────────────────────────────────────────────────────
-- ot_booking_validations: iol_catalog_id → iol_master_id
-- ────────────────────────────────────────────────────────────

-- 1. Drop old FK (there was no REFERENCES constraint — just a plain column)
ALTER TABLE ot_booking_validations
    DROP COLUMN IF EXISTS iol_catalog_id;

-- 2. Add new column
ALTER TABLE ot_booking_validations
    ADD COLUMN IF NOT EXISTS iol_master_id UUID;

-- 3. Add FK to iol_master (nullable)
ALTER TABLE ot_booking_validations
    ADD CONSTRAINT fk_ot_booking_validations_iol_master_id
    FOREIGN KEY (iol_master_id)
    REFERENCES iol_master(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

-- 4. Index
CREATE INDEX IF NOT EXISTS ix_ot_booking_validations_iol_master_id
    ON ot_booking_validations(iol_master_id);

COMMIT;
