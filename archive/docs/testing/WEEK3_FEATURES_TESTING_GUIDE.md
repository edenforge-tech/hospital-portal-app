# Week 3 Features - Testing Guide

## 🎯 Features Status

### ✅ Appointments Calendar - READY FOR TESTING
- **Backend**: 13 API endpoints fully implemented
- **Frontend**: Full calendar UI with FullCalendar library
- **Features**: Create, view, update, delete appointments; calendar views (month/week/day/list)

### ✅ Departments Management - READY FOR TESTING  
- **Backend**: 18 API endpoints with hierarchy support
- **Frontend**: Management page with hierarchy visualization
- **Features**: CRUD operations, hierarchy tree, staff assignment, filters

---

## 📋 Testing Checklist

### 1️⃣ Appointments Calendar

#### Access the Page
- URL: http://localhost:3000/dashboard/appointments
- Login: admin@test.com / Admin123!

#### Test Scenarios

**A. Calendar Navigation** ✅
- [ ] Switch between Month, Week, Day, and List views
- [ ] Navigate between dates using calendar controls
- [ ] Verify events display correctly in each view

**B. Create Appointment** ✅
- [ ] Click on a date in the calendar
- [ ] Fill in appointment form:
  - Patient selection
  - Doctor selection
  - Department (optional)
  - Date and time
  - Duration
  - Appointment type
  - Reason for visit
  - Notes
- [ ] Submit and verify appointment appears on calendar
- [ ] Check appointment color matches status

**C. View Appointment Details** ✅
- [ ] Click on an existing appointment event
- [ ] Verify all details display correctly
- [ ] Check patient name, doctor name, time, status

**D. Update Appointment** ✅
- [ ] Edit an existing appointment
- [ ] Change date/time by dragging event (if enabled)
- [ ] Update status (scheduled → confirmed → in-progress → completed)
- [ ] Verify changes reflect immediately

**E. Filter Appointments** ✅
- [ ] Filter by doctor
- [ ] Filter by patient
- [ ] Filter by department
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Verify filtered results are correct

**F. Cancel Appointment** ✅
- [ ] Cancel an appointment
- [ ] Verify status changes to "cancelled"
- [ ] Check it appears with red color on calendar

**G. Statistics Cards** ✅
- [ ] Verify "Today's Appointments" count
- [ ] Check "Confirmed" appointments count
- [ ] Validate "Completed" appointments count
- [ ] Review "Cancelled" appointments count

---

### 2️⃣ Departments Management

#### Access the Page
- URL: http://localhost:3000/dashboard/admin/departments
- Login: admin@test.com / Admin123!

#### Test Scenarios

**A. View Departments List** ✅
- [ ] Verify all departments load correctly
- [ ] Check department cards display:
  - Department code
  - Department name
  - Department type
  - Status badge
  - Staff count
  - Sub-departments count
- [ ] Verify hierarchy visualization (if available)

**B. Filter Departments** ✅
- [ ] Search by department name
- [ ] Filter by department type (Clinical, Administrative, Support, etc.)
- [ ] Filter by status (Active, Inactive)
- [ ] Filter by branch
- [ ] Verify search results update correctly

**C. View Department Hierarchy** ✅
- [ ] Click "View Hierarchy" button
- [ ] Expand/collapse parent departments
- [ ] Verify sub-departments display correctly
- [ ] Check indentation shows hierarchy levels

**D. Create Department** ✅
- [ ] Click "Add Department" button
- [ ] Fill in form:
  - Department code (unique)
  - Department name
  - Department type
  - Description
  - Branch selection
  - Parent department (if sub-department)
  - Department head
  - Status
- [ ] Submit and verify new department appears

**E. Edit Department** ✅
- [ ] Click edit button on a department card
- [ ] Update department details
- [ ] Change department head
- [ ] Update status
- [ ] Save and verify changes

**F. View Department Details** ✅
- [ ] Click "View Details" on a department
- [ ] Check details modal shows:
  - All department information
  - Assigned staff list
  - Sub-departments list
  - Department metrics (if available)

**G. Department Staff Management** ✅
- [ ] View staff assigned to department
- [ ] Add new staff member to department
- [ ] Remove staff from department
- [ ] Verify staff count updates

**H. Standard Departments** ✅
- [ ] Check if 78 standard departments exist
- [ ] Verify they cannot be deleted (if protected)
- [ ] Confirm they can be edited

---

## 🔧 API Endpoints Reference

### Appointments Controller (13 endpoints)

```http
GET    /api/appointments                          # Get all appointments with filters
GET    /api/appointments/{id}                     # Get appointment by ID
GET    /api/appointments/doctor/{doctorId}        # Get doctor's appointments
GET    /api/appointments/patient/{patientId}      # Get patient's appointments
GET    /api/appointments/calendar                 # Get calendar data
POST   /api/appointments                          # Create new appointment
PUT    /api/appointments/{id}                     # Update appointment
PUT    /api/appointments/{id}/status              # Update appointment status
DELETE /api/appointments/{id}                     # Cancel/Delete appointment
GET    /api/appointments/availability             # Check doctor availability
GET    /api/appointments/stats/today              # Get today's statistics
GET    /api/appointments/upcoming                 # Get upcoming appointments
POST   /api/appointments/bulk                     # Bulk create appointments
```

