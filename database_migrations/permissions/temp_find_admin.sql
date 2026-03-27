SELECT "RoleCode", "Description", "RoleType"  
FROM app_roles 
WHERE "RoleCode" ILIKE '%admin%' 
   OR "RoleCode" ILIKE '%manager%' 
   OR "RoleCode" ILIKE '%director%'
   OR "IsSystemRole" = true
ORDER BY "RoleCode";
