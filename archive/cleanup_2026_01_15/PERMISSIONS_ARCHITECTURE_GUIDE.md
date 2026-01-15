# Permissions Architecture Guide - Hospital Portal

## Executive Summary

Your hospital portal uses **HYBRID RBAC + ABAC** security architecture. Understanding the difference between **Modules** and **Departments** is crucial:

- **MODULES** = **WHAT** users can do (functional permissions)
- **DEPARTMENTS** = **WHERE** users can do it (data access scope)

## Current System Architecture

### 1. Module-Based Permissions (RBAC - Role-Based Access Control)

**Purpose**: Define functional capabilities across the application

**12 Modules in Your System:**
1. Administration - User management, system configuration
2. Ambulance - Ambulance trip management
3. Appointments - Appointment scheduling and management
4. Bed Management - Bed allocation and tracking
5. Clinical Assessment - Patient clinical data
6. Inventory - Stock and supplies management
7. OT Management - Operating theater management
8. Patient Management - Patient records and demographics
9. Pharmacy - Medication management
10. Quality Assurance - Quality control and audits
11. Radiology - Imaging and radiology services
12. System Settings - Application configuration

**Permission Structure:**
```
Module.Resource.Action
├── Administration.Users.View
├── Administration.Users.Create
├── Administration.Users.Edit
├── Appointments.Schedule.Create
├── Patient Management.Records.View
└── Pharmacy.Medications.Dispense
```

### 2. Department-Based Access (ABAC - Attribute-Based Access Control)

**Purpose**: Control which organizational unit's data users can access

**14 Main Departments:**
1. Cardiology
2. Emergency Medicine
3. General Surgery
4. Internal Medicine
5. Neurology
6. Obstetrics & Gynecology
7. Oncology
8. Orthopedics
9. Pediatrics
10. Psychiatry
11. Pulmonology
12. Radiology Department
13. Rehabilitation
14. Urology

**Plus 75+ Sub-Departments** (e.g., Cardiology → Interventional Cardiology, Pediatric Cardiology, etc.)

**Access Levels:**
- **Own Department Only** - Can only see/modify data from their assigned department
- **Multiple Departments** - Access to specific departments
- **All Departments** - Hospital-wide access (admin, senior management)

## How They Work Together

### Example Scenarios:

**Scenario 1: Emergency Doctor**
- **Role**: Doctor
- **Department**: Emergency Medicine
- **Permissions** (RBAC - Module-based):
  - ✅ Patient Management.Records.View
  - ✅ Patient Management.Records.Create
  - ✅ Clinical Assessment.Vitals.View
  - ✅ Clinical Assessment.Diagnosis.Create
  - ✅ Appointments.Schedule.View
  - ❌ Administration.Users.Create (not allowed)
  
- **Department Access** (ABAC):
  - ✅ Can see patients in **Emergency Medicine** department only
  - ❌ Cannot see Cardiology department patients
  - ❌ Cannot see Pediatrics department patients

**Scenario 2: System Administrator**
- **Role**: Admin
- **Department**: Administration (or None)
- **Permissions** (RBAC - Module-based):
  - ✅ Administration.Users.* (all actions)
  - ✅ Administration.Roles.* (all actions)
  - ✅ System Settings.* (all actions)
  - ✅ All modules (full access)
  
- **Department Access** (ABAC):
  - ✅ **All Departments** - can manage users across entire hospital

**Scenario 3: Cardiology Nurse**
- **Role**: Nurse
- **Department**: Cardiology
- **Permissions** (RBAC - Module-based):
  - ✅ Patient Management.Records.View
  - ✅ Clinical Assessment.Vitals.Record
  - ✅ Bed Management.Assignments.View
  - ✅ Appointments.Schedule.View
  - ❌ Clinical Assessment.Diagnosis.Create (doctors only)
  - ❌ Pharmacy.Medications.Dispense (pharmacists only)
  
- **Department Access** (ABAC):
  - ✅ Can see patients in **Cardiology** department only

## Recommended UI/UX Design

### Page 1: Permissions Management (Current Page - Needs Enhancement)

**Purpose**: Assign MODULE permissions to ROLES

**Current State**: ✅ Correct concept, needs better UX

**Improvements Needed:**

