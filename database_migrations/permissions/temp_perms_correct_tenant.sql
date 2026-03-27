SET app.current_tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';
INSERT INTO permissions (id, "TenantId", "Code", "Name", "Description", "Action", "ResourceType", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsSystemPermission", "IsActive")
VALUES 
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'appointment.view', 'View Appointments', 'Allows viewing appointments', 'View', 'Appointment', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'patient.view', 'View Patients', 'Allows viewing patient information', 'View', 'Patient', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'user.view', 'View Users', 'Allows viewing user/staff information', 'View', 'User', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true),
  (gen_random_uuid(), '155fe198-6ae5-4a01-9254-ead5b427247e', 'department.view', 'View Departments', 'Allows viewing department information', 'View', 'Department', NOW(), NOW(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, true)
ON CONFLICT (id) DO NOTHING;