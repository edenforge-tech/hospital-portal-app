-- =============================================================================
-- seed_finalize_surgery_data.sql
-- Backfills missing data for the Finalize Surgery module:
--   1. Heals null uhid / patient_name in ot_finalize_schedule
--   2. Seeds OT theaters for tenant/branch pairs that have none
--   3. Marks referring doctors as user_type='Doctor' so the Surgeon dropdown works
-- Run once against Azure PostgreSQL (idempotent - safe to re-run)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Backfill uhid on existing ot_finalize_schedule rows from patient table
-- -----------------------------------------------------------------------------
UPDATE ot_finalize_schedule ofs
SET    uhid       = COALESCE(p.health_id, p.medical_record_number),
       updated_at = NOW()
FROM   patient p
WHERE  ofs.patient_id = p.id
  AND  ofs.deleted_at IS NULL
  AND  (ofs.uhid IS NULL OR ofs.uhid = '');

-- -----------------------------------------------------------------------------
-- 2. Backfill patient_name on existing ot_finalize_schedule rows
-- -----------------------------------------------------------------------------
UPDATE ot_finalize_schedule ofs
SET    patient_name = TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')),
       updated_at   = NOW()
FROM   patient p
WHERE  ofs.patient_id = p.id
  AND  ofs.deleted_at IS NULL
  AND  (ofs.patient_name IS NULL OR ofs.patient_name = '');

-- -----------------------------------------------------------------------------
-- 3. Seed 'OT - 1' theater for every (tenant, branch) pair that has no theaters
-- -----------------------------------------------------------------------------
INSERT INTO ot_theaters (
    id, tenant_id, branch_id,
    theater_name, theater_code,
    max_surgeries_per_day, standard_surgery_duration_minutes,
    cleaning_time_between_surgeries_minutes,
    operation_start_time, operation_end_time,
    is_active, is_operational, maintenance_mode,
    created_at, updated_at
)
SELECT
    gen_random_uuid(),
    t.id,
    b.id,
    'OT - 1', 'OT1',
    10, 45, 15,
    '08:00:00'::time, '18:00:00'::time,
    TRUE, TRUE, FALSE,
    NOW(), NOW()
FROM   tenant t
JOIN   branch b ON b.tenant_id = t.id AND b.deleted_at IS NULL
WHERE  t.deleted_at IS NULL
  AND  NOT EXISTS (
           SELECT 1 FROM ot_theaters x
           WHERE  x.tenant_id  = t.id
             AND  x.branch_id  = b.id
             AND  x.deleted_at IS NULL
       );

-- -----------------------------------------------------------------------------
-- 4. Seed 'OT - 2' theater for same pairs (only if OT-2 doesn't already exist)
-- -----------------------------------------------------------------------------
INSERT INTO ot_theaters (
    id, tenant_id, branch_id,
    theater_name, theater_code,
    max_surgeries_per_day, standard_surgery_duration_minutes,
    cleaning_time_between_surgeries_minutes,
    operation_start_time, operation_end_time,
    is_active, is_operational, maintenance_mode,
    created_at, updated_at
)
SELECT
    gen_random_uuid(),
    t.id,
    b.id,
    'OT - 2', 'OT2',
    10, 45, 15,
    '08:00:00'::time, '18:00:00'::time,
    TRUE, TRUE, FALSE,
    NOW(), NOW()
FROM   tenant t
JOIN   branch b ON b.tenant_id = t.id AND b.deleted_at IS NULL
WHERE  t.deleted_at IS NULL
  AND  NOT EXISTS (
           SELECT 1 FROM ot_theaters x
           WHERE  x.tenant_id   = t.id
             AND  x.theater_name = 'OT - 2'
             AND  x.deleted_at   IS NULL
       );

-- -----------------------------------------------------------------------------
-- 5. Seed 'Minor OT' for same pairs
-- -----------------------------------------------------------------------------
INSERT INTO ot_theaters (
    id, tenant_id, branch_id,
    theater_name, theater_code,
    max_surgeries_per_day, standard_surgery_duration_minutes,
    cleaning_time_between_surgeries_minutes,
    operation_start_time, operation_end_time,
    is_active, is_operational, maintenance_mode,
    created_at, updated_at
)
SELECT
    gen_random_uuid(),
    t.id,
    b.id,
    'Minor OT', 'MINOR',
    6, 30, 10,
    '08:00:00'::time, '16:00:00'::time,
    TRUE, TRUE, FALSE,
    NOW(), NOW()
FROM   tenant t
JOIN   branch b ON b.tenant_id = t.id AND b.deleted_at IS NULL
WHERE  t.deleted_at IS NULL
  AND  NOT EXISTS (
           SELECT 1 FROM ot_theaters x
           WHERE  x.tenant_id   = t.id
             AND  x.theater_name = 'Minor OT'
             AND  x.deleted_at   IS NULL
       );

-- -----------------------------------------------------------------------------
-- 6. Mark users referenced as referring doctors as user_type='Doctor'
--    so GET /api/users/surgeons returns them in the dropdown
-- -----------------------------------------------------------------------------
UPDATE "AspNetUsers"
SET    user_type  = 'Doctor',
       updated_at = NOW()
WHERE  id IN (
           SELECT DISTINCT referred_by_doctor_id
           FROM   counseling_session
           WHERE  referred_by_doctor_id IS NOT NULL
       )
  AND  (user_type IS NULL OR user_type = '');

-- -----------------------------------------------------------------------------
-- Verification queries (uncomment to check results)
-- -----------------------------------------------------------------------------
-- SELECT COUNT(*) AS theaters_seeded  FROM ot_theaters WHERE deleted_at IS NULL;
-- SELECT COUNT(*) AS doctors_marked   FROM "AspNetUsers" WHERE user_type = 'Doctor';
-- SELECT id, uhid, patient_name, status FROM ot_finalize_schedule WHERE deleted_at IS NULL LIMIT 10;
