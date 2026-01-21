-- Get all modules
SELECT DISTINCT "Module" FROM permissions ORDER BY "Module";

-- Get main departments
SELECT name FROM department WHERE parent_department_id IS NULL ORDER BY name;
