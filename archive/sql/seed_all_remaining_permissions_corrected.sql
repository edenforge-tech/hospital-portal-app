-- ============================================
-- CORRECTED: ALL REMAINING MODULE PERMISSIONS (154 permissions)
-- Fixed for proper column names and structure
-- ============================================

-- Disable audit triggers temporarily
ALTER TABLE permissions DISABLE TRIGGER audit_permissions_changes;

-- ============================================
-- RADIOLOGY (12 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_order.create', 'Create Imaging Order', 'Order radiology imaging studies', 'Radiology', 'create', 'imaging_order', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_order.read', 'Read Imaging Order', 'View imaging orders', 'Radiology', 'read', 'imaging_order', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_order.update', 'Update Imaging Order', 'Modify imaging orders', 'Radiology', 'update', 'imaging_order', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_order.delete', 'Delete Imaging Order', 'Cancel imaging orders', 'Radiology', 'delete', 'imaging_order', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_result.create', 'Create Imaging Result', 'Upload radiology results', 'Radiology', 'create', 'imaging_result', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_result.read', 'Read Imaging Result', 'View imaging results', 'Radiology', 'read', 'imaging_result', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_result.update', 'Update Imaging Result', 'Modify imaging results', 'Radiology', 'update', 'imaging_result', 'own', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_result.delete', 'Delete Imaging Result', 'Remove imaging results', 'Radiology', 'delete', 'imaging_result', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.pacs_access.read', 'Access PACS System', 'Access medical imaging PACS', 'Radiology', 'read', 'pacs_system', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_equipment.read', 'Read Imaging Equipment', 'View imaging equipment', 'Radiology', 'read', 'imaging_equipment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_equipment.update', 'Update Imaging Equipment', 'Manage imaging equipment', 'Radiology', 'update', 'imaging_equipment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'radiology.imaging_report.create', 'Create Imaging Report', 'Create radiology reports', 'Radiology', 'create', 'imaging_report', 'department', true, true, NOW(), NOW());

-- ============================================
-- OPERATING THEATRE MANAGEMENT (14 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_schedule.create', 'Create Surgery Schedule', 'Schedule surgeries in OT', 'OT Management', 'create', 'surgery_schedule', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_schedule.read', 'Read Surgery Schedule', 'View surgery schedules', 'OT Management', 'read', 'surgery_schedule', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_schedule.update', 'Update Surgery Schedule', 'Modify surgery schedules', 'OT Management', 'update', 'surgery_schedule', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_schedule.delete', 'Delete Surgery Schedule', 'Cancel surgeries', 'OT Management', 'delete', 'surgery_schedule', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_notes.create', 'Create Surgery Notes', 'Document surgery notes', 'OT Management', 'create', 'surgery_notes', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_notes.read', 'Read Surgery Notes', 'View surgery notes', 'OT Management', 'read', 'surgery_notes', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.surgery_notes.update', 'Update Surgery Notes', 'Modify surgery notes', 'OT Management', 'update', 'surgery_notes', 'own', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.ot_equipment.read', 'Read OT Equipment', 'View OT equipment', 'OT Management', 'read', 'ot_equipment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.ot_equipment.update', 'Update OT Equipment', 'Manage OT equipment', 'OT Management', 'update', 'ot_equipment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.anesthesia_record.create', 'Create Anesthesia Record', 'Record anesthesia details', 'OT Management', 'create', 'anesthesia_record', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.anesthesia_record.read', 'Read Anesthesia Record', 'View anesthesia records', 'OT Management', 'read', 'anesthesia_record', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.anesthesia_record.update', 'Update Anesthesia Record', 'Modify anesthesia records', 'OT Management', 'update', 'anesthesia_record', 'own', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.post_op_care.create', 'Create Post-Op Care', 'Document post-operative care', 'OT Management', 'create', 'post_op_care', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ot.post_op_care.read', 'Read Post-Op Care', 'View post-operative care', 'OT Management', 'read', 'post_op_care', 'branch', true, true, NOW(), NOW());

-- ============================================
-- BILLING & REVENUE (18 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.invoice.create', 'Create Invoice', 'Generate patient invoices', 'Billing & Revenue', 'create', 'invoice', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.invoice.read', 'Read Invoice', 'View patient invoices', 'Billing & Revenue', 'read', 'invoice', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.invoice.update', 'Update Invoice', 'Modify patient invoices', 'Billing & Revenue', 'update', 'invoice', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.invoice.delete', 'Delete Invoice', 'Cancel patient invoices', 'Billing & Revenue', 'delete', 'invoice', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.payment.create', 'Create Payment', 'Record patient payments', 'Billing & Revenue', 'create', 'payment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.payment.read', 'Read Payment', 'View payment records', 'Billing & Revenue', 'read', 'payment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.payment.update', 'Update Payment', 'Modify payment records', 'Billing & Revenue', 'update', 'payment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-0000-000000000001', 'billing.refund.create', 'Create Refund', 'Process patient refunds', 'Billing & Revenue', 'create', 'refund', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.refund.read', 'Read Refund', 'View refund records', 'Billing & Revenue', 'read', 'refund', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.insurance_claim.create', 'Create Insurance Claim', 'Submit insurance claims', 'Billing & Revenue', 'create', 'insurance_claim', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.insurance_claim.read', 'Read Insurance Claim', 'View insurance claims', 'Billing & Revenue', 'read', 'insurance_claim', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.insurance_claim.update', 'Update Insurance Claim', 'Modify insurance claims', 'Billing & Revenue', 'update', 'insurance_claim', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.pricing.read', 'Read Pricing', 'View service pricing', 'Billing & Revenue', 'read', 'pricing', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.pricing.update', 'Update Pricing', 'Modify service pricing', 'Billing & Revenue', 'update', 'pricing', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.discount.create', 'Create Discount', 'Apply discounts to bills', 'Billing & Revenue', 'create', 'discount', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.discount.read', 'Read Discount', 'View discount records', 'Billing & Revenue', 'read', 'discount', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.discount.update', 'Update Discount', 'Modify discount records', 'Billing & Revenue', 'update', 'discount', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.discount.delete', 'Delete Discount', 'Remove discount records', 'Billing & Revenue', 'delete', 'branch', true, true, NOW(), NOW());

-- ============================================
-- INVENTORY (14 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.item.create', 'Create Inventory Item', 'Add new inventory items', 'Inventory', 'create', 'inventory_item', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.item.read', 'Read Inventory Item', 'View inventory items', 'Inventory', 'read', 'inventory_item', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.item.update', 'Update Inventory Item', 'Modify inventory items', 'Inventory', 'update', 'inventory_item', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.item.delete', 'Delete Inventory Item', 'Remove inventory items', 'Inventory', 'delete', 'inventory_item', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_adjustment.create', 'Create Stock Adjustment', 'Adjust inventory stock levels', 'Inventory', 'create', 'stock_adjustment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_adjustment.read', 'Read Stock Adjustment', 'View stock adjustment records', 'Inventory', 'read', 'stock_adjustment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_transfer.create', 'Create Stock Transfer', 'Transfer stock between locations', 'Inventory', 'create', 'stock_transfer', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_transfer.read', 'Read Stock Transfer', 'View stock transfer records', 'Inventory', 'read', 'stock_transfer', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_transfer.update', 'Update Stock Transfer', 'Modify stock transfer records', 'Inventory', 'update', 'stock_transfer', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.alert.create', 'Create Inventory Alert', 'Set up inventory alerts', 'Inventory', 'create', 'inventory_alert', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.alert.read', 'Read Inventory Alert', 'View inventory alerts', 'Inventory', 'read', 'inventory_alert', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.alert.update', 'Update Inventory Alert', 'Modify inventory alerts', 'Inventory', 'update', 'inventory_alert', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_count.create', 'Create Stock Count', 'Perform inventory stock counts', 'Inventory', 'create', 'stock_count', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'inventory.stock_count.read', 'Read Stock Count', 'View stock count records', 'Inventory', 'read', 'stock_count', 'branch', true, true, NOW(), NOW());

-- ============================================
-- HUMAN RESOURCE MANAGEMENT (16 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.employee.create', 'Create Employee', 'Add new employees', 'HRM', 'create', 'employee', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.employee.read', 'Read Employee', 'View employee records', 'HRM', 'read', 'employee', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.employee.update', 'Update Employee', 'Modify employee records', 'HRM', 'update', 'employee', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.employee.delete', 'Delete Employee', 'Remove employee records', 'HRM', 'delete', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.attendance.create', 'Create Attendance', 'Record employee attendance', 'HRM', 'create', 'attendance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.attendance.read', 'Read Attendance', 'View attendance records', 'HRM', 'read', 'attendance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.leave.create', 'Create Leave', 'Submit leave requests', 'HRM', 'create', 'leave', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.leave.read', 'Read Leave', 'View leave records', 'HRM', 'read', 'leave', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.leave.update', 'Update Leave', 'Approve/modify leave requests', 'HRM', 'update', 'leave', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.payroll.create', 'Create Payroll', 'Process payroll', 'HRM', 'create', 'payroll', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.payroll.read', 'Read Payroll', 'View payroll records', 'HRM', 'read', 'payroll', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.performance.create', 'Create Performance Review', 'Create performance reviews', 'HRM', 'create', 'performance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.performance.read', 'Read Performance Review', 'View performance reviews', 'HRM', 'read', 'performance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.performance.update', 'Update Performance Review', 'Modify performance reviews', 'HRM', 'update', 'performance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.training.create', 'Create Training', 'Schedule training programs', 'HRM', 'create', 'training', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'hrm.training.read', 'Read Training', 'View training records', 'HRM', 'read', 'training', 'branch', true, true, NOW(), NOW());

-- ============================================
-- VENDOR & PROCUREMENT (14 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.vendor.create', 'Create Vendor', 'Add new vendors', 'Vendor & Procurement', 'create', 'vendor', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.vendor.read', 'Read Vendor', 'View vendor records', 'Vendor & Procurement', 'read', 'vendor', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.vendor.update', 'Update Vendor', 'Modify vendor records', 'Vendor & Procurement', 'update', 'vendor', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.purchase_order.create', 'Create Purchase Order', 'Create purchase orders', 'Vendor & Procurement', 'create', 'purchase_order', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.purchase_order.read', 'Read Purchase Order', 'View purchase orders', 'Vendor & Procurement', 'read', 'purchase_order', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.purchase_order.update', 'Update Purchase Order', 'Modify purchase orders', 'Vendor & Procurement', 'update', 'purchase_order', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.goods_receipt.create', 'Create Goods Receipt', 'Record goods receipt', 'Vendor & Procurement', 'create', 'goods_receipt', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.goods_receipt.read', 'Read Goods Receipt', 'View goods receipt records', 'Vendor & Procurement', 'read', 'goods_receipt', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.payment.create', 'Create Vendor Payment', 'Process vendor payments', 'Vendor & Procurement', 'create', 'vendor_payment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.payment.read', 'Read Vendor Payment', 'View vendor payment records', 'Vendor & Procurement', 'read', 'vendor_payment', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.contract.create', 'Create Contract', 'Create vendor contracts', 'Vendor & Procurement', 'create', 'contract', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.contract.read', 'Read Contract', 'View vendor contracts', 'Vendor & Procurement', 'read', 'contract', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.contract.update', 'Update Contract', 'Modify vendor contracts', 'Vendor & Procurement', 'update', 'contract', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor.contract.delete', 'Delete Contract', 'Remove vendor contracts', 'Vendor & Procurement', 'delete', 'tenant', true, true, NOW(), NOW());

-- ============================================
-- BED MANAGEMENT (10 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.bed.create', 'Create Bed', 'Add new beds', 'Bed Management', 'create', 'bed', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.bed.read', 'Read Bed', 'View bed information', 'Bed Management', 'read', 'bed', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.bed.update', 'Update Bed', 'Modify bed information', 'Bed Management', 'update', 'bed', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.allocation.create', 'Create Bed Allocation', 'Allocate beds to patients', 'Bed Management', 'create', 'bed_allocation', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.allocation.read', 'Read Bed Allocation', 'View bed allocation records', 'Bed Management', 'read', 'bed_allocation', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.allocation.update', 'Update Bed Allocation', 'Modify bed allocations', 'Bed Management', 'update', 'bed_allocation', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.transfer.create', 'Create Bed Transfer', 'Transfer patients between beds', 'Bed Management', 'create', 'bed_transfer', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.transfer.read', 'Read Bed Transfer', 'View bed transfer records', 'Bed Management', 'read', 'bed_transfer', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.transfer.update', 'Update Bed Transfer', 'Modify bed transfer records', 'Bed Management', 'update', 'bed_transfer', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'bed.transfer.delete', 'Delete Bed Transfer', 'Cancel bed transfers', 'Bed Management', 'delete', 'bed_transfer', 'branch', true, true, NOW(), NOW());

-- ============================================
-- AMBULANCE (8 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.vehicle.create', 'Create Ambulance', 'Add new ambulance vehicles', 'Ambulance', 'create', 'ambulance', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.vehicle.read', 'Read Ambulance', 'View ambulance information', 'Ambulance', 'read', 'ambulance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.vehicle.update', 'Update Ambulance', 'Modify ambulance information', 'Ambulance', 'update', 'ambulance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.booking.create', 'Create Ambulance Booking', 'Book ambulance services', 'Ambulance', 'create', 'ambulance_booking', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.booking.read', 'Read Ambulance Booking', 'View ambulance bookings', 'Ambulance', 'read', 'ambulance_booking', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.booking.update', 'Update Ambulance Booking', 'Modify ambulance bookings', 'Ambulance', 'update', 'ambulance_booking', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.trip.create', 'Create Ambulance Trip', 'Record ambulance trips', 'Ambulance', 'create', 'ambulance_trip', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ambulance.trip.read', 'Read Ambulance Trip', 'View ambulance trip records', 'Ambulance', 'read', 'ambulance_trip', 'branch', true, true, NOW(), NOW());

-- ============================================
-- DOCUMENT SHARING (18 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.document_type.create', 'Create Document Type', 'Define document types', 'Document Sharing', 'create', 'document_type', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.document_type.read', 'Read Document Type', 'View document types', 'Document Sharing', 'read', 'document_type', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.access_rule.create', 'Create Access Rule', 'Define document access rules', 'Document Sharing', 'create', 'access_rule', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.access_rule.read', 'Read Access Rule', 'View access rules', 'Document Sharing', 'read', 'access_rule', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.access_rule.update', 'Update Access Rule', 'Modify access rules', 'Document Sharing', 'update', 'access_rule', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.shared_document.create', 'Create Shared Document', 'Share documents with other departments', 'Document Sharing', 'create', 'shared_document', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.shared_document.read', 'Read Shared Document', 'View shared documents', 'Document Sharing', 'read', 'shared_document', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.shared_document.update', 'Update Shared Document', 'Modify shared document permissions', 'Document Sharing', 'update', 'shared_document', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.patient_upload.create', 'Create Patient Upload', 'Allow patients to upload documents', 'Document Sharing', 'create', 'patient_upload', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.patient_upload.read', 'Read Patient Upload', 'View patient-uploaded documents', 'Document Sharing', 'read', 'patient_upload', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.patient_upload.update', 'Update Patient Upload', 'Modify patient uploads', 'Document Sharing', 'update', 'patient_upload', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.patient_upload.delete', 'Delete Patient Upload', 'Remove patient uploads', 'Document Sharing', 'delete', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.audit.create', 'Create Document Audit', 'Log document access activities', 'Document Sharing', 'create', 'document_audit', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.audit.read', 'Read Document Audit', 'View document access logs', 'Document Sharing', 'read', 'document_audit', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.cross_dept_share.create', 'Create Cross-Department Share', 'Share documents across departments', 'Document Sharing', 'create', 'cross_dept_share', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.cross_dept_share.read', 'Read Cross-Department Share', 'View cross-department shares', 'Document Sharing', 'read', 'cross_dept_share', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.cross_dept_share.update', 'Update Cross-Department Share', 'Modify cross-department sharing', 'Document Sharing', 'update', 'cross_dept_share', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'document.cross_dept_share.delete', 'Delete Cross-Department Share', 'Remove cross-department shares', 'Document Sharing', 'delete', 'branch', true, true, NOW(), NOW());

-- ============================================
-- SYSTEM SETTINGS (14 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.configuration.create', 'Create System Configuration', 'Configure system settings', 'System Settings', 'create', 'configuration', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.configuration.read', 'Read System Configuration', 'View system settings', 'System Settings', 'read', 'configuration', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.configuration.update', 'Update System Configuration', 'Modify system settings', 'System Settings', 'update', 'configuration', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.user_management.create', 'Create User Management', 'Add system users', 'System Settings', 'create', 'user_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.user_management.read', 'Read User Management', 'View system users', 'System Settings', 'read', 'user_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.user_management.update', 'Update User Management', 'Modify system users', 'System Settings', 'update', 'user_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.role_management.create', 'Create Role Management', 'Define system roles', 'System Settings', 'create', 'role_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.role_management.read', 'Read Role Management', 'View system roles', 'System Settings', 'read', 'role_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.role_management.update', 'Update Role Management', 'Modify system roles', 'System Settings', 'update', 'role_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.permission_management.create', 'Create Permission Management', 'Define system permissions', 'System Settings', 'create', 'permission_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.permission_management.read', 'Read Permission Management', 'View system permissions', 'System Settings', 'read', 'permission_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.audit_log.read', 'Read Audit Logs', 'View system audit logs', 'System Settings', 'read', 'audit_log', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.backup.create', 'Create System Backup', 'Create system backups', 'System Settings', 'create', 'backup', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'system.backup.read', 'Read System Backup', 'View backup records', 'System Settings', 'read', 'backup', 'tenant', true, true, NOW(), NOW());

-- ============================================
-- QUALITY ASSURANCE (10 permissions)
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.incident.create', 'Create Quality Incident', 'Report quality incidents', 'Quality Assurance', 'create', 'incident', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.incident.read', 'Read Quality Incident', 'View quality incidents', 'Quality Assurance', 'read', 'incident', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.incident.update', 'Update Quality Incident', 'Modify incident reports', 'Quality Assurance', 'update', 'incident', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.audit.create', 'Create Quality Audit', 'Schedule quality audits', 'Quality Assurance', 'create', 'audit', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.audit.read', 'Read Quality Audit', 'View audit results', 'Quality Assurance', 'read', 'audit', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.audit.update', 'Update Quality Audit', 'Modify audit records', 'Quality Assurance', 'update', 'audit', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.compliance.create', 'Create Compliance Record', 'Document compliance activities', 'Quality Assurance', 'create', 'compliance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.compliance.read', 'Read Compliance Record', 'View compliance records', 'Quality Assurance', 'read', 'compliance', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.improvement_plan.create', 'Create Improvement Plan', 'Develop quality improvement plans', 'Quality Assurance', 'create', 'improvement_plan', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'qa.improvement_plan.read', 'Read Improvement Plan', 'View improvement plans', 'Quality Assurance', 'read', 'improvement_plan', 'branch', true, true, NOW(), NOW());

-- ============================================
-- PHARMACY (16 permissions) - Adding this module
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.prescription.create', 'Create Prescription', 'Create new prescriptions', 'Pharmacy', 'create', 'prescription', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.prescription.read', 'Read Prescription', 'View prescriptions', 'Pharmacy', 'read', 'prescription', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.prescription.update', 'Update Prescription', 'Modify prescriptions', 'Pharmacy', 'update', 'prescription', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.medication_dispensing.create', 'Create Medication Dispensing', 'Dispense medications', 'Pharmacy', 'create', 'medication_dispensing', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.medication_dispensing.read', 'Read Medication Dispensing', 'View dispensing records', 'Pharmacy', 'read', 'medication_dispensing', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.inventory.create', 'Create Pharmacy Inventory', 'Add pharmacy inventory', 'Pharmacy', 'create', 'pharmacy_inventory', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.inventory.read', 'Read Pharmacy Inventory', 'View pharmacy inventory', 'Pharmacy', 'read', 'pharmacy_inventory', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.inventory.update', 'Update Pharmacy Inventory', 'Modify pharmacy inventory', 'Pharmacy', 'update', 'pharmacy_inventory', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.drug_interaction.create', 'Create Drug Interaction', 'Record drug interactions', 'Pharmacy', 'create', 'drug_interaction', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.drug_interaction.read', 'Read Drug Interaction', 'View drug interaction records', 'Pharmacy', 'read', 'drug_interaction', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.patient_counseling.create', 'Create Patient Counseling', 'Document patient counseling', 'Pharmacy', 'create', 'patient_counseling', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.patient_counseling.read', 'Read Patient Counseling', 'View counseling records', 'Pharmacy', 'read', 'patient_counseling', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.compounding.create', 'Create Compounding', 'Prepare compounded medications', 'Pharmacy', 'create', 'compounding', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.compounding.read', 'Read Compounding', 'View compounding records', 'Pharmacy', 'read', 'compounding', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.adverse_reaction.create', 'Create Adverse Reaction', 'Report adverse drug reactions', 'Pharmacy', 'create', 'adverse_reaction', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'pharmacy.adverse_reaction.read', 'Read Adverse Reaction', 'View adverse reaction reports', 'Pharmacy', 'read', 'adverse_reaction', 'branch', true, true, NOW(), NOW());

-- ============================================
-- VERIFICATION AND SUMMARY
-- ============================================

-- Re-enable audit triggers
ALTER TABLE permissions ENABLE TRIGGER audit_permissions_changes;

-- Verification queries
SELECT 'Total permissions after expansion:' as info, COUNT(*) as count FROM permissions;

SELECT "Module", COUNT(*) as permission_count FROM permissions GROUP BY "Module" ORDER BY "Module";