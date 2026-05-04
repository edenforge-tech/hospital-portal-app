-- Migration 31: Add per-payment-method detail columns to inv_vendor_payments
-- Covers: NEFT/RTGS (UTR, bank details), Cheque (date, clearance), UPI (VPA, app), Cash (receipt, handler)

BEGIN;

ALTER TABLE inv_vendor_payments
    ADD COLUMN IF NOT EXISTS utr_number              VARCHAR(50),
    ADD COLUMN IF NOT EXISTS bank_name               VARCHAR(100),
    ADD COLUMN IF NOT EXISTS account_number          VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ifsc_code               VARCHAR(11),
    ADD COLUMN IF NOT EXISTS cheque_date             DATE,
    ADD COLUMN IF NOT EXISTS expected_clearance_date DATE,
    ADD COLUMN IF NOT EXISTS upi_id                  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS upi_app                 VARCHAR(30),
    ADD COLUMN IF NOT EXISTS cash_receipt_number     VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cash_received_by        VARCHAR(100);

COMMENT ON COLUMN inv_vendor_payments.utr_number              IS 'Unique Transaction Reference assigned by the bank (NEFT / RTGS)';
COMMENT ON COLUMN inv_vendor_payments.bank_name               IS 'Vendor bank name (NEFT / RTGS / Cheque)';
COMMENT ON COLUMN inv_vendor_payments.account_number          IS 'Vendor bank account number (NEFT / RTGS)';
COMMENT ON COLUMN inv_vendor_payments.ifsc_code               IS 'Vendor bank IFSC code, 11 characters (NEFT / RTGS)';
COMMENT ON COLUMN inv_vendor_payments.cheque_date             IS 'Date printed on the cheque';
COMMENT ON COLUMN inv_vendor_payments.expected_clearance_date IS 'Expected cheque clearance date (T+2 / T+3 working days)';
COMMENT ON COLUMN inv_vendor_payments.upi_id                  IS 'Vendor Virtual Payment Address / VPA e.g. vendor@hdfc (UPI)';
COMMENT ON COLUMN inv_vendor_payments.upi_app                 IS 'UPI app used: GPay | PhonePe | Paytm | BHIM | Bank App | Other';
COMMENT ON COLUMN inv_vendor_payments.cash_receipt_number     IS 'Voucher / receipt number for cash payment';
COMMENT ON COLUMN inv_vendor_payments.cash_received_by        IS 'Name of person who received / handled the cash';

COMMIT;
