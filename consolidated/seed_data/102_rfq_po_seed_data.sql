-- =============================================================================
-- RFQ & PURCHASE ORDER SEED DATA — India Eye Hospital Network
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Run AFTER: 101_inventory_seed_data.sql
-- Idempotent: all INSERTs use ON CONFLICT (id) DO NOTHING
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_tenant_id  UUID := '155fe198-6ae5-4a01-9254-ead5b427247e';
  v_branch_id  UUID;
  v_user_id    UUID;

  -- Vendor UUIDs (from 101_inventory_seed_data.sql)
  v_vendor1 UUID := 'd3dd3dd3-0001-0001-0001-000000000001'; -- Carl Zeiss India
  v_vendor2 UUID := 'd3dd3dd3-0001-0001-0001-000000000002'; -- Biotech Vision Care
  v_vendor3 UUID := 'd3dd3dd3-0001-0001-0001-000000000003'; -- Corneal Vision Care
  v_vendor4 UUID := 'd3dd3dd3-0001-0001-0001-000000000004'; -- Rudra Pharma
  v_vendor5 UUID := 'd3dd3dd3-0001-0001-0001-000000000005'; -- Royal Medical Hall

  -- Item UUIDs (from 101_inventory_seed_data.sql)
  v_item1 UUID := 'e4ee4ee4-0001-0001-0001-000000000001'; -- Monofocal IOL AUROVUE 22.0D
  v_item2 UUID := 'e4ee4ee4-0001-0001-0001-000000000002'; -- Toric IOL Aurovue T3
  v_item3 UUID := 'e4ee4ee4-0001-0001-0001-000000000003'; -- IOL Injector Pre-loaded System
  v_item4 UUID := 'e4ee4ee4-0001-0001-0001-000000000004'; -- Moxifloxacin 0.5% Eye Drops
  v_item5 UUID := 'e4ee4ee4-0001-0001-0001-000000000005'; -- Ceftriaxone 1g Injection
  v_item7 UUID := 'e4ee4ee4-0001-0001-0001-000000000007'; -- Surgical Gloves 7.5
  v_item8 UUID := 'e4ee4ee4-0001-0001-0001-000000000008'; -- Disposable Surgical Drapes
  v_item9 UUID := 'e4ee4ee4-0001-0001-0001-000000000009'; -- OVD Provisc 0.8ml

