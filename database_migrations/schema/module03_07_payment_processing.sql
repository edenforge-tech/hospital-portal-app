-- =====================================================
-- Module 3: Counselor Management - Payment Processing
-- Migration: module03_07_payment_processing.sql
-- Description: Hybrid payment system (online + manual + government schemes)
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. PAYMENT TRANSACTIONS (Comprehensive Payment Records)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Session & Patient Links
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    package_id UUID, -- Links to counselor_packages
    
    -- Transaction Details
    transaction_number VARCHAR(100) UNIQUE,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Payment Breakdown
    total_bill_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    net_payable_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2),
    
    -- Payment Method
    payment_method VARCHAR(50) CHECK (payment_method IN (
        'Cash', 
        'Card', 
        'UPI', 
        'Cheque', 
        'BankTransfer', 
        'OnlineGateway', 
        'GovernmentScheme', 
        'Insurance',
        'Mixed' -- Multiple payment methods
    )),
    
    -- Mixed Payment Breakdown (for split payments)
    payment_breakdown JSONB,
    /* Example:
    [
        {"method": "Cash", "amount": 10000},
        {"method": "Card", "amount": 25000},
        {"method": "Insurance", "amount": 30000}
    ]
    */
    
    -- Online Payment Gateway (Razorpay)
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(500),
    gateway_response JSONB,
    
    -- Card Payment Details
    card_last_four VARCHAR(4),
    card_type VARCHAR(20), -- 'Visa', 'Mastercard', 'Amex', 'Rupay'
    card_approval_code VARCHAR(50),
    
    -- UPI Details
    upi_transaction_id VARCHAR(100),
    upi_vpa VARCHAR(100),
    
    -- Cheque Details
    cheque_number VARCHAR(50),
    cheque_date DATE,
    cheque_bank_name VARCHAR(200),
    cheque_clearance_status VARCHAR(30) CHECK (cheque_clearance_status IN ('Pending', 'Cleared', 'Bounced', 'Cancelled')),
    cheque_cleared_date DATE,
    
    -- Bank Transfer Details
    bank_reference_number VARCHAR(100),
    bank_name VARCHAR(200),
    transfer_date DATE,
    
    -- Government Scheme Link
    government_scheme_claim_id UUID,
    
    -- Insurance Link
    insurance_pre_auth_id UUID,
    
    -- Status
    payment_status VARCHAR(30) DEFAULT 'Pending' CHECK (payment_status IN (
        'Pending', 
        'Processing', 
        'Completed', 
        'PartiallyPaid', 
        'Failed', 
        'Refunded', 
        'Cancelled'
    )),
    
    -- Receipt
    receipt_number VARCHAR(100),
    receipt_generated_at TIMESTAMPTZ,
    receipt_url TEXT,
    
    -- Refund Handling
    refund_amount DECIMAL(12,2) DEFAULT 0,
    refund_date TIMESTAMPTZ,
    refund_reason TEXT,
    refund_reference_number VARCHAR(100),
    
    -- Reconciliation
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMPTZ,
    reconciled_by_user_id UUID,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_payment_txn_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_txn_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_payment_txn_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_payment_txn_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_payment_txn_package FOREIGN KEY (package_id) REFERENCES counselor_packages(id),
    CONSTRAINT fk_payment_txn_govt_scheme FOREIGN KEY (government_scheme_claim_id) REFERENCES government_scheme_claims(id),
    CONSTRAINT fk_payment_txn_insurance FOREIGN KEY (insurance_pre_auth_id) REFERENCES insurance_pre_authorizations(id),
    CONSTRAINT fk_payment_txn_reconciled_by FOREIGN KEY (reconciled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_payment_txn_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 2. PAYMENT LINKS (SMS/Email/QR Code payment links)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Transaction Link
    transaction_id UUID NOT NULL,
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Link Details
    payment_link_id VARCHAR(100) UNIQUE, -- Razorpay Payment Link ID
    short_url TEXT,
    full_url TEXT,
    qr_code_url TEXT,
    
    -- Amount
    link_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Delivery
    sent_via VARCHAR(20) CHECK (sent_via IN ('SMS', 'Email', 'WhatsApp', 'QRCode', 'Manual')),
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(200),
    sent_at TIMESTAMPTZ,
    
    -- Status
    link_status VARCHAR(30) DEFAULT 'Active' CHECK (link_status IN ('Active', 'Paid', 'Expired', 'Cancelled')),
    
    -- Validity
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Payment Tracking
    paid_at TIMESTAMPTZ,
    payment_transaction_id UUID, -- Links back to payment_transactions
    
    -- Reminders
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    
    -- Constraints
    CONSTRAINT fk_payment_link_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_link_transaction FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_link_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_payment_link_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_payment_link_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. GOVERNMENT SCHEME CLAIMS (ESH, CGHS, Arograshree, SGHS)
-- =====================================================
CREATE TABLE IF NOT EXISTS government_scheme_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Session & Patient Links
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    package_id UUID,
    
    -- Scheme Details
    claim_number VARCHAR(100) UNIQUE,
    scheme_type VARCHAR(50) CHECK (scheme_type IN ('ESH', 'CGHS', 'Arograshree', 'SGHS', 'Other')),
    beneficiary_id VARCHAR(100), -- Scheme-specific ID (e.g., CGHS card number)
    beneficiary_name VARCHAR(200),
    
    -- Surgery Details
    surgery_type VARCHAR(100),
    procedure_code VARCHAR(50),
    
    -- Financial
    total_bill_amount DECIMAL(12,2) NOT NULL,
    scheme_covered_amount DECIMAL(12,2),
    patient_copay_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Submission
    submitted_to_authority_at TIMESTAMPTZ,
    submitted_by_user_id UUID,
    submission_reference_number VARCHAR(100),
    
    -- Status
    claim_status VARCHAR(50) DEFAULT 'Draft' CHECK (claim_status IN (
        'Draft',
        'DocumentsPending',
        'ReadyToSubmit',
        'SubmittedToAuthority',
        'UnderReview',
        'QueryRaised',
        'Approved',
        'PartiallyApproved',
        'Rejected',
        'PaymentProcessing',
        'PaymentReceived',
        'Closed'
    )),
    
    -- Authority Response
    authority_approval_number VARCHAR(100),
    authority_approval_date DATE,
    approved_amount DECIMAL(12,2),
    rejection_reason TEXT,
    
    -- Payment Receipt
    payment_received_date DATE,
    payment_reference_number VARCHAR(100),
    payment_mode VARCHAR(50),
    
    -- Documents
    required_documents TEXT[],
    submitted_documents_urls TEXT[],
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_govt_claim_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_govt_claim_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_govt_claim_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_govt_claim_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_govt_claim_package FOREIGN KEY (package_id) REFERENCES counselor_packages(id),
    CONSTRAINT fk_govt_claim_submitted_by FOREIGN KEY (submitted_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_govt_claim_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 4. CHEQUE CLEARANCE TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS cheque_clearance_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Payment Link
    transaction_id UUID NOT NULL,
    
    -- Cheque Details
    cheque_number VARCHAR(50) NOT NULL,
    cheque_date DATE NOT NULL,
    cheque_amount DECIMAL(12,2) NOT NULL,
    bank_name VARCHAR(200),
    account_holder_name VARCHAR(200),
    
    -- Deposit Details
    deposited_at TIMESTAMPTZ,
    deposited_by_user_id UUID,
    deposit_slip_number VARCHAR(100),
    
    -- Clearance Tracking
    clearance_status VARCHAR(30) DEFAULT 'Pending' CHECK (clearance_status IN ('Pending', 'Deposited', 'Clearing', 'Cleared', 'Bounced', 'Cancelled')),
    expected_clearance_date DATE,
    actual_clearance_date DATE,
    
    -- Bounce Handling
    bounce_reason TEXT,
    bounce_charges DECIMAL(10,2) DEFAULT 0,
    bounce_handled_by_user_id UUID,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_cheque_tracking_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_cheque_tracking_transaction FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_cheque_tracking_deposited_by FOREIGN KEY (deposited_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_cheque_tracking_handled_by FOREIGN KEY (bounce_handled_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 5. PAYMENT RECONCILIATION LOG (Daily Settlement)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_reconciliation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Reconciliation Period
    reconciliation_date DATE NOT NULL,
    shift_type VARCHAR(20) CHECK (shift_type IN ('Morning', 'Evening', 'FullDay')),
    
    -- Cash Reconciliation
    cash_opening_balance DECIMAL(12,2) DEFAULT 0,
    cash_received DECIMAL(12,2) DEFAULT 0,
    cash_refunded DECIMAL(12,2) DEFAULT 0,
    cash_expected_closing DECIMAL(12,2),
    cash_actual_closing DECIMAL(12,2),
    cash_variance DECIMAL(12,2),
    
    -- Card Reconciliation
    card_transactions_count INTEGER DEFAULT 0,
    card_total_amount DECIMAL(12,2) DEFAULT 0,
    card_settlement_amount DECIMAL(12,2),
    
    -- UPI Reconciliation
    upi_transactions_count INTEGER DEFAULT 0,
    upi_total_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Cheque Reconciliation
    cheques_received_count INTEGER DEFAULT 0,
    cheques_total_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Online Gateway
    gateway_transactions_count INTEGER DEFAULT 0,
    gateway_total_amount DECIMAL(12,2) DEFAULT 0,
    gateway_fees DECIMAL(12,2) DEFAULT 0,
    
    -- Overall Summary
    total_transactions_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    reconciliation_status VARCHAR(30) DEFAULT 'Pending' CHECK (reconciliation_status IN ('Pending', 'InProgress', 'Completed', 'VarianceFound', 'Approved')),
    
    -- Approver
    reconciled_by_user_id UUID,
    reconciled_at TIMESTAMPTZ,
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    variance_explanation TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_reconciliation_log_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_reconciliation_log_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_reconciliation_log_reconciled_by FOREIGN KEY (reconciled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_reconciliation_log_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 6. RAZORPAY CALLBACKS (Webhook Events)
-- =====================================================
CREATE TABLE IF NOT EXISTS razorpay_callbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Webhook Details
    event_id VARCHAR(100) UNIQUE,
    event_type VARCHAR(100), -- 'payment.captured', 'payment.failed', etc.
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Payload
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    signature_verified BOOLEAN DEFAULT FALSE,
    
    -- Linked Transaction
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    transaction_id UUID, -- Links to payment_transactions
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processing_error TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_razorpay_callback_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_razorpay_callback_transaction FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Payment Transactions
CREATE INDEX IF NOT EXISTS idx_payment_txn_tenant_branch ON payment_transactions(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_txn_session ON payment_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_patient ON payment_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_status ON payment_transactions(payment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_txn_date ON payment_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_txn_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_txn_razorpay ON payment_transactions(razorpay_order_id, razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_reconciliation ON payment_transactions(reconciled) WHERE reconciled = FALSE;

-- Payment Links
CREATE INDEX IF NOT EXISTS idx_payment_links_transaction ON payment_links(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_patient ON payment_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(link_status);
CREATE INDEX IF NOT EXISTS idx_payment_links_expiry ON payment_links(expires_at) WHERE link_status = 'Active';

-- Government Scheme Claims
CREATE INDEX IF NOT EXISTS idx_govt_claims_tenant_branch ON government_scheme_claims(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_govt_claims_session ON government_scheme_claims(session_id);
CREATE INDEX IF NOT EXISTS idx_govt_claims_patient ON government_scheme_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_govt_claims_status ON government_scheme_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_govt_claims_scheme_type ON government_scheme_claims(scheme_type, claim_status);

-- Cheque Clearance Tracking
CREATE INDEX IF NOT EXISTS idx_cheque_tracking_transaction ON cheque_clearance_tracking(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cheque_tracking_status ON cheque_clearance_tracking(clearance_status);
CREATE INDEX IF NOT EXISTS idx_cheque_tracking_clearance_date ON cheque_clearance_tracking(expected_clearance_date) WHERE clearance_status IN ('Deposited', 'Clearing');

-- Payment Reconciliation Log
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_tenant_branch ON payment_reconciliation_log(tenant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_date ON payment_reconciliation_log(reconciliation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_log_status ON payment_reconciliation_log(reconciliation_status);

-- Razorpay Callbacks
CREATE INDEX IF NOT EXISTS idx_razorpay_callbacks_event_id ON razorpay_callbacks(event_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_callbacks_order_id ON razorpay_callbacks(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_callbacks_processed ON razorpay_callbacks(processed) WHERE processed = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_scheme_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheque_clearance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE razorpay_callbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_payment_txn ON payment_transactions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_payment_links ON payment_links
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_govt_claims ON government_scheme_claims
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_cheque_tracking ON cheque_clearance_tracking
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_reconciliation_log ON payment_reconciliation_log
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_razorpay_callbacks ON razorpay_callbacks
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- TRIGGER: Auto-generate Transaction Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_code VARCHAR(50);
    v_sequence INTEGER;
BEGIN
    -- Get branch code
    SELECT code INTO v_branch_code FROM branch WHERE id = NEW.branch_id;
    v_branch_code := COALESCE(v_branch_code, 'HQ');
    
    -- Get next sequence number for the day
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM payment_transactions
    WHERE branch_id = NEW.branch_id
    AND DATE(transaction_date) = CURRENT_DATE
    AND deleted_at IS NULL;
    
    -- Generate transaction number: PAY-<BRANCH>-<YYYYMMDD>-<SEQ>
    NEW.transaction_number := 'PAY-' || v_branch_code || '-' || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 5, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_transaction_number
    BEFORE INSERT ON payment_transactions
    FOR EACH ROW
    WHEN (NEW.transaction_number IS NULL)
    EXECUTE FUNCTION generate_transaction_number();

COMMENT ON TABLE payment_transactions IS 'Comprehensive payment records supporting multiple payment methods';
COMMENT ON TABLE payment_links IS 'SMS/Email/QR code payment links for online collections';
COMMENT ON TABLE government_scheme_claims IS 'Government scheme claims (ESH, CGHS, Arograshree, SGHS)';
COMMENT ON TABLE cheque_clearance_tracking IS 'Cheque deposit and clearance workflow tracking';
COMMENT ON TABLE payment_reconciliation_log IS 'Daily payment reconciliation and settlement records';
COMMENT ON TABLE razorpay_callbacks IS 'Razorpay webhook events for payment status updates';
