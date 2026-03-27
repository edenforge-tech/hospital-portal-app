-- =============================================================================
-- fix_counseling_missing_data.sql
-- Fixes missing EYE and SURGERY/PROCEDURE data in the counselling queue.
--
-- Problems addressed:
--   1. surgery_tentative_eye is NULL on all rows → nothing shows in the EYE column
--   2. recommended_surgery is NULL on API-seeded patients → SURGERY/PROCEDURE
--      column shows "—" and TYPE badge incorrectly shows "Procedure"
--   3. No session_category column → type was derived purely from null-check
--
-- Run once against Azure PostgreSQL (idempotent via IF NOT EXISTS / WHERE guards).
-- =============================================================================

-- ── Step 1: Add session_category column ─────────────────────────────────────
ALTER TABLE counseling_sessions
    ADD COLUMN IF NOT EXISTS session_category VARCHAR(20)
        CHECK (session_category IN ('Surgery', 'Procedure', 'Consultation'));

-- ── Step 2: Backfill surgery_tentative_eye ───────────────────────────────────
-- Laser / refractive surgeries default to BOTH eyes (BE)
UPDATE counseling_sessions
SET    surgery_tentative_eye = 'BE',
       updated_at = NOW()
WHERE  surgery_tentative_eye IS NULL
  AND  deleted_at IS NULL
  AND  recommended_surgery IS NOT NULL
  AND  LOWER(recommended_surgery) SIMILAR TO
       '%(lasik|smile|prk|refractive|icl|evo icl|femto lasik|contoura)%';

-- All other surgeries with a surgery name default to RIGHT eye (RE)
UPDATE counseling_sessions
SET    surgery_tentative_eye = 'RE',
       updated_at = NOW()
WHERE  surgery_tentative_eye IS NULL
  AND  deleted_at IS NULL
  AND  recommended_surgery IS NOT NULL;

-- ── Step 3: Backfill session_category ────────────────────────────────────────
UPDATE counseling_sessions
SET    session_category = 'Surgery',
       updated_at = NOW()
WHERE  session_category IS NULL
  AND  deleted_at IS NULL
  AND  recommended_surgery IS NOT NULL;

UPDATE counseling_sessions
SET    session_category = 'Consultation',
       updated_at = NOW()
WHERE  session_category IS NULL
  AND  deleted_at IS NULL
  AND  recommended_surgery IS NULL;

-- ── Step 4: Fix API-seeded patients (Ramesh Kumar, Priya Sharma, Ahmed Khan) ─
-- These rows were created by POST /api/seed/counselor-queue with no surgery data.
-- We patch them by joining through the patient table on MRN.

-- Ramesh Kumar (MRN001234) → Cataract Surgery, Right Eye
UPDATE counseling_sessions cs
SET    recommended_surgery    = 'Cataract Surgery (Phacoemulsification)',
       surgery_tentative_eye  = 'RE',
       session_category       = 'Surgery',
       updated_at             = NOW()
FROM   patient p
WHERE  cs.patient_id = p.id
  AND  p.medical_record_number = 'MRN001234'
  AND  cs.deleted_at IS NULL;

-- Priya Sharma (MRN001235) → LASIK, Both Eyes
UPDATE counseling_sessions cs
SET    recommended_surgery    = 'LASIK',
       surgery_tentative_eye  = 'BE',
       session_category       = 'Surgery',
       updated_at             = NOW()
FROM   patient p
WHERE  cs.patient_id = p.id
  AND  p.medical_record_number = 'MRN001235'
  AND  cs.deleted_at IS NULL;

-- Ahmed Khan (MRN001236) → Cataract Surgery, Right Eye
UPDATE counseling_sessions cs
SET    recommended_surgery    = 'Cataract Surgery (Phacoemulsification)',
       surgery_tentative_eye  = 'RE',
       session_category       = 'Surgery',
       updated_at             = NOW()
FROM   patient p
WHERE  cs.patient_id = p.id
  AND  p.medical_record_number = 'MRN001236'
  AND  cs.deleted_at IS NULL;

-- ── Step 5: Verification queries ─────────────────────────────────────────────
SELECT
    p.medical_record_number                          AS mrn,
    p.first_name || ' ' || p.last_name               AS patient_name,
    cs.recommended_surgery,
    cs.surgery_tentative_eye                         AS eye,
    cs.session_category                              AS category
FROM counseling_sessions cs
JOIN patient p ON cs.patient_id = p.id
WHERE cs.deleted_at IS NULL
ORDER BY cs.created_at DESC
LIMIT 30;
