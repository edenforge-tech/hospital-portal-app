-- ============================================================================
-- APPOINTMENTS MODULE - ENHANCED SCHEMA MIGRATIONS
-- Version: 1.0
-- Date: 2026-01-26
-- Description: Add enhanced fields and tables for advanced appointment features
-- ============================================================================

-- 1. Add enhanced columns to appointment table
ALTER TABLE appointment 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_pattern VARCHAR(50),
ADD COLUMN IF NOT EXISTS parent_appointment_id UUID REFERENCES appointment(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS patient_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS patient_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS reason_for_visit TEXT,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES department(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_start_time ON appointment(start_time);
CREATE INDEX IF NOT EXISTS idx_appointment_priority ON appointment(priority);
CREATE INDEX IF NOT EXISTS idx_appointment_recurring ON appointment(is_recurring);
CREATE INDEX IF NOT EXISTS idx_appointment_parent ON appointment(parent_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_department ON appointment(department_id);

-- 2. Create doctor_availability table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday (for recurring)
    specific_date DATE, -- for one-time blocks/changes
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    availability_type VARCHAR(50) NOT NULL CHECK (availability_type IN ('working_hours', 'break', 'blocked', 'emergency', 'meeting', 'personal')),
    reason TEXT,
    is_recurring BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT specific_or_recurring CHECK (
        (specific_date IS NOT NULL AND day_of_week IS NULL) OR
        (specific_date IS NULL AND day_of_week IS NOT NULL)
    )
);

-- Indexes for doctor_availability
CREATE INDEX IF NOT EXISTS idx_doctor_availability_tenant ON doctor_availability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_date ON doctor_availability(specific_date);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_dow ON doctor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_type ON doctor_availability(availability_type);

-- RLS for doctor_availability
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY doctor_availability_tenant_isolation ON doctor_availability
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 3. Create appointment_conflicts table
CREATE TABLE IF NOT EXISTS appointment_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointment(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('doctor_busy', 'patient_busy', 'room_unavailable', 'outside_hours', 'break_time')),
    conflicting_appointment_id UUID REFERENCES appointment(id) ON DELETE SET NULL,
    conflict_message TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Indexes for appointment_conflicts
CREATE INDEX IF NOT EXISTS idx_appointment_conflicts_tenant ON appointment_conflicts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_conflicts_appointment ON appointment_conflicts(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_conflicts_type ON appointment_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_appointment_conflicts_resolved ON appointment_conflicts(resolved_at);

-- RLS for appointment_conflicts
ALTER TABLE appointment_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointment_conflicts_tenant_isolation ON appointment_conflicts
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 4. Create appointment_reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('email', 'sms', 'both', 'push')),
    scheduled_time TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'delivered', 'bounced')),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Indexes for appointment_reminders
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_tenant ON appointment_reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_scheduled ON appointment_reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status ON appointment_reminders(delivery_status);

-- RLS for appointment_reminders
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointment_reminders_tenant_isolation ON appointment_reminders
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 5. Create appointment_statistics table (for caching analytics)
CREATE TABLE IF NOT EXISTS appointment_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES department(id) ON DELETE CASCADE,
    total_appointments INT DEFAULT 0,
    completed_appointments INT DEFAULT 0,
    cancelled_appointments INT DEFAULT 0,
    no_show_appointments INT DEFAULT 0,
    average_duration_minutes DECIMAL(10, 2),
    most_booked_time_slot VARCHAR(20),
    utilization_rate DECIMAL(5, 2), -- percentage
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for appointment_statistics
CREATE INDEX IF NOT EXISTS idx_appointment_statistics_tenant ON appointment_statistics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_statistics_dates ON appointment_statistics(date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_appointment_statistics_doctor ON appointment_statistics(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_statistics_department ON appointment_statistics(department_id);

-- RLS for appointment_statistics
ALTER TABLE appointment_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointment_statistics_tenant_isolation ON appointment_statistics
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- 6. Update existing appointment records with default values
UPDATE appointment 
SET priority = 'normal' 
WHERE priority IS NULL;

UPDATE appointment 
SET is_recurring = false 
WHERE is_recurring IS NULL;

-- 7. Add trigger to auto-calculate end_time from start_time + duration
CREATE OR REPLACE FUNCTION calculate_appointment_end_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_time IS NOT NULL AND NEW.duration_minutes IS NOT NULL THEN
        NEW.end_time := NEW.start_time + (NEW.duration_minutes || ' minutes')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_end_time
BEFORE INSERT OR UPDATE ON appointment
FOR EACH ROW
EXECUTE FUNCTION calculate_appointment_end_time();

-- 8. Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_doctor_availability_updated_at
BEFORE UPDATE ON doctor_availability
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointment_conflicts_updated_at
BEFORE UPDATE ON appointment_conflicts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointment_reminders_updated_at
BEFORE UPDATE ON appointment_reminders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 9. Create view for appointment conflicts with details
CREATE OR REPLACE VIEW vw_appointment_conflicts_detailed AS
SELECT 
    ac.*,
    a.appointment_date,
    a.start_time,
    a.patient_id,
    p.first_name || ' ' || p.last_name AS patient_name,
    a.doctor_id,
    d.first_name || ' ' || d.last_name AS doctor_name,
    ca.appointment_date AS conflicting_appointment_date,
    ca.start_time AS conflicting_start_time
FROM appointment_conflicts ac
LEFT JOIN appointment a ON ac.appointment_id = a.id
LEFT JOIN users p ON a.patient_id = p.id
LEFT JOIN users d ON a.doctor_id = d.id
LEFT JOIN appointment ca ON ac.conflicting_appointment_id = ca.id
WHERE ac.deleted_at IS NULL;

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON doctor_availability TO rls_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_conflicts TO rls_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_reminders TO rls_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_statistics TO rls_admin;
GRANT SELECT ON vw_appointment_conflicts_detailed TO rls_admin;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verification queries
SELECT 'doctor_availability table created' AS status, COUNT(*) AS row_count FROM doctor_availability;
SELECT 'appointment_conflicts table created' AS status, COUNT(*) AS row_count FROM appointment_conflicts;
SELECT 'appointment_reminders table created' AS status, COUNT(*) AS row_count FROM appointment_reminders;
SELECT 'appointment_statistics table created' AS status, COUNT(*) AS row_count FROM appointment_statistics;
SELECT 'appointment table enhanced' AS status, COUNT(*) AS appointments_with_priority FROM appointment WHERE priority IS NOT NULL;
