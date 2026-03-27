-- =====================================================
-- Module 3: Counselor Management - OT Booking System
-- Migration: module03_05_ot_booking_system.sql
-- Description: OT theaters, schedules, bookings, validations, equipment
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. OT THEATERS (Operation Theater Master)
-- =====================================================
CREATE TABLE IF NOT EXISTS ot_theaters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Theater Details
    theater_name VARCHAR(100) NOT NULL,
    theater_code VARCHAR(50) UNIQUE,
    floor_number INTEGER,
    location_description TEXT,
    
    -- Specialization
    specialization VARCHAR(100) CHECK (specialization IN ('General Ophthalmic', 'Phaco Specialist', 'Retina Suite', 'Oculoplasty', 'Pediatric')),
    surgery_types_supported TEXT[], -- ['Cataract', 'Retinal', 'Glaucoma']
    
    -- Equipment
    equipment_list JSONB,
    /* Example:
    [
        {"name": "Phaco Machine", "model": "Alcon Centurion", "status": "Functional"},
        {"name": "Operating Microscope", "model": "Zeiss OPMI Lumera", "status": "Functional"},
        {"name": "Vitrectomy Machine", "model": "Alcon Constellation", "status": "UnderMaintenance"}
    ]
    */
    
    -- Capacity
    max_surgeries_per_day INTEGER DEFAULT 8,
    standard_surgery_duration_minutes INTEGER DEFAULT 45,
    cleaning_time_between_surgeries_minutes INTEGER DEFAULT 30,
    
    -- Operating Hours
    operation_start_time TIME DEFAULT '08:00',
    operation_end_time TIME DEFAULT '18:00',
    operating_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_operational BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_reason TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_ot_theater_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_ot_theater_branch FOREIGN KEY (branch_id) REFERENCES branch(id)
);

