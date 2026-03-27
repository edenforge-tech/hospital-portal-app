-- =====================================================
-- MIGRATION 13: TRAINING & CREDENTIAL VERIFICATION
-- =====================================================
-- Hospital Portal - Training Management & Professional Credentials
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

-- =====================================================
-- 1. TRAINING CATALOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS training_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Training details
    training_code VARCHAR(100) UNIQUE NOT NULL,
    training_name VARCHAR(200) NOT NULL,
    training_description TEXT,
    training_category VARCHAR(100), -- 'Compliance', 'Clinical Skills', 'Software', 'Safety', 'Leadership'
    training_type VARCHAR(50) CHECK (training_type IN ('mandatory', 'optional', 'role_specific', 'continuing_education')),
    
    -- Duration and delivery
    duration_hours DECIMAL(5, 2),
    delivery_method VARCHAR(50), -- 'online', 'in_person', 'hybrid', 'self_paced', 'instructor_led'
    course_url TEXT, -- LMS URL or external platform
    
    -- Prerequisites
    prerequisite_training_ids UUID[],
    
    -- Target audience
    applicable_to_roles TEXT[], -- Array of role codes
    applicable_to_departments TEXT[],
    
    -- Validity and recertification
    validity_months INTEGER, -- NULL = one-time, 12 = annual recertification
    recertification_required BOOLEAN DEFAULT false,
    
    -- Content
    learning_objectives TEXT,
    course_outline TEXT,
    assessment_required BOOLEAN DEFAULT false,
    passing_score_percentage DECIMAL(5, 2) DEFAULT 70.00,
    
    -- Tracking
    total_enrollments INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    average_completion_days DECIMAL(6, 2),
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_training_catalog_tenant ON training_catalog(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_catalog_code ON training_catalog(training_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_training_catalog_category ON training_catalog(training_category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_training_catalog_type ON training_catalog(training_type) WHERE is_active = true;

COMMENT ON TABLE training_catalog IS 'Master catalog of all available training courses';
COMMENT ON COLUMN training_catalog.validity_months IS 'How long certification is valid (NULL = permanent, 12 = annual recert)';
COMMENT ON COLUMN training_catalog.training_type IS 'mandatory (HIPAA, Safety), optional (leadership), role_specific (clinical skills), continuing_education (CME)';

-- =====================================================
-- 2. USER TRAINING ASSIGNMENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_training_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_catalog_id UUID NOT NULL REFERENCES training_catalog(id) ON DELETE CASCADE,
    
    -- Assignment details
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by_user_id UUID REFERENCES users(id),
    assignment_reason TEXT, -- 'Onboarding', 'Compliance', 'Skill Development', 'Manager Request'
    
    -- Deadlines
    due_date DATE,
    is_overdue BOOLEAN DEFAULT false,
    days_overdue INTEGER,
    
    -- Completion tracking
    assignment_status VARCHAR(50) DEFAULT 'assigned' CHECK (assignment_status IN ('assigned', 'in_progress', 'completed', 'failed', 'waived', 'expired')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Waiver/Exception
    is_waived BOOLEAN DEFAULT false,
    waiver_reason TEXT,
    waived_by_user_id UUID REFERENCES users(id),
    waived_at TIMESTAMPTZ,
    
    -- Reminders
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMPTZ,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT unique_user_training_assignment UNIQUE (user_id, training_catalog_id, deleted_at)
);

CREATE INDEX IF NOT EXISTS idx_training_assignment_tenant ON user_training_assignment(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_assignment_user ON user_training_assignment(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_assignment_training ON user_training_assignment(training_catalog_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_assignment_status ON user_training_assignment(assignment_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_assignment_due_date ON user_training_assignment(due_date) WHERE assignment_status IN ('assigned', 'in_progress') AND deleted_at IS NULL;

COMMENT ON TABLE user_training_assignment IS 'Training assignments to individual users with completion tracking';
COMMENT ON COLUMN user_training_assignment.is_waived IS 'Training waived (e.g., already certified externally)';

-- =====================================================
-- 3. TRAINING COMPLETION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS training_completion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_training_assignment_id UUID NOT NULL REFERENCES user_training_assignment(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_catalog_id UUID NOT NULL REFERENCES training_catalog(id) ON DELETE CASCADE,
    
    -- Completion details
    completion_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completion_method VARCHAR(50), -- 'online_course', 'in_person_class', 'self_study', 'examination'
    
    -- Assessment results
    assessment_score DECIMAL(5, 2), -- 0.00 to 100.00
    assessment_passed BOOLEAN,
    assessment_attempts INTEGER DEFAULT 1,
    
    -- Certificate
    certificate_number VARCHAR(100),
    certificate_issued_date DATE,
    certificate_expiry_date DATE,
    certificate_url TEXT, -- Link to certificate PDF
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    is_currently_valid BOOLEAN DEFAULT true,
    days_until_expiry INTEGER,
    
    -- Recertification
    requires_recertification BOOLEAN DEFAULT false,
    recertification_due_date DATE,
    recertification_alert_sent BOOLEAN DEFAULT false,
    
    -- Instructor/Verifier
    instructor_name VARCHAR(200),
    verified_by_user_id UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_training_completion_user ON training_completion(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_completion_training ON training_completion(training_catalog_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_completion_expiry ON training_completion(certificate_expiry_date) WHERE is_currently_valid = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_completion_recert ON training_completion(recertification_due_date) WHERE requires_recertification = true AND deleted_at IS NULL;

COMMENT ON TABLE training_completion IS 'Completed training records with certificates and recertification tracking';
COMMENT ON COLUMN training_completion.certificate_expiry_date IS 'When this certification expires (for annual trainings like HIPAA, BLS)';

-- =====================================================
-- 4. CREDENTIAL DOCUMENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS credential_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Document details
    document_type VARCHAR(100) NOT NULL, -- 'Medical License', 'Board Certification', 'DEA License', 'BLS Certificate', 'ACLS Certificate', 'Education Degree'
    document_name VARCHAR(200) NOT NULL,
    document_description TEXT,
    issuing_authority VARCHAR(200), -- 'Medical Council of India', 'American Board of Surgery', 'American Heart Association'
    
    -- Document numbers
    credential_number VARCHAR(100),
    registration_number VARCHAR(100),
    npi_number VARCHAR(50), -- National Provider Identifier
    
    -- Validity
    issue_date DATE,
    expiry_date DATE,
    is_lifetime_valid BOOLEAN DEFAULT false,
    is_currently_valid BOOLEAN DEFAULT true,
    days_until_expiry INTEGER,
    
    -- Verification
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired', 'suspended')),
    verified_by_user_id UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    
    -- Document file
    document_url TEXT NOT NULL, -- Uploaded file URL
    document_file_type VARCHAR(50), -- 'PDF', 'JPEG', 'PNG'
    document_file_size_kb INTEGER,
    
    -- Renewal tracking
    renewal_required BOOLEAN DEFAULT false,
    renewal_due_date DATE,
    renewal_alert_sent BOOLEAN DEFAULT false,
    auto_suspend_on_expiry BOOLEAN DEFAULT false,
    
    -- Linked entities
    related_training_completion_id UUID REFERENCES training_completion(id),
    related_license_id UUID REFERENCES professional_license(id),
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_credential_doc_tenant ON credential_document(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credential_doc_employee ON credential_document(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credential_doc_type ON credential_document(document_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credential_doc_expiry ON credential_document(expiry_date) WHERE is_currently_valid = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credential_doc_verification ON credential_document(verification_status) WHERE deleted_at IS NULL;

COMMENT ON TABLE credential_document IS 'Professional credentials, certifications, and supporting documents';
COMMENT ON COLUMN credential_document.document_type IS 'Medical License, Board Certification, BLS/ACLS, DEA, Education Degree, State License';

-- =====================================================
-- 5. SEED MANDATORY TRAININGS
-- =====================================================

INSERT INTO training_catalog (
    tenant_id, training_code, training_name, training_description, training_category,
    training_type, duration_hours, delivery_method, validity_months, recertification_required,
    applicable_to_roles, passing_score_percentage
)
SELECT 
    t.id,
    code,
    name,
    description,
    category,
    type,
    duration,
    delivery,
    validity,
    recert,
    roles::TEXT[],
    passing_score
FROM tenant t
CROSS JOIN (VALUES
    -- Compliance Trainings (Mandatory)
    ('HIPAA_2026', 'HIPAA Compliance Training 2026', 'Health Insurance Portability and Accountability Act compliance and patient privacy', 'Compliance', 'mandatory', 2.0, 'online', 12, true, ARRAY['all'], 80.00),
    ('FIRE_SAFETY', 'Fire Safety and Evacuation Training', 'Fire safety protocols, evacuation procedures, and emergency response', 'Safety', 'mandatory', 1.0, 'in_person', 12, true, ARRAY['all'], 70.00),
    ('INFECTION_CONTROL', 'Infection Control and Prevention', 'Hand hygiene, PPE usage, infection prevention protocols', 'Clinical Skills', 'mandatory', 1.5, 'hybrid', 12, true, ARRAY['clinical'], 75.00),
    ('WORKPLACE_SAFETY', 'Workplace Safety and OSHA Compliance', 'Occupational safety, hazard communication, injury prevention', 'Safety', 'mandatory', 2.0, 'online', 12, true, ARRAY['all'], 70.00),
    
    -- Clinical Trainings (Role-Specific)
    ('BLS_CERT', 'Basic Life Support (BLS) Certification', 'CPR and basic emergency cardiac care', 'Clinical Skills', 'role_specific', 4.0, 'in_person', 24, true, ARRAY['physician', 'nurse', 'paramedic'], 80.00),
    ('ACLS_CERT', 'Advanced Cardiac Life Support (ACLS)', 'Advanced resuscitation and cardiac emergency management', 'Clinical Skills', 'role_specific', 8.0, 'in_person', 24, true, ARRAY['physician', 'critical_care_nurse'], 85.00),
    ('PALS_CERT', 'Pediatric Advanced Life Support (PALS)', 'Pediatric emergency care and resuscitation', 'Clinical Skills', 'role_specific', 8.0, 'in_person', 24, true, ARRAY['pediatrician', 'pediatric_nurse'], 85.00),
    ('MEDICATION_SAFETY', 'Medication Safety and Administration', 'Safe medication practices, dosage calculations, adverse events', 'Clinical Skills', 'role_specific', 3.0, 'hybrid', 12, true, ARRAY['physician', 'nurse', 'pharmacist'], 80.00),
    
    -- Software Trainings
    ('PORTAL_BASIC', 'Hospital Portal Basic Training', 'Introduction to hospital management system', 'Software', 'mandatory', 2.0, 'online', NULL, false, ARRAY['all'], 70.00),
    ('EMR_DOCUMENTATION', 'Electronic Medical Records Documentation', 'EMR documentation standards, templates, billing codes', 'Software', 'role_specific', 4.0, 'hybrid', NULL, false, ARRAY['physician', 'nurse'], 75.00),
    
    -- Leadership and Development (Optional)
    ('LEADERSHIP_101', 'Leadership Fundamentals', 'Leadership principles, team management, conflict resolution', 'Leadership', 'optional', 6.0, 'in_person', NULL, false, ARRAY['manager', 'supervisor'], 70.00),
    ('EFFECTIVE_COMMUNICATION', 'Effective Communication in Healthcare', 'Patient communication, family counseling, difficult conversations', 'Leadership', 'optional', 3.0, 'online', NULL, false, ARRAY['all'], 70.00),
    
    -- Continuing Medical Education
    ('CME_CARDIOLOGY', 'Cardiology Updates 2026', 'Latest advances in cardiovascular medicine', 'Continuing Education', 'continuing_education', 5.0, 'online', NULL, false, ARRAY['physician', 'cardiologist'], 70.00),
    ('CME_DIABETES', 'Diabetes Management Best Practices', 'Evidence-based diabetes care and management', 'Continuing Education', 'continuing_education', 4.0, 'online', NULL, false, ARRAY['physician', 'endocrinologist'], 70.00)
) AS trainings(code, name, description, category, type, duration, delivery, validity, recert, roles, passing_score)
WHERE t.status = 'active'
ON CONFLICT (training_code) DO NOTHING;

-- =====================================================
-- 6. FUNCTION TO UPDATE DAYS UNTIL EXPIRY
-- =====================================================

CREATE OR REPLACE FUNCTION update_credential_days_until_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date IS NOT NULL THEN
        NEW.days_until_expiry := (NEW.expiry_date - CURRENT_DATE);
        
        -- Mark as invalid if expired
        IF NEW.days_until_expiry < 0 AND NEW.is_currently_valid = true THEN
            NEW.is_currently_valid := false;
            NEW.verification_status := 'expired';
        END IF;
    ELSE
        NEW.days_until_expiry := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_credential_expiry ON credential_document;
CREATE TRIGGER trigger_update_credential_expiry
    BEFORE INSERT OR UPDATE OF expiry_date ON credential_document
    FOR EACH ROW
    EXECUTE FUNCTION update_credential_days_until_expiry();

-- Same function for training_completion
DROP TRIGGER IF EXISTS trigger_update_training_expiry ON training_completion;
CREATE TRIGGER trigger_update_training_expiry
    BEFORE INSERT OR UPDATE OF certificate_expiry_date ON training_completion
    FOR EACH ROW
    EXECUTE FUNCTION update_credential_days_until_expiry();

COMMENT ON FUNCTION update_credential_days_until_expiry() IS 'Auto-calculate days until credential/certificate expiry';

-- =====================================================
-- 7. VIEW FOR EXPIRING CREDENTIALS
-- =====================================================

CREATE OR REPLACE VIEW expiring_credentials_view AS
SELECT 
    cd.id AS credential_id,
    cd.tenant_id,
    cd.employee_id,
    e.employee_number,
    u.first_name || ' ' || u.last_name AS employee_name,
    u.email AS employee_email,
    cd.document_type,
    cd.document_name,
    cd.credential_number,
    cd.issuing_authority,
    cd.issue_date,
    cd.expiry_date,
    cd.days_until_expiry,
    cd.verification_status,
    
    -- Alert urgency
    CASE 
        WHEN cd.days_until_expiry <= 0 THEN 'expired'
        WHEN cd.days_until_expiry <= 7 THEN 'critical'
        WHEN cd.days_until_expiry <= 30 THEN 'urgent'
        WHEN cd.days_until_expiry <= 60 THEN 'warning'
        WHEN cd.days_until_expiry <= 90 THEN 'notice'
        ELSE 'normal'
    END AS urgency_level,
    
    cd.renewal_required,
    cd.renewal_due_date,
    cd.auto_suspend_on_expiry
FROM credential_document cd
INNER JOIN employee e ON cd.employee_id = e.id
INNER JOIN users u ON e.user_id = u.id
WHERE cd.expiry_date IS NOT NULL 
  AND cd.deleted_at IS NULL
  AND cd.status = 'active'
  AND cd.days_until_expiry <= 90;

COMMENT ON VIEW expiring_credentials_view IS 'Credentials expiring in next 90 days with urgency levels';

-- =====================================================
-- 8. VIEW FOR TRAINING COMPLIANCE REPORT
-- =====================================================

CREATE OR REPLACE VIEW training_compliance_report_view AS
SELECT 
    t.tenant_id,
    tc.id AS training_id,
    tc.training_code,
    tc.training_name,
    tc.training_category,
    tc.training_type,
    
    -- Enrollment stats
    COUNT(DISTINCT uta.id) AS total_assignments,
    COUNT(DISTINCT CASE WHEN uta.assignment_status = 'completed' THEN uta.id END) AS completed_count,
    COUNT(DISTINCT CASE WHEN uta.assignment_status IN ('assigned', 'in_progress') THEN uta.id END) AS in_progress_count,
    COUNT(DISTINCT CASE WHEN uta.is_overdue = true THEN uta.id END) AS overdue_count,
    
    -- Compliance percentage
    CASE 
        WHEN COUNT(DISTINCT uta.id) > 0 THEN
            ROUND((COUNT(DISTINCT CASE WHEN uta.assignment_status = 'completed' THEN uta.id END)::DECIMAL / COUNT(DISTINCT uta.id)::DECIMAL * 100), 2)
        ELSE 0
    END AS compliance_percentage
FROM tenant t
CROSS JOIN training_catalog tc
LEFT JOIN user_training_assignment uta ON tc.id = uta.training_catalog_id AND uta.deleted_at IS NULL
WHERE tc.training_type = 'mandatory'
  AND tc.deleted_at IS NULL
  AND tc.is_active = true
GROUP BY t.tenant_id, tc.id, tc.training_code, tc.training_name, tc.training_category, tc.training_type;

COMMENT ON VIEW training_compliance_report_view IS 'Training compliance dashboard showing completion rates by training';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 13: TRAINING & CREDENTIALS';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Created training_catalog table';
    RAISE NOTICE '✓ Created user_training_assignment table';
    RAISE NOTICE '✓ Created training_completion table';
    RAISE NOTICE '✓ Created credential_document table';
    RAISE NOTICE '✓ Seeded 14 mandatory trainings';
    RAISE NOTICE '✓ Created expiry tracking triggers';
    RAISE NOTICE '✓ Created expiring credentials view';
    RAISE NOTICE '✓ Created compliance report view';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ready for: TrainingManagementService';
    RAISE NOTICE '============================================';
END $$;
