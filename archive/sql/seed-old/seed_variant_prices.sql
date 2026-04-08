-- seed_variant_prices.sql
-- Populate variant_prices with global (branch=NULL) rows for every service_variant
-- that has a default_price but no existing global variant_prices entry.
-- Safe to re-run (ON CONFLICT DO NOTHING + WHERE NOT IN guard).
-- NOTE: Do NOT run normalize_service_prices.sql after this — it drops default_price.

INSERT INTO variant_prices (id, variant_id, branch_id, amount, is_active, created_at, updated_at, status)
SELECT
    gen_random_uuid(),
    sv.id,
    NULL,           -- global price (no branch scope)
    sv.default_price,
    TRUE,
    NOW(),
    NOW(),
    'active'
FROM service_variants sv
WHERE sv.default_price IS NOT NULL
  AND sv.default_price > 0
  AND sv.deleted_at IS NULL
  AND sv.id NOT IN (
      SELECT variant_id
      FROM variant_prices
      WHERE branch_id IS NULL
        AND deleted_at IS NULL
  )
ON CONFLICT DO NOTHING;

-- Verification: show count of inserted rows and a sample
SELECT
    sv.variant_name,
    sv.variant_code,
    vp.amount,
    vp.branch_id,
    vp.is_active
FROM variant_prices vp
JOIN service_variants sv ON sv.id = vp.variant_id
WHERE vp.branch_id IS NULL
  AND vp.deleted_at IS NULL
ORDER BY sv.variant_code
LIMIT 30;
