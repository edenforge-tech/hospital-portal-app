-- ============================================================================
-- COMPLETE TARIFF SEED — India Eye Hospital Network
-- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
-- Total: 64 procedures across 9 categories
-- Rules: ASCII-only names, requires_iol=FALSE for all, all soft-delete safe
-- Verified: No FK references to surgery_types from any other table
-- ============================================================================

BEGIN;

DELETE FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- ============================================================================
-- DIAGNOSTIC (17 procedures)  display_order: 1-17
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Consultation Charges',      'DIAG-CONSULT',       'Diagnostic', 'Consultation', FALSE,  500,  'Per Visit',   10, FALSE, NULL,      500,   500,   1, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'A-Scan',                    'DIAG-ASCAN',         'Diagnostic', 'Diagnostic',   FALSE, 1500, 'Per Eye',     10, FALSE, NULL,      1500,  1500,  2, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'B-Scan',                    'DIAG-BSCAN',         'Diagnostic', 'Diagnostic',   FALSE, 1000, 'Per Eye',     10, FALSE, NULL,      1000,  1000,  3, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Fundus Photo',              'DIAG-FUNDUS',        'Diagnostic', 'Diagnostic',   FALSE,  500, 'Per Eye',      5, FALSE, NULL,       500,   500,  4, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'OCT',                       'DIAG-OCT',           'Diagnostic', 'Diagnostic',   FALSE, 1500, 'Per Eye',     15, FALSE, NULL,      1500,  1500,  5, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'OCT Macula',                'DIAG-OCT-MAC',       'Diagnostic', 'Diagnostic',   FALSE, 1500, 'Per Eye',     15, FALSE, NULL,      1500,  1500,  6, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'CCT',                       'DIAG-CCT',           'Diagnostic', 'Diagnostic',   FALSE,  500, 'Per Eye',      5, FALSE, NULL,       500,   500,  7, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'OCT RNFL',                  'DIAG-OCT-RNFL',      'Diagnostic', 'Diagnostic',   FALSE, 1500, 'Per Eye',     15, FALSE, NULL,      1500,  1500,  8, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'AS OCT',                    'DIAG-ASOCT',         'Diagnostic', 'Diagnostic',   FALSE, 1500, 'Per Eye',     15, FALSE, NULL,      1500,  1500,  9, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Barrage Laser',             'DIAG-BARRAGE',       'Diagnostic', 'Laser',        FALSE, 5000, 'Per Eye',     20, FALSE, 'Topical', 5000,  5000, 10, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'PRP Laser',                 'DIAG-PRP',           'Diagnostic', 'Laser',        FALSE, 3500, 'Per Eye',     30, FALSE, 'Topical', 3500,  3500, 11, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'YAG Capsulotomy',           'DIAG-YAG-CAPS',      'Diagnostic', 'Laser',        FALSE, 2500, 'Per Eye',     10, FALSE, 'Topical', 2500,  2500, 12, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'YAG PI',                    'DIAG-YAG-PI',        'Diagnostic', 'Laser',        FALSE, 3000, 'Per Eye',     10, FALSE, 'Topical', 3000,  3000, 13, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Chalazion Excision',        'DIAG-CHALAZION',     'Diagnostic', 'Minor Surgical',FALSE,5000, 'Per Eye',     20, FALSE, 'Topical', 5000,  5000, 14, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'BCL (Bandage Contact Lens)','DIAG-BCL',           'Diagnostic', 'Diagnostic',   FALSE,  500, 'Per Eye',      5, FALSE, NULL,       500,   500, 15, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'HVF Fields',                'DIAG-HVF',           'Diagnostic', 'Diagnostic',   FALSE, 1000, 'Per Eye',     20, FALSE, NULL,      1000,  1000, 16, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Surgical Profile',          'DIAG-SURG-PROFILE',  'Diagnostic', 'Diagnostic',   FALSE, 1950, 'Per Profile', 10, FALSE, NULL,      1950,  1950, 17, TRUE, NOW(), NOW());

-- ============================================================================
-- REFRACTIVE (14 procedures)  display_order: 101-114
-- LASIK + ICL + Keratoconus C3R
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

