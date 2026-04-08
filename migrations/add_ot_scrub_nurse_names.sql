-- Migration: add scrub_nurse_names column to patient_journey
-- This supports storing multiple scrub nurses as a comma-separated string.
-- Run once against the IP Management database (same DB as patient_journey table).

ALTER TABLE patient_journey
  ADD COLUMN IF NOT EXISTS scrub_nurse_names TEXT;
