-- =====================================================
-- Module 3: Counselor Management - Admission Management
-- Migration: module03_08_admission_management.sql
-- Description: Patient admissions, bed reservations, day-care scheduling
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. PATIENT ADMISSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Session & Patient Links
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    ot_schedule_id UUID, -- Links to ot_schedules
    
    -- Admission Details
    admission_number VARCHAR(100) UNIQUE,
    admission_type VARCHAR(30) CHECK (admission_type IN ('DayCare', 'IPD', 'Emergency')),
    admission_date DATE NOT NULL,
    admission_time TIME,
    
    -- Surgery Details
    surgery_type VARCHAR(100),
    surgery_date DATE,
    eye_operated VARCHAR(10) CHECK (eye_operated IN ('OD', 'OS', 'OU')),
    
    -- Bed Assignment (for IPD only)
    bed_id UUID, -- Links to bed_inventory
    bed_assigned_at TIMESTAMPTZ,
    bed_released_at TIMESTAMPTZ,
    
    -- Day-Care Details (for day-care admissions)
    scheduled_discharge_time TIME,
    
    -- Status
    admission_status VARCHAR(30) DEFAULT 'Scheduled' CHECK (admission_status IN (
        'Scheduled',
        'PreAdmissionCheckPending',
        'Admitted',
        'UnderCare',
        'PostOperative',
        'ReadyForDischarge',
        'Discharged',
        'Cancelled'
    )),
    
    -- Discharge Details
    actual_discharge_date DATE,
    actual_discharge_time TIME,
    discharge_summary_url TEXT,
    discharge_instructions TEXT,
    discharged_by_user_id UUID,
    
    -- Accompanying Person
    attendant_name VARCHAR(200),
    attendant_phone VARCHAR(20),
    attendant_relation VARCHAR(50),
    
    -- Medical Team
    admitting_doctor_id UUID,
    primary_nurse_id UUID,
    
    -- Insurance/Payment
    admission_deposit_paid DECIMAL(12,2) DEFAULT 0,
    final_bill_amount DECIMAL(12,2),
    final_settlement_status VARCHAR(30) CHECK (final_settlement_status IN ('Pending', 'Partial', 'Completed')),
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID,
    cancellation_reason TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_admission_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_admission_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_admission_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_admission_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_admission_ot_schedule FOREIGN KEY (ot_schedule_id) REFERENCES ot_schedules(id),
    CONSTRAINT fk_admission_bed FOREIGN KEY (bed_id) REFERENCES bed_inventory(id),
    CONSTRAINT fk_admission_doctor FOREIGN KEY (admitting_doctor_id) REFERENCES users(id),
    CONSTRAINT fk_admission_nurse FOREIGN KEY (primary_nurse_id) REFERENCES users(id),
    CONSTRAINT fk_admission_discharged_by FOREIGN KEY (discharged_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_admission_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_admission_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 2. BED RESERVATIONS (Bed Blocking for Scheduled Surgeries)
-- =====================================================
CREATE TABLE IF NOT EXISTS bed_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Bed & Admission Links
    bed_id UUID NOT NULL,
    admission_id UUID, -- Links to patient_admissions
    session_id UUID,
    patient_id UUID NOT NULL,
    
    -- Reservation Details
    reservation_number VARCHAR(100) UNIQUE,
    reserved_from_date DATE NOT NULL,
    reserved_to_date DATE NOT NULL,
    num_days INTEGER,
    
    -- Status
    reservation_status VARCHAR(30) DEFAULT 'Reserved' CHECK (reservation_status IN (
        'Reserved',
        'Confirmed',
        'Occupied',
        'Released',
        'Expired',
        'Cancelled'
    )),
    
    -- Confirmation
    confirmed_at TIMESTAMPTZ,
    confirmed_by_user_id UUID,
    
    -- Release
    released_at TIMESTAMPTZ,
    released_by_user_id UUID,
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancelled_by_user_id UUID,
    cancellation_reason TEXT,
    
    -- Notes
    special_requirements TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_bed_reservation_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_bed_reservation_bed FOREIGN KEY (bed_id) REFERENCES bed_inventory(id),
    CONSTRAINT fk_bed_reservation_admission FOREIGN KEY (admission_id) REFERENCES patient_admissions(id),
    CONSTRAINT fk_bed_reservation_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_bed_reservation_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_bed_reservation_confirmed_by FOREIGN KEY (confirmed_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_bed_reservation_released_by FOREIGN KEY (released_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_bed_reservation_cancelled_by FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_bed_reservation_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 3. ADMISSION PREREQUISITES (Checklist)
-- =====================================================
CREATE TABLE IF NOT EXISTS admission_prerequisites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Admission Link
    admission_id UUID NOT NULL,
    session_id UUID NOT NULL,
    
    -- Checklist Items
    checklist JSONB NOT NULL,
    /* Example structure:
    [
        {"item": "Pre-op tests completed", "completed": true, "completed_at": "2026-02-22T10:00:00Z", "completed_by": "user-id"},
        {"item": "Fitness clearance obtained", "completed": true, "completed_at": "2026-02-22T11:00:00Z", "completed_by": "user-id"},
        {"item": "Consent forms signed", "completed": false, "completed_at": null, "completed_by": null},
        {"item": "Payment received", "completed": true, "completed_at": "2026-02-22T12:00:00Z", "completed_by": "user-id"},
        {"item": "Bed reserved", "completed": true, "completed_at": "2026-02-22T13:00:00Z", "completed_by": "user-id"},
        {"item": "Insurance approved", "completed": true, "completed_at": "2026-02-22T14:00:00Z", "completed_by": "user-id"},
        {"item": "OT slot booked", "completed": true, "completed_at": "2026-02-22T15:00:00Z", "completed_by": "user-id"}
    ]
    */
    
    -- Overall Status
    all_prerequisites_met BOOLEAN DEFAULT FALSE,
    blocking_items TEXT[],
    
    -- Last Updated
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    last_checked_by_user_id UUID,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_prerequisites_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_prerequisites_admission FOREIGN KEY (admission_id) REFERENCES patient_admissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_prerequisites_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_prerequisites_checked_by FOREIGN KEY (last_checked_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 4. DAY-CARE SCHEDULING (Time Slot Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS day_care_scheduling (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Admission Link
    admission_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Scheduling Details
    scheduled_date DATE NOT NULL,
    reporting_time TIME NOT NULL,
    surgery_time TIME,
    expected_discharge_time TIME,
    
    -- Slot Details
    slot_number INTEGER,
    max_patients_per_slot INTEGER DEFAULT 4,
    
    -- Status Tracking
    patient_reported BOOLEAN DEFAULT FALSE,
    reported_at TIMESTAMPTZ,
    
    pre_surgery_check_done BOOLEAN DEFAULT FALSE,
    pre_surgery_check_at TIMESTAMPTZ,
    
    surgery_completed BOOLEAN DEFAULT FALSE,
    surgery_completed_at TIMESTAMPTZ,
    
    recovery_period_minutes INTEGER DEFAULT 120,
    ready_for_discharge BOOLEAN DEFAULT FALSE,
    ready_at TIMESTAMPTZ,
    
    actually_discharged BOOLEAN DEFAULT FALSE,
    discharged_at TIMESTAMPTZ,
    
    -- Delays
    delay_reason TEXT,
    delay_duration_minutes INTEGER,
    
    -- Feedback
    patient_satisfaction_score INTEGER CHECK (patient_satisfaction_score BETWEEN 1 AND 5),
    feedback_comments TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_daycare_sched_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_daycare_sched_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_daycare_sched_admission FOREIGN KEY (admission_id) REFERENCES patient_admissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_daycare_sched_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Patient Admissions
CREATE INDEX IF NOT EXISTS idx_admissions_tenant_branch ON patient_admissions(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_session ON patient_admissions(session_id);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON patient_admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_bed ON patient_admissions(bed_id);
CREATE INDEX IF NOT EXISTS idx_admissions_ot_schedule ON patient_admissions(ot_schedule_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON patient_admissions(admission_status);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON patient_admissions(admission_date DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_type ON patient_admissions(admission_type, admission_status);

-- Bed Reservations
CREATE INDEX IF NOT EXISTS idx_bed_reservations_bed ON bed_reservations(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_reservations_admission ON bed_reservations(admission_id);
CREATE INDEX IF NOT EXISTS idx_bed_reservations_patient ON bed_reservations(patient_id);
CREATE INDEX IF NOT EXISTS idx_bed_reservations_status ON bed_reservations(reservation_status);
CREATE INDEX IF NOT EXISTS idx_bed_reservations_dates ON bed_reservations(reserved_from_date, reserved_to_date) WHERE reservation_status IN ('Reserved', 'Confirmed', 'Occupied');

-- Admission Prerequisites
CREATE INDEX IF NOT EXISTS idx_prerequisites_admission ON admission_prerequisites(admission_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_session ON admission_prerequisites(session_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_incomplete ON admission_prerequisites(all_prerequisites_met) WHERE all_prerequisites_met = FALSE;

-- Day-Care Scheduling
CREATE INDEX IF NOT EXISTS idx_daycare_sched_tenant_branch ON day_care_scheduling(tenant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_daycare_sched_admission ON day_care_scheduling(admission_id);
CREATE INDEX IF NOT EXISTS idx_daycare_sched_patient ON day_care_scheduling(patient_id);
CREATE INDEX IF NOT EXISTS idx_daycare_sched_date ON day_care_scheduling(scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_daycare_sched_slot ON day_care_scheduling(scheduled_date, slot_number);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE patient_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_care_scheduling ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_admissions ON patient_admissions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_bed_reservations ON bed_reservations
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_prerequisites ON admission_prerequisites
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_daycare_sched ON day_care_scheduling
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- TRIGGER: Auto-generate Admission Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_admission_number()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_code VARCHAR(50);
    v_type_prefix VARCHAR(5);
    v_sequence INTEGER;
BEGIN
    -- Get branch code
    SELECT code INTO v_branch_code FROM branch WHERE id = NEW.branch_id;
    v_branch_code := COALESCE(v_branch_code, 'HQ');
    
    -- Type prefix
    v_type_prefix := CASE NEW.admission_type
        WHEN 'DayCare' THEN 'DC'
        WHEN 'IPD' THEN 'IPD'
        WHEN 'Emergency' THEN 'ER'
        ELSE 'ADM'
    END;
    
    -- Get next sequence number for the type and date
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM patient_admissions
    WHERE branch_id = NEW.branch_id
    AND admission_type = NEW.admission_type
    AND DATE(admission_date) = NEW.admission_date
    AND deleted_at IS NULL;
    
    -- Generate admission number: <TYPE>-<BRANCH>-<YYYYMMDD>-<SEQ>
    NEW.admission_number := v_type_prefix || '-' || v_branch_code || '-' || 
        TO_CHAR(NEW.admission_date, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_admission_number
    BEFORE INSERT ON patient_admissions
    FOR EACH ROW
    WHEN (NEW.admission_number IS NULL)
    EXECUTE FUNCTION generate_admission_number();

-- =====================================================
-- TRIGGER: Auto-generate Reservation Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
DECLARE
    v_sequence INTEGER;
BEGIN
    -- Get next sequence number for the day
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM bed_reservations
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate reservation number: BEDRES-<YYYYMMDD>-<SEQ>
    NEW.reservation_number := 'BEDRES-' || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_reservation_number
    BEFORE INSERT ON bed_reservations
    FOR EACH ROW
    WHEN (NEW.reservation_number IS NULL)
    EXECUTE FUNCTION generate_reservation_number();

-- =====================================================
-- TRIGGER: Calculate Reservation Days
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_reservation_days()
RETURNS TRIGGER AS $$
BEGIN
    NEW.num_days := (NEW.reserved_to_date - NEW.reserved_from_date) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_reservation_days
    BEFORE INSERT OR UPDATE ON bed_reservations
    FOR EACH ROW
    WHEN (NEW.reserved_from_date IS NOT NULL AND NEW.reserved_to_date IS NOT NULL)
    EXECUTE FUNCTION calculate_reservation_days();

-- =====================================================
-- SEED DATA: Sample Day-Care Admission
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_session_id UUID;
    v_patient_id UUID;
    v_ot_schedule_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    SELECT id INTO v_branch_id FROM branch WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_session_id FROM counseling_sessions WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_patient_id FROM patient WHERE tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_ot_schedule_id FROM ot_schedules WHERE tenant_id = v_tenant_id LIMIT 1;
    
    IF v_tenant_id IS NOT NULL AND v_session_id IS NOT NULL THEN
        -- Sample day-care admission
        INSERT INTO patient_admissions (
            tenant_id, branch_id, session_id, patient_id, ot_schedule_id, admission_type,
            admission_date, surgery_type, admission_status, scheduled_discharge_time,
            created_by_user_id
        )
        SELECT
            v_tenant_id, v_branch_id, v_session_id, v_patient_id, v_ot_schedule_id, 'DayCare',
            CURRENT_DATE + INTERVAL '3 days', 'Cataract Surgery', 'Scheduled', '16:00:00',
            id FROM users WHERE tenant_id = v_tenant_id LIMIT 1;
        
        RAISE NOTICE 'Seeded 1 sample day-care admission';
    END IF;
END $$;

COMMENT ON TABLE patient_admissions IS 'Patient admission records for day-care and IPD';
COMMENT ON TABLE bed_reservations IS 'Bed reservation and blocking for scheduled surgeries';
COMMENT ON TABLE admission_prerequisites IS 'Pre-admission checklist validation';
COMMENT ON TABLE day_care_scheduling IS 'Day-care patient scheduling and time slot management';
