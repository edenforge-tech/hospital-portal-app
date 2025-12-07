-- Debug: Check why Front Desk Officer and Medical Records Officer have fewer mappings than expected

-- Check if the specific permission codes exist
SELECT "Code", "Name", "Module"
FROM permissions
WHERE "Code" IN (
    'patient_management.patient_record.read',
    'patient_management.patient_record.create',
    'appointments.appointment_schedule.read',
    'appointments.appointment_schedule.create',
    'appointments.appointment_schedule.update',
    'appointments.appointment_schedule.cancel'
)
ORDER BY "Code";

-- Count how many exist
SELECT COUNT(*) as found_permission_codes
FROM permissions
WHERE "Code" IN (
    'patient_management.patient_record.read',
    'patient_management.patient_record.create',
    'appointments.appointment_schedule.read',
    'appointments.appointment_schedule.create',
    'appointments.appointment_schedule.update',
    'appointments.appointment_schedule.cancel'
);

-- Check what permissions actually exist in patient_management and appointments modules
SELECT "Module", COUNT(*) as permission_count
FROM permissions
WHERE "Module" IN ('patient_management', 'appointments')
GROUP BY "Module";
