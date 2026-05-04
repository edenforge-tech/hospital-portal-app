-- Migration 33: Payment proof attachments
-- Adds blob-storage URL columns to inv_vendor_payments so a screenshot or
-- PDF receipt can be attached to each payment record.

BEGIN;

ALTER TABLE inv_vendor_payments
    ADD COLUMN IF NOT EXISTS attachment_url       TEXT,
    ADD COLUMN IF NOT EXISTS attachment_filename  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS attachment_size_kb   INTEGER;

COMMENT ON COLUMN inv_vendor_payments.attachment_url
    IS 'Azure Blob Storage URL of the uploaded payment proof (screenshot / PDF)';
COMMENT ON COLUMN inv_vendor_payments.attachment_filename
    IS 'Original filename supplied by the user at upload time';
COMMENT ON COLUMN inv_vendor_payments.attachment_size_kb
    IS 'File size rounded to kilobytes, stored for display purposes';

COMMIT;
