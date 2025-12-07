-- NOTE: Replace 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' with your actual tenant_id
-- All columns required by department table are included. Adjust values as needed.

-- LABORATORY (LAB)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id,
    working_hours_start, working_hours_end, requires_approval_workflow, annual_budget, currency, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Laboratory', 'LAB', 'Clinical', NULL, '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Biochemistry', 'LAB-BIOCHEM', 'Clinical', '0f56877a-223b-4619-830d-d45ac9002a2f', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Clinical Pathology', 'LAB-CP', 'Clinical', '0f56877a-223b-4619-830d-d45ac9002a2f', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Microbiology', 'LAB-MICRO', 'Clinical', '0f56877a-223b-4619-830d-d45ac9002a2f', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active');

-- OPTICAL SHOP (OPTICAL)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id,
    working_hours_start, working_hours_end, requires_approval_workflow, annual_budget, currency, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Optical Shop', 'OPTICAL', 'Support', NULL, '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Optical Retail', 'OPT-RETAIL', 'Support', '10834022-bcb7-4af0-a4a2-c56375bed055', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Optical Workshop', 'OPT-WORKSHOP', 'Support', '10834022-bcb7-4af0-a4a2-c56375bed055', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active');

-- PEDIATRIC OPHTHALMOLOGY (PEDO)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id,
    working_hours_start, working_hours_end, requires_approval_workflow, annual_budget, currency, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric Ophthalmology', 'PEDO', 'Clinical', NULL, '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric ICU', 'PED-ICU', 'Clinical', '6f3d4546-6b8d-4ece-9648-e903af75ab83', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric Post-Op Care', 'PED-POSTOP', 'Clinical', '6f3d4546-6b8d-4ece-9648-e903af75ab83', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric General Ward', 'PED-WARD', 'Clinical', '6f3d4546-6b8d-4ece-9648-e903af75ab83', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active');

-- CORNEA SERVICES (CORNEA)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id,
    working_hours_start, working_hours_end, requires_approval_workflow, annual_budget, currency, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Cornea Services', 'CORNEA', 'Clinical', NULL, '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Cornea Clinic', 'COR-CLINIC', 'Clinical', '782ff22f-2935-4067-b4da-8b225c5877ff', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Corneal Surgery', 'COR-SURGERY', 'Clinical', '782ff22f-2935-4067-b4da-8b225c5877ff', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active');

-- IMAGING (EYE IMAGING CENTER)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id,
    working_hours_start, working_hours_end, requires_approval_workflow, annual_budget, currency, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Eye Imaging Center', 'IMAGING', 'Support', NULL, '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'B-Scan Ultrasound', 'IMG-BSCAN', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Fundus Photography', 'IMG-FUNDUS', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'OCT Services', 'IMG-OCT', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Perimetry', 'IMG-PERIM', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', '09:00', '18:00', FALSE, 100000.00, 'INR', 'Active');
