-- Create sample users for multi-department access demonstration
-- These users will be used to demonstrate the multi-department functionality

INSERT INTO "AspNetUsers" (
    id, user_name, "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
    "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount"
) VALUES
-- Doctor user
(
    '11111111-1111-1111-1111-111111111111'::uuid,
    'dr.smith',
    'DR.SMITH',
    'dr.smith@hospitalportal.com',
    'DR.SMITH@HOSPITALPORTAL.COM',
    true,
    'dummy_hash',
    'dummy_stamp',
    'dummy_concurrency',
    '+1234567890',
    false,
    false,
    false,
    0
),
-- Nurse user
(
    '22222222-2222-2222-2222-222222222222'::uuid,
    'nurse.jones',
    'NURSE.JONES',
    'nurse.jones@hospitalportal.com',
    'NURSE.JONES@HOSPITALPORTAL.COM',
    true,
    'dummy_hash',
    'dummy_stamp',
    'dummy_concurrency',
    '+1234567891',
    false,
    false,
    false,
    0
),
-- Pharmacist user
(
    '33333333-3333-3333-3333-333333333333'::uuid,
    'pharm.brown',
    'PHARM.BROWN',
    'pharm.brown@hospitalportal.com',
    'PHARM.BROWN@HOSPITALPORTAL.COM',
    true,
    'dummy_hash',
    'dummy_stamp',
    'dummy_concurrency',
    '+1234567892',
    false,
    false,
    false,
    0
),
-- Admin user
(
    '44444444-4444-4444-4444-444444444444'::uuid,
    'admin.wilson',
    'ADMIN.WILSON',
    'admin.wilson@hospitalportal.com',
    'ADMIN.WILSON@HOSPITALPORTAL.COM',
    true,
    'dummy_hash',
    'dummy_stamp',
    'dummy_concurrency',
    '+1234567893',
    false,
    false,
    false,
    0
) ON CONFLICT (id) DO NOTHING;