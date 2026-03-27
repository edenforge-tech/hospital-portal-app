-- =====================================================
-- IOL CATALOG MASTER TABLE
-- Purpose: Comprehensive catalog of Intraocular Lenses (IOLs)
-- Created: 2026-02-25
-- Dependencies: tenant, users, branch tables
-- =====================================================

-- Create IOL Catalog Master Table
CREATE TABLE IF NOT EXISTS iol_catalog_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    
    -- IOL Identification
    model_name VARCHAR(200) NOT NULL, -- "Alcon SP", "Tecnis Eyhance"
    brand_manufacturer VARCHAR(100) NOT NULL, -- "Alcon", "J&J", "Zeiss", "Bausch+Lomb"
    iol_type VARCHAR(50) NOT NULL CHECK (iol_type IN 
        ('Monofocal', 'Multifocal', 'Trifocal', 'EDOF', 'Toric', 'ToricMultifocal', 'ICL')),
    origin VARCHAR(20) CHECK (origin IN ('Indian', 'Imported')),
    lens_category VARCHAR(50) CHECK (lens_category IN ('Standard', 'Premium', 'Deluxe')),
    
    -- Technical Specifications
    material VARCHAR(100), -- "Hydrophobic Acrylic", "Hydrophilic Acrylic", "Silicone", "PMMA"
    power_range_min DECIMAL(5,2), -- e.g., -10.00
    power_range_max DECIMAL(5,2), -- e.g., +35.00
    power_increment DECIMAL(3,2) DEFAULT 0.50, -- Supports 0.25D, 0.50D increments
    distance_range VARCHAR(50), -- "33cm-Distance", "40cm-Distance", "60cm-Distance"
    a_constant DECIMAL(5,2), -- For IOL power calculation formulas
    
    -- Pricing (Hybrid Model - Default + Branch Override)
    default_price DECIMAL(12,2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'INR',
    unit_of_measure VARCHAR(20) DEFAULT 'Per Eye',
    
    -- Metadata
    description TEXT,
    product_code VARCHAR(50) UNIQUE,
    manufacturer_part_number VARCHAR(100),
    regulatory_approval VARCHAR(200), -- FDA, CE Mark, CDSCO
    shelf_life_months INTEGER,
    
    -- Display & Ordering
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Standard audit columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued'))
);

-- Indexes for performance
CREATE INDEX idx_iol_catalog_tenant ON iol_catalog_master(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_iol_catalog_type ON iol_catalog_master(iol_type, origin) WHERE is_active = TRUE;
CREATE INDEX idx_iol_catalog_active ON iol_catalog_master(is_active, display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_iol_catalog_product_code ON iol_catalog_master(product_code) WHERE deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE iol_catalog_master IS 'Master catalog of Intraocular Lenses (IOLs) with pricing and specifications';
COMMENT ON COLUMN iol_catalog_master.model_name IS 'Commercial name of the IOL (e.g., Alcon SP, Tecnis Eyhance)';
COMMENT ON COLUMN iol_catalog_master.iol_type IS 'Type of IOL: Monofocal, Multifocal, Trifocal, EDOF, Toric, ToricMultifocal, ICL';
COMMENT ON COLUMN iol_catalog_master.power_increment IS 'Smallest power increment available (0.25D or 0.50D)';
COMMENT ON COLUMN iol_catalog_master.default_price IS 'Base price per lens before branch-specific overrides';
COMMENT ON COLUMN iol_catalog_master.a_constant IS 'A-constant for IOL power calculation (SRK/T, Haigis formulas)';

-- Link existing iol_inventory_items table to catalog (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'iol_inventory_items') THEN
        -- Add catalog_id foreign key to inventory items
        ALTER TABLE iol_inventory_items 
        ADD COLUMN IF NOT EXISTS catalog_id UUID REFERENCES iol_catalog_master(id);
        
        CREATE INDEX IF NOT EXISTS idx_iol_inventory_catalog ON iol_inventory_items(catalog_id);
        
        COMMENT ON COLUMN iol_inventory_items.catalog_id IS 'Link to IOL catalog master for specifications and pricing';
    END IF;
END $$;

-- Row-Level Security (RLS) Policy
ALTER TABLE iol_catalog_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_iol_catalog ON iol_catalog_master
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON iol_catalog_master TO authenticated_user;
GRANT SELECT ON iol_catalog_master TO public_user;

-- Audit trigger
CREATE TRIGGER update_iol_catalog_updated_at
    BEFORE UPDATE ON iol_catalog_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
