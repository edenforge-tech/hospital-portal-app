-- ============================================
-- Seed Script: Pharmacy Management Permissions (16)
-- Module: pharmacy
-- Created: November 10, 2025
-- ============================================

INSERT INTO permissions (
    id, code, name, module, action, resource_type, scope, description, 
    is_system_permission, is_active, created_at, updated_at
) VALUES
-- Prescription Permissions (4)
(gen_random_uuid(), 'pharmacy.prescription.create', 'Create Prescription', 'pharmacy', 'create', 'prescription', 'department', 'Create prescriptions for patients', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.prescription.read', 'Read Prescription', 'pharmacy', 'read', 'prescription', 'branch', 'View prescriptions', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.prescription.update', 'Update Prescription', 'pharmacy', 'update', 'prescription', 'own', 'Modify prescriptions', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.prescription.delete', 'Delete Prescription', 'pharmacy', 'delete', 'prescription', 'tenant', 'Cancel prescriptions', true, true, NOW(), NOW()),

-- Medication Dispensing Permissions (4)
(gen_random_uuid(), 'pharmacy.medication_dispensing.create', 'Dispense Medication', 'pharmacy', 'create', 'medication_dispensing', 'department', 'Dispense medications to patients', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.medication_dispensing.read', 'Read Medication Dispensing', 'pharmacy', 'read', 'medication_dispensing', 'branch', 'View medication dispensing records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.medication_dispensing.update', 'Update Medication Dispensing', 'pharmacy', 'update', 'medication_dispensing', 'own', 'Modify dispensing records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.medication_dispensing.delete', 'Delete Medication Dispensing', 'pharmacy', 'delete', 'medication_dispensing', 'tenant', 'Cancel medication dispensing', true, true, NOW(), NOW()),

-- Medication Inventory Permissions (4)
(gen_random_uuid(), 'pharmacy.medication_inventory.create', 'Create Medication Inventory', 'pharmacy', 'create', 'medication_inventory', 'branch', 'Add medication to inventory', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.medication_inventory.read', 'Read Medication Inventory', 'pharmacy', 'read', 'medication_inventory', 'branch', 'View medication inventory', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.medication_inventory.update', 'Update Medication Inventory', 'pharmacy', 'update', 'medication_inventory', 'branch', 'Modify medication inventory', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.medication_inventory.delete', 'Delete Medication Inventory', 'pharmacy', 'delete', 'medication_inventory', 'tenant', 'Remove medication from inventory', true, true, NOW(), NOW()),

-- Drug Interaction Permissions (4)
(gen_random_uuid(), 'pharmacy.drug_interaction.create', 'Create Drug Interaction Alert', 'pharmacy', 'create', 'drug_interaction', 'tenant', 'Add drug interaction warnings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.drug_interaction.read', 'Read Drug Interaction Alert', 'pharmacy', 'read', 'drug_interaction', 'tenant', 'View drug interaction warnings', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.drug_interaction.update', 'Update Drug Interaction Alert', 'pharmacy', 'update', 'drug_interaction', 'tenant', 'Modify drug interaction rules', true, true, NOW(), NOW()),
(gen_random_uuid(), 'pharmacy.drug_interaction.delete', 'Delete Drug Interaction Alert', 'pharmacy', 'delete', 'drug_interaction', 'tenant', 'Remove drug interaction warnings', true, true, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count FROM permissions WHERE module = 'pharmacy';
    RAISE NOTICE '✓ Pharmacy: % permissions inserted', inserted_count;
END $$;
