-- Fix: Add 'Cancelled' to inv_grn_headers grn_status CHECK constraint
-- PostgreSQL does not support ALTER CONSTRAINT directly; must DROP and re-ADD.

ALTER TABLE inv_grn_headers
    DROP CONSTRAINT IF EXISTS inv_grn_headers_grn_status_check;

ALTER TABLE inv_grn_headers
    ADD CONSTRAINT inv_grn_headers_grn_status_check
    CHECK (grn_status IN ('Draft','PrimaryApproved','Approved','PartiallyAccepted','Rejected','Cancelled'));
