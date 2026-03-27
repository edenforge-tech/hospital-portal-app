-- ============================================================
-- VARIANT SUB-OPTIONS MIGRATION
-- Purpose : (1) Add sub_options TEXT[] column to service_variants
--           (2) Rename cataract variants to match Sai Jyothi source-of-truth
--               (removes "Phaco +" prefix; uses exact tariff display names)
--           (3) Populate sub_options for all variants that have selectable
--               internal brand / type branches (staff-only, not shown to patient)
--
-- Run AFTER: update_catalog_sai_jyothi.sql  (or on any existing DB)
-- Idempotent: safe to run more than once (IF NOT EXISTS / SET is idempotent)
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 1: Add column (safe if already present)
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE service_variants
    ADD COLUMN IF NOT EXISTS sub_options TEXT[] DEFAULT NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 2: Rename CATARACT variants (remove "Phaco +" prefix)
--         Source-of-truth names per Sai Jyothi tariff list screenshots
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE service_variants
    SET variant_name = 'Indian Monofocal Lens',
        sub_options  = ARRAY['Supraphob', 'Premium']
    WHERE variant_code = 'CAT-MONO-IND';

UPDATE service_variants
    SET variant_name = 'Imported Monofocal Lens',
        sub_options  = ARRAY['Alcon SP', 'Sensor 1']
    WHERE variant_code = 'CAT-MONO-ALCSP';

UPDATE service_variants
    SET variant_name = 'Imported Monofocal Lens',
        sub_options  = ARRAY['Alcon IQ', 'Tecnis', 'Clareon']
    WHERE variant_code = 'CAT-MONO-ALCIQ';

UPDATE service_variants
    SET variant_name = 'Pre-Load Monofocal Lens',
        sub_options  = ARRAY['CT Lucia', 'Tecnis']
    WHERE variant_code = 'CAT-MONO-PRELOAD';

UPDATE service_variants
    SET variant_name = 'Eye Hance 60cm-Distance (EDOF Mono)',
        sub_options  = NULL
    WHERE variant_code = 'CAT-EYEHANCE';

UPDATE service_variants
    SET variant_name = 'Toric Monofocal',
        sub_options  = NULL
    WHERE variant_code = 'CAT-TORIC-MONO';

-- SICS and Femto names are already correct; no rename needed.

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 3: Set sub_options for PREMIUM IOL packages that offer brand choices
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE service_variants SET sub_options = ARRAY['Zeiss', 'J&J']
    WHERE variant_code = 'PREM-MULTI-IMP';

UPDATE service_variants SET sub_options = ARRAY['Zeiss', 'J&J']
    WHERE variant_code = 'PREM-MULTI-TORIC';

UPDATE service_variants SET sub_options = ARRAY['Zeiss', 'Alcon', 'J&J']
    WHERE variant_code = 'PREM-TRIF-IMP';

UPDATE service_variants SET sub_options = ARRAY['Zeiss', 'Alcon', 'J&J']
    WHERE variant_code = 'PREM-TRIF-TORIC';

UPDATE service_variants SET sub_options = ARRAY['Vivity', 'PureSee']
    WHERE variant_code = 'PREM-EDOF';

UPDATE service_variants SET sub_options = ARRAY['Vivity Toric', 'PureSee Toric']
    WHERE variant_code = 'PREM-EDOF-TORIC';

COMMIT;
