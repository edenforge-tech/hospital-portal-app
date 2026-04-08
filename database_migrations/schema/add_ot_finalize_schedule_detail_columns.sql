-- ============================================================
-- Migration: Add detail columns to ot_finalize_schedule
-- Purpose : Support full OT finalize modal (anesthesia,
--           reporting time, IOL power, remarks, cancel reason,
--           package name/rate)
-- ============================================================

ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS reporting_time  TIME;
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS anesthesia_type VARCHAR(100);
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS anesthetist_name VARCHAR(200);
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS iol_power       VARCHAR(50);
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS remarks         TEXT;
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS cancel_reason   TEXT;
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS package_name    VARCHAR(300);
ALTER TABLE ot_finalize_schedule ADD COLUMN IF NOT EXISTS package_rate    NUMERIC(12,2);