1. **Add Info Banner** at top:
```
ℹ️ Module Permissions define WHAT users can do in the system (functional capabilities).
   For controlling WHICH department's data users can access, go to User Management → Department Access.
```

2. **Enhance Module Filter** (keep as-is, but add tooltip):
```
Module: [Dropdown: All Modules ▼]  ℹ️
Tooltip: "Modules represent functional areas of the application (e.g., Appointments, Patient Management)"
```

3. **Add Permission Description Column**:
```
PERMISSION                    | DESCRIPTION                                      | ADMIN | DOCTOR | NURSE
admin.users.view             | View user accounts and profiles                  |  ✓    |   -    |   -
appointments.schedule.create | Create new patient appointments                   |  ✓    |   ✓    |   ✓
clinical.diagnosis.create    | Document patient diagnoses                        |  ✓    |   ✓    |   -
pharmacy.medications.dispense| Dispense medications to patients                  |  ✓    |   -    |   -
```

4. **Add Scope Indicator** (for each permission):
```
Permission Scope:
- 🏥 Hospital-wide (affects all departments)
- 🏢 Department-level (limited to user's department)
- 👤 User-level (own records only)
```

### Page 2: Department Access Management (NEW - Needs to be Created)

**Purpose**: Control which department's data each USER can access

**Location**: User Management → Department Access (or separate "Department Access" menu item)

**UI Design:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Department Access Management                                     │
│ Control which departments' data each user can access             │
├─────────────────────────────────────────────────────────────────┤
│ User: Dr. Sarah Johnson [Change User]                           │
│ Role: Doctor                                                     │
│ Primary Department: Cardiology                                   │
├─────────────────────────────────────────────────────────────────┤
│ Access Level:                                                    │
│  ○ Own Department Only (Cardiology)                             │
│  ● Multiple Departments (Select below)                           │
│  ○ All Departments (Hospital-wide)                              │
├─────────────────────────────────────────────────────────────────┤
│ Selected Departments:                                            │
│  ✓ Cardiology (Primary)                                         │
│  ✓ Emergency Medicine                                            │
│  □ General Surgery                                               │
│  □ Internal Medicine                                             │
│  □ Neurology                                                     │
│  ...                                                             │
│                                                                  │
│ Sub-Departments (within selected departments):                   │
│  Cardiology:                                                     │
│    ✓ Interventional Cardiology                                  │
│    ✓ Pediatric Cardiology                                       │
│    □ Electrophysiology                                          │
│                                                                  │
│  Emergency Medicine:                                             │
│    ✓ Trauma Unit                                                │
│    ✓ Critical Care                                              │
└─────────────────────────────────────────────────────────────────┘
[Save Department Access]  [Cancel]
```

### Page 3: Combined View (For Administrators)

**Purpose**: See both permissions AND department access in one place

```
┌─────────────────────────────────────────────────────────────────┐
│ User: Dr. Sarah Johnson                                          │
├─────────────────────────────────────────────────────────────────┤
│ Role Permissions (WHAT she can do):                             │
│   ✓ View patient records                                        │
│   ✓ Create diagnoses                                            │
│   ✓ Order lab tests                                             │
│   ✓ Prescribe medications                                       │
│   ✗ Manage users (admin only)                                   │
│   ✗ Configure system (admin only)                               │
├─────────────────────────────────────────────────────────────────┤
│ Department Access (WHERE she can do it):                        │
│   ✓ Cardiology (Primary)                                        │
│   ✓ Emergency Medicine                                           │
│   Total: 2 departments, 5 sub-departments                       │
├─────────────────────────────────────────────────────────────────┤
│ Effective Access:                                                │
│   "Dr. Sarah Johnson can VIEW, CREATE, and MANAGE patient       │
│   records, diagnoses, and prescriptions for patients in the     │
│   Cardiology and Emergency Medicine departments only."          │
└─────────────────────────────────────────────────────────────────┘
```

## Database Implementation

### Current Tables (Already Exist):

1. **permissions** - Defines all available permissions
   - Module, Resource, Action, Scope
   - Example: Module="Patient Management", Resource="Records", Action="View"

2. **app_roles** - Defines roles
   - Example: Admin, Doctor, Nurse, Receptionist

3. **role_permissions** - Maps permissions to roles (RBAC)
   - role_id → permission_id

4. **department** - Defines organizational structure
   - 14 main departments + 75 sub-departments

5. **user_department_access** (CHECK IF EXISTS) - Maps users to departments (ABAC)
   - user_id → department_id
   - access_level (read, write, admin)

### Query to Check if user_department_access exists:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%department%access%';
```

