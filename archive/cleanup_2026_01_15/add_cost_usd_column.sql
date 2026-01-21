-- Add missing 'cost_usd' column to notification_logs table
-- This column stores the cost of sending the notification (for tracking email/SMS costs)

ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10,6);

COMMENT ON COLUMN notification_logs.cost_usd IS 'Cost in USD for sending the notification (email/SMS provider charges)';

-- Verify column was added
SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable
FROM information_schema.columns
WHERE table_name = 'notification_logs'
AND column_name = 'cost_usd';
