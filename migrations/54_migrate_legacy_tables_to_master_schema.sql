-- Migration 54: Migrate legacy lookup tables into master.master_value
-- and create backward-compatible views in the public schema.
--
-- Tables migrated (data COPIED — originals kept for safety):
--   public.surgery_types        → clinical.surgery_type
--   public.anesthesia_types     → clinical.anesthesia_type
--   public.iol_catalog_master   → clinical.iol_catalog
--   public.insurance_providers  → insurance.provider
--   public.tpa_providers        → insurance.tpa_provider
--   public.government_schemes   → insurance.govt_scheme
--
-- public.ward is EXCLUDED: it is operational data (branch/floor/beds),
-- not a catalog lookup table.
--
-- Idempotent: ON CONFLICT (tenant_id, entity_type, code) DO NOTHING.
-- Safe to re-run.

SET search_path = public, master;

-- ─── 1. surgery_types ────────────────────────────────────────────────────────

INSERT INTO master.master_value (
    id, tenant_id, group_key, entity_type,
    code, label, description, metadata,
    sort_order, is_active, is_system_locked,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at
)
SELECT
    gen_random_uuid(),
    st.tenant_id,
    'Clinical',
    'clinical.surgery_type',
    st.surgery_code,
    st.surgery_name,
    st.description,
    jsonb_strip_nulls(jsonb_build_object(
        'surgery_category',         st.surgery_category,
        'procedure_type',           st.procedure_type,
        'typical_duration_minutes', st.typical_duration_minutes,
        'requires_admission',       st.requires_admission,
        'typical_admission_type',   st.typical_admission_type,
        'estimated_cost_min',       st.estimated_cost_min,
        'estimated_cost_max',       st.estimated_cost_max
    )),
    COALESCE(st.display_order, 0),
    st.is_active,
    false,          -- not system-locked; tenant may modify
    st.created_at,
    st.updated_at,
    st.created_by_user_id,
    st.updated_by_user_id,
    st.deleted_at
FROM public.surgery_types st
ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

-- ─── 2. anesthesia_types ─────────────────────────────────────────────────────

INSERT INTO master.master_value (
    id, tenant_id, group_key, entity_type,
    code, label, description, metadata,
    sort_order, is_active, is_system_locked,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at
)
SELECT
    gen_random_uuid(),
    at2.tenant_id,
    'Clinical',
    'clinical.anesthesia_type',
    at2.anesthesia_code,
    at2.anesthesia_name,
    at2.description,
    jsonb_strip_nulls(jsonb_build_object(
        'anesthesia_category',      at2.anesthesia_category,
        'typical_duration_minutes', at2.typical_duration_minutes,
        'recovery_time_minutes',    at2.recovery_time_minutes,
        'additional_cost',          at2.additional_cost,
        'contraindications',        at2.contraindications,
        'special_requirements',     at2.special_requirements
    )),
    COALESCE(at2.display_order, 0),
    at2.is_active,
    false,
    at2.created_at,
    at2.updated_at,
    at2.created_by_user_id,
    at2.updated_by_user_id,
    at2.deleted_at
FROM public.anesthesia_types at2
ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

-- ─── 3. iol_catalog_master ───────────────────────────────────────────────────

INSERT INTO master.master_value (
    id, tenant_id, group_key, entity_type,
    code, label, description, metadata,
    sort_order, is_active, is_system_locked,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at
)
SELECT
    gen_random_uuid(),
    ic.tenant_id,
    'Clinical',
    'clinical.iol_catalog',
    -- product_code may be null; fall back to a slug from model_name
    COALESCE(
        NULLIF(TRIM(ic.product_code), ''),
        UPPER(REGEXP_REPLACE(ic.model_name, '[^A-Za-z0-9]', '_', 'g'))
    ),
    ic.model_name,
    ic.description,
    jsonb_strip_nulls(jsonb_build_object(
        'brand_manufacturer', ic.brand_manufacturer,
        'iol_type',           ic.iol_type,
        'lens_category',      ic.lens_category,
        'material',           ic.material,
        'origin',             ic.origin,
        'power_range_min',    ic.power_range_min,
        'power_range_max',    ic.power_range_max,
        'power_increment',    ic.power_increment,
        'a_constant',         ic.a_constant,
        'distance_range',     ic.distance_range,
        'default_price',      ic.default_price,
        'currency_code',      ic.currency_code,
        'shelf_life_months',  ic.shelf_life_months,
        'is_featured',        ic.is_featured
    )),
    COALESCE(ic.display_order, 0),
    ic.is_active,
    false,
    ic.created_at,
    ic.updated_at,
    ic.created_by_user_id,
    ic.updated_by_user_id,
    NULL  -- iol_catalog_master has no deleted_at column
FROM public.iol_catalog_master ic
ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

