-- Migration: Create activation_audit_log table
-- Purpose: HIPAA-compliant audit trail for user activation process
-- Created: 2025
-- Compliance: HIPAA §164.312(b) - Audit controls

-- Drop table if exists (for development)
DROP TABLE IF EXISTS activation_audit_log CASCADE;

-- Create activation_audit_log table
CREATE TABLE activation_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    activation_step VARCHAR(50) NOT NULL, -- token_validated, email_verified, password_set, professional_info_saved, terms_accepted, hipaa_accepted, mfa_setup_started, mfa_completed, activation_completed
    status VARCHAR(20) NOT NULL, -- success, failed, pending
    error_message TEXT,
    ip_address VARCHAR(45), -- Supports IPv6 (max 39 chars) + IPv4
    user_agent TEXT,
    device_info TEXT, -- JSON: {IsMobile, IsTablet, OS, Browser}
    geolocation_info TEXT, -- Optional geolocation data
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    response_time_ms INTEGER, -- Performance tracking
    suspicious_activity BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_notes TEXT,
    request_data TEXT, -- Sanitized JSON
    response_data TEXT, -- Sanitized JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for query performance
CREATE INDEX idx_activation_audit_tenant_user ON activation_audit_log(tenant_id, user_id);
CREATE INDEX idx_activation_audit_timestamp ON activation_audit_log(timestamp);
CREATE INDEX idx_activation_audit_step ON activation_audit_log(activation_step);
CREATE INDEX idx_activation_audit_status ON activation_audit_log(status);
CREATE INDEX idx_activation_audit_suspicious ON activation_audit_log(suspicious_activity) WHERE suspicious_activity = true;

-- Add comments for documentation
COMMENT ON TABLE activation_audit_log IS 'HIPAA-compliant audit trail for user activation process tracking';
COMMENT ON COLUMN activation_audit_log.activation_step IS 'Activation workflow step: token_validated, email_verified, otp_entered, password_set, professional_info_saved, terms_accepted, hipaa_accepted, mfa_setup_started, mfa_completed, activation_completed';
COMMENT ON COLUMN activation_audit_log.status IS 'Step completion status: success, failed, pending';
COMMENT ON COLUMN activation_audit_log.ip_address IS 'Client IP address (IPv4 or IPv6) for security tracking';
COMMENT ON COLUMN activation_audit_log.device_info IS 'JSON containing device metadata: mobile, tablet, OS, browser';
COMMENT ON COLUMN activation_audit_log.response_time_ms IS 'API response time in milliseconds for performance monitoring';
COMMENT ON COLUMN activation_audit_log.suspicious_activity IS 'Flagged if 3+ failures detected within 15 minutes';
COMMENT ON COLUMN activation_audit_log.request_data IS 'Sanitized request payload (passwords/tokens removed)';
COMMENT ON COLUMN activation_audit_log.response_data IS 'Sanitized response payload (sensitive data removed)';

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activation_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER activation_audit_update_timestamp
    BEFORE UPDATE ON activation_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION update_activation_audit_updated_at();

-- Grant permissions (adjust based on your role structure)
-- GRANT SELECT, INSERT, UPDATE ON activation_audit_log TO hospital_portal_app;
-- GRANT SELECT ON activation_audit_log TO hospital_portal_readonly;

COMMENT ON TABLE activation_audit_log IS 'HIPAA §164.312(b) compliant audit trail - DO NOT DELETE RECORDS';
