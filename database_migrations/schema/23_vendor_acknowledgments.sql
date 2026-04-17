-- ============================================================================
-- 23_vendor_acknowledgments.sql
-- Creates the inv_vendor_acknowledgments table which tracks internal
-- confirmation records for RFQ awards and Purchase Orders.
--
-- This is part of the hybrid vendor-confirmation workflow:
--   1. When an RFQ is awarded, a Pending acknowledgment is auto-created.
--   2. Staff contact the vendor (Email/WhatsApp/SMS/Call/Other) and record
--      the result here (Acknowledged | Declined | Expired).
--   3. A PO derived from the RFQ cannot be sent to the vendor until the
--      corresponding RfqAward acknowledgment is in "Acknowledged" status.
--
-- EntityType values: "RfqAward" | "PurchaseOrder"
-- AckStatus values:  "Pending"  | "Acknowledged" | "Declined" | "Expired"
-- Channel values:    "Email"    | "WhatsApp"      | "SMS"      | "Call" | "Other"
--
-- Run ONCE against the target database after 99_inventory_module.sql.
-- ============================================================================

-- ── Table ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_vendor_acknowledgments (
    id                      UUID         NOT NULL DEFAULT gen_random_uuid(),
    tenant_id               UUID         NOT NULL,
    vendor_id               UUID         NOT NULL,

    -- Which entity this acknowledgment is for
    entity_type             VARCHAR(50)  NOT NULL,   -- 'RfqAward' | 'PurchaseOrder'
    entity_id               UUID         NOT NULL,

    -- Lifecycle
    ack_status              VARCHAR(50)  NOT NULL DEFAULT 'Pending',   -- Pending | Acknowledged | Declined | Expired
    channel                 VARCHAR(50),                               -- Email | WhatsApp | SMS | Call | Other
    contact_target          VARCHAR(300),                              -- email address, phone number, etc.
    acknowledged_at         TIMESTAMPTZ,
    acknowledged_by_user_id UUID,
    ack_notes               TEXT,
    decline_reason          TEXT,
    expires_at              TIMESTAMPTZ  NOT NULL,
    reminders_sent          INTEGER      NOT NULL DEFAULT 0,

    -- Standard audit columns
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active',

    CONSTRAINT pk_inv_vendor_acknowledgments PRIMARY KEY (id),
    CONSTRAINT fk_inv_vack_vendor
        FOREIGN KEY (vendor_id) REFERENCES inv_vendors (id) ON DELETE RESTRICT,
    CONSTRAINT chk_inv_vack_ack_status
        CHECK (ack_status IN ('Pending', 'Acknowledged', 'Declined', 'Expired')),
    CONSTRAINT chk_inv_vack_entity_type
        CHECK (entity_type IN ('RfqAward', 'PurchaseOrder'))
);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE inv_vendor_acknowledgments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON inv_vendor_acknowledgments;
CREATE POLICY tenant_isolation ON inv_vendor_acknowledgments
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ── Indexes ───────────────────────────────────────────────────────────────────
-- Lookup by entity (e.g., "give me the ack for RFQ award X")
CREATE INDEX IF NOT EXISTS idx_inv_vack_entity
    ON inv_vendor_acknowledgments (tenant_id, entity_type, entity_id)
    WHERE deleted_at IS NULL;

-- Dashboard: all pending acks for a tenant
CREATE INDEX IF NOT EXISTS idx_inv_vack_status
    ON inv_vendor_acknowledgments (tenant_id, ack_status)
    WHERE deleted_at IS NULL;

-- ── Comment ───────────────────────────────────────────────────────────────────
COMMENT ON TABLE inv_vendor_acknowledgments IS
    'Tracks manual internal records of vendor confirmation for RFQ awards and POs. '
    'Part of the hybrid gate workflow: PO.SendToVendor is blocked until '
    'the corresponding RfqAward acknowledgment reaches "Acknowledged" status.';
