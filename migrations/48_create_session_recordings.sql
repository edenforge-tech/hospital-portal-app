-- =====================================================
-- Migration: 48_create_session_recordings.sql
-- Description: Session recordings, transcriptions, and translations
-- Author: AI Assistant
-- Date: 2026-02-27
-- Dependencies: module03_02_counseling_workflow.sql
-- =====================================================

-- =====================================================
-- 1. SESSION RECORDINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS session_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Session Link
    session_id UUID NOT NULL,
    document_id UUID, -- Links to counseling_session_documents
    
    -- Recording Details
    recording_type VARCHAR(30) DEFAULT 'Audio' CHECK (recording_type IN ('Audio', 'Video')),
    file_url TEXT NOT NULL, -- Azure Blob Storage URL
    file_name VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    mime_type VARCHAR(100), -- audio/webm, audio/mp3, etc.
    
    -- Transcription Status
    transcription_status VARCHAR(50) DEFAULT 'Pending' CHECK (transcription_status IN (
        'Pending', 
        'InProgress', 
        'Completed', 
        'Failed',
        'NotRequested'
    )),
    transcription_started_at TIMESTAMPTZ,
    transcription_completed_at TIMESTAMPTZ,
    transcription_error TEXT,
    
    -- Translation Status
    translation_status VARCHAR(50) DEFAULT 'Pending' CHECK (translation_status IN (
        'Pending', 
        'InProgress', 
        'Completed', 
        'Failed',
        'NotRequested'
    )),
    translation_started_at TIMESTAMPTZ,
    translation_completed_at TIMESTAMPTZ,
    translation_error TEXT,
    
    -- Processing Metadata
    azure_job_id VARCHAR(200), -- Azure Speech Service job ID
    processing_duration_ms INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_session_recording_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_recording_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_recording_document FOREIGN KEY (document_id) REFERENCES counseling_session_documents(id) ON DELETE SET NULL,
    CONSTRAINT fk_session_recording_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 2. TRANSCRIPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS session_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Recording Link
    recording_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Transcript Content
    language_code VARCHAR(10) NOT NULL, -- en-US, hi-IN, te-IN
    language_name VARCHAR(50), -- English, Hindi, Telugu
    is_original_language BOOLEAN DEFAULT TRUE,
    transcript_text TEXT NOT NULL,
    
    -- VTT/SRT Subtitle Files (optional)
    vtt_file_url TEXT, -- WebVTT format for web players
    srt_file_url TEXT, -- SubRip format for downloads
    
    -- Confidence & Quality Metrics
    confidence_score DECIMAL(5,2), -- 0.00 to 100.00
    word_count INTEGER,
    character_count INTEGER,
    
    -- Timestamps (JSON array of segments)
    -- Format: [{"start": 0.5, "end": 3.2, "text": "Hello, how are you?", "confidence": 0.95}, ...]
    segments JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_transcript_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_transcript_recording FOREIGN KEY (recording_id) REFERENCES session_recordings(id) ON DELETE CASCADE,
    CONSTRAINT fk_transcript_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. TRANSCRIPT EDITS (Manual Corrections)
-- =====================================================
CREATE TABLE IF NOT EXISTS transcript_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Transcript Link
    transcript_id UUID NOT NULL,
    
    -- Edit Details
    segment_index INTEGER NOT NULL, -- Which segment was edited
    original_text TEXT NOT NULL,
    edited_text TEXT NOT NULL,
    edit_reason VARCHAR(100), -- Typo, Misheard, MedicalTerm, etc.
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT fk_edit_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_edit_transcript FOREIGN KEY (transcript_id) REFERENCES session_transcripts(id) ON DELETE CASCADE,
    CONSTRAINT fk_edit_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Session Recordings
CREATE INDEX IF NOT EXISTS idx_recordings_tenant ON session_recordings(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recordings_session ON session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON session_recordings(transcription_status, translation_status);
CREATE INDEX IF NOT EXISTS idx_recordings_created ON session_recordings(created_at DESC);

-- Session Transcripts
CREATE INDEX IF NOT EXISTS idx_transcripts_tenant ON session_transcripts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transcripts_recording ON session_transcripts(recording_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_session ON session_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_language ON session_transcripts(language_code);
CREATE INDEX IF NOT EXISTS idx_transcripts_original ON session_transcripts(is_original_language) WHERE is_original_language = TRUE;

-- Transcript Edits
CREATE INDEX IF NOT EXISTS idx_edits_tenant ON transcript_edits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_edits_transcript ON transcript_edits(transcript_id);
CREATE INDEX IF NOT EXISTS idx_edits_created ON transcript_edits(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_edits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_isolation_recordings ON session_recordings
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_transcripts ON session_transcripts
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_edits ON transcript_edits
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate transcript statistics
CREATE OR REPLACE FUNCTION calculate_transcript_stats(p_transcript_id UUID)
RETURNS TABLE (
    word_count INTEGER,
    character_count INTEGER,
    avg_confidence DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(value->>'text') FILTER (WHERE value->>'text' IS NOT NULL)::INTEGER,
        SUM(LENGTH(value->>'text'))::INTEGER,
        AVG((value->>'confidence')::DECIMAL)::DECIMAL(5,2)
    FROM session_transcripts t,
         jsonb_array_elements(t.segments) AS value
    WHERE t.id = p_transcript_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE session_recordings IS 'Audio/video recordings of counseling sessions with transcription tracking';
COMMENT ON TABLE session_transcripts IS 'Transcriptions and translations of session recordings';
COMMENT ON TABLE transcript_edits IS 'Manual corrections to auto-generated transcripts';

COMMENT ON COLUMN session_recordings.transcription_status IS 'Status of Azure Speech-to-Text processing';
COMMENT ON COLUMN session_recordings.translation_status IS 'Status of Azure Translator processing';
COMMENT ON COLUMN session_transcripts.segments IS 'JSON array of timestamped transcript segments';
COMMENT ON COLUMN session_transcripts.confidence_score IS 'Overall confidence score from Azure (0-100)';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 48: Session recordings schema created successfully';
    RAISE NOTICE '📊 Tables created: session_recordings, session_transcripts, transcript_edits';
    RAISE NOTICE '🔒 RLS policies enabled for all tables';
END $$;
