-- Phase 4: Admin Departments
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
-- Admin Department
('b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'ADMIN', 'Administration Department', 'Administrative', 'Administrative and management services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Fri', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'ADMIN-HR', 'Human Resources', 'Administrative', 'HR management and employee services', 'Active', 'b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Fri', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'ADMIN-FINANCE', 'Finance Department', 'Administrative', 'Financial management and accounting', 'Active', 'b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Fri', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa4', 'ADMIN-IT', 'IT Department', 'Administrative', 'Information technology support', 'Active', 'b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Fri', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa5', 'ADMIN-LEGAL', 'Legal Department', 'Administrative', 'Legal and compliance services', 'Active', 'b1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Fri', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL);

-- Verification query:
-- SELECT department_code, department_name, parent_department_id, status FROM department WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed' AND deleted_at IS NULL ORDER BY department_code;