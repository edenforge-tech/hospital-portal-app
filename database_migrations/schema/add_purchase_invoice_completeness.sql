-- ============================================================
-- GRN Invoice Field Completeness Migration
-- Adds 18 columns to inv_purchase_items (serial traceability,
-- manufacturer, cold chain, DTO-only fields now persisted)
-- Adds 8 columns to inv_purchase_invoices (e-invoice, EWB,
-- delivery date, reverse charge, vendor GSTIN audit)
-- ============================================================

-- ─── inv_purchase_items: 18 new columns ────────────────────

ALTER TABLE inv_purchase_items
  -- Serialization & traceability
  ADD COLUMN IF NOT EXISTS serial_number        VARCHAR(100),
  ADD COLUMN IF NOT EXISTS manufacturer_name    VARCHAR(200),
  ADD COLUMN IF NOT EXISTS country_of_origin    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mfg_date             DATE,
  ADD COLUMN IF NOT EXISTS schedule_type        VARCHAR(10),
  ADD COLUMN IF NOT EXISTS is_cold_chain        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS brand_name           VARCHAR(200),
  ADD COLUMN IF NOT EXISTS vendor_sku           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_inter_state       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_fields         JSONB,
  -- Previously DTO-only fields (now persisted)
  ADD COLUMN IF NOT EXISTS selling_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packing              NUMERIC(8,3)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS units_per_pack       NUMERIC(8,3)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mrp_on_pack          NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_mrp         NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_asset_item        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tax_on_free          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_replacement       BOOLEAN NOT NULL DEFAULT false;

-- ─── inv_purchase_invoices: 8 new columns ──────────────────

ALTER TABLE inv_purchase_invoices
  -- e-Invoice / IRN
  ADD COLUMN IF NOT EXISTS irn                     VARCHAR(200),
  ADD COLUMN IF NOT EXISTS ack_no                  VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ack_date                DATE,
  -- E-Way Bill
  ADD COLUMN IF NOT EXISTS e_way_bill_no           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS e_way_bill_date         DATE,
  -- Delivery & compliance
  ADD COLUMN IF NOT EXISTS date_of_delivery        DATE,
  ADD COLUMN IF NOT EXISTS is_reverse_charge       BOOLEAN NOT NULL DEFAULT false,
  -- Vendor GSTIN audit (as printed on the physical invoice)
  ADD COLUMN IF NOT EXISTS vendor_gstin_on_invoice VARCHAR(20);

-- ─── Comments for documentation ────────────────────────────

COMMENT ON COLUMN inv_purchase_items.serial_number        IS 'Per-unit manufacturer serial (one row per serialized IOL/asset)';
COMMENT ON COLUMN inv_purchase_items.manufacturer_name    IS 'MFGR on invoice — may differ from vendor (e.g. Carl Zeiss Meditec AG)';
COMMENT ON COLUMN inv_purchase_items.country_of_origin    IS 'Country of Origin per line item (import compliance)';
COMMENT ON COLUMN inv_purchase_items.mfg_date             IS 'Manufacturing date (Mfg Dt field on pharma/optical invoices)';
COMMENT ON COLUMN inv_purchase_items.schedule_type        IS 'Drug schedule: OTC, G, H, H1, X';
COMMENT ON COLUMN inv_purchase_items.is_cold_chain        IS 'Requires cold storage (2-8°C / -20°C)';
COMMENT ON COLUMN inv_purchase_items.brand_name           IS 'Trade/brand name (Eyecryl Plus, TECNIS EYHANCE, SISTANE)';
COMMENT ON COLUMN inv_purchase_items.vendor_sku           IS 'Vendor catalog/product code (Zeiss: 003500-0006-045)';
COMMENT ON COLUMN inv_purchase_items.is_inter_state       IS 'True when IGST applies instead of CGST+SGST';
COMMENT ON COLUMN inv_purchase_items.extra_fields         IS 'JSONB bag: diopter, lens_model, tip_size, coating, job_no, MDR class, etc.';
COMMENT ON COLUMN inv_purchase_items.selling_price        IS 'Patient selling price (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.packing              IS 'Pack size (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.units_per_pack       IS 'Units per pack (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.mrp_on_pack          IS 'MRP per pack (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.transfer_mrp         IS 'Transfer MRP for inter-branch (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.is_asset_item        IS 'Capital asset flag (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.tax_on_free          IS 'Calculate GST on free quantity (previously in DTO only, now persisted)';
COMMENT ON COLUMN inv_purchase_items.is_replacement       IS 'Replacement item flag (previously in DTO only, now persisted)';

COMMENT ON COLUMN inv_purchase_invoices.irn                     IS 'e-Invoice IRN (Invoice Reference Number)';
COMMENT ON COLUMN inv_purchase_invoices.ack_no                  IS 'e-Invoice acknowledgement number';
COMMENT ON COLUMN inv_purchase_invoices.ack_date                IS 'e-Invoice acknowledgement date';
COMMENT ON COLUMN inv_purchase_invoices.e_way_bill_no           IS 'E-Way Bill number (for goods in transit)';
COMMENT ON COLUMN inv_purchase_invoices.e_way_bill_date         IS 'E-Way Bill date';
COMMENT ON COLUMN inv_purchase_invoices.date_of_delivery        IS 'Actual date of delivery/performance (may differ from invoice date)';
COMMENT ON COLUMN inv_purchase_invoices.is_reverse_charge       IS 'Whether reverse charge mechanism applies';
COMMENT ON COLUMN inv_purchase_invoices.vendor_gstin_on_invoice IS 'Vendor GSTIN as printed on the physical invoice (audit trail)';
