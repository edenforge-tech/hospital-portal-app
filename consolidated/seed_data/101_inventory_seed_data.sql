-- =============================================================================
-- INVENTORY SEED DATA — India Eye Hospital Network
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Run AFTER: 99_inventory_module.sql AND 100_inventory_schema_additions.sql
-- Idempotent: all INSERTs use ON CONFLICT (id) DO NOTHING
-- =============================================================================

BEGIN;

-- ─── FIXED UUID LEGEND ────────────────────────────────────────────────────────
-- STORES        : b1bb1bb1-0001-0001-0001-00000000000{1-3}
-- CATEGORIES    : c2cc2cc2-0001-0001-0001-00000000000{1-5}
-- VENDORS       : d3dd3dd3-0001-0001-0001-00000000000{1-5}
-- ITEMS         : e4ee4ee4-0001-0001-0001-00000000000{01-12}
-- INVOICES      : f5ff5ff5-0001-0001-0001-00000000000{1-5}
-- GRN HEADERS   : a6aa6aa6-0001-0001-0001-00000000000{1-3}
-- STOCK BATCHES : ba7ba7ba-0001-0001-0001-00000000000{01-10}
-- TRANSFERS     : a0aa0aa0-0001-0001-0001-000000000001
-- PHARM BILLS   : b1b1b1b1-b1b1-b1b1-b1b1-00000000000{1-2}
-- REQUISITIONS  : f9ff9ff9-0001-0001-0001-00000000000{1-2}
-- PURCHASE ITEMS: e8ee8ee8-0001-0001-0001-00000000000{01-11}
-- RETURNS       : c3cc3cc3-0001-0001-0001-000000000001

-- =============================================================================
-- 1. STORES
-- =============================================================================
INSERT INTO inv_store_master
  (id, tenant_id, store_name, store_type, is_active, status)
