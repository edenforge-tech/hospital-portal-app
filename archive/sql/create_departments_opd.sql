-- Department and Sub-Department Insert Script for branch_id: 46094c88-dd0c-48ed-9674-5dc2c13f28ed
-- Uses test UUIDs for tenant and user audit columns. Replace as needed.

INSERT INTO department (
    id, code, name, parent_department_id, branch_id, tenant_id,
    created_at, updated_at, created_by_user_id, updated_by_user_id, deleted_at, status
) VALUES
-- OPD root
('b1111111-1111-1111-1111-111111111111', 'OPD', 'Outpatient Department', NULL, '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'active'),
-- OPD sub-departments
('b1111111-1111-1111-1111-111111111113', 'OPD-FOLLOWUP', 'Follow-Up/Review Desk', 'b1111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'active'),
('b1111111-1111-1111-1111-111111111112', 'OPD-REG', 'New Registration Desk', 'b1111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'active'),
('b1111111-1111-1111-1111-111111111114', 'OPD-TRIAGE', 'Triage / Preliminary Assessment', 'b1111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'active');

-- Add more department/sub-department inserts below as needed, following the same pattern.
-- Replace tenant_id and user_id with real values for production use.
