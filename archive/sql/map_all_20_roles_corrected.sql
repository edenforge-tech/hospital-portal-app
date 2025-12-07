-- ============================================
-- Complete Role-Permission Mappings
-- All 20 Roles to 237 New Permissions
-- ============================================

-- 1. SYSTEM ADMIN - ALL 237 permissions
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'SYSTEM ADMINISTRATOR'
AND p."Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 
    'system_settings', 'quality_assurance'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 2. HOSPITAL ADMINISTRATOR - Most permissions (223)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'HOSPITAL ADMINISTRATOR'
AND p."Module" IN (
    'patient_management', 'clinical_documentation', 'pharmacy', 
    'lab_diagnostics', 'radiology', 'ot_management', 'appointments', 
    'billing_revenue', 'inventory', 'hrm', 'vendor_procurement', 
    'bed_management', 'ambulance', 'document_sharing', 'quality_assurance'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 3. DOCTOR - Clinical focus (15 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'DOCTOR'
AND p."Code" IN (
    -- Patient Management (3)
    'patient_management.patient_record.read',
    'patient_management.patient_record.update',
    'patient_management.patient_demographics.read',
    
    -- Clinical Documentation (5)
    'clinical_documentation.assessment.create',
    'clinical_documentation.assessment.read',
    'clinical_documentation.assessment.update',
    'clinical_documentation.diagnosis.create',
    'clinical_documentation.diagnosis.read',
    
    -- Clinical Notes (2)
    'clinical_documentation.clinical_notes.create',
    'clinical_documentation.clinical_notes.read',
    
    -- Prescriptions (3)
    'pharmacy.prescription.create',
    'pharmacy.prescription.read',
    'pharmacy.prescription.update',
    
    -- Lab Orders (1)
    'lab_diagnostics.lab_test.create',
    
    -- Radiology Orders (1)
    'radiology.imaging_order.create'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 4. NURSE - Patient care focus (12 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'NURSE'
AND p."Code" IN (
    -- Patient Management (2)
    'patient_management.patient_record.read',
    'patient_management.patient_demographics.read',
    
    -- Clinical Documentation (2)
    'clinical_documentation.assessment.read',
    'clinical_documentation.clinical_notes.read',
    
    -- Prescriptions (2)
    'pharmacy.prescription.read',
    'pharmacy.medication_dispensing.create',
    
    -- Bed Management (3)
    'bed_management.bed_allocation.read',
    'bed_management.bed_allocation.update',
    'bed_management.bed_transfer.create',
    
    -- OT (2)
    'ot_management.post_op_care.create',
    'ot_management.post_op_care.read',
    
    -- Appointments (1)
    'appointments.appointment.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 5. PHARMACIST - Medication focus (10 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'PHARMACIST'
AND p."Code" IN (
    -- Prescriptions (4)
    'pharmacy.prescription.read',
    'pharmacy.prescription.update',
    'pharmacy.medication_dispensing.create',
    'pharmacy.medication_dispensing.read',
    
    -- Drug Inventory (4)
    'pharmacy.drug_inventory.create',
    'pharmacy.drug_inventory.read',
    'pharmacy.drug_inventory.update',
    'pharmacy.drug_interaction.read',
    
    -- Patient (2)
    'patient_management.patient_record.read',
    'patient_management.patient_demographics.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 6. LAB TECHNICIAN - Lab focus (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'LAB TECHNICIAN'
AND p."Code" IN (
    'lab_diagnostics.lab_test.read',
    'lab_diagnostics.lab_result.create',
    'lab_diagnostics.lab_result.read',
    'lab_diagnostics.lab_result.update',
    'lab_diagnostics.sample_collection.create',
    'lab_diagnostics.sample_collection.read',
    'lab_diagnostics.lab_equipment.read',
    'patient_management.patient_record.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 7. RADIOLOGIST - Imaging focus (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'RADIOLOGIST'
AND p."Code" IN (
    'radiology.imaging_order.read',
    'radiology.imaging_result.create',
    'radiology.imaging_result.read',
    'radiology.imaging_result.update',
    'radiology.pacs_access.read',
    'radiology.radiology_report.create',
    'radiology.radiology_report.read',
    'patient_management.patient_record.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 8. FRONT DESK - Reception focus (6 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'FRONT DESK'
AND p."Code" IN (
    'appointments.appointment.create',
    'appointments.appointment.read',
    'appointments.appointment.update',
    'appointments.waitlist.create',
    'appointments.waitlist.read',
    'patient_management.patient_record.create'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 9. BILLING OFFICER - Billing focus (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'BILLING OFFICER'
AND p."Code" IN (
    'billing_revenue.invoice.create',
    'billing_revenue.invoice.read',
    'billing_revenue.invoice.update',
    'billing_revenue.payment.create',
    'billing_revenue.payment.read',
    'billing_revenue.insurance_claim.create',
    'billing_revenue.insurance_claim.read',
    'patient_management.patient_record.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 10. INVENTORY MANAGER - Inventory focus (10 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'INVENTORY MANAGER'
AND p."Code" IN (
    'inventory.stock_item.create',
    'inventory.stock_item.read',
    'inventory.stock_item.update',
    'inventory.stock_transfer.create',
    'inventory.stock_transfer.read',
    'inventory.stock_transfer.approve',
    'inventory.reorder_level.create',
    'inventory.reorder_level.read',
    'inventory.stock_count.create',
    'inventory.stock_count.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 11. HR MANAGER - HR focus (12 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'HR MANAGER'
AND p."Code" IN (
    'hrm.employee.create',
    'hrm.employee.read',
    'hrm.employee.update',
    'hrm.attendance.read',
    'hrm.attendance.approve',
    'hrm.leave.read',
    'hrm.leave.approve',
    'hrm.payroll.create',
    'hrm.payroll.read',
    'hrm.payroll.process',
    'hrm.performance_review.create',
    'hrm.performance_review.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 12. PROCUREMENT OFFICER - Procurement focus (10 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'PROCUREMENT OFFICER'
AND p."Code" IN (
    'vendor_procurement.vendor.create',
    'vendor_procurement.vendor.read',
    'vendor_procurement.vendor.update',
    'vendor_procurement.purchase_order.create',
    'vendor_procurement.purchase_order.read',
    'vendor_procurement.purchase_order.approve',
    'vendor_procurement.goods_receipt.create',
    'vendor_procurement.goods_receipt.read',
    'vendor_procurement.quotation.create',
    'vendor_procurement.quotation.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 13. BED COORDINATOR - Bed management focus (6 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'BED COORDINATOR'
AND p."Code" IN (
    'bed_management.bed.read',
    'bed_management.bed_allocation.create',
    'bed_management.bed_allocation.read',
    'bed_management.bed_transfer.create',
    'bed_management.discharge.create',
    'patient_management.patient_record.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 14. AMBULANCE OPERATOR - Ambulance focus (4 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'AMBULANCE OPERATOR'
AND p."Code" IN (
    'ambulance.ambulance_booking.read',
    'ambulance.ambulance_trip.create',
    'ambulance.ambulance_trip.read',
    'ambulance.ambulance_trip.complete'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 15. IT SUPPORT - System focus (12 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'IT SUPPORT'
AND p."Code" IN (
    'system_settings.configuration.read',
    'system_settings.configuration.update',
    'system_settings.user.create',
    'system_settings.user.read',
    'system_settings.user.update',
    'system_settings.role.read',
    'system_settings.audit_log.read',
    'system_settings.backup.create',
    'system_settings.backup.restore',
    'system_settings.system_health.read',
    'document_sharing.document_type.read',
    'document_sharing.access_rule.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 16. QUALITY AUDITOR - Quality focus (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'QUALITY AUDITOR'
AND p."Code" IN (
    'quality_assurance.incident.create',
    'quality_assurance.incident.read',
    'quality_assurance.incident.update',
    'quality_assurance.audit.create',
    'quality_assurance.audit.read',
    'quality_assurance.audit.complete',
    'quality_assurance.compliance.read',
    'quality_assurance.quality_report.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 17. MEDICAL RECORDS - MRD focus (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'MEDICAL RECORDS'
AND p."Code" IN (
    'patient_management.patient_record.read',
    'patient_management.patient_document.read',
    'patient_management.patient_document.upload',
    'clinical_documentation.assessment.read',
    'clinical_documentation.clinical_notes.read',
    'document_sharing.document_upload.read',
    'document_sharing.document_upload.download',
    'document_sharing.access_audit.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 18. OT MANAGER - Operating theatre focus (8 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'OT MANAGER'
AND p."Code" IN (
    'ot_management.surgery_schedule.create',
    'ot_management.surgery_schedule.read',
    'ot_management.surgery_schedule.update',
    'ot_management.ot_booking.create',
    'ot_management.ot_booking.read',
    'ot_management.surgical_equipment.read',
    'ot_management.post_op_care.read',
    'patient_management.patient_record.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 19. DEPARTMENT HEAD - Department management (20 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'DEPARTMENT HEAD'
AND p."Code" IN (
    -- Patient Management (3)
    'patient_management.patient_record.read',
    'patient_management.patient_demographics.read',
    'patient_management.patient_document.read',
    
    -- Clinical (3)
    'clinical_documentation.assessment.read',
    'clinical_documentation.diagnosis.read',
    'clinical_documentation.clinical_notes.read',
    
    -- Appointments (2)
    'appointments.appointment.read',
    'appointments.slot_availability.read',
    
    -- Billing (2)
    'billing_revenue.invoice.read',
    'billing_revenue.revenue_report.read',
    
    -- HR (3)
    'hrm.employee.read',
    'hrm.attendance.read',
    'hrm.performance_review.read',
    
    -- Inventory (2)
    'inventory.stock_item.read',
    'inventory.reorder_level.read',
    
    -- Quality (2)
    'quality_assurance.incident.read',
    'quality_assurance.audit.read',
    
    -- Document (2)
    'document_sharing.document_upload.read',
    'document_sharing.access_audit.read',
    
    -- Lab (1)
    'lab_diagnostics.lab_result.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- 20. BRANCH MANAGER - Branch management (15 permissions)
INSERT INTO role_permissions (id, "RoleId", "PermissionId", "CreatedAt", status)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    'active'
FROM roles r
CROSS JOIN permissions p
WHERE r."NormalizedName" = 'BRANCH MANAGER'
AND p."Code" IN (
    -- Patient (2)
    'patient_management.patient_record.read',
    'patient_management.patient_demographics.read',
    
    -- Appointments (2)
    'appointments.appointment.read',
    'appointments.slot_availability.read',
    
    -- Billing (2)
    'billing_revenue.invoice.read',
    'billing_revenue.revenue_report.read',
    
    -- HR (3)
    'hrm.employee.read',
    'hrm.attendance.read',
    'hrm.leave.read',
    
    -- Inventory (2)
    'inventory.stock_item.read',
    'inventory.stock_count.read',
    
    -- Bed (2)
    'bed_management.bed.read',
    'bed_management.bed_allocation.read',
    
    -- Ambulance (1)
    'ambulance.ambulance_booking.read',
    
    -- Quality (1)
    'quality_assurance.incident.read'
)
ON CONFLICT ("RoleId", "PermissionId") DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count permissions per role
SELECT 
    r.name as role_name,
    COUNT(rp."PermissionId") as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."RoleId"
WHERE r."NormalizedName" IN (
    'SYSTEM ADMINISTRATOR', 'HOSPITAL ADMINISTRATOR', 'DOCTOR', 'NURSE', 'PHARMACIST',
    'LAB TECHNICIAN', 'RADIOLOGIST', 'FRONT DESK', 'BILLING OFFICER',
    'INVENTORY MANAGER', 'HR MANAGER', 'PROCUREMENT OFFICER', 'BED COORDINATOR',
    'AMBULANCE OPERATOR', 'IT SUPPORT', 'QUALITY AUDITOR', 'MEDICAL RECORDS',
    'OT MANAGER', 'DEPARTMENT HEAD', 'BRANCH MANAGER'
)
GROUP BY r.name, r."NormalizedName"
ORDER BY r."NormalizedName";

-- Total mappings created
SELECT COUNT(*) as total_role_permission_mappings 
FROM role_permissions;
