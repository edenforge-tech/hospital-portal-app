SELECT
    uda.user_id,
    u.user_name,
    d.name as department_name,
    uda.is_primary,
    uda.access_level,
    uda.status
FROM user_department_access uda
JOIN "AspNetUsers" u ON uda.user_id = u.id
JOIN departments d ON uda.department_id = d.id
ORDER BY u.user_name, uda.is_primary DESC, d.name;