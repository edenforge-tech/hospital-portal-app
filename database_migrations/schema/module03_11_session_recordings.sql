-- =====================================================
-- Module 3: Counselor Management - Session Recordings & Transcription
-- Migration: module03_11_session_recordings.sql
-- Description: Audio recording, transcription, and translation tracking
-- Author: AI Assistant
-- Date: 2026-03-01
-- =====================================================

-- =====================================================
-- 1. SESSION RECORDINGS (Audio/Video Recording Metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    session_id UUID NOT NULL,
    document_id UUID, -- Optional link to counseling_session_documents
    
    -- Recording Details
    recording_type VARCHAR(20) DEFAULT 'Audio' CHECK (recording_type IN ('Audio', 'Video', 'Screen')),
    file_url TEXT NOT NULL, -- Azure Blob Storage URL
    file_name VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    mime_type VARCHAR(100),
    
    -- Transcription Status
    transcription_status VARCHAR(30) DEFAULT 'Pending' CHECK (transcription_status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    transcription_started_at TIMESTAMPTZ,
    transcription_completed_at TIMESTAMPTZ,
    transcription_error TEXT,
    
    -- Translation Status
    translation_status VARCHAR(30) DEFAULT 'Pending' CHECK (translation_status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    translation_started_at TIMESTAMPTZ,
    translation_completed_at TIMESTAMPTZ,
    translation_error TEXT,
    
    -- Processing Metadata
    azure_job_id VARCHAR(200), -- Azure Cognitive Services Job ID
    processing_duration_ms INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_session_recording_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_recording_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_recording_document FOREIGN KEY (document_id) REFERENCES counseling_session_documents(id) ON DELETE SET NULL
);

-- Indexes for session_recordings
CREATE INDEX IF NOT EXISTS idx_session_recordings_tenant ON session_recordings(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_recordings_session ON session_recordings(session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_recordings_transcription_status ON session_recordings(transcription_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_recordings_created_at ON session_recordings(created_at DESC) WHERE deleted_at IS NULL;

-- RLS Policy for session_recordings
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_session_recordings ON session_recordings
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Auto-update trigger for session_recordings
CREATE TRIGGER update_session_recordings_updated_at
    BEFORE UPDATE ON session_recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. SESSION TRANSCRIPTS (Multi-Language Transcriptions)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    recording_id UUID NOT NULL,
    session_id UUID NOT NULL, -- Denormalized for faster queries
    
    -- Transcript Content
    language_code VARCHAR(10) NOT NULL, -- en-US, hi-IN, te-IN
    language_name VARCHAR(50), -- English, Hindi, Telugu
    is_original_language BOOLEAN DEFAULT TRUE,
    transcript_text TEXT NOT NULL,
    
    -- Subtitle Files (Azure Blob URLs)
    vtt_file_url TEXT, -- WebVTT format (web players)
    srt_file_url TEXT, -- SubRip format (video editors)
    
    -- Quality Metrics
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    word_count INTEGER,
    character_count INTEGER,
    
    -- Timestamps (JSON array of segments)
    segments JSONB, -- [{start: 0.5, end: 2.3, text: "Hello", confidence: 0.95}, ...]
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_session_transcript_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_transcript_recording FOREIGN KEY (recording_id) REFERENCES session_recordings(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_transcript_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT uq_session_transcript_recording_language UNIQUE (recording_id, language_code, deleted_at)
);

-- Indexes for session_transcripts
CREATE INDEX IF NOT EXISTS idx_session_transcripts_tenant ON session_transcripts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_transcripts_recording ON session_transcripts(recording_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_transcripts_session ON session_transcripts(session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_transcripts_language ON session_transcripts(language_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_session_transcripts_original ON session_transcripts(is_original_language) WHERE deleted_at IS NULL AND is_original_language = TRUE;

-- GIN index for JSONB segments (enables fast timestamp queries)
CREATE INDEX IF NOT EXISTS idx_session_transcripts_segments ON session_transcripts USING GIN (segments);

-- Full-text search index on transcript_text
CREATE INDEX IF NOT EXISTS idx_session_transcripts_text_search ON session_transcripts USING GIN (to_tsvector('english', transcript_text)) WHERE deleted_at IS NULL;

-- RLS Policy for session_transcripts
ALTER TABLE session_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_session_transcripts ON session_transcripts
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Auto-update trigger for session_transcripts
CREATE TRIGGER update_session_transcripts_updated_at
    BEFORE UPDATE ON session_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TRANSCRIPT EDITS (Manual Corrections & Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS transcript_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    transcript_id UUID NOT NULL,
    
    -- Edit Details
    segment_index INTEGER NOT NULL, -- Which segment in the segments array was edited
    original_text TEXT NOT NULL,
    edited_text TEXT NOT NULL,
    edit_reason VARCHAR(200), -- "Medical term correction", "Misheard word", etc.
    
    -- Audit Fields (Edit history is critical for legal compliance)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL, -- Who made the edit
    
    -- Constraints
    CONSTRAINT fk_transcript_edit_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_transcript_edit_transcript FOREIGN KEY (transcript_id) REFERENCES session_transcripts(id) ON DELETE CASCADE,
    CONSTRAINT fk_transcript_edit_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Indexes for transcript_edits
CREATE INDEX IF NOT EXISTS idx_transcript_edits_tenant ON transcript_edits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transcript_edits_transcript ON transcript_edits(transcript_id);
CREATE INDEX IF NOT EXISTS idx_transcript_edits_user ON transcript_edits(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_transcript_edits_created_at ON transcript_edits(created_at DESC);

-- RLS Policy for transcript_edits
ALTER TABLE transcript_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_transcript_edits ON transcript_edits
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function: Calculate average confidence score for a transcript
CREATE OR REPLACE FUNCTION get_transcript_average_confidence(p_transcript_id UUID)
RETURNS DECIMAL(5,4) AS $$
DECLARE
    v_avg_confidence DECIMAL(5,4);
BEGIN
    SELECT AVG((segment->>'confidence')::DECIMAL)
    INTO v_avg_confidence
    FROM session_transcripts,
         jsonb_array_elements(segments) AS segment
    WHERE id = p_transcript_id
      AND deleted_at IS NULL;
    
    RETURN COALESCE(v_avg_confidence, 0.0000);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get transcript summary
CREATE OR REPLACE FUNCTION get_recording_summary(p_session_id UUID)
RETURNS TABLE (
    recording_count BIGINT,
    total_duration_seconds BIGINT,
    total_size_mb DECIMAL(10,2),
    transcription_complete_count BIGINT,
    translation_complete_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS recording_count,
        COALESCE(SUM(duration_seconds), 0) AS total_duration_seconds,
        COALESCE(ROUND(SUM(file_size_bytes) / 1048576.0, 2), 0.00) AS total_size_mb,
        COUNT(*) FILTER (WHERE transcription_status = 'Completed') AS transcription_complete_count,
        COUNT(*) FILTER (WHERE translation_status = 'Completed') AS translation_complete_count
    FROM session_recordings
    WHERE session_id = p_session_id
      AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. SAMPLE DATA (For Testing)
-- =====================================================

-- Note: Sample data insertion would require existing counseling_sessions
-- This is handled by the backend service when recordings are uploaded

-- =====================================================
-- 6. PERMISSIONS
-- =====================================================

-- Grant permissions to application role (if using role-based access)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON session_recordings TO app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON session_transcripts TO app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON transcript_edits TO app_role;

-- =====================================================
-- 7. MIGRATION VALIDATION
-- =====================================================

-- Verify tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_recordings') THEN
        RAISE EXCEPTION 'Table session_recordings was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_transcripts') THEN
        RAISE EXCEPTION 'Table session_transcripts was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transcript_edits') THEN
        RAISE EXCEPTION 'Table transcript_edits was not created';
    END IF;
    
    RAISE NOTICE 'Migration module03_11_session_recordings.sql completed successfully';
    RAISE NOTICE '✓ 3 tables created: session_recordings, session_transcripts, transcript_edits';
    RAISE NOTICE '✓ 13 indexes created for performance';
    RAISE NOTICE '✓ RLS policies applied for multi-tenancy';
    RAISE NOTICE '✓ 2 helper functions created';
END $$;