-- LASIK
('155fe198-6ae5-4a01-9254-ead5b427247e', 'PRK + Standard',               'REF-PRK-STD',         'Refractive', 'Laser',    FALSE,  35000, 'Both Eyes', 30, FALSE, 'Topical',  35000,  35000, 101, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'PRK + Customized',             'REF-PRK-CUSTOM',      'Refractive', 'Laser',    FALSE,  65000, 'Both Eyes', 30, FALSE, 'Topical',  65000,  65000, 102, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'PRK + Contoura',               'REF-PRK-CONTOURA',    'Refractive', 'Laser',    FALSE,  95000, 'Both Eyes', 30, FALSE, 'Topical',  95000,  95000, 103, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'PRK + Wavelight Plus',         'REF-PRK-WVPLUS',      'Refractive', 'Laser',    FALSE, 150000, 'Both Eyes', 30, FALSE, 'Topical', 150000, 150000, 104, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Femto Lasik + Customized',     'REF-FEMTO-CUSTOM',    'Refractive', 'Laser',    FALSE, 100000, 'Both Eyes', 20, FALSE, 'Topical', 100000, 100000, 105, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Femto Lasik + Contoura',       'REF-FEMTO-CONTOURA',  'Refractive', 'Laser',    FALSE, 120000, 'Both Eyes', 20, FALSE, 'Topical', 120000, 120000, 106, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Femto Lasik + Wavelight Plus', 'REF-FEMTO-WVPLUS',    'Refractive', 'Laser',    FALSE, 180000, 'Both Eyes', 20, FALSE, 'Topical', 180000, 180000, 107, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Smile Pro',                    'REF-SMILE-PRO',       'Refractive', 'Laser',    FALSE, 160000, 'Both Eyes', 15, FALSE, 'Topical', 160000, 160000, 108, TRUE, NOW(), NOW()),

-- ICL Non-Toric
('155fe198-6ae5-4a01-9254-ead5b427247e', 'ICL Non-Toric - Indian',       'REF-ICL-NT-IND',      'Refractive', 'Surgical', FALSE,  70000, 'Per Eye',   30, FALSE, 'Topical',  70000,  70000, 109, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'ICL Non-Toric - Imported',     'REF-ICL-NT-IMP',      'Refractive', 'Surgical', FALSE,  90000, 'Per Eye',   30, FALSE, 'Topical',  90000,  90000, 110, TRUE, NOW(), NOW()),

-- ICL Toric
('155fe198-6ae5-4a01-9254-ead5b427247e', 'ICL Toric - Indian',           'REF-ICL-T-IND',       'Refractive', 'Surgical', FALSE,  90000, 'Per Eye',   30, FALSE, 'Topical',  90000,  90000, 111, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'ICL Toric - Imported',         'REF-ICL-T-IMP',       'Refractive', 'Surgical', FALSE, 120000, 'Per Eye',   30, FALSE, 'Topical', 120000, 120000, 112, TRUE, NOW(), NOW()),

-- Keratoconus C3R
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Keratoconus C3R - Isotonic',   'REF-C3R-ISO',         'Refractive', 'Surgical', FALSE,  45000, 'Per Eye',   60, FALSE, 'Topical',  45000,  45000, 113, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Keratoconus C3R - Hypotonic',  'REF-C3R-HYPO',        'Refractive', 'Surgical', FALSE,  55000, 'Per Eye',   60, FALSE, 'Topical',  55000,  55000, 114, TRUE, NOW(), NOW());

-- ============================================================================
-- CATARACT (14 procedures)  display_order: 201-214
-- All requires_iol=FALSE (IOL cost is bundled in the procedure price)
-- Groups: Basic Monofocal (6), Multifocal (3), Trifocal (3), EDOF (2)
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, typical_iol_types, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

-- Basic / Monofocal
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Monofocal - Indian Lens',                  'CAT-MONO-IND',       'Cataract', 'Surgical', FALSE, 'Monofocal',         35000, 'Per Eye', 30, FALSE, 'Topical', 35000,  35000, 201, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Monofocal - Imported Lens',                'CAT-MONO-IMP',       'Cataract', 'Surgical', FALSE, 'Monofocal',         40000, 'Per Eye', 30, FALSE, 'Topical', 40000,  40000, 202, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Premium Lens',                             'CAT-PREMIUM',        'Cataract', 'Surgical', FALSE, 'Monofocal',         50000, 'Per Eye', 30, FALSE, 'Topical', 50000,  50000, 203, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Pre-Load Lens',                            'CAT-PRELOAD',        'Cataract', 'Surgical', FALSE, 'Monofocal',         55000, 'Per Eye', 30, FALSE, 'Topical', 55000,  55000, 204, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Eyhance - 60cm Distance',                 'CAT-EYHANCE',        'Cataract', 'Surgical', FALSE, 'EDOF',              60000, 'Per Eye', 30, FALSE, 'Topical', 60000,  60000, 205, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Toric Lens',                              'CAT-TORIC',          'Cataract', 'Surgical', FALSE, 'Toric',             70000, 'Per Eye', 30, FALSE, 'Topical', 70000,  70000, 206, TRUE, NOW(), NOW()),

