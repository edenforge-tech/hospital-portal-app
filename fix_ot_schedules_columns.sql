-- Fix ot_schedules table: add missing columns required by EF model
-- Root cause: These columns exist in the C# OTSchedule entity and EF migrations
-- but were not applied to the actual database table.

BEGIN;

-- Audit columns
ALTER TABLE ot_schedules
    ADD COLUMN IF NOT EXISTS actual_duration_minutes INTEGER,
    ADD COLUMN IF NOT EXISTS complications TEXT,
    ADD COLUMN IF NOT EXISTS outcome VARCHAR(50),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS created_by_user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_by_user_id UUID,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Workflow columns (added in migration 73)
ALTER TABLE ot_schedules
    ADD COLUMN IF NOT EXISTS workflow_steps_completed INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS workflow_total_steps INTEGER NOT NULL DEFAULT 6,
    ADD COLUMN IF NOT EXISTS workflow_on_hold BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS workflow_hold_reason TEXT,
    ADD COLUMN IF NOT EXISTS workflow_last_updated_at TIMESTAMPTZ;

-- Enable RLS on ot_schedules (if not already enabled)
ALTER TABLE ot_schedules ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policy to ensure it works
DROP POLICY IF EXISTS tenant_isolation ON ot_schedules;
CREATE POLICY tenant_isolation ON ot_schedules
    FOR ALL USING (
        tenant_id::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.current_tenant_id', true) IS NULL
        OR current_setting('app.current_tenant_id', true) = ''
    );

-- Allow postgres superuser to bypass RLS
ALTER TABLE ot_schedules FORCE ROW LEVEL SECURITY;

COMMIT;

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ot_schedules'
ORDER BY ordinal_position;
