-- =============================================
-- Migration 51: Master Data Schema
-- Created: April 22, 2026
-- Purpose: Centralized master data management for all modules
--          Replaces 600+ hardcoded values across 50+ categories
--          12 groups, 53 entity types, fully tenant-scoped with RLS
-- =============================================

-- Create master schema
CREATE SCHEMA IF NOT EXISTS master;

-- =============================================
-- CORE TABLE: master.master_value
-- Single generic table for ALL master data types
-- entity_type drives which "category" a row belongs to
-- =============================================
CREATE TABLE IF NOT EXISTS master.master_value (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
    group_key           VARCHAR(100) NOT NULL,   -- e.g. 'patient_setup', 'clinical'
    entity_type         VARCHAR(150) NOT NULL,   -- e.g. 'patient.title', 'clinical.surgery_type'
    code                VARCHAR(150) NOT NULL,
    label               VARCHAR(500) NOT NULL,
    description         TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',  -- flexible extra fields
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    is_system_locked    BOOLEAN NOT NULL DEFAULT false,  -- system values cannot be deleted
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT uq_master_value_tenant_type_code UNIQUE (tenant_id, entity_type, code)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_mv_tenant_group     ON master.master_value (tenant_id, group_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mv_tenant_type      ON master.master_value (tenant_id, entity_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mv_tenant_active    ON master.master_value (tenant_id, is_active)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mv_sort             ON master.master_value (tenant_id, entity_type, sort_order);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE master.master_value ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON master.master_value
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Allow service role to bypass RLS for seeding
CREATE POLICY admin_bypass ON master.master_value
    FOR ALL
    TO rls_admin
    USING (true)
    WITH CHECK (true);

-- =============================================
-- AUDIT TRIGGER: auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION master.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_master_value_updated_at ON master.master_value;
CREATE TRIGGER trg_master_value_updated_at
    BEFORE UPDATE ON master.master_value
    FOR EACH ROW EXECUTE FUNCTION master.set_updated_at();

-- =============================================
-- USAGE REFERENCE TABLE
-- Tracks which entity_types are referenced by which tables
-- Used for "safe delete" checks (block if in use)
-- =============================================
CREATE TABLE IF NOT EXISTS master.entity_type_registry (
    entity_type         VARCHAR(150) PRIMARY KEY,
    group_key           VARCHAR(100) NOT NULL,
    display_name        VARCHAR(200) NOT NULL,
    description         TEXT,
    tab_label           VARCHAR(100),
    allow_custom_fields BOOLEAN NOT NULL DEFAULT false,
    sort_order          INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- SEED: Entity Type Registry (53 entity types across 12 groups)
-- =============================================
INSERT INTO master.entity_type_registry (entity_type, group_key, display_name, tab_label, sort_order) VALUES

-- GROUP 1: Patient Setup
('patient.title',           'patient_setup', 'Patient Titles',         'Titles',           1),
('patient.blood_group',     'patient_setup', 'Blood Groups',           'Blood Groups',     2),
('patient.patient_type',    'patient_setup', 'Patient Types',          'Patient Types',    3),
('patient.gender',          'patient_setup', 'Gender',                 'Gender',           4),
('patient.marital_status',  'patient_setup', 'Marital Status',         'Marital Status',   5),
('patient.religion',        'patient_setup', 'Religions',              'Religions',        6),
('patient.occupation',      'patient_setup', 'Occupations',            'Occupations',      7),
('patient.id_proof_type',   'patient_setup', 'ID Proof Types',         'ID Proof Types',   8),
('patient.relationship',    'patient_setup', 'Relationship Types',     'Relationships',    9),
('patient.nationality',     'patient_setup', 'Nationalities',          'Nationalities',    10),

-- GROUP 2: Clinical
('clinical.surgery_type',       'clinical', 'Surgery Types',          'Surgery Types',    1),
('clinical.anesthesia_type',    'clinical', 'Anesthesia Types',       'Anesthesia Types', 2),
('clinical.surgical_procedure', 'clinical', 'Surgical Procedures',    'Procedures',       3),
('clinical.intraop_finding',    'clinical', 'Intra-Op Findings',      'Findings',         4),
('clinical.complication',       'clinical', 'Complications',          'Complications',    5),
('clinical.anesthesia_technique','clinical','Anesthesia Techniques',  'Techniques',       6),
('clinical.iol_catalog',        'clinical', 'IOL Catalog',            'IOL Catalog',      7),
('clinical.postop_checklist',   'clinical', 'Post-Op Checklist Items','Post-Op Items',    8),
('clinical.preop_clearance',    'clinical', 'Pre-Op Clearance Types', 'Pre-Op Clearance', 9),
('clinical.eye_notation',       'clinical', 'Eye Notation',           'Eye Notation',     10),
('clinical.scan_type',          'clinical', 'Scan/Imaging Types',     'Scan Types',       11),

-- GROUP 3: Appointments
('appointment.type',            'appointments', 'Appointment Types',   'Appointment Types', 1),
('appointment.consultation_type','appointments','Consultation Types', 'Consultation Types',2),
('appointment.priority',        'appointments', 'Priority Levels',     'Priority Levels',  3),
('appointment.cancel_reason',   'appointments', 'Cancellation Reasons','Cancel Reasons',   4),

-- GROUP 4: Counsellor
('counsellor.session_type',     'counsellor', 'Session Types',         'Session Types',    1),
('counsellor.surgery_package',  'counsellor', 'Surgery Packages',      'Packages',         2),
('counsellor.callback_type',    'counsellor', 'Callback Types',        'Callback Types',   3),
('counsellor.reminder_type',    'counsellor', 'Reminder Types',        'Reminder Types',   4),
('counsellor.comm_channel',     'counsellor', 'Communication Channels','Channels',         5),

-- GROUP 5: Billing & Finance
('billing.payment_mode',        'billing_finance', 'Payment Modes',    'Payment Modes',    1),
('billing.bill_item_type',      'billing_finance', 'Bill Item Types',  'Bill Item Types',  2),
('billing.transaction_type',    'billing_finance', 'Transaction Types','Transaction Types', 3),

-- GROUP 6: Insurance
('insurance.provider',          'insurance', 'Insurance Providers',    'Providers',        1),
('insurance.tpa_provider',      'insurance', 'TPA Providers',          'TPA Providers',    2),
('insurance.govt_scheme',       'insurance', 'Government Schemes',     'Govt Schemes',     3),
('insurance.type',              'insurance', 'Insurance Types',        'Insurance Types',  4),

-- GROUP 7: Inventory
('inventory.item_type',         'inventory', 'Item Types',             'Item Types',       1),
('inventory.uom',               'inventory', 'Units of Measurement',   'UOM',              2),
('inventory.purchase_category', 'inventory', 'Purchase Categories',    'Categories',       3),
('inventory.vendor_category',   'inventory', 'Vendor Categories',      'Vendor Categories',4),
('inventory.gst_rate',          'inventory', 'GST Rates',              'GST Rates',        5),
('inventory.storage_condition', 'inventory', 'Storage Conditions',     'Storage',          6),
('inventory.payment_term',      'inventory', 'Payment Terms',          'Payment Terms',    7),

-- GROUP 8: Pharmacy
('pharmacy.drug_form',          'pharmacy', 'Drug Forms',              'Drug Forms',       1),
('pharmacy.drug_route',         'pharmacy', 'Drug Routes',             'Drug Routes',      2),
('pharmacy.dosage_frequency',   'pharmacy', 'Dosage Frequencies',      'Frequencies',      3),
('pharmacy.drug_schedule',      'pharmacy', 'Drug Schedules',          'Schedules',        4),

-- GROUP 9: Lab & Diagnostics
('lab.specimen_type',           'lab_diagnostics', 'Specimen Types',   'Specimen Types',   1),
('lab.imaging_modality',        'lab_diagnostics', 'Imaging Modalities','Modalities',      2),
('lab.ep_type',                 'lab_diagnostics', 'Electrophysiology Types','EP Types',   3),

-- GROUP 10: Ward & IP
('ward.ward_type',              'ward_ip', 'Ward Types',               'Ward Types',       1),
('ward.bed_type',               'ward_ip', 'Bed Types',                'Bed Types',        2),
('ward.admission_type',         'ward_ip', 'Admission Types',          'Admission Types',  3),

-- GROUP 11: HR & Staff
('hr.employment_type',          'hr_staff', 'Employment Types',        'Employment Types', 1),
('hr.qualification_type',       'hr_staff', 'Qualification Types',     'Qualifications',   2),
('hr.leave_type',               'hr_staff', 'Leave Types',             'Leave Types',      3),
('hr.shift_type',               'hr_staff', 'Shift Types',             'Shift Types',      4),
('hr.performance_rating',       'hr_staff', 'Performance Ratings',     'Ratings',          5),
('hr.credential_type',          'hr_staff', 'Credential Types',        'Credentials',      6),

-- GROUP 12: System
('system.department',           'system', 'Departments',               'Departments',      1),
('system.timezone',             'system', 'Timezones',                 'Timezones',        2),
('system.currency',             'system', 'Currencies',                'Currencies',       3),
('system.language',             'system', 'Languages',                 'Languages',        4),
('system.checklist_default',    'system', 'Checklist Defaults',        'Checklists',       5)

ON CONFLICT (entity_type) DO NOTHING;

-- =============================================
-- PERMISSIONS: Master Data CRUD
-- =============================================
INSERT INTO public.permission (id, name, description, resource, action, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'master_data.view',   'View master data values',    'master_data', 'view',   NOW(), NOW()),
    (gen_random_uuid(), 'master_data.create', 'Create master data values',  'master_data', 'create', NOW(), NOW()),
    (gen_random_uuid(), 'master_data.update', 'Update master data values',  'master_data', 'update', NOW(), NOW()),
    (gen_random_uuid(), 'master_data.delete', 'Delete master data values',  'master_data', 'delete', NOW(), NOW()),
    (gen_random_uuid(), 'master_data.manage', 'Full master data management','master_data', 'manage', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Assign master_data.view to all roles that have any admin or view permission
-- Assign full manage to Super Admin and Admin roles
SELECT assign_permissions_to_role('Super Admin', ARRAY['master_data.view','master_data.create','master_data.update','master_data.delete','master_data.manage']);
SELECT assign_permissions_to_role('Admin', ARRAY['master_data.view','master_data.create','master_data.update','master_data.delete','master_data.manage']);
SELECT assign_permissions_to_role('Hospital Administrator', ARRAY['master_data.view','master_data.create','master_data.update']);

-- =============================================
-- DONE
-- =============================================
-- Next: Run 52_master_data_seed.sql to populate default values for all entity types
