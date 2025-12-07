-- =====================================================
-- ADDITIONAL MISSING TABLES
-- Adds remaining tables referenced in MASTER_DATABASE_MIGRATIONS.sql
-- Hospital Portal - Completing the 96 Table Target
-- =====================================================

-- =====================================================
-- PHASE 1: ADD MISSING ORGANIZATIONAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS sub_department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    department_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    head_user_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 2: ADD MISSING PATIENT MANAGEMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_allergy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    allergen VARCHAR(255) NOT NULL,
    severity VARCHAR(50), -- 'mild', 'moderate', 'severe', 'life_threatening'
    reaction TEXT,
    onset_date DATE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS patient_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    diagnosis_date DATE,
    status VARCHAR(50), -- 'active', 'resolved', 'chronic'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS patient_vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    encounter_id UUID,
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    temperature_unit VARCHAR(10) DEFAULT 'C',
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 3: ADD MISSING APPOINTMENT MANAGEMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS appointment_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    category VARCHAR(50), -- 'consultation', 'procedure', 'follow_up', 'emergency'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS appointment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    status_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    changed_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 4: ADD MISSING INVENTORY MANAGEMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    unit_of_measure VARCHAR(50),
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    current_stock INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier VARCHAR(255),
    expiry_date DATE,
    batch_number VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS inventory_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    item_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'transfer', 'expiry'
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_number VARCHAR(100),
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 5: ADD MISSING STAFF MANAGEMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    department_id UUID,
    schedule_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    shift_type VARCHAR(50), -- 'morning', 'afternoon', 'night', 'on_call'
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS staff_qualification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    qualification_name VARCHAR(255) NOT NULL,
    qualification_code VARCHAR(50),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending',
    document_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 6: ADD MISSING REPORTING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS report_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    template_type VARCHAR(50), -- 'operational', 'financial', 'clinical', 'administrative'
    query_definition JSONB,
    parameters JSONB,
    is_system_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS report_execution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    template_id UUID,
    report_name VARCHAR(255) NOT NULL,
    execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parameters_used JSONB,
    execution_time_seconds INTEGER,
    record_count INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    file_path VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 7: ADD MISSING COMMUNICATION TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sender_user_id UUID NOT NULL,
    recipient_user_id UUID,
    recipient_group VARCHAR(100),
    subject VARCHAR(500),
    message_body TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'direct', -- 'direct', 'broadcast', 'system'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'sent', -- 'draft', 'sent', 'delivered', 'read'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- 'appointment', 'result', 'alert', 'reminder', 'system'
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'unread', -- 'unread', 'read', 'archived'
    action_url VARCHAR(500),
    data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PHASE 8: ADD MISSING SYSTEM TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS system_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    log_level VARCHAR(20) NOT NULL, -- 'debug', 'info', 'warning', 'error', 'critical'
    category VARCHAR(100),
    message TEXT NOT NULL,
    source VARCHAR(255),
    user_id UUID,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    additional_data JSONB,
    log_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'differential'
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    error_message TEXT,
    initiated_by_user_id UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID
);

-- =====================================================
-- PHASE 9: ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE sub_department ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_allergy ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_qualification ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_execution ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY tenant_isolation_sub_department ON sub_department
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_allergy ON patient_allergy
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_medical_history ON patient_medical_history
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_vital_signs ON patient_vital_signs
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_appointment_type ON appointment_type
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_appointment_status ON appointment_status
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_inventory_item ON inventory_item
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_inventory_transaction ON inventory_transaction
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_staff_schedule ON staff_schedule
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_staff_qualification ON staff_qualification
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_report_template ON report_template
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_report_execution ON report_execution
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_message ON message
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_notification ON notification
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- System tables don't need tenant isolation
CREATE POLICY system_access_system_log ON system_log FOR ALL USING (true);
CREATE POLICY system_access_backup_history ON backup_history FOR ALL USING (true);

-- =====================================================
-- PHASE 10: CREATE PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sub_department_tenant ON sub_department(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sub_department_deleted ON sub_department(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_allergy_patient ON patient_allergy(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_allergy_deleted ON patient_allergy(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_medical_history_patient ON patient_medical_history(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_history_deleted ON patient_medical_history(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_vital_signs_patient ON patient_vital_signs(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_vital_signs_date ON patient_vital_signs(tenant_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_patient_vital_signs_deleted ON patient_vital_signs(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointment_type_tenant ON appointment_type(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_type_deleted ON appointment_type(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointment_status_appointment ON appointment_status(tenant_id, appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status_deleted ON appointment_status(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_item_tenant ON inventory_item(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_category ON inventory_item(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_item_deleted ON inventory_item(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_transaction_item ON inventory_transaction(tenant_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_date ON inventory_transaction(tenant_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_deleted ON inventory_transaction(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_schedule_user ON staff_schedule(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_date ON staff_schedule(tenant_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_deleted ON staff_schedule(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_qualification_user ON staff_qualification(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_staff_qualification_deleted ON staff_qualification(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_report_template_tenant ON report_template(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_template_deleted ON report_template(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_report_execution_template ON report_execution(tenant_id, template_id);
CREATE INDEX IF NOT EXISTS idx_report_execution_date ON report_execution(tenant_id, execution_date);
CREATE INDEX IF NOT EXISTS idx_report_execution_deleted ON report_execution(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_message_sender ON message(tenant_id, sender_user_id);
CREATE INDEX IF NOT EXISTS idx_message_recipient ON message(tenant_id, recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_message_sent ON message(tenant_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_message_deleted ON message(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notification_type ON notification(tenant_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notification(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_deleted ON notification(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_system_log_date ON system_log(log_date);
CREATE INDEX IF NOT EXISTS idx_system_log_level ON system_log(log_level);
CREATE INDEX IF NOT EXISTS idx_system_log_category ON system_log(category);

CREATE INDEX IF NOT EXISTS idx_backup_history_date ON backup_history(backup_date);
CREATE INDEX IF NOT EXISTS idx_backup_history_type ON backup_history(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);

-- =====================================================
-- PHASE 11: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample appointment types
INSERT INTO appointment_type (tenant_id, name, code, description, duration_minutes, category)
SELECT t.id, 'General Consultation', 'GC', 'Standard patient consultation', 30, 'consultation'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'Eye Examination', 'EE', 'Comprehensive eye examination', 45, 'consultation'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'Follow-up Visit', 'FU', 'Follow-up appointment', 15, 'follow_up'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ON CONFLICT DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_item (tenant_id, name, code, category, description, unit_of_measure, minimum_stock, current_stock, unit_cost)
SELECT t.id, 'Latanoprost 0.005% Eye Drops', 'MED001', 'Medication', 'Glaucoma treatment medication', 'Bottle', 10, 50, 25.00
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'Timolol 0.5% Eye Drops', 'MED002', 'Medication', 'Beta-blocker for glaucoma', 'Bottle', 10, 30, 15.00
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'Eye Examination Kit', 'SUP001', 'Supplies', 'Basic eye examination supplies', 'Kit', 5, 20, 50.00
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Additional missing tables migration completed successfully' as status;