-- Check all OT-related permissions
SELECT id, "Name", "Code" FROM permissions WHERE "Name" ILIKE '%ot%' OR "Code" ILIKE '%ot%' ORDER BY "Name";

-- Also check permission column name variant
SELECT id, "Name" FROM permissions LIMIT 5;