VALUES
  ('b1bb1bb1-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Central Store', 'Central', true, 'active'),

  ('b1bb1bb1-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Pharmacy', 'Pharmacy', true, 'active'),

  ('b1bb1bb1-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'OT Store', 'OT', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. PURCHASE CATEGORIES
-- =============================================================================
INSERT INTO inv_purchase_categories
  (id, tenant_id, category_name, category_type, status)
VALUES
  ('c2cc2cc2-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Intraocular Lenses', 'Optical', 'active'),

  ('c2cc2cc2-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Ophthalmic Drugs', 'Drugs', 'active'),

  ('c2cc2cc2-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Surgical Instruments', 'Surgical', 'active'),

  ('c2cc2cc2-0001-0001-0001-000000000004',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'OT Consumables', 'Consumables', 'active'),

  ('c2cc2cc2-0001-0001-0001-000000000005',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Schedule H Drugs', 'Drugs', 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. VENDORS
-- =============================================================================
INSERT INTO inv_vendors
  (id, tenant_id, name, contact_person, phone, email,
   gst_number, drug_license_number, bank_ifsc_code,
   credit_days, outstanding_balance, status)
VALUES
  ('d3dd3dd3-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Carl Zeiss India Pvt Ltd', 'Accounts Team', '040-27777000', 'accounts@zeiss.in',
   '36AADCC6152H1ZR', 'TG/16/01/2016-17150', 'CITI0000001',
   30, 125000.00, 'active'),

  ('d3dd3dd3-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Biotech Vision Care Pvt Ltd', 'Sales Dept', '040-23456789', 'sales@biotechvision.in',
   '36AABCB3639E1ZY', 'AP/24/-5/2014-117187', 'HDFC0000002',
   45, 87500.00, 'active'),

  ('d3dd3dd3-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Corneal Vision Care', 'Admin', '040-24567890', 'admin@cornealvc.in',
   '36ABSPR4098L1ZM', 'TS/HYD/2022-91245', 'ICIC0000003',
   30, 42000.00, 'active'),

  ('d3dd3dd3-0001-0001-0001-000000000004',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Rudra Pharma', 'Manager', '9848012345', 'orders@rudrapharma.in',
   '36BBRPA8696R1ZF', 'TS/RR/2019-53635', 'SBIN0000004',
   15, 18500.00, 'active'),

  ('d3dd3dd3-0001-0001-0001-000000000005',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'Royal Medical Hall', 'Proprietor', '9849054321', 'royal.med@gmail.com',
   '36AACFR1617A1ZT', 'TG/24/05/2014-3062', 'AXIS0000005',
   0, 5250.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. ITEM MASTER
-- =============================================================================
INSERT INTO inv_item_master
  (id, tenant_id, category_id, item_name, generic_name, brand,
   hsn_code, unit, item_type, requires_cold_storage, is_barcode_tracked,
   reorder_level, reorder_quantity, default_gst_rate, status)
VALUES
  -- IOLs
  ('e4ee4ee4-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000001',
   'Monofocal IOL AUROVUE 22.0D', 'Hydrophilic Acrylic IOL', 'Aurolab',
   '90215999', 'Nos', 'IOL', false, true, 10, 25, '5', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000001',
   'Toric IOL Aurovue T3', 'Toric IOL', 'Aurolab',
   '90215999', 'Nos', 'IOL', false, true, 5, 10, '5', 'active'),

  -- Surgical instruments
  ('e4ee4ee4-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000003',
   'IOL Injector Pre-loaded System', 'IOL Delivery System', 'Carl Zeiss',
   '90183990', 'Nos', 'Surgical', false, false, 10, 20, '12', 'active'),

  -- Drugs
  ('e4ee4ee4-0001-0001-0001-000000000004',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000002',
   'Moxifloxacin 0.5% Eye Drops 5ml', 'Moxifloxacin HCl', 'Vigamox',
   '30049099', 'Bottle', 'Drug', false, false, 50, 100, '12', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000005',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000005',
   'Ceftriaxone 1g Injection', 'Ceftriaxone Sodium', 'Intacef',
   '30041090', 'Vial', 'Drug', true, false, 30, 60, '12', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000006',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000002',
   'Povidone Iodine Scrub 7.5% 500ml', 'Povidone Iodine', 'Betadine',
   '30049099', 'Bottle', 'Drug', false, false, 20, 40, '12', 'active'),

  -- Consumables
  ('e4ee4ee4-0001-0001-0001-000000000007',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000004',
   'Surgical Gloves Size 7.5 (Latex)', 'Sterile Surgical Gloves', 'Gammex',
   '40151100', 'Pair', 'Consumable', false, false, 100, 200, '12', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000008',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000004',
   'Disposable Surgical Drapes 150x200cm', 'Non-woven Drape', 'Medline',
   '63079090', 'Nos', 'Consumable', false, false, 50, 100, '12', 'active'),

  -- Surgical (OVD — cold chain)
  ('e4ee4ee4-0001-0001-0001-000000000009',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000003',
   'OVD Provisc 0.8ml Syringe', 'Sodium Hyaluronate 1%', 'Alcon',
   '30049099', 'Nos', 'Surgical', true, true, 5, 15, '12', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000010',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000002',
   'Balanced Salt Solution 500ml', 'Irrigating Solution', 'Alcon',
   '30049099', 'Bottle', 'Drug', false, false, 20, 40, '5', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000011',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000005',
   'Timolol Maleate 0.5% Eye Drops 5ml', 'Timolol Maleate', 'Timoptol',
   '30049099', 'Bottle', 'Drug', false, false, 40, 80, '12', 'active'),

  ('e4ee4ee4-0001-0001-0001-000000000012',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c2cc2cc2-0001-0001-0001-000000000002',
   'Dexamethasone 0.1% Eye Drops 5ml', 'Dexamethasone Sodium Phosphate', 'Maxidex',
   '30049099', 'Bottle', 'Drug', false, false, 40, 80, '12', 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. PURCHASE INVOICES
-- =============================================================================
INSERT INTO inv_purchase_invoices
  (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
   gross_amount, discount_amount, taxable_amount,
   cgst_amount, sgst_amount, total_gst,
   net_amount, paid_amount, balance_amount,
   billing_mode, approval_status,
   grn_number, grn_date, remarks, status)
VALUES
  -- Invoice 1: Carl Zeiss → OT Store (Approved)
  ('f5ff5ff5-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000001',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'INV/CZ/2024-001', '2024-10-15',
   132500.00, 0.00, 126190.48,
   3154.76, 3154.76, 6309.52,
   125000.00, 0.00, 125000.00,
   'Bulk', 'Approved',
   'INDIA_EYE_NET/GRN/2024-25/000001', '2024-10-18',
   'Carl Zeiss IOL and Injector supply', 'active'),

  -- Invoice 2: Biotech → OT Store (PrimaryApproved — awaiting final approval)
  ('f5ff5ff5-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000002',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'INV/BV/2024-002', '2024-11-05',
   93500.00, 0.00, 89047.62,
   2226.19, 2226.19, 4452.38,
   87500.00, 0.00, 87500.00,
   'Bulk', 'PrimaryApproved',
   NULL, NULL,
   'Toric IOL supply for November cases', 'active'),

  -- Invoice 3: Rudra Pharma → Pharmacy (Approved + fully paid)
  ('f5ff5ff5-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000004',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'INV/RP/2024-003', '2024-11-10',
   22000.00, 500.00, 19166.67,
   1150.00, 1150.00, 2300.00,
   18500.00, 18500.00, 0.00,
   'Bulk', 'Approved',
   'INDIA_EYE_NET/GRN/2024-25/000002', '2024-11-12',
   'Ophthalmic drugs and consumables', 'active'),

  -- Invoice 4: Royal Medical Hall → Pharmacy (Approved + fully paid)
  ('f5ff5ff5-0001-0001-0001-000000000004',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000005',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'INV/RM/2024-004', '2024-11-20',
   6000.00, 250.00, 5000.00,
   262.50, 262.50, 525.00,
   5250.00, 5250.00, 0.00,
   'Bulk', 'Approved',
   'INDIA_EYE_NET/GRN/2024-25/000003', '2024-11-22',
   'OT consumables supply', 'active'),

  -- Invoice 5: Corneal Vision Care → Central Store (Draft)
  ('f5ff5ff5-0001-0001-0001-000000000005',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000003',
   'b1bb1bb1-0001-0001-0001-000000000001',
   'INV/CV/2024-005', '2024-12-01',
   48000.00, 0.00, 45714.29,
   2285.71, 2285.71, 4571.42,
   45000.00, 0.00, 45000.00,
   'Bulk', 'Draft',
   NULL, NULL,
   'OVD and BSS supply — pending primary approval', 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. PURCHASE ITEMS (line items on invoices)
-- =============================================================================
INSERT INTO inv_purchase_items
  (id, tenant_id, invoice_id, item_id,
   ordered_quantity, received_quantity,
   batch_number, expiry_date,
   mrp, purchase_rate,
   gst_percent, cgst_percent, sgst_percent,
   gst_amount, taxable_amount, net_amount, status)
VALUES
  -- Invoice 1 (Carl Zeiss): Monofocal IOL x20
  ('e8ee8ee8-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000001',
   20, 20, 'CZ-MONO-2410', '2027-04-30',
   7500.00, 6000.00,
   5.00, 2.50, 2.50,
   6000.00, 120000.00, 126000.00, 'active'),

  -- Invoice 1 (Carl Zeiss): Toric IOL x5
  ('e8ee8ee8-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000002',
   5, 5, 'CZ-TOR-2410', '2027-04-30',
   12000.00, 9500.00,
   5.00, 2.50, 2.50,
   2375.00, 47500.00, 49875.00, 'active'),

  -- Invoice 1 (Carl Zeiss): IOL Injector x20
  ('e8ee8ee8-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000003',
   20, 20, 'CZ-INJ-2410', '2026-10-30',
   2500.00, 1800.00,
   12.00, 6.00, 6.00,
   4320.00, 36000.00, 40320.00, 'active'),

  -- Invoice 2 (Biotech): Monofocal IOL x10 (not yet received — PrimaryApproved)
  ('e8ee8ee8-0001-0001-0001-000000000004',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000001',
   10, 0, 'BV-MONO-2411', '2026-12-31',
   7500.00, 6200.00,
   5.00, 2.50, 2.50,
   3100.00, 62000.00, 65100.00, 'active'),

  -- Invoice 2 (Biotech): Toric IOL x5 (not yet received)
  ('e8ee8ee8-0001-0001-0001-000000000005',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000002',
   5, 0, 'BV-TOR-2411', '2026-12-31',
   12000.00, 9800.00,
   5.00, 2.50, 2.50,
   1225.00, 24500.00, 25725.00, 'active'),

  -- Invoice 3 (Rudra Pharma): Moxifloxacin x50
  ('e8ee8ee8-0001-0001-0001-000000000006',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000004',
   50, 50, 'RP-MOXI-2411', '2026-06-30',
   280.00, 160.00,
   12.00, 6.00, 6.00,
   480.00, 8000.00, 8480.00, 'active'),

  -- Invoice 3 (Rudra Pharma): Timolol x30
  ('e8ee8ee8-0001-0001-0001-000000000007',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000011',
   30, 30, 'RP-TIM-2411', '2026-05-31',
   220.00, 130.00,
   12.00, 6.00, 6.00,
   234.00, 3900.00, 4134.00, 'active'),

  -- Invoice 4 (Royal Medical): Surgical Gloves x100
  ('e8ee8ee8-0001-0001-0001-000000000008',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000004',
   'e4ee4ee4-0001-0001-0001-000000000007',
   100, 100, 'RM-GLV-2411', '2027-06-30',
   55.00, 35.00,
   12.00, 6.00, 6.00,
   210.00, 3500.00, 3710.00, 'active'),

  -- Invoice 4 (Royal Medical): Surgical Drapes x40
  ('e8ee8ee8-0001-0001-0001-000000000009',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000004',
   'e4ee4ee4-0001-0001-0001-000000000008',
   40, 40, 'RM-DRP-2411', '2027-06-30',
   80.00, 50.00,
   12.00, 6.00, 6.00,
   120.00, 2000.00, 2120.00, 'active'),

  -- Invoice 5 (Corneal): OVD Provisc x30 (Draft — not received)
  ('e8ee8ee8-0001-0001-0001-000000000010',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000005',
   'e4ee4ee4-0001-0001-0001-000000000009',
   30, 0, 'CV-OVD-2412', '2026-06-30',
   2200.00, 1400.00,
   12.00, 6.00, 6.00,
   2520.00, 42000.00, 44520.00, 'active'),

  -- Invoice 5 (Corneal): BSS 500ml x20 (Draft — not received)
  ('e8ee8ee8-0001-0001-0001-000000000011',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000005',
   'e4ee4ee4-0001-0001-0001-000000000010',
   20, 0, 'CV-BSS-2412', '2026-12-31',
   550.00, 250.00,
   5.00, 2.50, 2.50,
   250.00, 5000.00, 5250.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. GRN HEADERS (for Invoices 1, 3, 4 which are Approved)
-- =============================================================================
INSERT INTO inv_grn_headers
  (id, tenant_id, invoice_id, store_id,
   grn_number, grn_date, grn_status, remarks, status)
VALUES
  ('a6aa6aa6-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'INDIA_EYE_NET/GRN/2024-25/000001', '2024-10-18',
   'Approved', 'Carl Zeiss IOLs received in good condition', 'active'),

  ('a6aa6aa6-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000003',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'INDIA_EYE_NET/GRN/2024-25/000002', '2024-11-12',
   'Approved', 'Rudra Pharma drugs received', 'active'),

  ('a6aa6aa6-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000004',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'INDIA_EYE_NET/GRN/2024-25/000003', '2024-11-22',
   'Approved', 'Royal Medical OT consumables received', 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. GRN ITEMS
-- =============================================================================
INSERT INTO inv_grn_items
  (id, tenant_id, grn_header_id, purchase_item_id, item_id,
   accepted_quantity, rejected_quantity, is_verified, status)
VALUES
  -- GRN 1 (Carl Zeiss)
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000001',
   'e8ee8ee8-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000001',
   20, 0, true, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000001',
   'e8ee8ee8-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000002',
   5, 0, true, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000001',
   'e8ee8ee8-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000003',
   18, 2, true, 'active'),

  -- GRN 2 (Rudra Pharma)
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000002',
   'e8ee8ee8-0001-0001-0001-000000000006',
   'e4ee4ee4-0001-0001-0001-000000000004',
   50, 0, true, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000002',
   'e8ee8ee8-0001-0001-0001-000000000007',
   'e4ee4ee4-0001-0001-0001-000000000011',
   30, 0, true, 'active'),

  -- GRN 3 (Royal Medical Hall)
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000003',
   'e8ee8ee8-0001-0001-0001-000000000008',
   'e4ee4ee4-0001-0001-0001-000000000007',
   100, 0, true, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a6aa6aa6-0001-0001-0001-000000000003',
   'e8ee8ee8-0001-0001-0001-000000000009',
   'e4ee4ee4-0001-0001-0001-000000000008',
   40, 0, true, 'active');

-- =============================================================================
-- 9. STOCK BATCHES (quantity_available > 0 — required by GetSummaryAsync)
-- =============================================================================
INSERT INTO inv_stock_batches
  (id, tenant_id, store_id, item_id, invoice_id, purchase_item_id,
   batch_number, expiry_date, requires_cold_storage,
   mrp, purchase_rate,
   quantity_in, quantity_out, quantity_available,
   is_active, status)
VALUES
  -- OT Store: Monofocal IOL (Carl Zeiss, batch Oct-24) — 15 available
  ('ba7ba7ba-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000001',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'e8ee8ee8-0001-0001-0001-000000000001',
   'CZ-MONO-2410', '2027-04-30', false,
   7500.00, 6000.00,
   20, 5, 15,
   true, 'active'),

  -- OT Store: Toric IOL (Carl Zeiss) — 3 available (BELOW reorder level of 5)
  ('ba7ba7ba-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000002',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'e8ee8ee8-0001-0001-0001-000000000002',
   'CZ-TOR-2410', '2027-04-30', false,
   12000.00, 9500.00,
   5, 2, 3,
   true, 'active'),

  -- OT Store: IOL Injectors — 12 available
  ('ba7ba7ba-0001-0001-0001-000000000003',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000003',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'e8ee8ee8-0001-0001-0001-000000000003',
   'CZ-INJ-2410', '2026-10-30', false,
   2500.00, 1800.00,
   18, 6, 12,
   true, 'active'),

  -- Pharmacy: Moxifloxacin — 38 available
  ('ba7ba7ba-0001-0001-0001-000000000004',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000004',
   'f5ff5ff5-0001-0001-0001-000000000003',
   'e8ee8ee8-0001-0001-0001-000000000006',
   'RP-MOXI-2411', '2026-06-30', false,
   280.00, 160.00,
   50, 12, 38,
   true, 'active'),

  -- Pharmacy: Timolol — 22 available
  ('ba7ba7ba-0001-0001-0001-000000000005',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000011',
   'f5ff5ff5-0001-0001-0001-000000000003',
   'e8ee8ee8-0001-0001-0001-000000000007',
   'RP-TIM-2411', '2026-05-31', false,
   220.00, 130.00,
   30, 8, 22,
   true, 'active'),

  -- Pharmacy: Surgical Gloves — 80 available
  ('ba7ba7ba-0001-0001-0001-000000000006',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000007',
   'f5ff5ff5-0001-0001-0001-000000000004',
   'e8ee8ee8-0001-0001-0001-000000000008',
   'RM-GLV-2411', '2027-06-30', false,
   55.00, 35.00,
   100, 20, 80,
   true, 'active'),

  -- Pharmacy: Surgical Drapes — 30 available
  ('ba7ba7ba-0001-0001-0001-000000000007',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000008',
   'f5ff5ff5-0001-0001-0001-000000000004',
   'e8ee8ee8-0001-0001-0001-000000000009',
   'RM-DRP-2411', '2027-06-30', false,
   80.00, 50.00,
   40, 10, 30,
   true, 'active'),

  -- OT Store: OVD (previous stock, cold chain) — 3 available (BELOW reorder level of 5)
  ('ba7ba7ba-0001-0001-0001-000000000008',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000009',
   NULL, NULL,
   'PREV-OVD-2401', '2026-09-30', true,
   2200.00, 1400.00,
   15, 12, 3,
   true, 'active'),

  -- Pharmacy: BSS (near expiry — Apr 2025) — 15 available
  ('ba7ba7ba-0001-0001-0001-000000000009',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000010',
   NULL, NULL,
   'PREV-BSS-2312', '2025-04-30', false,
   550.00, 250.00,
   20, 5, 15,
   true, 'active'),

  -- Pharmacy: Dexamethasone — 45 available
  ('ba7ba7ba-0001-0001-0001-000000000010',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000012',
   NULL, NULL,
   'PREV-DEX-2401', '2026-08-31', false,
   190.00, 110.00,
   60, 15, 45,
   true, 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. STOCK LEDGER (GRN_IN entries for each received batch)
-- =============================================================================
INSERT INTO inv_stock_ledger
  (id, tenant_id, store_id, item_id, stock_batch_id,
   transaction_type, reference_id, reference_number,
   quantity_in, quantity_out, balance_quantity,
   unit_rate, total_value, remarks, transaction_date, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000001',
   'ba7ba7ba-0001-0001-0001-000000000001',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000001',
   'INDIA_EYE_NET/GRN/2024-25/000001',
   20, 0, 15, 6000.00, 120000.00,
   'Monofocal IOL received', '2024-10-18', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000002',
   'ba7ba7ba-0001-0001-0001-000000000002',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000001',
   'INDIA_EYE_NET/GRN/2024-25/000001',
   5, 0, 3, 9500.00, 47500.00,
   'Toric IOL received', '2024-10-18', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'e4ee4ee4-0001-0001-0001-000000000003',
   'ba7ba7ba-0001-0001-0001-000000000003',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000001',
   'INDIA_EYE_NET/GRN/2024-25/000001',
   18, 0, 12, 1800.00, 32400.00,
   'IOL Injectors received (2 rejected)', '2024-10-18', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000004',
   'ba7ba7ba-0001-0001-0001-000000000004',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000002',
   'INDIA_EYE_NET/GRN/2024-25/000002',
   50, 0, 38, 160.00, 8000.00,
   'Moxifloxacin eye drops received', '2024-11-12', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000011',
   'ba7ba7ba-0001-0001-0001-000000000005',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000002',
   'INDIA_EYE_NET/GRN/2024-25/000002',
   30, 0, 22, 130.00, 3900.00,
   'Timolol eye drops received', '2024-11-12', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000007',
   'ba7ba7ba-0001-0001-0001-000000000006',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000003',
   'INDIA_EYE_NET/GRN/2024-25/000003',
   100, 0, 80, 35.00, 3500.00,
   'Surgical gloves received', '2024-11-22', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000008',
   'ba7ba7ba-0001-0001-0001-000000000007',
   'GRN_IN', 'a6aa6aa6-0001-0001-0001-000000000003',
   'INDIA_EYE_NET/GRN/2024-25/000003',
   40, 0, 30, 50.00, 2000.00,
   'Surgical drapes received', '2024-11-22', 'active');

-- =============================================================================
-- 11. STOCK TRANSFERS
-- =============================================================================
INSERT INTO inv_stock_transfers
  (id, tenant_id, from_store_id, to_store_id,
   transfer_number, transfer_date, transfer_status, remarks, status)
VALUES
  ('a0aa0aa0-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',   -- from: Pharmacy
   'b1bb1bb1-0001-0001-0001-000000000003',   -- to: OT Store
   'TRF/2024/001', '2024-11-25',
   'Approved',
   'Transfer drugs and gloves to OT for surgery day', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inv_stock_transfer_items
  (id, tenant_id, transfer_id, item_id, stock_batch_id,
   transfer_quantity, unit_rate, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a0aa0aa0-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000004',
   'ba7ba7ba-0001-0001-0001-000000000004',
   5, 160.00, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'a0aa0aa0-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000007',
   'ba7ba7ba-0001-0001-0001-000000000006',
   10, 35.00, 'active');

-- =============================================================================
-- 12. PHARMACY BILLS
-- =============================================================================
INSERT INTO inv_pharmacy_bills
  (id, tenant_id, store_id, bill_number, bill_date,
   patient_name, patient_ip_op_no,
   gross_amount, discount_amount, gst_amount, net_amount,
   payment_mode, paid_amount, balance_amount,
   bill_status, status)
VALUES
  ('b1b1b1b1-b1b1-b1b1-b1b1-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'PHBILL/2024/001', '2024-11-20',
   'Ramakrishna Reddy', 'OP/2024/1234',
   850.00, 50.00, 96.00, 896.00,
   'Cash', 896.00, 0.00,
   'Billed', 'active'),

  ('b1b1b1b1-b1b1-b1b1-b1b1-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'PHBILL/2024/002', '2024-11-28',
   'Saraswathi Naidu', 'OP/2024/1289',
   560.00, 0.00, 67.20, 627.20,
   'UPI', 627.20, 0.00,
   'Billed', 'active')
ON CONFLICT (id) DO NOTHING;

-- Pharmacy bill items
INSERT INTO inv_pharmacy_bill_items
  (id, tenant_id, bill_id, item_id, stock_batch_id,
   quantity, mrp, selling_rate,
   discount_percent, gst_percent,
   taxable_amount, gst_amount, net_amount, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1b1b1b1-b1b1-b1b1-b1b1-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000004',
   'ba7ba7ba-0001-0001-0001-000000000004',
   2, 280.00, 265.00, 5.36, 12.00,
   476.40, 57.17, 533.57, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1b1b1b1-b1b1-b1b1-b1b1-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000012',
   'ba7ba7ba-0001-0001-0001-000000000010',
   2, 190.00, 180.00, 0.00, 12.00,
   321.43, 38.57, 360.00, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1b1b1b1-b1b1-b1b1-b1b1-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000011',
   'ba7ba7ba-0001-0001-0001-000000000005',
   3, 220.00, 210.00, 0.00, 12.00,
   562.50, 67.50, 630.00, 'active');

-- =============================================================================
-- 13. SURGERY CONSUMABLES (flat table — one row per item issued per surgery)
-- =============================================================================
INSERT INTO inv_surgery_consumables
  (id, tenant_id, store_id, surgery_id, item_id, stock_batch_id,
   iol_billing_mode, patient_name, patient_ip_no,
   quantity, unit_rate, amount, remarks, issued_at, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   NULL,
   'e4ee4ee4-0001-0001-0001-000000000001',
   'ba7ba7ba-0001-0001-0001-000000000001',
   'Bulk', 'Raju Verma', 'IP/2024/0892',
   1, 7500.00, 7500.00,
   'Phaco RE — Monofocal IOL implanted',
   '2024-11-18 09:30:00+05:30', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   NULL,
   'e4ee4ee4-0001-0001-0001-000000000009',
   'ba7ba7ba-0001-0001-0001-000000000008',
   'Bulk', 'Raju Verma', 'IP/2024/0892',
   1, 2200.00, 2200.00,
   'OVD used during phaco surgery',
   '2024-11-18 09:30:00+05:30', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   NULL,
   'e4ee4ee4-0001-0001-0001-000000000003',
   'ba7ba7ba-0001-0001-0001-000000000003',
   'Bulk', 'Lakshmi Devi', 'IP/2024/0897',
   1, 2500.00, 2500.00,
   'Pre-loaded injector for IOL delivery',
   '2024-11-19 10:00:00+05:30', 'active');

-- =============================================================================
-- 14. PURCHASE REQUISITIONS
-- =============================================================================
INSERT INTO inv_purchase_requisitions
  (id, tenant_id, store_id,
   requisition_number, requisition_date,
   requisition_type, requisition_status,
   remarks, status)
VALUES
  ('f9ff9ff9-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000002',
   'PR/2024/001', '2024-12-01',
   'Manual', 'Approved',
   'Monthly restock of ophthalmic drugs', 'active'),

  ('f9ff9ff9-0001-0001-0001-000000000002',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'b1bb1bb1-0001-0001-0001-000000000003',
   'PR/2024/002', '2024-12-05',
   'AutoReorder', 'Pending',
   'Auto-generated: OVD and Toric IOL below reorder level', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inv_purchase_requisition_items
  (id, tenant_id, requisition_id, item_id,
   required_quantity, current_stock, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f9ff9ff9-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000004',
   100, 38.00, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f9ff9ff9-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000011',
   60, 22.00, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f9ff9ff9-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000002',
   10, 3.00, 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f9ff9ff9-0001-0001-0001-000000000002',
   'e4ee4ee4-0001-0001-0001-000000000009',
   15, 3.00, 'active');

-- =============================================================================
-- 15. PURCHASE RETURNS
-- =============================================================================
INSERT INTO inv_purchase_returns
  (id, tenant_id, invoice_id, vendor_id,
   return_number, return_date, return_reason,
   total_amount, remarks, settlement_status, status)
VALUES
  ('c3cc3cc3-0001-0001-0001-000000000001',
   '155fe198-6ae5-4a01-9254-ead5b427247e',
   'f5ff5ff5-0001-0001-0001-000000000001',
   'd3dd3dd3-0001-0001-0001-000000000001',
   'PR-RET/2024/001', '2024-10-25',
   'QualityRejection',
   3600.00,
   '2 IOL Injectors cracked on inspection — returned to Carl Zeiss',
   'Pending', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inv_purchase_return_items
  (id, tenant_id, return_id, item_id, stock_batch_id,
   return_quantity, purchase_rate, amount, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'c3cc3cc3-0001-0001-0001-000000000001',
   'e4ee4ee4-0001-0001-0001-000000000003',
   'ba7ba7ba-0001-0001-0001-000000000003',
   2, 1800.00, 3600.00, 'active');

-- =============================================================================
-- 16. VENDOR PAYMENTS
-- =============================================================================
INSERT INTO inv_vendor_payments
  (id, tenant_id, vendor_id, invoice_id,
   payment_reference, payment_date, amount,
   payment_mode, remarks, status)
VALUES
  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000004',
   'f5ff5ff5-0001-0001-0001-000000000003',
   'NEFT/2024/1125/001', '2024-11-25',
   18500.00, 'NEFT',
   'Full payment for INV/RP/2024-003', 'active'),

  (uuid_generate_v4(), '155fe198-6ae5-4a01-9254-ead5b427247e',
   'd3dd3dd3-0001-0001-0001-000000000005',
   'f5ff5ff5-0001-0001-0001-000000000004',
   'RTGS/2024/1130/002', '2024-11-30',
   5250.00, 'RTGS',
   'Full payment for INV/RM/2024-004', 'active');

-- =============================================================================
-- 17. REFRESH MATERIALIZED VIEW (if it exists — ignore error otherwise)
-- =============================================================================
DO $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inv_stock_summary;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not refresh materialized view: %', SQLERRM;
END;
$$;

COMMIT;
