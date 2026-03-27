-- =====================================================
-- CONSULTATION CHARGES TABLE
-- Purpose: Configurable per doctor/department/specialty consultation fees
-- Created: 2026-02-25
-- Dependencies: tenant, branch, department, users tables
-- =====================================================

-- Create Consultation Charges Table
CREATE TABLE IF NOT EXISTS consultation_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    branch_id UUID REFERENCES branch(id), -- NULL = applies to all branches
    
    -- Charge configuration type
    charge_type VARCHAR(50) NOT NULL CHECK (charge_type IN 
        ('DoctorSpecific', 'DepartmentWide', 'SpecialtyBased', 'Default')),
    
    -- Applicable to (one of these should be set based on charge_type)
    doctor_id UUID REFERENCES users(id), -- If doctor-specific
    department_id UUID REFERENCES department(id), -- If department-wide
    specialty VARCHAR(100), -- If specialty-based (e.g., "Retina Specialist")
    
    -- Pricing structure
    consultation_fee DECIMAL(10,2) NOT NULL,
    follow_up_fee DECIMAL(10,2) DEFAULT 0,
    emergency_consultation_fee DECIMAL(10,2), -- After hours/emergency
    home_visit_fee DECIMAL(10,2), -- If home visits offered
    
    -- Follow-up policy
    validity_days INTEGER DEFAULT 30, -- Follow-up free within X days
    free_follow_ups_count INTEGER DEFAULT 1, -- Number of free follow-ups allowed
    
    -- Payment modes accepted
    accepts_cash BOOLEAN DEFAULT TRUE,
    accepts_card BOOLEAN DEFAULT TRUE,
    accepts_insurance BOOLEAN DEFAULT TRUE,
    
    -- Validity period
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    -- Standard columns
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired'))
);

-- Indexes for performance
CREATE INDEX idx_consultation_charges_tenant ON consultation_charges(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultation_charges_branch ON consultation_charges(branch_id) WHERE is_active = TRUE;
CREATE INDEX idx_consultation_charges_doctor ON consultation_charges(doctor_id) WHERE is_active = TRUE;
CREATE INDEX idx_consultation_charges_dept ON consultation_charges(department_id) WHERE is_active = TRUE;
CREATE INDEX idx_consultation_charges_specialty ON consultation_charges(specialty) WHERE is_active = TRUE;
CREATE INDEX idx_consultation_charges_type ON consultation_charges(charge_type) WHERE is_active = TRUE;

-- Unique constraint: One active charge per doctor/branch combination
CREATE UNIQUE INDEX idx_consultation_doctor_unique ON consultation_charges(
    tenant_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::UUID), doctor_id
) WHERE charge_type = 'DoctorSpecific' AND is_active = TRUE AND deleted_at IS NULL;

-- Unique constraint: One active charge per department/branch combination
CREATE UNIQUE INDEX idx_consultation_dept_unique ON consultation_charges(
    tenant_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::UUID), department_id
) WHERE charge_type = 'DepartmentWide' AND is_active = TRUE AND deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE consultation_charges IS 'Configurable consultation fees per doctor, department, or specialty';
COMMENT ON COLUMN consultation_charges.charge_type IS 'DoctorSpecific, DepartmentWide, SpecialtyBased, or Default';
COMMENT ON COLUMN consultation_charges.consultation_fee IS 'Fee for initial consultation';
COMMENT ON COLUMN consultation_charges.follow_up_fee IS 'Fee for follow-up visits (often 0 within validity period)';
COMMENT ON COLUMN consultation_charges.validity_days IS 'Number of days within which follow-up is free/discounted';
COMMENT ON COLUMN consultation_charges.free_follow_ups_count IS 'Number of free follow-up visits allowed';

