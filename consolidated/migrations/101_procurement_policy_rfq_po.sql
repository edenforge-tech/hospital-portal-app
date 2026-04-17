-- =============================================================================
-- Migration 101: Procurement Policy, RFQ, Purchase Orders
-- Eye Hospital Portal — Inventory Service
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Branch Procurement Policies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_branch_procurement_policies (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL,
    branch_id                   UUID NOT NULL,
    policy_name                 TEXT NOT NULL,
    policy_status               TEXT NOT NULL DEFAULT 'Draft',   -- Draft | Published | Superseded
    direct_po_limit             NUMERIC(15,2) NOT NULL DEFAULT 50000,
    rfq_mandatory_from          NUMERIC(15,2) NOT NULL DEFAULT 40000,
    dual_approval_from          NUMERIC(15,2) NOT NULL DEFAULT 150000,
    min_vendor_quotes           INT NOT NULL DEFAULT 3,
    emergency_bypass_allowed    BOOLEAN NOT NULL DEFAULT TRUE,
    emergency_bypass_expiry_hours INT NOT NULL DEFAULT 24,
    published_at                TIMESTAMPTZ,
    published_by_user_id        UUID,
    effective_from              TIMESTAMPTZ,
    effective_to                TIMESTAMPTZ,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id          UUID,
    updated_by_user_id          UUID,
    deleted_at                  TIMESTAMPTZ,
    status                      TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT chk_policy_status CHECK (policy_status IN ('Draft','Published','Superseded')),
    CONSTRAINT chk_policy_limits CHECK (rfq_mandatory_from <= direct_po_limit OR rfq_mandatory_from <= dual_approval_from)
);

