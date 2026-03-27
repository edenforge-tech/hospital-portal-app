-- PHASE 1: CRITICAL GATES MIGRATION (Jan 30, 2026)
-- Adds walkout/refund/emergency override/bill locking support

-- 1. Update visits table
ALTER TABLE visits
  ADD COLUMN status VARCHAR(20) DEFAULT 'created',
  ADD COLUMN walkout_reason VARCHAR(100),
  ADD COLUMN walkout_at TIMESTAMP,
  ADD COLUMN emergency_override BOOLEAN DEFAULT FALSE,
  ADD COLUMN override_reason VARCHAR(100),
  ADD COLUMN override_authorized_by UUID;

-- 2. Update opd_bills table
ALTER TABLE opd_bills
  ADD COLUMN is_finalized BOOLEAN DEFAULT FALSE,
  ADD COLUMN finalized_at TIMESTAMP,
  ADD COLUMN finalized_by_user_id UUID,
  ADD COLUMN refund_status VARCHAR(20) DEFAULT 'none',
  ADD COLUMN refund_amount DECIMAL(10,2),
  ADD COLUMN refund_reason VARCHAR(200);

-- 3. Create refunds table
CREATE TABLE refunds (
  id UUID PRIMARY KEY,
  bill_id UUID REFERENCES opd_bills(id),
  patient_id UUID REFERENCES patient(id),
  visit_id UUID REFERENCES visits(id),
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason VARCHAR(200),
  refund_mode VARCHAR(50),
  requested_by_user_id UUID,
  requested_at TIMESTAMP DEFAULT NOW(),
  authorized_by_user_id UUID,
  authorized_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_refunds_bill_id ON refunds(bill_id);
CREATE INDEX idx_refunds_patient_id ON refunds(patient_id);
CREATE INDEX idx_refunds_visit_id ON refunds(visit_id);
CREATE INDEX idx_refunds_tenant_id ON refunds(tenant_id);

-- End of migration
