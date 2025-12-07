-- Phase 2: Diagnostics Departments (Labs, Imaging, Optical, Pediatric, etc.)
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
-- Imaging Department
('f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'IMG', 'Imaging Department', 'Diagnostics', 'All imaging and diagnostic services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'IMG-BSCAN', 'B-Scan Ultrasound', 'Diagnostics', 'B-Scan ultrasound services', 'Active', 'f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'IMG-FUNDUS', 'Fundus Photography', 'Diagnostics', 'Fundus photography services', 'Active', 'f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa4', 'IMG-OCT', 'OCT Services', 'Diagnostics', 'Optical Coherence Tomography', 'Active', 'f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa5', 'IMG-PERIM', 'Perimetry', 'Diagnostics', 'Visual field testing', 'Active', 'f1a1c1a1-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Labs Department
('f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'LAB', 'Laboratory Department', 'Diagnostics', 'All laboratory services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'LAB-BIOCHEM', 'Biochemistry', 'Diagnostics', 'Biochemical testing', 'Active', 'f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'LAB-CP', 'Clinical Pathology', 'Diagnostics', 'Clinical pathology services', 'Active', 'f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa4', 'LAB-MICRO', 'Microbiology', 'Diagnostics', 'Microbiological testing', 'Active', 'f2a2c2a2-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Optical Department
('f3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'OPT', 'Optical Department', 'Diagnostics', 'Optical services and retail', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'OPT-RETAIL', 'Optical Retail', 'Diagnostics', 'Optical retail services', 'Active', 'f3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'OPT-WORKSHOP', 'Optical Workshop', 'Diagnostics', 'Optical manufacturing and repair', 'Active', 'f3a3c3a3-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Pediatric Department
('f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'PED', 'Pediatric Department', 'Diagnostics', 'Pediatric services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'PED-ICU', 'Pediatric ICU', 'Diagnostics', 'Pediatric intensive care', 'Active', 'f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '00:00:00', '23:59:00', 'All', TRUE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'PED-POSTOP', 'Pediatric Post-Op Care', 'Diagnostics', 'Post-operative pediatric care', 'Active', 'f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa4', 'PED-WARD', 'Pediatric General Ward', 'Diagnostics', 'General pediatric ward', 'Active', 'f4a4c4a4-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Cataract Department
('f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'CAT', 'Cataract Department', 'Diagnostics', 'Cataract surgery and related services', 'Active', NULL, NULL,
    '07:00:00', '20:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'CAT-OT', 'Cataract OT Main', 'Diagnostics', 'Main cataract operation theatre', 'Active', 'f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '07:00:00', '20:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'CAT-PREP', 'Pre-Op Preparation', 'Diagnostics', 'Pre-operative preparation for cataract surgery', 'Active', 'f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa4', 'CAT-RECOVERY', 'Post-Op Recovery', 'Diagnostics', 'Post-operative recovery for cataract patients', 'Active', 'f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa5', 'CAT-STERIL', 'Sterilization Unit', 'Diagnostics', 'Sterilization services for cataract procedures', 'Active', 'f5a5c5a5-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Cornea Department
('f6a6c6a6-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'COR', 'Cornea Department', 'Diagnostics', 'Cornea-related services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f6a6c6a6-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'COR-CLINIC', 'Cornea Clinic', 'Diagnostics', 'Cornea clinic services', 'Active', 'f6a6c6a6-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f6a6c6a6-aaaa-4aaa-aaaa-aaaaaaaaaaa3', 'COR-SURGERY', 'Corneal Surgery', 'Diagnostics', 'Corneal surgery services', 'Active', 'f6a6c6a6-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '07:00:00', '20:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Glaucoma Department
('f7a7c7a7-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'GLAU', 'Glaucoma Department', 'Diagnostics', 'Glaucoma-related services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f7a7c7a7-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'GLAU-LASER', 'Glaucoma Laser Unit', 'Diagnostics', 'Laser treatment for glaucoma', 'Active', 'f7a7c7a7-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),

-- Retina Department
('f8a8c8a8-aaaa-4aaa-aaaa-aaaaaaaaaaa1', 'RET', 'Retina Department', 'Diagnostics', 'Retina-related services', 'Active', NULL, NULL,
    '08:00:00', '18:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL),
('f8a8c8a8-aaaa-4aaa-aaaa-aaaaaaaaaaa2', 'RET-VIT-OT', 'Retina Surgery OT', 'Diagnostics', 'Retina surgery operation theatre', 'Active', 'f8a8c8a8-aaaa-4aaa-aaaa-aaaaaaaaaaa1', NULL,
    '07:00:00', '20:00:00', 'Mon-Sat', FALSE, NULL, NULL, TRUE, NULL, NULL, NULL, NULL,
    '11111111-1111-1111-1111-111111111111', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', now(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4', NULL, NULL, NULL);

-- Verification query:
-- SELECT department_code, department_name, parent_department_id, status FROM department WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND branch_id = '46094c88-dd0c-48ed-9674-5dc2c13f28ed' AND deleted_at IS NULL ORDER BY department_code;