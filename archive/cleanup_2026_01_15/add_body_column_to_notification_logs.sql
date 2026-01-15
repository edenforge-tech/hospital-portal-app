-- Add missing 'body' column to notification_logs table
-- This column stores the message body/content for notifications

ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS body TEXT;

COMMENT ON COLUMN notification_logs.body IS 'Message body/content for the notification';

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notification_logs'
AND column_name = 'body';
