

-- NOTE: Replace 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' with your actual tenant_id
-- LABORATORY (LAB)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Laboratory', 'LAB', 'Clinical', NULL, 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Biochemistry', 'LAB-BIOCHEM', 'Clinical', '0f56877a-223b-4619-830d-d45ac9002a2f', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Clinical Pathology', 'LAB-CP', 'Clinical', '0f56877a-223b-4619-830d-d45ac9002a2f', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Microbiology', 'LAB-MICRO', 'Clinical', '0f56877a-223b-4619-830d-d45ac9002a2f', 'active');


-- OPTICAL SHOP (OPTICAL)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Optical Shop', 'OPTICAL', 'Support', NULL, 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Optical Retail', 'OPT-RETAIL', 'Support', '10834022-bcb7-4af0-a4a2-c56375bed055', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Optical Workshop', 'OPT-WORKSHOP', 'Support', '10834022-bcb7-4af0-a4a2-c56375bed055', 'active');


-- PEDIATRIC OPHTHALMOLOGY (PEDO)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric Ophthalmology', 'PEDO', 'Clinical', NULL, 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric ICU', 'PED-ICU', 'Clinical', '6f3d4546-6b8d-4ece-9648-e903af75ab83', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric Post-Op Care', 'PED-POSTOP', 'Clinical', '6f3d4546-6b8d-4ece-9648-e903af75ab83', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Pediatric General Ward', 'PED-WARD', 'Clinical', '6f3d4546-6b8d-4ece-9648-e903af75ab83', 'active');


-- CORNEA SERVICES (CORNEA)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Cornea Services', 'CORNEA', 'Clinical', NULL, 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Cornea Clinic', 'COR-CLINIC', 'Clinical', '782ff22f-2935-4067-b4da-8b225c5877ff', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Corneal Surgery', 'COR-SURGERY', 'Clinical', '782ff22f-2935-4067-b4da-8b225c5877ff', 'active');


-- IMAGING (EYE IMAGING CENTER)
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type, parent_department_id, status
) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Eye Imaging Center', 'IMAGING', 'Support', NULL, 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'B-Scan Ultrasound', 'IMG-BSCAN', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Fundus Photography', 'IMG-FUNDUS', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'OCT Services', 'IMG-OCT', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46094c88-dd0c-48ed-9674-5dc2c13f28ed', 'Perimetry', 'IMG-PERIM', 'Support', '7869f345-e1df-457d-9e7d-57637fc152f7', 'active');

