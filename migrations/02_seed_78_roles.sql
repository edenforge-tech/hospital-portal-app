-- =====================================================
-- MIGRATION 02: SEED 78 ROLES
-- =====================================================
-- Hospital Portal - Comprehensive Role Library
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 21, 2026
-- Phase: 1 - Critical Foundation
-- 
-- Expands role library from ~20 roles to 78 roles across 18 categories
-- Covers: Platform, Hospital Leadership, HR, Finance, Clinical, 
--         Optometry, Nursing, Diagnostic, Pharmacy, Front Desk,
--         Medical Records, Operations, External, Special, System, Eye-Specific
-- =====================================================

-- =====================================================
-- CATEGORY 1: PLATFORM & SYSTEM ROLES (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Super Admin', 'SUPER ADMIN', 'Platform super administrator with full system access across all tenants', true, gen_random_uuid()::text),
(gen_random_uuid(), 'Platform Admin', 'PLATFORM ADMIN', 'Platform-level administrator for multi-tenant management', true, gen_random_uuid()::text),
(gen_random_uuid(), 'Support Engineer', 'SUPPORT ENGINEER', 'Technical support staff with limited admin access for troubleshooting', true, gen_random_uuid()::text),
(gen_random_uuid(), 'System Auditor', 'SYSTEM AUDITOR', 'Read-only access to all audit logs and compliance data across tenants', true, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 2: HOSPITAL LEADERSHIP (5 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Hospital Owner', 'HOSPITAL OWNER', 'Hospital owner with full administrative and financial control', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Chief Executive Officer', 'CHIEF EXECUTIVE OFFICER', 'CEO responsible for overall hospital operations and strategy', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Chief Medical Officer', 'CHIEF MEDICAL OFFICER', 'CMO overseeing all clinical services and medical staff', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Chief Operating Officer', 'CHIEF OPERATING OFFICER', 'COO managing day-to-day operations and workflows', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Chief Financial Officer', 'CHIEF FINANCIAL OFFICER', 'CFO responsible for financial planning and reporting', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 3: HR & ADMIN (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'HR Manager', 'HR MANAGER', 'Human resources manager for recruitment, onboarding, and employee lifecycle', false, gen_random_uuid()::text),
(gen_random_uuid(), 'HR Executive', 'HR EXECUTIVE', 'HR staff for day-to-day employee management and payroll processing', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Admin Manager', 'ADMIN MANAGER', 'Administrative manager overseeing support staff and office operations', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Compliance Officer', 'COMPLIANCE OFFICER', 'Ensures hospital compliance with HIPAA, medical regulations, and accreditation standards', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 4: FINANCE & BILLING (8 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Finance Manager', 'FINANCE MANAGER', 'Financial operations manager for accounting and budgeting', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Accountant', 'ACCOUNTANT', 'Accountant handling bookkeeping and financial reporting', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Billing Manager', 'BILLING MANAGER', 'Billing operations manager overseeing patient billing and insurance claims', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Billing Executive', 'BILLING EXECUTIVE', 'Billing staff processing invoices and payment collection', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Insurance Coordinator', 'INSURANCE COORDINATOR', 'Manages insurance verification, pre-authorization, and claims processing', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Cashier', 'CASHIER', 'Front-desk cashier handling patient payments', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Revenue Cycle Analyst', 'REVENUE CYCLE ANALYST', 'Analyzes billing data and revenue cycle performance', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Collections Specialist', 'COLLECTIONS SPECIALIST', 'Manages overdue accounts and payment collections', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 5: PATIENT COUNSELLING (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Patient Counsellor', 'PATIENT COUNSELLOR', 'Provides counselling for treatment options, costs, and pre-operative guidance', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Patient Care Coordinator', 'PATIENT CARE COORDINATOR', 'Coordinates patient appointments, follow-ups, and care navigation', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Patient Advocate', 'PATIENT ADVOCATE', 'Assists patients with grievances, insurance issues, and service quality', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Social Worker', 'SOCIAL WORKER', 'Provides social and emotional support to patients and families', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 6: CLINICAL LEADERSHIP (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Medical Director', 'MEDICAL DIRECTOR', 'Senior physician overseeing clinical quality and medical protocols', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Department Head', 'DEPARTMENT HEAD', 'Head of medical department (e.g., Surgery, Diagnostics)', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Clinical Manager', 'CLINICAL MANAGER', 'Manages clinical workflows, staffing, and quality assurance', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Infection Control Officer', 'INFECTION CONTROL OFFICER', 'Ensures infection prevention and hospital hygiene protocols', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 7: CORE EYE DOCTORS (9 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Ophthalmologist', 'OPHTHALMOLOGIST', 'General ophthalmologist for comprehensive eye care', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Cataract Surgeon', 'CATARACT SURGEON', 'Specialist surgeon for cataract surgery (phacoemulsification, IOL implantation)', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Retina Specialist', 'RETINA SPECIALIST', 'Retina surgeon for diabetic retinopathy, macular degeneration, retinal detachment', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Glaucoma Specialist', 'GLAUCOMA SPECIALIST', 'Specialist for glaucoma diagnosis and management', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Cornea Specialist', 'CORNEA SPECIALIST', 'Specialist for corneal diseases and transplants', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Pediatric Ophthalmologist', 'PEDIATRIC OPHTHALMOLOGIST', 'Eye doctor specializing in children's eye care', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Oculoplastic Surgeon', 'OCULOPLASTIC SURGEON', 'Surgeon for eyelid, orbit, and tear duct procedures', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Neuro-Ophthalmologist', 'NEURO-OPHTHALMOLOGIST', 'Specialist for neurological eye conditions', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Vitreoretinal Surgeon', 'VITREORETINAL SURGEON', 'Advanced retina surgeon for complex vitreoretinal procedures', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 8: OPTOMETRY (3 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Optometrist', 'OPTOMETRIST', 'Optometrist for vision testing and eyeglass prescriptions', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Optician', 'OPTICIAN', 'Optician for dispensing eyeglasses and contact lenses', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Contact Lens Specialist', 'CONTACT LENS SPECIALIST', 'Specialist for contact lens fittings and follow-up care', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 9: NURSING (5 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Chief Nursing Officer', 'CHIEF NURSING OFFICER', 'Senior nursing leader overseeing all nursing staff and patient care standards', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Nursing Manager', 'NURSING MANAGER', 'Nursing manager for ward/department staffing and workflows', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Registered Nurse', 'REGISTERED NURSE', 'RN providing direct patient care and treatment assistance', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Ophthalmic Nurse', 'OPHTHALMIC NURSE', 'Specialized nurse for eye surgery assistance and pre/post-operative care', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Nurse Practitioner', 'NURSE PRACTITIONER', 'Advanced practice nurse for patient assessment and minor procedures', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 10: DIAGNOSTIC & TESTING (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Diagnostic Technician', 'DIAGNOSTIC TECHNICIAN', 'Operates diagnostic equipment (OCT, visual field, fundus camera)', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Lab Technician', 'LAB TECHNICIAN', 'Laboratory technician for blood tests and pathology', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Radiology Technician', 'RADIOLOGY TECHNICIAN', 'Operates imaging equipment (X-ray, CT, MRI)', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Anesthesia Technician', 'ANESTHESIA TECHNICIAN', 'Assists anesthesiologist with equipment and patient monitoring', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 11: PHARMACY & OPTICAL (5 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Pharmacist', 'PHARMACIST', 'Licensed pharmacist for medication dispensing and counseling', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Pharmacy Technician', 'PHARMACY TECHNICIAN', 'Pharmacy assistant for inventory and prescription preparation', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Optical Manager', 'OPTICAL MANAGER', 'Manages optical store (eyeglasses, contact lenses, accessories)', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Optical Sales Executive', 'OPTICAL SALES EXECUTIVE', 'Sales staff for optical products', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Inventory Manager', 'INVENTORY MANAGER', 'Manages medical supplies, surgical equipment, and optical inventory', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 12: FRONT DESK & RECEPTION (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Front Desk Manager', 'FRONT DESK MANAGER', 'Supervises front desk staff and patient registration workflows', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Receptionist', 'RECEPTIONIST', 'Front desk receptionist for appointment booking and patient check-in', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Appointment Coordinator', 'APPOINTMENT COORDINATOR', 'Schedules and manages patient appointments across departments', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Patient Registration Clerk', 'PATIENT REGISTRATION CLERK', 'Registers new patients and updates demographic information', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 13: MEDICAL RECORDS (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Medical Records Manager', 'MEDICAL RECORDS MANAGER', 'Oversees medical records department and HIPAA compliance', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Medical Records Clerk', 'MEDICAL RECORDS CLERK', 'Manages patient records filing, retrieval, and archival', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Health Information Technician', 'HEALTH INFORMATION TECHNICIAN', 'Codes diagnoses and procedures for billing and reporting', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Transcriptionist', 'TRANSCRIPTIONIST', 'Transcribes medical dictations and clinical notes', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 14: OPERATIONS & SUPPORT (4 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Facility Manager', 'FACILITY MANAGER', 'Manages hospital facilities, maintenance, and infrastructure', false, gen_random_uuid()::text),
(gen_random_uuid(), 'IT Administrator', 'IT ADMINISTRATOR', 'Manages hospital IT systems, EHR, and network infrastructure', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Security Officer', 'SECURITY OFFICER', 'Hospital security staff for patient and asset protection', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Housekeeping Supervisor', 'HOUSEKEEPING SUPERVISOR', 'Oversees hospital cleaning and sanitation standards', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 15: EXTERNAL & PARTNERS (2 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Vendor', 'VENDOR', 'External vendor for supplies, equipment, or services', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Consultant', 'CONSULTANT', 'External consultant for audits, accreditation, or specialized advice', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 16: SPECIAL ROLES (2 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Emergency Access', 'EMERGENCY ACCESS', 'Temporary emergency access role for break-glass scenarios', true, gen_random_uuid()::text),
(gen_random_uuid(), 'Guest User', 'GUEST USER', 'Limited read-only access for demonstrations or trials', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 17: SYSTEM ROLES (2 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'API Integration', 'API INTEGRATION', 'Service account for third-party API integrations', true, gen_random_uuid()::text),
(gen_random_uuid(), 'Background Job', 'BACKGROUND JOB', 'Automated system account for scheduled tasks and batch processing', true, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- CATEGORY 18: EYE HOSPITAL SPECIFIC (7 roles)
-- =====================================================

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "Description", "IsSystemRole", "ConcurrencyStamp")
VALUES 
(gen_random_uuid(), 'Lasik Surgeon', 'LASIK SURGEON', 'Specialist for LASIK and refractive surgery procedures', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Low Vision Specialist', 'LOW VISION SPECIALIST', 'Helps patients with vision rehabilitation and assistive devices', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Orthoptist', 'ORTHOPTIST', 'Specialist for eye muscle disorders and vision therapy', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Ocular Oncologist', 'OCULAR ONCOLOGIST', 'Specialist for eye cancers and tumors', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Uveitis Specialist', 'UVEITIS SPECIALIST', 'Specialist for inflammatory eye diseases', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Genetic Counselor', 'GENETIC COUNSELOR', 'Counsels patients on hereditary eye diseases', false, gen_random_uuid()::text),
(gen_random_uuid(), 'Vision Therapist', 'VISION THERAPIST', 'Provides vision therapy for learning-related vision problems', false, gen_random_uuid()::text)
ON CONFLICT ("NormalizedName") DO NOTHING;

-- =====================================================
-- DATA VALIDATION
-- =====================================================

DO $$
DECLARE
    v_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_role_count FROM "AspNetRoles";
    
    RAISE NOTICE '✅ Total roles in system: %', v_role_count;
    
    IF v_role_count < 78 THEN
        RAISE WARNING 'Expected at least 78 roles, found %', v_role_count;
    END IF;
END $$;

-- Display role breakdown by category
SELECT 
    CASE 
        WHEN "Name" IN ('Super Admin', 'Platform Admin', 'Support Engineer', 'System Auditor') THEN 'Platform & System'
        WHEN "Name" IN ('Hospital Owner', 'Chief Executive Officer', 'Chief Medical Officer', 'Chief Operating Officer', 'Chief Financial Officer') THEN 'Hospital Leadership'
        WHEN "Name" IN ('HR Manager', 'HR Executive', 'Admin Manager', 'Compliance Officer') THEN 'HR & Admin'
        WHEN "Name" IN ('Finance Manager', 'Accountant', 'Billing Manager', 'Billing Executive', 'Insurance Coordinator', 'Cashier', 'Revenue Cycle Analyst', 'Collections Specialist') THEN 'Finance & Billing'
        WHEN "Name" IN ('Patient Counsellor', 'Patient Care Coordinator', 'Patient Advocate', 'Social Worker') THEN 'Patient Counselling'
        WHEN "Name" IN ('Medical Director', 'Department Head', 'Clinical Manager', 'Infection Control Officer') THEN 'Clinical Leadership'
        WHEN "Name" IN ('Ophthalmologist', 'Cataract Surgeon', 'Retina Specialist', 'Glaucoma Specialist', 'Cornea Specialist', 'Pediatric Ophthalmologist', 'Oculoplastic Surgeon', 'Neuro-Ophthalmologist', 'Vitreoretinal Surgeon') THEN 'Core Eye Doctors'
        WHEN "Name" IN ('Optometrist', 'Optician', 'Contact Lens Specialist') THEN 'Optometry'
        WHEN "Name" IN ('Chief Nursing Officer', 'Nursing Manager', 'Registered Nurse', 'Ophthalmic Nurse', 'Nurse Practitioner') THEN 'Nursing'
        WHEN "Name" IN ('Diagnostic Technician', 'Lab Technician', 'Radiology Technician', 'Anesthesia Technician') THEN 'Diagnostic & Testing'
        WHEN "Name" IN ('Pharmacist', 'Pharmacy Technician', 'Optical Manager', 'Optical Sales Executive', 'Inventory Manager') THEN 'Pharmacy & Optical'
        WHEN "Name" IN ('Front Desk Manager', 'Receptionist', 'Appointment Coordinator', 'Patient Registration Clerk') THEN 'Front Desk & Reception'
        WHEN "Name" IN ('Medical Records Manager', 'Medical Records Clerk', 'Health Information Technician', 'Transcriptionist') THEN 'Medical Records'
        WHEN "Name" IN ('Facility Manager', 'IT Administrator', 'Security Officer', 'Housekeeping Supervisor') THEN 'Operations & Support'
        WHEN "Name" IN ('Vendor', 'Consultant') THEN 'External & Partners'
        WHEN "Name" IN ('Emergency Access', 'Guest User') THEN 'Special Roles'
        WHEN "Name" IN ('API Integration', 'Background Job') THEN 'System Roles'
        WHEN "Name" IN ('Lasik Surgeon', 'Low Vision Specialist', 'Orthoptist', 'Ocular Oncologist', 'Uveitis Specialist', 'Genetic Counselor', 'Vision Therapist') THEN 'Eye Hospital Specific'
        ELSE 'Other'
    END AS category,
    COUNT(*) as role_count
FROM "AspNetRoles"
GROUP BY category
ORDER BY role_count DESC;

-- =====================================================
-- MIGRATION 02 COMPLETE
-- =====================================================
-- Next: 03_seed_role_permissions.sql
-- =====================================================
