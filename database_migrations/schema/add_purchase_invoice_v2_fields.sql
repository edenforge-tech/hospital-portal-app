-- Migration: Add extended fields to inv_purchase_invoices
-- Required by GRN workflow v2 (invoice type, payment, credit, category)

ALTER TABLE inv_purchase_invoices
    ADD COLUMN IF NOT EXISTS invoice_type      VARCHAR(20),
    ADD COLUMN IF NOT EXISTS payment_mode      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS credit_period     INTEGER,
    ADD COLUMN IF NOT EXISTS due_date          TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reference         VARCHAR(200),
    ADD COLUMN IF NOT EXISTS purchase_category VARCHAR(100);

COMMENT ON COLUMN inv_purchase_invoices.invoice_type      IS 'Invoice | Packing Slip';
COMMENT ON COLUMN inv_purchase_invoices.payment_mode      IS 'Cash | Credit | UPI | NEFT | RTGS | Cheque';
COMMENT ON COLUMN inv_purchase_invoices.credit_period     IS 'Credit period in days';
COMMENT ON COLUMN inv_purchase_invoices.due_date          IS 'Payment due date (auto-calculated from credit_period)';
COMMENT ON COLUMN inv_purchase_invoices.reference         IS 'PO number or other reference';
COMMENT ON COLUMN inv_purchase_invoices.purchase_category IS 'Pharmacy | Surgical | Optical | Laboratory | Stationery | General Hospital';