-- ─── 4. insurance_providers ──────────────────────────────────────────────────

INSERT INTO master.master_value (
    id, tenant_id, group_key, entity_type,
    code, label, description, metadata,
    sort_order, is_active, is_system_locked,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at
)
SELECT
    gen_random_uuid(),
    ip2.tenant_id,
    'Insurance',
    'insurance.provider',
    ip2.provider_code,
    ip2.provider_name,
    NULL,
    jsonb_strip_nulls(jsonb_build_object(
        'provider_type',  ip2.provider_type,
        'contact_number', ip2.contact_number,
        'contact_email',  ip2.contact_email,
        'website_url',    ip2.website_url
    )),
    COALESCE(ip2.display_order, 0),
    ip2.is_active,
    false,
    ip2.created_at,
    ip2.updated_at,
    ip2.created_by_user_id,
    ip2.updated_by_user_id,
    ip2.deleted_at
FROM public.insurance_providers ip2
ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

-- ─── 5. tpa_providers ────────────────────────────────────────────────────────

INSERT INTO master.master_value (
    id, tenant_id, group_key, entity_type,
    code, label, description, metadata,
    sort_order, is_active, is_system_locked,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at
)
SELECT
    gen_random_uuid(),
    tp.tenant_id,
    'Insurance',
    'insurance.tpa_provider',
    tp.tpa_code,
    tp.tpa_name,
    NULL,
    jsonb_strip_nulls(jsonb_build_object(
        'contact_number',  tp.contact_number,
        'contact_email',   tp.contact_email,
        'website_url',     tp.website_url,
        'helpline_number', tp.helpline_number
    )),
    COALESCE(tp.display_order, 0),
    tp.is_active,
    false,
    tp.created_at,
    tp.updated_at,
    tp.created_by_user_id,
    tp.updated_by_user_id,
    tp.deleted_at
FROM public.tpa_providers tp
ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

-- ─── 6. government_schemes ───────────────────────────────────────────────────

INSERT INTO master.master_value (
    id, tenant_id, group_key, entity_type,
    code, label, description, metadata,
    sort_order, is_active, is_system_locked,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at
)
SELECT
    gen_random_uuid(),
    gs.tenant_id,
    'Insurance',
    'insurance.govt_scheme',
    gs.scheme_code,
    gs.scheme_name,
    gs.scheme_description,
    jsonb_strip_nulls(jsonb_build_object(
        'scheme_type',           gs.scheme_type,
        'implementing_authority',gs.implementing_authority,
        'max_coverage_amount',   gs.max_coverage_amount,
        'helpline_number',       gs.helpline_number,
        'effective_from',        gs.effective_from,
        'effective_until',       gs.effective_until
    )),
    COALESCE(gs.display_order, 0),
    gs.is_active,
    false,
    gs.created_at,
    gs.updated_at,
    gs.created_by_user_id,
    gs.updated_by_user_id,
    gs.deleted_at
FROM public.government_schemes gs
ON CONFLICT (tenant_id, entity_type, code) DO NOTHING;

-- ─── 7. Backward-compatible views ────────────────────────────────────────────
-- These views let any existing SQL that references the legacy table names
-- continue to work as read-only lookups.

CREATE OR REPLACE VIEW public.surgery_types_view AS
SELECT
    mv.id,
    mv.tenant_id,
    mv.label                                    AS surgery_name,
    mv.code                                     AS surgery_code,
    mv.metadata->>'surgery_category'            AS surgery_category,
    mv.metadata->>'procedure_type'              AS procedure_type,
    (mv.metadata->>'typical_duration_minutes')::int AS typical_duration_minutes,
    (mv.metadata->>'requires_admission')::bool  AS requires_admission,
    mv.metadata->>'typical_admission_type'      AS typical_admission_type,
    (mv.metadata->>'estimated_cost_min')::numeric AS estimated_cost_min,
    (mv.metadata->>'estimated_cost_max')::numeric AS estimated_cost_max,
    mv.description,
    mv.sort_order                               AS display_order,
    mv.is_active,
    mv.created_at,
    mv.updated_at,
    mv.created_by_user_id,
    mv.updated_by_user_id,
    mv.deleted_at
FROM master.master_value mv
WHERE mv.entity_type = 'clinical.surgery_type'
  AND mv.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.anesthesia_types_view AS
SELECT
    mv.id,
    mv.tenant_id,
    mv.label                                       AS anesthesia_name,
    mv.code                                        AS anesthesia_code,
    mv.metadata->>'anesthesia_category'            AS anesthesia_category,
    (mv.metadata->>'typical_duration_minutes')::int AS typical_duration_minutes,
    (mv.metadata->>'recovery_time_minutes')::int   AS recovery_time_minutes,
    (mv.metadata->>'additional_cost')::numeric      AS additional_cost,
    mv.metadata->>'contraindications'              AS contraindications,
    mv.metadata->>'special_requirements'           AS special_requirements,
    mv.description,
    mv.sort_order                                  AS display_order,
    mv.is_active,
    mv.created_at,
    mv.updated_at,
    mv.created_by_user_id,
    mv.updated_by_user_id,
    mv.deleted_at
