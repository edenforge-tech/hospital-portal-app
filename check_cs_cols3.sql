-- Get ALL counseling_sessions columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'counseling_sessions' ORDER BY ordinal_position;
