-- Migration: add_vendor_payment_unique_reference
-- Purpose: Prevent duplicate payment references within the same tenant
-- Safe: partial index excludes soft-deleted rows; CONCURRENTLY avoids table lock
-- Run: once, after any existing duplicate references have been resolved

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uix_vendor_payments_tenant_reference
    ON inv_vendor_payments (tenant_id, payment_reference)
    WHERE deleted_at IS NULL;
