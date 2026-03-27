-- =====================================================
-- BRANCH PRICING OVERRIDES TABLE
-- Purpose: Allow branch-specific pricing for IOLs, surgeries, tests, services
-- Created: 2026-02-25
-- Dependencies: tenant, branch, iol_catalog_master, surgery_types tables
-- =====================================================

-- Create Branch Pricing Overrides Table
CREATE TABLE IF NOT EXISTS branch_pricing_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID NOT NULL REFERENCES branch(id),
    
    -- Polymorphic link to different catalog items
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN 
        ('IOL', 'Surgery', 'DiagnosticTest', 'Service', 'Medication', 'Package')),
    item_id UUID NOT NULL, -- References iol_catalog_master.id, surgery_types.id, etc.
    
    -- Pricing override
    override_price DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2), -- For display purposes
    pricing_strategy VARCHAR(50) DEFAULT 'Fixed' CHECK (pricing_strategy IN 
        ('Fixed', 'PercentageDiscount', 'PercentageMarkup', 'CostPlus')),
    
    -- Validity period
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    -- Justification and approval
    reason VARCHAR(500),
    approved_by_user_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Standard columns
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'rejected'))
);

-- Composite unique index to prevent duplicate overrides
CREATE UNIQUE INDEX idx_branch_pricing_unique ON branch_pricing_overrides(
    branch_id, item_type, item_id, effective_from
) WHERE deleted_at IS NULL AND status = 'active';

-- Indexes for performance
CREATE INDEX idx_branch_pricing_tenant ON branch_pricing_overrides(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_branch_pricing_branch ON branch_pricing_overrides(branch_id) WHERE is_active = TRUE;
CREATE INDEX idx_branch_pricing_item ON branch_pricing_overrides(item_type, item_id) WHERE is_active = TRUE;
CREATE INDEX idx_branch_pricing_dates ON branch_pricing_overrides(effective_from, effective_to) WHERE is_active = TRUE;

-- Comments for documentation
COMMENT ON TABLE branch_pricing_overrides IS 'Branch-specific pricing overrides for IOLs, surgeries, tests, and services';
COMMENT ON COLUMN branch_pricing_overrides.item_type IS 'Type of item: IOL, Surgery, DiagnosticTest, Service, Medication, Package';
COMMENT ON COLUMN branch_pricing_overrides.item_id IS 'UUID of the item in the respective master table';
COMMENT ON COLUMN branch_pricing_overrides.override_price IS 'Branch-specific price that overrides the default_price';
COMMENT ON COLUMN branch_pricing_overrides.pricing_strategy IS 'How the override was calculated: Fixed, PercentageDiscount, PercentageMarkup, CostPlus';
COMMENT ON COLUMN branch_pricing_overrides.effective_from IS 'Date when this pricing becomes active';
COMMENT ON COLUMN branch_pricing_overrides.effective_to IS 'Date when this pricing expires (NULL = no expiry)';

-- Function to check if override is currently valid
CREATE OR REPLACE FUNCTION is_pricing_override_valid(
    p_branch_id UUID,
    p_item_type VARCHAR,
    p_item_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM branch_pricing_overrides
        WHERE branch_id = p_branch_id
        AND item_type = p_item_type
        AND item_id = p_item_id
        AND is_active = TRUE
        AND status = 'active'
        AND effective_from <= CURRENT_DATE
        AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
        AND deleted_at IS NULL
    ) INTO v_valid;
    
    RETURN v_valid;
END;
$$ LANGUAGE plpgsql;

-- Function to get effective price (with branch override if exists)
CREATE OR REPLACE FUNCTION get_effective_price(
    p_branch_id UUID,
    p_item_type VARCHAR,
    p_item_id UUID,
    p_default_price DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    v_override_price DECIMAL;
BEGIN
    -- Try to get branch-specific override
    SELECT override_price INTO v_override_price
    FROM branch_pricing_overrides
    WHERE branch_id = p_branch_id
    AND item_type = p_item_type
    AND item_id = p_item_id
    AND is_active = TRUE
    AND status = 'active'
    AND effective_from <= CURRENT_DATE
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    AND deleted_at IS NULL
    ORDER BY effective_from DESC
    LIMIT 1;
    
    -- Return override if exists, otherwise return default
    RETURN COALESCE(v_override_price, p_default_price);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire overrides
CREATE OR REPLACE FUNCTION expire_pricing_overrides()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.effective_to IS NOT NULL AND NEW.effective_to < CURRENT_DATE THEN
        NEW.status := 'expired';
        NEW.is_active := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expire_pricing_overrides
    BEFORE INSERT OR UPDATE ON branch_pricing_overrides
    FOR EACH ROW
    EXECUTE FUNCTION expire_pricing_overrides();

-- Row-Level Security (RLS) Policy
ALTER TABLE branch_pricing_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_branch_pricing ON branch_pricing_overrides
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON branch_pricing_overrides TO authenticated_user;
GRANT SELECT ON branch_pricing_overrides TO public_user;

-- Audit trigger
CREATE TRIGGER update_branch_pricing_updated_at
    BEFORE UPDATE ON branch_pricing_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
