-- Migration: Add imaging_annotations table for Phase 7 (Medical Imaging Platform)
-- Date: February 21, 2026
-- Description: Creates imaging_annotations table to persist measurements, markups, and annotations on medical images

-- Create imaging_annotations table
CREATE TABLE IF NOT EXISTS imaging_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Relationship to image
    imaging_image_id UUID NOT NULL REFERENCES imaging_images(id) ON DELETE CASCADE,
    
    -- Annotation type and tool
    annotation_type VARCHAR(50) NOT NULL, -- length, angle, roi_rectangle, roi_ellipse, freehand, arrow, text
    tool_name VARCHAR(100), -- CornerstoneJS tool identifier (e.g., 'Length', 'Angle', 'RectangleROI')
    
    -- Geometry data (stored as JSONB for flexibility)
    coordinates JSONB NOT NULL, -- Stores shape data: points, handles, bounds
    -- Example for Length: {"start": {"x": 100, "y": 200}, "end": {"x": 300, "y": 400}}
    -- Example for Rectangle: {"x": 50, "y": 50, "width": 200, "height": 150}
    -- Example for Freehand: {"points": [{"x": 10, "y": 20}, {"x": 15, "y": 25}, ...]}
    
    -- Measurement data
    measurement_value NUMERIC(12, 3), -- Numeric result (e.g., 234.567)
    measurement_unit VARCHAR(20), -- µm, mm, degrees, pixels
    
    -- Text annotations
    text_content TEXT, -- Free text for text annotation tool
    
    -- Visual styling
    color VARCHAR(7) DEFAULT '#00FF00', -- Hex color for annotation rendering
    line_width INTEGER DEFAULT 2, -- Line thickness in pixels
    font_size INTEGER DEFAULT 14, -- Font size for text annotations
    
    -- Metadata
    annotation_metadata JSONB, -- Additional tool-specific data
    
    -- Audit tracking
    created_by_user_id UUID NOT NULL,
    updated_by_user_id UUID,
    
    -- Standard HIPAA audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    status VARCHAR(50) DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT chk_annotation_type CHECK (annotation_type IN ('length', 'angle', 'roi_rectangle', 'roi_ellipse', 'roi_circle', 'freehand', 'arrow', 'text', 'point', 'probe')),
    CONSTRAINT chk_annotation_status CHECK (status IN ('active', 'archived', 'deleted')),
    CONSTRAINT chk_annotation_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$'), -- Valid hex color
    CONSTRAINT chk_annotation_line_width CHECK (line_width BETWEEN 1 AND 10)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imaging_annotations_image_id ON imaging_annotations(imaging_image_id);
CREATE INDEX IF NOT EXISTS idx_imaging_annotations_tenant_id ON imaging_annotations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_imaging_annotations_type ON imaging_annotations(annotation_type);
CREATE INDEX IF NOT EXISTS idx_imaging_annotations_created_by ON imaging_annotations(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_imaging_annotations_status ON imaging_annotations(status) WHERE deleted_at IS NULL;

-- GIN index for coordinates JSONB queries
CREATE INDEX IF NOT EXISTS idx_imaging_annotations_coordinates ON imaging_annotations USING GIN (coordinates);

-- Enable Row-Level Security for multi-tenancy
ALTER TABLE imaging_annotations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_imaging_annotations ON imaging_annotations
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_app_user') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON imaging_annotations TO hospital_app_user;
    END IF;
END $$;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_imaging_annotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_imaging_annotations_updated_at
    BEFORE UPDATE ON imaging_annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_imaging_annotations_updated_at();

-- Create audit log trigger for HIPAA compliance (critical for medical measurements)
CREATE OR REPLACE FUNCTION audit_imaging_annotations_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, new_values, tenant_id)
        VALUES ('imaging_annotations', NEW.id, 'INSERT', NEW.created_by_user_id, CURRENT_TIMESTAMP, row_to_json(NEW), NEW.tenant_id);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, new_values, tenant_id)
        VALUES ('imaging_annotations', NEW.id, 'UPDATE', NEW.updated_by_user_id, CURRENT_TIMESTAMP, row_to_json(OLD), row_to_json(NEW), NEW.tenant_id);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, changed_by, changed_at, old_values, tenant_id)
        VALUES ('imaging_annotations', OLD.id, 'DELETE', OLD.updated_by_user_id, CURRENT_TIMESTAMP, row_to_json(OLD), OLD.tenant_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger if audit_log table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        CREATE TRIGGER trg_audit_imaging_annotations
            AFTER INSERT OR UPDATE OR DELETE ON imaging_annotations
            FOR EACH ROW
            EXECUTE FUNCTION audit_imaging_annotations_changes();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE imaging_annotations IS 'Persists measurements, markups, and annotations on medical images for clinical documentation';
COMMENT ON COLUMN imaging_annotations.coordinates IS 'JSONB storage for flexible annotation geometry data compatible with CornerstoneJS and canvas-based viewers';
COMMENT ON COLUMN imaging_annotations.measurement_value IS 'Numeric measurement result (e.g., retinal thickness in µm, angle in degrees)';
COMMENT ON COLUMN imaging_annotations.tool_name IS 'CornerstoneJS tool identifier for reconstruction on viewer load';
COMMENT ON COLUMN imaging_annotations.annotation_metadata IS 'Additional tool-specific data (e.g., calibration factor, confidence score)';
