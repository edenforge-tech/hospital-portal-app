-- Fixed migration 66 - uses ot_schedules instead of ot_booking_schedule
BEGIN;

CREATE TABLE IF NOT EXISTS pre_admission_checklist_templates (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    template_name       VARCHAR(200)    NOT NULL,
    description         TEXT,
    patient_type        VARCHAR(50),
    surgery_category    VARCHAR(100),
    min_patient_age     INTEGER,
    max_patient_age     INTEGER,
    applies_to_eye      VARCHAR(10),
    display_order       INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(20)     NOT NULL DEFAULT 'active',
    CONSTRAINT pre_admission_checklist_templates_patient_type_check
        CHECK (patient_type IS NULL OR patient_type IN (
            'Cash','Insurance','CoPay','ESH','CGHS','Arograshree',
            'SGHS','Camp','Railway','Free'
        ))
);

CREATE INDEX IF NOT EXISTS idx_pact_tenant_active
    ON pre_admission_checklist_templates(tenant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_pact_patient_type
    ON pre_admission_checklist_templates(tenant_id, patient_type, surgery_category);

CREATE TABLE IF NOT EXISTS pre_admission_checklist_items (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    template_id         UUID            NOT NULL REFERENCES pre_admission_checklist_templates(id) ON DELETE CASCADE,
    item_key            VARCHAR(100)    NOT NULL,
    item_label          VARCHAR(200)    NOT NULL,
    description         TEXT,
    department_owner    VARCHAR(100),
    department_color    VARCHAR(50),
    is_mandatory        BOOLEAN         NOT NULL DEFAULT TRUE,
    is_blocking         BOOLEAN         NOT NULL DEFAULT FALSE,
    applies_if_age_below INTEGER,
    requires_document   BOOLEAN         NOT NULL DEFAULT FALSE,
    display_order       INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(20)     NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_paci_template ON pre_admission_checklist_items(template_id, is_active);

CREATE TABLE IF NOT EXISTS ot_admission_checklist_completions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID            NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    schedule_id         UUID            NOT NULL REFERENCES ot_schedules(id) ON DELETE CASCADE,
    item_id             UUID            NOT NULL REFERENCES pre_admission_checklist_items(id) ON DELETE CASCADE,
    template_id         UUID            NOT NULL REFERENCES pre_admission_checklist_templates(id) ON DELETE CASCADE,
    is_complete         BOOLEAN         NOT NULL DEFAULT FALSE,
    completed_by_user_id UUID,
    completed_at        TIMESTAMPTZ,
    completed_by_dept   VARCHAR(100),
    document_url        TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by_user_id  UUID,
    updated_by_user_id  UUID,
    deleted_at          TIMESTAMPTZ,
    status              VARCHAR(20)     NOT NULL DEFAULT 'active',
    CONSTRAINT uq_checklist_completion UNIQUE (schedule_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_oacc_schedule ON ot_admission_checklist_completions(schedule_id);

ALTER TABLE pre_admission_checklist_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON pre_admission_checklist_templates;
CREATE POLICY tenant_isolation ON pre_admission_checklist_templates
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

ALTER TABLE pre_admission_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON pre_admission_checklist_items;
CREATE POLICY tenant_isolation ON pre_admission_checklist_items
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

ALTER TABLE ot_admission_checklist_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ot_admission_checklist_completions;
CREATE POLICY tenant_isolation ON ot_admission_checklist_completions
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Seed default Universal template for all tenants
DO $$
DECLARE
    v_tenant    RECORD;
    v_tmpl_id   UUID;
BEGIN
    FOR v_tenant IN SELECT id FROM tenant WHERE deleted_at IS NULL LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pre_admission_checklist_templates
            WHERE tenant_id = v_tenant.id
              AND template_name = 'Universal Pre-Admission Checklist'
        ) THEN
            v_tmpl_id := gen_random_uuid();

            INSERT INTO pre_admission_checklist_templates
                (id, tenant_id, template_name, description, display_order, is_active, status)
            VALUES (
                v_tmpl_id, v_tenant.id,
                'Universal Pre-Admission Checklist',
                'Default checklist applied to all surgery types and patient categories.',
                0, TRUE, 'active'
            );

            INSERT INTO pre_admission_checklist_items
                (tenant_id, template_id, item_key, item_label, department_owner, department_color, is_mandatory, is_blocking, display_order, status)
            VALUES
                (v_tenant.id, v_tmpl_id, 'biometry_done',       'Biometry / A-Scan',            'Optometry',  'bg-teal-100 text-teal-700',    TRUE, FALSE, 1, 'active'),
                (v_tenant.id, v_tmpl_id, 'labs_done',           'Pre-op lab reports',            'Lab',        'bg-yellow-100 text-yellow-700', TRUE, FALSE, 2, 'active'),
                (v_tenant.id, v_tmpl_id, 'ecg_done',            'ECG / Anaesthesia fitness',     'Cardiology', 'bg-red-100 text-red-700',      TRUE, FALSE, 3, 'active'),
                (v_tenant.id, v_tmpl_id, 'anesthesia_clearance','Anaesthesia clearance',         'Anaesthesia','bg-orange-100 text-orange-700', TRUE, TRUE,  4, 'active'),
                (v_tenant.id, v_tmpl_id, 'consent_signed',      'Surgical consent signed',       'Counselor',  'bg-blue-100 text-blue-700',    TRUE, TRUE,  5, 'active'),
                (v_tenant.id, v_tmpl_id, 'payment_confirmed',   'Payment / Insurance cleared',   'Billing',    'bg-green-100 text-green-700',  TRUE, TRUE,  6, 'active'),
                (v_tenant.id, v_tmpl_id, 'bed_assigned',        'Bed / ward assigned',           'Admissions', 'bg-purple-100 text-purple-700', FALSE, FALSE, 7, 'active'),
                (v_tenant.id, v_tmpl_id, 'ot_slot_confirmed',   'OT slot confirmed',             'OT',         'bg-indigo-100 text-indigo-700', TRUE, FALSE, 8, 'active');
        END IF;
    END LOOP;
END $$;

COMMIT;