FROM master.master_value mv
WHERE mv.entity_type = 'clinical.anesthesia_type'
  AND mv.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.iol_catalog_view AS
SELECT
    mv.id,
    mv.tenant_id,
    mv.label                                      AS model_name,
    mv.code                                       AS product_code,
    mv.metadata->>'brand_manufacturer'            AS brand_manufacturer,
    mv.metadata->>'iol_type'                      AS iol_type,
    mv.metadata->>'lens_category'                 AS lens_category,
    mv.metadata->>'material'                      AS material,
    mv.metadata->>'origin'                        AS origin,
    (mv.metadata->>'power_range_min')::numeric    AS power_range_min,
    (mv.metadata->>'power_range_max')::numeric    AS power_range_max,
    (mv.metadata->>'power_increment')::numeric    AS power_increment,
    mv.metadata->>'distance_range'                AS distance_range,
    (mv.metadata->>'a_constant')::numeric         AS a_constant,
    (mv.metadata->>'default_price')::numeric      AS default_price,
    mv.metadata->>'currency_code'                 AS currency_code,
    (mv.metadata->>'shelf_life_months')::int      AS shelf_life_months,
    (mv.metadata->>'is_featured')::bool           AS is_featured,
    mv.description,
    mv.sort_order                                 AS display_order,
    mv.is_active,
    mv.created_at,
    mv.updated_at,
    mv.created_by_user_id,
    mv.updated_by_user_id
FROM master.master_value mv
WHERE mv.entity_type = 'clinical.iol_catalog'
  AND mv.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.insurance_providers_view AS
SELECT
    mv.id,
    mv.tenant_id,
    mv.label                           AS provider_name,
    mv.code                            AS provider_code,
    mv.metadata->>'provider_type'      AS provider_type,
    mv.metadata->>'contact_number'     AS contact_number,
    mv.metadata->>'contact_email'      AS contact_email,
    mv.metadata->>'website_url'        AS website_url,
    mv.sort_order                      AS display_order,
    mv.is_active,
    mv.created_at,
    mv.updated_at,
    mv.created_by_user_id,
    mv.updated_by_user_id,
    mv.deleted_at
FROM master.master_value mv
WHERE mv.entity_type = 'insurance.provider'
  AND mv.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.tpa_providers_view AS
SELECT
    mv.id,
    mv.tenant_id,
    mv.label                           AS tpa_name,
    mv.code                            AS tpa_code,
    mv.metadata->>'contact_number'     AS contact_number,
    mv.metadata->>'contact_email'      AS contact_email,
    mv.metadata->>'website_url'        AS website_url,
    mv.metadata->>'helpline_number'    AS helpline_number,
    mv.sort_order                      AS display_order,
    mv.is_active,
    mv.created_at,
    mv.updated_at,
    mv.created_by_user_id,
    mv.updated_by_user_id,
    mv.deleted_at
FROM master.master_value mv
WHERE mv.entity_type = 'insurance.tpa_provider'
  AND mv.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.government_schemes_view AS
SELECT
    mv.id,
    mv.tenant_id,
    mv.label                                        AS scheme_name,
    mv.code                                         AS scheme_code,
    mv.metadata->>'scheme_type'                     AS scheme_type,
    mv.metadata->>'implementing_authority'          AS implementing_authority,
    mv.description                                  AS scheme_description,
    (mv.metadata->>'max_coverage_amount')::numeric  AS max_coverage_amount,
    mv.metadata->>'helpline_number'                 AS helpline_number,
    (mv.metadata->>'effective_from')::date          AS effective_from,
    (mv.metadata->>'effective_until')::date         AS effective_until,
    mv.sort_order                                   AS display_order,
    mv.is_active,
    mv.created_at,
    mv.updated_at,
    mv.created_by_user_id,
    mv.updated_by_user_id,
    mv.deleted_at
FROM master.master_value mv
WHERE mv.entity_type = 'insurance.govt_scheme'
  AND mv.deleted_at IS NULL;

-- ─── Summary ─────────────────────────────────────────────────────────────────
SELECT
    entity_type,
    COUNT(*) AS rows_migrated
FROM master.master_value
WHERE entity_type IN (
    'clinical.surgery_type',
    'clinical.anesthesia_type',
    'clinical.iol_catalog',
    'insurance.provider',
    'insurance.tpa_provider',
    'insurance.govt_scheme'
)
GROUP BY entity_type
ORDER BY entity_type;
