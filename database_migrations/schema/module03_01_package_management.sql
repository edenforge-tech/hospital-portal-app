-- =====================================================
-- Module 3: Counselor Management - Package Management
-- Migration: module03_01_package_management.sql
-- Description: Master package templates, counselor packages, discount approvals
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SURGERY PACKAGE TEMPLATES (Master Packages)
-- =====================================================
CREATE TABLE IF NOT EXISTS surgery_package_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Package Details
    package_name VARCHAR(200) NOT NULL,
    package_code VARCHAR(50) UNIQUE,
    package_category VARCHAR(50) NOT NULL CHECK (package_category IN ('Standard', 'Premium', 'Deluxe', 'Custom')),
    description TEXT,
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Discount Control
    max_discount_percent DECIMAL(5,2) DEFAULT 10.00,
    requires_approval_for_custom BOOLEAN DEFAULT TRUE,
    
    -- Configuration
    applicable_surgery_types TEXT[], -- ['Cataract', 'Glaucoma', 'Retinal']
    included_services TEXT[], -- ['Pre-op Consultation', 'Surgery', 'Post-op Follow-up']
    validity_days INTEGER DEFAULT 90, -- Package quote valid for 90 days
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_package_template_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. SURGERY PACKAGE ITEMS CATALOG (Reusable Components)
-- =====================================================
CREATE TABLE IF NOT EXISTS surgery_package_items_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Item Details
    item_name VARCHAR(200) NOT NULL,
    item_code VARCHAR(50) UNIQUE,
    item_category VARCHAR(50) NOT NULL CHECK (item_category IN ('Surgery', 'IOL', 'Diagnostic', 'Medication', 'Consumable', 'Professional Fee', 'Facility Fee')),
    description TEXT,
    
    -- Pricing
    default_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2), -- For margin calculation
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Specifications
    specifications JSONB, -- IOL specs, procedure details, etc.
    unit_of_measure VARCHAR(50) DEFAULT 'Service', -- Service, Piece, Session, Day
    
    -- Availability
    is_optional BOOLEAN DEFAULT FALSE, -- Can be added as optional add-on
    requires_prescription BOOLEAN DEFAULT FALSE,
    requires_authorization BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_catalog_item_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. COUNSELOR PACKAGES (Built by Counselors)
-- =====================================================
CREATE TABLE IF NOT EXISTS counselor_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Session Link
    session_id UUID NOT NULL, -- Links to counseling_sessions
    
    -- Source
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('FromTemplate', 'Custom')),
    template_id UUID, -- NULL if Custom
    
    -- Package Details
    package_name VARCHAR(200) NOT NULL,
    package_description TEXT,
    
    -- Pricing Calculation
    base_price DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_reason TEXT,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_price DECIMAL(12,2) NOT NULL,
    
    -- Approval
    discount_approval_status VARCHAR(30) DEFAULT 'NotRequired' CHECK (discount_approval_status IN ('NotRequired', 'AutoApproved', 'PendingApproval', 'Approved', 'Rejected')),
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_counselor_package_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_counselor_package_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_counselor_package_template FOREIGN KEY (template_id) REFERENCES surgery_package_templates(id),
    CONSTRAINT fk_counselor_package_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 4. COUNSELOR PACKAGE ITEMS (Line Items)
-- =====================================================
CREATE TABLE IF NOT EXISTS counselor_package_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Package Link
    package_id UUID NOT NULL,
    catalog_item_id UUID, -- NULL if custom item
    
    -- Item Details
    item_name VARCHAR(200) NOT NULL,
    item_category VARCHAR(50),
    item_description TEXT,
    
    -- Pricing
    unit_price DECIMAL(12,2) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Inclusion
    is_included BOOLEAN DEFAULT TRUE, -- FALSE = optional add-on
    is_mandatory BOOLEAN DEFAULT FALSE,
    
    -- Display Order
    display_order INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_package_item_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_package_item_package FOREIGN KEY (package_id) REFERENCES counselor_packages(id) ON DELETE CASCADE,
    CONSTRAINT fk_package_item_catalog FOREIGN KEY (catalog_item_id) REFERENCES surgery_package_items_catalog(id)
);

-- =====================================================
-- 5. PACKAGE DISCOUNT APPROVALS (Approval Workflow)
-- =====================================================
CREATE TABLE IF NOT EXISTS package_discount_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID,
    
    -- Package Link
    package_id UUID NOT NULL,
    
    -- Request Details
    request_number VARCHAR(50) UNIQUE,
    requested_by_user_id UUID NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2) NOT NULL,
    final_price DECIMAL(12,2) NOT NULL,
    justification TEXT NOT NULL,
    
    -- Approval Hierarchy
    approval_level INTEGER NOT NULL DEFAULT 1, -- 1=Manager, 2=HOD, 3=Finance
    assigned_to_user_id UUID,
    assigned_to_role VARCHAR(100),
    
    -- Review
    reviewed_by_user_id UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Status
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    
    -- SLA
    sla_deadline TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_discount_approval_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_discount_approval_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_discount_approval_package FOREIGN KEY (package_id) REFERENCES counselor_packages(id) ON DELETE CASCADE,
    CONSTRAINT fk_discount_approval_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_discount_approval_assigned_to FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
    CONSTRAINT fk_discount_approval_reviewed_by FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Package Templates
