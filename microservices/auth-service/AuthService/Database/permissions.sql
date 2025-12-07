-- Initial Roles and Permissions
INSERT INTO permissions (id, tenant_id, code, name, description, module, action, resource_type)
VALUES
-- ... existing permissions

-- Appointment permissions
(uuid_generate_v4(), (SELECT id FROM tenants LIMIT 1), 'APPOINTMENT_VIEW', 'View appointments', 'Can view appointments', 'Appointments', 'View', 'Resource'),
(uuid_generate_v4(), (SELECT id FROM tenants LIMIT 1), 'APPOINTMENT_VIEW_ALL', 'View all appointments', 'Can view all appointments across doctors', 'Appointments', 'View', 'Resource'),
(uuid_generate_v4(), (SELECT id FROM tenants LIMIT 1), 'APPOINTMENT_CREATE', 'Create appointments', 'Can create new appointments', 'Appointments', 'Create', 'Resource'),
(uuid_generate_v4(), (SELECT id FROM tenants LIMIT 1), 'APPOINTMENT_UPDATE', 'Update appointments', 'Can update appointment details', 'Appointments', 'Update', 'Resource'),
(uuid_generate_v4(), (SELECT id FROM tenants LIMIT 1), 'APPOINTMENT_DELETE', 'Delete appointments', 'Can delete appointments', 'Appointments', 'Delete', 'Resource');