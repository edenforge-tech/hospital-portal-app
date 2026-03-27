-- Get patients by known IDs
SELECT id, first_name, last_name, phone_number, gender, date_of_birth, tenant_id, branch_id, mrn
FROM patient
WHERE deleted_at IS NULL
AND id IN (
    '4c232137-5d42-4eb9-8d00-efb8be561131',
    '04880bfc-e79c-4dfa-9485-e613f1ce73a7',
    '3f7d04fd-7afa-4d92-aecb-d51a646cb3e4',
    'd539f3b5-0f49-465a-b291-78056e6df365',
    'e562b1cf-541d-44af-baed-9990646cbe2c',
    '2bd91bd3-a278-493d-a5f1-2972b7a1c6c3',
    '47dfc88c-4b88-4706-bbd1-e4928c200634',
    'a08ab02c-0a8d-4e08-a6e1-5addf346a2d0'
);

-- Get surgeon details for known surgeon IDs
SELECT id, first_name, last_name, phone_number, tenant_id, branch_id
FROM users
WHERE deleted_at IS NULL
AND id IN (
    '6937802a-a536-46c1-8825-125e71b01e44',
    '251ff397-c62a-4469-af48-b118b75058f9',
    '2fdd4b1d-5d67-47d5-a9cb-0d1651471d81'
)
LIMIT 5;

-- Check patient columns that are available
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='patient' AND table_schema='public' ORDER BY ordinal_position;

-- Check users columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND table_schema='public' ORDER BY ordinal_position LIMIT 20;

-- Check counseling_sessions columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='counseling_sessions' AND table_schema='public' ORDER BY ordinal_position;
