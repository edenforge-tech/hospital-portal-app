-- Phase 2 Diagnostic & Imaging Services - Database Migration (CORRECTED)
-- Add biometry_records and iol_stock_adjustments tables
-- Note: iol_inventory_items already created

-- 1. Biometry Records Table (IOL calculations and measurements)
CREATE TABLE IF NOT EXISTS biometry_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    branch_id UUID,
    eye VARCHAR(10) NOT NULL, -- OD (Right) or OS (Left)
    
    -- Primary Measurements
    axial_length DECIMAL(10,3),
    k1 DECIMAL(10,3),
    k2 DECIMAL(10,3),
    k1_axis DECIMAL(10,3),
    acd DECIMAL(10,3), -- Anterior Chamber Depth
    
    -- Optional Measurements
    lens_thickness DECIMAL(10,3),
    white_to_white DECIMAL(10,3),
    snr DECIMAL(10,3), -- Signal to Noise Ratio
    
    -- Device Information
    device VARCHAR(100),
    device_model VARCHAR(100),
    
    -- IOL Calculation Results (stored as JSON)
    target_refraction DECIMAL(10,3),
    calculated_iol DECIMAL(10,3),
    selected_formula VARCHAR(50),
    iol_calculations TEXT, -- JSON array of calculation results
    
    -- Audit Fields
    examination_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    examiner_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Foreign Keys
    CONSTRAINT fk_biometry_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_biometry_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_biometry_branch FOREIGN KEY (branch_id) REFERENCES branch(id)
);

-- 2. IOL Stock Adjustments Table (Stock change tracking)
CREATE TABLE IF NOT EXISTS iol_stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    item_id UUID NOT NULL,
    
    -- Adjustment Details
    quantity INT NOT NULL, -- Positive for addition, negative for usage
    type VARCHAR(50) NOT NULL, -- ADDITION, USAGE, RETURN, DAMAGE, ADJUSTMENT
    reason TEXT,
    
    -- Surgery/Patient Link (for USAGE type)
    patient_id UUID,
    surgery_id UUID,
    
    -- Batch Information
    batch_number VARCHAR(50),
    expiry_date DATE,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_iol_adjustment_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_iol_adjustment_item FOREIGN KEY (item_id) REFERENCES iol_inventory_items(id),
    CONSTRAINT fk_iol_adjustment_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_biometry_tenant_patient ON biometry_records(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_biometry_examination_date ON biometry_records(examination_date);
CREATE INDEX IF NOT EXISTS idx_biometry_branch ON biometry_records(branch_id);

CREATE INDEX IF NOT EXISTS idx_iol_adjustments_tenant_item ON iol_stock_adjustments(tenant_id, item_id);
CREATE INDEX IF NOT EXISTS idx_iol_adjustments_created ON iol_stock_adjustments(created_at);
CREATE INDEX IF NOT EXISTS idx_iol_adjustments_patient ON iol_stock_adjustments(patient_id);

-- Comments
COMMENT ON TABLE biometry_records IS 'Stores biometry examination data and IOL power calculations using various formulas (SRK-T, Barrett, Holladay, Haigis, etc.)';
COMMENT ON TABLE iol_stock_adjustments IS 'Tracks all IOL stock changes (additions, usage, returns, damage) with audit trail';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Phase 2 diagnostic tables created successfully!';
END $$;
