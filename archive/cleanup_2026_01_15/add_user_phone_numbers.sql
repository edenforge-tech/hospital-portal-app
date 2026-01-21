-- =====================================================
-- ADD PHONE NUMBERS TO EXISTING USERS
-- Updates AspNetUsers table with realistic Indian phone numbers
-- =====================================================

DO $$
DECLARE
    v_user RECORD;
    v_phone_number TEXT;
    v_counter INT := 0;
BEGIN
    RAISE NOTICE '=== Adding Phone Numbers to Users ===';
    
    FOR v_user IN 
        SELECT id, user_name, email 
        FROM users 
        WHERE phone_number IS NULL OR phone_number = ''
        ORDER BY email
    LOOP
        v_counter := v_counter + 1;
        
        -- Generate realistic Indian phone numbers (10 digits starting with 7-9)
        v_phone_number := '+91' || (7 + (v_counter % 3))::TEXT || 
                         LPAD((FLOOR(RANDOM() * 900000000) + 100000000)::TEXT, 9, '0');
        
        UPDATE users
        SET phone_number = v_phone_number,
            phone_number_confirmed = TRUE
        WHERE id = v_user.id;
        
        RAISE NOTICE 'Updated user % (%) with phone %', 
            v_user.email, v_user.user_name, v_phone_number;
    END LOOP;
    
    RAISE NOTICE '=== Updated % users with phone numbers ===', v_counter;
END $$;

-- Verify the update
SELECT 
    email,
    user_name,
    phone_number,
    phone_number_confirmed
FROM users
WHERE phone_number IS NOT NULL
ORDER BY email
LIMIT 20;
