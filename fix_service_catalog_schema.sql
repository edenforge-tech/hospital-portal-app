-- ============================================================
-- FIX: Service Catalog Schema Gaps
-- Fixes "Unable to load procedures" and "No imaging items available"
-- Root causes:
--   1. service_variants is missing sub_options TEXT[] column
--   2. variant_prices table does not exist (code expects it; SQL created branch_variant_pricing)
--   3. iol_prices table does not exist
-- Run this ONCE against the Azure PostgreSQL database.
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 1. Add sub_options column to service_variants (if missing)
-- ────────────────────────────────────────────────────────────
ALTER TABLE service_variants
    ADD COLUMN IF NOT EXISTS sub_options TEXT[];

-- ────────────────────────────────────────────────────────────
-- 2. Create variant_prices table (normalised global + branch pricing)
--    This is what the backend entity (VariantPrice) maps to.
--    The existing branch_variant_pricing table is separate and unused by the catalog service.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS variant_prices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id          UUID          NOT NULL REFERENCES service_variants(id) ON DELETE CASCADE,
    branch_id           UUID,                         -- NULL = global tariff
    amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from      DATE,
    effective_to        DATE,                         -- NULL = currently active
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)   NOT NULL DEFAULT 'active',
    UNIQUE (variant_id, branch_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_variant_prices_variant_id         ON variant_prices(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_prices_branch_variant_eto ON variant_prices(variant_id, branch_id, effective_to);

-- ────────────────────────────────────────────────────────────
-- 3. Seed global variant prices from service_variants.default_price
--    (only inserts rows that don't already exist)
-- ────────────────────────────────────────────────────────────
INSERT INTO variant_prices (variant_id, branch_id, amount, is_active)
SELECT sv.id, NULL, sv.default_price, TRUE
FROM   service_variants sv
WHERE  sv.is_active = TRUE
  AND  sv.deleted_at IS NULL
  AND  sv.default_price > 0
  AND  NOT EXISTS (
    SELECT 1 FROM variant_prices vp
    WHERE  vp.variant_id = sv.id AND vp.branch_id IS NULL AND vp.effective_to IS NULL
  );

-- ────────────────────────────────────────────────────────────
-- 4. Create iol_prices table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS iol_prices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iol_master_id       UUID          NOT NULL REFERENCES iol_master(id) ON DELETE CASCADE,
    branch_id           UUID,                         -- NULL = global tariff
    amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    effective_from      DATE,
    effective_to        DATE,                         -- NULL = currently active
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)   NOT NULL DEFAULT 'active',
    UNIQUE (iol_master_id, branch_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_iol_prices_iol_master_id      ON iol_prices(iol_master_id);
CREATE INDEX IF NOT EXISTS idx_iol_prices_master_branch_eto  ON iol_prices(iol_master_id, branch_id, effective_to);

-- ────────────────────────────────────────────────────────────
-- 5. Seed global IOL prices from iol_master.default_price
-- ────────────────────────────────────────────────────────────
INSERT INTO iol_prices (iol_master_id, branch_id, amount, is_active)
SELECT im.id, NULL, im.default_price, TRUE
FROM   iol_master im
WHERE  im.is_active = TRUE
  AND  im.deleted_at IS NULL
  AND  im.default_price > 0
  AND  NOT EXISTS (
    SELECT 1 FROM iol_prices ip
    WHERE  ip.iol_master_id = im.id AND ip.branch_id IS NULL AND ip.effective_to IS NULL
  );

COMMIT;

-- Verification queries (run manually to confirm):
-- SELECT COUNT(*) FROM variant_prices;     -- should be > 0
-- SELECT COUNT(*) FROM iol_prices;         -- should be > 0
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'service_variants' AND column_name = 'sub_options';