BEGIN
  -- Fetch branch for the tenant
  SELECT id INTO v_branch_id
  FROM branch
  WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
  ORDER BY created_at
  LIMIT 1;

  IF v_branch_id IS NULL THEN
    RAISE NOTICE 'No branch found for tenant %, skipping RFQ/PO seed.', v_tenant_id;
    RETURN;
  END IF;

  -- Fetch an admin user for audit columns
  SELECT id INTO v_user_id
  FROM users
  WHERE tenant_id = v_tenant_id AND "DeletedAt" IS NULL
  ORDER BY "CreatedAt"
  LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  RAISE NOTICE 'Seeding RFQ/PO — tenant: %, branch: %, user: %', v_tenant_id, v_branch_id, v_user_id;

  -- ===========================================================================
  -- 1. RFQ HEADERS
  -- ===========================================================================
  INSERT INTO inv_rfq_headers (
    id, tenant_id, branch_id,
    rfq_number, title, rfq_status,
    published_at, response_deadline,
    awarded_to_vendor_id, awarded_at,
    notes,
    created_at, updated_at,
    created_by_user_id, updated_by_user_id,
    status
  ) VALUES

  -- RFQ-1: Draft
  ('a1000001-0001-0001-0001-000000000001',
   v_tenant_id, v_branch_id,
   'RFQ/20250310/0001', 'IOL Procurement Q1 2025', 'Draft',
   NULL, NOW() + INTERVAL '15 days',
   NULL, NULL,
   'Quarterly procurement for Monofocal and Toric IOL stock. Min 3 vendor quotes required.',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
   v_user_id, v_user_id, 'active'),

  -- RFQ-2: Draft
  ('a1000001-0001-0001-0001-000000000002',
   v_tenant_id, v_branch_id,
   'RFQ/20250312/0001', 'Surgical Consumables April 2025', 'Draft',
   NULL, NOW() + INTERVAL '10 days',
   NULL, NULL,
   'OT consumables and surgical gloves — monthly procurement April batch.',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
   v_user_id, v_user_id, 'active'),

  -- RFQ-3: Published
  ('a1000001-0001-0001-0001-000000000003',
   v_tenant_id, v_branch_id,
   'RFQ/20250301/0001', 'Ophthalmic Drugs Bulk Purchase', 'Published',
   NOW() - INTERVAL '10 days', NOW() + INTERVAL '7 days',
   NULL, NULL,
   'Annual ophthalmic drug procurement. Vendors must provide GST invoice and drug license.',
   NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days',
   v_user_id, v_user_id, 'active'),

  -- RFQ-4: Awarded
  ('a1000001-0001-0001-0001-000000000004',
   v_tenant_id, v_branch_id,
   'RFQ/20250215/0001', 'Toric IOL Supply Contract H1 2025', 'Awarded',
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '10 days',
   v_vendor2, NOW() - INTERVAL '5 days',
   'H1 2025 Toric IOL supply. Awarded to Biotech Vision Care based on best quote.',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days',
   v_user_id, v_user_id, 'active')

  ON CONFLICT (id) DO NOTHING;

  -- ===========================================================================
  -- 2. RFQ ITEMS
  -- ===========================================================================
  INSERT INTO inv_rfq_items (
    id, tenant_id, rfq_id, item_id,
    requested_qty, unit, specifications,
    created_at, updated_at,
    created_by_user_id, updated_by_user_id,
    status
  ) VALUES

  -- RFQ-1 (Draft — IOL)
  ('a1000002-0001-0001-0001-000000000001', v_tenant_id,
   'a1000001-0001-0001-0001-000000000001', v_item1,
   50, 'Nos', 'Monofocal IOL 22.0D Hydrophilic Acrylic — 6mm optic, CT must be attached',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', v_user_id, v_user_id, 'active'),

  ('a1000002-0001-0001-0001-000000000002', v_tenant_id,
   'a1000001-0001-0001-0001-000000000001', v_item2,
   20, 'Nos', 'Toric IOL T3 for astigmatism correction — Aurolab or equivalent',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', v_user_id, v_user_id, 'active'),

  ('a1000002-0001-0001-0001-000000000003', v_tenant_id,
   'a1000001-0001-0001-0001-000000000001', v_item3,
   30, 'Nos', 'Pre-loaded IOL Injector System — compatible with 3mm clear corneal incision',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', v_user_id, v_user_id, 'active'),

  -- RFQ-2 (Draft — Consumables)
  ('a1000002-0001-0001-0001-000000000004', v_tenant_id,
   'a1000001-0001-0001-0001-000000000002', v_item7,
   500, 'Pair', 'Sterile latex surgical gloves size 7.5 — individually pouched, ISO certified',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', v_user_id, v_user_id, 'active'),

  ('a1000002-0001-0001-0001-000000000005', v_tenant_id,
   'a1000001-0001-0001-0001-000000000002', v_item8,
   200, 'Nos', 'Non-woven disposable OT drapes 150x200cm — sterile packed',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', v_user_id, v_user_id, 'active'),

  -- RFQ-3 (Published — Drugs)
  ('a1000002-0001-0001-0001-000000000006', v_tenant_id,
   'a1000001-0001-0001-0001-000000000003', v_item4,
   200, 'Bottle', 'Moxifloxacin 0.5% 5ml — Vigamox brand preferred, cold chain not required',
   NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', v_user_id, v_user_id, 'active'),

  ('a1000002-0001-0001-0001-000000000007', v_tenant_id,
   'a1000001-0001-0001-0001-000000000003', v_item5,
   100, 'Vial', 'Ceftriaxone 1g IV vials — cold chain delivery mandatory',
   NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', v_user_id, v_user_id, 'active'),

  -- RFQ-4 (Awarded — Toric IOL)
  ('a1000002-0001-0001-0001-000000000008', v_tenant_id,
   'a1000001-0001-0001-0001-000000000004', v_item2,
   40, 'Nos', 'Toric IOL T3/T4/T5 assorted — Aurolab brand, with PMMA haptics',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', v_user_id, v_user_id, 'active'),

  ('a1000002-0001-0001-0001-000000000009', v_tenant_id,
   'a1000001-0001-0001-0001-000000000004', v_item9,
   25, 'Nos', 'OVD Provisc 0.8ml syringe — cold chain, expiry min 18 months',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', v_user_id, v_user_id, 'active')

  ON CONFLICT (id) DO NOTHING;

  -- ===========================================================================
  -- 3. RFQ VENDOR INVITES (only for Published and Awarded RFQs)
  -- ===========================================================================
  INSERT INTO inv_rfq_vendor_invites (
    id, tenant_id, rfq_id, vendor_id,
    invite_status, invited_at, responded_at,
    created_at, updated_at,
    created_by_user_id, updated_by_user_id,
    status
  ) VALUES

  -- RFQ-3 (Published) — 2 vendors invited
  ('a1000003-0001-0001-0001-000000000001', v_tenant_id,
   'a1000001-0001-0001-0001-000000000003', v_vendor4,
   'Invited', NOW() - INTERVAL '10 days', NULL,
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', v_user_id, v_user_id, 'active'),

  ('a1000003-0001-0001-0001-000000000002', v_tenant_id,
   'a1000001-0001-0001-0001-000000000003', v_vendor5,
   'Invited', NOW() - INTERVAL '10 days', NULL,
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', v_user_id, v_user_id, 'active'),

  -- RFQ-4 (Awarded) — 2 vendors submitted quotes
  ('a1000003-0001-0001-0001-000000000003', v_tenant_id,
   'a1000001-0001-0001-0001-000000000004', v_vendor2,
   'QuoteSubmitted', NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days',
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days', v_user_id, v_user_id, 'active'),

  ('a1000003-0001-0001-0001-000000000004', v_tenant_id,
   'a1000001-0001-0001-0001-000000000004', v_vendor3,
   'QuoteSubmitted', NOW() - INTERVAL '25 days', NOW() - INTERVAL '17 days',
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '17 days', v_user_id, v_user_id, 'active')

  ON CONFLICT (id) DO NOTHING;

  -- ===========================================================================
  -- 4. PURCHASE ORDERS
  -- ===========================================================================
  INSERT INTO inv_purchase_orders (
    id, tenant_id, branch_id,
    po_number, vendor_id, po_status, source_type,
    total_amount, gst_amount, net_amount,
    po_date, expected_delivery_date,
    is_emergency, notes, terms,
    created_at, updated_at,
    created_by_user_id, updated_by_user_id,
    status
  ) VALUES

  -- PO-1: Draft — Carl Zeiss IOLs
  ('b2000001-0001-0001-0001-000000000001',
   v_tenant_id, v_branch_id,
   'PO/20250310/0001', v_vendor1, 'Draft', 'Direct',
   315000.00, 15000.00, 315000.00,
   NOW() - INTERVAL '5 days', NOW() + INTERVAL '20 days',
   false,
   'Q1 2025 IOL procurement — Carl Zeiss India. 30 units Monofocal + 20 Injectors.',
   'Net 30 days. GST invoice mandatory.',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
   v_user_id, v_user_id, 'active'),

  -- PO-2: Draft — Rudra Pharma drugs
  ('b2000001-0001-0001-0001-000000000002',
   v_tenant_id, v_branch_id,
   'PO/20250312/0001', v_vendor4, 'Draft', 'Direct',
   28784.00, 3360.00, 28784.00,
   NOW() - INTERVAL '3 days', NOW() + INTERVAL '10 days',
   false,
   'Monthly drug procurement April 2025 — Moxifloxacin eye drops and Ceftriaxone vials.',
   'Net 15 days.',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
   v_user_id, v_user_id, 'active'),

  -- PO-3: Submitted — Biotech Vision Care
  ('b2000001-0001-0001-0001-000000000003',
   v_tenant_id, v_branch_id,
   'PO/20250301/0001', v_vendor2, 'Submitted', 'Direct',
   94500.00, 4500.00, 94500.00,
   NOW() - INTERVAL '14 days', NOW() + INTERVAL '15 days',
   false,
   'Toric IOL supply — Biotech Vision Care. 10 units T3 series.',
   'Net 45 days. Payment on delivery.',
   NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days',
   v_user_id, v_user_id, 'active'),

  -- PO-4: L1Approved — Emergency OVD (Corneal Vision Care)
  ('b2000001-0001-0001-0001-000000000004',
   v_tenant_id, v_branch_id,
   'PO/20250215/0001', v_vendor3, 'L1Approved', 'Emergency',
   36960.00, 3960.00, 36960.00,
   NOW() - INTERVAL '20 days', NOW() + INTERVAL '3 days',
   true,
   'EMERGENCY: OVD Provisc restock — critical shortage for scheduled surgeries.',
   'Immediate delivery. Invoice to follow.',
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days',
   v_user_id, v_user_id, 'active')

  ON CONFLICT (id) DO NOTHING;

  -- ===========================================================================
  -- 5. PURCHASE ORDER ITEMS
  -- ===========================================================================
  INSERT INTO inv_purchase_order_items (
    id, tenant_id, po_id, item_id,
    ordered_qty, received_qty,
    unit_price, gst_percent, total_amount, unit,
    required_by,
    created_at, updated_at,
    created_by_user_id, updated_by_user_id,
    status
  ) VALUES

  -- PO-1 items (Draft — Carl Zeiss)
  ('b2000002-0001-0001-0001-000000000001', v_tenant_id,
   'b2000001-0001-0001-0001-000000000001', v_item1,
   30, 0, 6000.00, 5.00, 189000.00, 'Nos',
   NOW() + INTERVAL '20 days',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', v_user_id, v_user_id, 'active'),

  ('b2000002-0001-0001-0001-000000000002', v_tenant_id,
   'b2000001-0001-0001-0001-000000000001', v_item3,
   20, 0, 6300.00, 12.00, 141120.00, 'Nos',
   NOW() + INTERVAL '20 days',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', v_user_id, v_user_id, 'active'),

  -- PO-2 items (Draft — Rudra Pharma)
  ('b2000002-0001-0001-0001-000000000003', v_tenant_id,
   'b2000001-0001-0001-0001-000000000002', v_item4,
   100, 0, 185.00, 12.00, 20720.00, 'Bottle',
   NOW() + INTERVAL '10 days',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', v_user_id, v_user_id, 'active'),

  ('b2000002-0001-0001-0001-000000000004', v_tenant_id,
   'b2000001-0001-0001-0001-000000000002', v_item5,
   30, 0, 240.00, 12.00, 8064.00, 'Vial',
   NOW() + INTERVAL '10 days',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', v_user_id, v_user_id, 'active'),

  -- PO-3 item (Submitted — Biotech)
  ('b2000002-0001-0001-0001-000000000005', v_tenant_id,
   'b2000001-0001-0001-0001-000000000003', v_item2,
   10, 0, 9000.00, 5.00, 94500.00, 'Nos',
   NOW() + INTERVAL '15 days',
   NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', v_user_id, v_user_id, 'active'),

  -- PO-4 item (L1Approved Emergency — OVD)
  ('b2000002-0001-0001-0001-000000000006', v_tenant_id,
   'b2000001-0001-0001-0001-000000000004', v_item9,
   20, 0, 1650.00, 12.00, 36960.00, 'Nos',
   NOW() + INTERVAL '3 days',
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', v_user_id, v_user_id, 'active')

  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'SUCCESS: RFQ and PO seed data inserted — tenant %, branch %', v_tenant_id, v_branch_id;

END;
$$;

COMMIT;
