-- ============================================================
-- inventory_sample_data.sql
-- Seeds: 39 inventory items + 19 purchase invoices covering
-- all GRN/approval status scenarios (CURRENT_DATE so today's
-- default date filter shows all records).
--
-- Status scenarios:
--   inv01-04  -> approval=Draft,            no GRN  (GRNNotGenerated)
--   inv05-08  -> approval=Draft,            grn=Draft
--   inv09-11  -> approval=PrimaryApproved,  grn=PrimaryApproved
--   inv12-14  -> approval=Approved,         grn=Approved
--   inv15-17  -> approval=Cancelled,        grn=Rejected
--   inv18-19  -> approval=Rejected,         grn=Rejected
--
-- Safe to re-run: ON CONFLICT (id) DO NOTHING on all PKs;
-- ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING
-- on invoices; ON CONFLICT (tenant_id, grn_number) DO NOTHING on GRNs.
-- ============================================================

DO $$
DECLARE
    -- tenant & stores
    v_tenant_id     UUID;
    v_store_id      UUID;      -- Central
    v_ph_store_id   UUID;      -- Pharmacy
    v_ot_store_id   UUID;      -- OT

    -- vendors
    v_zeiss         UUID;
    v_biotech       UUID;
    v_corneal       UUID;
    v_rudra         UUID;
    v_royal         UUID;
    v_drugmart      UUID;
    v_ganga         UUID;
    v_sreeav        UUID;
    v_wiiz          UUID;

    -- categories
    c_drugs         UUID;   -- Ophthalmic Drugs / H
    c_drugs_h1      UUID;   -- Schedule H1 Drugs
    c_iol           UUID;   -- Intraocular Lenses
    c_surgical      UUID;   -- Surgical Instruments
    c_consumable    UUID;   -- OT Consumables

    -- 39 item IDs
    -- Ophthalmic drugs H (1-10)
    i01 UUID; i02 UUID; i03 UUID; i04 UUID; i05 UUID;
    i06 UUID; i07 UUID; i08 UUID; i09 UUID; i10 UUID;
    -- H1 drugs (11-12)
    i11 UUID; i12 UUID;
    -- IOLs (13-18)
    i13 UUID; i14 UUID; i15 UUID; i16 UUID; i17 UUID; i18 UUID;
    -- Surgical (19-25)
    i19 UUID; i20 UUID; i21 UUID; i22 UUID; i23 UUID; i24 UUID; i25 UUID;
    -- OT Consumables (26-34)
    i26 UUID; i27 UUID; i28 UUID; i29 UUID; i30 UUID;
    i31 UUID; i32 UUID; i33 UUID; i34 UUID;
    -- Misc drugs (35-39)
    i35 UUID; i36 UUID; i37 UUID; i38 UUID; i39 UUID;
