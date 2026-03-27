-- Fix the appointment conflicts view with correct column names
CREATE OR REPLACE VIEW vw_appointment_conflicts_detailed AS
SELECT 
    ac.*,
    a.appointment_date,
    a.start_time,
    a.patient_id,
    p."FirstName" || ' ' || p."LastName" AS patient_name,
    a.doctor_id,
    d."FirstName" || ' ' || d."LastName" AS doctor_name,
    ca.appointment_date AS conflicting_appointment_date,
    ca.start_time AS conflicting_start_time
FROM appointment_conflicts ac
LEFT JOIN appointment a ON ac.appointment_id = a.id
LEFT JOIN users p ON a.patient_id = p.id
LEFT JOIN users d ON a.doctor_id = d.id
LEFT JOIN appointment ca ON ac.conflicting_appointment_id = ca.id
WHERE ac.resolved_at IS NULL;

-- Grant permissions
GRANT SELECT ON vw_appointment_conflicts_detailed TO rls_admin;
