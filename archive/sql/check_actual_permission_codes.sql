-- Get all appointment permission codes
SELECT "Code", "Name", "Action"
FROM permissions
WHERE "Module" = 'appointments'
ORDER BY "Code";

-- Get all patient_management permission codes
SELECT "Code", "Name", "Action"
FROM permissions
WHERE "Module" = 'patient_management'
ORDER BY "Code";

-- Get all document_sharing permission codes (for Medical Records Officer)
SELECT "Code", "Name", "Action"
FROM permissions
WHERE "Module" = 'document_sharing'
ORDER BY "Code";
