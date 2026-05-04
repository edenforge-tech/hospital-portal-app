-- =============================================================================
-- Migration 101: Vendor Enhancements
-- Adds 9 missing columns to inv_vendors for Indian eye-hospital vendor mgmt.
-- =============================================================================

BEGIN;

-- ── 1. Add new columns ──────────────────────────────────────────────────────
ALTER TABLE inv_vendors
    ADD COLUMN IF NOT EXISTS vendor_code              VARCHAR(50),
    ADD COLUMN IF NOT EXISTS vendor_category          VARCHAR(50)  DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS is_preferred             BOOLEAN      DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS registered_address       TEXT,
    ADD COLUMN IF NOT EXISTS website                  VARCHAR(300),
    ADD COLUMN IF NOT EXISTS drug_license_20b_expiry  DATE,
    ADD COLUMN IF NOT EXISTS drug_license_21b_expiry  DATE,
    ADD COLUMN IF NOT EXISTS bank_account_holder_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS bank_account_type        VARCHAR(20)  DEFAULT 'current';

-- ── 2. Unique constraint on vendor_code (per tenant) ────────────────────────
ALTER TABLE inv_vendors
    DROP CONSTRAINT IF EXISTS uq_inv_vendors_code_tenant;

ALTER TABLE inv_vendors
    ADD CONSTRAINT uq_inv_vendors_code_tenant UNIQUE (tenant_id, vendor_code);

-- ── 3. Auto-generate vendor_code sequence ────────────────────────────────────
-- Sequence to generate per-tenant vendor numbers
CREATE SEQUENCE IF NOT EXISTS inv_vendor_code_seq START 1;