-- Multifocal
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Multifocal - Indian (33cm)',               'CAT-MULTI-IND',      'Cataract', 'Surgical', FALSE, 'Multifocal',        60000, 'Per Eye', 30, FALSE, 'Topical', 60000,  60000, 207, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Multifocal - Imported Zeiss/J&J (33cm)',   'CAT-MULTI-IMP',      'Cataract', 'Surgical', FALSE, 'Multifocal',        95000, 'Per Eye', 30, FALSE, 'Topical', 95000,  95000, 208, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Multifocal Toric - Zeiss/J&J',            'CAT-MULTI-TORIC',    'Cataract', 'Surgical', FALSE, 'ToricMultifocal',  120000, 'Per Eye', 30, FALSE, 'Topical',120000, 120000, 209, TRUE, NOW(), NOW()),

-- Trifocal
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Trifocal - Indian (33-60cm)',              'CAT-TRIFOCAL-IND',   'Cataract', 'Surgical', FALSE, 'Trifocal',          70000, 'Per Eye', 30, FALSE, 'Topical', 70000,  70000, 210, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Trifocal - Imported Zeiss/Alcon/J&J',     'CAT-TRIFOCAL-IMP',   'Cataract', 'Surgical', FALSE, 'Trifocal',         120000, 'Per Eye', 30, FALSE, 'Topical',120000, 120000, 211, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Trifocal Toric - Zeiss/Alcon/J&J',        'CAT-TRIFOCAL-TORIC', 'Cataract', 'Surgical', FALSE, 'Trifocal',         150000, 'Per Eye', 30, FALSE, 'Topical',150000, 150000, 212, TRUE, NOW(), NOW()),

-- EDOF
('155fe198-6ae5-4a01-9254-ead5b427247e', 'EDOF - Imported Vivity/PureSee (40cm)',    'CAT-EDOF-IMP',       'Cataract', 'Surgical', FALSE, 'EDOF',             120000, 'Per Eye', 30, FALSE, 'Topical',120000, 120000, 213, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'EDOF Toric - Vivity Toric/PureSee Toric', 'CAT-EDOF-TORIC',     'Cataract', 'Surgical', FALSE, 'EDOF',             150000, 'Per Eye', 30, FALSE, 'Topical',150000, 150000, 214, TRUE, NOW(), NOW());

-- ============================================================================
-- RETINA (9 procedures)  display_order: 301-309
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Vitrectomy 20g (With Suture)',             'RET-VIT-20G',        'Retina', 'Surgical',  FALSE,  65000, 'Per Eye', 60,  FALSE, 'Peribulbar',  65000,  65000, 301, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Vitrectomy 23g (Sutureless)',              'RET-VIT-23G',        'Retina', 'Surgical',  FALSE,  85000, 'Per Eye', 75,  FALSE, 'Peribulbar',  85000,  85000, 302, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Vitrectomy 25g (Sutureless + Disposable)', 'RET-VIT-25G',        'Retina', 'Surgical',  FALSE, 120000, 'Per Eye', 90,  FALSE, 'Peribulbar', 120000, 120000, 303, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IVT - IVTA (Triamcinolone)',               'RET-IVT-IVTA',       'Retina', 'Injection', FALSE,  10000, 'Per Eye', 15,  FALSE, 'Topical',    10000,  10000, 304, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IVT - Razumab (Anti-VEGF)',                'RET-IVT-RAZUMAB',    'Retina', 'Injection', FALSE,  25000, 'Per Eye', 15,  FALSE, 'Topical',    25000,  25000, 305, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IVT - Accentrix (Anti-VEGF)',              'RET-IVT-ACCENTRIX',  'Retina', 'Injection', FALSE,  35000, 'Per Eye', 15,  FALSE, 'Topical',    35000,  35000, 306, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IVT - Paganex',                            'RET-IVT-PAGANEX',    'Retina', 'Injection', FALSE,  45000, 'Per Eye', 15,  FALSE, 'Topical',    45000,  45000, 307, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IVT - Ozurdex (Dexamethasone)',            'RET-IVT-OZURDEX',    'Retina', 'Injection', FALSE,  45000, 'Per Eye', 15,  FALSE, 'Topical',    45000,  45000, 308, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'IVT - Eylea (Aflibercept)',                'RET-IVT-EYLEA',      'Retina', 'Injection', FALSE,  75000, 'Per Eye', 15,  FALSE, 'Topical',    75000,  75000, 309, TRUE, NOW(), NOW());

