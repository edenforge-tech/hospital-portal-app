-- =====================================================
-- MIGRATION 08: BRANCH CAPACITY TRACKING
-- =====================================================
-- Hospital Portal - Real-time Bed Capacity Management
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

-- =====================================================
-- 1. ADD CAPACITY COLUMNS TO BRANCH TABLE
-- =====================================================

-- Add geolocation and capacity columns to existing branch table
ALTER TABLE branch ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE branch ADD COLUMN IF NOT EXISTS total_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS icu_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS emergency_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS occupied_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS occupied_icu_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS occupied_emergency_beds INTEGER DEFAULT 0;
ALTER TABLE branch ADD COLUMN IF NOT EXISTS last_capacity_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Add geospatial index for map queries
CREATE INDEX IF NOT EXISTS idx_branch_geolocation ON branch USING GIST (
    ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for capacity queries
CREATE INDEX IF NOT EXISTS idx_branch_capacity ON branch(total_beds, occupied_beds) WHERE deleted_at IS NULL;

COMMENT ON COLUMN branch.latitude IS 'Branch latitude for map display (-90 to +90)';
COMMENT ON COLUMN branch.longitude IS 'Branch longitude for map display (-180 to +180)';
COMMENT ON COLUMN branch.total_beds IS 'Total number of general beds available';
COMMENT ON COLUMN branch.icu_beds IS 'Total number of ICU beds available';
COMMENT ON COLUMN branch.emergency_beds IS 'Total number of emergency beds available';
COMMENT ON COLUMN branch.occupied_beds IS 'Currently occupied general beds';
COMMENT ON COLUMN branch.occupied_icu_beds IS 'Currently occupied ICU beds';
COMMENT ON COLUMN branch.occupied_emergency_beds IS 'Currently occupied emergency beds';

-- =====================================================
-- 2. BED INVENTORY TABLE (Detailed Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS bed_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
    bed_number VARCHAR(50) NOT NULL,
    bed_type VARCHAR(50) NOT NULL CHECK (bed_type IN ('General', 'ICU', 'Emergency', 'Pediatric', 'Isolation', 'Recovery')),
    ward_name VARCHAR(100),
    floor INTEGER,
    room_number VARCHAR(50),
    is_occupied BOOLEAN DEFAULT false,
    patient_id UUID REFERENCES patient(id) ON DELETE SET NULL,
    admission_date TIMESTAMPTZ,
    estimated_discharge_date TIMESTAMPTZ,
    bed_status VARCHAR(50) DEFAULT 'available' CHECK (bed_status IN ('available', 'occupied', 'reserved', 'maintenance', 'cleaning', 'quarantine')),
    equipment_attached TEXT[], -- Array: ['Ventilator', 'Monitor', 'Oxygen']
    notes TEXT,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Prevent duplicate bed numbers per branch
    CONSTRAINT unique_bed_per_branch UNIQUE (branch_id, bed_number, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_bed_tenant ON bed_inventory(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bed_branch ON bed_inventory(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bed_status ON bed_inventory(bed_status, is_occupied) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bed_patient ON bed_inventory(patient_id) WHERE patient_id IS NOT NULL;

COMMENT ON TABLE bed_inventory IS 'Detailed bed-level tracking for capacity management';
COMMENT ON COLUMN bed_inventory.bed_type IS 'Type of bed: General, ICU, Emergency, Pediatric, Isolation, Recovery';
COMMENT ON COLUMN bed_inventory.bed_status IS 'Current status: available, occupied, reserved, maintenance, cleaning, quarantine';
COMMENT ON COLUMN bed_inventory.equipment_attached IS 'Medical equipment attached to this bed';

-- =====================================================
-- 3. CAPACITY HISTORY TABLE (Time-series Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS branch_capacity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
    snapshot_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_beds INTEGER NOT NULL,
    occupied_beds INTEGER NOT NULL,
    available_beds INTEGER NOT NULL,
    icu_beds INTEGER NOT NULL,
    occupied_icu_beds INTEGER NOT NULL,
    emergency_beds INTEGER NOT NULL,
    occupied_emergency_beds INTEGER NOT NULL,
    occupancy_percentage DECIMAL(5, 2),
    icu_occupancy_percentage DECIMAL(5, 2),
    emergency_occupancy_percentage DECIMAL(5, 2),
    alert_level VARCHAR(20) CHECK (alert_level IN ('green', 'yellow', 'red')),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_capacity_history_branch ON branch_capacity_history(branch_id, snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_capacity_history_tenant ON branch_capacity_history(tenant_id, snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_capacity_history_alert ON branch_capacity_history(alert_level, snapshot_timestamp DESC);

COMMENT ON TABLE branch_capacity_history IS 'Historical snapshots of branch capacity for trend analysis';
COMMENT ON COLUMN branch_capacity_history.alert_level IS 'Capacity alert level: green (<50%), yellow (50-90%), red (>90%)';

-- =====================================================
-- 4. PATIENT TRANSFER REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_transfer_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    from_branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
    to_branch_id UUID NOT NULL REFERENCES branch(id) ON DELETE RESTRICT,
    
    -- Transfer details
    requested_by_user_id UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
    required_bed_type VARCHAR(50) NOT NULL,
    special_requirements TEXT,
    
    -- Transfer logistics
    estimated_distance_km DECIMAL(8, 2),
    estimated_ambulance_time_minutes INTEGER,
    ambulance_assigned VARCHAR(50),
    ambulance_departure_time TIMESTAMPTZ,
    ambulance_arrival_time TIMESTAMPTZ,
    contact_person_at_destination VARCHAR(200),
    contact_phone VARCHAR(20),
    
    -- Transfer status workflow
    transfer_status VARCHAR(50) DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'approved', 'in-transit', 'completed', 'cancelled', 'rejected')),
    approved_by_user_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    completed_at TIMESTAMPTZ,
    
    -- Medical handover
    handover_notes TEXT,
    medical_summary TEXT,
    medications_transferred TEXT,
    medical_equipment_transferred TEXT,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_transfer_tenant ON patient_transfer_request(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfer_patient ON patient_transfer_request(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfer_from_branch ON patient_transfer_request(from_branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfer_to_branch ON patient_transfer_request(to_branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfer_status ON patient_transfer_request(transfer_status, requested_at DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE patient_transfer_request IS 'Patient transfer requests between branches for capacity management';
COMMENT ON COLUMN patient_transfer_request.urgency IS 'Transfer urgency: routine (scheduled), urgent (same day), emergency (immediate)';
COMMENT ON COLUMN patient_transfer_request.transfer_status IS 'Workflow status: pending → approved → in-transit → completed';

-- =====================================================
-- 5. SEED SAMPLE CAPACITY DATA
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_branch RECORD;
    v_total_beds INTEGER;
    v_occupied INTEGER;
    v_icu_total INTEGER;
    v_icu_occupied INTEGER;
    v_emergency_total INTEGER;
    v_emergency_occupied INTEGER;
BEGIN
    -- Get first active tenant
    SELECT id INTO v_tenant_id FROM tenant WHERE status = 'active' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'No active tenant found, skipping capacity data seeding';
        RETURN;
    END IF;
    
    -- Update existing branches with capacity data
    FOR v_branch IN SELECT id, name FROM branch WHERE tenant_id = v_tenant_id AND deleted_at IS NULL LIMIT 10
    LOOP
        -- Generate random but realistic capacity numbers
        v_total_beds := 30 + floor(random() * 70)::INTEGER; -- 30-100 beds
        v_occupied := floor(v_total_beds * (0.5 + random() * 0.4))::INTEGER; -- 50-90% occupancy
        v_icu_total := floor(v_total_beds * 0.15)::INTEGER; -- 15% ICU beds
        v_icu_occupied := floor(v_icu_total * (0.6 + random() * 0.3))::INTEGER; -- 60-90% ICU occupancy
        v_emergency_total := floor(v_total_beds * 0.10)::INTEGER; -- 10% emergency beds
        v_emergency_occupied := floor(v_emergency_total * (0.3 + random() * 0.4))::INTEGER; -- 30-70% emergency occupancy
        
        -- Update branch with capacity data
        UPDATE branch
        SET 
            total_beds = v_total_beds,
            occupied_beds = v_occupied,
            icu_beds = v_icu_total,
            occupied_icu_beds = v_icu_occupied,
            emergency_beds = v_emergency_total,
            occupied_emergency_beds = v_emergency_occupied,
            last_capacity_update = CURRENT_TIMESTAMP,
            -- Add sample geolocation (Indian cities - adjust for your location)
            latitude = CASE 
                WHEN v_branch.id::text < '5' THEN 28.6139 + (random() - 0.5) * 0.5  -- Delhi area
                WHEN v_branch.id::text < '8' THEN 19.0760 + (random() - 0.5) * 0.5  -- Mumbai area
                ELSE 12.9716 + (random() - 0.5) * 0.5  -- Bangalore area
            END,
            longitude = CASE 
                WHEN v_branch.id::text < '5' THEN 77.2090 + (random() - 0.5) * 0.5  -- Delhi area
                WHEN v_branch.id::text < '8' THEN 72.8777 + (random() - 0.5) * 0.5  -- Mumbai area
                ELSE 77.5946 + (random() - 0.5) * 0.5  -- Bangalore area
            END
        WHERE id = v_branch.id;
        
        RAISE NOTICE 'Updated branch % with % total beds (% occupied)', v_branch.name, v_total_beds, v_occupied;
    END LOOP;
    
    RAISE NOTICE 'Branch capacity data seeded successfully';
END $$;

-- =====================================================
-- 6. TRIGGER TO UPDATE BRANCH CAPACITY
-- =====================================================

-- Function to recalculate branch capacity when bed status changes
CREATE OR REPLACE FUNCTION update_branch_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id UUID;
    v_total INTEGER;
    v_occupied INTEGER;
    v_icu_total INTEGER;
    v_icu_occupied INTEGER;
    v_emergency_total INTEGER;
    v_emergency_occupied INTEGER;
BEGIN
    -- Get branch_id (works for INSERT, UPDATE, DELETE)
    v_branch_id := COALESCE(NEW.branch_id, OLD.branch_id);
    
    -- Count beds by type and status
    SELECT 
        COUNT(*) FILTER (WHERE bed_type = 'General'),
        COUNT(*) FILTER (WHERE bed_type = 'General' AND is_occupied = true),
        COUNT(*) FILTER (WHERE bed_type = 'ICU'),
        COUNT(*) FILTER (WHERE bed_type = 'ICU' AND is_occupied = true),
        COUNT(*) FILTER (WHERE bed_type = 'Emergency'),
        COUNT(*) FILTER (WHERE bed_type = 'Emergency' AND is_occupied = true)
    INTO v_total, v_occupied, v_icu_total, v_icu_occupied, v_emergency_total, v_emergency_occupied
    FROM bed_inventory
    WHERE branch_id = v_branch_id AND deleted_at IS NULL;
    
    -- Update branch capacity
    UPDATE branch
    SET 
        total_beds = v_total,
        occupied_beds = v_occupied,
        icu_beds = v_icu_total,
        occupied_icu_beds = v_icu_occupied,
        emergency_beds = v_emergency_total,
        occupied_emergency_beds = v_emergency_occupied,
        last_capacity_update = CURRENT_TIMESTAMP
    WHERE id = v_branch_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to bed_inventory table
DROP TRIGGER IF EXISTS trigger_update_branch_capacity ON bed_inventory;
CREATE TRIGGER trigger_update_branch_capacity
    AFTER INSERT OR UPDATE OR DELETE ON bed_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_capacity();

COMMENT ON FUNCTION update_branch_capacity() IS 'Auto-updates branch capacity when bed status changes';

-- =====================================================
-- 7. FUNCTION TO CALCULATE CAPACITY ALERT LEVEL
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_capacity_alert_level(occupancy_percent DECIMAL)
RETURNS VARCHAR AS $$
BEGIN
    IF occupancy_percent >= 90 THEN
        RETURN 'red';
    ELSIF occupancy_percent >= 80 THEN
        RETURN 'yellow';
    ELSE
        RETURN 'green';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_capacity_alert_level(DECIMAL) IS 'Returns alert level: green (<80%), yellow (80-90%), red (>=90%)';

-- =====================================================
-- 8. VIEW FOR BRANCH CAPACITY SUMMARY
-- =====================================================

CREATE OR REPLACE VIEW branch_capacity_summary AS
SELECT 
    b.id,
    b.tenant_id,
    b.name AS branch_name,
    b.address,
    b.city,
    b.phone,
    b.latitude,
    b.longitude,
    
    -- Capacity metrics
    b.total_beds,
    b.occupied_beds,
    (b.total_beds - b.occupied_beds) AS available_beds,
    ROUND((b.occupied_beds::DECIMAL / NULLIF(b.total_beds, 0) * 100), 2) AS occupancy_percentage,
    
    -- ICU metrics
    b.icu_beds,
    b.occupied_icu_beds,
    (b.icu_beds - b.occupied_icu_beds) AS available_icu_beds,
    ROUND((b.occupied_icu_beds::DECIMAL / NULLIF(b.icu_beds, 0) * 100), 2) AS icu_occupancy_percentage,
    
    -- Emergency metrics
    b.emergency_beds,
    b.occupied_emergency_beds,
    (b.emergency_beds - b.occupied_emergency_beds) AS available_emergency_beds,
    ROUND((b.occupied_emergency_beds::DECIMAL / NULLIF(b.emergency_beds, 0) * 100), 2) AS emergency_occupancy_percentage,
    
    -- Alert level
    calculate_capacity_alert_level(
        ROUND((b.occupied_beds::DECIMAL / NULLIF(b.total_beds, 0) * 100), 2)
    ) AS alert_level,
    
    b.last_capacity_update,
    b.status
FROM branch b
WHERE b.deleted_at IS NULL;

COMMENT ON VIEW branch_capacity_summary IS 'Real-time branch capacity summary with calculated metrics and alert levels';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 08: BRANCH CAPACITY TRACKING';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Added capacity columns to branch table';
    RAISE NOTICE '✓ Created bed_inventory table';
    RAISE NOTICE '✓ Created branch_capacity_history table';
    RAISE NOTICE '✓ Created patient_transfer_request table';
    RAISE NOTICE '✓ Seeded sample capacity data';
    RAISE NOTICE '✓ Created capacity update trigger';
    RAISE NOTICE '✓ Created capacity alert function';
    RAISE NOTICE '✓ Created branch_capacity_summary view';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Next: Run backend service to expose APIs';
    RAISE NOTICE '============================================';
END $$;
