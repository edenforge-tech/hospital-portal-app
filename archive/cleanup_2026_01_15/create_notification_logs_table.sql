-- Create notification_logs table for tracking all notification attempts
-- This table is used by the notification service to audit notification delivery

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'activation_otp', 'mfa_otp', 'password_reset', 'email', 'sms'
    delivery_method VARCHAR(20) NOT NULL, -- 'email', 'sms', 'push'
    recipient VARCHAR(255) NOT NULL, -- email address or phone number
    subject VARCHAR(500),
    body TEXT, -- message body / content
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered', 'bounced'
    error_message TEXT,
    provider_response TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_notification_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_notification_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_tenant ON notification_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipient);

-- Enable Row Level Security
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_notification_logs ON notification_logs
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notification_logs TO postgres;

-- Add comments
COMMENT ON TABLE notification_logs IS 'Audit log for all notification delivery attempts';
COMMENT ON COLUMN notification_logs.notification_type IS 'Type of notification: activation_otp, mfa_otp, password_reset, email, sms';
COMMENT ON COLUMN notification_logs.delivery_method IS 'How the notification was delivered: email, sms, push';
COMMENT ON COLUMN notification_logs.status IS 'Delivery status: pending, sent, failed, delivered, bounced';
COMMENT ON COLUMN notification_logs.provider_response IS 'Raw response from email/SMS provider for debugging';

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notification_logs'
ORDER BY ordinal_position;
