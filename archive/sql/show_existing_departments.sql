-- Diagnostic Query: Show existing departments with their actual column structure
-- This will help us understand the actual schema
SELECT * FROM department 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
LIMIT 5;