## Best Practices for Your Application

### 1. **Modules Should NOT Change**
- Modules are functional areas of your application
- They map to your software architecture
- Examples: Appointments, Patient Management, Pharmacy
- **Do NOT confuse with departments**

### 2. **Departments CAN Change**
- Hospitals add/remove/reorganize departments
- Sub-departments can be created/modified
- This is organizational structure, not application structure

### 3. **Permission Assignment Flow**

```
Step 1: Define Role
├── "Doctor" role created

Step 2: Assign Module Permissions to Role
├── ✓ Patient Management.*
├── ✓ Clinical Assessment.*
├── ✓ Appointments.Schedule.*
└── ✗ Administration.Users.* (denied)

Step 3: Assign User to Role
├── Dr. Sarah → "Doctor" role
└── (Inherits all Doctor permissions)

Step 4: Assign Department Access to User
├── Dr. Sarah → Cardiology (primary)
└── Dr. Sarah → Emergency Medicine (secondary)

Result: Dr. Sarah can perform all Doctor-role actions
        but ONLY on data from Cardiology and Emergency Medicine departments
```

### 4. **Row-Level Security (RLS) Implementation**

Your PostgreSQL database enforces this automatically:

```sql
-- Every query automatically filters by department
SELECT * FROM patients 
WHERE department_id IN (
  SELECT department_id 
  FROM user_department_access 
  WHERE user_id = current_user_id()
);
```

## Common Scenarios

### Scenario: "I want to give a receptionist access to ALL departments"

**Wrong Approach**: Assign permissions for each department
**Correct Approach**:
1. Keep Module permissions (Reception role with limited permissions)
2. Set Department Access = "All Departments"

Result: Receptionist can create appointments (permission) for any department (access)

### Scenario: "I want doctors to ONLY see their own department's patients"

**Wrong Approach**: Create separate permissions per department
**Correct Approach**:
1. Assign Doctor role (module permissions for patient management)
2. Set Department Access = "Own Department Only"
3. Assign user's primary department

Result: Doctor can view/edit patients (permission) but only from their own department (access)

### Scenario: "Department head needs to see all sub-departments"

**Wrong Approach**: Manually add each sub-department
**Correct Approach**:
1. Assign department head role
2. Set Department Access to main department
3. Enable "Include Sub-Departments" option

Result: Access cascades to all sub-departments automatically

## Implementation Checklist

### Phase 1: Fix Current Permissions Page ✅
- [x] Module filter is correct (keep as-is)
- [ ] Add info banner explaining module vs department
- [ ] Add permission descriptions
- [ ] Add scope indicators
- [ ] Add tooltips

### Phase 2: Create Department Access Page ❌
- [ ] Create new page: /dashboard/admin/department-access
- [ ] User selector dropdown
- [ ] Access level radio buttons
- [ ] Department checkbox tree (main + sub)
- [ ] Save/cancel buttons
- [ ] API endpoints for department access

### Phase 3: Database Verification ❌
- [ ] Verify user_department_access table exists
- [ ] Create if missing
- [ ] Add RLS policies for department filtering
- [ ] Test queries with department context

### Phase 4: Combined View (Optional) ❌
- [ ] Add "View Effective Access" button on user profile
- [ ] Show combined permissions + department access
- [ ] Display in human-readable format

## Conclusion

**Your current UI is CORRECT** - Modules should remain as-is. They represent application functionality.

**What needs to be added**: A SEPARATE page for Department Access management.

**Key Takeaway**: 
- **Permissions Page** = Assign functional capabilities to ROLES (module-based)
- **Department Access Page** = Assign data access scope to USERS (department-based)
- Together they provide comprehensive security control

Would you like me to:
1. Create the Department Access management page?
2. Enhance the current Permissions page with better UX?
3. Verify the database schema for department access?
4. Create API endpoints for department access management?
