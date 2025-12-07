-- ============================================
-- MISSING PERMISSIONS: BILLING, HRM, VENDOR & PROCUREMENT, DOCUMENT SHARING
-- Adding the final modules to reach 297 permissions
-- ============================================

-- Disable audit triggers temporarily
ALTER TABLE permissions DISABLE TRIGGER audit_permissions_changes;

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
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'billing.refund.create', 'Create Refund', 'Process patient refunds', 'Billing & Revenue', 'create', 'refund', 'branch', true, true, NOW(), NOW()),
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
-- VERIFICATION AND SUMMARY
-- ============================================

-- Re-enable audit triggers
ALTER TABLE permissions ENABLE TRIGGER audit_permissions_changes;

-- Verification queries
SELECT 'FINAL TOTAL PERMISSIONS:' as info, COUNT(*) as count FROM permissions;

SELECT "Module", COUNT(*) as permission_count FROM permissions GROUP BY "Module" ORDER BY "Module";