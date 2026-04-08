-- ============================================================================
-- Migration 96: Post-Op Workflow Fixes
-- Purpose:
--   1. Add missing columns to discharge_summary (required by backend DTO/service)
--   2. Update existing nurse/surgeon checklist items to eye-surgery-specific labels
-- Date: 2026-04-05
-- ============================================================================

BEGIN;

-- ── 1. Discharge Summary — add missing columns ────────────────────────────────
-- The backend DischargeSummaryDto/SaveDischargeSummaryRequest references these
-- fields, but migration 85 used different column names (condition_at_discharge,
-- diagnosis_codes, procedures_performed). Add the text columns the service
-- actually maps to.

ALTER TABLE discharge_summary
    ADD COLUMN IF NOT EXISTS hospital_course          TEXT,
    ADD COLUMN IF NOT EXISTS discharge_instructions   TEXT,
    ADD COLUMN IF NOT EXISTS medications_on_discharge TEXT,
    ADD COLUMN IF NOT EXISTS follow_up_plan           TEXT;

-- ── 2. Update existing nurse checklist items → eye-surgery labels ─────────────
-- Matches the new DefaultNurseItems array in PostOpWorkflowService.cs.
-- Uses item_order to identify each row so labels are updated precisely.

UPDATE nurse_checklist_items
SET item_label = CASE item_order
    WHEN 1 THEN 'Eye Pad / Shield in Place'
    WHEN 2 THEN 'Intra-Ocular Pressure (IOP) Checked'
    WHEN 3 THEN 'Post-Op Eye Drops: First Dose Given'
    WHEN 4 THEN 'Pain Level Assessed'
    WHEN 5 THEN 'Vital Signs Stable'
    WHEN 6 THEN 'Patient & Family Education: Eye Shield & Drops'
    WHEN 7 THEN 'Light Perception Confirmed'
    ELSE item_label
END,
updated_at = NOW()
WHERE item_order BETWEEN 1 AND 7
  AND deleted_at IS NULL;

-- ── 3. Update existing surgeon checklist items → eye-surgery labels ───────────

UPDATE surgeon_checklist_items
SET item_label = CASE item_order
    WHEN 1 THEN 'Operative Note Signed'
    WHEN 2 THEN 'IOL Power Confirmed'
    WHEN 3 THEN 'Eye Drop Prescription Written'
    WHEN 4 THEN 'Follow-up Appointment Scheduled'
    WHEN 5 THEN 'Discharge Orders Signed'
    ELSE item_label
END,
updated_at = NOW()
WHERE item_order BETWEEN 1 AND 5
  AND deleted_at IS NULL;

COMMIT;