-- Function to get applicable consultation fee
CREATE OR REPLACE FUNCTION get_consultation_fee(
    p_tenant_id UUID,
    p_branch_id UUID,
    p_doctor_id UUID DEFAULT NULL,
    p_department_id UUID DEFAULT NULL,
    p_specialty VARCHAR DEFAULT NULL,
    p_is_follow_up BOOLEAN DEFAULT FALSE
) RETURNS DECIMAL AS $$
DECLARE
    v_charge consultation_charges%ROWTYPE;
    v_fee DECIMAL;
BEGIN
    -- Priority order: Doctor-specific > Specialty > Department > Default
    
    -- 1. Try doctor-specific charge
    IF p_doctor_id IS NOT NULL THEN
        SELECT * INTO v_charge
        FROM consultation_charges
        WHERE tenant_id = p_tenant_id
        AND (branch_id = p_branch_id OR branch_id IS NULL)
        AND charge_type = 'DoctorSpecific'
        AND doctor_id = p_doctor_id
        AND is_active = TRUE
        AND effective_from <= CURRENT_DATE
        AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
        AND deleted_at IS NULL
        ORDER BY branch_id NULLS LAST, effective_from DESC
        LIMIT 1;
        
        IF FOUND THEN
            v_fee := CASE WHEN p_is_follow_up THEN v_charge.follow_up_fee ELSE v_charge.consultation_fee END;
            RETURN v_fee;
        END IF;
    END IF;
    
    -- 2. Try specialty-based charge
    IF p_specialty IS NOT NULL THEN
        SELECT * INTO v_charge
        FROM consultation_charges
        WHERE tenant_id = p_tenant_id
        AND (branch_id = p_branch_id OR branch_id IS NULL)
        AND charge_type = 'SpecialtyBased'
        AND specialty = p_specialty
        AND is_active = TRUE
        AND effective_from <= CURRENT_DATE
        AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
        AND deleted_at IS NULL
        ORDER BY branch_id NULLS LAST, effective_from DESC
        LIMIT 1;
        
        IF FOUND THEN
            v_fee := CASE WHEN p_is_follow_up THEN v_charge.follow_up_fee ELSE v_charge.consultation_fee END;
            RETURN v_fee;
        END IF;
    END IF;
    
    -- 3. Try department-wide charge
    IF p_department_id IS NOT NULL THEN
        SELECT * INTO v_charge
        FROM consultation_charges
        WHERE tenant_id = p_tenant_id
        AND (branch_id = p_branch_id OR branch_id IS NULL)
        AND charge_type = 'DepartmentWide'
        AND department_id = p_department_id
        AND is_active = TRUE
        AND effective_from <= CURRENT_DATE
        AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
        AND deleted_at IS NULL
        ORDER BY branch_id NULLS LAST, effective_from DESC
        LIMIT 1;
        
        IF FOUND THEN
            v_fee := CASE WHEN p_is_follow_up THEN v_charge.follow_up_fee ELSE v_charge.consultation_fee END;
            RETURN v_fee;
        END IF;
    END IF;
    
    -- 4. Fall back to default charge
    SELECT * INTO v_charge
    FROM consultation_charges
    WHERE tenant_id = p_tenant_id
    AND charge_type = 'Default'
    AND is_active = TRUE
    AND effective_from <= CURRENT_DATE
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    AND deleted_at IS NULL
    ORDER BY effective_from DESC
    LIMIT 1;
    
    IF FOUND THEN
        v_fee := CASE WHEN p_is_follow_up THEN v_charge.follow_up_fee ELSE v_charge.consultation_fee END;
        RETURN v_fee;
    END IF;
    
    -- No charge configured, return 0
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Row-Level Security (RLS) Policy
ALTER TABLE consultation_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_consultation_charges ON consultation_charges
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON consultation_charges TO authenticated_user;
GRANT SELECT ON consultation_charges TO public_user;

-- Audit trigger
CREATE TRIGGER update_consultation_charges_updated_at
    BEFORE UPDATE ON consultation_charges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
