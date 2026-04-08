-- ============================================================
-- DROP OLD CATALOG TABLES
-- Purpose: Remove service_catalog, iol_catalog_master, surgery_types
--          after migrating to the new Service Catalog V2 schema.
-- Run AFTER:
--   1. add_service_catalog_v2.sql
--   2. repoint_billing_ot_to_new_catalog.sql
-- !! IRREVERSIBLE — ensure backup before running !!
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- Drop surgery_types
-- (Referenced by CounselingWorkflowService; already replaced by service_variants)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS surgery_types CASCADE;

-- ────────────────────────────────────────────────────────────
-- Drop iol_catalog_master
-- (FK from ot_booking_validations.iol_catalog_id already dropped in step 2)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS iol_catalog_master CASCADE;

-- ────────────────────────────────────────────────────────────
-- Drop service_catalog
-- (FK from opd_bill_items.service_catalog_id already dropped in step 2)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS service_catalog CASCADE;

COMMIT;
