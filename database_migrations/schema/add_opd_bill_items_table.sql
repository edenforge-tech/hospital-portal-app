-- =====================================================
-- Day 4: OPD Bill Items Table & Service Catalog
-- Date: January 31, 2026
-- Purpose: Itemized billing with service codes and prices
-- =====================================================

-- Service Catalog Table (Master data for billable services)
CREATE TABLE IF NOT EXISTS service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Service Details
    service_code VARCHAR(20) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_category VARCHAR(50) NOT NULL, -- 'consultation', 'investigation', 'procedure', 'medication', 'imaging', 'other'
    description TEXT,
    
    -- Pricing
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_taxable BOOLEAN NOT NULL DEFAULT false,
    
    -- Department/Specialty
    department_id UUID REFERENCES department(id),
    specialty VARCHAR(100),
    
    -- Availability
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    
    -- Standard Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT unique_service_code_per_tenant UNIQUE (tenant_id, service_code)
);

-- OPD Bill Items Table (Line items for each bill)
CREATE TABLE IF NOT EXISTS opd_bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Bill Reference
    opd_bill_id UUID NOT NULL REFERENCES opd_bills(id) ON DELETE CASCADE,
    
    -- Service Reference
    service_catalog_id UUID REFERENCES service_catalog(id),
    service_code VARCHAR(20) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_category VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Quantity & Pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL, -- quantity * unit_price
    
    -- Discount
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    discount_reason VARCHAR(200),
    
    -- Tax
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    
    -- Total
    total_amount NUMERIC(10,2) NOT NULL, -- subtotal - discount + tax
    
    -- Provider Information (who performed the service)
    performed_by_user_id UUID REFERENCES users(id),
    performed_at TIMESTAMPTZ,
    department_id UUID REFERENCES department(id),
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    
    -- Notes
    notes TEXT,
    
    -- Standard Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_service_catalog_tenant_id ON service_catalog(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog(service_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_catalog_department ON service_catalog(department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_catalog_active ON service_catalog(is_active) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_opd_bill_items_bill_id ON opd_bill_items(opd_bill_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_opd_bill_items_tenant_id ON opd_bill_items(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_opd_bill_items_service_catalog ON opd_bill_items(service_catalog_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_opd_bill_items_status ON opd_bill_items(status) WHERE deleted_at IS NULL;

-- Row Level Security (RLS) Policies
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE opd_bill_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS tenant_isolation ON service_catalog;
DROP POLICY IF EXISTS tenant_isolation ON opd_bill_items;

-- Service Catalog RLS
CREATE POLICY tenant_isolation ON service_catalog
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- OPD Bill Items RLS
CREATE POLICY tenant_isolation ON opd_bill_items
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Seed Standard OPD Services
INSERT INTO service_catalog (tenant_id, service_code, service_name, service_category, description, base_price, is_taxable, tax_percentage, is_active, created_by_user_id)
SELECT 
    t.id,
    'CONSULT_GEN',
    'General Consultation',
    'consultation',
    'General consultation with ophthalmologist',
    500.00,
    true,
    5.00,
    true,
    u.id
FROM tenant t
CROSS JOIN LATERAL (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM service_catalog 
    WHERE tenant_id = t.id AND service_code = 'CONSULT_GEN'
)
LIMIT 1;

INSERT INTO service_catalog (tenant_id, service_code, service_name, service_category, description, base_price, is_taxable, tax_percentage, is_active, created_by_user_id)
SELECT 
    t.id,
    'CONSULT_SPL',
    'Specialist Consultation',
    'consultation',
    'Consultation with specialist ophthalmologist',
    800.00,
    true,
    5.00,
    true,
    u.id
FROM tenant t
CROSS JOIN LATERAL (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM service_catalog 
    WHERE tenant_id = t.id AND service_code = 'CONSULT_SPL'
)
LIMIT 1;

INSERT INTO service_catalog (tenant_id, service_code, service_name, service_category, description, base_price, is_taxable, tax_percentage, is_active, created_by_user_id)
SELECT 
    t.id,
    'TEST_VA',
    'Visual Acuity Test',
    'investigation',
    'Comprehensive visual acuity assessment',
    200.00,
    true,
    5.00,
    true,
    u.id
FROM tenant t
CROSS JOIN LATERAL (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM service_catalog 
    WHERE tenant_id = t.id AND service_code = 'TEST_VA'
)
LIMIT 1;

INSERT INTO service_catalog (tenant_id, service_code, service_name, service_category, description, base_price, is_taxable, tax_percentage, is_active, created_by_user_id)
SELECT 
    t.id,
    'TEST_OCT',
    'OCT Scan',
    'imaging',
    'Optical Coherence Tomography',
    1500.00,
    true,
    5.00,
    true,
    u.id
FROM tenant t
CROSS JOIN LATERAL (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM service_catalog 
    WHERE tenant_id = t.id AND service_code = 'TEST_OCT'
)
LIMIT 1;

INSERT INTO service_catalog (tenant_id, service_code, service_name, service_category, description, base_price, is_taxable, tax_percentage, is_active, created_by_user_id)
SELECT 
    t.id,
    'TEST_FUNDUS',
    'Fundus Photography',
    'imaging',
    'Retinal fundus imaging',
    800.00,
    true,
    5.00,
    true,
    u.id
FROM tenant t
CROSS JOIN LATERAL (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM service_catalog 
    WHERE tenant_id = t.id AND service_code = 'TEST_FUNDUS'
)
LIMIT 1;

INSERT INTO service_catalog (tenant_id, service_code, service_name, service_category, description, base_price, is_taxable, tax_percentage, is_active, created_by_user_id)
SELECT 
    t.id,
    'TEST_IOP',
    'IOP Measurement',
    'investigation',
    'Intraocular pressure measurement',
    300.00,
    true,
    5.00,
    true,
    u.id
FROM tenant t
CROSS JOIN LATERAL (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM service_catalog 
    WHERE tenant_id = t.id AND service_code = 'TEST_IOP'
)
LIMIT 1;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON service_catalog TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON opd_bill_items TO PUBLIC;

-- Comments
COMMENT ON TABLE service_catalog IS 'Master catalog of billable services with pricing';
COMMENT ON TABLE opd_bill_items IS 'Line items for OPD bills - normalized itemized billing';
COMMENT ON COLUMN service_catalog.service_code IS 'Unique code for the service (e.g., CONSULT_GEN, TEST_OCT)';
COMMENT ON COLUMN service_catalog.base_price IS 'Base price before tax and discounts';
COMMENT ON COLUMN opd_bill_items.total_amount IS 'Final amount: (quantity * unit_price) - discount + tax';
