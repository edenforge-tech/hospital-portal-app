-- Migration 93: Pre-Op Section Expansion for Eye Hospital Workflow
-- Splits "Investigations" into "Lab Tests" + "Diagnostic Imaging"
-- Adds "Pharmacy Preparation" (STD_PHARMACY) section items
-- Adds "OT Preparation" (STD_INVENTORY) section items
-- Updates responsible_department_code for all 11 categories
-- Idempotent: safe to run multiple times

-- ─── Step 1: Split "Investigations" → "Lab Tests" (blood work) ──────────────
UPDATE pre_op_section_items
SET category = 'Lab Tests',
    responsible_department_code = 'STD_LABORATORY',
    updated_at = NOW()
WHERE tenant_id IS NULL
  AND category = 'Investigations'
  AND item_key IN (
      'blood_sugar_fbs',
      'blood_sugar_rbs',
      'bp_checked',
      'ecg_done',
      'hemoglobin',
      'pt_inr'
  );

-- ─── Step 2: "Investigations" remaining items → "Diagnostic Imaging" ────────
UPDATE pre_op_section_items
SET category = 'Diagnostic Imaging',
    responsible_department_code = 'STD_IMAGING',
    updated_at = NOW()
WHERE tenant_id IS NULL
  AND category = 'Investigations'
  AND item_key IN (
      'biometry_done',
      'oct_done',
      'fundus_done'
  );

-- If any "Investigations" rows remain (older seeds / custom items), move to Lab Tests
UPDATE pre_op_section_items
SET category = 'Lab Tests',
    responsible_department_code = 'STD_LABORATORY',
    updated_at = NOW()
WHERE tenant_id IS NULL
  AND category = 'Investigations';

-- ─── Step 3: Add "Pharmacy Preparation" items ────────────────────────────────
INSERT INTO pre_op_section_items (
    id, tenant_id, category, item_key, item_label, description,
    department_owner, responsible_department_code,
    is_mandatory, is_blocking, requires_document, patient_type_filter,
    surgery_type_filter, display_order, status, created_at, updated_at
) VALUES
(gen_random_uuid(), NULL, 'Pharmacy Preparation', 'dilation_drops_administered',
 'Dilation Drops Administered',
 'Mydriatic/cycloplegic drops administered as per surgeon protocol (Tropicamide, Phenylephrine, etc.).',
 'STD_PHARMACY', 'STD_PHARMACY', TRUE, TRUE, FALSE, NULL, NULL, 10,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'Pharmacy Preparation', 'antibiotic_drops_given',
 'Antibiotic Eye Drops Given',
 'Pre-operative antibiotic drops given (e.g. Ofloxacin/Moxifloxacin) as per protocol.',
 'STD_PHARMACY', 'STD_PHARMACY', TRUE, TRUE, FALSE, NULL, NULL, 20,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'Pharmacy Preparation', 'anaesthetic_drops_ready',
 'Anaesthetic / NSAID Drops Ready',
 'Topical anaesthetic drops and NSAID drops (if required) prepared and verified.',
 'STD_PHARMACY', 'STD_PHARMACY', TRUE, TRUE, FALSE, NULL, NULL, 30,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'Pharmacy Preparation', 'iv_access_established',
 'IV Access Established (if required)',
 'Peripheral IV cannula inserted and patency confirmed for GA / IV sedation cases.',
 'STD_PHARMACY', 'STD_PHARMACY', FALSE, FALSE, FALSE, NULL, NULL, 40,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'Pharmacy Preparation', 'medication_reconciliation',
 'Medication Reconciliation Completed',
 'All current medications reviewed; contraindicated drugs held; substitutions documented.',
 'STD_PHARMACY', 'STD_PHARMACY', TRUE, FALSE, FALSE, NULL, NULL, 50,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'Pharmacy Preparation', 'drug_allergy_reconfirmed',
 'Drug Allergy History Reconfirmed',
 'Known drug allergies verbally reconfirmed with patient before dispensing.',
 'STD_PHARMACY', 'STD_PHARMACY', TRUE, FALSE, FALSE, NULL, NULL, 60,
 'active', NOW(), NOW())
ON CONFLICT (item_key) DO NOTHING;

