-- ============================================================
-- Migration 100: Inventory Schema Additions
-- Adds missing columns identified in cross-check against the
-- locked implementation plan.
-- Safe to re-run (IF NOT EXISTS / IF EXISTS guards).
-- ============================================================

-- ── inv_stock_ledger: add patient columns ─────────────────────────────────────
ALTER TABLE inv_stock_ledger ADD COLUMN IF NOT EXISTS patient_name  VARCHAR(200);
ALTER TABLE inv_stock_ledger ADD COLUMN IF NOT EXISTS patient_ip_no VARCHAR(50);

COMMENT ON COLUMN inv_stock_ledger.patient_name  IS 'Populated for PATIENT_IOL_ISSUE transactions';
COMMENT ON COLUMN inv_stock_ledger.patient_ip_no IS 'IP/MR number for PATIENT_IOL_ISSUE transactions';

-- ── inv_vendors: add compliance / banking columns ─────────────────────────────
ALTER TABLE inv_vendors ADD COLUMN IF NOT EXISTS drug_license_20b         VARCHAR(50);
ALTER TABLE inv_vendors ADD COLUMN IF NOT EXISTS drug_license_21b         VARCHAR(50);
ALTER TABLE inv_vendors ADD COLUMN IF NOT EXISTS cin_number               VARCHAR(21);
ALTER TABLE inv_vendors ADD COLUMN IF NOT EXISTS swift_code               VARCHAR(11);
ALTER TABLE inv_vendors ADD COLUMN IF NOT EXISTS late_payment_interest_rate NUMERIC(5,2) DEFAULT 18.00;
ALTER TABLE inv_vendors ADD COLUMN IF NOT EXISTS is_cold_chain_vendor     BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing drug_license_number into 20B field (non-destructive)
UPDATE inv_vendors
SET    drug_license_20b = drug_license_number
WHERE  drug_license_number IS NOT NULL
  AND  drug_license_20b IS NULL;

COMMENT ON COLUMN inv_vendors.drug_license_20b IS 'Drug licence Form 20-B (retail sale of drugs)';
COMMENT ON COLUMN inv_vendors.drug_license_21b IS 'Drug licence Form 21-B (wholesale of drugs)';
COMMENT ON COLUMN inv_vendors.cin_number       IS 'Company Identification Number (MCA)';
COMMENT ON COLUMN inv_vendors.swift_code       IS 'SWIFT/BIC code for international transfers';
COMMENT ON COLUMN inv_vendors.late_payment_interest_rate IS 'Interest rate % per annum on overdue invoices';
COMMENT ON COLUMN inv_vendors.is_cold_chain_vendor       IS 'Vendor supplies cold-chain / temperature-sensitive items';

-- ── inv_item_master: add classification columns ───────────────────────────────
ALTER TABLE inv_item_master ADD COLUMN IF NOT EXISTS is_serialized      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE inv_item_master ADD COLUMN IF NOT EXISTS is_asset_item      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE inv_item_master ADD COLUMN IF NOT EXISTS mdr_classification VARCHAR(20);

COMMENT ON COLUMN inv_item_master.is_serialized      IS 'Track individual units by serial number';
COMMENT ON COLUMN inv_item_master.is_asset_item      IS 'Item is a fixed asset (not consumable)';
COMMENT ON COLUMN inv_item_master.mdr_classification IS 'Medical Device Rules class: Class A/B/C/D or null';
