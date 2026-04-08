-- Migration: Add imaging_access_log table for HIPAA audit trail
-- Date: February 21, 2026
-- Description: Tracks all PHI access for medical imaging (views, annotations, comparisons, exports)

-- Create imaging_access_log table
CREATE TABLE IF NOT EXISTS imaging_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- User and patient info (EF Core maps AspNetUsers to lowercase "users")
    user_id UUID, -- References users table (AspNetUsers in EF)
    patient_id UUID REFERENCES patient(id) ON DELETE CASCADE,
    
    -- Resource accessed
    resource_type VARCHAR(50), -- ImagingImage, ImagingAnnotation, ImagingComparison, ImagingExport
    resource_id UUID, -- ID of the resource accessed
    
    -- Action performed
    action VARCHAR(100) NOT NULL, -- VIEW, DOWNLOAD, ANNOTATE, CREATE, UPDATE, DELETE, EXPORT_PDF, VIEW_COMPARISON
    action_details TEXT, -- JSON with additional context
    
    -- Access result
    access_granted BOOLEAN DEFAULT TRUE,
    denial_reason TEXT, -- Populated if access_granted = FALSE
    
    -- Session tracking (HIPAA requirement)
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT, -- Browser/device info
    session_id VARCHAR(255), -- Session identifier
    
    -- Timing
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER, -- How long resource was accessed
    
    -- Standard audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT chk_imaging_access_resource_type CHECK (
        resource_type IN ('ImagingImage', 'ImagingAnnotation', 'ImagingComparison', 'ImagingExport')
    ),
    CONSTRAINT chk_imaging_access_action CHECK (
        action IN ('VIEW', 'DOWNLOAD', 'ANNOTATE', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT_PDF', 'VIEW_COMPARISON', 'GENERATE_TIMELINE')
    ),
    CONSTRAINT chk_imaging_access_status CHECK (status IN ('active', 'archived'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imaging_access_tenant_id ON imaging_access_log(tenant_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_access_user_id ON imaging_access_log(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_access_patient_id ON imaging_access_log(patient_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_access_resource ON imaging_access_log(resource_type, resource_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_access_action ON imaging_access_log(action, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_access_timestamp ON imaging_access_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imaging_access_denied ON imaging_access_log(accessed_at DESC) WHERE access_granted = FALSE;
CREATE INDEX IF NOT EXISTS idx_imaging_access_ip ON imaging_access_log(ip_address, accessed_at DESC);

-- Composite index for HIPAA compliance queries
CREATE INDEX IF NOT EXISTS idx_imaging_access_hipaa_audit ON imaging_access_log(tenant_id, patient_id, accessed_at DESC);

-- Enable Row-Level Security for multi-tenancy
ALTER TABLE imaging_access_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_imaging_access_log ON imaging_access_log
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_app_user') THEN
        GRANT SELECT, INSERT ON imaging_access_log TO hospital_app_user;
        -- NOTE: No UPDATE or DELETE - audit logs are immutable
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE imaging_access_log IS 'HIPAA-compliant audit trail for all medical imaging PHI access (images, annotations, comparisons, exports)';
COMMENT ON COLUMN imaging_access_log.resource_type IS 'Type of imaging resource accessed';
COMMENT ON COLUMN imaging_access_log.action IS 'Action performed on the resource';
COMMENT ON COLUMN imaging_access_log.access_granted IS 'Whether access was granted (for future ABAC denial tracking)';
COMMENT ON COLUMN imaging_access_log.ip_address IS 'Source IP address for forensic analysis';
COMMENT ON COLUMN imaging_access_log.user_agent IS 'Browser/device info for security monitoring';
COMMENT ON COLUMN imaging_access_log.session_id IS 'Session identifier for tracking user sessions';
COMMENT ON COLUMN imaging_access_log.duration_seconds IS 'Duration of access (e.g., how long image was viewed)';
COMMENT ON COLUMN imaging_access_log.accessed_at IS 'Immutable timestamp - audit logs are never updated';

-- Create function for suspicious activity detection (daily cron job)
CREATE OR REPLACE FUNCTION detect_suspicious_imaging_access()
RETURNS TABLE(
    alert_severity VARCHAR,
    alert_type VARCHAR,
    description TEXT,
    user_id UUID,
    detected_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Alert 1: Excessive access (>100 accesses in 1 hour)
    RETURN QUERY
    SELECT 
        'High'::VARCHAR AS alert_severity,
        'Excessive Access'::VARCHAR AS alert_type,
        'User accessed >100 imaging resources in 1 hour'::TEXT AS description,
        ial.user_id,
        CURRENT_TIMESTAMP AS detected_at
    FROM imaging_access_log ial
    WHERE ial.accessed_at >= NOW() - INTERVAL '24 hours'
    GROUP BY ial.user_id, DATE_TRUNC('hour', ial.accessed_at)
    HAVING COUNT(*) > 100;
    
    -- Alert 2: After-hours access
    RETURN QUERY
    SELECT 
        'Medium'::VARCHAR AS alert_severity,
        'After-Hours Access'::VARCHAR AS alert_type,
        'Imaging access outside 7am-8pm'::TEXT AS description,
        ial.user_id,
        CURRENT_TIMESTAMP AS detected_at
    FROM imaging_access_log ial
    WHERE ial.accessed_at >= NOW() - INTERVAL '24 hours'
      AND (EXTRACT(HOUR FROM ial.accessed_at) < 7 OR EXTRACT(HOUR FROM ial.accessed_at) > 20)
    GROUP BY ial.user_id
    HAVING COUNT(*) > 20;
    
    -- Alert 3: Bulk export activity
    RETURN QUERY
    SELECT 
        'Critical'::VARCHAR AS alert_severity,
        'Bulk Export'::VARCHAR AS alert_type,
        'User exported >10 reports in 24 hours'::TEXT AS description,
        ial.user_id,
        CURRENT_TIMESTAMP AS detected_at
    FROM imaging_access_log ial
    WHERE ial.accessed_at >= NOW() - INTERVAL '24 hours'
      AND ial.action = 'EXPORT_PDF'
    GROUP BY ial.user_id
    HAVING COUNT(*) > 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create materialized view for access statistics (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS imaging_access_statistics AS
SELECT 
    tenant_id,
    DATE(accessed_at) AS access_date,
    COUNT(*) AS total_accesses,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT patient_id) AS unique_patients,
    COUNT(*) FILTER (WHERE action = 'VIEW') AS view_count,
    COUNT(*) FILTER (WHERE action = 'ANNOTATE') AS annotation_count,
    COUNT(*) FILTER (WHERE action = 'EXPORT_PDF') AS export_count,
    AVG(duration_seconds) AS avg_duration_seconds,
    MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM accessed_at)) AS peak_access_hour
FROM imaging_access_log
WHERE accessed_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, DATE(accessed_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_imaging_access_stats_unique ON imaging_access_statistics(tenant_id, access_date);

COMMENT ON MATERIALIZED VIEW imaging_access_statistics IS 'Daily aggregated imaging access statistics for HIPAA compliance reporting';

-- Sample data for testing (optional - remove for production)
-- INSERT INTO imaging_access_log (tenant_id, user_id, patient_id, resource_type, resource_id, action, accessed_at)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001'::UUID,
--     '00000000-0000-0000-0000-000000000002'::UUID,
--     '00000000-0000-0000-0000-000000000003'::UUID,
--     'ImagingImage',
--     gen_random_uuid(),
--     'VIEW',
--     NOW()
-- );

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imaging_access_log') THEN
        RAISE NOTICE 'imaging_access_log table created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create imaging_access_log table';
    END IF;
END $$;
