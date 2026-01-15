-- COMPLETE FIX: Drop and recreate notification_logs table with ALL required columns
-- This ensures the table matches the NotificationLog entity exactly

-- Drop the table (cascading will handle any foreign keys)
DROP TABLE IF EXISTS notification_logs CASCADE;

-- Recreate with complete schema
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tenant_id UUID,
    otp_activation_id UUID,
    notification_type VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    purpose VARCHAR(50),
    subject VARCHAR(500),
    body TEXT,
    provider VARCHAR(50),
    provider_message_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    error_message TEXT,
    cost_usd DECIMAL(10,6),
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_tenant ON notification_logs(tenant_id);
CREATE INDEX idx_notification_logs_otp ON notification_logs(otp_activation_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Add comments
COMMENT ON TABLE notification_logs IS 'Audit log for all notification delivery attempts';
COMMENT ON COLUMN notification_logs.user_id IS 'User who received the notification';
COMMENT ON COLUMN notification_logs.tenant_id IS 'Tenant context for the notification';
COMMENT ON COLUMN notification_logs.otp_activation_id IS 'Links to otp_activations table if this is an OTP notification';
COMMENT ON COLUMN notification_logs.notification_type IS 'Type: email, sms';
COMMENT ON COLUMN notification_logs.recipient IS 'Email address or phone number';
COMMENT ON COLUMN notification_logs.purpose IS 'Purpose: activation_otp, mfa_login, password_reset, etc.';
COMMENT ON COLUMN notification_logs.subject IS 'Email subject or SMS preview';
COMMENT ON COLUMN notification_logs.body IS 'Full message content';
COMMENT ON COLUMN notification_logs.provider IS 'Provider: resend, twilio, etc.';
COMMENT ON COLUMN notification_logs.provider_message_id IS 'Tracking ID from provider';
COMMENT ON COLUMN notification_logs.status IS 'Status: queued, sent, delivered, failed, bounced';
COMMENT ON COLUMN notification_logs.error_message IS 'Error details if delivery failed';
COMMENT ON COLUMN notification_logs.cost_usd IS 'Cost in USD for sending';
COMMENT ON COLUMN notification_logs.sent_at IS 'When the notification was sent';
COMMENT ON COLUMN notification_logs.delivered_at IS 'When delivery was confirmed (if available)';

-- Verify table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notification_logs'
ORDER BY ordinal_position;
