-- =====================================================
-- ENHANCE SURGERY TYPES TABLE
-- Purpose: Add pricing, metadata, and IOL requirement fields
-- Created: 2026-02-25
-- Dependencies: surgery_types table (from 50_master_data_tables.sql)
-- =====================================================

-- Add new columns to surgery_types table
ALTER TABLE surgery_types
ADD COLUMN IF NOT EXISTS default_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(20) DEFAULT 'Per Eye',
ADD COLUMN IF NOT EXISTS procedure_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS requires_iol BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS typical_iol_types VARCHAR(200), -- Comma-separated: "Monofocal,Multifocal,Toric"
ADD COLUMN IF NOT EXISTS anesthesia_type VARCHAR(50), -- "Local", "Topical", "General", "Regional"
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS pre_op_tests_required JSONB; -- Array of required test codes

-- Add comments
COMMENT ON COLUMN surgery_types.default_price IS 'Base price for surgery before branch-specific overrides';
COMMENT ON COLUMN surgery_types.unit_of_measure IS 'Per Eye, Both Eyes, Per Muscle, Per Procedure';
COMMENT ON COLUMN surgery_types.procedure_code IS 'Unique code for billing and reporting (e.g., CATARACT-PHACO-001)';
COMMENT ON COLUMN surgery_types.requires_iol IS 'TRUE if surgery requires IOL implantation (cataract, refractive)';
COMMENT ON COLUMN surgery_types.typical_iol_types IS 'Recommended IOL types for this surgery (comma-separated)';
COMMENT ON COLUMN surgery_types.pre_op_tests_required IS 'JSON array of mandatory pre-op test codes';

-- Update existing records with pricing and metadata
UPDATE surgery_types 
SET 
    requires_iol = TRUE,
    typical_iol_types = 'Monofocal,Multifocal,Trifocal,EDOF,Toric',
    anesthesia_type = 'Topical',
    unit_of_measure = 'Per Eye'
WHERE surgery_category IN ('Cataract', 'Refractive');

UPDATE surgery_types
SET unit_of_measure = 'Both Eyes'
WHERE surgery_category = 'Refractive' AND surgery_name LIKE '%LASIK%';

UPDATE surgery_types
SET unit_of_measure = 'Per Muscle'
WHERE surgery_category = 'Strabismus';

-- Create index for procedure_code lookups
CREATE INDEX IF NOT EXISTS idx_surgery_types_code ON surgery_types(procedure_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_surgery_types_active ON surgery_types(is_active, display_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_surgery_types_category ON surgery_types(surgery_category) WHERE is_active = TRUE;

-- Update display order by category for better UI sorting
UPDATE surgery_types SET display_order = 10 WHERE surgery_category = 'Cataract';
UPDATE surgery_types SET display_order = 20 WHERE surgery_category = 'Retina';
UPDATE surgery_types SET display_order = 30 WHERE surgery_category = 'Glaucoma';
UPDATE surgery_types SET display_order = 40 WHERE surgery_category = 'Oculoplasty';
UPDATE surgery_types SET display_order = 50 WHERE surgery_category = 'Strabismus';
UPDATE surgery_types SET display_order = 60 WHERE surgery_category = 'Cornea';
UPDATE surgery_types SET display_order = 70 WHERE surgery_category = 'Refractive';
