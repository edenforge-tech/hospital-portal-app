-- ============================================================================
-- CLEAN SLATE FIX: Delete all duplicate/corrupted entries and re-insert
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e (India Eye Hospital Network)
-- Rules:
--   - ALL names use ASCII only (no em-dash, no rupee symbol in names)
--   - ALL cataract procedures: requires_iol = FALSE (IOL cost bundled in price)
--   - Names match the physical tariff sheet exactly
-- ============================================================================

-- Step 1: Wipe ALL Cataract entries for this tenant (including soft-deleted,
--         so the unique constraint on surgery_code won't block re-insert)
DELETE FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND surgery_category = 'Cataract';

-- Step 2: Wipe ALL Refractive entries (including soft-deleted)
DELETE FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND surgery_category = 'Refractive';

-- ============================================================================
-- CATARACT — clean names, requires_iol = FALSE (all-inclusive pricing)
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_iol_types, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES
('155fe198-6ae5-4a01-9254-ead5b427247e','Monofocal IOL - Indian (Supraphob/Premium)','CAT-MONO-IND','Cataract','Surgical',FALSE,35000,'Per Eye','Monofocal',30,FALSE,'Topical',35000,35000,1,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Monofocal IOL - Imported (Alcon SP/Sensor I)','CAT-MONO-IMP-40','Cataract','Surgical',FALSE,40000,'Per Eye','Monofocal',30,FALSE,'Topical',40000,40000,2,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Monofocal IOL - Imported (Alcon IQ/Tecnis/Clareon)','CAT-MONO-IMP-50','Cataract','Surgical',FALSE,50000,'Per Eye','Monofocal',30,FALSE,'Topical',50000,50000,3,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Monofocal IOL - Pre-Load Lens','CAT-MONO-PRELOAD','Cataract','Surgical',FALSE,55000,'Per Eye','Monofocal',30,FALSE,'Topical',55000,55000,4,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Eyhance IOL - 60cm Distance Lens','CAT-EDOF-EYHANCE','Cataract','Surgical',FALSE,60000,'Per Eye','EDOF',30,FALSE,'Topical',60000,60000,5,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Toric Monofocal IOL','CAT-TORIC-MONO','Cataract','Surgical',FALSE,70000,'Per Eye','Toric',30,FALSE,'Topical',70000,70000,6,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Multifocal IOL - Indian 33cm','CAT-MULTI-IND','Cataract','Surgical',FALSE,60000,'Per Eye','Multifocal',30,FALSE,'Topical',60000,60000,7,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Multifocal IOL - Imported Zeiss/J&J (33cm)','CAT-MULTI-IMP','Cataract','Surgical',FALSE,95000,'Per Eye','Multifocal',30,FALSE,'Topical',95000,95000,8,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Multifocal Toric IOL - Zeiss/J&J','CAT-MULTI-TORIC','Cataract','Surgical',FALSE,120000,'Per Eye','ToricMultifocal',30,FALSE,'Topical',120000,120000,9,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Trifocal IOL - Indian (33-60cm)','CAT-TRIFOCAL-IND','Cataract','Surgical',FALSE,70000,'Per Eye','Trifocal',30,FALSE,'Topical',70000,70000,10,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Trifocal IOL - Imported Zeiss/Alcon/J&J','CAT-TRIFOCAL-IMP','Cataract','Surgical',FALSE,120000,'Per Eye','Trifocal',30,FALSE,'Topical',120000,120000,11,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Trifocal Toric IOL - Zeiss/Alcon/J&J','CAT-TRIFOCAL-TORIC','Cataract','Surgical',FALSE,150000,'Per Eye','Trifocal',30,FALSE,'Topical',150000,150000,12,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','EDOF IOL - Imported Vivity/PureSee (40cm)','CAT-EDOF-IMP','Cataract','Surgical',FALSE,120000,'Per Eye','EDOF',30,FALSE,'Topical',120000,120000,13,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','EDOF Toric IOL - Vivity Toric/PureSee Toric','CAT-EDOF-TORIC','Cataract','Surgical',FALSE,150000,'Per Eye','EDOF',30,FALSE,'Topical',150000,150000,14,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','MSICS (Manual Small Incision Cataract Surgery)','CAT-MSICS','Cataract','Surgical',FALSE,35000,'Per Eye','Monofocal',35,FALSE,'Peribulbar',35000,35000,15,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','YAG Laser Capsulotomy','CAT-YAG-CAPS','Cataract','Laser',FALSE,2500,'Per Eye',NULL,10,FALSE,'Topical',2500,2500,16,TRUE,NOW(),NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, requires_iol = FALSE, default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- REFRACTIVE — clean ASCII names (no em-dash, no rupee in names)
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES
('155fe198-6ae5-4a01-9254-ead5b427247e','PRK - Standard','REF-PRK-STD','Refractive','Laser',FALSE,35000,'Both Eyes',30,FALSE,'Topical',35000,35000,401,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','PRK - Customized','REF-PRK-CUSTOM','Refractive','Laser',FALSE,65000,'Both Eyes',30,FALSE,'Topical',65000,65000,402,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','PRK - Contoura','REF-PRK-CONTOURA','Refractive','Laser',FALSE,95000,'Both Eyes',30,FALSE,'Topical',95000,95000,403,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','PRK - Wavelight Plus','REF-PRK-WVPLUS','Refractive','Laser',FALSE,150000,'Both Eyes',30,FALSE,'Topical',150000,150000,404,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Femto LASIK - Customized','REF-FEMTO-CUSTOM','Refractive','Laser',FALSE,100000,'Both Eyes',20,FALSE,'Topical',100000,100000,405,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Femto LASIK - Contoura','REF-FEMTO-CONTOURA','Refractive','Laser',FALSE,120000,'Both Eyes',20,FALSE,'Topical',120000,120000,406,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','Femto LASIK - Wavelight Plus','REF-FEMTO-WVPLUS','Refractive','Laser',FALSE,180000,'Both Eyes',20,FALSE,'Topical',180000,180000,407,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','SMILE Pro','REF-SMILE-PRO','Refractive','Laser',FALSE,160000,'Both Eyes',15,FALSE,'Topical',160000,160000,408,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','ICL - Non-Toric Indian','REF-ICL-NONTORIC-IND','Refractive','Surgical',FALSE,70000,'Per Eye',30,FALSE,'Topical',70000,70000,409,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','ICL - Non-Toric Imported','REF-ICL-NONTORIC-IMP','Refractive','Surgical',FALSE,90000,'Per Eye',30,FALSE,'Topical',90000,90000,410,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','ICL - Toric Indian','REF-ICL-TORIC-IND','Refractive','Surgical',FALSE,90000,'Per Eye',30,FALSE,'Topical',90000,90000,411,TRUE,NOW(),NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e','ICL - Toric Imported','REF-ICL-TORIC-IMP','Refractive','Surgical',FALSE,120000,'Per Eye',30,FALSE,'Topical',120000,120000,412,TRUE,NOW(),NOW())
ON CONFLICT (tenant_id, surgery_code) DO UPDATE SET surgery_name = EXCLUDED.surgery_name, requires_iol = FALSE, default_price = EXCLUDED.default_price, updated_at = NOW();

-- ============================================================================
-- Also fix any remaining corrupted names in other categories
-- Replace common corruption pattern: names with high-byte chars
-- Specifically: Vitrectomy entries that may have issues
-- ============================================================================

-- Fix Oculoplasty names that had rupee symbol
UPDATE surgery_types
SET surgery_name = 'DCR (Dacryocystorhinostomy)',
    updated_at = NOW()
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND surgery_code = 'OCULO-DCR' AND deleted_at IS NULL;

UPDATE surgery_types
SET surgery_name = 'DCT (Dacryocystostomy)',
    updated_at = NOW()
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND surgery_code = 'OCULO-DCT' AND deleted_at IS NULL;

UPDATE surgery_types
SET surgery_name = 'Ptosis Correction',
    updated_at = NOW()
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND surgery_code = 'OCULO-PTOSIS' AND deleted_at IS NULL;

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT surgery_category, COUNT(*) as count
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND deleted_at IS NULL AND is_active = TRUE
GROUP BY surgery_category ORDER BY surgery_category;

SELECT surgery_code, surgery_name, requires_iol, default_price
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND surgery_category = 'Cataract'
  AND deleted_at IS NULL AND is_active = TRUE
ORDER BY display_order;
