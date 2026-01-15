-- Complete fix for notification_logs table
-- Add all missing columns to match NotificationLog entity

-- Add otp_activation_id column
ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS otp_activation_id UUID;

-- Add provider column if missing
ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50);

-- Add provider_message_id column if missing
ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS provider_message_id VARCHAR(255);

-- Add sent_at column if missing (different from created_at)
ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add delivered_at column if missing
ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- Add comments
COMMENT ON COLUMN notification_logs.otp_activation_id IS 'Foreign key to otp_activations table linking notification to the OTP record';
COMMENT ON COLUMN notification_logs.provider IS 'Email/SMS provider used (e.g., resend, twilio)';
COMMENT ON COLUMN notification_logs.provider_message_id IS 'Message ID from the provider for tracking';
COMMENT ON COLUMN notification_logs.sent_at IS 'Timestamp when notification was sent';
COMMENT ON COLUMN notification_logs.delivered_at IS 'Timestamp when notification was delivered (if available)';

-- Verify all columns exist
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notification_logs'
ORDER BY ordinal_position;
