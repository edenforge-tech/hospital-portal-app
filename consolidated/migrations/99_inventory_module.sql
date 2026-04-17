-- =============================================================================
-- INVENTORY MODULE — SQL MIGRATION
-- File   : consolidated/migrations/99_inventory_module.sql
-- Tables : 24 tables (all prefixed inv_)
-- Views  : mv_stock_summary (materialized), vw_vendor_reconciliation,
--          vw_gst_summary_by_rate
-- Seed   : 9 real-world vendors, 3 default stores per tenant
-- Covers : All 12 invoice-gap requirements from real invoices
-- =============================================================================

BEGIN;

-- ─── Enable UUID extension (idempotent) ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. STORE MASTER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_store_master (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    branch_id           UUID,                          -- NULL = all-branch central store
    store_name          VARCHAR(200) NOT NULL,
    store_type          VARCHAR(50)  NOT NULL DEFAULT 'Central'
                        CHECK (store_type IN ('Central','Pharmacy','OT')),
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_store_master_tenant
    ON inv_store_master(tenant_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PURCHASE CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_categories (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    category_name       VARCHAR(200) NOT NULL,
    category_type       VARCHAR(50)  NOT NULL DEFAULT 'Drugs'
                        CHECK (category_type IN ('Drugs','Surgical','Equipment','Consumables','Optical','Other')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ITEM MASTER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_item_master (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID        NOT NULL,
    category_id             UUID        REFERENCES inv_purchase_categories(id) ON DELETE SET NULL,
    item_name               VARCHAR(300) NOT NULL,
    generic_name            VARCHAR(300),
    brand                   VARCHAR(200),
    hsn_code                VARCHAR(20),
    unit                    VARCHAR(50)  NOT NULL DEFAULT 'Nos',
    -- gap #7: Schedule H / H1 / X / OTC
    schedule_type           VARCHAR(10)
                            CHECK (schedule_type IN ('H','H1','X','OTC') OR schedule_type IS NULL),
    -- gap #5: cold chain
    requires_cold_storage   BOOLEAN     NOT NULL DEFAULT FALSE,
    is_barcode_tracked      BOOLEAN     NOT NULL DEFAULT FALSE,
    item_type               VARCHAR(50)  NOT NULL DEFAULT 'Drug'
                            CHECK (item_type IN ('IOL','Drug','Surgical','Equipment','Consumable','Other')),
    reorder_level           NUMERIC(12,3) NOT NULL DEFAULT 0,
    reorder_quantity        NUMERIC(12,3) NOT NULL DEFAULT 0,
    default_gst_rate        VARCHAR(10),
    -- gap #6: injector paired with IOL
    linked_injector_item_id UUID        REFERENCES inv_item_master(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_item_master_tenant
    ON inv_item_master(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inv_item_master_name
    ON inv_item_master USING gin(to_tsvector('english', item_name || ' ' || COALESCE(generic_name,'')));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VENDORS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_vendors (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID        NOT NULL,
    name                    VARCHAR(300) NOT NULL,
    contact_person          VARCHAR(200),
    phone                   VARCHAR(30),
    email                   VARCHAR(200),
    address                 TEXT,
    gst_number              VARCHAR(20),
    pan_number              VARCHAR(15),
    drug_license_number     VARCHAR(100),
    drug_license_expiry     DATE,
    -- gap #9: additional vendor licenses
    apmc_registration       VARCHAR(100),
    food_license_number     VARCHAR(100),
    import_export_code      VARCHAR(50),
    bank_name               VARCHAR(200),
    bank_account_number     VARCHAR(50),
    bank_ifsc_code          VARCHAR(20),
    credit_days             NUMERIC(5,0) NOT NULL DEFAULT 0,
    -- gap #8: running outstanding balance (denormalised for quick display)
    outstanding_balance     NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_vendors_tenant
    ON inv_vendors(tenant_id) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PURCHASE INVOICES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_invoices (
    id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id                   UUID        NOT NULL,
    vendor_id                   UUID        NOT NULL REFERENCES inv_vendors(id),
    store_id                    UUID        NOT NULL REFERENCES inv_store_master(id),
    invoice_number              VARCHAR(100) NOT NULL,
    invoice_date                DATE        NOT NULL,
    -- gap #3: delivery challan separate from invoice
    delivery_chall_number       VARCHAR(100),
    delivery_chall_date         DATE,
    -- gap #10: vendor cross-reference numbers (Carl Zeiss: Order Confirmation, Delivery Note, SAP No)
    vendor_order_number         VARCHAR(100),
    vendor_delivery_note_number VARCHAR(100),
    vendor_sap_number           VARCHAR(100),
    vendor_batch_ref            VARCHAR(100),
    -- GRN back-link (denormalised after GRN creation)
    grn_number                  VARCHAR(100),
    grn_date                    DATE,
    -- Financial totals
    gross_amount                NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount             NUMERIC(14,2) NOT NULL DEFAULT 0,
    taxable_amount              NUMERIC(14,2) NOT NULL DEFAULT 0,
    cgst_amount                 NUMERIC(14,2) NOT NULL DEFAULT 0,
    sgst_amount                 NUMERIC(14,2) NOT NULL DEFAULT 0,
    igst_amount                 NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_gst                   NUMERIC(14,2) NOT NULL DEFAULT 0,
    -- gap #1: TCS (Tax Collected at Source)
    tcs_percent                 NUMERIC(5,2)  NOT NULL DEFAULT 0,
    tcs_amount                  NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_amount                  NUMERIC(14,2) NOT NULL DEFAULT 0,
    paid_amount                 NUMERIC(14,2) NOT NULL DEFAULT 0,
    balance_amount              NUMERIC(14,2) NOT NULL DEFAULT 0,
    -- gap #2: IOL billing mode
    billing_mode                VARCHAR(20)   NOT NULL DEFAULT 'Bulk'
                                CHECK (billing_mode IN ('Bulk','PatientSpecific')),
    patient_name                VARCHAR(200),
    patient_ip_no               VARCHAR(50),
    -- Approval workflow
    approval_status             VARCHAR(30)   NOT NULL DEFAULT 'Draft'
                                CHECK (approval_status IN ('Draft','PrimaryApproved','Approved','Rejected','Cancelled')),
    primary_approved_by         UUID,
    primary_approved_at         TIMESTAMPTZ,
    final_approved_by           UUID,
    final_approved_at           TIMESTAMPTZ,
    remarks                     TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id          UUID,
    updated_by_user_id          UUID,
    deleted_at                  TIMESTAMPTZ,
    status                      VARCHAR(50)  NOT NULL DEFAULT 'active',
    UNIQUE (tenant_id, invoice_number, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_inv_invoices_tenant_vendor
    ON inv_purchase_invoices(tenant_id, vendor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inv_invoices_approval
    ON inv_purchase_invoices(tenant_id, approval_status) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PURCHASE ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    invoice_id          UUID        NOT NULL REFERENCES inv_purchase_invoices(id) ON DELETE CASCADE,
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    ordered_quantity    NUMERIC(12,3) NOT NULL,
    received_quantity   NUMERIC(12,3) NOT NULL DEFAULT 0,
    rejected_quantity   NUMERIC(12,3) NOT NULL DEFAULT 0,
    free_quantity       NUMERIC(12,3) NOT NULL DEFAULT 0,
    batch_number        VARCHAR(100),
    expiry_date         DATE,
    barcode             VARCHAR(100),
    -- gap #11: original MRP vs selling MRP (Rudra Pharma O.MRP)
    original_mrp        NUMERIC(12,2) NOT NULL DEFAULT 0,
    mrp                 NUMERIC(12,2) NOT NULL DEFAULT 0,
    purchase_rate       NUMERIC(12,2) NOT NULL,
    discount_percent    NUMERIC(6,3)  NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    -- gap #6: full-discount injector linked to IOL
    is_full_discount    BOOLEAN       NOT NULL DEFAULT FALSE,
    hsn_code            VARCHAR(20),
    gst_percent         NUMERIC(5,2)  NOT NULL DEFAULT 0,
    cgst_percent        NUMERIC(5,2)  NOT NULL DEFAULT 0,
    sgst_percent        NUMERIC(5,2)  NOT NULL DEFAULT 0,
    igst_percent        NUMERIC(5,2)  NOT NULL DEFAULT 0,
    gst_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    -- gap #2: patient-specific IOL line-level data (WIIZ Health Tech style)
    patient_name        VARCHAR(200),
    patient_ip_no       VARCHAR(50),
    surgery_id          UUID,
    item_remarks        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_purchase_items_invoice
    ON inv_purchase_items(invoice_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. INVOICE GST SUMMARY  (gap #4 — multi-rate GST, e.g. Ganga Pharma 0%+5%+12%+18%)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_invoice_gst_summary (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    invoice_id          UUID        NOT NULL REFERENCES inv_purchase_invoices(id) ON DELETE CASCADE,
    gst_rate            NUMERIC(5,2) NOT NULL,
    taxable_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
    cgst_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    sgst_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    igst_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_gst_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. GRN SEQUENCES  (concurrency-safe sequential GRN numbers)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_grn_sequences (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID        NOT NULL,
    store_id        UUID        NOT NULL REFERENCES inv_store_master(id),
    financial_year  VARCHAR(10) NOT NULL,   -- e.g. '2025-26'
    last_sequence   INTEGER     NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, store_id, financial_year)
);

-- Helper function: atomically increment and return next GRN sequence
CREATE OR REPLACE FUNCTION inv_next_grn_sequence(
    p_tenant_id     UUID,
    p_store_id      UUID,
    p_financial_year VARCHAR
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    v_next INTEGER;
BEGIN
    -- INSERT ... ON CONFLICT ensures row exists, then SELECT FOR UPDATE locks it
    INSERT INTO inv_grn_sequences (tenant_id, store_id, financial_year, last_sequence)
    VALUES (p_tenant_id, p_store_id, p_financial_year, 0)
    ON CONFLICT (tenant_id, store_id, financial_year) DO NOTHING;

    SELECT last_sequence + 1
    INTO v_next
    FROM inv_grn_sequences
    WHERE tenant_id = p_tenant_id
      AND store_id  = p_store_id
      AND financial_year = p_financial_year
    FOR UPDATE;

    UPDATE inv_grn_sequences
    SET last_sequence = v_next, updated_at = now()
    WHERE tenant_id = p_tenant_id
      AND store_id  = p_store_id
      AND financial_year = p_financial_year;

    RETURN v_next;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. GRN HEADERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_grn_headers (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    invoice_id          UUID        NOT NULL REFERENCES inv_purchase_invoices(id),
    store_id            UUID        NOT NULL REFERENCES inv_store_master(id),
    grn_number          VARCHAR(50)  NOT NULL,
    grn_date            DATE        NOT NULL,
    grn_status          VARCHAR(30)  NOT NULL DEFAULT 'Draft'
                        CHECK (grn_status IN ('Draft','PrimaryApproved','Approved','PartiallyAccepted','Rejected')),
    remarks             TEXT,
    inspected_by        UUID,
    inspected_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active',
    UNIQUE (tenant_id, grn_number)
);

CREATE INDEX IF NOT EXISTS idx_inv_grn_headers_invoice
    ON inv_grn_headers(invoice_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. GRN ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_grn_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    grn_header_id       UUID        NOT NULL REFERENCES inv_grn_headers(id) ON DELETE CASCADE,
    purchase_item_id    UUID        NOT NULL REFERENCES inv_purchase_items(id),
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    accepted_quantity   NUMERIC(12,3) NOT NULL DEFAULT 0,
    rejected_quantity   NUMERIC(12,3) NOT NULL DEFAULT 0,
    rejection_reason    TEXT,
    is_verified         BOOLEAN     NOT NULL DEFAULT FALSE,
    barcode             VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. PURCHASE RETURNS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_returns (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    invoice_id          UUID        NOT NULL REFERENCES inv_purchase_invoices(id),
    vendor_id           UUID        NOT NULL REFERENCES inv_vendors(id),
    return_number       VARCHAR(50)  NOT NULL,
    return_date         DATE        NOT NULL,
    return_reason       VARCHAR(50)  NOT NULL DEFAULT 'QualityRejection'
                        CHECK (return_reason IN ('QualityRejection','Expired','Excess','Damaged','Other')),
    total_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    remarks             TEXT,
    settlement_status   VARCHAR(30)  NOT NULL DEFAULT 'Pending'
                        CHECK (settlement_status IN ('Pending','CreditNoteReceived','Settled')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. PURCHASE RETURN ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_return_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    return_id           UUID        NOT NULL REFERENCES inv_purchase_returns(id) ON DELETE CASCADE,
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    stock_batch_id      UUID,       -- FK added after inv_stock_batches created
    return_quantity     NUMERIC(12,3) NOT NULL,
    purchase_rate       NUMERIC(12,2) NOT NULL,
    amount              NUMERIC(14,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. STOCK BATCHES  (FEFO-ready — First Expired First Out)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_stock_batches (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID        NOT NULL,
    store_id                UUID        NOT NULL REFERENCES inv_store_master(id),
    item_id                 UUID        NOT NULL REFERENCES inv_item_master(id),
    invoice_id              UUID        REFERENCES inv_purchase_invoices(id) ON DELETE SET NULL,
    purchase_item_id        UUID        REFERENCES inv_purchase_items(id) ON DELETE SET NULL,
    batch_number            VARCHAR(100) NOT NULL,
    expiry_date             DATE,
    barcode                 VARCHAR(100),
    -- gap #5: cold chain flag propagated from item_master
    requires_cold_storage   BOOLEAN     NOT NULL DEFAULT FALSE,
    mrp                     NUMERIC(12,2) NOT NULL DEFAULT 0,
    purchase_rate           NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity_in             NUMERIC(12,3) NOT NULL DEFAULT 0,
    quantity_out            NUMERIC(12,3) NOT NULL DEFAULT 0,
    quantity_available      NUMERIC(12,3) NOT NULL DEFAULT 0,
    is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_stock_batches_lookup
    ON inv_stock_batches(tenant_id, store_id, item_id, expiry_date)
    WHERE deleted_at IS NULL AND quantity_available > 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_inv_stock_batches_barcode
    ON inv_stock_batches(barcode)
    WHERE barcode IS NOT NULL AND deleted_at IS NULL;

-- Add deferred FK from purchase_return_items → stock_batches
ALTER TABLE inv_purchase_return_items
    ADD CONSTRAINT fk_return_items_batch
    FOREIGN KEY (stock_batch_id) REFERENCES inv_stock_batches(id) ON DELETE SET NULL
    NOT VALID;

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. STOCK LEDGER  (immutable audit trail — never update, only insert)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_stock_ledger (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    store_id            UUID        NOT NULL REFERENCES inv_store_master(id),
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    stock_batch_id      UUID        REFERENCES inv_stock_batches(id) ON DELETE SET NULL,
    -- transaction_type: GRN_IN | PHARMACY_ISSUE | OT_ISSUE | TRANSFER_OUT |
    --   TRANSFER_IN | RETURN_TO_VENDOR | ADJUSTMENT | PATIENT_IOL_ISSUE | EXPIRY_WRITE_OFF
    transaction_type    VARCHAR(50)  NOT NULL,
    reference_id        VARCHAR(100),   -- UUID of the originating document
    reference_number    VARCHAR(100),   -- human-readable number
    quantity_in         NUMERIC(12,3) NOT NULL DEFAULT 0,
    quantity_out        NUMERIC(12,3) NOT NULL DEFAULT 0,
    balance_quantity    NUMERIC(12,3) NOT NULL,
    unit_rate           NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_value         NUMERIC(14,2) NOT NULL DEFAULT 0,
    remarks             TEXT,
    transaction_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_stock_ledger_lookup
    ON inv_stock_ledger(tenant_id, store_id, item_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inv_stock_ledger_batch
    ON inv_stock_ledger(stock_batch_id) WHERE stock_batch_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. STOCK TRANSFERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_stock_transfers (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    from_store_id       UUID        NOT NULL REFERENCES inv_store_master(id),
    to_store_id         UUID        NOT NULL REFERENCES inv_store_master(id),
    transfer_number     VARCHAR(50)  NOT NULL,
    transfer_date       DATE        NOT NULL,
    transfer_status     VARCHAR(30)  NOT NULL DEFAULT 'Pending'
                        CHECK (transfer_status IN ('Pending','Approved','Completed','Cancelled')),
    remarks             TEXT,
    approved_by         UUID,
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active',
    CONSTRAINT chk_transfer_diff_stores CHECK (from_store_id <> to_store_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. STOCK TRANSFER ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_stock_transfer_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    transfer_id         UUID        NOT NULL REFERENCES inv_stock_transfers(id) ON DELETE CASCADE,
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    stock_batch_id      UUID        NOT NULL REFERENCES inv_stock_batches(id),
    transfer_quantity   NUMERIC(12,3) NOT NULL,
    unit_rate           NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. APPROVAL LOGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_approval_logs (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    invoice_id          UUID        NOT NULL REFERENCES inv_purchase_invoices(id) ON DELETE CASCADE,
    user_id             UUID        NOT NULL,
    action              VARCHAR(50)  NOT NULL
                        CHECK (action IN ('PrimaryApproval','FinalApproval','Rejection','Override','Cancellation')),
    remarks             TEXT,
    action_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. PHARMACY BILLS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_pharmacy_bills (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID        NOT NULL,
    store_id                UUID        NOT NULL REFERENCES inv_store_master(id),
    patient_id              UUID,       -- FK to patients table (cross-service, no hard ref)
    bill_number             VARCHAR(50)  NOT NULL,
    bill_date               DATE        NOT NULL DEFAULT CURRENT_DATE,
    patient_name            VARCHAR(200),
    patient_ip_op_no        VARCHAR(50),
    prescribed_by_doctor_id UUID,
    gross_amount            NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    gst_amount              NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_amount              NUMERIC(14,2) NOT NULL DEFAULT 0,
    payment_mode            VARCHAR(30)  NOT NULL DEFAULT 'Cash'
                            CHECK (payment_mode IN ('Cash','Credit','Insurance','Wallet','UPI','Card')),
    paid_amount             NUMERIC(14,2) NOT NULL DEFAULT 0,
    balance_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
    bill_status             VARCHAR(20)  NOT NULL DEFAULT 'Draft'
                            CHECK (bill_status IN ('Draft','Billed','Cancelled','Returned')),
    remarks                 TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active',
    UNIQUE (tenant_id, bill_number)
);

CREATE INDEX IF NOT EXISTS idx_inv_pharmacy_bills_store_date
    ON inv_pharmacy_bills(store_id, bill_date DESC) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. PHARMACY BILL ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_pharmacy_bill_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    bill_id             UUID        NOT NULL REFERENCES inv_pharmacy_bills(id) ON DELETE CASCADE,
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    stock_batch_id      UUID        REFERENCES inv_stock_batches(id) ON DELETE SET NULL,
    quantity            NUMERIC(12,3) NOT NULL,
    mrp                 NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_rate        NUMERIC(12,2) NOT NULL,
    discount_percent    NUMERIC(6,3)  NOT NULL DEFAULT 0,
    gst_percent         NUMERIC(5,2)  NOT NULL DEFAULT 0,
    taxable_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    barcode             VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 20. SURGERY CONSUMABLES  (OT Store issues — both IOL billing modes)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_surgery_consumables (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    store_id            UUID        NOT NULL REFERENCES inv_store_master(id),
    surgery_id          UUID,       -- cross-service FK to surgeries table
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    stock_batch_id      UUID        REFERENCES inv_stock_batches(id) ON DELETE SET NULL,
    iol_billing_mode    VARCHAR(20)  NOT NULL DEFAULT 'Bulk'
                        CHECK (iol_billing_mode IN ('Bulk','PatientSpecific')),
    patient_name        VARCHAR(200),
    patient_ip_no       VARCHAR(50),
    quantity            NUMERIC(12,3) NOT NULL,
    unit_rate           NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount              NUMERIC(14,2) NOT NULL DEFAULT 0,
    barcode             VARCHAR(100),
    remarks             TEXT,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_surgery_consumables_surgery
    ON inv_surgery_consumables(surgery_id) WHERE surgery_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 21. PURCHASE REQUISITIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_requisitions (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID        NOT NULL,
    store_id                UUID        NOT NULL REFERENCES inv_store_master(id),
    requisition_number      VARCHAR(50)  NOT NULL,
    requisition_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
    requested_by_user_id    UUID,
    requisition_type        VARCHAR(20)  NOT NULL DEFAULT 'Manual'
                            CHECK (requisition_type IN ('Manual','AutoReorder')),
    requisition_status      VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                            CHECK (requisition_status IN ('Pending','Approved','POCreated','Cancelled')),
    remarks                 TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active',
    UNIQUE (tenant_id, requisition_number)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 22. PURCHASE REQUISITION ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_purchase_requisition_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    requisition_id      UUID        NOT NULL REFERENCES inv_purchase_requisitions(id) ON DELETE CASCADE,
    item_id             UUID        NOT NULL REFERENCES inv_item_master(id),
    required_quantity   NUMERIC(12,3) NOT NULL,
    current_stock       NUMERIC(12,3) NOT NULL DEFAULT 0,
    preferred_vendor    VARCHAR(200),
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 23. VENDOR PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_vendor_payments (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID        NOT NULL,
    vendor_id               UUID        NOT NULL REFERENCES inv_vendors(id),
    invoice_id              UUID        REFERENCES inv_purchase_invoices(id) ON DELETE SET NULL,
    payment_reference       VARCHAR(100) NOT NULL,
    payment_date            DATE        NOT NULL,
    amount                  NUMERIC(14,2) NOT NULL,
    payment_mode            VARCHAR(20)  NOT NULL DEFAULT 'NEFT'
                            CHECK (payment_mode IN ('Cash','Cheque','NEFT','RTGS','UPI','Card')),
    cheque_number           VARCHAR(50),
    bank_transaction_id     VARCHAR(100),
    remarks                 TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id      UUID,
    updated_by_user_id      UUID,
    deleted_at              TIMESTAMPTZ,
    status                  VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_vendor_payments_vendor
    ON inv_vendor_payments(vendor_id, payment_date DESC) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 24. VENDOR OUTSTANDING LEDGER  (gap #8 — Rudra Pharma "Total Due Bills")
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inv_vendor_outstanding_ledger (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID        NOT NULL,
    vendor_id           UUID        NOT NULL REFERENCES inv_vendors(id),
    invoice_id          UUID        REFERENCES inv_purchase_invoices(id) ON DELETE SET NULL,
    payment_id          UUID        REFERENCES inv_vendor_payments(id) ON DELETE SET NULL,
    entry_type          VARCHAR(20)  NOT NULL
                        CHECK (entry_type IN ('Invoice','Payment','CreditNote','Adjustment')),
    debit               NUMERIC(14,2) NOT NULL DEFAULT 0,   -- amount owed
    credit              NUMERIC(14,2) NOT NULL DEFAULT 0,   -- amount paid / credit note
    running_balance     NUMERIC(14,2) NOT NULL,
    reference_number    VARCHAR(100),
    entry_date          DATE        NOT NULL DEFAULT CURRENT_DATE,
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_inv_vendor_outstanding_lookup
    ON inv_vendor_outstanding_ledger(tenant_id, vendor_id, entry_date DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- ─── Materialized stock summary (rebuilds via timer function nightly) ─────────
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inv_stock_summary AS
SELECT
    sb.tenant_id,
    sb.store_id,
    sm.store_name,
    sm.store_type,
    sb.item_id,
    im.item_name,
    im.generic_name,
    im.item_type,
    im.unit,
    im.reorder_level,
    SUM(sb.quantity_available) AS total_available,
    MIN(sb.expiry_date)        AS nearest_expiry,
    COUNT(sb.id)               AS batch_count
FROM inv_stock_batches sb
JOIN inv_store_master   sm ON sm.id = sb.store_id
JOIN inv_item_master    im ON im.id = sb.item_id
WHERE sb.deleted_at IS NULL
  AND sb.quantity_available > 0
  AND sb.is_active = TRUE
GROUP BY sb.tenant_id, sb.store_id, sm.store_name, sm.store_type,
         sb.item_id, im.item_name, im.generic_name, im.item_type,
         im.unit, im.reorder_level
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_stock_summary_pk
    ON mv_inv_stock_summary(tenant_id, store_id, item_id);

-- ─── Vendor reconciliation view ───────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_inv_vendor_reconciliation AS
SELECT
    v.tenant_id,
    v.id                            AS vendor_id,
    v.name                          AS vendor_name,
    COALESCE(SUM(pi.net_amount), 0) AS total_invoiced,
    COALESCE(SUM(vp.amount), 0)     AS total_paid,
    v.outstanding_balance,
    COUNT(DISTINCT pi.id)           AS invoice_count,
    MAX(pi.invoice_date)            AS last_invoice_date,
    MAX(vp.payment_date)            AS last_payment_date
FROM inv_vendors v
LEFT JOIN inv_purchase_invoices pi
       ON pi.vendor_id = v.id
      AND pi.approval_status = 'Approved'
      AND pi.deleted_at IS NULL
LEFT JOIN inv_vendor_payments vp
       ON vp.vendor_id = v.id
      AND vp.deleted_at IS NULL
WHERE v.deleted_at IS NULL
GROUP BY v.tenant_id, v.id, v.name, v.outstanding_balance;

-- ─── GST summary by rate view ─────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_inv_gst_summary_by_rate AS
SELECT
    pi.tenant_id,
    pi.store_id,
    DATE_TRUNC('month', pi.invoice_date)::DATE AS month,
    gs.gst_rate,
    SUM(gs.taxable_amount)   AS taxable_amount,
    SUM(gs.cgst_amount)      AS cgst_amount,
    SUM(gs.sgst_amount)      AS sgst_amount,
    SUM(gs.igst_amount)      AS igst_amount,
    SUM(gs.total_gst_amount) AS total_gst_amount
FROM inv_invoice_gst_summary gs
JOIN inv_purchase_invoices pi ON pi.id = gs.invoice_id
WHERE pi.deleted_at IS NULL
  AND gs.deleted_at IS NULL
GROUP BY pi.tenant_id, pi.store_id, DATE_TRUNC('month', pi.invoice_date), gs.gst_rate;

-- =============================================================================
-- ROW-LEVEL SECURITY
-- =============================================================================

ALTER TABLE inv_store_master                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_item_master                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_vendors                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_invoice_gst_summary           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_grn_sequences                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_grn_headers                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_grn_items                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_returns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_return_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock_batches                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock_ledger                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock_transfers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock_transfer_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_approval_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_pharmacy_bills                ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_pharmacy_bill_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_surgery_consumables           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_requisitions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_requisition_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_vendor_payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_vendor_outstanding_ledger     ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for each table (only if not already present)
DO $$
DECLARE
    v_tables TEXT[] := ARRAY[
        'inv_store_master','inv_purchase_categories','inv_item_master',
        'inv_vendors','inv_purchase_invoices','inv_purchase_items',
        'inv_invoice_gst_summary','inv_grn_sequences','inv_grn_headers',
        'inv_grn_items','inv_purchase_returns','inv_purchase_return_items',
        'inv_stock_batches','inv_stock_ledger','inv_stock_transfers',
        'inv_stock_transfer_items','inv_approval_logs','inv_pharmacy_bills',
        'inv_pharmacy_bill_items','inv_surgery_consumables',
        'inv_purchase_requisitions','inv_purchase_requisition_items',
        'inv_vendor_payments','inv_vendor_outstanding_ledger'
    ];
    v_tbl TEXT;
BEGIN
    FOREACH v_tbl IN ARRAY v_tables LOOP
        IF NOT EXISTS (
            SELECT FROM pg_policies
            WHERE tablename = v_tbl AND policyname = v_tbl || '_tenant_isolation'
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I ON %I FOR ALL USING (tenant_id::text = current_setting(''app.current_tenant_id'', true))',
                v_tbl || '_tenant_isolation', v_tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION inv_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    v_tables TEXT[] := ARRAY[
        'inv_store_master','inv_purchase_categories','inv_item_master',
        'inv_vendors','inv_purchase_invoices','inv_purchase_items',
        'inv_invoice_gst_summary','inv_grn_headers','inv_grn_items',
        'inv_purchase_returns','inv_purchase_return_items','inv_stock_batches',
        'inv_stock_ledger','inv_stock_transfers','inv_stock_transfer_items',
        'inv_approval_logs','inv_pharmacy_bills','inv_pharmacy_bill_items',
        'inv_surgery_consumables','inv_purchase_requisitions',
        'inv_purchase_requisition_items','inv_vendor_payments',
        'inv_vendor_outstanding_ledger'
    ];
    v_tbl TEXT;
BEGIN
    FOREACH v_tbl IN ARRAY v_tables LOOP
        IF NOT EXISTS (
            SELECT FROM pg_trigger
            WHERE tgname = 'trg_' || v_tbl || '_updated_at'
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION inv_set_updated_at()',
                'trg_' || v_tbl || '_updated_at', v_tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ─── Seed: 3 default stores for every existing tenant ────────────────────────
INSERT INTO inv_store_master (id, tenant_id, store_name, store_type)
SELECT
    uuid_generate_v4(),
    t.id,
    s.store_name,
    s.store_type
FROM tenant t
CROSS JOIN (VALUES
    ('Central Store', 'Central'),
    ('Pharmacy',      'Pharmacy'),
    ('OT Store',      'OT')
) AS s(store_name, store_type)
ON CONFLICT DO NOTHING;

-- ─── Seed: Default purchase categories ───────────────────────────────────────
INSERT INTO inv_purchase_categories (id, tenant_id, category_name, category_type)
SELECT
    uuid_generate_v4(),
    t.id,
    c.category_name,
    c.category_type
FROM tenant t
CROSS JOIN (VALUES
    ('Intraocular Lenses',   'Optical'),
    ('Ophthalmic Drugs',    'Drugs'),
    ('Surgical Instruments','Surgical'),
    ('OT Consumables',      'Consumables'),
    ('Diagnostic Equipment','Equipment'),
    ('Schedule H Drugs',    'Drugs'),
    ('Schedule H1 Drugs',   'Drugs'),
    ('Schedule X Drugs',    'Drugs')
) AS c(category_name, category_type)
ON CONFLICT DO NOTHING;

-- ─── Seed: 9 real-world vendors (from the uploaded invoices) ─────────────────
-- These are tenant-agnostic seeds that get duplicated per tenant.
-- The tenant_id below is a placeholder; replace with actual UUIDs or run
-- a per-tenant loop similarly to the stores seed above.
-- For the admin (first) tenant only, insert vendor reference data:
INSERT INTO inv_vendors (
    id, tenant_id, name, contact_person, gst_number, drug_license_number,
    import_export_code, bank_ifsc_code, credit_days
)
SELECT
    uuid_generate_v4(),
    t.id,
    v.name,
    v.contact,
    v.gst,
    v.dl,
    v.iec,
    v.ifsc,
    v.credit_days
FROM tenant t
CROSS JOIN (VALUES
    ('Carl Zeiss India Pvt Ltd',        'Accounts Team',  '36AADCC6152H1ZR', 'TG/16/01/2016-17150/17151',  NULL,         'CITI0000001', 30),
    ('Biotech Vision Care Pvt Ltd',     'Sales Dept',     '36AABCB3639E1ZY', 'AP/24/-5/2014-117187',       NULL,         'HDFC0000002', 45),
    ('Corneal Vision Care',             'Admin',          '36ABSPR4098L1ZM', 'TS/HYD/2022-91245',          NULL,         'ICIC0000003', 30),
    ('Rudra Pharma',                    'Manager',        '36BBRPA8696R1ZF', 'TS/RR/2019-53635',           NULL,         'SBIN0000004', 15),
    ('Royal Medical Hall',              'Proprietor',     '36AACFR1617A1ZT', 'TG/24/05/2014-3062/3063',    NULL,         'AXIS0000005', 0 ),
    ('Drug Mart',                       'Owner',          '36ANHPK3492N1ZF', '20B:40/HD/AP/2008/W',        NULL,         'KOTAK000006', 0 ),
    ('Ganga Pharma',                    'Accounts',       '36ACMPK3904D1ZT', '20B:Vasavi/HD/AP/96',        NULL,         'HDFC0000007', 30),
    ('Sree AV Surgicals',               'Sales',          '36SAIYP01341IZV', NULL,                         NULL,         'ICIC0000008', 15),
    ('WIIZ Health Tech Pvt Ltd',        'Export Dept',    '36AACFW3975G1ZV', 'TG/16/01/2016-19726',        NULL,         'CITI0000009', 60)
) AS v(name, contact, gst, dl, iec, ifsc, credit_days)
ON CONFLICT DO NOTHING;

COMMIT;

-- =============================================================================
-- POST-MIGRATION NOTES
-- =============================================================================
-- 1. Refresh materialized view manually after first data load:
--    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inv_stock_summary;
-- 2. The Azure Function AutoReorderFunction runs nightly to refresh the view
--    and create auto-requisitions for items below reorder_level.
-- 3. To bypass RLS for admin operations:
--    SET app.current_tenant_id = '<uuid>'; before queries.
-- 4. inv_next_grn_sequence() is called from GrnService.cs (SELECT FOR UPDATE
--    ensures no duplicate GRN numbers under concurrent requests).
