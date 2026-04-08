-- =====================================================
-- CREATE QUEUE_ITEM TABLE - Front Office Module
-- =====================================================
-- Creates queue_item table for queue management system
-- Used by QueueController and VisitsController
-- =====================================================

-- Drop table if exists (for clean re-creation)
DROP TABLE IF EXISTS queue_item CASCADE;

-- Create queue_item table
CREATE TABLE queue_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID NOT NULL REFERENCES branch(id),
    department_id UUID REFERENCES department(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    appointment_id UUID REFERENCES appointment(id),
    visit_id UUID REFERENCES visits(id),
    token_number VARCHAR(50) NOT NULL,
    queue_type VARCHAR(50) NOT NULL DEFAULT 'Doctor', -- Optometry, Doctor, Billing, Pharmacy
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- waiting, called, in-progress, completed, absent
    priority VARCHAR(50) NOT NULL DEFAULT 'normal', -- normal, emergency, follow-up
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    doctor_name VARCHAR(200),
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_queue_item_tenant ON queue_item(tenant_id) WHERE status = 'waiting';
CREATE INDEX idx_queue_item_branch ON queue_item(branch_id, status);
CREATE INDEX idx_queue_item_patient ON queue_item(patient_id);
CREATE INDEX idx_queue_item_checked_in ON queue_item(checked_in_at);
CREATE INDEX idx_queue_item_status ON queue_item(status);

-- Add RLS policy
ALTER TABLE queue_item ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON queue_item;
CREATE POLICY tenant_isolation ON queue_item
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON queue_item TO PUBLIC;

-- Add comment
COMMENT ON TABLE queue_item IS 'Queue management for front office - tracks patient flow through different service stations';

-- =====================================================
-- VALIDATION
-- =====================================================
SELECT 
    'queue_item table created successfully' as status,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'queue_item') as column_count,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'queue_item') as index_count
FROM queue_item;

COMMIT;
