# 🏥 Roles vs Departments - Management Guide

## 📋 Quick Summary

| Aspect | **ROLES** | **DEPARTMENTS** |
|--------|-----------|-----------------|
| **What** | Job title/function | Physical/organizational unit |
| **Purpose** | System permissions (WHAT you can DO) | Data access boundary (WHERE you work) |
| **Examples** | Doctor, Nurse, Counsellor, Pharmacist | OPD-General, Cataract, Lab, Pharmacy |
| **Scope** | System-wide capabilities | Patient/data visibility |
| **Controls** | Feature access, CRUD permissions | Which records you see |

---

## 🎭 ROLES - "What You Are"

### Definition
A **Role** is your job function that determines your **system permissions**.

### Examples
- **Doctor** - Can diagnose, prescribe, view clinical data
- **Nurse** - Can update vitals, administer medications
- **Counsellor** - Can conduct sessions, view mental health records
- **Receptionist** - Can register patients, schedule appointments
- **Lab Technician** - Can view lab orders, upload results
- **Pharmacist** - Can dispense medications, view prescriptions

### Key Points
✅ **One user can have multiple roles** (e.g., Senior Doctor + Consultant)  
✅ **Roles grant permissions** like `patient.view`, `appointment.create`, `prescription.write`  
✅ **Roles are hospital-wide** - not tied to specific departments  
✅ **Roles determine UI features** - what menus/buttons you see

### How to Manage
1. **Create Role**: Admin Dashboard → Roles → Create New Role
2. **Assign Permissions**: Select which actions the role can perform
3. **Assign to User**: User Management → Edit User → Add Role

---

## 🏢 DEPARTMENTS - "Where You Work"

### Definition
A **Department** is a physical/organizational division that determines **which data you can access**.

### Examples
- **OPD-General** - General Outpatient Department
- **Cataract** - Cataract surgery and treatment unit
- **Glaucoma** - Glaucoma specialty department
- **Laboratory** - Diagnostic lab services
- **Pharmacy** - Medication dispensing
- **Radiology** - Imaging department

### Key Points
✅ **One user can work in multiple departments** (e.g., Doctor in both Cataract and Glaucoma)  
✅ **Departments limit data visibility** - you only see patients assigned to your department(s)  
✅ **Primary department** - main department where you spend most time  
✅ **Departments enable Row-Level Security (RLS)** - automatic data filtering

### How to Manage
1. **Create Department**: Admin Dashboard → Departments → Create New
2. **Assign Users**: User Management → Edit User → Manage Department Access
3. **Set Primary**: Mark one department as primary for each user

---

## 🔐 How They Work Together (Hybrid RBAC + ABAC)

### Example 1: Doctor in Cataract Department
```
User: Dr. Sarah
Role: Doctor → Permissions: patient.view, patient.edit, prescription.write
Department: Cataract → Data: Only Cataract patients

Result: Dr. Sarah can edit patient records (role permission) 
        BUT only for Cataract patients (department boundary)
```

### Example 2: Nurse in Multiple Departments
```
User: Nurse John
Role: Nurse → Permissions: patient.view, vitals.update
Departments: OPD-General, Cataract → Data: Patients from both departments

Result: Nurse John can update vitals (role permission)
        for patients in BOTH OPD-General AND Cataract (multi-department access)
```

### Example 3: Counsellor with Specific Access
```
User: Emma Thompson
Role: Counsellor → Permissions: mental_health.view, session.create
Department: Psychology → Data: Only Psychology department records

Result: Emma can conduct counselling sessions (role permission)
        but only see patients referred to Psychology (department boundary)
```

---

## 🛠️ Management Workflow

### Adding a New Staff Member

#### Step 1: Create User Account
```
User Management → Create User
- Name: Dr. Michael Chen
- Email: mchen@hospital.com
- Phone: +1234567890
```

#### Step 2: Assign Role(s)
```
User Management → Edit User → Roles Tab
- Select: Doctor
- (Optional) Add: Senior Doctor, Consultant
```

#### Step 3: Assign Department(s)
```
User Management → Edit User → Manage Department Access
- Add: Cataract (Primary)
- Add: Glaucoma (Secondary)
```

#### Step 4: Assign Branch
```
User Management → Edit User → Branch Assignment
- Select: Main Branch
```

### Result
```
✅ Dr. Michael Chen can now:
- Access doctor features (from Doctor role)
- View/edit patient records (from role permissions)
- See ONLY Cataract and Glaucoma patients (from department assignment)
- Work at Main Branch location
```

---

## 📊 Current System Status

### Roles Created (20 total)
- ✅ Admin
- ✅ Doctor
- ✅ Nurse
- ✅ **Counsellor** (newly added!)
- ✅ Receptionist
- ✅ Lab Technician
- ✅ Pharmacist
- ✅ Radiologist
- ✅ Billing Clerk
- ✅ IT Administrator
- ✅ Medical Records Officer
- ✅ Security Officer
- ✅ Housekeeping Supervisor
- ✅ Maintenance Technician
- ✅ Senior Doctor
- ✅ Senior Nurse
- ✅ Nurse Manager
- ✅ Lab Manager
- ✅ Pharmacy Manager
- ✅ Consultant
- ✅ Radiology Technician

### Departments Created (77 total)
- **OPD Departments**: OPD-General, OPD-Pediatrics, etc.
- **Clinical Specialties**: Cataract, Glaucoma, Retina, Cornea, etc.
- **Diagnostic**: Laboratory (5 types), Radiology
- **Support**: Pharmacy, Optical, Admin

### Users Created (81 total)
- 14 Nurses
- 13 Receptionists
- 10 Doctors
- 5 Billing Clerks
- **4 Counsellors** (newly added!)
- 4 Radiology Technicians
- 3 each: Consultant, Maintenance Tech, Medical Records, Radiologist, Security, Senior Nurse
- 2 each: Housekeeping, IT Admin, Lab Manager, Nurse Manager, Pharmacy Manager, Senior Doctor

---

## 🎯 Best Practices

### ✅ DO
- Assign roles based on job function
- Assign departments based on where they physically work
- Use primary department for main workspace
- Give minimum necessary permissions (principle of least privilege)
- Review and update access quarterly

### ❌ DON'T
- Give admin role to regular staff
- Assign all departments to everyone (breaks data isolation)
- Mix up roles and departments (they serve different purposes)
- Leave inactive users with active access

---

## 🔧 Troubleshooting

### "User can't see any patients"
**Cause**: No department assigned  
**Fix**: User Management → Edit User → Manage Department Access → Add departments

### "User sees too many patients"
**Cause**: Assigned to too many departments  
**Fix**: Remove unnecessary department assignments

### "User can't perform action"
**Cause**: Role doesn't have permission  
**Fix**: Admin Dashboard → Roles → Edit Role → Add missing permission

### "User sees patients from other departments"
**Cause**: Row-Level Security (RLS) not applied or department filter not working  
**Fix**: Check database RLS policies are enabled

---

## 📞 Need Help?

- **User Access Issues**: Check both Role (permissions) AND Department (data access)
- **Missing Features**: Check Role permissions
- **Wrong Data Visible**: Check Department assignments
- **System Errors**: Contact IT Administrator

---

**Last Updated**: December 9, 2025  
**System Version**: Hospital Portal v1.0  
**Database**: PostgreSQL 17.6 with Row-Level Security
