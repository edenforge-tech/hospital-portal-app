-- Migration: Add imaging_images table for Phase 7 (Medical Imaging Platform)
-- Date: February 21, 2026
-- Description: Creates imaging_images table to store individual image metadata with file URLs, thumbnails, and DICOM metadata

-- Create imaging_images table
CREATE TABLE IF NOT EXISTS imaging_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Relationship to imaging order
    imaging_order_id UUID NOT NULL REFERENCES imaging_orders(id) ON DELETE CASCADE,
    
    -- File storage
    image_url VARCHAR(1000) NOT NULL, -- Azure Blob Storage URL
    thumbnail_url VARCHAR(1000), -- 256x256 thumbnail for gallery view
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL, -- Size in bytes
    content_type VARCHAR(100) NOT NULL, -- MIME type: image/jpeg, application/dicom, application/pdf
    
    -- Image metadata
    width INTEGER, -- Image width in pixels
    height INTEGER, -- Image height in pixels
    modality VARCHAR(50) NOT NULL, -- fundus, oct, visual_field, scheimpflug, iol_calculation, ubm
    
    -- DICOM metadata (JSON format)
    dicom_metadata JSONB, -- Parsed DICOM tags: PatientName, StudyDate, Modality, SeriesDescription, etc.
    
    -- Upload tracking
    uploaded_by_user_id UUID NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Standard HIPAA audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    status VARCHAR(50) DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT chk_imaging_image_modality CHECK (modality IN ('fundus', 'oct', 'visual_field', 'scheimpflug', 'iol_calculation', 'ubm', 'angiography', 'otros')),
    CONSTRAINT chk_imaging_image_status CHECK (status IN ('active', 'archived', 'deleted')),
    CONSTRAINT chk_imaging_image_file_size CHECK (file_size > 0 AND file_size <= 52428800) -- Max 50MB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imaging_images_order_id ON imaging_images(imaging_order_id);
CREATE INDEX IF NOT EXISTS idx_imaging_images_tenant_id ON imaging_images(tenant_id);
CREATE INDEX IF NOT EXISTS idx_imaging_images_modality ON imaging_images(modality);
CREATE INDEX IF NOT EXISTS idx_imaging_images_uploaded_at ON imaging_images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_images_status ON imaging_images(status) WHERE deleted_at IS NULL;

-- GIN index for DICOM metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_imaging_images_dicom_metadata ON imaging_images USING GIN (dicom_metadata);

-- Enable Row-Level Security for multi-tenancy
ALTER TABLE imaging_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_imaging_images ON imaging_images
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_app_user') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON imaging_images TO hospital_app_user;
    END IF;
END $$;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_imaging_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_imaging_images_updated_at
    BEFORE UPDATE ON imaging_images
    FOR EACH ROW
    EXECUTE FUNCTION update_imaging_images_updated_at();

-- Create audit log trigger for HIPAA compliance
CREATE OR REPLACE FUNCTION audit_imaging_images_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log to audit_log table (if exists)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, new_values, tenant_id)
        VALUES ('imaging_images', NEW.id, 'INSERT', NEW.created_by_user_id, CURRENT_TIMESTAMP, row_to_json(NEW), NEW.tenant_id);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, new_values, tenant_id)
        VALUES ('imaging_images', NEW.id, 'UPDATE', NEW.updated_by_user_id, CURRENT_TIMESTAMP, row_to_json(OLD), row_to_json(NEW), NEW.tenant_id);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, tenant_id)
        VALUES ('imaging_images', OLD.id, 'DELETE', OLD.updated_by_user_id, CURRENT_TIMESTAMP, row_to_json(OLD), OLD.tenant_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger if audit_log table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        CREATE TRIGGER trg_audit_imaging_images
            AFTER INSERT OR UPDATE OR DELETE ON imaging_images
            FOR EACH ROW
            EXECUTE FUNCTION audit_imaging_images_changes();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE imaging_images IS 'Stores individual imaging files (fundus photos, OCT scans, visual fields, etc.) with metadata and Azure Blob Storage URLs';
COMMENT ON COLUMN imaging_images.dicom_metadata IS 'Parsed DICOM tags stored as JSONB for flexible querying';
COMMENT ON COLUMN imaging_images.modality IS 'Imaging modality type for smart viewer selection';
COMMENT ON COLUMN imaging_images.thumbnail_url IS '256x256 thumbnail generated for gallery previews';
