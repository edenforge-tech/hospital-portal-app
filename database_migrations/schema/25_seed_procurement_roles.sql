-- Seed PURCHASE MANAGER and STORE KEEPER roles into app_roles
INSERT INTO app_roles (
    id, tenant_id, name, "NormalizedName", "Description",
    "RoleLevel", "Priority", "IsSystemRole", "IsActive",
    "CreatedAt", "UpdatedAt", role_category
)
SELECT
    gen_random_uuid(),
    '155fe198-6ae5-4a01-9254-ead5b427247e',
    r.rname,
    upper(r.rname),
    r.rdesc,
    3,
    3,
    false,
    true,
    now(),
    now(),
    'Procurement'
FROM (VALUES
    ('PURCHASE MANAGER', 'Procurement role for approving POs and RFQs'),
    ('STORE KEEPER',     'Inventory store keeper role'),
    ('INVENTORY MANAGER','Inventory management role'),
    ('INVENTORY STAFF',  'Inventory staff role'),
    ('OPTICAL MANAGER',  'Optical department manager role'),
    ('PHARMACY TECHNICIAN', 'Pharmacy technician role')
) AS r(rname, rdesc)
WHERE NOT EXISTS (
    SELECT 1 FROM app_roles
    WHERE name = r.rname
      AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
);
