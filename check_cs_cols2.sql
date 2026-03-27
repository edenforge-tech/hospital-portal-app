-- Get counseling_sessions columns  
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'counseling_sessions' ORDER BY ordinal_position;

-- Get Rajesh Kumar's counseling session data
SELECT ofs.id as ot_id, ofs.counselling_session_id,
       ofs.status as ot_status
FROM ot_finalize_schedule ofs
WHERE ofs.patient_name ILIKE '%Rajesh%Kumar%' LIMIT 3;
