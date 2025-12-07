-- ============================================
-- Seed Script: Lab Diagnostics Permissions (16)
-- Module: lab_diagnostics
-- Created: November 10, 2025
-- ============================================

INSERT INTO permissions (
    id, code, name, module, action, resource_type, scope, description, 
    is_system_permission, is_active, created_at, updated_at
) VALUES
-- Lab Test Order Permissions (4)
(gen_random_uuid(), 'lab.test_order.create', 'Create Lab Test Order', 'lab_diagnostics', 'create', 'lab_test_order', 'department', 'Order laboratory tests', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.test_order.read', 'Read Lab Test Order', 'lab_diagnostics', 'read', 'lab_test_order', 'branch', 'View lab test orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.test_order.update', 'Update Lab Test Order', 'lab_diagnostics', 'update', 'lab_test_order', 'department', 'Modify lab test orders', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.test_order.delete', 'Delete Lab Test Order', 'lab_diagnostics', 'delete', 'lab_test_order', 'tenant', 'Cancel lab test orders', true, true, NOW(), NOW()),

-- Lab Test Result Permissions (4)
(gen_random_uuid(), 'lab.test_result.create', 'Create Lab Test Result', 'lab_diagnostics', 'create', 'lab_test_result', 'department', 'Enter laboratory test results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.test_result.read', 'Read Lab Test Result', 'lab_diagnostics', 'read', 'lab_test_result', 'branch', 'View lab test results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.test_result.update', 'Update Lab Test Result', 'lab_diagnostics', 'update', 'lab_test_result', 'own', 'Modify lab test results', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.test_result.delete', 'Delete Lab Test Result', 'lab_diagnostics', 'delete', 'lab_test_result', 'tenant', 'Remove lab test results', true, true, NOW(), NOW()),

-- Sample Collection Permissions (4)
(gen_random_uuid(), 'lab.sample_collection.create', 'Create Sample Collection', 'lab_diagnostics', 'create', 'sample_collection', 'department', 'Record sample collection', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.sample_collection.read', 'Read Sample Collection', 'lab_diagnostics', 'read', 'sample_collection', 'branch', 'View sample collection records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.sample_collection.update', 'Update Sample Collection', 'lab_diagnostics', 'update', 'sample_collection', 'department', 'Modify sample collection details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.sample_collection.delete', 'Delete Sample Collection', 'lab_diagnostics', 'delete', 'sample_collection', 'tenant', 'Remove sample collection records', true, true, NOW(), NOW()),

-- Lab Equipment Permissions (4)
(gen_random_uuid(), 'lab.equipment.create', 'Create Lab Equipment', 'lab_diagnostics', 'create', 'lab_equipment', 'branch', 'Add lab equipment to system', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.equipment.read', 'Read Lab Equipment', 'lab_diagnostics', 'read', 'lab_equipment', 'branch', 'View lab equipment details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.equipment.update', 'Update Lab Equipment', 'lab_diagnostics', 'update', 'lab_equipment', 'branch', 'Modify lab equipment records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'lab.equipment.delete', 'Delete Lab Equipment', 'lab_diagnostics', 'delete', 'lab_equipment', 'tenant', 'Remove lab equipment', true, true, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count FROM permissions WHERE module = 'lab_diagnostics';
    RAISE NOTICE '✓ Lab Diagnostics: % permissions inserted', inserted_count;
END $$;
