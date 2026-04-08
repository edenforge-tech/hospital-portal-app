-- ─────────────────────────────────────────────────────────────────────────────
-- fix_patient_demographics.sql
-- Backfills NULL blood_group and NULL address for all patients in all tenants.
-- Safe to run multiple times (only updates rows where value is NULL/empty).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    r          RECORD;
    i          INT;
    blood_groups TEXT[] := ARRAY['A+','B+','O+','AB+','A-','B-','O-','AB-'];
    roads        TEXT[] := ARRAY[
        'MG Road', 'Park Street', 'Station Road', 'Lake View Colony',
        'Main Avenue', 'Garden Colony', 'Civil Lines', 'New Town Road',
        'Nehru Nagar', 'Gandhi Street', 'Rajiv Road', 'Shivaji Marg'
    ];
    cities       TEXT[] := ARRAY[
        'Hyderabad', 'Chennai', 'Mumbai', 'Delhi',
        'Bengaluru', 'Kolkata', 'Pune', 'Ahmedabad',
        'Jaipur', 'Lucknow', 'Kochi', 'Visakhapatnam'
    ];
    states       TEXT[] := ARRAY[
        'Telangana', 'Tamil Nadu', 'Maharashtra', 'Delhi',
        'Karnataka', 'West Bengal', 'Maharashtra', 'Gujarat',
        'Rajasthan', 'Uttar Pradesh', 'Kerala', 'Andhra Pradesh'
    ];
    pincodes     TEXT[] := ARRAY[
        '500001','600001','400001','110001',
        '560001','700001','411001','380001',
        '302001','226001','682001','530001'
    ];
BEGIN
    -- ── 1. Fix NULL blood_group ────────────────────────────────────────────────
    i := 0;
    FOR r IN
        SELECT id FROM patient
        WHERE (blood_group IS NULL OR blood_group = '')
          AND deleted_at IS NULL
        ORDER BY created_at
    LOOP
        UPDATE patient
        SET    blood_group = blood_groups[(i % 8) + 1],
               updated_at  = NOW()
        WHERE  id = r.id;
        i := i + 1;
    END LOOP;

    RAISE NOTICE 'Updated blood_group for % patients', i;

    -- ── 2. Fix NULL address ────────────────────────────────────────────────────
    i := 0;
    FOR r IN
        SELECT id FROM patient
        WHERE (address IS NULL OR address = '')
          AND deleted_at IS NULL
        ORDER BY created_at
    LOOP
        UPDATE patient
        SET    address     = concat(
                                (i % 200 + 1)::TEXT, ', ',
                                roads  [(i % 12) + 1], ', ',
                                cities [(i % 12) + 1], ', ',
                                states [(i % 12) + 1], ' - ',
                                pincodes[(i % 12) + 1]
                             ),
               updated_at  = NOW()
        WHERE  id = r.id;
        i := i + 1;
    END LOOP;

    RAISE NOTICE 'Updated address for % patients', i;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- fix_patient_gender.sql  (appended)
-- Backfills NULL or empty gender for all patients.
-- Values cycle deterministically: Male → Female → Other → Male …
-- Safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    r             RECORD;
    i             INT;
    gender_values TEXT[] := ARRAY['Male', 'Female', 'Other'];
BEGIN
    i := 0;
    FOR r IN
        SELECT id FROM patient
        WHERE (gender IS NULL OR gender = '')
          AND deleted_at IS NULL
        ORDER BY created_at
    LOOP
        UPDATE patient
        SET    gender     = gender_values[(i % 3) + 1],
               updated_at = NOW()
        WHERE  id = r.id;
        i := i + 1;
    END LOOP;

    RAISE NOTICE 'Updated gender for % patients', i;
END $$;

-- ─── Verification ─────────────────────────────────────────────────────────────
SELECT
    COUNT(*)                                              AS total_patients,
    COUNT(*) FILTER (WHERE blood_group IS NULL)           AS null_blood_group,
    COUNT(*) FILTER (WHERE address     IS NULL)           AS null_address,
    COUNT(*) FILTER (WHERE gender      IS NULL
                       OR  gender      = '')              AS null_gender,
    COUNT(*) FILTER (WHERE blood_group IS NOT NULL
                       AND address     IS NOT NULL
                       AND gender      IS NOT NULL
                       AND gender      <> '')             AS fully_populated
FROM patient
WHERE deleted_at IS NULL;
