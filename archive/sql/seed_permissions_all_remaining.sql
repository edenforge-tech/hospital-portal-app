-- ============================================
-- Seed Script: ALL REMAINING MODULE PERMISSIONS (154 permissions)
-- Modules: radiology, ot_management, appointments, billing_revenue, 
--          inventory, hrm, vendor_procurement, bed_management, ambulance,
--          document_sharing, system_settings, quality_assurance
-- Created: November 10, 2025
-- ============================================

-- ============================================
-- RADIOLOGY (12 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'radiology.imaging_order.create', 'Create Imaging Order', 'radiology', 'create', 'imaging_order', 'department', 'Order radiology imaging studies', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_order.read', 'Read Imaging Order', 'radiology', 'read', 'imaging_order', 'branch', 'View imaging orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_order.update', 'Update Imaging Order', 'radiology', 'update', 'imaging_order', 'department', 'Modify imaging orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_order.delete', 'Delete Imaging Order', 'radiology', 'delete', 'imaging_order', 'tenant', 'Cancel imaging orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_result.create', 'Create Imaging Result', 'radiology', 'create', 'imaging_result', 'department', 'Upload radiology results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_result.read', 'Read Imaging Result', 'radiology', 'read', 'imaging_result', 'branch', 'View imaging results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_result.update', 'Update Imaging Result', 'radiology', 'update', 'imaging_result', 'own', 'Modify imaging results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_result.delete', 'Delete Imaging Result', 'radiology', 'delete', 'imaging_result', 'tenant', 'Remove imaging results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.pacs_access.read', 'Access PACS System', 'radiology', 'read', 'pacs_system', 'branch', 'Access medical imaging PACS', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_equipment.read', 'Read Imaging Equipment', 'radiology', 'read', 'imaging_equipment', 'branch', 'View imaging equipment', true, true, NOW()),
 NOW()),
