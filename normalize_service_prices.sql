-- ============================================================================
-- NORMALIZE SERVICE PRICES — Database Migration
-- Purpose:
--   1. Extract pricing out of service_variants and iol_master into dedicated
--      variant_prices and iol_prices tables that support price history via
--      effective_from / effective_to dates.
--   2. Absorb branch_variant_pricing rows into variant_prices (branch_id != NULL).
--   3. Drop the now-redundant default_price columns and branch_variant_pricing table.
--
-- Run against: Azure PostgreSQL — hospitalportal database
-- Idempotent:  Uses IF NOT EXISTS / ON CONFLICT DO NOTHING throughout.
-- Prerequisites: service_variants, iol_master, branch_variant_pricing must exist.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. variant_prices
--    One row = one price for a variant.
--    branch_id NULL  → global tariff (clinic-wide default)
--    branch_id ≠ NULL → branch-specific override (replaces branch_variant_pricing)
--    effective_to NULL → currently active price
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS variant_prices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID NOT NULL REFERENCES service_variants(id),
    branch_id           UUID,                       -- NULL = global; FK to branch omitted deliberately
                                                    -- (branch is in auth-service schema; catalog is global)
    amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from      DATE,                       -- NULL = no start limit
    effective_to        DATE,                       -- NULL = currently active / no end limit
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_vp_variant_id    ON variant_prices (variant_id);
CREATE INDEX IF NOT EXISTS idx_vp_lookup        ON variant_prices (variant_id, branch_id, effective_to)
    WHERE deleted_at IS NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. iol_prices
--    Same shape as variant_prices but scoped to an IOL lens model.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS iol_prices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iol_master_id       UUID NOT NULL REFERENCES iol_master(id),
    branch_id           UUID,                       -- NULL = global
    amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from      DATE,
    effective_to        DATE,                       -- NULL = currently active
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_ip_iol_master_id ON iol_prices (iol_master_id);
CREATE INDEX IF NOT EXISTS idx_ip_lookup        ON iol_prices (iol_master_id, branch_id, effective_to)
    WHERE deleted_at IS NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Migrate service_variants.default_price → variant_prices (global tariff rows)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO variant_prices (id, variant_id, branch_id, amount, is_active, created_at, updated_at, status)
SELECT
    gen_random_uuid(),
    id,
    NULL,               -- global
    default_price,
    TRUE,
    NOW(),
    NOW(),
    'active'
FROM service_variants
WHERE default_price IS NOT NULL
  AND default_price >= 0
  AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Migrate branch_variant_pricing → variant_prices (branch-specific overrides)
--    Only runs if branch_variant_pricing still exists.
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_variant_pricing') THEN
        INSERT INTO variant_prices (id, variant_id, branch_id, amount, effective_from, effective_to, is_active, created_at, updated_at, status)
        SELECT
            gen_random_uuid(),
            variant_id,
            branch_id,
            COALESCE(override_price, 0),
            effective_from,
            effective_to,
            is_active,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW()),
            COALESCE(status, 'active')
        FROM branch_variant_pricing
        WHERE override_price IS NOT NULL
          AND deleted_at IS NULL
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'branch_variant_pricing rows migrated to variant_prices.';
    ELSE
        RAISE NOTICE 'branch_variant_pricing table not found — skipping step 4.';
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Migrate iol_master.default_price → iol_prices (global tariff rows)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO iol_prices (id, iol_master_id, branch_id, amount, is_active, created_at, updated_at, status)
SELECT
    gen_random_uuid(),
    id,
    NULL,               -- global
    default_price,
    TRUE,
    NOW(),
    NOW(),
    'active'
FROM iol_master
WHERE default_price IS NOT NULL
  AND default_price >= 0
  AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Drop now-redundant default_price columns
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE service_variants DROP COLUMN IF EXISTS default_price;
ALTER TABLE iol_master        DROP COLUMN IF EXISTS default_price;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Drop branch_variant_pricing (data is now in variant_prices)
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_variant_pricing') THEN
        DROP TABLE branch_variant_pricing;
        RAISE NOTICE 'branch_variant_pricing dropped.';
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Verification queries (uncomment to inspect after migration)
-- ────────────────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) AS variant_price_rows FROM variant_prices;
-- SELECT COUNT(*) AS iol_price_rows      FROM iol_prices;
-- SELECT variant_id, COUNT(*) FROM variant_prices WHERE branch_id IS NULL GROUP BY variant_id LIMIT 5;

COMMIT;