BEGIN
    -- ── primary tenant ───────────────────────────────────────────────────────
    SELECT id INTO v_tenant_id FROM tenant ORDER BY created_at LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'No tenant found - skipping inventory seed.';
        RETURN;
    END IF;

    -- ── stores ───────────────────────────────────────────────────────────────
    SELECT id INTO v_store_id    FROM inv_store_master
        WHERE tenant_id = v_tenant_id AND store_type = 'Central'  AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ph_store_id FROM inv_store_master
        WHERE tenant_id = v_tenant_id AND store_type = 'Pharmacy' AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ot_store_id FROM inv_store_master
        WHERE tenant_id = v_tenant_id AND store_type = 'OT'       AND deleted_at IS NULL LIMIT 1;
    IF v_store_id IS NULL THEN
        RAISE NOTICE 'No stores found - run 99_inventory_module.sql first.';
        RETURN;
    END IF;
    IF v_ph_store_id IS NULL THEN v_ph_store_id := v_store_id; END IF;
    IF v_ot_store_id IS NULL THEN v_ot_store_id := v_store_id; END IF;

    -- ── vendors ──────────────────────────────────────────────────────────────
    SELECT id INTO v_zeiss    FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Carl Zeiss%'     LIMIT 1;
    SELECT id INTO v_biotech  FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Biotech Vision%' LIMIT 1;
    SELECT id INTO v_corneal  FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Corneal%'        LIMIT 1;
    SELECT id INTO v_rudra    FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Rudra%'          LIMIT 1;
    SELECT id INTO v_royal    FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Royal%'          LIMIT 1;
    SELECT id INTO v_drugmart FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Drug Mart%'      LIMIT 1;
    SELECT id INTO v_ganga    FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Ganga%'          LIMIT 1;
    SELECT id INTO v_sreeav   FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%Sree%'           LIMIT 1;
    SELECT id INTO v_wiiz     FROM inv_vendors WHERE tenant_id = v_tenant_id AND name ILIKE '%WIIZ%'           LIMIT 1;
    -- fallback: any vendor
    IF v_zeiss    IS NULL THEN SELECT id INTO v_zeiss    FROM inv_vendors WHERE tenant_id = v_tenant_id LIMIT 1; END IF;
    IF v_biotech  IS NULL THEN v_biotech  := v_zeiss; END IF;
    IF v_corneal  IS NULL THEN v_corneal  := v_zeiss; END IF;
    IF v_rudra    IS NULL THEN v_rudra    := v_zeiss; END IF;
    IF v_royal    IS NULL THEN v_royal    := v_zeiss; END IF;
    IF v_drugmart IS NULL THEN v_drugmart := v_zeiss; END IF;
    IF v_ganga    IS NULL THEN v_ganga    := v_zeiss; END IF;
    IF v_sreeav   IS NULL THEN v_sreeav   := v_zeiss; END IF;
    IF v_wiiz     IS NULL THEN v_wiiz     := v_zeiss; END IF;

    -- ── categories ───────────────────────────────────────────────────────────
    SELECT id INTO c_drugs      FROM inv_purchase_categories
        WHERE tenant_id = v_tenant_id AND category_type = 'Drugs'      LIMIT 1;
    SELECT id INTO c_iol        FROM inv_purchase_categories
        WHERE tenant_id = v_tenant_id AND category_type = 'Optical'     LIMIT 1;
    SELECT id INTO c_surgical   FROM inv_purchase_categories
        WHERE tenant_id = v_tenant_id AND category_type = 'Surgical'    LIMIT 1;
    SELECT id INTO c_consumable FROM inv_purchase_categories
        WHERE tenant_id = v_tenant_id AND category_type = 'Consumables' LIMIT 1;
    c_drugs_h1 := c_drugs;
    IF c_drugs    IS NULL THEN SELECT id INTO c_drugs FROM inv_purchase_categories WHERE tenant_id = v_tenant_id LIMIT 1; END IF;
    IF c_drugs_h1 IS NULL THEN c_drugs_h1 := c_drugs; END IF;
    IF c_iol      IS NULL THEN c_iol      := c_drugs; END IF;
    IF c_surgical IS NULL THEN c_surgical := c_drugs; END IF;
    IF c_consumable IS NULL THEN c_consumable := c_drugs; END IF;

    -- ── resolve item IDs (reuse existing row or fresh UUID) ──────────────────
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Moxifloxacin 0.5% Eye Drops'),    uuid_generate_v4()) INTO i01;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Tobramycin 0.3% Eye Drops'),       uuid_generate_v4()) INTO i02;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Prednisolone 1% Eye Drops'),       uuid_generate_v4()) INTO i03;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Atropine 1% Eye Drops'),           uuid_generate_v4()) INTO i04;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Cyclopentolate 1% Eye Drops'),     uuid_generate_v4()) INTO i05;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Timolol 0.5% Eye Drops'),          uuid_generate_v4()) INTO i06;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Latanoprost 0.005% Eye Drops'),    uuid_generate_v4()) INTO i07;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Dorzolamide 2% Eye Drops'),        uuid_generate_v4()) INTO i08;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Brimonidine 0.2% Eye Drops'),      uuid_generate_v4()) INTO i09;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Ketorolac 0.5% Eye Drops'),        uuid_generate_v4()) INTO i10;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Voriconazole 1% Eye Drops'),       uuid_generate_v4()) INTO i11;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Amphotericin B 0.15% Eye Drops'),  uuid_generate_v4()) INTO i12;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='SN60WF Monofocal IOL'),            uuid_generate_v4()) INTO i13;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='ZCB00 Monofocal IOL'),             uuid_generate_v4()) INTO i14;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Tecnis Symfony Toric IOL'),        uuid_generate_v4()) INTO i15;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Panoptix Trifocal IOL'),           uuid_generate_v4()) INTO i16;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Aurolab PMMA IOL'),                uuid_generate_v4()) INTO i17;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Hydrophilic Acrylic IOL'),         uuid_generate_v4()) INTO i18;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Phacoemulsification Tip'),         uuid_generate_v4()) INTO i19;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='MVR Blade 20G'),                   uuid_generate_v4()) INTO i20;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Keratome Blade 2.75mm'),           uuid_generate_v4()) INTO i21;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Iris Hooks Set'),                  uuid_generate_v4()) INTO i22;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Dispersive OVD (Viscoat)'),        uuid_generate_v4()) INTO i23;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Cohesive OVD (ProVisc)'),          uuid_generate_v4()) INTO i24;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Trypan Blue 0.06%'),               uuid_generate_v4()) INTO i25;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Balanced Salt Solution 500ml'),    uuid_generate_v4()) INTO i26;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Surgical Eye Drape Set'),          uuid_generate_v4()) INTO i27;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Irrigation/Aspiration Cannula'),   uuid_generate_v4()) INTO i28;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Suture Nylon 10-0'),               uuid_generate_v4()) INTO i29;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Syringe 5ml'),                     uuid_generate_v4()) INTO i30;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Cotton Balls 100pcs'),             uuid_generate_v4()) INTO i31;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Sterile Surgical Gloves'),         uuid_generate_v4()) INTO i32;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Betadine Solution 500ml'),         uuid_generate_v4()) INTO i33;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Eye Pad Sterile'),                 uuid_generate_v4()) INTO i34;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Fluorescein Sodium Strips'),       uuid_generate_v4()) INTO i35;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Tobradex Eye Ointment'),           uuid_generate_v4()) INTO i36;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Tropicacyl Plus Eye Drops'),       uuid_generate_v4()) INTO i37;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Acetazolamide 250mg Tablets'),     uuid_generate_v4()) INTO i38;
    SELECT COALESCE((SELECT id FROM inv_item_master WHERE tenant_id=v_tenant_id AND item_name='Mannitol 20% IV Infusion'),        uuid_generate_v4()) INTO i39;

    -- =========================================================
    -- SECTION 1 -- Item Master (39 rows)
    -- =========================================================

    -- Schedule-H ophthalmic drugs (i01-i10)
    INSERT INTO inv_item_master (id, tenant_id, category_id, item_name, generic_name, brand,
        hsn_code, unit, schedule_type, item_type, default_gst_rate,
        reorder_level, reorder_quantity, created_at, updated_at, status)
    VALUES
        (i01, v_tenant_id, c_drugs, 'Moxifloxacin 0.5% Eye Drops',    'Moxifloxacin HCl',      'Moxicip',     '30049099','Bottle','H', 'Drug','12',5,20, now(),now(),'active'),
        (i02, v_tenant_id, c_drugs, 'Tobramycin 0.3% Eye Drops',       'Tobramycin',             'Tobi',        '30049099','Bottle','H', 'Drug','12',5,20, now(),now(),'active'),
        (i03, v_tenant_id, c_drugs, 'Prednisolone 1% Eye Drops',        'Prednisolone',           'Pred Forte',  '30049099','Bottle','H', 'Drug','12',5,20, now(),now(),'active'),
        (i04, v_tenant_id, c_drugs, 'Atropine 1% Eye Drops',            'Atropine Sulfate',       'Atrosulph',   '30049099','Bottle','H', 'Drug','12',5,10, now(),now(),'active'),
        (i05, v_tenant_id, c_drugs, 'Cyclopentolate 1% Eye Drops',      'Cyclopentolate HCl',     'Cyclomydril', '30049099','Bottle','H', 'Drug','12',5,10, now(),now(),'active'),
        (i06, v_tenant_id, c_drugs, 'Timolol 0.5% Eye Drops',           'Timolol Maleate',        'Timoptic',    '30049099','Bottle','H', 'Drug','12',5,20, now(),now(),'active'),
        (i07, v_tenant_id, c_drugs, 'Latanoprost 0.005% Eye Drops',     'Latanoprost',            'Xalatan',     '30049099','Bottle','H', 'Drug','12',5,20, now(),now(),'active'),
        (i08, v_tenant_id, c_drugs, 'Dorzolamide 2% Eye Drops',         'Dorzolamide HCl',        'Trusopt',     '30049099','Bottle','H', 'Drug','12',5,15, now(),now(),'active'),
        (i09, v_tenant_id, c_drugs, 'Brimonidine 0.2% Eye Drops',       'Brimonidine Tartrate',   'Alphagan',    '30049099','Bottle','H', 'Drug','12',5,15, now(),now(),'active'),
        (i10, v_tenant_id, c_drugs, 'Ketorolac 0.5% Eye Drops',         'Ketorolac Tromethamine', 'Acular',      '30049099','Bottle','H', 'Drug','12',5,15, now(),now(),'active')
    ON CONFLICT (id) DO NOTHING;

    -- Schedule H1 drugs (i11-i12)
    INSERT INTO inv_item_master (id, tenant_id, category_id, item_name, generic_name, brand,
        hsn_code, unit, schedule_type, item_type, default_gst_rate,
        reorder_level, reorder_quantity, created_at, updated_at, status)
    VALUES
        (i11, v_tenant_id, c_drugs_h1, 'Voriconazole 1% Eye Drops',      'Voriconazole',   'Vfend',     '30049099','Bottle','H1','Drug','12',2,5, now(),now(),'active'),
        (i12, v_tenant_id, c_drugs_h1, 'Amphotericin B 0.15% Eye Drops', 'Amphotericin B', 'Fungizone', '30049099','Bottle','H1','Drug','12',2,5, now(),now(),'active')
    ON CONFLICT (id) DO NOTHING;

    -- Intraocular Lenses (i13-i18)
    INSERT INTO inv_item_master (id, tenant_id, category_id, item_name, generic_name, brand,
        hsn_code, unit, item_type, default_gst_rate,
        reorder_level, reorder_quantity, created_at, updated_at, status)
    VALUES
        (i13, v_tenant_id, c_iol, 'SN60WF Monofocal IOL',     'Hydrophobic Acrylic IOL',  'Alcon AcrySof', '90213100','Nos','IOL','12',5,20, now(),now(),'active'),
        (i14, v_tenant_id, c_iol, 'ZCB00 Monofocal IOL',       'Hydrophobic Acrylic IOL',  'J&J Vision',    '90213100','Nos','IOL','12',5,20, now(),now(),'active'),
        (i15, v_tenant_id, c_iol, 'Tecnis Symfony Toric IOL',   'EDOF Toric IOL',           'J&J Vision',    '90213100','Nos','IOL','12',2,10, now(),now(),'active'),
        (i16, v_tenant_id, c_iol, 'Panoptix Trifocal IOL',      'Trifocal IOL',             'Alcon',         '90213100','Nos','IOL','12',2,10, now(),now(),'active'),
        (i17, v_tenant_id, c_iol, 'Aurolab PMMA IOL',           'PMMA IOL',                 'Aurolab',       '90213100','Nos','IOL','5', 10,50, now(),now(),'active'),
        (i18, v_tenant_id, c_iol, 'Hydrophilic Acrylic IOL',    'Hydrophilic Acrylic IOL',  'Hoya',          '90213100','Nos','IOL','12',5,20, now(),now(),'active')
    ON CONFLICT (id) DO NOTHING;

    -- Surgical Instruments (i19-i25)
    INSERT INTO inv_item_master (id, tenant_id, category_id, item_name, generic_name, brand,
        hsn_code, unit, item_type, default_gst_rate,
        reorder_level, reorder_quantity, created_at, updated_at, status)
    VALUES
        (i19, v_tenant_id, c_surgical, 'Phacoemulsification Tip',    'Phaco Tip',          'Alcon',        '90189089','Nos',    'Surgical','18',2,10,  now(),now(),'active'),
        (i20, v_tenant_id, c_surgical, 'MVR Blade 20G',               'MVR Blade',          'Bausch&Lomb',  '82089000','Box',    'Surgical','12',5,20,  now(),now(),'active'),
        (i21, v_tenant_id, c_surgical, 'Keratome Blade 2.75mm',       'Keratome',           'Optitech',     '82089000','Box',    'Surgical','12',5,20,  now(),now(),'active'),
        (i22, v_tenant_id, c_surgical, 'Iris Hooks Set',               'Iris Hooks',         'Visitec',      '90189089','Set',    'Surgical','12',3,10,  now(),now(),'active'),
        (i23, v_tenant_id, c_surgical, 'Dispersive OVD (Viscoat)',     'Chondroitin/HA',     'Alcon',        '30079000','Syringe','Surgical','12',5,20,  now(),now(),'active'),
        (i24, v_tenant_id, c_surgical, 'Cohesive OVD (ProVisc)',       'Sodium Hyaluronate', 'Alcon',        '30079000','Syringe','Surgical','12',5,20,  now(),now(),'active'),
        (i25, v_tenant_id, c_surgical, 'Trypan Blue 0.06%',            'Trypan Blue',        'Nidek',        '32041900','Syringe','Surgical','12',5,20,  now(),now(),'active')
    ON CONFLICT (id) DO NOTHING;

    -- OT Consumables (i26-i34)
    INSERT INTO inv_item_master (id, tenant_id, category_id, item_name, generic_name, brand,
        hsn_code, unit, item_type, default_gst_rate,
        reorder_level, reorder_quantity, created_at, updated_at, status)
    VALUES
        (i26, v_tenant_id, c_consumable, 'Balanced Salt Solution 500ml', 'BSS',               'Alcon',       '30067000','Bottle','Consumable','12',10,50, now(),now(),'active'),
        (i27, v_tenant_id, c_consumable, 'Surgical Eye Drape Set',        'Eye Drape',         'Medi-aid',    '63079090','Set',   'Consumable','12',10,30, now(),now(),'active'),
        (i28, v_tenant_id, c_consumable, 'Irrigation/Aspiration Cannula', 'I/A Cannula',       'Visitec',     '90189089','Nos',   'Consumable','12',5,20,  now(),now(),'active'),
        (i29, v_tenant_id, c_consumable, 'Suture Nylon 10-0',             'Monofilament Nylon','Ethicon',     '30059090','Nos',   'Consumable','12',10,30, now(),now(),'active'),
        (i30, v_tenant_id, c_consumable, 'Syringe 5ml',                   'Disposable Syringe','BD',          '90183100','Box',   'Consumable','12',10,50, now(),now(),'active'),
        (i31, v_tenant_id, c_consumable, 'Cotton Balls 100pcs',            'Absorbent Cotton',  'Local',       '30059090','Pack',  'Consumable','12',5,20,  now(),now(),'active'),
        (i32, v_tenant_id, c_consumable, 'Sterile Surgical Gloves',        'Latex Gloves',      'Maxter',      '40151200','Pair',  'Consumable','12',20,100,now(),now(),'active'),
        (i33, v_tenant_id, c_consumable, 'Betadine Solution 500ml',        'Povidone Iodine',   'Win-Medicare','30049099','Bottle','Consumable','12',5,20,  now(),now(),'active'),
        (i34, v_tenant_id, c_consumable, 'Eye Pad Sterile',                'Eye Pad',           'Welcare',     '30059090','Box',   'Consumable','12',10,50, now(),now(),'active')
    ON CONFLICT (id) DO NOTHING;

    -- Misc drugs (i35-i39)
    INSERT INTO inv_item_master (id, tenant_id, category_id, item_name, generic_name, brand,
        hsn_code, unit, schedule_type, item_type, default_gst_rate,
        reorder_level, reorder_quantity, created_at, updated_at, status)
    VALUES
        (i35, v_tenant_id, c_drugs, 'Fluorescein Sodium Strips',  'Fluorescein Sodium',        'Haag-Streit','38220090','Box',   'H', 'Drug','12',5,20,  now(),now(),'active'),
        (i36, v_tenant_id, c_drugs, 'Tobradex Eye Ointment',       'Tobramycin+Dexamethasone',  'Alcon',      '30049099','Tube',  'H', 'Drug','12',5,20,  now(),now(),'active'),
        (i37, v_tenant_id, c_drugs, 'Tropicacyl Plus Eye Drops',   'Tropicamide+Phenylephrine', 'Sunways',    '30049099','Bottle','H', 'Drug','12',5,10,  now(),now(),'active'),
        (i38, v_tenant_id, c_drugs, 'Acetazolamide 250mg Tablets', 'Acetazolamide',             'Diamox',     '30049099','Strip', 'H', 'Drug','12',10,30, now(),now(),'active'),
        (i39, v_tenant_id, c_drugs, 'Mannitol 20% IV Infusion',    'Mannitol',                  'Baxter',     '30049099','Bottle', NULL,'Drug','5', 5,20,  now(),now(),'active')
    ON CONFLICT (id) DO NOTHING;

    -- =========================================================
    -- SECTION 2 -- Invoices + Items + GRNs  (19 invoices)
    -- All dated CURRENT_DATE for today's default filter
    -- =========================================================

    -- ── A: GRN Not Generated  (Draft invoice, no GRN)  ───────────────────────

    -- inv01  Carl Zeiss -- IOLs
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_zeiss, v_store_id,
        'SEED-ZEISS-001', CURRENT_DATE,
        60000.00, 0.00, 60000.00, 3600.00, 3600.00, 7200.00,
        67200.00, 67200.00, 'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i13,
        10, 0, 'ZS2025A', '2028-03-31',
        6500.00, 6500.00, 5800.00, 0,
        '90213100', 12, 6, 6, 6960.00, 58000.00, 64960.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ZEISS-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i13);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i14,
        5, 0, 'ZS2025B', '2028-03-31',
        7500.00, 7500.00, 6500.00, 0,
        '90213100', 12, 6, 6, 3900.00, 32500.00, 36400.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ZEISS-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i14);

    -- inv02  Rudra Pharma -- Schedule H drugs
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_rudra, v_ph_store_id,
        'SEED-RUDRA-001', CURRENT_DATE,
        9000.00, 0.00, 9000.00, 540.00, 540.00, 1080.00,
        10080.00, 10080.00, 'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i01,
        50, 0, 'M2025A', '2027-06-30',
        100.00, 100.00, 82.00, 0,
        '30049099', 12, 6, 6, 492.00, 4100.00, 4592.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i01);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i06,
        30, 0, 'T2025A', '2027-09-30',
        120.00, 120.00, 100.00, 0,
        '30049099', 12, 6, 6, 360.00, 3000.00, 3360.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i06);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i03,
        20, 0, 'P2025A', '2027-06-30',
        85.00, 85.00, 70.00, 0,
        '30049099', 12, 6, 6, 168.00, 1400.00, 1568.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i03);

    -- inv03  Drug Mart -- consumables
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_drugmart, v_ot_store_id,
        'SEED-DM-001', CURRENT_DATE,
        8000.00, 0.00, 8000.00, 480.00, 480.00, 960.00,
        8960.00, 8960.00, 'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i26,
        20, 0, 'B2025A', '2027-12-31',
        480.00, 480.00, 380.00, 0,
        '30067000', 12, 6, 6, 912.00, 7600.00, 8512.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i26);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i32,
        50, 0, 'G2025A', '2028-06-30',
        60.00, 60.00, 48.00, 0,
        '40151200', 12, 6, 6, 288.00, 2400.00, 2688.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i32);

    -- inv04  Ganga Pharma -- OVD + blades
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_ganga, v_ot_store_id,
        'SEED-GANGA-001', CURRENT_DATE,
        14400.00, 0.00, 14400.00, 864.00, 864.00, 1728.00,
        16128.00, 16128.00, 'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i23,
        10, 0, 'DO2025A', '2027-12-31',
        1400.00, 1400.00, 1200.00, 0,
        '30079000', 12, 6, 6, 1440.00, 12000.00, 13440.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i23);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i20,
        10, 0, 'MV2025A', '2027-06-30',
        280.00, 280.00, 240.00, 0,
        '82089000', 12, 6, 6, 288.00, 2400.00, 2688.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i20);

    -- ── B: Draft GRN  (Draft invoice + Draft GRN)  ────────────────────────────

    -- inv05  Biotech -- premium IOLs
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_biotech, v_store_id,
        'SEED-BIO-001', CURRENT_DATE,
        50000.00, 0.00, 50000.00, 3000.00, 3000.00, 6000.00,
        56000.00, 56000.00,
        'SEED/GRN/2025-26/000101', CURRENT_DATE,
        'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i16,
        5, 5, 'PA2025A', '2028-03-31',
        85000.00, 85000.00, 72000.00, 0,
        '90213100', 12, 6, 6, 43200.00, 360000.00, 403200.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i16);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i17,
        20, 20, 'AU2025A', '2027-06-30',
        500.00, 500.00, 420.00, 0,
        '90213100', 5, 2.5, 2.5, 420.00, 8400.00, 8820.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i17);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000101', CURRENT_DATE, 'Draft', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-001'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv06  Corneal Vision -- drugs draft GRN
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_corneal, v_ph_store_id,
        'SEED-CORN-001', CURRENT_DATE,
        7500.00, 0.00, 7500.00, 450.00, 450.00, 900.00,
        8400.00, 8400.00,
        'SEED/GRN/2025-26/000102', CURRENT_DATE,
        'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i07,
        20, 20, 'L2025A', '2027-06-30',
        350.00, 350.00, 290.00, 0,
        '30049099', 12, 6, 6, 696.00, 5800.00, 6496.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-CORN-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i07);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i09,
        10, 10, 'BR2025A', '2027-03-31',
        280.00, 280.00, 230.00, 0,
        '30049099', 12, 6, 6, 276.00, 2300.00, 2576.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-CORN-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i09);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000102', CURRENT_DATE, 'Draft', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-CORN-001'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv07  Royal Medical -- consumables draft GRN
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_royal, v_ot_store_id,
        'SEED-ROYAL-001', CURRENT_DATE,
        5500.00, 0.00, 5500.00, 330.00, 330.00, 660.00,
        6160.00, 6160.00,
        'SEED/GRN/2025-26/000103', CURRENT_DATE,
        'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i27,
        30, 30, 'DR2025A', '2027-12-31',
        220.00, 220.00, 185.00, 0,
        '63079090', 12, 6, 6, 666.00, 5550.00, 6216.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ROYAL-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i27);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i29,
        50, 50, 'SU2025A', '2027-09-30',
        130.00, 130.00, 110.00, 0,
        '30059090', 12, 6, 6, 660.00, 5500.00, 6160.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ROYAL-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i29);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000103', CURRENT_DATE, 'Draft', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ROYAL-001'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv08  Sree AV -- OVD + blades draft GRN
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_sreeav, v_ot_store_id,
        'SEED-SREEAV-001', CURRENT_DATE,
        9500.00, 500.00, 9500.00, 570.00, 570.00, 1140.00,
        10640.00, 10640.00,
        'SEED/GRN/2025-26/000104', CURRENT_DATE,
        'Bulk', 'Draft', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i24,
        10, 10, 'CO2025A', '2027-09-30',
        1100.00, 1100.00, 950.00, 0,
        '30079000', 12, 6, 6, 1140.00, 9500.00, 10640.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-SREEAV-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i24);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i21,
        20, 20, 'KE2025A', '2027-06-30',
        520.00, 520.00, 440.00, 0,
        '82089000', 12, 6, 6, 1056.00, 8800.00, 9856.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-SREEAV-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i21);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000104', CURRENT_DATE, 'Draft', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-SREEAV-001'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- ── C: Primary Approved  ──────────────────────────────────────────────────

    -- inv09  WIIZ Health -- premium IOLs
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_wiiz, v_store_id,
        'SEED-WIIZ-001', CURRENT_DATE,
        45000.00, 0.00, 45000.00, 2700.00, 2700.00, 5400.00,
        50400.00, 50400.00,
        'SEED/GRN/2025-26/000105', CURRENT_DATE,
        'Bulk', 'PrimaryApproved', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i15,
        3, 3, 'SY2025A', '2028-03-31',
        18000.00, 18000.00, 15000.00, 0,
        '90213100', 12, 6, 6, 5400.00, 45000.00, 50400.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-WIIZ-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i15);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i18,
        5, 5, 'HI2025A', '2027-12-31',
        3500.00, 3500.00, 2900.00, 0,
        '90213100', 12, 6, 6, 1740.00, 14500.00, 16240.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-WIIZ-001'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i18);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         inspected_at, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000105', CURRENT_DATE, 'PrimaryApproved',
        now(), now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-WIIZ-001'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- GRN items for SEED-WIIZ-001 (accepted = ordered quantity)
    INSERT INTO inv_grn_items
        (id, tenant_id, grn_header_id, purchase_item_id, item_id,
         accepted_quantity, rejected_quantity, is_verified, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, gh.id, pit.id, pit.item_id,
        pit.ordered_quantity, 0, true, now(), now(), 'active'
    FROM inv_grn_headers gh
    JOIN inv_purchase_invoices inv ON gh.invoice_id = inv.id
    JOIN inv_purchase_items pit ON pit.invoice_id = inv.id
    WHERE gh.tenant_id = v_tenant_id AND gh.grn_number = 'SEED/GRN/2025-26/000105'
      AND NOT EXISTS (SELECT 1 FROM inv_grn_items x WHERE x.grn_header_id = gh.id AND x.item_id = pit.item_id);

    -- inv10  Biotech -- drugs primary approved
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_biotech, v_ph_store_id,
        'SEED-BIO-002', CURRENT_DATE,
        9600.00, 0.00, 9600.00, 576.00, 576.00, 1152.00,
        10752.00, 10752.00,
        'SEED/GRN/2025-26/000106', CURRENT_DATE,
        'Bulk', 'PrimaryApproved', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i02,
        30, 30, 'TO2025A', '2027-06-30',
        110.00, 110.00, 92.00, 0,
        '30049099', 12, 6, 6, 331.20, 2760.00, 3091.20, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i02);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i08,
        30, 30, 'DO2025B', '2027-06-30',
        290.00, 290.00, 240.00, 0,
        '30049099', 12, 6, 6, 864.00, 7200.00, 8064.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i08);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i10,
        20, 20, 'KT2025A', '2027-03-31',
        180.00, 180.00, 150.00, 0,
        '30049099', 12, 6, 6, 360.00, 3000.00, 3360.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i10);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         inspected_at, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000106', CURRENT_DATE, 'PrimaryApproved',
        now(), now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-BIO-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- GRN items for SEED-BIO-002 (accepted = ordered quantity)
    INSERT INTO inv_grn_items
        (id, tenant_id, grn_header_id, purchase_item_id, item_id,
         accepted_quantity, rejected_quantity, is_verified, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, gh.id, pit.id, pit.item_id,
        pit.ordered_quantity, 0, true, now(), now(), 'active'
    FROM inv_grn_headers gh
    JOIN inv_purchase_invoices inv ON gh.invoice_id = inv.id
    JOIN inv_purchase_items pit ON pit.invoice_id = inv.id
    WHERE gh.tenant_id = v_tenant_id AND gh.grn_number = 'SEED/GRN/2025-26/000106'
      AND NOT EXISTS (SELECT 1 FROM inv_grn_items x WHERE x.grn_header_id = gh.id AND x.item_id = pit.item_id);

    -- inv11  Carl Zeiss -- bulk IOL primary approved
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_zeiss, v_store_id,
        'SEED-ZEISS-002', CURRENT_DATE,
        116000.00, 0.00, 116000.00, 6960.00, 6960.00, 13920.00,
        129920.00, 129920.00,
        'SEED/GRN/2025-26/000107', CURRENT_DATE,
        'Bulk', 'PrimaryApproved', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i13,
        20, 20, 'ZS2025C', '2028-06-30',
        6500.00, 6500.00, 5800.00, 0,
        '90213100', 12, 6, 6, 13920.00, 116000.00, 129920.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ZEISS-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i13);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         inspected_at, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000107', CURRENT_DATE, 'PrimaryApproved',
        now(), now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ZEISS-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- GRN items for SEED-ZEISS-002 (accepted = ordered quantity)
    INSERT INTO inv_grn_items
        (id, tenant_id, grn_header_id, purchase_item_id, item_id,
         accepted_quantity, rejected_quantity, is_verified, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, gh.id, pit.id, pit.item_id,
        pit.ordered_quantity, 0, true, now(), now(), 'active'
    FROM inv_grn_headers gh
    JOIN inv_purchase_invoices inv ON gh.invoice_id = inv.id
    JOIN inv_purchase_items pit ON pit.invoice_id = inv.id
    WHERE gh.tenant_id = v_tenant_id AND gh.grn_number = 'SEED/GRN/2025-26/000107'
      AND NOT EXISTS (SELECT 1 FROM inv_grn_items x WHERE x.grn_header_id = gh.id AND x.item_id = pit.item_id);

    -- ── D: Final Approved  ────────────────────────────────────────────────────

    -- inv12  Rudra Pharma -- drugs fully approved
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, paid_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_rudra, v_ph_store_id,
        'SEED-RUDRA-002', CURRENT_DATE,
        14730.00, 0.00, 14730.00, 883.80, 883.80, 1767.60,
        16497.60, 0.00, 16497.60,
        'SEED/GRN/2025-26/000108', CURRENT_DATE,
        'Bulk', 'Approved', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i01,
        100, 100, 'M2025B', '2027-09-30',
        100.00, 100.00, 82.00, 0,
        '30049099', 12, 6, 6, 984.00, 8200.00, 9184.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i01);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i04,
        50, 50, 'AT2025A', '2027-06-30',
        55.00, 55.00, 45.00, 0,
        '30049099', 12, 6, 6, 270.00, 2250.00, 2520.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i04);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i05,
        40, 40, 'CY2025A', '2027-06-30',
        75.00, 75.00, 62.00, 0,
        '30049099', 12, 6, 6, 297.60, 2480.00, 2777.60, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i05);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         inspected_at, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000108', CURRENT_DATE, 'Approved',
        now(), now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-RUDRA-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv13  Drug Mart -- consumables approved
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, paid_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_drugmart, v_ot_store_id,
        'SEED-DM-002', CURRENT_DATE,
        4080.00, 0.00, 4080.00, 244.80, 244.80, 489.60,
        4569.60, 4569.60, 0.00,
        'SEED/GRN/2025-26/000109', CURRENT_DATE,
        'Bulk', 'Approved', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i30,
        10, 10, 'SY2025B', '2028-03-31',
        50.00, 50.00, 40.00, 0,
        '90183100', 12, 6, 6, 48.00, 400.00, 448.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i30);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i33,
        10, 10, 'BE2025A', '2027-09-30',
        80.00, 80.00, 68.00, 0,
        '30049099', 12, 6, 6, 81.60, 680.00, 761.60, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i33);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         inspected_at, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000109', CURRENT_DATE, 'Approved',
        now(), now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv14  Ganga Pharma -- misc drugs approved (partial payment)
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, paid_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_ganga, v_ph_store_id,
        'SEED-GANGA-002', CURRENT_DATE,
        9600.00, 0.00, 9600.00, 576.00, 576.00, 1152.00,
        10752.00, 5376.00, 5376.00,
        'SEED/GRN/2025-26/000110', CURRENT_DATE,
        'Bulk', 'Approved', now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i35,
        10, 10, 'FL2025A', '2027-06-30',
        250.00, 250.00, 210.00, 0,
        '38220090', 12, 6, 6, 252.00, 2100.00, 2352.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i35);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i38,
        50, 50, 'AC2025A', '2027-06-30',
        180.00, 180.00, 150.00, 0,
        '30049099', 12, 6, 6, 900.00, 7500.00, 8400.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i38);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i39,
        10, 10, 'MN2025A', '2027-03-31',
        250.00, 250.00, 200.00, 0,
        '30049099', 5, 2.5, 2.5, 100.00, 2000.00, 2100.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i39);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         inspected_at, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000110', CURRENT_DATE, 'Approved',
        now(), now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- ── E: Cancelled invoices  (grn_status = Rejected  -- no Cancelled in CHECK)  ──

    -- inv15  Ganga Pharma -- cancelled
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, remarks,
         created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_ganga, v_ph_store_id,
        'SEED-GANGA-003', CURRENT_DATE,
        4560.00, 0.00, 4560.00, 273.60, 273.60, 547.20,
        5107.20, 5107.20,
        'SEED/GRN/2025-26/000111', CURRENT_DATE,
        'Bulk', 'Cancelled', 'Wrong items ordered -- cancelled',
        now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i37,
        20, 0, 'TR2025A', '2027-09-30',
        120.00, 120.00, 95.00, 0,
        '30049099', 12, 6, 6, 228.00, 1900.00, 2128.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-003'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i37);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i36,
        20, 0, 'TD2025A', '2027-06-30',
        160.00, 160.00, 130.00, 0,
        '30049099', 12, 6, 6, 312.00, 2600.00, 2912.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-003'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i36);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         remarks, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000111', CURRENT_DATE, 'Rejected',
        'Invoice cancelled -- GRN voided', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-GANGA-003'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv16  Royal Medical -- cancelled duplicate
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, remarks,
         created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_royal, v_ot_store_id,
        'SEED-ROYAL-002', CURRENT_DATE,
        2240.00, 0.00, 2240.00, 134.40, 134.40, 268.80,
        2508.80, 2508.80,
        'SEED/GRN/2025-26/000112', CURRENT_DATE,
        'Bulk', 'Cancelled', 'Duplicate order -- cancelled',
        now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i31,
        20, 0, 'CT2025A', '2028-12-31',
        75.00, 75.00, 56.00, 0,
        '30059090', 12, 6, 6, 134.40, 1120.00, 1254.40, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ROYAL-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i31);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i34,
        20, 0, 'EP2025A', '2027-12-31',
        65.00, 65.00, 56.00, 0,
        '30059090', 12, 6, 6, 134.40, 1120.00, 1254.40, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ROYAL-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i34);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         remarks, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000112', CURRENT_DATE, 'Rejected',
        'Invoice cancelled', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-ROYAL-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv17  Corneal Vision -- cancelled H1 drug (cold chain issue)
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, remarks,
         created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_corneal, v_ph_store_id,
        'SEED-CORN-002', CURRENT_DATE,
        11500.00, 0.00, 11500.00, 690.00, 690.00, 1380.00,
        12880.00, 12880.00,
        'SEED/GRN/2025-26/000113', CURRENT_DATE,
        'Bulk', 'Cancelled', 'Cold chain failure -- cancelled',
        now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i11,
        5, 0, 'VO2025A', '2027-06-30',
        2800.00, 2800.00, 2300.00, 0,
        '30049099', 12, 6, 6, 1380.00, 11500.00, 12880.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-CORN-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i11);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         remarks, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000113', CURRENT_DATE, 'Rejected',
        'Invoice cancelled', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-CORN-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- ── F: Rejected  ─────────────────────────────────────────────────────────

    -- inv18  Drug Mart -- quality rejection
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, remarks,
         created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_drugmart, v_ot_store_id,
        'SEED-DM-003', CURRENT_DATE,
        9720.00, 0.00, 9720.00, 583.20, 583.20, 1166.40,
        10886.40, 10886.40,
        'SEED/GRN/2025-26/000114', CURRENT_DATE,
        'Bulk', 'Rejected', 'Quality issues -- rejected at inspection',
        now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i28,
        10, 0, 'IA2025A', '2027-09-30',
        750.00, 750.00, 620.00, 0,
        '90189089', 12, 6, 6, 744.00, 6200.00, 6944.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-003'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i28);

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i25,
        10, 0, 'TB2025A', '2027-03-31',
        380.00, 380.00, 320.00, 0,
        '32041900', 12, 6, 6, 384.00, 3200.00, 3584.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-003'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i25);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         remarks, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000114', CURRENT_DATE, 'Rejected',
        'Quality rejection at inspection', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-DM-003'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    -- inv19  Sree AV -- expired batch rejected
    INSERT INTO inv_purchase_invoices
        (id, tenant_id, vendor_id, store_id, invoice_number, invoice_date,
         gross_amount, discount_amount, taxable_amount,
         cgst_amount, sgst_amount, total_gst,
         net_amount, balance_amount,
         grn_number, grn_date,
         billing_mode, approval_status, remarks,
         created_at, updated_at, status)
    VALUES (uuid_generate_v4(), v_tenant_id, v_sreeav, v_ph_store_id,
        'SEED-SREEAV-002', CURRENT_DATE,
        7800.00, 0.00, 7800.00, 468.00, 468.00, 936.00,
        8736.00, 8736.00,
        'SEED/GRN/2025-26/000115', CURRENT_DATE,
        'Bulk', 'Rejected', 'Expired batch -- full rejection',
        now(), now(), 'active')
    ON CONFLICT (tenant_id, invoice_number, vendor_id) DO NOTHING;

    INSERT INTO inv_purchase_items
        (id, tenant_id, invoice_id, item_id,
         ordered_quantity, received_quantity, batch_number, expiry_date,
         original_mrp, mrp, purchase_rate, discount_percent,
         hsn_code, gst_percent, cgst_percent, sgst_percent,
         gst_amount, taxable_amount, net_amount, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, i12,
        3, 0, 'AM2025A', '2026-03-31',
        3200.00, 3200.00, 2600.00, 0,
        '30049099', 12, 6, 6, 936.00, 7800.00, 8736.00, now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-SREEAV-002'
      AND NOT EXISTS (SELECT 1 FROM inv_purchase_items x WHERE x.invoice_id = pi.id AND x.item_id = i12);

    INSERT INTO inv_grn_headers
        (id, tenant_id, invoice_id, store_id, grn_number, grn_date, grn_status,
         remarks, created_at, updated_at, status)
    SELECT uuid_generate_v4(), v_tenant_id, pi.id, pi.store_id,
        'SEED/GRN/2025-26/000115', CURRENT_DATE, 'Rejected',
        'Expired stock -- full rejection', now(), now(), 'active'
    FROM inv_purchase_invoices pi
    WHERE pi.tenant_id = v_tenant_id AND pi.invoice_number = 'SEED-SREEAV-002'
    ON CONFLICT (tenant_id, grn_number) DO NOTHING;

    RAISE NOTICE 'Inventory seed complete: 39 items + 19 invoices + 15 GRNs for tenant %', v_tenant_id;

    -- ── Set purchase_category + payment_mode for all seeded invoices ─────────
    -- Pharmacy / Credit
    UPDATE inv_purchase_invoices
       SET purchase_category = 'Pharmacy', payment_mode = 'Credit', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-RUDRA-001','SEED-RUDRA-002',
                              'SEED-GANGA-001','SEED-GANGA-002',
                              'SEED-CORN-001','SEED-CORN-002');

    -- OT & Surgery / Credit
    UPDATE inv_purchase_invoices
       SET purchase_category = 'OT & Surgery', payment_mode = 'Credit', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-WIIZ-001','SEED-BIO-001','SEED-BIO-002');

    -- OT & Surgery / Cash
    UPDATE inv_purchase_invoices
       SET purchase_category = 'OT & Surgery', payment_mode = 'Cash', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-ROYAL-001','SEED-ROYAL-002');

    -- Consumables / Cash
    UPDATE inv_purchase_invoices
       SET purchase_category = 'Consumables', payment_mode = 'Cash', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-DM-001','SEED-DM-002','SEED-DM-003');

    -- Optical / Credit
    UPDATE inv_purchase_invoices
       SET purchase_category = 'Optical', payment_mode = 'Credit', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-ZEISS-001','SEED-ZEISS-002');

    -- Laboratory / Credit
    UPDATE inv_purchase_invoices
       SET purchase_category = 'Laboratory', payment_mode = 'Credit', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-GANGA-003');

    -- Equipment / Credit
    UPDATE inv_purchase_invoices
       SET purchase_category = 'Equipment', payment_mode = 'Credit', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-SREEAV-001');

    -- Stationery / Cash
    UPDATE inv_purchase_invoices
       SET purchase_category = 'Stationery', payment_mode = 'Cash', updated_at = now()
     WHERE tenant_id = v_tenant_id
       AND invoice_number IN ('SEED-SREEAV-002');
END;
$$;
