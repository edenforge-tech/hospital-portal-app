-- =====================================================
-- Module 3: Counselor Management - Consent Management
-- Migration: module03_09_consent_management.sql
-- Description: Digital consent forms with HTML5 Canvas signatures, legal compliance
-- Author: AI Assistant
-- Date: 2026-02-22
-- =====================================================

-- =====================================================
-- 1. CONSENT FORM TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS consent_form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Template Details
    template_name VARCHAR(200) NOT NULL,
    template_code VARCHAR(50) UNIQUE,
    consent_category VARCHAR(50) CHECK (consent_category IN (
        'SurgeryConsent',
        'AnesthesiaConsent',
        'DataSharingConsent',
        'PhotographyConsent',
        'ResearchConsent',
        'GeneralTreatmentConsent'
    )),
    
    -- Surgery Type Mapping (for surgery consents)
    applicable_surgery_types TEXT[], -- ['Cataract', 'Retinal', 'Glaucoma']
    
    -- Template Content (HTML)
    template_html TEXT NOT NULL,
    /* HTML template with placeholders:
    - {{PATIENT_NAME}}, {{AGE}}, {{GENDER}}
    - {{SURGERY_TYPE}}, {{EYE_OPERATED}}
    - {{SURGEON_NAME}}, {{HOSPITAL_NAME}}
    - {{CURRENT_DATE}}, {{CONSENT_NUMBER}}
    */
    
    -- Language Support
    template_language VARCHAR(10) DEFAULT 'en', -- 'en', 'hi', 'kn', 'te'
    
    -- Signature Requirements
    requires_patient_signature BOOLEAN DEFAULT TRUE,
    requires_witness_signature BOOLEAN DEFAULT TRUE,
    requires_guardian_signature BOOLEAN DEFAULT FALSE, -- For minors
    min_age_for_guardian INTEGER DEFAULT 18,
    
    -- Legal Compliance
    legal_version VARCHAR(20), -- e.g., 'v2.1'
    effective_from_date DATE NOT NULL,
    retired_date DATE,
    compliance_standard VARCHAR(50), -- 'HIPAA', 'GDPR', 'MCI'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_consent_template_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_consent_template_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_consent_template_updated_by FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- 2. PATIENT CONSENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    
    -- Session & Patient Links
    session_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    admission_id UUID,
    
    -- Template Link
    template_id UUID NOT NULL,
    
    -- Consent Details
    consent_number VARCHAR(100) UNIQUE,
    consent_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consent_time TIME NOT NULL DEFAULT CURRENT_TIME,
    
    -- Rendered Consent (with filled placeholders)
    rendered_html TEXT NOT NULL,
    pdf_url TEXT, -- Generated PDF stored in cloud
    
    -- Patient Signature
    patient_signature_base64 TEXT, -- HTML5 Canvas signature as base64 PNG
    patient_signature_timestamp TIMESTAMPTZ,
    patient_signed_by VARCHAR(200), -- Name entered by patient
    
    -- Witness Signature
    witness_signature_base64 TEXT,
    witness_signature_timestamp TIMESTAMPTZ,
    witness_name VARCHAR(200),
    witness_designation VARCHAR(100), -- 'Nurse', 'Counselor', 'Staff'
    witness_user_id UUID, -- Staff member who witnessed
    
    -- Guardian Signature (for minors or legally incompetent patients)
    requires_guardian BOOLEAN DEFAULT FALSE,
    guardian_signature_base64 TEXT,
    guardian_signature_timestamp TIMESTAMPTZ,
    guardian_name VARCHAR(200),
    guardian_relation VARCHAR(50), -- 'Parent', 'Spouse', 'Legal Guardian'
    guardian_id_proof_type VARCHAR(50),
    guardian_id_proof_number VARCHAR(100),
    
    -- Legal Compliance Tracking
    ip_address VARCHAR(50), -- IP from which consent was signed
    device_info TEXT, -- Browser/device details
    geolocation VARCHAR(100), -- Optional: lat/long
    
    -- Status
    consent_status VARCHAR(30) DEFAULT 'Unsigned' CHECK (consent_status IN (
        'Unsigned',
        'PartiallySigned',
        'FullySigned',
        'Revoked',
        'Expired'
    )),
    
    all_signatures_obtained BOOLEAN DEFAULT FALSE,
    
    -- Revocation
    revoked_at TIMESTAMPTZ,
    revoked_by_user_id UUID,
    revocation_reason TEXT,
    revocation_acknowledgment TEXT,
    
    -- Expiry (some consents expire after a period)
    valid_until DATE,
    
    -- Verification
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by_user_id UUID,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_patient_consent_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE,
    CONSTRAINT fk_patient_consent_branch FOREIGN KEY (branch_id) REFERENCES branch(id),
    CONSTRAINT fk_patient_consent_session FOREIGN KEY (session_id) REFERENCES counseling_sessions(id),
    CONSTRAINT fk_patient_consent_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT fk_patient_consent_admission FOREIGN KEY (admission_id) REFERENCES patient_admissions(id),
    CONSTRAINT fk_patient_consent_template FOREIGN KEY (template_id) REFERENCES consent_form_templates(id),
    CONSTRAINT fk_patient_consent_witness FOREIGN KEY (witness_user_id) REFERENCES users(id),
    CONSTRAINT fk_patient_consent_revoked_by FOREIGN KEY (revoked_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_patient_consent_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_patient_consent_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Consent Form Templates
CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant ON consent_form_templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_form_templates(is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_templates_category ON consent_form_templates(consent_category);
CREATE INDEX IF NOT EXISTS idx_consent_templates_surgery_types ON consent_form_templates USING GIN (applicable_surgery_types);

-- Patient Consents
CREATE INDEX IF NOT EXISTS idx_patient_consents_tenant_branch ON patient_consents(tenant_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_consents_session ON patient_consents(session_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_patient ON patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_admission ON patient_consents(admission_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_template ON patient_consents(template_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_status ON patient_consents(consent_status);
CREATE INDEX IF NOT EXISTS idx_patient_consents_unsigned ON patient_consents(all_signatures_obtained) WHERE all_signatures_obtained = FALSE;
CREATE INDEX IF NOT EXISTS idx_patient_consents_date ON patient_consents(consent_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE consent_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_consent_templates ON consent_form_templates
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_patient_consents ON patient_consents
    FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- =====================================================
-- TRIGGER: Auto-generate Consent Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_consent_number()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_code VARCHAR(10);
    v_template_code VARCHAR(10);
    v_sequence INTEGER;
BEGIN
    -- Get branch code
    SELECT code INTO v_branch_code FROM branch WHERE id = NEW.branch_id;
    v_branch_code := COALESCE(v_branch_code, 'HQ');
    
    -- Get template code
    SELECT template_code INTO v_template_code FROM consent_form_templates WHERE id = NEW.template_id;
    v_template_code := COALESCE(v_template_code, 'CONS');
    
    -- Get next sequence number for the day
    SELECT COUNT(*) + 1 INTO v_sequence
    FROM patient_consents
    WHERE branch_id = NEW.branch_id
    AND template_id = NEW.template_id
    AND DATE(consent_date) = NEW.consent_date
    AND deleted_at IS NULL;
    
    -- Generate consent number: <TEMPLATE>-<BRANCH>-<YYYYMMDD>-<SEQ>
    NEW.consent_number := v_template_code || '-' || v_branch_code || '-' || 
        TO_CHAR(NEW.consent_date, 'YYYYMMDD') || '-' || 
        LPAD(v_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_consent_number
    BEFORE INSERT ON patient_consents
    FOR EACH ROW
    WHEN (NEW.consent_number IS NULL)
    EXECUTE FUNCTION generate_consent_number();

-- =====================================================
-- TRIGGER: Update Consent Status on Signature
-- =====================================================

CREATE OR REPLACE FUNCTION update_consent_status()
RETURNS TRIGGER AS $$
DECLARE
    v_requires_patient BOOLEAN;
    v_requires_witness BOOLEAN;
    v_requires_guardian BOOLEAN;
    v_all_signed BOOLEAN := TRUE;
BEGIN
    -- Get signature requirements from template
    SELECT 
        requires_patient_signature,
        requires_witness_signature,
        requires_guardian_signature
    INTO 
        v_requires_patient,
        v_requires_witness,
        v_requires_guardian
    FROM consent_form_templates
    WHERE id = NEW.template_id;
    
    -- Check if all required signatures are obtained
    IF v_requires_patient AND NEW.patient_signature_base64 IS NULL THEN
        v_all_signed := FALSE;
    END IF;
    
    IF v_requires_witness AND NEW.witness_signature_base64 IS NULL THEN
        v_all_signed := FALSE;
    END IF;
    
    IF (v_requires_guardian OR NEW.requires_guardian) AND NEW.guardian_signature_base64 IS NULL THEN
        v_all_signed := FALSE;
    END IF;
    
    -- Update status
    NEW.all_signatures_obtained := v_all_signed;
    
    IF v_all_signed THEN
        NEW.consent_status := 'FullySigned';
    ELSIF NEW.patient_signature_base64 IS NOT NULL OR NEW.witness_signature_base64 IS NOT NULL OR NEW.guardian_signature_base64 IS NOT NULL THEN
        NEW.consent_status := 'PartiallySigned';
    ELSE
        NEW.consent_status := 'Unsigned';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_consent_status
    BEFORE INSERT OR UPDATE ON patient_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_consent_status();

-- =====================================================
-- SEED DATA: Consent Form Templates
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Template 1: General Surgery Consent
        INSERT INTO consent_form_templates (
            tenant_id, template_name, template_code, consent_category,
            applicable_surgery_types, template_html, legal_version, effective_from_date,
            is_active
        ) VALUES (
            v_tenant_id, 'General Surgery Consent Form', 'SURG', 'SurgeryConsent',
            ARRAY['Cataract', 'Retinal', 'Glaucoma', 'Oculoplasty']::TEXT[],
            '<h1>Surgical Consent Form</h1>
            <p>I, <strong>{{PATIENT_NAME}}</strong>, aged <strong>{{AGE}}</strong> years, hereby consent to undergo <strong>{{SURGERY_TYPE}}</strong> on my <strong>{{EYE_OPERATED}}</strong> eye.</p>
            <p>The surgery will be performed by <strong>{{SURGEON_NAME}}</strong> at <strong>{{HOSPITAL_NAME}}</strong>.</p>
            <h3>Risks and Complications Explained:</h3>
            <ul>
                <li>Infection</li>
                <li>Bleeding</li>
                <li>Vision loss (rare)</li>
                <li>Need for additional procedures</li>
                <li>Reaction to anesthesia</li>
            </ul>
            <p>I understand the nature of the procedure and have had the opportunity to ask questions.</p>
            <p>Date: {{CURRENT_DATE}}</p>
            <p>Consent Number: {{CONSENT_NUMBER}}</p>',
            'v1.0', CURRENT_DATE, TRUE
        );
        
        -- Template 2: Anesthesia Consent
        INSERT INTO consent_form_templates (
            tenant_id, template_name, template_code, consent_category,
            template_html, legal_version, effective_from_date, is_active
        ) VALUES (
            v_tenant_id, 'Anesthesia Consent Form', 'ANES', 'AnesthesiaConsent',
            '<h1>Anesthesia Consent Form</h1>
            <p>I, <strong>{{PATIENT_NAME}}</strong>, consent to the administration of anesthesia for my surgery.</p>
            <h3>Type of Anesthesia:</h3>
            <p>Local anesthesia with or without sedation will be administered as appropriate.</p>
            <h3>Risks Explained:</h3>
            <ul>
                <li>Allergic reactions</li>
                <li>Breathing difficulties</li>
                <li>Heart rhythm changes</li>
                <li>Nausea and vomiting</li>
            </ul>
            <p>I have been informed about the risks and benefits.</p>
            <p>Date: {{CURRENT_DATE}}</p>',
            'v1.0', CURRENT_DATE, TRUE
        );
        
        -- Template 3: Photography Consent
        INSERT INTO consent_form_templates (
            tenant_id, template_name, template_code, consent_category,
            template_html, legal_version, effective_from_date, is_active,
            requires_witness_signature
        ) VALUES (
            v_tenant_id, 'Photography and Recording Consent', 'PHOTO', 'PhotographyConsent',
            '<h1>Photography and Recording Consent</h1>
            <p>I, <strong>{{PATIENT_NAME}}</strong>, consent to photography or video recording of my surgical procedure for:</p>
            <ul>
                <li>Medical records</li>
                <li>Educational purposes</li>
                <li>Quality improvement</li>
            </ul>
            <p>I understand that my identity will be protected in any educational use.</p>
            <p>Date: {{CURRENT_DATE}}</p>',
            'v1.0', CURRENT_DATE, TRUE, FALSE -- No witness required
        );
        
        RAISE NOTICE 'Seeded 3 consent form templates';
    END IF;
END $$;

COMMENT ON TABLE consent_form_templates IS 'Consent form templates with HTML content and signature requirements';
COMMENT ON TABLE patient_consents IS 'Digital patient consents with HTML5 Canvas signatures and legal compliance tracking';
