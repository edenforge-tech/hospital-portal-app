-- Create sample users for multi-department access demonstration
-- In a real system, users would be created through ASP.NET Identity registration

-- Insert sample users into AspNetUsers table
INSERT INTO "AspNetUsers" (
    id, user_name, "NormalizedUserName", Email, "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
    "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled"
) VALUES
-- Doctor user
(gen_random_uuid(), 'doctor@example.com', 'DOCTOR@EXAMPLE.COM', 'doctor@example.com', 'DOCTOR@EXAMPLE.COM',
 true, 'AQAAAAEAACcQAAAAEJGjLkT2QH8Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q==', 'security_stamp_1', 'concurrency_stamp_1',
 '+1234567890', true, false, false),
-- Nurse user
(gen_random_uuid(), 'nurse@example.com', 'NURSE@EXAMPLE.COM', 'nurse@example.com', 'NURSE@EXAMPLE.COM',
 true, 'AQAAAAEAACcQAAAAEJGjLkT2QH8Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q==', 'security_stamp_2', 'concurrency_stamp_2',
 '+1234567891', true, false, false),
-- Pharmacist user
(gen_random_uuid(), 'pharmacist@example.com', 'PHARMACIST@EXAMPLE.COM', 'pharmacist@example.com', 'PHARMACIST@EXAMPLE.COM',
 true, 'AQAAAAEAACcQAAAAEJGjLkT2QH8Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q==', 'security_stamp_3', 'concurrency_stamp_3',
 '+1234567892', true, false, false),
-- Admin user
(gen_random_uuid(), 'admin@example.com', 'ADMIN@EXAMPLE.COM', 'admin@example.com', 'ADMIN@EXAMPLE.COM',
 true, 'AQAAAAEAACcQAAAAEJGjLkT2QH8Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q2VzGv5Q==', 'security_stamp_4', 'concurrency_stamp_4',
 '+1234567893', true, false, false)
ON CONFLICT (id) DO NOTHING;