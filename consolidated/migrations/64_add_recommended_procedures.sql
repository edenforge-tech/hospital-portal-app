-- ============================================================================
-- Migration 64: Add recommended_procedures JSONB column to counseling_sessions
-- Purpose: Support multi-procedure per-eye selection in counselor workflow
-- Date: 2026-03
-- ============================================================================

-- Add the new JSONB column (keeps legacy varchar columns for backward compatibility)
ALTER TABLE counseling_sessions
    ADD COLUMN IF NOT EXISTS recommended_procedures JSONB;

-- GIN index for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_procedures
    ON counseling_sessions USING GIN (recommended_procedures);

-- Document the schema
COMMENT ON COLUMN counseling_sessions.recommended_procedures IS
'JSON array of per-eye procedure items. Each item:
 {
   "eye": "RE" | "LE" | "Both",
   "surgeryTypeId": "<uuid>",
   "surgeryName": "<string>",
   "surgeryCategory": "<string>",
   "requiresIol": <bool>,
   "iclProcedure": <bool>,
   "laserProcedure": <bool>,
   "kcnTreatmentType": "<string | null>",
   "iolCatalogId": "<uuid | null>",
   "iolModelName": "<string | null>",
   "iolType": "<string | null>",
   "packageId": "<uuid | null>",
   "packageName": "<string | null>",
   "unitPrice": <number | null>,
   "notes": "<string | null>"
 }';
