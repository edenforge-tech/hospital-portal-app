-- ============================================================================
-- Migration 68: OT Booking Validation — Stock & IOL Availability Columns
-- Purpose: Track IOL/consumable stock confirmation before surgery day.
-- Date: 2026-03
-- ============================================================================

BEGIN;

ALTER TABLE ot_booking_validations
    ADD COLUMN IF NOT EXISTS stock_check_status      VARCHAR(30)     NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS stock_confirmed_by      UUID,
    ADD COLUMN IF NOT EXISTS stock_confirmed_at      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS iol_model               VARCHAR(100),
    ADD COLUMN IF NOT EXISTS iol_power               DECIMAL(6, 2),
    ADD COLUMN IF NOT EXISTS iol_side                VARCHAR(5),     -- RE | LE | Both
    ADD COLUMN IF NOT EXISTS iol_catalog_id          UUID,           -- FK to iol_catalog (if available)
    ADD COLUMN IF NOT EXISTS stock_notes             TEXT;

-- Add CHECK constraint on new column
ALTER TABLE ot_booking_validations
    ADD CONSTRAINT ot_booking_validations_stock_status_check
    CHECK (stock_check_status IN ('Pending', 'Requested', 'Confirmed', 'Unavailable', 'NotRequired'));

-- Also add a column for pre-op instructions given (for Phase C post-surgery tracking)
ALTER TABLE ot_booking_validations
    ADD COLUMN IF NOT EXISTS preop_instructions_given      BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS preop_instructions_given_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS preop_instructions_given_by   UUID;

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_obv_stock_status
    ON ot_booking_validations(stock_check_status)
    WHERE stock_check_status IN ('Pending', 'Requested');

COMMENT ON COLUMN ot_booking_validations.stock_check_status IS
'Lifecycle of IOL/consumable stock verification: Pending → Requested → Confirmed/Unavailable';

COMMENT ON COLUMN ot_booking_validations.iol_model IS
'IOL model name (e.g. "AcrySof IQ SN60WF") confirmed for this surgery.';

COMMENT ON COLUMN ot_booking_validations.iol_power IS
'IOL power in diopters as confirmed by biometry/A-scan.';

COMMIT;
