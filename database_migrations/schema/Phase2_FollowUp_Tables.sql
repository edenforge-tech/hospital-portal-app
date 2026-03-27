-- Phase 2 Follow-Up Management Tables Migration
-- Creates 7 tables for follow-up appointment tracking, post-op care, adherence monitoring, and patient reminders

-- ==========================================
-- 1. FOLLOW-UP APPOINTMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS follow_up_appointment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    assigned_doctor_id UUID,
    department_id UUID,
    follow_up_type VARCHAR(100) NOT NULL, -- 'routine', 'post_surgery', 'complication_check', 'monitoring'
    scheduled_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'missed', 'cancelled', 'overdue'
    priority VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
    notes TEXT,
    outcome TEXT,
    completed_date TIMESTAMPTZ,
    reminders_sent INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_followup_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_followup_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_followup_doctor FOREIGN KEY (assigned_doctor_id) REFERENCES users(id),
    CONSTRAINT fk_followup_department FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE INDEX IF NOT EXISTS idx_followup_tenant ON follow_up_appointment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_followup_patient ON follow_up_appointment(patient_id);
CREATE INDEX IF NOT EXISTS idx_followup_status ON follow_up_appointment(status);
CREATE INDEX IF NOT EXISTS idx_followup_scheduled_date ON follow_up_appointment(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followup_deleted ON follow_up_appointment(deleted_at);

-- ==========================================
-- 2. POST-OPERATIVE CARE SCHEDULE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS post_op_care_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    surgeon_id UUID,
    surgery_type VARCHAR(200) NOT NULL,
    surgery_date DATE NOT NULL,
    surgery_eye VARCHAR(10), -- 'OD', 'OS', 'OU'
    instructions TEXT, -- JSON array of post-op care instructions
    restrictions TEXT, -- JSON array of activity restrictions
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_postop_schedule_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_postop_schedule_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_postop_schedule_surgeon FOREIGN KEY (surgeon_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_postop_schedule_tenant ON post_op_care_schedule(tenant_id);
CREATE INDEX IF NOT EXISTS idx_postop_schedule_patient ON post_op_care_schedule(patient_id);
CREATE INDEX IF NOT EXISTS idx_postop_schedule_surgery_date ON post_op_care_schedule(surgery_date);
CREATE INDEX IF NOT EXISTS idx_postop_schedule_deleted ON post_op_care_schedule(deleted_at);

-- ==========================================
-- 3. POST-OPERATIVE VISIT TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS post_op_visit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    visit_name VARCHAR(100) NOT NULL, -- 'Day 1', '1 Week', '1 Month', '3 Months'
    scheduled_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_date TIMESTAMPTZ,
    completed_by_doctor_id UUID,
    findings TEXT,
    visual_acuity VARCHAR(50),
    iop VARCHAR(50), -- Intraocular Pressure
    complications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_postop_visit_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_postop_visit_schedule FOREIGN KEY (schedule_id) REFERENCES post_op_care_schedule(id) ON DELETE CASCADE,
    CONSTRAINT fk_postop_visit_doctor FOREIGN KEY (completed_by_doctor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_postop_visit_tenant ON post_op_visit(tenant_id);
CREATE INDEX IF NOT EXISTS idx_postop_visit_schedule ON post_op_visit(schedule_id);
CREATE INDEX IF NOT EXISTS idx_postop_visit_scheduled_date ON post_op_visit(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_postop_visit_deleted ON post_op_visit(deleted_at);

-- ==========================================
-- 4. POST-OPERATIVE MEDICATION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS post_op_medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    adherence VARCHAR(50), -- 'full', 'partial', 'none'
    adherence_notes TEXT,
    last_refill_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_postop_medication_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_postop_medication_schedule FOREIGN KEY (schedule_id) REFERENCES post_op_care_schedule(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_postop_medication_tenant ON post_op_medication(tenant_id);
CREATE INDEX IF NOT EXISTS idx_postop_medication_schedule ON post_op_medication(schedule_id);
CREATE INDEX IF NOT EXISTS idx_postop_medication_deleted ON post_op_medication(deleted_at);

-- ==========================================
-- 5. TREATMENT ADHERENCE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS treatment_adherence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    condition VARCHAR(200) NOT NULL, -- 'Glaucoma', 'DME', 'DR', etc.
    treatment_plan TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    scheduled_appointments INT DEFAULT 0,
    completed_appointments INT DEFAULT 0,
    adherence_rate DECIMAL(5,2), -- Calculated: (completed/scheduled) * 100
    risk_level VARCHAR(20), -- 'low', 'medium', 'high'
    recommendations TEXT, -- JSON array of recommendations
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_treatment_adherence_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_treatment_adherence_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
);

CREATE INDEX IF NOT EXISTS idx_treatment_adherence_tenant ON treatment_adherence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_treatment_adherence_patient ON treatment_adherence(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_adherence_risk ON treatment_adherence(risk_level);
CREATE INDEX IF NOT EXISTS idx_treatment_adherence_deleted ON treatment_adherence(deleted_at);

-- ==========================================
-- 6. MEDICATION ADHERENCE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS medication_adherence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    treatment_adherence_id UUID NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    prescribed_frequency VARCHAR(100),
    actual_frequency VARCHAR(100),
    adherence_percentage DECIMAL(5,2),
    missed_doses INT DEFAULT 0,
    last_taken_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_medication_adherence_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_medication_adherence_treatment FOREIGN KEY (treatment_adherence_id) REFERENCES treatment_adherence(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medication_adherence_tenant ON medication_adherence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_treatment ON medication_adherence(treatment_adherence_id);
CREATE INDEX IF NOT EXISTS idx_medication_adherence_deleted ON medication_adherence(deleted_at);

-- ==========================================
-- 7. PATIENT REMINDER TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS patient_reminder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    reminder_type VARCHAR(100) NOT NULL, -- 'appointment', 'medication', 'test', 'follow_up', 'screening'
    related_id UUID, -- Link to appointment, treatment, etc.
    message TEXT NOT NULL,
    channels TEXT, -- JSON array: ['sms', 'email', 'phone']
    scheduled_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'acknowledged'
    sent_date TIMESTAMPTZ,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_date TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_patient_reminder_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_patient_reminder_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
);

CREATE INDEX IF NOT EXISTS idx_patient_reminder_tenant ON patient_reminder(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patient_reminder_patient ON patient_reminder(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_reminder_status ON patient_reminder(status);
CREATE INDEX IF NOT EXISTS idx_patient_reminder_scheduled_date ON patient_reminder(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_patient_reminder_deleted ON patient_reminder(deleted_at);

-- ==========================================
-- PERMISSIONS
-- ==========================================
INSERT INTO permission (id, name, description, category, tenant_id, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'followup.read', 'View follow-up appointments', 'Follow-Up Management', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'followup.create', 'Create follow-up appointments', 'Follow-Up Management', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'followup.update', 'Update follow-up appointments', 'Follow-Up Management', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'followup.delete', 'Delete follow-up appointments', 'Follow-Up Management', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'postopcare.read', 'View post-op care schedules', 'Post-Op Care', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'postopcare.create', 'Create post-op care schedules', 'Post-Op Care', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'postopcare.update', 'Update post-op care schedules', 'Post-Op Care', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'adherence.read', 'View treatment adherence data', 'Adherence Monitoring', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'adherence.update', 'Update treatment adherence data', 'Adherence Monitoring', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'reminder.read', 'View patient reminders', 'Reminders', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'reminder.create', 'Create patient reminders', 'Reminders', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'reminder.send', 'Send patient reminders', 'Reminders', NULL, NOW(), NOW()),
    (gen_random_uuid(), 'reminder.admin', 'Administer reminder background jobs', 'Reminders', NULL, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Phase 2 Follow-Up Management tables created successfully!' AS status;
