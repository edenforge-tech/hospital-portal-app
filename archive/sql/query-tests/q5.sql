-- Check ot_schedules columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='ot_schedules' AND table_schema='public' ORDER BY ordinal_position;

-- Check ot_booking_validations columns  
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='ot_booking_validations' AND table_schema='public' ORDER BY ordinal_position;

-- Check patient_consents columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='patient_consents' AND table_schema='public' ORDER BY ordinal_position;

-- Check post_op_care_schedule columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='post_op_care_schedule' AND table_schema='public' ORDER BY ordinal_position;

-- Check post_op_visit columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='post_op_visit' AND table_schema='public' ORDER BY ordinal_position;

-- Check post_op_medication columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='post_op_medication' AND table_schema='public' ORDER BY ordinal_position;
