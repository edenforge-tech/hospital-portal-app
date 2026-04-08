-- ============================================================================
-- Migration 93: Seed Ward Data
-- Purpose: Insert standard ward types for every branch in the database.
--          Each branch gets 4 wards: General, Surgical, DayCare, Recovery.
--          Idempotent: skips branches that already have at least one ward row.
-- Dependencies: ward table (migration 80), branch table
-- Date: 2026-03
-- ============================================================================

BEGIN;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT b.id AS branch_id, b.tenant_id
        FROM branch b
        WHERE b.deleted_at IS NULL
    LOOP
        -- Skip if this branch already has any ward rows
        IF EXISTS (
            SELECT 1 FROM ward WHERE branch_id = r.branch_id AND deleted_at IS NULL
        ) THEN
            CONTINUE;
        END IF;

        INSERT INTO ward (id, tenant_id, branch_id, ward_name, ward_type, floor, total_beds, is_active, status, created_at, updated_at)
        VALUES
            (gen_random_uuid(), r.tenant_id, r.branch_id, 'General Ward',   'General',  1, 20, TRUE, 'active', NOW(), NOW()),
            (gen_random_uuid(), r.tenant_id, r.branch_id, 'Surgical Ward',  'Surgical', 2, 10, TRUE, 'active', NOW(), NOW()),
            (gen_random_uuid(), r.tenant_id, r.branch_id, 'Day Care Ward',  'DayCare',  1,  8, TRUE, 'active', NOW(), NOW()),
            (gen_random_uuid(), r.tenant_id, r.branch_id, 'Recovery Ward',  'Recovery', 2,  6, TRUE, 'active', NOW(), NOW());
    END LOOP;
END $$;

COMMIT;
