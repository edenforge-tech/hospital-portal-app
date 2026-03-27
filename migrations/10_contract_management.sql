-- =====================================================
-- MIGRATION 10: CONTRACT MANAGEMENT SYSTEM
-- =====================================================
-- Hospital Portal - Employment Contract Lifecycle Management
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 22, 2026
-- Phase: 2 - Advanced Features
-- =====================================================

-- =====================================================
-- 1. EXTEND EMPLOYMENT_CONTRACT TABLE
-- =====================================================

-- Add additional columns to existing employment_contract table
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS renewal_notice_period_days INTEGER DEFAULT 30;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS salary_amount DECIMAL(12, 2);
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS benefits_package JSONB;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS termination_clause TEXT;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS signed_contract_url TEXT;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS contract_template_id UUID;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(50) DEFAULT 'not_applicable' CHECK (renewal_status IN ('not_applicable', 'renewal_pending', 'renewal_initiated', 'renewed', 'not_renewed', 'expired'));
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS renewal_initiated_at TIMESTAMPTZ;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS renewal_initiated_by_user_id UUID REFERENCES users(id);
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS days_until_expiry INTEGER;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS expiry_alert_sent BOOLEAN DEFAULT false;
ALTER TABLE employment_contract ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMPTZ;

-- Add indexes for contract queries
CREATE INDEX IF NOT EXISTS idx_contract_employee ON employment_contract(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_end_date ON employment_contract(end_date) WHERE deleted_at IS NULL AND end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contract_renewal_status ON employment_contract(renewal_status, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_auto_renew ON employment_contract(auto_renew, end_date) WHERE auto_renew = true AND deleted_at IS NULL;

COMMENT ON COLUMN employment_contract.auto_renew IS 'Automatically renew contract on expiry';
COMMENT ON COLUMN employment_contract.renewal_notice_period_days IS 'Days before expiry to send renewal notice (30/60/90)';
COMMENT ON COLUMN employment_contract.benefits_package IS 'JSONB: {health_insurance: true, pta: 50000, bonus: "10%"}';
COMMENT ON COLUMN employment_contract.renewal_status IS 'Contract renewal workflow status';

-- =====================================================
-- 2. CONTRACT TEMPLATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    -- Template details
    template_name VARCHAR(200) NOT NULL,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    employment_type VARCHAR(50) NOT NULL, -- 'Permanent', 'Contract', 'Consultant', 'Intern', 'Part-time'
    description TEXT,
    
    -- Template content
    contract_content TEXT NOT NULL, -- HTML or markdown with merge fields
    merge_fields TEXT[], -- ['{employee_name}', '{salary}', '{start_date}', '{department}']
    
    -- Default values
    default_duration_months INTEGER,
    default_notice_period_days INTEGER DEFAULT 30,
    default_probation_months INTEGER,
    default_benefits JSONB,
    
    -- Template metadata
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_until DATE,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_contract_template_tenant ON contract_template(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_template_code ON contract_template(template_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_contract_template_type ON contract_template(employment_type) WHERE is_active = true;

COMMENT ON TABLE contract_template IS 'Predefined contract templates by employment type with merge fields';
COMMENT ON COLUMN contract_template.merge_fields IS 'Placeholders to replace: {employee_name}, {salary}, {start_date}, {end_date}, {department}, {role}';

-- =====================================================
-- 3. CONTRACT RENEWAL HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_renewal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Original contract
    original_contract_id UUID NOT NULL REFERENCES employment_contract(id) ON DELETE RESTRICT,
    original_start_date DATE NOT NULL,
    original_end_date DATE,
    
    -- Renewed contract
    renewed_contract_id UUID REFERENCES employment_contract(id) ON DELETE SET NULL,
    renewed_start_date DATE,
    renewed_end_date DATE,
    
    -- Renewal workflow
    renewal_initiated_at TIMESTAMPTZ NOT NULL,
    renewal_initiated_by_user_id UUID NOT NULL REFERENCES users(id),
    renewal_decision VARCHAR(50) CHECK (renewal_decision IN ('approved', 'rejected', 'pending', 'withdrawn')),
    renewal_decision_at TIMESTAMPTZ,
    renewal_decision_by_user_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- Terms comparison
    salary_changed BOOLEAN DEFAULT false,
    old_salary DECIMAL(12, 2),
    new_salary DECIMAL(12, 2),
    benefits_changed BOOLEAN DEFAULT false,
    old_benefits JSONB,
    new_benefits JSONB,
    role_changed BOOLEAN DEFAULT false,
    
    -- Notifications
    employee_notified BOOLEAN DEFAULT false,
    employee_notified_at TIMESTAMPTZ,
    hr_notified BOOLEAN DEFAULT false,
    hr_notified_at TIMESTAMPTZ,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_renewal_history_employee ON contract_renewal_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_renewal_history_original ON contract_renewal_history(original_contract_id);
CREATE INDEX IF NOT EXISTS idx_renewal_history_decision ON contract_renewal_history(renewal_decision, renewal_decision_at DESC);

COMMENT ON TABLE contract_renewal_history IS 'Historical record of contract renewals for audit trail';

-- =====================================================
-- 4. CONTRACT ALERT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_alert_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES employment_contract(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('expiry_90_days', 'expiry_60_days', 'expiry_30_days', 'expiry_7_days', 'expired')),
    alert_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    days_until_expiry INTEGER,
    
    -- Recipients
    sent_to_employee BOOLEAN DEFAULT true,
    sent_to_hr BOOLEAN DEFAULT true,
    sent_to_manager BOOLEAN DEFAULT false,
    
    -- Notification channels
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    in_app_notification BOOLEAN DEFAULT false,
    
    -- Standard audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_log_contract ON contract_alert_log(contract_id);
CREATE INDEX IF NOT EXISTS idx_alert_log_type ON contract_alert_log(alert_type, alert_sent_at DESC);

COMMENT ON TABLE contract_alert_log IS 'Log of contract expiry alerts sent (90/60/30/7 days before expiry)';

-- =====================================================
-- 5. SEED CONTRACT TEMPLATES
-- =====================================================

INSERT INTO contract_template (
    tenant_id, template_name, template_code, employment_type, description,
    contract_content, merge_fields, default_duration_months, default_notice_period_days,
    default_probation_months, default_benefits
)
SELECT 
    t.id,
    'Standard Permanent Employment Contract',
    'PERMANENT_STANDARD',
    'Permanent',
    'Full-time permanent employment contract with standard benefits',
    '<h2>EMPLOYMENT CONTRACT</h2>
<p>This Employment Contract is entered into on <strong>{start_date}</strong> between:</p>
<p><strong>EMPLOYER:</strong> {hospital_name}<br>
<strong>EMPLOYEE:</strong> {employee_name}</p>

<h3>1. POSITION AND DUTIES</h3>
<p>The Employee is appointed as <strong>{role}</strong> in the <strong>{department}</strong> department.</p>

<h3>2. COMPENSATION</h3>
<p>The Employee shall receive a gross salary of <strong>{currency} {salary}</strong> per annum, payable monthly.</p>

<h3>3. PROBATION PERIOD</h3>
<p>The Employee shall be on probation for <strong>{probation_months} months</strong> from the date of joining.</p>

<h3>4. BENEFITS</h3>
<p>The Employee is entitled to the following benefits:</p>
<ul>{benefits_list}</ul>

<h3>5. NOTICE PERIOD</h3>
<p>Either party may terminate this contract with <strong>{notice_period_days} days</strong> written notice.</p>

<h3>6. TERMINATION CLAUSE</h3>
<p>{termination_clause}</p>

<p><strong>Employee Signature:</strong> _______________  <strong>Date:</strong> _______________</p>
<p><strong>Employer Signature:</strong> _______________  <strong>Date:</strong> _______________</p>',
    ARRAY['{employee_name}', '{hospital_name}', '{role}', '{department}', '{salary}', '{currency}', '{start_date}', '{probation_months}', '{benefits_list}', '{notice_period_days}', '{termination_clause}']::TEXT[],
    NULL, -- Permanent - no end date
    30,
    3,
    '{"health_insurance": true, "pta": 50000, "leave_days": 24, "bonus": "10%"}'::JSONB
FROM tenant t
WHERE t.status = 'active'
LIMIT 1

UNION ALL

SELECT 
    t.id,
    'Fixed-Term Contract Employee',
    'CONTRACT_FIXED_TERM',
    'Contract',
    'Fixed-term contract with specified end date',
    '<h2>FIXED-TERM EMPLOYMENT CONTRACT</h2>
<p>This Contract is valid from <strong>{start_date}</strong> to <strong>{end_date}</strong>.</p>

<p><strong>EMPLOYER:</strong> {hospital_name}<br>
<strong>EMPLOYEE:</strong> {employee_name}</p>

<h3>1. CONTRACT PERIOD</h3>
<p>This is a fixed-term contract valid for <strong>{contract_duration_months} months</strong>.</p>

<h3>2. POSITION</h3>
<p>Position: <strong>{role}</strong> in <strong>{department}</strong></p>

<h3>3. COMPENSATION</h3>
<p>Salary: <strong>{currency} {salary}</strong> per annum</p>

<h3>4. AUTO-RENEWAL</h3>
<p>This contract <strong>{auto_renew_clause}</strong></p>

<h3>5. TERMINATION</h3>
<p>Early termination requires <strong>{notice_period_days} days</strong> notice.</p>

<p><strong>Signatures:</strong><br>
Employee: _______________  Date: _______________<br>
Employer: _______________  Date: _______________</p>',
    ARRAY['{employee_name}', '{hospital_name}', '{role}', '{department}', '{salary}', '{currency}', '{start_date}', '{end_date}', '{contract_duration_months}', '{notice_period_days}', '{auto_renew_clause}']::TEXT[],
    12, -- 1 year default
    30,
    0, -- No probation for contract employees
    '{"health_insurance": true, "pta": 30000, "leave_days": 15}'::JSONB
FROM tenant t
WHERE t.status = 'active'
LIMIT 1

UNION ALL

SELECT 
    t.id,
    'Consultant Agreement',
    'CONSULTANT_AGREEMENT',
    'Consultant',
    'Professional services consultant agreement',
    '<h2>CONSULTANT SERVICES AGREEMENT</h2>
<p>Agreement Date: <strong>{start_date}</strong></p>

<p><strong>CLIENT:</strong> {hospital_name}<br>
<strong>CONSULTANT:</strong> {employee_name}</p>

<h3>1. SERVICES</h3>
<p>The Consultant shall provide professional services as <strong>{role}</strong>.</p>

<h3>2. ENGAGEMENT PERIOD</h3>
<p>From <strong>{start_date}</strong> to <strong>{end_date}</strong></p>

<h3>3. PROFESSIONAL FEES</h3>
<p>Fee: <strong>{currency} {salary}</strong> (per annum / per assignment)</p>

<h3>4. INDEPENDENT CONTRACTOR</h3>
<p>The Consultant is an independent contractor, not an employee.</p>

<h3>5. CONFIDENTIALITY</h3>
<p>The Consultant shall maintain strict confidentiality of all patient and hospital information.</p>

<p><strong>Signatures:</strong><br>
Consultant: _______________  Date: _______________<br>
Hospital: _______________  Date: _______________</p>',
    ARRAY['{employee_name}', '{hospital_name}', '{role}', '{salary}', '{currency}', '{start_date}', '{end_date}']::TEXT[],
    6, -- 6 months default
    15,
    NULL,
    '{"professional_indemnity": true, "conference_allowance": 25000}'::JSONB
FROM tenant t
WHERE t.status = 'active'
LIMIT 1

UNION ALL

SELECT 
    t.id,
    'Internship Agreement',
    'INTERN_AGREEMENT',
    'Intern',
    'Medical/Nursing internship training agreement',
    '<h2>INTERNSHIP TRAINING AGREEMENT</h2>
<p>This Internship Agreement is for the period <strong>{start_date}</strong> to <strong>{end_date}</strong>.</p>

<p><strong>HOSPITAL:</strong> {hospital_name}<br>
<strong>INTERN:</strong> {employee_name}</p>

<h3>1. TRAINING PROGRAM</h3>
<p>The Intern is enrolled in the <strong>{department}</strong> internship program.</p>

<h3>2. STIPEND</h3>
<p>Monthly Stipend: <strong>{currency} {monthly_stipend}</strong></p>

<h3>3. DURATION</h3>
<p>Internship Duration: <strong>{contract_duration_months} months</strong></p>

<h3>4. SUPERVISION</h3>
<p>The Intern will work under the supervision of qualified medical professionals.</p>

<h3>5. LEARNING OBJECTIVES</h3>
<p>The Intern is expected to complete all required clinical rotations and assessments.</p>

<p><strong>Signatures:</strong><br>
Intern: _______________  Date: _______________<br>
Program Director: _______________  Date: _______________</p>',
    ARRAY['{employee_name}', '{hospital_name}', '{department}', '{monthly_stipend}', '{currency}', '{start_date}', '{end_date}', '{contract_duration_months}']::TEXT[],
    12,
    7,
    NULL,
    '{"stipend": true, "accommodation": false, "meals": true}'::JSONB
FROM tenant t
WHERE t.status = 'active'
LIMIT 1
ON CONFLICT (template_code) DO NOTHING;

-- =====================================================
-- 6. FUNCTION TO CALCULATE DAYS UNTIL EXPIRY
-- =====================================================

CREATE OR REPLACE FUNCTION update_contract_days_until_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date IS NOT NULL THEN
        NEW.days_until_expiry := (NEW.end_date - CURRENT_DATE);
    ELSE
        NEW.days_until_expiry := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contract_days_until_expiry ON employment_contract;
CREATE TRIGGER trigger_update_contract_days_until_expiry
    BEFORE INSERT OR UPDATE OF end_date ON employment_contract
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_days_until_expiry();

COMMENT ON FUNCTION update_contract_days_until_expiry() IS 'Auto-calculate days until contract expiry';

-- =====================================================
-- 7. VIEW FOR EXPIRING CONTRACTS
-- =====================================================

CREATE OR REPLACE VIEW expiring_contracts_view AS
SELECT 
    ec.id AS contract_id,
    ec.tenant_id,
    ec.employee_id,
    e.employee_number,
    u.first_name || ' ' || u.last_name AS employee_name,
    u.email AS employee_email,
    ec.contract_type,
    ec.start_date,
    ec.end_date,
    ec.days_until_expiry,
    ec.auto_renew,
    ec.renewal_notice_period_days,
    ec.renewal_status,
    
    -- Alert urgency
    CASE 
        WHEN ec.days_until_expiry <= 0 THEN 'expired'
        WHEN ec.days_until_expiry <= 7 THEN 'critical'
        WHEN ec.days_until_expiry <= 30 THEN 'urgent'
        WHEN ec.days_until_expiry <= 60 THEN 'warning'
        WHEN ec.days_until_expiry <= 90 THEN 'notice'
        ELSE 'normal'
    END AS urgency_level,
    
    ec.expiry_alert_sent,
    ec.last_alert_sent_at,
    ec.status
FROM employment_contract ec
INNER JOIN employee e ON ec.employee_id = e.id
INNER JOIN users u ON e.user_id = u.id
WHERE ec.end_date IS NOT NULL 
  AND ec.deleted_at IS NULL
  AND ec.status = 'active'
  AND ec.days_until_expiry <= 90;

COMMENT ON VIEW expiring_contracts_view IS 'Contracts expiring in next 90 days with urgency levels';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION 10: CONTRACT MANAGEMENT SYSTEM';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Extended employment_contract table';
    RAISE NOTICE '✓ Created contract_template table';
    RAISE NOTICE '✓ Created contract_renewal_history table';
    RAISE NOTICE '✓ Created contract_alert_log table';
    RAISE NOTICE '✓ Seeded 4 contract templates';
    RAISE NOTICE '✓ Created days_until_expiry trigger';
    RAISE NOTICE '✓ Created expiring_contracts view';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ready for: ContractManagementService';
    RAISE NOTICE '============================================';
END $$;
