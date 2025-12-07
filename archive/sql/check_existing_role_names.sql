-- Check what role names and normalized names actually exist
SELECT 
    name,
    "NormalizedName",
    "IsSystemRole"
FROM roles 
WHERE "IsSystemRole" = true 
ORDER BY name 
LIMIT 30;

-- Also check a few specific ones we're trying to map
SELECT 
    name,
    "NormalizedName"
FROM roles 
WHERE "NormalizedName" IN (
    'SYSTEM ADMIN',
    'HOSPITAL ADMINISTRATOR', 
    'DOCTOR',
    'NURSE',
    'PHARMACIST'
)
ORDER BY "NormalizedName";