-- ============================================================================
-- GLAUCOMA (1 procedure)  display_order: 401
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Trabeculectomy with MMC', 'GLAU-TRAB-MMC', 'Glaucoma', 'Surgical', FALSE, 40000, 'Per Eye', 60, FALSE, 'Peribulbar', 40000, 40000, 401, TRUE, NOW(), NOW());

-- ============================================================================
-- OCULOPLASTY (3 procedures)  display_order: 501-503
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'DCR (Dacryocystorhinostomy)', 'OCULO-DCR',    'Oculoplasty', 'Surgical', FALSE, 50000, 'Per Eye', 90, FALSE, 'Local', 50000, 50000, 501, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'DCT (Dacryocystostomy)',      'OCULO-DCT',    'Oculoplasty', 'Surgical', FALSE, 35000, 'Per Eye', 60, FALSE, 'Local', 35000, 35000, 502, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Ptosis Correction',           'OCULO-PTOSIS', 'Oculoplasty', 'Surgical', FALSE, 35000, 'Per Eye', 60, FALSE, 'Local', 35000, 35000, 503, TRUE, NOW(), NOW());

-- ============================================================================
-- STRABISMUS (1 procedure)  display_order: 601
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Squint Surgery (Per Muscle)', 'SQUINT-PER-MUSCLE', 'Strabismus', 'Surgical', FALSE, 30000, 'Per Eye', 45, FALSE, 'General', 30000, 30000, 601, TRUE, NOW(), NOW());

-- ============================================================================
-- CORNEA (4 procedures)  display_order: 701-704
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'Corneal Tattooing',              'CORNEA-TATTOO',        'Cornea', 'Surgical', FALSE,  45000, 'Per Eye', 30,  FALSE, 'Topical',    45000,  45000, 701, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Penetrating Keratoplasty (PK)',  'CORNEA-PK',            'Cornea', 'Surgical', FALSE,  80000, 'Per Eye', 90,  FALSE, 'Peribulbar', 80000,  80000, 702, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Pterygium Excision',             'CORNEA-PTERYGIUM',     'Cornea', 'Surgical', FALSE,  20000, 'Per Eye', 30,  FALSE, 'Topical',    20000,  20000, 703, TRUE, NOW(), NOW()),
('155fe198-6ae5-4a01-9254-ead5b427247e', 'Pterygium Excision with CAG',    'CORNEA-PTERYGIUM-CAG', 'Cornea', 'Surgical', FALSE,  30000, 'Per Eye', 45,  FALSE, 'Topical',    30000,  30000, 704, TRUE, NOW(), NOW());

-- ============================================================================
-- GENERAL (1 procedure)  display_order: 801
-- ============================================================================

INSERT INTO surgery_types (tenant_id, surgery_name, surgery_code, surgery_category, procedure_type, requires_iol, default_price, unit_of_measure, typical_duration_minutes, requires_admission, anesthesia_type, estimated_cost_min, estimated_cost_max, display_order, is_active, created_at, updated_at) VALUES

('155fe198-6ae5-4a01-9254-ead5b427247e', 'General Anaesthesia (Extra for any procedure)', 'GEN-ANAESTHESIA', 'General', 'Anaesthesia', FALSE, 10000, 'Per Procedure', 0, FALSE, 'General', 10000, 10000, 801, TRUE, NOW(), NOW());

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT surgery_category, COUNT(*) AS count
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND deleted_at IS NULL
GROUP BY surgery_category
ORDER BY MIN(display_order);

COMMIT;