CREATE INDEX IF NOT EXISTS idx_package_templates_tenant ON surgery_package_templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_package_templates_category ON surgery_package_templates(package_category) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_package_templates_active ON surgery_package_templates(is_active, deleted_at);

-- Catalog Items
CREATE INDEX IF NOT EXISTS idx_catalog_items_tenant ON surgery_package_items_catalog(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON surgery_package_items_catalog(item_category) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_catalog_items_active ON surgery_package_items_catalog(is_active, deleted_at);

-- Counselor Packages
CREATE INDEX IF NOT EXISTS idx_counselor_packages_tenant ON counselor_packages(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_counselor_packages_session ON counselor_packages(session_id);
CREATE INDEX IF NOT EXISTS idx_counselor_packages_template ON counselor_packages(template_id);
CREATE INDEX IF NOT EXISTS idx_counselor_packages_approval_status ON counselor_packages(discount_approval_status);
CREATE INDEX IF NOT EXISTS idx_counselor_packages_created_by ON counselor_packages(created_by_user_id);

-- Package Items
CREATE INDEX IF NOT EXISTS idx_package_items_package ON counselor_package_items(package_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_package_items_catalog ON counselor_package_items(catalog_item_id);

-- Discount Approvals
CREATE INDEX IF NOT EXISTS idx_discount_approvals_tenant ON package_discount_approvals(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_discount_approvals_package ON package_discount_approvals(package_id);
CREATE INDEX IF NOT EXISTS idx_discount_approvals_status ON package_discount_approvals(status);
CREATE INDEX IF NOT EXISTS idx_discount_approvals_assigned_to ON package_discount_approvals(assigned_to_user_id) WHERE status = 'Pending';
CREATE INDEX IF NOT EXISTS idx_discount_approvals_sla ON package_discount_approvals(sla_deadline, sla_breached) WHERE status = 'Pending';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE surgery_package_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgery_package_items_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_discount_approvals ENABLE ROW LEVEL SECURITY;

-- Package Templates Policy
CREATE POLICY tenant_isolation_package_templates ON surgery_package_templates
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Catalog Items Policy
CREATE POLICY tenant_isolation_catalog_items ON surgery_package_items_catalog
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Counselor Packages Policy
CREATE POLICY tenant_isolation_counselor_packages ON counselor_packages
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Package Items Policy
CREATE POLICY tenant_isolation_package_items ON counselor_package_items
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Discount Approvals Policy
CREATE POLICY tenant_isolation_discount_approvals ON package_discount_approvals
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- SEED DATA: Master Package Templates
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_template_id_1 UUID;
    v_template_id_2 UUID;
    v_template_id_3 UUID;
    v_template_id_4 UUID;
    v_template_id_5 UUID;
BEGIN
    -- Get first tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Template 1: Cataract Standard
        INSERT INTO surgery_package_templates (
            id, tenant_id, package_name, package_code, package_category, description,
            base_price, max_discount_percent, applicable_surgery_types, is_active
        ) VALUES (
            uuid_generate_v4(), v_tenant_id, 'Cataract Surgery - Standard', 'CAT-STD-001', 'Standard',
            'Basic cataract surgery with monofocal IOL, includes pre-op consultation, surgery, and 3 follow-ups',
            25000.00, 10.00, ARRAY['Cataract'], TRUE
        ) RETURNING id INTO v_template_id_1;
        
        -- Template 2: Cataract Premium Monofocal
        INSERT INTO surgery_package_templates (
            id, tenant_id, package_name, package_code, package_category, description,
            base_price, max_discount_percent, applicable_surgery_types, is_active
        ) VALUES (
            uuid_generate_v4(), v_tenant_id, 'Cataract Surgery - Premium Monofocal', 'CAT-PREM-001', 'Premium',
            'Premium cataract surgery with high-quality monofocal IOL, includes femto laser, pre-op tests, surgery, 6 follow-ups',
            45000.00, 10.00, ARRAY['Cataract'], TRUE
        ) RETURNING id INTO v_template_id_2;
        
        -- Template 3: Cataract Toric (Astigmatism Correction)
        INSERT INTO surgery_package_templates (
            id, tenant_id, package_name, package_code, package_category, description,
            base_price, max_discount_percent, applicable_surgery_types, is_active
        ) VALUES (
            uuid_generate_v4(), v_tenant_id, 'Cataract Surgery - Toric IOL', 'CAT-TOR-001', 'Premium',
            'Cataract surgery with toric IOL for astigmatism correction, includes topography, surgery, 6 follow-ups',
            65000.00, 10.00, ARRAY['Cataract'], TRUE
        ) RETURNING id INTO v_template_id_3;
        
        -- Template 4: Cataract Multifocal (Near + Distance Vision)
        INSERT INTO surgery_package_templates (
            id, tenant_id, package_name, package_code, package_category, description,
            base_price, max_discount_percent, applicable_surgery_types, is_active
        ) VALUES (
            uuid_generate_v4(), v_tenant_id, 'Cataract Surgery - Multifocal IOL', 'CAT-MULTI-001', 'Deluxe',
            'Premium cataract surgery with multifocal IOL (no glasses needed), includes femto laser, topography, surgery, 12 follow-ups',
            95000.00, 10.00, ARRAY['Cataract'], TRUE
        ) RETURNING id INTO v_template_id_4;
        
        -- Template 5: Glaucoma Surgery
        INSERT INTO surgery_package_templates (
            id, tenant_id, package_name, package_code, package_category, description,
            base_price, max_discount_percent, applicable_surgery_types, is_active
        ) VALUES (
            uuid_generate_v4(), v_tenant_id, 'Glaucoma Surgery - Trabeculectomy', 'GLAUC-TRB-001', 'Standard',
            'Trabeculectomy with mitomycin-C, includes pre-op tests, surgery, medications, 8 follow-ups',
            55000.00, 10.00, ARRAY['Glaucoma'], TRUE
        ) RETURNING id INTO v_template_id_5;
        
        RAISE NOTICE 'Seeded 5 master package templates for tenant %', v_tenant_id;
    END IF;
END $$;

-- =====================================================
-- SEED DATA: Package Items Catalog
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO surgery_package_items_catalog (tenant_id, item_name, item_code, item_category, default_price, description, is_active) VALUES
        (v_tenant_id, 'Phacoemulsification Surgery', 'PROC-PHACO-001', 'Surgery', 15000.00, 'Phaco cataract surgery procedure', TRUE),
        (v_tenant_id, 'IOL - Monofocal Standard', 'IOL-MONO-STD', 'IOL', 8000.00, 'Standard monofocal intraocular lens', TRUE),
        (v_tenant_id, 'IOL - Monofocal Premium', 'IOL-MONO-PREM', 'IOL', 15000.00, 'Premium quality monofocal IOL (Alcon/J&J)', TRUE),
        (v_tenant_id, 'IOL - Toric', 'IOL-TORIC', 'IOL', 25000.00, 'Toric IOL for astigmatism correction', TRUE),
        (v_tenant_id, 'IOL - Multifocal', 'IOL-MULTI', 'IOL', 45000.00, 'Multifocal IOL for near and distance vision', TRUE),
        (v_tenant_id, 'Femto Laser Assisted Cataract Surgery', 'PROC-FEMTO', 'Surgery', 20000.00, 'Femto laser for precise capsulotomy and fragmentation', TRUE),
        (v_tenant_id, 'Corneal Topography', 'DIAG-TOPO', 'Diagnostic', 2000.00, 'Corneal topography for IOL calculation', TRUE),
        (v_tenant_id, 'A-Scan Biometry', 'DIAG-ASCAN', 'Diagnostic', 1500.00, 'A-scan for IOL power calculation', TRUE),
        (v_tenant_id, 'Pre-Operative Test Package', 'DIAG-PREOP', 'Diagnostic', 3000.00, 'ECG, CBC, Blood Sugar, Viral Markers', TRUE),
        (v_tenant_id, 'Surgeon Professional Fee', 'FEE-SURGEON', 'Professional Fee', 10000.00, 'Surgeon consultation and surgery fee', TRUE),
        (v_tenant_id, 'Anesthesia Fee', 'FEE-ANESTH', 'Professional Fee', 3000.00, 'Anesthesiologist fee', TRUE),
        (v_tenant_id, 'OT Facility Charges', 'FEE-OT', 'Facility Fee', 5000.00, 'Operation theater charges', TRUE),
        (v_tenant_id, 'Post-Op Medications', 'MED-POSTOP', 'Medication', 2000.00, 'Eye drops and medications for 1 month', TRUE),
        (v_tenant_id, 'Follow-up Consultation (per visit)', 'CONS-FOLLOWUP', 'Professional Fee', 500.00, 'Post-operative follow-up visit', TRUE);
        
        RAISE NOTICE 'Seeded 14 package items catalog entries for tenant %', v_tenant_id;
    END IF;
END $$;

COMMENT ON TABLE surgery_package_templates IS 'Master package templates created by Admin/HOD';
COMMENT ON TABLE surgery_package_items_catalog IS 'Reusable catalog of surgery package components';
COMMENT ON TABLE counselor_packages IS 'Packages built by counselors from templates or custom';
COMMENT ON TABLE counselor_package_items IS 'Line items in counselor packages';
COMMENT ON TABLE package_discount_approvals IS 'Approval workflow for discounts >10%';
