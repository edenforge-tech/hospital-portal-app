-- Phase 1: Critical Clinical Departments (OPD, IPD, Emergency, Central OT)
-- tenant_id: Apollo Hospitals - Main (11111111-1111-1111-1111-111111111111)
-- branch_id: Sankara Eye Hospital - T Nagar (46094c88-dd0c-48ed-9674-5dc2c13f28ed)
-- created_by_user_id/updated_by_user_id: System Administrator (fc6b9fc9-2b6d-4166-b844-471d5dc47aa4)
--
-- NOTE: All UUIDs for department IDs are generated. Adjust as needed for parent-child relationships.


INSERT INTO department (
    id, department_code, department_name, department_type, description, status, parent_department_id, department_head_id,
    operating_hours_start, operating_hours_end, days_of_operation, is_24x7, annual_budget, budget_currency, requires_approval, approval_level, auto_approval_threshold, max_concurrent_patients, waiting_room_capacity,
    tenant_id, branch_id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, change_reason
) VALUES
-- OPD (Outpatient Department)
('e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'OPD', 'Outpatient Department', 'Clinical', 'General outpatient services and consultations', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'OPD-REG', 'New Registration Desk', 'Clinical', 'Patient registration and onboarding', 'Active', 'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'OPD-FOLLOWUP', 'Follow-Up/Review Desk', 'Clinical', 'Follow-up and review appointments', 'Active', 'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa4', 'OPD-TRIAGE', 'Triage / Preliminary Assessment', 'Clinical', 'Initial patient assessment and triage', 'Active', 'e1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
-- Add more sub-departments as needed

-- IPD (Inpatient Department)
('e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'IPD', 'Inpatient Department', 'Clinical', 'General inpatient services and admissions', 'Active', NULL, NULL,
    '00:00:00', '23:59:00', 'All', TRUE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'IPD-GEN', 'General Ward', 'Clinical', 'General inpatient ward', 'Active', 'e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '00:00:00', '23:59:00', 'All', TRUE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'IPD-ICU', 'ICU', 'Clinical', 'Intensive Care Unit', 'Active', 'e2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '00:00:00', '23:59:00', 'All', TRUE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
-- Add more sub-departments as needed

-- Emergency Department
('e3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'EMERG', 'Emergency', 'Clinical', '24x7 Emergency services', 'Active', NULL, NULL,
    '00:00:00', '23:59:00', 'All', TRUE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'EMERG-TRIAGE', 'Emergency Triage', 'Clinical', 'Triage for emergency cases', 'Active', 'e3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '00:00:00', '23:59:00', 'All', TRUE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
-- Add more sub-departments as needed

-- Central OT (Operation Theatre)
('e4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'CENTRAL-OT', 'Central Operation Theatre', 'Clinical', 'Main operation theatre complex', 'Active', NULL, NULL,
    '07:00:00', '20:00:00', 'All', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('e4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'CENTRAL-OT-REC', 'OT Recovery', 'Clinical', 'Post-operative recovery area', 'Active', 'e4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '07:00:00', '20:00:00', 'All', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL);

-- Verification query:
-- SELECT department_code, name, parent_department_id FROM department WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed' ORDER BY department_code;