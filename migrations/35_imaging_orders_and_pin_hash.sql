-- Migration: Add imaging_orders table for Phase 5 (Imaging Orders)
-- Date: February 20, 2026
-- Description: Creates imaging_orders table to support generic imaging workflow for all modalities

-- Create imaging_orders table
CREATE TABLE IF NOT EXISTS imaging_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    examination_id UUID REFERENCES clinical_examination(id) ON DELETE SET NULL,
    
    -- Order details
    imaging_type VARCHAR(100) NOT NULL, -- OCT Macula, Visual Field, FFA, Fundus Photography, etc.
    laterality VARCHAR(20), -- 'Right', 'Left', 'Both'
    urgency VARCHAR(20) NOT NULL DEFAULT 'Routine', -- 'Routine', 'Urgent', 'STAT'
    clinical_indication VARCHAR(1000),
    
    -- Status tracking
    ordering_doctor_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'In-Progress', 'Completed', 'Reviewed', 'Cancelled'
    ordered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_user_id UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    result_summary TEXT,
    dicom_study_id VARCHAR(64),
    image_storage_path VARCHAR(500),
    notes TEXT,
    
    -- Standard audit columns (HIPAA compliant)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    
    -- Constraints
    CONSTRAINT chk_imaging_laterality CHECK (laterality IN ('Right', 'Left', 'Both')),
    CONSTRAINT chk_imaging_urgency CHECK (urgency IN ('Routine', 'Urgent', 'STAT')),
    CONSTRAINT chk_imaging_status CHECK (status IN ('Pending', 'In-Progress', 'Completed', 'Reviewed', 'Cancelled'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imaging_orders_patient_id ON imaging_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_examination_id ON imaging_orders(examination_id);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_tenant_id ON imaging_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_status ON imaging_orders(status);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_ordered_at ON imaging_orders(ordered_at DESC);

-- Enable Row-Level Security for multi-tenancy
ALTER TABLE imaging_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_imaging_orders ON imaging_orders
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions (only if role exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_portal_app') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON imaging_orders TO hospital_portal_app;
    END IF;
END $$;

-- Add comment
COMMENT ON TABLE imaging_orders IS 'Phase 5: Generic imaging orders for all modalities (OCT, Visual Field, FFA, etc.)';

-- Add pin_hash column to users table for PIN verification
-- This supports the finalization workflow digital signature
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'pin_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255);
        COMMENT ON COLUMN users.pin_hash IS 'Hashed 4-6 digit PIN for digital signature verification';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ imaging_orders table created successfully';
    RAISE NOTICE '✅ RLS policies applied for tenant isolation';
    RAISE NOTICE '✅ pin_hash column added to users table';
    RAISE NOTICE '📋 Next: Configure DICOM storage integration';
END $$;