CREATE INDEX IF NOT EXISTS idx_inv_bpp_tenant ON inv_branch_procurement_policies (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_bpp_branch ON inv_branch_procurement_policies (branch_id);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_inv_bpp_branch_published
    ON inv_branch_procurement_policies (tenant_id, branch_id)
    WHERE policy_status = 'Published' AND deleted_at IS NULL;

ALTER TABLE inv_branch_procurement_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_bpp ON inv_branch_procurement_policies;
CREATE POLICY rls_inv_bpp ON inv_branch_procurement_policies
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 2. Branch Procurement Policy Versions (immutable history)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_branch_procurement_policy_versions (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL,
    policy_id                   UUID NOT NULL REFERENCES inv_branch_procurement_policies(id),
    version_number              INT NOT NULL,
    direct_po_limit             NUMERIC(15,2) NOT NULL,
    rfq_mandatory_from          NUMERIC(15,2) NOT NULL,
    dual_approval_from          NUMERIC(15,2) NOT NULL,
    min_vendor_quotes           INT NOT NULL,
    emergency_bypass_allowed    BOOLEAN NOT NULL,
    emergency_bypass_expiry_hours INT NOT NULL,
    change_notes                TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id          UUID,
    deleted_at                  TIMESTAMPTZ,
    status                      TEXT NOT NULL DEFAULT 'active'
);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_inv_bppv_policy_ver
    ON inv_branch_procurement_policy_versions (policy_id, version_number)
    WHERE deleted_at IS NULL;

ALTER TABLE inv_branch_procurement_policy_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_bppv ON inv_branch_procurement_policy_versions;
CREATE POLICY rls_inv_bppv ON inv_branch_procurement_policy_versions
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 3. RFQ Headers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_rfq_headers (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    branch_id               UUID NOT NULL,
    requisition_id          UUID,
    rfq_number              TEXT NOT NULL,
    title                   TEXT NOT NULL,
    rfq_status              TEXT NOT NULL DEFAULT 'Draft',  -- Draft | Published | ResponseWindowClosed | EvaluationInProgress | Awarded | Closed | Cancelled
    published_at            TIMESTAMPTZ,
    response_deadline       TIMESTAMPTZ,
    awarded_at              TIMESTAMPTZ,
    awarded_to_vendor_id    UUID,
    cancellation_reason     TEXT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT chk_rfq_status CHECK (rfq_status IN ('Draft','Published','ResponseWindowClosed','EvaluationInProgress','Awarded','Closed','Cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_inv_rfq_tenant ON inv_rfq_headers (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_rfq_branch ON inv_rfq_headers (branch_id);
CREATE INDEX IF NOT EXISTS idx_inv_rfq_requisition ON inv_rfq_headers (requisition_id) WHERE requisition_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uidx_inv_rfq_number
    ON inv_rfq_headers (tenant_id, rfq_number)
    WHERE deleted_at IS NULL;

ALTER TABLE inv_rfq_headers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_rfq ON inv_rfq_headers;
CREATE POLICY rls_inv_rfq ON inv_rfq_headers
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 4. RFQ Items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_rfq_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    rfq_id              UUID NOT NULL REFERENCES inv_rfq_headers(id),
    item_id             UUID NOT NULL,
    requested_qty       NUMERIC(15,3) NOT NULL,
    unit                TEXT NOT NULL,
    specifications      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_rfqi_rfq ON inv_rfq_items (rfq_id);
CREATE INDEX IF NOT EXISTS idx_inv_rfqi_item ON inv_rfq_items (item_id);

ALTER TABLE inv_rfq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_rfqi ON inv_rfq_items;
CREATE POLICY rls_inv_rfqi ON inv_rfq_items
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 5. RFQ Vendor Invites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_rfq_vendor_invites (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    rfq_id              UUID NOT NULL REFERENCES inv_rfq_headers(id),
    vendor_id           UUID NOT NULL,
    invite_status       TEXT NOT NULL DEFAULT 'Invited',  -- Invited | Viewed | QuoteSubmitted | Declined | NoResponse
    invited_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    viewed_at           TIMESTAMPTZ,
    responded_at        TIMESTAMPTZ,
    decline_reason      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT chk_rfq_invite_status CHECK (invite_status IN ('Invited','Viewed','QuoteSubmitted','Declined','NoResponse'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_inv_rfqvi_rfq_vendor
    ON inv_rfq_vendor_invites (rfq_id, vendor_id)
    WHERE deleted_at IS NULL;

ALTER TABLE inv_rfq_vendor_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_rfqvi ON inv_rfq_vendor_invites;
CREATE POLICY rls_inv_rfqvi ON inv_rfq_vendor_invites
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 6. Vendor Quotes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_vendor_quotes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    rfq_id              UUID NOT NULL REFERENCES inv_rfq_headers(id),
    vendor_id           UUID NOT NULL,
    quote_number        TEXT NOT NULL,
    quote_status        TEXT NOT NULL DEFAULT 'Submitted',  -- Submitted | UnderReview | Shortlisted | Awarded | Rejected
    total_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
    quote_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until         TIMESTAMPTZ,
    vendor_notes        TEXT,
    evaluation_notes    TEXT,
    evaluation_score    NUMERIC(5,2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT chk_vendor_quote_status CHECK (quote_status IN ('Submitted','UnderReview','Shortlisted','Awarded','Rejected'))
);

CREATE INDEX IF NOT EXISTS idx_inv_vq_rfq ON inv_vendor_quotes (rfq_id);
CREATE INDEX IF NOT EXISTS idx_inv_vq_vendor ON inv_vendor_quotes (vendor_id);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_inv_vq_number
    ON inv_vendor_quotes (tenant_id, quote_number)
    WHERE deleted_at IS NULL;

ALTER TABLE inv_vendor_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_vq ON inv_vendor_quotes;
CREATE POLICY rls_inv_vq ON inv_vendor_quotes
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 7. Vendor Quote Items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_vendor_quote_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    quote_id            UUID NOT NULL REFERENCES inv_vendor_quotes(id),
    item_id             UUID NOT NULL,
    quoted_qty          NUMERIC(15,3) NOT NULL,
    unit_price          NUMERIC(15,4) NOT NULL,
    gst_percent         NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(15,2) NOT NULL,
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_vqi_quote ON inv_vendor_quote_items (quote_id);

ALTER TABLE inv_vendor_quote_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_vqi ON inv_vendor_quote_items;
CREATE POLICY rls_inv_vqi ON inv_vendor_quote_items
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 8. Purchase Orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_purchase_orders (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL,
    branch_id                   UUID NOT NULL,
    requisition_id              UUID,
    rfq_id                      UUID,
    source_type                 TEXT NOT NULL DEFAULT 'Direct',  -- RFQ | Direct | Emergency
    po_number                   TEXT NOT NULL,
    vendor_id                   UUID NOT NULL,
    po_status                   TEXT NOT NULL DEFAULT 'Draft',   -- Draft | Submitted | L1Approved | L2Approved | Approved | Rejected | SentToVendor | PartiallyReceived | FullyReceived | Closed | Cancelled
    total_amount                NUMERIC(15,2) NOT NULL DEFAULT 0,
    gst_amount                  NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_amount                  NUMERIC(15,2) NOT NULL DEFAULT 0,
    po_date                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_delivery_date      TIMESTAMPTZ,
    sent_to_vendor_at           TIMESTAMPTZ,
    l1_approved_by_user_id      UUID,
    l1_approved_at              TIMESTAMPTZ,
    l2_approved_by_user_id      UUID,
    l2_approved_at              TIMESTAMPTZ,
    rejected_by_user_id         UUID,
    rejected_at                 TIMESTAMPTZ,
    rejection_reason            TEXT,
    is_emergency                BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_bypass_expiry     TIMESTAMPTZ,
    terms                       TEXT,
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id          UUID,
    updated_by_user_id          UUID,
    deleted_at                  TIMESTAMPTZ,
    status                      TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT chk_po_status CHECK (po_status IN ('Draft','Submitted','L1Approved','L2Approved','Approved','Rejected','SentToVendor','PartiallyReceived','FullyReceived','Closed','Cancelled')),
    CONSTRAINT chk_po_source CHECK (source_type IN ('RFQ','Direct','Emergency'))
);

CREATE INDEX IF NOT EXISTS idx_inv_po_tenant ON inv_purchase_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_po_branch ON inv_purchase_orders (branch_id);
CREATE INDEX IF NOT EXISTS idx_inv_po_vendor ON inv_purchase_orders (vendor_id);
CREATE INDEX IF NOT EXISTS idx_inv_po_requisition ON inv_purchase_orders (requisition_id) WHERE requisition_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inv_po_rfq ON inv_purchase_orders (rfq_id) WHERE rfq_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inv_po_status ON inv_purchase_orders (tenant_id, po_status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uidx_inv_po_number
    ON inv_purchase_orders (tenant_id, po_number)
    WHERE deleted_at IS NULL;

ALTER TABLE inv_purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_po ON inv_purchase_orders;
CREATE POLICY rls_inv_po ON inv_purchase_orders
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 9. Purchase Order Items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_purchase_order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    po_id               UUID NOT NULL REFERENCES inv_purchase_orders(id),
    item_id             UUID NOT NULL,
    ordered_qty         NUMERIC(15,3) NOT NULL,
    received_qty        NUMERIC(15,3) NOT NULL DEFAULT 0,
    unit_price          NUMERIC(15,4) NOT NULL,
    gst_percent         NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(15,2) NOT NULL,
    unit                TEXT NOT NULL,
    required_by         TIMESTAMPTZ,
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_poi_po ON inv_purchase_order_items (po_id);
CREATE INDEX IF NOT EXISTS idx_inv_poi_item ON inv_purchase_order_items (item_id);

ALTER TABLE inv_purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_poi ON inv_purchase_order_items;
CREATE POLICY rls_inv_poi ON inv_purchase_order_items
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 10. Procurement Transition Logs (unified audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inv_procurement_transition_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    entity_type         TEXT NOT NULL,   -- PurchaseRequisition | RfqHeader | PurchaseOrder
    entity_id           UUID NOT NULL,
    from_status         TEXT NOT NULL,
    to_status           TEXT NOT NULL,
    reason              TEXT,
    actor_user_id       UUID,
    transitioned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_ptl_entity ON inv_procurement_transition_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_inv_ptl_tenant ON inv_procurement_transition_logs (tenant_id, transitioned_at DESC);

ALTER TABLE inv_procurement_transition_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_inv_ptl ON inv_procurement_transition_logs;
CREATE POLICY rls_inv_ptl ON inv_procurement_transition_logs
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- ---------------------------------------------------------------------------
-- 11. Seed default policies for branch types (uses NULL branch_id as templates)
-- ---------------------------------------------------------------------------
-- NOTE: These are template/default rows. Real branch policies are created by
-- branch admins via the Policy Console. tenant_id = '00000000-0000-0000-0000-000000000001'
-- is the system tenant used for template data.

COMMIT;
