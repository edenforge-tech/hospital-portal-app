-- OPD Visit & Billing Migration
-- This script creates the OPD workflow tables for Phase 1
-- Run this in Azure PostgreSQL

-- First, mark the problematic HIPAA migration as applied (it was already partially applied)
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260113154156_AddHipaaComplianceColumnsToUsers', '9.0.0'
WHERE NOT EXISTS (SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260113154156_AddHipaaComplianceColumnsToUsers');

-- Mark FollowUp migration as applied if the tables already exist
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260128110118_AddFollowUpManagementTables', '9.0.0'
WHERE NOT EXISTS (SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260128110118_AddFollowUpManagementTables');

-- ============================================================================
-- BILLING RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_rules (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid,
    visit_type character varying(30) NOT NULL,
    free_days integer NOT NULL DEFAULT 0,
    free_visits integer NOT NULL DEFAULT 0,
    condition character varying(30) NOT NULL DEFAULT 'first_reached',
    default_fee numeric(10,2) NOT NULL,
    priority integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT TRUE,
    description text,
    effective_from timestamp with time zone NOT NULL DEFAULT NOW(),
    effective_to timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    created_by_user_id uuid NOT NULL,
    updated_by_user_id uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT "PK_billing_rules" PRIMARY KEY (id),
    CONSTRAINT "FK_billing_rules_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_billing_rules_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id),
    CONSTRAINT "FK_billing_rules_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "FK_billing_rules_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
);

-- ============================================================================
-- OPD BILLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS opd_bills (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    billing_rule_id uuid,
    bill_number character varying(50) NOT NULL,
    bill_date timestamp with time zone NOT NULL DEFAULT NOW(),
    consultation_fee numeric(10,2) NOT NULL DEFAULT 0,
    registration_fee numeric(10,2) NOT NULL DEFAULT 0,
    additional_charges numeric(10,2) NOT NULL DEFAULT 0,
    gross_amount numeric(10,2) NOT NULL DEFAULT 0,
    discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
    discount_amount numeric(10,2) NOT NULL DEFAULT 0,
    tax_amount numeric(10,2) NOT NULL DEFAULT 0,
    net_amount numeric(10,2) NOT NULL DEFAULT 0,
    amount_paid numeric(10,2) NOT NULL DEFAULT 0,
    balance_due numeric(10,2) NOT NULL DEFAULT 0,
    status character varying(30) NOT NULL DEFAULT 'pending',
    is_free_visit boolean NOT NULL DEFAULT FALSE,
    free_visit_reason text,
    is_credit boolean NOT NULL DEFAULT FALSE,
    credit_approved_by uuid,
    credit_approved_at timestamp with time zone,
    credit_notes text,
    is_insurance boolean NOT NULL DEFAULT FALSE,
    insurance_provider character varying(200),
    insurance_policy_number character varying(100),
    insurance_claim_amount numeric(10,2) NOT NULL DEFAULT 0,
    bill_items jsonb,
    notes text,
    generated_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    created_by_user_id uuid NOT NULL,
    updated_by_user_id uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT "PK_opd_bills" PRIMARY KEY (id),
    CONSTRAINT "FK_opd_bills_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bills_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bills_appointment_appointment_id" FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bills_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bills_billing_rules_billing_rule_id" FOREIGN KEY (billing_rule_id) REFERENCES billing_rules (id),
    CONSTRAINT "FK_opd_bills_users_credit_approved_by" FOREIGN KEY (credit_approved_by) REFERENCES users (id),
    CONSTRAINT "FK_opd_bills_users_generated_by" FOREIGN KEY (generated_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bills_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bills_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
);

-- ============================================================================
-- OPD BILL PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS opd_bill_payments (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    opd_bill_id uuid NOT NULL,
    payment_reference character varying(50) NOT NULL,
    payment_mode character varying(30) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date timestamp with time zone NOT NULL DEFAULT NOW(),
    card_type character varying(30),
    card_last_four character varying(4),
    card_network character varying(30),
    upi_id character varying(100),
    upi_transaction_id character varying(100),
    bank_name character varying(100),
    cheque_number character varying(50),
    insurance_claim_id character varying(100),
    insurance_response text,
    received_by uuid,
    receipt_number character varying(50),
    status character varying(30) NOT NULL DEFAULT 'completed',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    created_by_user_id uuid NOT NULL,
    updated_by_user_id uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT "PK_opd_bill_payments" PRIMARY KEY (id),
    CONSTRAINT "FK_opd_bill_payments_opd_bills_opd_bill_id" FOREIGN KEY (opd_bill_id) REFERENCES opd_bills (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bill_payments_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bill_payments_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "FK_opd_bill_payments_users_received_by" FOREIGN KEY (received_by) REFERENCES users (id),
    CONSTRAINT "FK_opd_bill_payments_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
);

-- ============================================================================
-- TOKEN SEQUENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS token_sequences (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    sequence_date date NOT NULL,
    current_sequence integer NOT NULL DEFAULT 0,
    branch_prefix character varying(10),
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    CONSTRAINT "PK_token_sequences" PRIMARY KEY (id),
    CONSTRAINT "FK_token_sequences_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_token_sequences_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
    CONSTRAINT "UQ_token_sequences_branch_date" UNIQUE (branch_id, sequence_date)
);

-- ============================================================================
-- VISITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS visits (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    opd_bill_id uuid,
    branch_id uuid NOT NULL,
    consultant_id uuid,
    department_id uuid,
    visit_type character varying(30) NOT NULL,
    visit_category character varying(30) NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'checked_in',
    token_number character varying(20) NOT NULL,
    token_sequence integer NOT NULL DEFAULT 0,
    checked_in_at timestamp with time zone,
    checked_in_by uuid,
    current_station character varying(50),
    assigned_to uuid,
    assigned_at timestamp with time zone,
    completed_at timestamp with time zone,
    completed_by uuid,
    outcome character varying(50),
    outcome_notes text,
    is_emergency boolean NOT NULL DEFAULT FALSE,
    emergency_authorized_by uuid,
    emergency_reason text,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone,
    created_by_user_id uuid NOT NULL,
    updated_by_user_id uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT "PK_visits" PRIMARY KEY (id),
    CONSTRAINT "FK_visits_appointment_appointment_id" FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE,
    CONSTRAINT "FK_visits_branch_branch_id" FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE CASCADE,
    CONSTRAINT "FK_visits_department_department_id" FOREIGN KEY (department_id) REFERENCES department (id),
    CONSTRAINT "FK_visits_opd_bills_opd_bill_id" FOREIGN KEY (opd_bill_id) REFERENCES opd_bills (id),
    CONSTRAINT "FK_visits_patient_patient_id" FOREIGN KEY (patient_id) REFERENCES patient (id) ON DELETE CASCADE,
    CONSTRAINT "FK_visits_tenant_tenant_id" FOREIGN KEY (tenant_id) REFERENCES tenant (id) ON DELETE CASCADE,
    CONSTRAINT "FK_visits_users_assigned_to" FOREIGN KEY (assigned_to) REFERENCES users (id),
    CONSTRAINT "FK_visits_users_checked_in_by" FOREIGN KEY (checked_in_by) REFERENCES users (id),
    CONSTRAINT "FK_visits_users_completed_by" FOREIGN KEY (completed_by) REFERENCES users (id),
    CONSTRAINT "FK_visits_users_consultant_id" FOREIGN KEY (consultant_id) REFERENCES users (id),
    CONSTRAINT "FK_visits_users_created_by_user_id" FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "FK_visits_users_emergency_authorized_by" FOREIGN KEY (emergency_authorized_by) REFERENCES users (id),
    CONSTRAINT "FK_visits_users_updated_by_user_id" FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS "IX_billing_rules_tenant_id" ON billing_rules (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_billing_rules_branch_id" ON billing_rules (branch_id);
CREATE INDEX IF NOT EXISTS "IX_billing_rules_visit_type" ON billing_rules (visit_type);
CREATE INDEX IF NOT EXISTS "IX_billing_rules_is_active" ON billing_rules (is_active);

CREATE INDEX IF NOT EXISTS "IX_opd_bills_tenant_id" ON opd_bills (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_opd_bills_patient_id" ON opd_bills (patient_id);
CREATE INDEX IF NOT EXISTS "IX_opd_bills_appointment_id" ON opd_bills (appointment_id);
CREATE INDEX IF NOT EXISTS "IX_opd_bills_branch_id" ON opd_bills (branch_id);
CREATE INDEX IF NOT EXISTS "IX_opd_bills_status" ON opd_bills (status);
CREATE INDEX IF NOT EXISTS "IX_opd_bills_bill_date" ON opd_bills (bill_date);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_opd_bills_bill_number" ON opd_bills (bill_number);

CREATE INDEX IF NOT EXISTS "IX_opd_bill_payments_tenant_id" ON opd_bill_payments (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_opd_bill_payments_opd_bill_id" ON opd_bill_payments (opd_bill_id);
CREATE INDEX IF NOT EXISTS "IX_opd_bill_payments_status" ON opd_bill_payments (status);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_opd_bill_payments_payment_reference" ON opd_bill_payments (payment_reference);

CREATE INDEX IF NOT EXISTS "IX_token_sequences_tenant_id" ON token_sequences (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_token_sequences_branch_id" ON token_sequences (branch_id);

CREATE INDEX IF NOT EXISTS "IX_visits_tenant_id" ON visits (tenant_id);
CREATE INDEX IF NOT EXISTS "IX_visits_patient_id" ON visits (patient_id);
CREATE INDEX IF NOT EXISTS "IX_visits_appointment_id" ON visits (appointment_id);
CREATE INDEX IF NOT EXISTS "IX_visits_branch_id" ON visits (branch_id);
CREATE INDEX IF NOT EXISTS "IX_visits_status" ON visits (status);
CREATE INDEX IF NOT EXISTS "IX_visits_token_number" ON visits (token_number);
CREATE INDEX IF NOT EXISTS "IX_visits_checked_in_at" ON visits (checked_in_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE billing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE opd_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE opd_bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (tenant isolation)
DROP POLICY IF EXISTS tenant_isolation_billing_rules ON billing_rules;
CREATE POLICY tenant_isolation_billing_rules ON billing_rules
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_opd_bills ON opd_bills;
CREATE POLICY tenant_isolation_opd_bills ON opd_bills
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_opd_bill_payments ON opd_bill_payments;
CREATE POLICY tenant_isolation_opd_bill_payments ON opd_bill_payments
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_token_sequences ON token_sequences;
CREATE POLICY tenant_isolation_token_sequences ON token_sequences
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

DROP POLICY IF EXISTS tenant_isolation_visits ON visits;
CREATE POLICY tenant_isolation_visits ON visits
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant rls_admin bypass
DROP POLICY IF EXISTS admin_bypass_billing_rules ON billing_rules;
CREATE POLICY admin_bypass_billing_rules ON billing_rules FOR ALL TO rls_admin USING (true);

DROP POLICY IF EXISTS admin_bypass_opd_bills ON opd_bills;
CREATE POLICY admin_bypass_opd_bills ON opd_bills FOR ALL TO rls_admin USING (true);

DROP POLICY IF EXISTS admin_bypass_opd_bill_payments ON opd_bill_payments;
CREATE POLICY admin_bypass_opd_bill_payments ON opd_bill_payments FOR ALL TO rls_admin USING (true);

DROP POLICY IF EXISTS admin_bypass_token_sequences ON token_sequences;
CREATE POLICY admin_bypass_token_sequences ON token_sequences FOR ALL TO rls_admin USING (true);

DROP POLICY IF EXISTS admin_bypass_visits ON visits;
CREATE POLICY admin_bypass_visits ON visits FOR ALL TO rls_admin USING (true);

-- Mark the migration as applied
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260129072645_AddOpdVisitBillingEntities', '9.0.0'
WHERE NOT EXISTS (SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260129072645_AddOpdVisitBillingEntities');

-- ============================================================================
-- SEED DEFAULT BILLING RULES
-- ============================================================================
INSERT INTO billing_rules (id, tenant_id, visit_type, free_days, free_visits, condition, default_fee, priority, is_active, description, created_at, created_by_user_id)
SELECT 
    gen_random_uuid(),
    t.id,
    'follow_up',
    7,
    3,
    'first_reached',
    0.00,
    1,
    true,
    'Default follow-up rule: Free within 7 days OR 3 free visits (whichever comes first)',
    NOW(),
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
FROM tenant t
WHERE NOT EXISTS (SELECT 1 FROM billing_rules WHERE tenant_id = t.id AND visit_type = 'follow_up');

INSERT INTO billing_rules (id, tenant_id, visit_type, free_days, free_visits, condition, default_fee, priority, is_active, description, created_at, created_by_user_id)
SELECT 
    gen_random_uuid(),
    t.id,
    'new',
    0,
    0,
    'first_reached',
    500.00,
    0,
    true,
    'New consultation fee: ₹500',
    NOW(),
    (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1)
FROM tenant t
WHERE NOT EXISTS (SELECT 1 FROM billing_rules WHERE tenant_id = t.id AND visit_type = 'new');

COMMIT;

-- Summary
DO $$
BEGIN
    RAISE NOTICE 'OPD Visit & Billing Migration Complete!';
    RAISE NOTICE 'Tables created: billing_rules, opd_bills, opd_bill_payments, token_sequences, visits';
    RAISE NOTICE 'RLS enabled with tenant isolation policies';
    RAISE NOTICE 'Default billing rules seeded for follow-up and new visits';
END $$;