(gen_random_uuid(), 'radiology.imaging_equipment.update', 'Update Imaging Equipment', 'radiology', 'update', 'imaging_equipment', 'branch', 'Manage imaging equipment', true, true, NOW(), NOW()),
(gen_random_uuid(), 'radiology.imaging_report.create', 'Create Imaging Report', 'radiology', 'create', 'imaging_report', 'department', 'Create radiology reports', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- OPERATING THEATRE (14 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'ot.surgery_schedule.create', 'Create Surgery Schedule', 'ot_management', 'create', 'surgery_schedule', 'branch', 'Schedule surgeries in OT', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.surgery_schedule.read', 'Read Surgery Schedule', 'ot_management', 'read', 'surgery_schedule', 'branch', 'View surgery schedules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.surgery_schedule.update', 'Update Surgery Schedule', 'ot_management', 'update', 'surgery_schedule', 'branch', 'Modify surgery schedules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.surgery_schedule.delete', 'Delete Surgery Schedule', 'ot_management', 'delete', 'surgery_schedule', 'tenant', 'Cancel surgeries', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.surgery_notes.create', 'Create Surgery Notes', 'ot_management', 'create', 'surgery_notes', 'department', 'Document surgery notes', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.surgery_notes.read', 'Read Surgery Notes', 'ot_management', 'read', 'surgery_notes', 'branch', 'View surgery notes', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.surgery_notes.update', 'Update Surgery Notes', 'ot_management', 'update', 'surgery_notes', 'own', 'Modify surgery notes', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.ot_equipment.read', 'Read OT Equipment', 'ot_management', 'read', 'ot_equipment', 'branch', 'View OT equipment', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.ot_equipment.update', 'Update OT Equipment', 'ot_management', 'update', 'ot_equipment', 'branch', 'Manage OT equipment', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.anesthesia_record.create', 'Create Anesthesia Record', 'ot_management', 'create', 'anesthesia_record', 'department', 'Record anesthesia details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.anesthesia_record.read', 'Read Anesthesia Record', 'ot_management', 'read', 'anesthesia_record', 'branch', 'View anesthesia records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.anesthesia_record.update', 'Update Anesthesia Record', 'ot_management', 'update', 'anesthesia_record', 'own', 'Modify anesthesia records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.post_op_care.create', 'Create Post-Op Care', 'ot_management', 'create', 'post_op_care', 'department', 'Document post-operative care', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ot.post_op_care.read', 'Read Post-Op Care', 'ot_management', 'read', 'post_op_care', 'branch', 'View post-operative care', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- APPOINTMENTS (14 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'appointments.appointment.create', 'Create Appointment', 'appointments', 'create', 'appointment', 'branch', 'Schedule patient appointments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment.read', 'Read Appointment', 'appointments', 'read', 'appointment', 'branch', 'View appointments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment.update', 'Update Appointment', 'appointments', 'update', 'appointment', 'branch', 'Modify appointments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment.delete', 'Delete Appointment', 'appointments', 'delete', 'appointment', 'branch', 'Cancel appointments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment_slot.create', 'Create Appointment Slot', 'appointments', 'create', 'appointment_slot', 'branch', 'Create appointment slots', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment_slot.read', 'Read Appointment Slot', 'appointments', 'read', 'appointment_slot', 'branch', 'View available slots', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment_slot.update', 'Update Appointment Slot', 'appointments', 'update', 'appointment_slot', 'branch', 'Modify appointment slots', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment_slot.delete', 'Delete Appointment Slot', 'appointments', 'delete', 'appointment_slot', 'branch', 'Remove appointment slots', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.waitlist.create', 'Create Waitlist Entry', 'appointments', 'create', 'waitlist', 'branch', 'Add patients to waitlist', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.waitlist.read', 'Read Waitlist', 'appointments', 'read', 'waitlist', 'branch', 'View waitlist', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.waitlist.update', 'Update Waitlist', 'appointments', 'update', 'waitlist', 'branch', 'Manage waitlist entries', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.waitlist.delete', 'Delete Waitlist Entry', 'appointments', 'delete', 'waitlist', 'branch', 'Remove from waitlist', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment_reminder.create', 'Send Appointment Reminder', 'appointments', 'create', 'appointment_reminder', 'branch', 'Send appointment reminders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'appointments.appointment_reminder.read', 'Read Appointment Reminders', 'appointments', 'read', 'appointment_reminder', 'branch', 'View reminder history', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- BILLING & REVENUE (18 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'billing.invoice.create', 'Create Invoice', 'billing_revenue', 'create', 'invoice', 'branch', 'Generate patient invoices', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.invoice.read', 'Read Invoice', 'billing_revenue', 'read', 'invoice', 'branch', 'View invoices', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.invoice.update', 'Update Invoice', 'billing_revenue', 'update', 'invoice', 'branch', 'Modify invoices', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.invoice.delete', 'Delete Invoice', 'billing_revenue', 'delete', 'invoice', 'tenant', 'Cancel invoices', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.payment.create', 'Create Payment', 'billing_revenue', 'create', 'payment', 'branch', 'Record payments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.payment.read', 'Read Payment', 'billing_revenue', 'read', 'payment', 'branch', 'View payment records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.payment.update', 'Update Payment', 'billing_revenue', 'update', 'payment', 'branch', 'Modify payment details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.payment.delete', 'Delete Payment', 'billing_revenue', 'delete', 'payment', 'tenant', 'Void payments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.refund.create', 'Create Refund', 'billing_revenue', 'create', 'refund', 'branch', 'Process refunds', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.refund.read', 'Read Refund', 'billing_revenue', 'read', 'refund', 'branch', 'View refund records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.insurance_claim.create', 'Create Insurance Claim', 'billing_revenue', 'create', 'insurance_claim', 'branch', 'Submit insurance claims', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.insurance_claim.read', 'Read Insurance Claim', 'billing_revenue', 'read', 'insurance_claim', 'branch', 'View insurance claims', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.insurance_claim.update', 'Update Insurance Claim', 'billing_revenue', 'update', 'insurance_claim', 'branch', 'Modify insurance claims', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.pricing.read', 'Read Pricing', 'billing_revenue', 'read', 'pricing', 'branch', 'View service pricing', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.pricing.update', 'Update Pricing', 'billing_revenue', 'update', 'pricing', 'tenant', 'Modify service pricing', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.discount.create', 'Create Discount', 'billing_revenue', 'create', 'discount', 'branch', 'Apply discounts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.discount.read', 'Read Discount', 'billing_revenue', 'read', 'discount', 'branch', 'View discounts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'billing.financial_report.read', 'Read Financial Report', 'billing_revenue', 'read', 'financial_report', 'tenant', 'View financial reports', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- INVENTORY (14 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'inventory.item.create', 'Create Inventory Item', 'inventory', 'create', 'inventory_item', 'branch', 'Add items to inventory', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.item.read', 'Read Inventory Item', 'inventory', 'read', 'inventory_item', 'branch', 'View inventory items', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.item.update', 'Update Inventory Item', 'inventory', 'update', 'inventory_item', 'branch', 'Modify inventory items', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.item.delete', 'Delete Inventory Item', 'inventory', 'delete', 'inventory_item', 'tenant', 'Remove inventory items', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_adjustment.create', 'Create Stock Adjustment', 'inventory', 'create', 'stock_adjustment', 'branch', 'Adjust stock levels', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_adjustment.read', 'Read Stock Adjustment', 'inventory', 'read', 'stock_adjustment', 'branch', 'View stock adjustments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_transfer.create', 'Create Stock Transfer', 'inventory', 'create', 'stock_transfer', 'branch', 'Transfer stock between locations', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_transfer.read', 'Read Stock Transfer', 'inventory', 'read', 'stock_transfer', 'branch', 'View stock transfers', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_transfer.update', 'Update Stock Transfer', 'inventory', 'update', 'stock_transfer', 'branch', 'Modify stock transfers', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.reorder_alert.read', 'Read Reorder Alert', 'inventory', 'read', 'reorder_alert', 'branch', 'View low stock alerts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.expiry_alert.read', 'Read Expiry Alert', 'inventory', 'read', 'expiry_alert', 'branch', 'View expiring items', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_report.read', 'Read Stock Report', 'inventory', 'read', 'stock_report', 'branch', 'View inventory reports', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_count.create', 'Create Stock Count', 'inventory', 'create', 'stock_count', 'branch', 'Perform physical stock counts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'inventory.stock_count.read', 'Read Stock Count', 'inventory', 'read', 'stock_count', 'branch', 'View stock count records', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- HUMAN RESOURCES (16 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'hrm.employee.create', 'Create Employee', 'hrm', 'create', 'employee', 'tenant', 'Add new employees', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.employee.read', 'Read Employee', 'hrm', 'read', 'employee', 'branch', 'View employee records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.employee.update', 'Update Employee', 'hrm', 'update', 'employee', 'tenant', 'Modify employee records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.employee.delete', 'Delete Employee', 'hrm', 'delete', 'employee', 'tenant', 'Remove employees', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.attendance.create', 'Create Attendance', 'hrm', 'create', 'attendance', 'branch', 'Mark employee attendance', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.attendance.read', 'Read Attendance', 'hrm', 'read', 'attendance', 'branch', 'View attendance records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.attendance.update', 'Update Attendance', 'hrm', 'update', 'attendance', 'branch', 'Modify attendance records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.leave.create', 'Create Leave Request', 'hrm', 'create', 'leave_request', 'own', 'Submit leave requests', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.leave.read', 'Read Leave Request', 'hrm', 'read', 'leave_request', 'branch', 'View leave requests', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.leave.update', 'Update Leave Request', 'hrm', 'update', 'leave_request', 'branch', 'Approve/reject leave', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.payroll.create', 'Create Payroll', 'hrm', 'create', 'payroll', 'tenant', 'Process payroll', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.payroll.read', 'Read Payroll', 'hrm', 'read', 'payroll', 'tenant', 'View payroll records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.performance.create', 'Create Performance Review', 'hrm', 'create', 'performance_review', 'branch', 'Conduct performance reviews', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.performance.read', 'Read Performance Review', 'hrm', 'read', 'performance_review', 'branch', 'View performance reviews', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.performance.update', 'Update Performance Review', 'hrm', 'update', 'performance_review', 'branch', 'Modify performance reviews', true, true, NOW(), NOW()),
(gen_random_uuid(), 'hrm.training.create', 'Create Training Record', 'hrm', 'create', 'training', 'branch', 'Schedule employee training', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VENDOR & PROCUREMENT (14 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'procurement.vendor.create', 'Create Vendor', 'vendor_procurement', 'create', 'vendor', 'tenant', 'Add new vendors', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.vendor.read', 'Read Vendor', 'vendor_procurement', 'read', 'vendor', 'tenant', 'View vendor details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.vendor.update', 'Update Vendor', 'vendor_procurement', 'update', 'vendor', 'tenant', 'Modify vendor records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.vendor.delete', 'Delete Vendor', 'vendor_procurement', 'delete', 'vendor', 'tenant', 'Remove vendors', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.purchase_order.create', 'Create Purchase Order', 'vendor_procurement', 'create', 'purchase_order', 'branch', 'Create purchase orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.purchase_order.read', 'Read Purchase Order', 'vendor_procurement', 'read', 'purchase_order', 'branch', 'View purchase orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.purchase_order.update', 'Update Purchase Order', 'vendor_procurement', 'update', 'purchase_order', 'branch', 'Modify purchase orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.purchase_order.delete', 'Delete Purchase Order', 'vendor_procurement', 'delete', 'purchase_order', 'tenant', 'Cancel purchase orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.goods_receipt.create', 'Create Goods Receipt', 'vendor_procurement', 'create', 'goods_receipt', 'branch', 'Record goods received', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.goods_receipt.read', 'Read Goods Receipt', 'vendor_procurement', 'read', 'goods_receipt', 'branch', 'View goods receipts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.vendor_payment.create', 'Create Vendor Payment', 'vendor_procurement', 'create', 'vendor_payment', 'tenant', 'Process vendor payments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.vendor_payment.read', 'Read Vendor Payment', 'vendor_procurement', 'read', 'vendor_payment', 'tenant', 'View vendor payments', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.contract.create', 'Create Vendor Contract', 'vendor_procurement', 'create', 'vendor_contract', 'tenant', 'Create vendor contracts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'procurement.contract.read', 'Read Vendor Contract', 'vendor_procurement', 'read', 'vendor_contract', 'tenant', 'View vendor contracts', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- BED MANAGEMENT (10 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'bed.bed.create', 'Create Bed', 'bed_management', 'create', 'bed', 'branch', 'Add beds to system', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed.read', 'Read Bed', 'bed_management', 'read', 'bed', 'branch', 'View bed availability', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed.update', 'Update Bed', 'bed_management', 'update', 'bed', 'branch', 'Modify bed details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed.delete', 'Delete Bed', 'bed_management', 'delete', 'bed', 'tenant', 'Remove beds', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed_allocation.create', 'Create Bed Allocation', 'bed_management', 'create', 'bed_allocation', 'branch', 'Allocate beds to patients', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed_allocation.read', 'Read Bed Allocation', 'bed_management', 'read', 'bed_allocation', 'branch', 'View bed allocations', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed_allocation.update', 'Update Bed Allocation', 'bed_management', 'update', 'bed_allocation', 'branch', 'Modify bed allocations', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed_allocation.delete', 'Delete Bed Allocation', 'bed_management', 'delete', 'bed_allocation', 'branch', 'Discharge patients', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed_transfer.create', 'Create Bed Transfer', 'bed_management', 'create', 'bed_transfer', 'branch', 'Transfer patients between beds', true, true, NOW(), NOW()),
(gen_random_uuid(), 'bed.bed_transfer.read', 'Read Bed Transfer', 'bed_management', 'read', 'bed_transfer', 'branch', 'View bed transfer history', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- AMBULANCE (8 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'ambulance.vehicle.create', 'Create Ambulance Vehicle', 'ambulance', 'create', 'ambulance_vehicle', 'branch', 'Add ambulances to fleet', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.vehicle.read', 'Read Ambulance Vehicle', 'ambulance', 'read', 'ambulance_vehicle', 'branch', 'View ambulance details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.vehicle.update', 'Update Ambulance Vehicle', 'ambulance', 'update', 'ambulance_vehicle', 'branch', 'Modify ambulance records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.booking.create', 'Create Ambulance Booking', 'ambulance', 'create', 'ambulance_booking', 'branch', 'Book ambulance services', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.booking.read', 'Read Ambulance Booking', 'ambulance', 'read', 'ambulance_booking', 'branch', 'View ambulance bookings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.booking.update', 'Update Ambulance Booking', 'ambulance', 'update', 'ambulance_booking', 'branch', 'Modify ambulance bookings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.trip.create', 'Create Ambulance Trip', 'ambulance', 'create', 'ambulance_trip', 'branch', 'Log ambulance trips', true, true, NOW(), NOW()),
(gen_random_uuid(), 'ambulance.trip.read', 'Read Ambulance Trip', 'ambulance', 'read', 'ambulance_trip', 'branch', 'View ambulance trip history', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- DOCUMENT SHARING (18 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'document.document_type.create', 'Create Document Type', 'document_sharing', 'create', 'document_type', 'tenant', 'Define document types', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.document_type.read', 'Read Document Type', 'document_sharing', 'read', 'document_type', 'tenant', 'View document types', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.document_type.update', 'Update Document Type', 'document_sharing', 'update', 'document_type', 'tenant', 'Modify document types', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.document_type.delete', 'Delete Document Type', 'document_sharing', 'delete', 'document_type', 'tenant', 'Remove document types', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.access_rule.create', 'Create Access Rule', 'document_sharing', 'create', 'access_rule', 'tenant', 'Define document access rules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.access_rule.read', 'Read Access Rule', 'document_sharing', 'read', 'access_rule', 'tenant', 'View access rules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.access_rule.update', 'Update Access Rule', 'document_sharing', 'update', 'access_rule', 'tenant', 'Modify access rules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.access_rule.delete', 'Delete Access Rule', 'document_sharing', 'delete', 'access_rule', 'tenant', 'Remove access rules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.shared_document.read', 'Read Shared Document', 'document_sharing', 'read', 'shared_document', 'department', 'Access shared documents', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.shared_document.download', 'Download Shared Document', 'document_sharing', 'download', 'shared_document', 'department', 'Download shared documents', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.patient_upload.read', 'Read Patient Upload', 'document_sharing', 'read', 'patient_upload', 'branch', 'View patient-uploaded documents', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.patient_upload.approve', 'Approve Patient Upload', 'document_sharing', 'approve', 'patient_upload', 'department', 'Approve patient documents', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.access_audit.read', 'Read Access Audit', 'document_sharing', 'read', 'access_audit', 'tenant', 'View document access logs', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.sharing_config.read', 'Read Sharing Config', 'document_sharing', 'read', 'sharing_config', 'tenant', 'View sharing configuration', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.sharing_config.update', 'Update Sharing Config', 'document_sharing', 'update', 'sharing_config', 'tenant', 'Modify sharing rules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.cross_dept_access.read', 'Read Cross-Department Access', 'document_sharing', 'read', 'cross_dept_access', 'tenant', 'View cross-dept document access', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.cross_dept_access.grant', 'Grant Cross-Department Access', 'document_sharing', 'grant', 'cross_dept_access', 'tenant', 'Grant cross-department access', true, true, NOW(), NOW()),
(gen_random_uuid(), 'document.bulk_sharing.create', 'Create Bulk Sharing', 'document_sharing', 'create', 'bulk_sharing', 'tenant', 'Share documents in bulk', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SYSTEM SETTINGS (14 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'system.configuration.read', 'Read System Configuration', 'system_settings', 'read', 'system_configuration', 'tenant', 'View system settings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.configuration.update', 'Update System Configuration', 'system_settings', 'update', 'system_configuration', 'tenant', 'Modify system settings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.user.create', 'Create User', 'system_settings', 'create', 'user', 'tenant', 'Create system users', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.user.read', 'Read User', 'system_settings', 'read', 'user', 'tenant', 'View user accounts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.user.update', 'Update User', 'system_settings', 'update', 'user', 'tenant', 'Modify user accounts', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.user.delete', 'Delete User', 'system_settings', 'delete', 'user', 'tenant', 'Deactivate users', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.role.create', 'Create Role', 'system_settings', 'create', 'role', 'tenant', 'Create system roles', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.role.read', 'Read Role', 'system_settings', 'read', 'role', 'tenant', 'View roles', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.role.update', 'Update Role', 'system_settings', 'update', 'role', 'tenant', 'Modify roles', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.role.delete', 'Delete Role', 'system_settings', 'delete', 'role', 'tenant', 'Remove roles', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.permission.read', 'Read Permission', 'system_settings', 'read', 'permission', 'tenant', 'View permissions', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.audit_log.read', 'Read Audit Log', 'system_settings', 'read', 'audit_log', 'tenant', 'View audit logs', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.backup.create', 'Create Backup', 'system_settings', 'create', 'backup', 'tenant', 'Perform system backups', true, true, NOW(), NOW()),
(gen_random_uuid(), 'system.backup.restore', 'Restore Backup', 'system_settings', 'restore', 'backup', 'tenant', 'Restore from backup', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- QUALITY ASSURANCE (10 permissions)
-- ============================================
INSERT INTO permissions (id, code, name, module, action, resource_type, scope, description, is_system_permission, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'quality.incident.create', 'Create Incident Report', 'quality_assurance', 'create', 'incident', 'branch', 'Report quality incidents', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.incident.read', 'Read Incident Report', 'quality_assurance', 'read', 'incident', 'branch', 'View incident reports', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.incident.update', 'Update Incident Report', 'quality_assurance', 'update', 'incident', 'branch', 'Modify incident reports', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.audit.create', 'Create Quality Audit', 'quality_assurance', 'create', 'quality_audit', 'tenant', 'Conduct quality audits', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.audit.read', 'Read Quality Audit', 'quality_assurance', 'read', 'quality_audit', 'tenant', 'View audit reports', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.audit.update', 'Update Quality Audit', 'quality_assurance', 'update', 'quality_audit', 'tenant', 'Modify audit findings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.compliance.read', 'Read Compliance Report', 'quality_assurance', 'read', 'compliance', 'tenant', 'View compliance reports', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.improvement_plan.create', 'Create Improvement Plan', 'quality_assurance', 'create', 'improvement_plan', 'tenant', 'Create quality improvement plans', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.improvement_plan.read', 'Read Improvement Plan', 'quality_assurance', 'read', 'improvement_plan', 'tenant', 'View improvement plans', true, true, NOW(), NOW()),
(gen_random_uuid(), 'quality.metrics.read', 'Read Quality Metrics', 'quality_assurance', 'read', 'quality_metrics', 'tenant', 'View quality metrics dashboard', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFICATION & SUMMARY
-- ============================================
DO $$
DECLARE
    total_count INTEGER;
    radiology_count INTEGER;
    ot_count INTEGER;
    appointments_count INTEGER;
    billing_count INTEGER;
    inventory_count INTEGER;
    hrm_count INTEGER;
    procurement_count INTEGER;
    bed_count INTEGER;
    ambulance_count INTEGER;
    document_count INTEGER;
    system_count INTEGER;
    quality_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO radiology_count FROM permissions WHERE module = 'radiology';
    SELECT COUNT(*) INTO ot_count FROM permissions WHERE module = 'ot_management';
    SELECT COUNT(*) INTO appointments_count FROM permissions WHERE module = 'appointments';
    SELECT COUNT(*) INTO billing_count FROM permissions WHERE module = 'billing_revenue';
    SELECT COUNT(*) INTO inventory_count FROM permissions WHERE module = 'inventory';
    SELECT COUNT(*) INTO hrm_count FROM permissions WHERE module = 'hrm';
    SELECT COUNT(*) INTO procurement_count FROM permissions WHERE module = 'vendor_procurement';
    SELECT COUNT(*) INTO bed_count FROM permissions WHERE module = 'bed_management';
    SELECT COUNT(*) INTO ambulance_count FROM permissions WHERE module = 'ambulance';
    SELECT COUNT(*) INTO document_count FROM permissions WHERE module = 'document_sharing';
    SELECT COUNT(*) INTO system_count FROM permissions WHERE module = 'system_settings';
    SELECT COUNT(*) INTO quality_count FROM permissions WHERE module = 'quality_assurance';
    SELECT COUNT(*) INTO total_count FROM permissions;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PERMISSIONS SEEDING SUMMARY';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✓ Radiology: % permissions', radiology_count;
    RAISE NOTICE '✓ OT Management: % permissions', ot_count;
    RAISE NOTICE '✓ Appointments: % permissions', appointments_count;
    RAISE NOTICE '✓ Billing & Revenue: % permissions', billing_count;
    RAISE NOTICE '✓ Inventory: % permissions', inventory_count;
    RAISE NOTICE '✓ HRM: % permissions', hrm_count;
    RAISE NOTICE '✓ Vendor & Procurement: % permissions', procurement_count;
    RAISE NOTICE '✓ Bed Management: % permissions', bed_count;
    RAISE NOTICE '✓ Ambulance: % permissions', ambulance_count;
    RAISE NOTICE '✓ Document Sharing: % permissions', document_count;
    RAISE NOTICE '✓ System Settings: % permissions', system_count;
    RAISE NOTICE '✓ Quality Assurance: % permissions', quality_count;
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE '✓ TOTAL PERMISSIONS: %', total_count;
    RAISE NOTICE '============================================';
END $$;