### Departments Controller (18 endpoints)

```http
GET    /api/departments                           # Get all departments
GET    /api/departments/{id}                      # Get department by ID
GET    /api/departments/with-staff-count          # Get departments with staff count
GET    /api/departments/hierarchy                 # Get full hierarchy
GET    /api/departments/{id}/hierarchy            # Get department subtree
GET    /api/departments/{id}/staff                # Get department staff
GET    /api/departments/{id}/sub-departments      # Get sub-departments
GET    /api/departments/types                     # Get department types
POST   /api/departments                           # Create department
PUT    /api/departments/{id}                      # Update department
PUT    /api/departments/{id}/status               # Update status
DELETE /api/departments/{id}                      # Delete department (soft)
POST   /api/departments/{id}/staff/{userId}       # Assign staff
DELETE /api/departments/{id}/staff/{userId}       # Remove staff
POST   /api/departments/bulk                      # Bulk create departments
GET    /api/departments/metrics                   # Get department metrics
GET    /api/departments/search                    # Advanced search
POST   /api/departments/validate-code             # Validate department code
```

---

## 🧪 Test Data

### Sample Appointment Data
```json
{
  "patientId": "guid-here",
  "doctorId": "guid-here",
  "appointmentDate": "2026-01-22",
  "startTime": "09:00",
  "duration": 30,
  "appointmentType": "Consultation",
  "reasonForVisit": "Regular checkup",
  "notes": "Patient has history of diabetes"
}
```

### Sample Department Data
```json
{
  "departmentCode": "CARDIO",
  "departmentName": "Cardiology Department",
  "departmentType": "Clinical",
  "description": "Cardiac care and treatment",
  "branchId": "guid-here",
  "status": "Active"
}
```

---

## ⚠️ Known Issues & Limitations

### Appointments
- [ ] Drag-and-drop rescheduling (if not implemented)
- [ ] Recurring appointments (if not implemented)
- [ ] Email/SMS notifications (backend only, no UI)
- [ ] Doctor availability checking (API exists, UI integration pending)

### Departments
- [ ] Department budget tracking (fields exist, UI may be incomplete)
- [ ] Operating hours management (field exists, needs UI)
- [ ] Department performance metrics (API exists, UI pending)
- [ ] Approval workflow configuration (field exists, needs implementation)

---

## 🐛 Troubleshooting

### Calendar Not Loading
1. Check browser console for errors (F12)
2. Verify backend is running: http://localhost:5073/api/appointments
3. Check tenant ID is set in auth store
4. Confirm user has `appointment.view` permission

### Departments Not Displaying
1. Check if 78 standard departments exist in database
2. Verify API response: http://localhost:5073/api/departments
3. Check filters aren't excluding all departments
4. Confirm user has `department.view` permission (currently disabled)

### Permission Errors
- Appointments require: `appointment.view`, `appointment.create`, `appointment.edit`, `appointment.delete`
- Departments require: `department.view`, `department.create`, `department.edit`, `department.delete`
- Admin user should have all permissions

---

## ✅ Success Criteria

### Appointments Calendar
- [ ] All 4 calendar views work correctly
- [ ] Can create appointments successfully
- [ ] Can view appointment details
- [ ] Can update appointment status
- [ ] Can cancel appointments
- [ ] Filters work correctly
- [ ] Statistics cards show accurate counts

### Departments Management
- [ ] All 78 departments display correctly
- [ ] Hierarchy view shows parent-child relationships
- [ ] Can create new departments
- [ ] Can edit existing departments
- [ ] Can assign staff to departments
- [ ] Filters and search work correctly
- [ ] Department details modal shows all information

---

## 📊 Next Steps After Testing

### If Issues Found:
1. Document specific error messages
2. Note steps to reproduce
3. Check browser console logs
4. Share screenshots if UI issues

### If Everything Works:
1. ✅ Mark Appointments Calendar as complete
2. ✅ Mark Departments Management as complete
3. 🎯 Move to next Week 3 features:
   - Roles & Permissions UI enhancement
   - Organizations Management
   - Patients Management
   - Document Sharing
   - Bulk Operations

---

## 🎨 UI/UX Enhancements (Optional)

### Appointments
- [ ] Add color-coded appointment types
- [ ] Show doctor availability indicators
- [ ] Add appointment reminder badges
- [ ] Include patient photos in calendar events
- [ ] Add quick actions (confirm, cancel) on event click

### Departments
- [ ] Add department icons based on type
- [ ] Show department capacity utilization
- [ ] Add drag-and-drop for hierarchy reorganization
- [ ] Include department performance charts
- [ ] Add quick staff assignment widget

---

**Testing Environment**:
- Backend: http://localhost:5073
- Frontend: http://localhost:3000
- Swagger: http://localhost:5073/swagger
- Credentials: admin@test.com / Admin123!
- Tenant: 155fe198-6ae5-4a01-9254-ead5b427247e
