-- Fix activation status for aluriswamidass@gmail.com
UPDATE users 
SET activation_status = 'active', 
    "UserStatus" = 'active' 
WHERE email = 'aluriswamidass@gmail.com';

SELECT email, activation_status, "UserStatus" 
FROM users 
WHERE email = 'aluriswamidass@gmail.com';
