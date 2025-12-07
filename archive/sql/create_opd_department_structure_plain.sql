-- =============================================
-- CREATE OUTPATIENT (OPD) DEPARTMENT STRUCTURE (PLAIN SQL)
-- Phase 1, Day 1: Critical Clinical Departments
-- Generated: November 11, 2025
-- =============================================
-- Inserts parent OPD department and 3 sub-departments

-- Set these values as needed for your environment:
-- Replace with actual tenant, branch, and user IDs if different

-- Parent OPD Department
INSERT INTO department (
    id, tenant_id, branch_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    operating_hours_start, operating_hours_end, is_24x7, requires_approval,
    created_at, created_by, updated_at, updated_by
) VALUES (
    'b1111111-1111-1111-1111-111111111111', -- OPD parent id
    '11111111-1111-1111-1111-111111111111', -- tenant_id
    (SELECT id FROM branch WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL LIMIT 1),
    'OPD',
    'Outpatient Department',
    'Clinical',
    'General outpatient services and consultations',
    'Active',
    NULL,
    '08:00:00',
    '18:00:00',
    TRUE,
    FALSE,
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);

-- Sub-departments for OPD
INSERT INTO department (
    id, tenant_id, branch_id, department_code, department_name, department_type,
    description, status, parent_department_id,
    operating_hours_start, operating_hours_end, is_24x7, requires_approval,
    created_at, created_by, updated_at, updated_by
) VALUES
    ('b1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', (SELECT id FROM branch WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL LIMIT 1), 'OPD-REG', 'New Registration Desk', 'Clinical', 'Patient registration and onboarding', 'Active', 'b1111111-1111-1111-1111-111111111111', '08:00:00', '18:00:00', TRUE, FALSE, NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'),
    ('b1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', (SELECT id FROM branch WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL LIMIT 1), 'OPD-FOLLOWUP', 'Follow-Up/Review Desk', 'Clinical', 'Follow-up and review appointments', 'Active', 'b1111111-1111-1111-1111-111111111111', '08:00:00', '18:00:00', TRUE, FALSE, NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'),
    ('b1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', (SELECT id FROM branch WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL LIMIT 1), 'OPD-TRIAGE', 'Triage / Preliminary Assessment', 'Clinical', 'Initial patient assessment and triage', 'Active', 'b1111111-1111-1111-1111-111111111111', '08:00:00', '18:00:00', TRUE, FALSE, NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4');
