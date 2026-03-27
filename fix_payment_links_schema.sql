-- Fix payment_links table schema to match entity model
-- Applied: February 23, 2026

BEGIN;

-- Rename and update columns to match new schema
ALTER TABLE payment_links 
    RENAME COLUMN amount TO link_amount;

ALTER TABLE payment_links 
    RENAME COLUMN payment_link_url TO full_url;

ALTER TABLE payment_links 
    RENAME COLUMN razorpay_payment_link_id TO payment_link_id;

-- Add new columns if they don't exist
ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR';

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(20);

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(200);

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS sent_via VARCHAR(20);

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS reminder_sent_count INTEGER DEFAULT 0;

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE payment_links 
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Drop columns that don't exist in new schema
ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS purpose;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS branch_id;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS notify_via_sms;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS notify_via_email;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS notify_via_whatsapp;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS patient_mobile;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS patient_email;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS payment_completed;

ALTER TABLE payment_links 
    DROP COLUMN IF EXISTS updated_by_user_id;

-- Update link_status check constraint
ALTER TABLE payment_links 
    DROP CONSTRAINT IF EXISTS payment_links_link_status_check;

ALTER TABLE payment_links 
    ADD CONSTRAINT payment_links_link_status_check 
    CHECK (link_status IN ('Active', 'Paid', 'Expired', 'Cancelled'));

-- Update sent_via check constraint  
ALTER TABLE payment_links 
    DROP CONSTRAINT IF EXISTS payment_links_sent_via_check;

ALTER TABLE payment_links 
    ADD CONSTRAINT payment_links_sent_via_check 
    CHECK (sent_via IN ('SMS', 'Email', 'WhatsApp', 'QRCode', 'Manual'));

-- Update link_amount precision
ALTER TABLE payment_links 
    ALTER COLUMN link_amount TYPE DECIMAL(12,2);

-- Make payment_link_id unique if not already
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_links_payment_link_id_key'
    ) THEN
        ALTER TABLE payment_links 
            ADD CONSTRAINT payment_links_payment_link_id_key UNIQUE (payment_link_id);
    END IF;
END $$;

COMMIT;

-- Verification
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_links'
ORDER BY ordinal_position;