-- =====================================================
-- 2. OT SCHEDULES (Booking Slots)
-- =====================================================
CREATE TABLE IF NOT EXISTS ot_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Theater & Session Link
    theater_id UUID NOT NULL,
    session_id UUID, -- Links to counseling_sessions
    booking_id UUID, -- Links to patient_surgery_bookings (created later)
    patient_id UUID,
    
    -- Schedule Details
    schedule_number VARCHAR(50) UNIQUE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Surgery Details
    surgery_type VARCHAR(100) NOT NULL,
    procedure_description TEXT,
    eye_operated VARCHAR(10) CHECK (eye_operated IN ('OD', 'OS', 'OU')),
    
    -- Medical Team
    surgeon_id UUID NOT NULL,
    anesthesiologist_id UUID,
    ot_technician_id UUID,
    nursing_staff_ids UUID[], -- Array of nurse user IDs
    
    -- Equipment Reserved
    equipment_reserved JSONB,
    iol_reserved_id UUID, -- Links to IOL inventory
    
    -- Status
    status VARCHAR(30) DEFAULT 'Booked' CHECK (status IN ('Available', 'Booked', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled')),
    booking_confirmed_by_user_id UUID,
    confirmation_timestamp TIMESTAMPTZ,
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID,
    cancellation_reason TEXT,
    
    -- Completion
    surgery_started_at TIMESTAMPTZ,
    surgery_completed_at TIMESTAMPTZ,
    actual_duration_minutes INTEGER,
    complications TEXT,
    outcome VARCHAR(50),
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_ot_schedule_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_ot_schedule_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_ot_schedule_theater FOREIGN KEY (theater_id) REFERENCES ot_theaters(id),
    CONSTRAINT fk_ot_schedule_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_ot_schedule_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_ot_schedule_surgeon FOREIGN KEY (surgeon_id) REFERENCES users(id),
    CONSTRAINT fk_ot_schedule_anesthesiologist FOREIGN KEY (anesthesiologist_id) REFERENCES users(id),
    CONSTRAINT fk_ot_schedule_confirmed_by FOREIGN KEY (booking_confirmed_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_ot_schedule_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_ot_schedule_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. OT BOOKING VALIDATIONS (Real-time Validation Snapshots)
-- =====================================================
CREATE TABLE IF NOT EXISTS ot_booking_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Links
    schedule_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Validation Timestamp
    validation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_by_user_id UUID,
    
    -- Validation Results (JSONB for structured checks)
    checks_passed JSONB NOT NULL,
    /* Example structure:
    {
        "ot_available": true,
        "surgeon_available": true,
        "anesthesia_available": true,
        "iol_reserved": true,
        "preop_tests_cleared": true,
        "fitness_clearance_obtained": false,
        "payment_received": true,
        "bed_reserved": true,
        "consent_signed": true,
        "insurance_approved": true,
        "all_checks_passed": false
    }
    */
    
    -- Blocking Issues
    blocking_issues TEXT[],
    warning_issues TEXT[],
    
    -- Overall Result
    can_proceed BOOLEAN DEFAULT FALSE,
    requires_attention BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_ot_validation_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_ot_validation_schedule FOREIGN KEY (schedule_id) REFERENCES ot_schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_ot_validation_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_ot_validation_validated_by FOREIGN KEY (validated_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 4. OT EQUIPMENT AVAILABILITY (Equipment Status Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS ot_equipment_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Equipment Details
    theater_id UUID NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    equipment_model VARCHAR(200),
    equipment_serial_number VARCHAR(100),
    
    -- Status
    is_functional BOOLEAN DEFAULT TRUE,
    current_status VARCHAR(30) CHECK (current_status IN ('Available', 'InUse', 'UnderMaintenance', 'OutOfService')),
    
    -- Maintenance
    last_serviced_at DATE,
    next_service_due DATE,
    maintenance_schedule VARCHAR(50), -- 'Monthly', 'Quarterly', 'Annually'
    service_provider VARCHAR(200),
    
    -- Usage Tracking
    total_usage_hours DECIMAL(10,2) DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_equipment_availability_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_equipment_availability_theater FOREIGN KEY (theater_id) REFERENCES ot_theaters(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. OT COLLISION LOGS (Conflict Resolution Audit)
-- =====================================================
CREATE TABLE IF NOT EXISTS ot_collision_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Collision Details
    theater_id UUID NOT NULL,
    collision_date DATE NOT NULL,
    collision_time TIME NOT NULL,
    
    -- Conflicting Schedules
    existing_schedule_id UUID,
    attempted_schedule_data JSONB, -- Snapshot of attempted booking
    
    -- Collision Type
    collision_type VARCHAR(50) CHECK (collision_type IN ('TimeOverlap', 'SurgeonUnavailable', 'AnesthesiaUnavailable', 'EquipmentInUse', 'MaintenanceMode')),
    
    -- Resolution
    detected_by_user_id UUID,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_action VARCHAR(100), -- 'Rescheduled', 'DifferentTheater', 'DifferentSurgeon', 'Cancelled'
    resolution_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_collision_log_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_collision_log_theater FOREIGN KEY (theater_id) REFERENCES ot_theaters(id),
    CONSTRAINT fk_collision_log_schedule FOREIGN KEY (existing_schedule_id) REFERENCES ot_schedules(id),
    CONSTRAINT fk_collision_log_detected_by FOREIGN KEY (detected_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- OT Theaters
CREATE INDEX IF NOT EXISTS idx_ot_theaters_tenant_branch ON ot_theaters(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ot_theaters_active ON ot_theaters(is_active, is_operational);
CREATE INDEX IF NOT EXISTS idx_ot_theaters_specialization ON ot_theaters(specialization) WHERE is_active = TRUE;

-- OT Schedules
CREATE INDEX IF NOT EXISTS idx_ot_schedules_tenant_branch ON ot_schedules(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ot_schedules_theater ON ot_schedules(theater_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_session ON ot_schedules(session_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_patient ON ot_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_surgeon ON ot_schedules(surgeon_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_anesthesiologist ON ot_schedules(anesthesiologist_id);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_date_status ON ot_schedules(scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_ot_schedules_date_time ON ot_schedules(theater_id, scheduled_date, start_time, end_time) WHERE status IN ('Booked', 'Confirmed', 'InProgress');
CREATE INDEX IF NOT EXISTS idx_ot_schedules_status ON ot_schedules(status) WHERE deleted_at IS NULL;

-- OT Booking Validations
CREATE INDEX IF NOT EXISTS idx_ot_validations_schedule ON ot_booking_validations(schedule_id);
CREATE INDEX IF NOT EXISTS idx_ot_validations_session ON ot_booking_validations(session_id);
CREATE INDEX IF NOT EXISTS idx_ot_validations_can_proceed ON ot_booking_validations(can_proceed, requires_attention);
CREATE INDEX IF NOT EXISTS idx_ot_validations_timestamp ON ot_booking_validations(validation_timestamp DESC);

-- Equipment Availability
CREATE INDEX IF NOT EXISTS idx_equipment_theater ON ot_equipment_availability(theater_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_status ON ot_equipment_availability(current_status) WHERE is_functional = TRUE;
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance ON ot_equipment_availability(next_service_due) WHERE next_service_due < CURRENT_DATE + INTERVAL '30 days';

-- Collision Logs
CREATE INDEX IF NOT EXISTS idx_collision_logs_theater ON ot_collision_logs(theater_id);
CREATE INDEX IF NOT EXISTS idx_collision_logs_date ON ot_collision_logs(collision_date);
CREATE INDEX IF NOT EXISTS idx_collision_logs_schedule ON ot_collision_logs(existing_schedule_id);
CREATE INDEX IF NOT EXISTS idx_collision_logs_resolved ON ot_collision_logs(resolved) WHERE resolved = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE ot_theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_booking_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_equipment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_collision_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_ot_theaters ON ot_theaters
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_ot_schedules ON ot_schedules
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_ot_validations ON ot_booking_validations
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_ot_equipment ON ot_equipment_availability
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_collision_logs ON ot_collision_logs
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- TRIGGER: Auto-generate Schedule Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_ot_schedule_number()
RETURNS TRIGGER AS $$
DECLARE
    v_theater_code VARCHAR(10);
    v_sequence INTEGER;
BEGIN
    -- Get theater code
    SELECT theater_code INTO v_theater_code FROM ot_theaters WHERE id = NEW.theater_id;
    v_theater_code := COALESCE(v_theater_code, 'OT');
    
    -- Get next sequence number for the date
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM ot_schedules
    WHERE theater_id = NEW.theater_id
    AND scheduled_date = NEW.scheduled_date
    AND deleted_at IS NULL;
    
    -- Generate schedule number: OT-<THEATER>-<YYYYMMDD>-<SEQ>
    NEW.schedule_number := v_theater_code || '-' || 
        TO_CHAR(NEW.scheduled_date, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_schedule_number
    BEFORE INSERT ON ot_schedules
    FOR EACH ROW
    WHEN (NEW.schedule_number IS NULL)
    EXECUTE FUNCTION generate_ot_schedule_number();

-- =====================================================
-- SEED DATA: OT Theaters
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_tenant_id IS NOT NULL AND v_branch_id IS NOT NULL THEN
        -- Theater 1: Phaco Specialist
        INSERT INTO ot_theaters (
            tenant_id, branch_id, theater_name, theater_code, floor_number, specialization,
            surgery_types_supported, equipment_list, max_surgeries_per_day, standard_surgery_duration_minutes,
            is_active, is_operational
        ) VALUES (
            v_tenant_id, v_branch_id, 'OT-1 Phaco Suite', 'OT1', 2, 'Phaco Specialist',
            ARRAY['Cataract', 'IOL']::TEXT[],
            '[
                {"name": "Phaco Machine", "model": "Alcon Centurion Vision System", "status": "Functional"},
                {"name": "Operating Microscope", "model": "Zeiss OPMI Lumera 700", "status": "Functional"},
                {"name": "IOL Inserter", "model": "Universal", "status": "Functional"}
            ]'::JSONB,
            12, 30, TRUE, TRUE
        );
        
        -- Theater 2: General Ophthalmic
        INSERT INTO ot_theaters (
            tenant_id, branch_id, theater_name, theater_code, floor_number, specialization,
            surgery_types_supported, equipment_list, max_surgeries_per_day, standard_surgery_duration_minutes,
            is_active, is_operational
        ) VALUES (
            v_tenant_id, v_branch_id, 'OT-2 General Suite', 'OT2', 2, 'General Ophthalmic',
            ARRAY['Cataract', 'Glaucoma', 'Oculoplasty']::TEXT[],
            '[
                {"name": "Phaco Machine", "model": "Alcon Infiniti", "status": "Functional"},
                {"name": "Operating Microscope", "model": "Zeiss OPMI Lumera", "status": "Functional"},
                {"name": "Cautery Unit", "model": "Bovie", "status": "Functional"}
            ]'::JSONB,
            8, 45, TRUE, TRUE
        );
        
        RAISE NOTICE 'Seeded 2 OT theaters for tenant % branch %', v_tenant_id, v_branch_id;
    END IF;
END $$;

COMMENT ON TABLE ot_theaters IS 'Operation theater master data with equipment and specializations';
COMMENT ON TABLE ot_schedules IS 'OT booking slots with surgery details and medical team assignments';
COMMENT ON TABLE ot_booking_validations IS 'Real-time validation snapshots for OT bookings';
COMMENT ON TABLE ot_equipment_availability IS 'Equipment status tracking and maintenance schedules';
COMMENT ON TABLE ot_collision_logs IS 'Audit trail for booking conflicts and resolutions';
