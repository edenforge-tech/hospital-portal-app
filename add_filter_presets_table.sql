-- Migration: Add filter_preset table for saved filter views
-- Phase: 4.2 - Advanced Filters & Saved Views
-- Date: March 1, 2026

-- Drop existing table if exists (idempotent)
DROP TABLE IF EXISTS filter_preset CASCADE;

-- Create filter_preset table
CREATE TABLE filter_preset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    filters JSONB NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'counseling_session', 'follow_up', 'queue', etc.
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    
    -- Foreign keys
    CONSTRAINT fk_filter_preset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_filter_preset_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_filter_preset_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_filter_preset_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_filter_preset_entity_type CHECK (entity_type IN ('counseling_session', 'follow_up', 'queue', 'appointment', 'patient')),
    CONSTRAINT chk_filter_preset_status CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Create indexes for performance
CREATE INDEX idx_filter_preset_user_id ON filter_preset(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_filter_preset_tenant_id ON filter_preset(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_filter_preset_entity_type ON filter_preset(entity_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_filter_preset_is_default ON filter_preset(is_default) WHERE is_default = true AND deleted_at IS NULL;
CREATE INDEX idx_filter_preset_user_entity ON filter_preset(user_id, entity_type) WHERE deleted_at IS NULL;

-- Enable Row-Level Security (RLS)
ALTER TABLE filter_preset ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON filter_preset
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON filter_preset TO public;

-- Create audit trigger for tracking changes
CREATE OR REPLACE FUNCTION update_filter_preset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_filter_preset_updated_at
    BEFORE UPDATE ON filter_preset
    FOR EACH ROW
    EXECUTE FUNCTION update_filter_preset_updated_at();

-- Add comments for documentation
COMMENT ON TABLE filter_preset IS 'Stores saved filter presets for users across different entity types (Phase 4.2)';
COMMENT ON COLUMN filter_preset.filters IS 'JSONB column storing filter criteria (statuses, priorities, date ranges, etc.)';
COMMENT ON COLUMN filter_preset.entity_type IS 'Type of entity the filter applies to (counseling_session, follow_up, queue)';
COMMENT ON COLUMN filter_preset.is_default IS 'Whether this preset should be applied by default when user opens the view';
