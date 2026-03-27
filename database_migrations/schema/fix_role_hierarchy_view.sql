-- Fix role hierarchy view
CREATE OR REPLACE VIEW v_role_hierarchy AS
WITH RECURSIVE role_tree AS (
    -- Base case: root roles
    SELECT 
        id,
        name,
        parent_role_id,
        hierarchy_level,
        ARRAY[name::text] AS path,
        name AS root_role
    FROM app_roles
    WHERE parent_role_id IS NULL 
        AND "DeletedAt" IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        r.id,
        r.name,
        r.parent_role_id,
        r.hierarchy_level,
        rt.path || r.name::text,
        rt.root_role
    FROM app_roles r
    INNER JOIN role_tree rt ON r.parent_role_id = rt.id
    WHERE r."DeletedAt" IS NULL
)
SELECT 
    id,
    name,
    parent_role_id,
    hierarchy_level,
    path,
    root_role,
    array_to_string(path, ' → ') AS full_path
FROM role_tree
ORDER BY path;
