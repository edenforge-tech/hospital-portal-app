-- Migration: Add ai_progression_analysis table for AI-powered progression detection
-- Date: February 21, 2026
-- Description: Stores AI analysis results for retinal disease progression detention

-- Create ai_progression_analysis table
CREATE TABLE IF NOT EXISTS ai_progression_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    
    -- Images analyzed
    baseline_image_id UUID NOT NULL,
    followup_image_id UUID NOT NULL,
    
    -- Analysis results
    analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progression_detected BOOLEAN NOT NULL DEFAULT FALSE,
    confidence_score DOUBLE PRECISION NOT NULL, -- 0-1 (0% to 100%)
    clinical_significance VARCHAR(50) NOT NULL DEFAULT 'none', -- none, mild, moderate, significant, critical
    
    -- AI Details
    detected_regions TEXT, -- JSON array of detected regions with bounding boxes
    progression_metrics TEXT, -- JSON object with quantitative metrics
    model_version VARCHAR(100) NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    
    -- Standard columns
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_ai_analysis_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
    CONSTRAINT chk_ai_analysis_significance CHECK (
        clinical_significance IN ('none', 'mild', 'moderate', 'significant', 'critical')
    ),
    CONSTRAINT chk_ai_analysis_status CHECK (status IN ('active', 'archived'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_tenant_id ON ai_progression_analysis(tenant_id, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_patient_id ON ai_progression_analysis(patient_id, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_baseline_image ON ai_progression_analysis(baseline_image_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_followup_image ON ai_progression_analysis(followup_image_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_significance ON ai_progression_analysis(clinical_significance) WHERE clinical_significance IN ('significant', 'critical');
CREATE INDEX IF NOT EXISTS idx_ai_analysis_progression ON ai_progression_analysis(progression_detected, confidence_score DESC) WHERE progression_detected = TRUE;

-- Composite index for patient progression tracking
CREATE INDEX IF NOT EXISTS idx_ai_analysis_patient_progression ON ai_progression_analysis(tenant_id, patient_id, analyzed_at DESC, clinical_significance);

-- Enable Row-Level Security for multi-tenancy
ALTER TABLE ai_progression_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_ai_progression_analysis ON ai_progression_analysis
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_app_user') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON ai_progression_analysis TO hospital_app_user;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE ai_progression_analysis IS 'AI-powered progression detection analysis results for retinal imaging';
COMMENT ON COLUMN ai_progression_analysis.confidence_score IS 'AI model confidence score (0-1, where 1 = 100% confident)';
COMMENT ON COLUMN ai_progression_analysis.clinical_significance IS 'Clinical significance of detected progression';
COMMENT ON COLUMN ai_progression_analysis.detected_regions IS 'JSON array of detected anatomical regions with bounding boxes and change types';
COMMENT ON COLUMN ai_progression_analysis.progression_metrics IS 'JSON object with quantitative metrics (area changed, severity score, etc.)';
COMMENT ON COLUMN ai_progression_analysis.model_version IS 'AI model version used for analysis';
COMMENT ON COLUMN ai_progression_analysis.processing_time_ms IS 'Time taken to process analysis (milliseconds)';

-- Create materialized view for AI performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS ai_model_performance_stats AS
SELECT
    model_version,
    COUNT(*) as total_analyses,
    AVG(confidence_score) as avg_confidence,
    AVG(processing_time_ms) as avg_processing_time_ms,
    COUNT(*) FILTER (WHERE progression_detected = TRUE) as progressions_detected,
    COUNT(*) FILTER (WHERE clinical_significance IN ('significant', 'critical')) as critical_cases,
    DATE(analyzed_at) as analysis_date
FROM ai_progression_analysis
WHERE status = 'active'
GROUP BY model_version, DATE(analyzed_at)
ORDER BY analysis_date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_ai_performance_model ON ai_model_performance_stats(model_version, analysis_date DESC);

-- Refresh materialized view permissions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'hospital_app_user') THEN
        GRANT SELECT ON ai_model_performance_stats TO hospital_app_user;
    END IF;
END $$;

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_progression_analysis') THEN
        RAISE NOTICE 'ai_progression_analysis table created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create ai_progression_analysis table';
    END IF;
END $$;