-- Function: inv_next_vendor_code(tenant_id) → 'VEN-YYYYMM-NNNN'
CREATE OR REPLACE FUNCTION inv_next_vendor_code(p_tenant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_year_month TEXT := TO_CHAR(NOW(), 'YYYYMM');
    v_next       INT;
BEGIN
    SELECT COALESCE(MAX(
        NULLIF(REGEXP_REPLACE(vendor_code, '^VEN-[0-9]{6}-0*', ''), '')::INT
    ), 0) + 1
    INTO v_next
    FROM inv_vendors
    WHERE tenant_id = p_tenant_id;

    RETURN 'VEN-' || v_year_month || '-' || LPAD(v_next::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger function: auto-populate vendor_code before insert when NULL
CREATE OR REPLACE FUNCTION trg_inv_vendor_code_autogen()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.vendor_code IS NULL OR NEW.vendor_code = '' THEN
        NEW.vendor_code := inv_next_vendor_code(NEW.tenant_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vendor_code ON inv_vendors;
CREATE TRIGGER trg_vendor_code
    BEFORE INSERT ON inv_vendors
    FOR EACH ROW EXECUTE FUNCTION trg_inv_vendor_code_autogen();

-- ── 4. Back-fill vendor_code for existing rows ───────────────────────────────
DO $$
DECLARE
    v_row RECORD;
    v_seq INT := 1;
    v_prev_tenant UUID := NULL;
BEGIN
    FOR v_row IN
        SELECT id, tenant_id
        FROM inv_vendors
        WHERE vendor_code IS NULL
        ORDER BY tenant_id, created_at
    LOOP
        IF v_row.tenant_id <> COALESCE(v_prev_tenant, '00000000-0000-0000-0000-000000000000'::UUID) THEN
            v_seq := 1;
        END IF;
        UPDATE inv_vendors
        SET vendor_code = 'VEN-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(v_seq::TEXT, 4, '0')
        WHERE id = v_row.id;
        v_seq := v_seq + 1;
        v_prev_tenant := v_row.tenant_id;
    END LOOP;
END;
$$;

-- ── 5. Enrich existing seed vendors with real invoice data ───────────────────

-- Carl Zeiss India Pvt Ltd — IOL / Optical, Deutsche Bank
UPDATE inv_vendors SET
    vendor_category          = 'iol_optical',
    is_preferred             = TRUE,
    website                  = 'https://www.zeiss.com/meditec/in/',
    drug_license_number      = 'TG/16/01/2016-17150/17151',
    drug_license_20b         = 'TG/16/01/2016-17150',
    drug_license_21b         = 'TG/16/01/2016-17151',
    cin_number               = 'U33302MH1995PTC084724',
    bank_name                = 'Deutsche Bank',
    bank_ifsc_code           = 'DEUT0797BGL',
    bank_account_holder_name = 'Carl Zeiss India Pvt Ltd',
    bank_account_type        = 'current',
    swift_code               = 'DEUTDEDBBAN',
    credit_days              = 30
WHERE name ILIKE 'Carl Zeiss%';

-- Biotech Vision Care Pvt Ltd — IOL / Optical
UPDATE inv_vendors SET
    vendor_category          = 'iol_optical',
    is_preferred             = TRUE,
    drug_license_number      = 'AP/24/-5/2014-117187',
    drug_license_20b         = 'AP/24/-5/2014-117187',
    drug_license_21b         = 'AP/24/-5/2014-117188',
    cin_number               = 'U33127GJ1999PTC035762',
    bank_account_holder_name = 'Biotech Vision Care Pvt Ltd',
    bank_account_type        = 'current',
    credit_days              = 45
WHERE name ILIKE 'Biotech Vision Care%';

-- Corneal Vision Care — IOL / Optical, ICICI Bank
UPDATE inv_vendors SET
    vendor_category          = 'iol_optical',
    is_preferred             = FALSE,
    drug_license_number      = 'TS/HYD/2022-91245',
    drug_license_20b         = 'TS/HYD/2022-91245',
    bank_name                = 'ICICI Bank',
    bank_ifsc_code           = 'ICIC0004697',
    bank_account_holder_name = 'Corneal Vision Care',
    bank_account_type        = 'current',
    credit_days              = 30
WHERE name ILIKE 'Corneal Vision Care%';

-- Rudra Pharma — Pharmaceutical, ICICI Bank
UPDATE inv_vendors SET
    vendor_category          = 'pharmaceutical',
    is_preferred             = TRUE,
    drug_license_number      = 'TS/RR/2019-53635',
    drug_license_20b         = 'TS/RR/2019-53635',
    drug_license_21b         = 'TS/RR/2019-53635',
    bank_name                = 'ICICI Bank',
    bank_ifsc_code           = 'ICIC0001314',
    bank_account_holder_name = 'Rudra Pharma',
    bank_account_type        = 'current',
    credit_days              = 15
WHERE name ILIKE 'Rudra Pharma%';

-- Royal Medical Hall — Pharmaceutical
UPDATE inv_vendors SET
    vendor_category          = 'pharmaceutical',
    is_preferred             = FALSE,
    drug_license_number      = 'TG/24/05/2014-3062/3063',
    drug_license_20b         = 'TG/24/05/2014-3062',
    drug_license_21b         = 'TG/24/05/2014-3063',
    bank_account_holder_name = 'Royal Medical Hall',
    bank_account_type        = 'savings',
    credit_days              = 0
WHERE name ILIKE 'Royal Medical Hall%';

-- Drug Mart — Pharmaceutical (cold-chain pharmacy)
UPDATE inv_vendors SET
    vendor_category          = 'pharmaceutical',
    is_preferred             = FALSE,
    drug_license_number      = '20B:40/HD/AP/2008/W',
    drug_license_20b         = '40/HD/AP/2008/W',
    is_cold_chain_vendor     = TRUE,
    bank_account_holder_name = 'Drug Mart',
    bank_account_type        = 'savings',
    credit_days              = 0
WHERE name ILIKE 'Drug Mart%';

-- Ganga Pharma — Pharmaceutical, HDFC Bank
UPDATE inv_vendors SET
    vendor_category          = 'pharmaceutical',
    is_preferred             = FALSE,
    drug_license_number      = '20B:Vasavi/HD/AP/96',
    drug_license_20b         = 'Vasavi/HD/AP/96',
    bank_name                = 'HDFC Bank',
    bank_ifsc_code           = 'HDFC0009087',
    bank_account_holder_name = 'Ganga Pharma',
    bank_account_type        = 'current',
    credit_days              = 30
WHERE name ILIKE 'Ganga Pharma%';

-- Sree AV Surgicals — Surgical, HDFC Bank
UPDATE inv_vendors SET
    vendor_category          = 'surgical',
    is_preferred             = FALSE,
    bank_name                = 'HDFC Bank',
    bank_ifsc_code           = 'HDFC0001628',
    bank_account_holder_name = 'Sree AV Surgicals',
    bank_account_type        = 'current',
    credit_days              = 15
WHERE name ILIKE 'Sree AV Surgicals%';

-- WIIZ Health Tech Pvt Ltd — Surgical/MedTech, SBI
UPDATE inv_vendors SET
    vendor_category          = 'surgical',
    is_preferred             = FALSE,
    website                  = 'https://www.wiiz.in',
    drug_license_number      = 'TG/16/01/2016-19726',
    drug_license_20b         = 'TG/16/01/2016-19726',
    bank_name                = 'State Bank of India',
    bank_ifsc_code           = 'SBIN0008026',
    bank_account_holder_name = 'WIIZ Health Tech Pvt Ltd',
    bank_account_type        = 'current',
    credit_days              = 60
WHERE name ILIKE 'WIIZ Health Tech%';

-- ── 6. vendor_category check constraint ──────────────────────────────────────
ALTER TABLE inv_vendors
    DROP CONSTRAINT IF EXISTS chk_vendor_category;

ALTER TABLE inv_vendors
    ADD CONSTRAINT chk_vendor_category
    CHECK (vendor_category IN (
        'pharmaceutical', 'iol_optical', 'surgical',
        'cold_chain', 'general_supplies', 'general_stores', 'general'
    ));

-- ── 7. bank_account_type check constraint ────────────────────────────────────
ALTER TABLE inv_vendors
    DROP CONSTRAINT IF EXISTS chk_vendor_bank_acct_type;

ALTER TABLE inv_vendors
    ADD CONSTRAINT chk_vendor_bank_acct_type
    CHECK (bank_account_type IN ('current', 'savings', 'cc', 'od'));

-- ── 8. Deduplicate: keep the oldest vendor_code per (tenant_id, name) ─────────
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY tenant_id, lower(name)
               ORDER BY vendor_code ASC NULLS LAST
           ) AS rn
    FROM inv_vendors
    WHERE deleted_at IS NULL
)
UPDATE inv_vendors
SET    deleted_at  = NOW(),
       status      = 'inactive',
       updated_at  = NOW()
WHERE  id IN (SELECT id FROM ranked WHERE rn > 1);

COMMIT;