-- ─── Step 4: Add "OT Preparation" items ──────────────────────────────────────
INSERT INTO pre_op_section_items (
    id, tenant_id, category, item_key, item_label, description,
    department_owner, responsible_department_code,
    is_mandatory, is_blocking, requires_document, patient_type_filter,
    surgery_type_filter, display_order, status, created_at, updated_at
) VALUES
(gen_random_uuid(), NULL, 'OT Preparation', 'iol_power_confirmed',
 'IOL Power Confirmed',
 'IOL power calculation verified from biometry report and confirmed by surgeon.',
 'STD_INVENTORY', 'STD_INVENTORY', TRUE, TRUE, FALSE, NULL, NULL, 10,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'OT Preparation', 'iol_available_in_stock',
 'IOL Available in Stock',
 'Required IOL model and power confirmed available and reserved in inventory.',
 'STD_INVENTORY', 'STD_INVENTORY', TRUE, TRUE, FALSE, NULL, NULL, 20,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'OT Preparation', 'iol_barcode_verified',
 'IOL Barcode Scanned & Verified',
 'IOL barcode scanned and matched to patient record. Label retained in file.',
 'STD_INVENTORY', 'STD_INVENTORY', TRUE, TRUE, TRUE, NULL, NULL, 30,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'OT Preparation', 'instrument_pack_sterilized',
 'Instrument Pack Sterilized',
 'Phaco/MSICS/LASIK instrument pack sterilized and sterility indicator checked.',
 'STD_INVENTORY', 'STD_INVENTORY', TRUE, TRUE, FALSE, NULL, NULL, 40,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'OT Preparation', 'ot_slot_confirmed',
 'OT Slot Confirmed',
 'Patient allotted a specific OT room and slot time; OT schedule updated.',
 'STD_INVENTORY', 'STD_INVENTORY', TRUE, FALSE, FALSE, NULL, NULL, 50,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'OT Preparation', 'surgical_supplies_ready',
 'Surgical Supplies Ready',
 'Viscoelastic, BSS, sutures, drapes, and consumables checked and laid out.',
 'STD_INVENTORY', 'STD_INVENTORY', TRUE, FALSE, FALSE, NULL, NULL, 60,
 'active', NOW(), NOW())
ON CONFLICT (item_key) DO NOTHING;

-- ─── Step 5: Add "Diagnostic Imaging" items (corneal topo & extras) ──────────
INSERT INTO pre_op_section_items (
    id, tenant_id, category, item_key, item_label, description,
    department_owner, responsible_department_code,
    is_mandatory, is_blocking, requires_document, patient_type_filter,
    surgery_type_filter, display_order, status, created_at, updated_at
) VALUES
(gen_random_uuid(), NULL, 'Diagnostic Imaging', 'corneal_topography_done',
 'Corneal Topography Done',
 'Corneal curvature mapping for LASIK/PRK/toric IOL planning.',
 'STD_IMAGING', 'STD_IMAGING', FALSE, FALSE, FALSE, NULL, 'LASIK,Toric', 40,
 'active', NOW(), NOW()),

(gen_random_uuid(), NULL, 'Diagnostic Imaging', 'specular_microscopy_done',
 'Specular Microscopy Done',
 'Endothelial cell count checked, especially for compromised corneas.',
 'STD_IMAGING', 'STD_IMAGING', FALSE, FALSE, FALSE, NULL, NULL, 50,
 'active', NOW(), NOW())
ON CONFLICT (item_key) DO NOTHING;

-- ─── Step 6: Update responsible_department_code for all 11 categories ────────
UPDATE pre_op_section_items SET responsible_department_code = 'STD_NURSE'
WHERE tenant_id IS NULL AND LOWER(category) IN ('compliance', 'vitals');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_LABORATORY'
WHERE tenant_id IS NULL AND LOWER(category) IN ('lab tests', 'investigations');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_IMAGING'
WHERE tenant_id IS NULL AND LOWER(category) IN ('diagnostic imaging');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_DOCTOR'
WHERE tenant_id IS NULL AND LOWER(category) IN ('evaluation', 'anaesthesia');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_COUNSELOR'
WHERE tenant_id IS NULL AND LOWER(category) IN ('consent');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_PHARMACY'
WHERE tenant_id IS NULL AND LOWER(category) IN ('pharmacy preparation');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_BILLING'
WHERE tenant_id IS NULL AND LOWER(category) IN ('financial');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_INVENTORY'
WHERE tenant_id IS NULL AND LOWER(category) IN ('ot preparation');

UPDATE pre_op_section_items SET responsible_department_code = 'STD_ADMIN'
WHERE tenant_id IS NULL AND LOWER(category) IN ('documents');

-- ─── Step 7: Update display_order for newly renamed categories ───────────────
-- Assign clean display orders so sections appear in clinical workflow order
UPDATE pre_op_section_items SET display_order = display_order
WHERE tenant_id IS NULL; -- no-op; orders already set per item in INSERTs above

-- Recatalog any leftover items still labeled 'Investigations' as 'Lab Tests'
UPDATE pre_op_section_items
SET category = 'Lab Tests', responsible_department_code = 'STD_LABORATORY'
WHERE tenant_id IS NULL AND category = 'Investigations';

DO $$
BEGIN
    RAISE NOTICE 'Migration 93 complete: Investigations split into Lab Tests + Diagnostic Imaging; Pharmacy Preparation + OT Preparation sections added.';
END $$;
