-- ============================================================================
-- Migration 80: Ward Master + bed_inventory FK
-- Purpose: Create ward master table and link existing bed_inventory to it
-- Dependencies: tenant, branch tables
-- Date: 2026-03
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Ward master table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ward (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenant(id),
    branch_id           UUID NOT NULL REFERENCES branch(id),
    ward_name           VARCHAR(200) NOT NULL,
    ward_type           VARCHAR(30) NOT NULL
                            CHECK (ward_type IN ('General','ICU','Surgical','Recovery','DayCare','Emergency')),
    floor               INTEGER,
    total_beds          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    -- Standard audit columns
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID REFERENCES users(id),
    updated_by_user_id  UUID REFERENCES users(id),
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','inactive','archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ward_tenant      ON ward(tenant_id)           WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ward_branch      ON ward(branch_id)           WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ward_type_active ON ward(ward_type, is_active) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE ward ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ward;
CREATE POLICY tenant_isolation ON ward
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Link bed_inventory to ward (additive — existing data unaffected)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bed_inventory' AND column_name = 'ward_id'
    ) THEN
        ALTER TABLE bed_inventory ADD COLUMN ward_id UUID REFERENCES ward(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bed_inventory_ward ON bed_inventory(ward_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE ward IS 'Ward master — physical ward units within a branch. bed_inventory rows link here via ward_id.';
COMMENT ON COLUMN bed_inventory.ward_id IS 'FK to ward master; nullable for legacy beds created before this migration.';

COMMIT;
