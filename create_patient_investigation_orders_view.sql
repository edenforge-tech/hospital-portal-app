-- ============================================================
-- Migration: patient_investigation_orders_view
-- Description: Unified VIEW across 3 investigation source tables
--   (counselor_lab_order_items, imaging_orders, preop_test_orders)
--   used by GET /api/patient-investigations aggregator endpoint.
-- Author: AI Agent  Date: 2026-03-20
--
-- Column notes:
--   imaging_orders  - no deleted_at column; filter by status instead
--   preop_test_orders - no test_name/test_type columns; JOIN protocol
--   document_url on preop_test_orders added by add_document_url_preop_orders.sql
-- ============================================================

BEGIN;

DROP VIEW IF EXISTS patient_investigation_orders_view;

CREATE VIEW patient_investigation_orders_view AS

  -- ── Source 1: Counselor lab order items ─────────────────────────────────
  SELECT
    l.id,
    l.tenant_id,
    l.patient_id,
    l.session_id,
    l.test_name,
    l.test_code,
    'Lab'::text                                   AS category,
    COALESCE(l.price, 0)                          AS price,
    l.urgency,
    l.status,
    l.ordered_at,
    l.completed_at,
    l.completed_at                                AS result_received_at,
    NULL::text                                    AS document_url,
    l.ordered_by_user_id,
    NULL::text                                    AS laterality,
    'lab'::text                                   AS source_type
  FROM counselor_lab_order_items l
  WHERE l.deleted_at IS NULL

UNION ALL

  -- ── Source 2: Imaging orders ─────────────────────────────────────────────
  -- imaging_orders has no deleted_at; exclude cancelled/rejected instead
  SELECT
    i.id,
    i.tenant_id,
    i.patient_id,
    i.session_id,
    i.imaging_type                                AS test_name,
    NULL::text                                    AS test_code,
    'Imaging'::text                               AS category,
    0::numeric                                    AS price,
    i.urgency,
    i.status,
    i.ordered_at,
    i.completed_at,
    CASE
      WHEN i.image_storage_path IS NOT NULL THEN i.ordered_at
      ELSE i.completed_at
    END                                           AS result_received_at,
    i.image_storage_path                          AS document_url,
    i.ordering_doctor_id                          AS ordered_by_user_id,
    i.laterality,
    'imaging'::text                               AS source_type
  FROM imaging_orders i
  WHERE i.status NOT IN ('Cancelled', 'Rejected')

UNION ALL

  -- ── Source 3: Pre-op test orders (protocol-based) ───────────────────────
  -- Joins preop_test_protocols for the test/protocol name
  SELECT
    o.id,
    o.tenant_id,
    o.patient_id,
    o.session_id,
    COALESCE(p.protocol_name, o.order_number, 'Pre-Op Test')
                                                  AS test_name,
    NULL::text                                    AS test_code,
    COALESCE(p.surgery_type, 'Pre-Op')            AS category,
    0::numeric                                    AS price,
    'Routine'::text                               AS urgency,
    o.status,
    o.ordered_at,
    NULL::timestamp with time zone                AS completed_at,
    o.results_received_at                         AS result_received_at,
    o.document_url,
    o.ordered_by_user_id,
    NULL::text                                    AS laterality,
    'preop'::text                                 AS source_type
  FROM preop_test_orders o
  LEFT JOIN preop_test_protocols p ON p.id = o.protocol_id
  WHERE o.deleted_at IS NULL;

COMMIT;
