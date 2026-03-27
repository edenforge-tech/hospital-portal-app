# Hospital Portal - Comprehensive Testing Guide

## 📊 System Status Overview

### Backend (162 Endpoints)
- ✅ **Phase 1**: Core Infrastructure (100% - Tenants, Branches, Users, Roles, Permissions)
- ✅ **Phase 2**: Clinical Operations (100% - Patients, Appointments, Visits, Examinations)
- ✅ **Phase 3**: Billing & Finance (100% - OPD Bills, Payments, Itemized Billing)
- ✅ **Phase 4**: Advanced Features (100% - Bulk Operations, Licenses, Audit Logs)
- ✅ **OPD Workflow**: Phase 1 Gates (100% - Days 1-10 Complete)

### Frontend (~40% Complete)
- ✅ Authentication & Authorization
- ✅ Dashboard
- ✅ Patient Management
- ✅ Appointments (Calendar, Booking)
- ✅ OPD Workflow (Check-in, Billing, Tokens)
- ⏳ Clinical Examinations (Partial)
- ⏳ Diagnostic Tests (Partial)
- ⏳ Admin Panels (Users, Roles - Partial)

### Database (96 Tables)
- ✅ HIPAA Compliant (10/10 score)
- ✅ Row-Level Security (RLS) enabled
- ✅ Audit trails (28 triggers)
- ✅ Soft delete (deleted_at)
- ✅ Multi-tenant isolation

## 🚀 Start Servers

### Terminal 1: Backend
```powershell
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
dotnet run
# Wait for: "Now listening on: http://localhost:5073"
```

### Terminal 2: Frontend
```powershell
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web"
pnpm dev
# Wait for: "✓ Ready in 3.2s"
```

## 🔗 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5073/swagger
- **Swagger UI**: http://localhost:5073/swagger/index.html
- **Login Credentials**: 
  - Admin: `admin@hospital.com` / Your password
  - Front Desk: `frontdesk@hospital.com` / Your password
  - Doctor: `doctor@hospital.com` / Your password

## 📋 Module-by-Module Testing

### Module 1: Authentication & Authorization (5 minutes)

#### 1.1 Login & Session Management
**URL**: http://localhost:3000/login

**Test Steps**:
1. Enter credentials → Click "Login"
2. ✅ **Verify**: Redirected to dashboard
3. ✅ **Verify**: User info displayed in header
4. ✅ **Verify**: Tenant context set (check header badge)
5. Click user menu → "Logout"
6. ✅ **Verify**: Redirected to login page
7. Try accessing dashboard directly
8. ✅ **Verify**: Redirected back to login

**Test Cases**:
- [ ] Valid login succeeds
- [ ] Invalid credentials show error
- [ ] Logout clears session
- [ ] Protected routes require auth
- [ ] JWT token stored in localStorage
- [ ] Tenant ID in API headers

#### 1.2 Role-Based Access Control (RBAC)
**Test with Different User Roles**:

**System Administrator**:
- [ ] Can access all admin panels
- [ ] Can manage tenants
- [ ] Can manage users across tenants
- [ ] Can view all audit logs

**Hospital Administrator**:
- [ ] Can manage own tenant users
- [ ] Can manage branches/departments
- [ ] Cannot access other tenants
- [ ] Can view tenant audit logs

**Front Desk**:
- [ ] Can check-in patients
- [ ] Can book appointments
- [ ] Cannot access admin panels
- [ ] Cannot view audit logs

**Doctor**:
- [ ] Can view assigned appointments
- [ ] Can complete examinations
- [ ] Cannot manage users
- [ ] Cannot access billing (unless permitted)

### Module 2: Tenant & Multi-Tenancy (10 minutes)

#### 2.1 Tenant Management
**URL**: http://localhost:3000/dashboard/admin/tenants

**Test Steps**:
1. Navigate to Tenants page
2. Click "Create Tenant" button
3. Fill form:
   - Name: "Test Hospital"
   - Code: "TEST001"
   - Contact: "admin@test.com"
   - Phone: "+1234567890"
   - License Type: "Premium"
4. Submit → ✅ **Verify**: Tenant created
5. Click tenant → View details
6. Edit tenant information
7. ✅ **Verify**: Updates saved

**Test Cases**:
- [ ] Create new tenant
- [ ] Update tenant details
- [ ] Cannot delete tenant with data
- [ ] Soft delete works
- [ ] Tenant code unique validation
- [ ] License type enforcement

#### 2.2 Row-Level Security (RLS)
**Database Test**:
```sql
-- Set tenant context
SET app.current_tenant_id = 'tenant-1-uuid';

-- Query should only return tenant-1 data
SELECT * FROM patients;
SELECT * FROM appointments;
SELECT * FROM opd_bills;

-- Switch tenant
SET app.current_tenant_id = 'tenant-2-uuid';

-- Should return different data
SELECT * FROM patients;
```

**Test Cases**:
- [ ] RLS policies active on all tables
- [ ] Data isolated by tenant
- [ ] Cannot access other tenant data
- [ ] API enforces tenant isolation
- [ ] Tenant switch updates context

### Module 3: User Management (8 minutes)

#### 3.1 User CRUD Operations
**URL**: http://localhost:3000/dashboard/admin/users

**Test Steps**:
1. Click "Create User"
2. Fill form:
   - Email: "newuser@hospital.com"
   - First Name: "John"
   - Last Name: "Doe"
   - Role: "Doctor"
   - Department: Select from dropdown
   - Phone: "+1234567890"
3. Submit → ✅ **Verify**: User created
4. ✅ **Verify**: Welcome email sent (check logs)
5. Edit user → Change role to "Front Desk"
6. ✅ **Verify**: Role updated
7. Deactivate user
8. ✅ **Verify**: User cannot login

**Test Cases**:
- [ ] Create user with all fields
- [ ] Email uniqueness validated
- [ ] Password meets complexity (12 chars, upper, lower, digit, symbol)
- [ ] User assigned to correct tenant
- [ ] Role assignment works
- [ ] Department assignment works
- [ ] User search/filter works

#### 3.2 Password Management
**Test Steps**:
1. Click user → "Reset Password"
2. ✅ **Verify**: Reset link generated
3. User clicks reset link
4. Enter new password (12+ chars, complex)
5. ✅ **Verify**: Password updated
6. Login with new password
7. ✅ **Verify**: Login succeeds

**Test Cases**:
- [ ] Password reset link expires after 24h
- [ ] Password complexity enforced
- [ ] Old password cannot be reused
- [ ] Failed login attempts tracked

### Module 4: Roles & Permissions (10 minutes)

#### 4.1 Role Management
**URL**: http://localhost:3000/dashboard/admin/roles

**Test Steps**:
1. Click "Create Role"
2. Fill form:
   - Name: "Billing Manager"
   - Description: "Manages all billing operations"
   - Hierarchy Level: 4
3. ✅ **Verify**: Role created
4. Click role → "Assign Permissions"
5. Search "billing"
6. Select permissions:
   - billing.opd_bills.create
   - billing.opd_bills.read
   - billing.opd_bills.update
   - billing.payments.create
   - billing.payments.read
7. Save → ✅ **Verify**: Permissions assigned

**Test Cases**:
- [ ] Create custom role
- [ ] Assign permissions to role
- [ ] Remove permissions from role
- [ ] Role hierarchy enforced
- [ ] Preset roles cannot be deleted
- [ ] Role search/filter works

#### 4.2 Permission Testing
**Test with Custom Role**:
1. Assign user to "Billing Manager" role
2. Login as that user
3. ✅ **Verify**: Can access billing pages
4. Try accessing patient management
5. ✅ **Verify**: Access denied (no permission)
6. Try creating appointment
7. ✅ **Verify**: Access denied

**Test Cases**:
- [ ] Permissions grant specific access
- [ ] Missing permissions deny access
- [ ] API returns 403 for unauthorized
- [ ] Frontend hides unauthorized UI
- [ ] Granular permissions work (create vs read)

### Module 5: Patient Management (12 minutes)

#### 5.1 Patient Registration
**URL**: http://localhost:3000/dashboard/patients

**Test Steps**:
1. Click "Register New Patient"
2. Fill form:
   - First Name: "Jane"
   - Last Name: "Smith"
   - Date of Birth: "1990-01-15"
   - Gender: "Female"
   - Phone: "+9876543210"
   - Email: "jane.smith@email.com"
   - Address: "123 Main St"
   - Emergency Contact: "John Smith, +1234567890"
3. Submit → ✅ **Verify**: Patient created
4. ✅ **Verify**: MRN auto-generated (e.g., "MRN-000123")
5. View patient details
6. ✅ **Verify**: All data saved correctly

**Test Cases**:
- [ ] MRN auto-generation
- [ ] MRN uniqueness per tenant
- [ ] All required fields validated
- [ ] Phone number format validated
- [ ] Email format validated
- [ ] Age calculated from DOB
- [ ] Patient search by MRN/name/phone

#### 5.2 Patient Search & Filter
**Test Steps**:
1. Use search bar: Enter "Jane"
2. ✅ **Verify**: Matching patients shown
3. Search by MRN
4. ✅ **Verify**: Exact match found
5. Search by phone number
6. ✅ **Verify**: Patient found
7. Use filters:
   - Gender: Female
   - Age Range: 30-40
   - Status: Active
8. ✅ **Verify**: Filtered results correct

**Test Cases**:
- [ ] Search by name (partial match)
- [ ] Search by MRN (exact match)
- [ ] Search by phone
- [ ] Filter by gender
- [ ] Filter by age range
- [ ] Filter by status
- [ ] Pagination works (>10 patients)

#### 5.3 Patient Demographics Update
**Test Steps**:
1. Click patient → "Edit"
2. Update phone number
3. Update address
4. Add insurance information
5. Save → ✅ **Verify**: Updates saved
6. View patient history
7. ✅ **Verify**: Change logged in audit trail

**Test Cases**:
- [ ] Update personal information
- [ ] Add/update insurance
- [ ] Add/update emergency contact
- [ ] Photo upload works
- [ ] Changes tracked in audit log
- [ ] Updated timestamp recorded

### Module 6: Appointments (15 minutes)

#### 6.1 Appointment Booking
**URL**: http://localhost:3000/dashboard/appointments

**Test Steps**:
1. Click "New Appointment"
2. Select patient (search or create new)
3. Select doctor from dropdown
4. Select date (future date)
5. ✅ **Verify**: Available slots displayed
6. Select time slot (e.g., 10:00 AM)
7. Select appointment type: "Consultation"
8. Enter reason: "Eye checkup"
9. Set priority: "Normal"
10. Submit → ✅ **Verify**: Appointment created
11. ✅ **Verify**: Confirmation shown with appointment ID

**Test Cases**:
- [ ] Slot availability shown
- [ ] Cannot book past dates
- [ ] Cannot double-book same slot
- [ ] Appointment type required
- [ ] Duration defaults to 15 minutes
- [ ] Appointment ID generated
- [ ] Calendar view updates

#### 6.2 Slot Availability & Conflicts (Day 9)
**Test Steps**:
1. Select doctor with existing appointments
2. Select date with booked slots
3. ✅ **Verify**: Green slots = available
4. ✅ **Verify**: Gray slots = booked (disabled)
5. ✅ **Verify**: Break times shown
6. Click available slot
7. ✅ **Verify**: Slot turns blue (selected)
8. ✅ **Verify**: Countdown timer: 5:00
9. Wait 30 seconds
10. ✅ **Verify**: Auto-refresh updates availability
11. Create another booking same slot (different browser)
12. ✅ **Verify**: Conflict detected
13. ✅ **Verify**: Suggested alternatives shown

**Test Cases**:
- [ ] Real-time slot updates (30s)
- [ ] Slot reservation timeout (5 min)
- [ ] Conflict detection works
- [ ] Suggested alternatives generated
- [ ] Multiple conflict types shown
- [ ] Manual refresh button works
- [ ] Last updated timestamp accurate

#### 6.3 Walk-In Appointments (Day 9)
**Test Steps**:
1. Click "Walk-In Appointment"
2. ✅ **Verify**: Amber badge shown
3. ✅ **Verify**: "Patient is present" alert
4. Enter patient details:
   - Name: "Emergency Patient"
   - Phone: "+9998887777"
5. Select doctor
6. ✅ **Verify**: Immediate/next slots highlighted
7. Select priority: "Urgent"
8. Enter reason: "Acute eye pain"
9. Submit → ✅ **Verify**: Walk-in created
10. ✅ **Verify**: Marked as walk-in in database

**Test Cases**:
- [ ] Walk-in dialog distinct UI
- [ ] Simplified patient form
- [ ] Priority includes "Urgent"
- [ ] Immediate slots preferred
- [ ] Walk-in flag in database
- [ ] Differentiated in calendar view

#### 6.4 Appointment Calendar View
**Test Steps**:
1. Navigate to Calendar tab
2. ✅ **Verify**: Month/week/day views available
3. Switch to week view
4. ✅ **Verify**: Appointments shown in time slots
5. Color coding:
   - Scheduled: Blue
   - Confirmed: Green
   - Cancelled: Red
   - Completed: Gray
6. Click appointment → ✅ **Verify**: Details popup
7. Drag appointment to new slot
8. ✅ **Verify**: Reschedule confirmation
9. Confirm → ✅ **Verify**: Appointment moved

**Test Cases**:
- [ ] Calendar loads all appointments
- [ ] Color coding correct
- [ ] Drag-and-drop reschedule
- [ ] Filter by doctor/department
- [ ] Filter by status
- [ ] Export calendar (PDF/iCal)

#### 6.5 Appointment Status Updates
**Test Steps**:
1. Select scheduled appointment
2. Click "Confirm" → ✅ **Verify**: Status = Confirmed
3. Select different appointment
4. Click "Cancel"
5. Enter reason: "Patient requested cancellation"
6. Submit → ✅ **Verify**: Status = Cancelled
7. ✅ **Verify**: Cancellation reason saved
8. ✅ **Verify**: Slot becomes available again

**Test Cases**:
- [ ] Confirm appointment
- [ ] Cancel with reason
- [ ] Mark as no-show
- [ ] Complete appointment
- [ ] Reschedule appointment
- [ ] Status history tracked

### Module 7: OPD Workflow (Phase 1) (15 minutes)

#### 7.1 Patient Check-In (Days 1-2)
**URL**: http://localhost:3000/dashboard/patients

**Test Steps**:
1. Select patient with appointment today
2. Click "Check In"
3. Fill form:
   - Doctor: Auto-populated from appointment
   - Appointment Type: "Follow-up"
   - Reason: "Regular eye checkup"
4. Submit → ✅ **Verify**: Success message
5. ✅ **Verify**: Status badge: "Checked In"
6. ✅ **Verify**: Token slip dialog appears

**Test Cases**:
- [ ] Check-in with appointment
- [ ] Check-in without appointment (walk-in)
- [ ] Cannot check-in twice
- [ ] Doctor required
- [ ] Reason required (min 5 chars)
- [ ] Timestamp recorded

#### 7.2 Token Display & Print (Day 6)
**Test Steps**:
1. After check-in, verify token slip:
   - Token number (large, blue font)
   - Patient name
   - Doctor name
   - Appointment type
   - Date & time
   - QR code (120x120px)
2. ✅ **Verify**: QR code contains visit data
3. Click "Print Token"
4. ✅ **Verify**: Print preview opens (80mm layout)
5. ✅ **Verify**: Barcode scannable
6. Print → ✅ **Verify**: Thermal printer output correct

**Test Cases**:
- [ ] Token number sequential
- [ ] Token resets daily
- [ ] QR code scannable
- [ ] Print layout 80mm
- [ ] Token sequence format (A001, A002, etc.)

#### 7.3 Hard Gates (Day 2)
**Test Steps**:
1. Select **unchecked** patient
2. Click "Examination" tab
3. ✅ **Verify**: Tab disabled/grayed
4. Click anyway
5. ✅ **Verify**: Error: "Patient must be checked in first"
6. Click "Billing" tab
7. ✅ **Verify**: Also blocked
8. After check-in: Try examination tab
9. ✅ **Verify**: Now accessible

**Test Cases**:
- [ ] Examination blocked before check-in
- [ ] Billing blocked before check-in
- [ ] Tabs enabled after check-in
- [ ] Backend middleware enforces (403)
- [ ] Clear error messages

#### 7.4 Emergency Override (Day 2)
**Test Steps**:
1. Unchecked patient → Try examination
2. Click "Emergency Override"
3. ✅ **Verify**: Reason dialog appears
4. Enter reason (< 10 chars): "Emergency"
5. ✅ **Verify**: Validation error
6. Enter proper reason (>= 10 chars): "Critical emergency, patient needs immediate examination for acute symptoms"
7. Submit → ✅ **Verify**: Access granted
8. ✅ **Verify**: Warning banner: "Emergency Override Active"
9. Check audit log
10. ✅ **Verify**: Override logged with user, reason, timestamp

**Test Cases**:
- [ ] Override requires reason (min 10 chars)
- [ ] Override grants temporary access
- [ ] Warning banner persists
- [ ] Logged to audit_log table
- [ ] Only authorized users can override

#### 7.5 Itemized Billing (Days 4, 7)
**Test Steps**:
1. Navigate to billing for checked-in patient
2. Click "Generate Bill"
3. Click "Add Service"
4. Search: "Consultation"
5. Select "General Consultation" (₹500)
6. Quantity: 1
7. Discount: 5%
8. Notes: "First visit discount"
9. Click "Add to Bill"
10. ✅ **Verify**: Item appears in table:
    - Unit Price: ₹500
    - Discount: ₹25 (5%)
    - Tax (18%): ₹85.50
    - Total: ₹560.50
11. Add another service: "Blood Test" (₹300)
12. Quantity: 2
13. ✅ **Verify**: Subtotal updates
14. ✅ **Verify**: Grand total: ~₹1,179
15. Click "Save Bill"
16. ✅ **Verify**: Bill number generated

**Test Cases**:
- [ ] Add multiple services
- [ ] Inline quantity editing
- [ ] Discount validation (max %)
- [ ] Tax calculation (18%)
- [ ] Totals accurate
- [ ] Cannot save with 0 items
- [ ] Bill number unique

#### 7.6 Payment Recording (Day 7)
**Test Steps**:

**Cash Payment**:
1. Click "Record Payment"
2. Select "Cash"
3. Amount: ₹1,179
4. Notes: "Full payment received"
5. Submit → ✅ **Verify**: Payment recorded

**Card Payment**:
1. Select "Card"
2. Amount: ₹1,179
3. Last 4 digits: 1234
4. Card Network: Visa
5. Transaction ID: TXN123456
6. Submit → ✅ **Verify**: All fields saved

**UPI Payment**:
1. Select "UPI"
2. Amount: ₹1,179
3. UPI ID: patient@upi
4. UPI Transaction ID: UPI987654
5. Submit → ✅ **Verify**: Payment recorded

**Insurance Payment**:
1. Select "Insurance"
2. Amount: ₹1,000
3. Provider: "XYZ Insurance"
4. Policy Number: POL123
5. Claim Number: CLM456
6. Submit → ✅ **Verify**: Partial payment

**Credit Payment**:
1. Select "Credit"
2. ✅ **Verify**: Warning shown
3. Amount: ₹1,179
4. Submit → ✅ **Verify**: Credit approved flag

**Test Cases**:
- [ ] All 6 payment modes work
- [ ] Mode-specific fields validated
- [ ] Amount <= balance due
- [ ] Partial payments allowed
- [ ] Balance due updates
- [ ] Payment history tracked
- [ ] Multiple payments per bill

#### 7.7 Bill Locking (Day 5)
**Test Steps**:
1. After full payment, click "Lock Bill"
2. ✅ **Verify**: Confirmation dialog
3. Confirm → ✅ **Verify**: Lock icon appears
4. ✅ **Verify**: Status: "Locked"
5. Try editing bill
6. ✅ **Verify**: Edit buttons disabled
7. Try adding item
8. ✅ **Verify**: "Bill is locked" message
9. Click "Unlock Bill"
10. Enter reason: "Correction needed for service code"
11. Submit → ✅ **Verify**: Bill unlocked
12. ✅ **Verify**: Can edit again

**Test Cases**:
- [ ] Lock after payment
- [ ] Cannot edit locked bill
- [ ] Unlock requires reason
- [ ] Lock timestamp recorded
- [ ] Locked by user ID saved
- [ ] Audit log entry created

#### 7.8 Auto-Billing Validation (Day 8)
**Test Scenarios**:

**No Bill Generated**:
1. Complete examination
2. Click "Complete Visit"
3. ✅ **Verify**: Billing prompt appears
4. ✅ **Verify**: Status: "No Bill Generated" (orange)
5. ✅ **Verify**: "Generate Bill" button
6. ✅ **Verify**: "Proceed" button disabled

**Bill Unpaid**:
1. Bill exists, unpaid
2. Click "Complete Visit"
3. ✅ **Verify**: Status: "Payment Pending" (red)
4. ✅ **Verify**: Balance due shown: ₹1,179
5. ✅ **Verify**: "View Bill" button
6. ✅ **Verify**: "Proceed" disabled

**Bill Paid**:
1. Bill fully paid
2. Click "Complete Visit"
3. ✅ **Verify**: Status: "Paid" (green)
4. ✅ **Verify**: Bill details shown
5. ✅ **Verify**: "Proceed to Complete" enabled
6. Click proceed
7. ✅ **Verify**: Visit status: "Completed"

**Free Visit**:
1. Bill marked as free
2. Click "Complete Visit"
3. ✅ **Verify**: Status: "Free Visit" (blue)
4. ✅ **Verify**: "Proceed" enabled (no payment needed)

**Credit Approved**:
1. Bill with credit payment
2. Click "Complete Visit"
3. ✅ **Verify**: Status: "Credit Approved" (purple)
4. ✅ **Verify**: Balance due shown
5. ✅ **Verify**: "Proceed" enabled

**Emergency Override**:
1. Unpaid bill, emergency case
2. Click "Emergency Override"
3. Enter reason: "Patient critical, deferring billing for immediate discharge"
4. Confirm → ✅ **Verify**: Visit completes
5. ✅ **Verify**: Billing marked pending
6. ✅ **Verify**: Override logged

**Test Cases**:
- [ ] Hard gate blocks completion
- [ ] All status types display correctly
- [ ] Icons and colors match status
- [ ] Balance calculation accurate
- [ ] Lock status integrated
- [ ] Override requires reason
- [ ] Free visit bypasses payment
- [ ] Credit bypasses immediate payment

### Module 8: Clinical Examinations (10 minutes)

#### 8.1 General Examination
**URL**: http://localhost:3000/dashboard/clinical/examinations

**Test Steps**:
1. Select checked-in patient
2. Click "Start Examination"
3. Record vitals:
   - Blood Pressure: 120/80 mmHg
   - Heart Rate: 72 bpm
   - Temperature: 98.6°F
   - Weight: 70 kg
   - Height: 170 cm
4. Clinical findings:
   - Chief Complaint: "Blurry vision"
   - History: "Progressive over 6 months"
   - Examination: "Visual acuity reduced"
5. Diagnosis: "Myopia"
6. Prescription:
   - Add medication: "Eye drops"
   - Dosage: "2 drops, 3 times daily"
   - Duration: "7 days"
7. Follow-up: "2 weeks"
8. Save → ✅ **Verify**: Examination saved

**Test Cases**:
- [ ] Vitals recorded
- [ ] Clinical findings documented
- [ ] Diagnosis entered
- [ ] Prescription created
- [ ] Follow-up scheduled
- [ ] Doctor signature captured
- [ ] Timestamp recorded

#### 8.2 Ophthalmology Examination
**Test Steps**:
1. Start ophthalmic examination
2. Visual Acuity:
   - Right Eye: 6/12
   - Left Eye: 6/9
3. Intraocular Pressure:
   - Right: 16 mmHg
   - Left: 15 mmHg
4. Refraction:
   - Right: -2.00 DS
   - Left: -1.50 DS
5. Fundus Examination: "Normal optic disc, retina healthy"
6. Save → ✅ **Verify**: Ophthalmic data saved

**Test Cases**:
- [ ] Visual acuity for both eyes
- [ ] IOP measurements
- [ ] Refraction values
- [ ] Fundus findings
- [ ] Slit lamp examination
- [ ] Imaging attachments

### Module 9: Diagnostic Tests (12 minutes)

#### 9.1 Laboratory Tests
**URL**: http://localhost:3000/dashboard/diagnostics/laboratory

**Test Steps**:
1. Select patient
2. Click "Order Lab Test"
3. Select test: "Complete Blood Count (CBC)"
4. Priority: "Routine"
5. Instructions: "Fasting required"
6. Submit → ✅ **Verify**: Order created
7. Lab technician: Enter results
   - Hemoglobin: 14.5 g/dL
   - WBC: 7,500 /μL
   - Platelets: 250,000 /μL
8. Upload report PDF
9. Mark as completed
10. ✅ **Verify**: Doctor can view results

**Test Cases**:
- [ ] Order lab tests
- [ ] Multiple tests per order
- [ ] Priority setting
- [ ] Results entry
- [ ] Report upload (PDF)
- [ ] Normal/abnormal flags
- [ ] Reference ranges

#### 9.2 Imaging Tests
**Test Steps**:
1. Order imaging: "OCT Scan"
2. Select eye: "Both Eyes"
3. Clinical indication: "Diabetic retinopathy screening"
4. Submit → ✅ **Verify**: Order created
5. Radiologist: Upload images (DICOM)
6. Enter findings: "Mild macular edema"
7. Mark as completed
8. ✅ **Verify**: Images viewable in patient record

**Test Cases**:
- [ ] Order imaging tests
- [ ] DICOM upload
- [ ] Image viewer works
- [ ] Findings documented
- [ ] Radiologist signature

### Module 10: Billing & Finance (Advanced) (10 minutes)

#### 10.1 Billing Reports
**URL**: http://localhost:3000/dashboard/reports/billing

**Test Steps**:
1. Select date range: Last 7 days
2. Generate "Daily Collection Report"
3. ✅ **Verify**: Report shows:
   - Total bills: 50
   - Total collected: ₹75,000
   - Outstanding: ₹25,000
   - Payment mode breakdown
4. Export to PDF
5. ✅ **Verify**: PDF downloads

**Test Cases**:
- [ ] Daily collection report
- [ ] Outstanding bills report
- [ ] Payment mode summary
- [ ] Doctor-wise revenue
- [ ] Department-wise revenue
- [ ] Export formats (PDF, Excel, CSV)

#### 10.2 Credit Management
**Test Steps**:
1. Navigate to Credit Bills
2. ✅ **Verify**: List of credit-approved bills
3. Select bill with balance due
4. Click "Record Payment"
5. Pay partial amount
6. ✅ **Verify**: Balance updates
7. Mark as "Payment Plan"
8. Set installments: 3 months
9. ✅ **Verify**: Installment schedule created

**Test Cases**:
- [ ] Credit bill tracking
- [ ] Partial payment recording
- [ ] Payment plans
- [ ] Aging analysis
- [ ] Reminder notifications

### Module 11: Admin & Configuration (15 minutes)

#### 11.1 Branch Management
**URL**: http://localhost:3000/dashboard/admin/branches

**Test Steps**:
1. Click "Create Branch"
2. Fill form:
   - Name: "North Branch"
   - Code: "NB001"
   - Address: "123 North St"
   - Phone: "+1111111111"
   - Capacity: 50 patients/day
3. Submit → ✅ **Verify**: Branch created
4. Assign doctors to branch
5. Assign departments to branch
6. ✅ **Verify**: Branch operational

**Test Cases**:
- [ ] Create branch
- [ ] Assign doctors
- [ ] Assign departments
- [ ] Set capacity limits
- [ ] Branch-wise reports
- [ ] Multi-branch patient routing

#### 11.2 Department Management
**Test Steps**:
1. Navigate to Departments
2. Create department: "Ophthalmology"
3. Assign head of department
4. Add services offered
5. Set consultation fees
6. ✅ **Verify**: Department active

**Test Cases**:
- [ ] Create department
- [ ] Assign HOD
- [ ] Service catalog per department
- [ ] Fee structure
- [ ] Department statistics

#### 11.3 License Management
**Test Steps**:
1. Navigate to Licenses
2. View current license:
   - Type: Premium
   - Users: 50/100
   - Expiry: 2027-01-31
3. Click "Request Upgrade"
4. Select: Enterprise (500 users)
5. Submit request
6. ✅ **Verify**: Request pending

**Test Cases**:
- [ ] View license details
- [ ] User count tracking
- [ ] Expiry warnings
- [ ] Upgrade requests
- [ ] Feature limits enforced

### Module 12: Audit Logs & Compliance (8 minutes)

#### 12.1 Audit Log Viewing
**URL**: http://localhost:3000/dashboard/admin/audit-logs

**Test Steps**:
1. Navigate to Audit Logs
2. Filter by:
   - Action: "emergency_override"
   - Date range: Last 30 days
   - User: All
3. ✅ **Verify**: Override events shown
4. Click log entry → View details:
   - User ID
   - Action
   - Reason
   - IP Address
   - Timestamp
   - Entity affected
5. Export logs → ✅ **Verify**: CSV downloaded

**Test Cases**:
- [ ] View all audit logs
- [ ] Filter by action type
- [ ] Filter by user
- [ ] Filter by date range
- [ ] Search by entity ID
- [ ] Export to CSV/PDF
- [ ] HIPAA compliance fields present

#### 12.2 Audit Trail Verification
**Database Test**:
```sql
-- Verify all critical actions logged
SELECT action, COUNT(*) 
FROM audit_log 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY action
ORDER BY COUNT(*) DESC;

-- Verify override reasons captured
SELECT action, details->>'reason', created_by_user_id, created_at
FROM audit_log
WHERE action = 'emergency_override'
ORDER BY created_at DESC
LIMIT 10;

-- Verify bill lock/unlock audit
SELECT action, entity_id, details, created_by_user_id, created_at
FROM audit_log
WHERE action IN ('bill_locked', 'bill_unlocked')
ORDER BY created_at DESC;
```

**Test Cases**:
- [ ] All CRUD operations logged
- [ ] Emergency overrides logged
- [ ] Bill locks logged
- [ ] User login/logout logged
- [ ] Permission changes logged
- [ ] Data deletion logged (soft delete)

### Module 13: Advanced Features (10 minutes)

#### 13.1 Bulk Operations
**URL**: http://localhost:3000/dashboard/admin/bulk-operations

**Test Steps**:
1. Select "Bulk Appointment Update"
2. Upload CSV with:
   - Appointment IDs
   - New status: "Rescheduled"
   - New date: "2026-02-15"
3. Submit → ✅ **Verify**: Processing starts
4. ✅ **Verify**: Progress bar shows (0-100%)
5. ✅ **Verify**: Success: "50 appointments updated"
6. View error log (if any)

**Test Cases**:
- [ ] Bulk appointment update
- [ ] Bulk patient import
- [ ] Bulk billing adjustments
- [ ] CSV validation
- [ ] Error handling
- [ ] Transaction rollback on failure

#### 13.2 Document Sharing (If Enabled)
**Test Steps**:
1. Select patient
2. Navigate to Documents tab
3. Click "Upload Document"
4. Select file: prescription.pdf
5. Set permissions:
   - View: Doctor, Patient
   - Download: Doctor only
6. Set expiry: 30 days
7. Upload → ✅ **Verify**: Document uploaded
8. Click "Share Link"
9. ✅ **Verify**: Shareable link generated
10. Test link in incognito → ✅ **Verify**: Access based on permissions

**Test Cases**:
- [ ] Document upload (PDF, images)
- [ ] Permission management
- [ ] Expiry dates
- [ ] Shareable links
- [ ] Version control
- [ ] Access logs

## 🔬 API Testing with Swagger

### Open Swagger UI
http://localhost:5073/swagger/index.html

### Phase 1: Core Infrastructure APIs

#### Tenants (8 endpoints)
- **GET /api/tenants** - List all tenants
- **POST /api/tenants** - Create tenant
- **GET /api/tenants/{id}** - Get tenant details
- **PUT /api/tenants/{id}** - Update tenant
- **DELETE /api/tenants/{id}** - Soft delete tenant
- **POST /api/tenants/{id}/activate** - Activate tenant
- **POST /api/tenants/{id}/deactivate** - Deactivate tenant
- **GET /api/tenants/{id}/statistics** - Get tenant statistics

**Test Cases**:
- [ ] Create tenant with all fields
- [ ] Get tenant returns correct data
- [ ] Update tenant information
- [ ] Soft delete sets deleted_at
- [ ] Activate/deactivate changes status
- [ ] Statistics accurate

#### Branches (7 endpoints)
- **GET /api/branches** - List all branches
- **POST /api/branches** - Create branch
- **GET /api/branches/{id}** - Get branch details
- **PUT /api/branches/{id}** - Update branch
- **DELETE /api/branches/{id}** - Soft delete branch
- **GET /api/branches/{id}/capacity** - Get capacity info
- **PUT /api/branches/{id}/capacity** - Update capacity

**Test Cases**:
- [ ] List filters by tenant
- [ ] Branch code unique per tenant
- [ ] Capacity limits enforced
- [ ] Cannot delete branch with data

#### Users (12 endpoints)
- **GET /api/users** - List users
- **POST /api/users** - Create user
- **GET /api/users/{id}** - Get user details
- **PUT /api/users/{id}** - Update user
- **DELETE /api/users/{id}** - Soft delete user
- **POST /api/users/{id}/activate** - Activate user
- **POST /api/users/{id}/deactivate** - Deactivate user
- **POST /api/users/{id}/reset-password** - Reset password
- **GET /api/users/{id}/roles** - Get user roles
- **POST /api/users/{id}/roles** - Assign role
- **DELETE /api/users/{id}/roles/{roleId}** - Remove role
- **GET /api/users/me** - Get current user

**Test Cases**:
- [ ] Password complexity validated
- [ ] Email uniqueness enforced
- [ ] Tenant isolation works
- [ ] Role assignment updates permissions
- [ ] /me returns current user info

#### Roles (8 endpoints)
- **GET /api/roles** - List roles
- **POST /api/roles** - Create role
- **GET /api/roles/{id}** - Get role details
- **PUT /api/roles/{id}** - Update role
- **DELETE /api/roles/{id}** - Delete role (non-preset only)
- **GET /api/roles/{id}/permissions** - Get role permissions
- **POST /api/roles/{id}/permissions** - Assign permissions
- **DELETE /api/roles/{id}/permissions/{permissionId}** - Remove permission

**Test Cases**:
- [ ] Preset roles cannot be deleted
- [ ] Role hierarchy enforced
- [ ] Permissions grant access
- [ ] Granular permission control

#### Permissions (5 endpoints)
- **GET /api/permissions** - List all permissions
- **POST /api/permissions** - Create permission (admin only)
- **GET /api/permissions/{id}** - Get permission details
- **PUT /api/permissions/{id}** - Update permission
- **DELETE /api/permissions/{id}** - Delete permission

**Test Cases**:
- [ ] Permission name unique
- [ ] Format: resource.entity.action
- [ ] Scope (tenant/branch/department) validated

### Phase 2: Clinical Operations APIs

#### Patients (10 endpoints)
- **GET /api/patients** - List patients (paginated)
- **POST /api/patients** - Register new patient
- **GET /api/patients/{id}** - Get patient details
- **PUT /api/patients/{id}** - Update patient
- **DELETE /api/patients/{id}** - Soft delete patient
- **GET /api/patients/search** - Search by MRN/name/phone
- **GET /api/patients/{id}/appointments** - Get patient appointments
- **GET /api/patients/{id}/visits** - Get patient visit history
- **GET /api/patients/{id}/bills** - Get patient billing history
- **GET /api/patients/statistics** - Get patient statistics

**Test Cases**:
- [ ] MRN auto-generated
- [ ] MRN unique per tenant
- [ ] Search by partial name
- [ ] Search by phone
- [ ] Pagination works
- [ ] Related data loaded (appointments, visits)

#### Appointments (20+ endpoints)
**Basic CRUD**:
- **GET /api/appointments** - List appointments
- **POST /api/appointments** - Create appointment
- **GET /api/appointments/{id}** - Get appointment
- **PUT /api/appointments/{id}** - Update appointment
- **DELETE /api/appointments/{id}** - Cancel appointment

**Enhanced Features**:
- **GET /api/appointments/calendar** - Calendar view data
- **GET /api/appointments/doctor/{doctorId}** - Doctor's appointments
- **GET /api/appointments/patient/{patientId}** - Patient's appointments
- **GET /api/appointments/doctor/{doctorId}/availability** - Slot availability (Day 9)
- **POST /api/appointments/check-conflicts** - Conflict detection (Day 9)
- **POST /api/appointments/suggested-slots** - Get suggested slots
- **PUT /api/appointments/{id}/reschedule** - Reschedule appointment
- **POST /api/appointments/{id}/cancel** - Cancel with reason
- **POST /api/appointments/bulk-update** - Bulk update
- **POST /api/appointments/bulk-cancel** - Bulk cancel
- **POST /api/appointments/recurring** - Create recurring series
- **PUT /api/appointments/recurring/{seriesId}** - Update series
- **GET /api/appointments/stats** - Statistics
- **POST /api/appointments/{id}/send-reminder** - Send reminder
- **GET /api/appointments/reminders** - Upcoming reminders

**Test Cases (Day 9 Specific)**:
- [ ] **GET /doctor/{id}/availability?date=2026-02-01**
  - Returns: availableSlots, unavailableSlots, workingHours, breakTimes, isAvailable
  - ✅ Available slots array not empty
  - ✅ Working hours defined
- [ ] **POST /check-conflicts**
  - Body: { doctorId, patientId, appointmentDate, startTime, duration }
  - Returns: { hasConflicts, conflicts[] }
  - ✅ Detects doctor busy conflicts
  - ✅ Detects patient busy conflicts
  - ✅ Suggests alternative times
- [ ] Slot reservation tested (client-side 5 min timeout)

#### Visits (12 endpoints)
- **GET /api/visits** - List visits
- **POST /api/visits** - Create visit (check-in)
- **GET /api/visits/{id}** - Get visit details
- **PUT /api/visits/{id}** - Update visit
- **DELETE /api/visits/{id}** - Soft delete visit
- **POST /api/visits/{id}/check-in** - Check in patient (Day 1)
- **POST /api/visits/{id}/check-out** - Check out patient
- **POST /api/visits/{id}/complete** - Complete visit
- **GET /api/visits/{id}/token** - Get token details (Day 6)
- **GET /api/visits/today** - Today's visits
- **GET /api/visits/queue** - Current queue
- **GET /api/visits/{id}/timeline** - Visit timeline

**Test Cases (Days 1, 6)**:
- [ ] **POST /visits/{id}/check-in**
  - Body: { doctorId, appointmentType, reasonForVisit }
  - ✅ Status changes to "Checked In"
  - ✅ Timestamp recorded
  - ✅ Token number generated
- [ ] **GET /visits/{id}/token**
  - Returns: { visitId, tokenNumber, tokenSequence, patientName, appointmentType, checkedInAt, branchName, status, currentStation }
  - ✅ Token number sequential
  - ✅ QR code data complete

#### Clinical Examinations (8 endpoints)
- **GET /api/clinical-examination** - List examinations
- **POST /api/clinical-examination** - Create examination
- **GET /api/clinical-examination/{id}** - Get examination
- **PUT /api/clinical-examination/{id}** - Update examination
- **DELETE /api/clinical-examination/{id}** - Soft delete
- **POST /api/clinical-examination/{id}/sign** - Doctor signature
- **GET /api/clinical-examination/visit/{visitId}** - Get by visit
- **GET /api/clinical-examination/{id}/history** - Examination history

**Test Cases (Day 3 Middleware)**:
- [ ] **POST /clinical-examination** (without check-in)
  - ✅ Returns 403 Forbidden
  - ✅ Message: "Patient must be checked in before accessing this resource"
- [ ] **POST /clinical-examination** (with check-in)
  - ✅ Returns 201 Created
  - ✅ Examination saved correctly

### Phase 3: Billing & Finance APIs

#### OPD Bills (15 endpoints)
**Basic CRUD**:
- **GET /api/OpdBills** - List bills
- **POST /api/OpdBills** - Create bill
- **GET /api/OpdBills/{id}** - Get bill details
- **PUT /api/OpdBills/{id}** - Update bill
- **DELETE /api/OpdBills/{id}** - Soft delete

**Enhanced Features**:
- **POST /api/OpdBills/{id}/lock** - Lock bill (Day 5)
- **POST /api/OpdBills/{id}/unlock** - Unlock bill with reason (Day 5)
- **GET /api/OpdBills/{id}/items** - Get bill items
- **POST /api/OpdBills/{id}/items** - Add bill item
- **DELETE /api/OpdBills/{id}/items/{itemId}** - Remove item
- **GET /api/OpdBills/visit/{visitId}** - Get by visit
- **GET /api/OpdBills/appointment/{appointmentId}** - Get by appointment
- **GET /api/OpdBills/visit-billing-status/{visitId}** - Get billing status (Day 8)
- **GET /api/OpdBills/appointment-billing-status/{appointmentId}** - Appointment billing status (Day 8)
- **GET /api/OpdBills/outstanding** - Outstanding bills

**Test Cases (Days 5, 8)**:
- [ ] **POST /OpdBills/{id}/lock**
  - ✅ is_locked = true
  - ✅ locked_at timestamp set
  - ✅ locked_by_user_id recorded
  - ✅ Cannot edit locked bill (returns 400)
- [ ] **POST /OpdBills/{id}/unlock**
  - Body: { reason: "Correction needed..." }
  - ✅ is_locked = false
  - ✅ Reason logged to audit_log
  - ✅ Can edit after unlock
- [ ] **GET /OpdBills/visit-billing-status/{visitId}**
  - Returns: { hasBill, isPaid, isLocked, isFreeVisit, isCredit, balanceDue, netAmount, amountPaid, billNumber, billId, status, canComplete, message }
  - ✅ canComplete = isPaid || isFreeVisit || isCredit
  - ✅ Message describes status
  - ✅ Balance calculation: balanceDue = netAmount - amountPaid

#### Service Catalog (7 endpoints)
- **GET /api/ServiceCatalog** - List services
- **POST /api/ServiceCatalog** - Create service
- **GET /api/ServiceCatalog/{id}** - Get service
- **PUT /api/ServiceCatalog/{id}** - Update service
- **DELETE /api/ServiceCatalog/{id}** - Soft delete
- **GET /api/ServiceCatalog/code/{code}** - Get by code
- **GET /api/ServiceCatalog/search** - Search services

**Test Cases (Day 7)**:
- [ ] Create service with tax rate
- [ ] Max discount percent enforced
- [ ] Service code unique per tenant
- [ ] Search by name/category

#### Payments (8 endpoints)
- **GET /api/payments** - List payments
- **POST /api/payments** - Record payment
- **GET /api/payments/{id}** - Get payment details
- **DELETE /api/payments/{id}** - Void payment (admin only)
- **GET /api/payments/bill/{billId}** - Get by bill
- **GET /api/payments/patient/{patientId}** - Patient payment history
- **POST /api/payments/{id}/void** - Void with reason
- **GET /api/payments/daily-summary** - Daily collection

**Test Cases (Day 7)**:
- [ ] Record cash payment
- [ ] Record card payment (validate last 4 digits, network, transaction ID)
- [ ] Record UPI payment (validate UPI ID format)
- [ ] Record insurance payment (validate policy #, claim #)
- [ ] Record credit payment (sets credit flag)
- [ ] Partial payments allowed
- [ ] Balance due updates after payment

### Phase 4: Advanced Features APIs

#### Bulk Operations (5 endpoints)
- **POST /api/bulk-operations/appointments/update** - Bulk update appointments
- **POST /api/bulk-operations/appointments/cancel** - Bulk cancel
- **POST /api/bulk-operations/patients/import** - Bulk import patients
- **POST /api/bulk-operations/billing/adjust** - Bulk billing adjustments
- **GET /api/bulk-operations/{jobId}/status** - Get job status

**Test Cases**:
- [ ] Upload CSV with valid data
- [ ] Progress tracking works
- [ ] Error log for failed records
- [ ] Transaction rollback on failure

#### Licenses (6 endpoints)
- **GET /api/license** - Get current license
- **POST /api/license/validate** - Validate license
- **POST /api/license/upgrade** - Request upgrade
- **GET /api/license/usage** - Get usage statistics
- **POST /api/license/renew** - Renew license
- **GET /api/license/features** - Get enabled features

**Test Cases**:
- [ ] License validation
- [ ] User count enforcement
- [ ] Expiry date checking
- [ ] Feature flags based on license

#### Audit Logs (4 endpoints)
- **GET /api/audit-logs** - List audit logs (paginated)
- **GET /api/audit-logs/{id}** - Get log details
- **GET /api/audit-logs/entity/{entityId}** - Get by entity
- **POST /api/audit-logs/export** - Export logs (CSV/PDF)

**Test Cases**:
- [ ] Filter by action type
- [ ] Filter by user
- [ ] Filter by date range
- [ ] Export to CSV
- [ ] HIPAA compliance fields present
- [ ] Emergency overrides logged
- [ ] Bill lock/unlock logged

### Diagnostic Tests APIs

#### Laboratory Tests
- **GET /api/laboratory/tests** - List lab tests
- **POST /api/laboratory/tests** - Order test
- **GET /api/laboratory/tests/{id}** - Get test details
- **PUT /api/laboratory/tests/{id}/results** - Enter results
- **POST /api/laboratory/tests/{id}/report** - Upload report
- **GET /api/laboratory/tests/patient/{patientId}** - Patient lab history

**Test Cases**:
- [ ] Order multiple tests
- [ ] Enter results with normal/abnormal flags
- [ ] Upload report PDF
- [ ] Reference ranges enforced

#### Imaging Tests (OCT, Fundus, etc.)
- **POST /api/imaging/oct** - Order OCT scan
- **PUT /api/imaging/oct/{id}/images** - Upload DICOM images
- **GET /api/imaging/oct/{id}** - Get OCT results
- **POST /api/imaging/fundus** - Order fundus photography
- **POST /api/imaging/electrophysiology** - Order electrophysiology test

**Test Cases**:
- [ ] DICOM upload successful
- [ ] Image viewer data correct
- [ ] Findings documented

## 💾 Database Testing & Verification

### Connection
```powershell
# Azure PostgreSQL connection
psql -h your-server.postgres.database.azure.com -U your-username -d hospital_portal
```

### Schema Validation

#### Verify All 96 Tables Exist
```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: 96 tables
```

#### Verify Standard Columns (HIPAA Compliance)
```sql
-- Check all tables have required audit columns
SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_name = t.table_name
      AND c.column_name IN ('id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at', 'created_by_user_id', 'updated_by_user_id')
  );
-- Expected: 0 rows (all tables compliant)
```

#### Verify Row-Level Security (RLS)
```sql
-- Check RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'AspNet%'
  AND rowsecurity = false;
-- Expected: 0 rows (all tables have RLS)

-- Verify RLS policies exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Expected: ~96 policies (tenant_isolation per table)
```

#### Verify Audit Triggers
```sql
-- List all audit triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;
-- Expected: 28 triggers on critical tables
```

### Data Integrity Tests

#### Verify Token Generation
```sql
-- Check token sequence
SELECT id, token_number, token_sequence, status, checked_in_at 
FROM visits 
WHERE status = 'Checked In' 
  AND DATE(checked_in_at) = CURRENT_DATE
ORDER BY checked_in_at DESC 
LIMIT 10;

-- Verify sequential token numbers
SELECT 
  token_number,
  token_number - LAG(token_number) OVER (ORDER BY token_number) AS gap
FROM visits
WHERE DATE(checked_in_at) = CURRENT_DATE
  AND status = 'Checked In'
ORDER BY token_number;
-- Expected: gap = 1 (sequential)
```

#### Verify Bill Locking
```sql
-- Locked bills
SELECT id, bill_number, is_locked, locked_at, locked_by_user_id,
       net_amount, amount_paid, balance_due
FROM opd_bills 
WHERE is_locked = true
ORDER BY locked_at DESC
LIMIT 10;

-- Verify lock timestamps
SELECT 
  id, 
  bill_number,
  is_locked,
  locked_at,
  locked_at - updated_at AS lock_delay
FROM opd_bills
WHERE is_locked = true;
-- Lock delay should be reasonable (< 1 minute typically)
```

#### Verify Itemized Billing
```sql
-- Bill with items
SELECT 
  b.bill_number,
  bi.service_code,
  bi.service_name,
  bi.quantity,
  bi.unit_price,
  bi.discount_percent,
  bi.discount_amount,
  bi.tax_rate,
  bi.tax_amount,
  bi.total_amount,
  -- Verify calculation
  ROUND((bi.unit_price * bi.quantity) * (1 - bi.discount_percent/100) * (1 + bi.tax_rate/100), 2) AS calculated_total
FROM opd_bills b
JOIN opd_bill_items bi ON b.id = bi.bill_id
WHERE b.deleted_at IS NULL
ORDER BY b.created_at DESC
LIMIT 10;

-- Verify total_amount matches calculated_total
SELECT 
  bi.id,
  bi.service_name,
  bi.total_amount,
  ROUND((bi.unit_price * bi.quantity) * (1 - bi.discount_percent/100) * (1 + bi.tax_rate/100), 2) AS calculated,
  bi.total_amount - ROUND((bi.unit_price * bi.quantity) * (1 - bi.discount_percent/100) * (1 + bi.tax_rate/100), 2) AS difference
FROM opd_bill_items bi
WHERE bi.deleted_at IS NULL
  AND ABS(bi.total_amount - ROUND((bi.unit_price * bi.quantity) * (1 - bi.discount_percent/100) * (1 + bi.tax_rate/100), 2)) > 0.01;
-- Expected: 0 rows (all calculations correct)
```

#### Verify Audit Logs
```sql
-- Emergency overrides
SELECT 
  action,
  details->>'reason' AS reason,
  details->>'entity_type' AS entity_type,
  details->>'entity_id' AS entity_id,
  created_by_user_id,
  created_at,
  ip_address
FROM audit_log 
WHERE action = 'emergency_override'
ORDER BY created_at DESC 
LIMIT 10;

-- Bill lock/unlock events
SELECT 
  action,
  entity_id AS bill_id,
  details->>'reason' AS reason,
  details->>'bill_number' AS bill_number,
  created_by_user_id,
  created_at
FROM audit_log
WHERE action IN ('bill_locked', 'bill_unlocked')
ORDER BY created_at DESC
LIMIT 10;

-- User login events
SELECT 
  action,
  details->>'user_email' AS email,
  details->>'tenant_id' AS tenant_id,
  ip_address,
  created_at
FROM audit_log
WHERE action = 'user_login'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

#### Verify Multi-Tenancy Isolation
```sql
-- Set tenant context for tenant 1
SET app.current_tenant_id = 'your-tenant-1-uuid';

-- Count records for tenant 1
SELECT 'patients' AS table_name, COUNT(*) FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'visits', COUNT(*) FROM visits
UNION ALL
SELECT 'opd_bills', COUNT(*) FROM opd_bills;

-- Switch to tenant 2
SET app.current_tenant_id = 'your-tenant-2-uuid';

-- Count again (should be different)
SELECT 'patients' AS table_name, COUNT(*) FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'visits', COUNT(*) FROM visits
UNION ALL
SELECT 'opd_bills', COUNT(*) FROM opd_bills;

-- Verify no cross-tenant data leakage
SELECT DISTINCT tenant_id 
FROM patients 
WHERE tenant_id::text != current_setting('app.current_tenant_id', true);
-- Expected: 0 rows (perfect isolation)
```

#### Verify Soft Delete
```sql
-- Count active vs deleted records
SELECT 
  'patients' AS table_name,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) AS active,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted
FROM patients
UNION ALL
SELECT 
  'appointments',
  COUNT(*) FILTER (WHERE deleted_at IS NULL),
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM appointments
UNION ALL
SELECT 
  'opd_bills',
  COUNT(*) FILTER (WHERE deleted_at IS NULL),
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM opd_bills;

-- Verify deleted records not shown in normal queries (RLS)
SELECT COUNT(*) 
FROM patients 
WHERE deleted_at IS NOT NULL;
-- Expected: 0 (RLS hides deleted records)
```

#### Verify Payment Calculations
```sql
-- Bill payment reconciliation
SELECT 
  b.id,
  b.bill_number,
  b.net_amount,
  COALESCE(SUM(p.amount), 0) AS total_payments,
  b.amount_paid,
  b.balance_due,
  b.net_amount - COALESCE(SUM(p.amount), 0) AS calculated_balance,
  b.balance_due - (b.net_amount - COALESCE(SUM(p.amount), 0)) AS difference
FROM opd_bills b
LEFT JOIN payments p ON p.bill_id = b.id AND p.deleted_at IS NULL
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.bill_number, b.net_amount, b.amount_paid, b.balance_due
HAVING ABS(b.balance_due - (b.net_amount - COALESCE(SUM(p.amount), 0))) > 0.01;
-- Expected: 0 rows (all balances accurate)

-- Payment mode breakdown
SELECT 
  payment_mode,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount
FROM payments
WHERE deleted_at IS NULL
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY payment_mode
ORDER BY total_amount DESC;
```

### Performance Tests

#### Query Performance
```sql
-- Explain plan for patient search (should use index)
EXPLAIN ANALYZE
SELECT * FROM patients 
WHERE first_name ILIKE '%john%' 
  OR last_name ILIKE '%john%'
  OR mrn ILIKE '%john%';
-- Expected: Uses indexes, execution time < 50ms

-- Explain plan for appointment calendar (should be fast)
EXPLAIN ANALYZE
SELECT a.*, p.first_name, p.last_name, u.email AS doctor_email
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u ON a.doctor_id = u.id
WHERE a.appointment_date BETWEEN '2026-02-01' AND '2026-02-28'
  AND a.deleted_at IS NULL;
-- Expected: Uses date index, execution time < 100ms

-- Explain plan for billing query
EXPLAIN ANALYZE
SELECT b.*, 
  (SELECT COUNT(*) FROM opd_bill_items WHERE bill_id = b.id) AS item_count,
  (SELECT COUNT(*) FROM payments WHERE bill_id = b.id) AS payment_count
FROM opd_bills b
WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND b.deleted_at IS NULL;
-- Expected: Reasonable performance, execution time < 200ms
```

#### Index Coverage
```sql
-- List all indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check missing indexes on foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  )
ORDER BY tc.table_name;
-- Expected: 0 rows (all FKs have indexes)
```

### Compliance Tests

#### HIPAA Compliance Score
```sql
-- Run compliance test (from test_database_compliance.sql)
-- Expected output: 10/10 score

-- UUID primary keys (not sequential integers)
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND data_type != 'uuid'
  AND table_name NOT LIKE 'AspNet%';
-- Expected: 0 rows

-- Soft delete on all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'AspNet%'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = information_schema.tables.table_name
      AND column_name = 'deleted_at'
  );
-- Expected: 0 rows

-- Audit trail columns
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'AspNet%'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = information_schema.tables.table_name
      AND column_name IN ('created_by_user_id', 'updated_by_user_id')
    HAVING COUNT(*) = 2
  );
-- Expected: 0 rows
```

## Troubleshooting

### Backend Won't Start
```powershell
# Kill process on port 5073
$port = netstat -ano | findstr :5073 | ForEach-Object { $_ -split '\s+' | Select-Object -Last 1 } | Select-Object -First 1
if ($port) { Stop-Process -Id $port -Force }

# Restart
cd microservices/auth-service/AuthService
dotnet run
```

### Frontend Won't Start
```powershell
# Kill process on port 3000
$port = netstat -ano | findstr :3000 | ForEach-Object { $_ -split '\s+' | Select-Object -Last 1 } | Select-Object -First 1
if ($port) { Stop-Process -Id $port -Force }

# Clean and restart
cd apps/hospital-portal-web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm dev
```

### Import Errors
All import path issues already fixed:
- ✅ oct-imaging.api.ts
- ✅ electrophysiology.api.ts
- ✅ retinopathy-screening.api.ts

## Files Created (11)

### Frontend Components (7)
1. `TokenSlip.tsx` - Token display with QR code (242 lines)
2. `ItemizedBillingDialog.tsx` - Multi-service billing (619 lines)
3. `PaymentDialog.tsx` - 6 payment modes (462 lines)
4. `BillingPromptDialog.tsx` - Hard gate enforcement (310 lines)
5. `SlotAvailabilityPanel.tsx` - Real-time slots (320 lines)
6. `ConflictDetection.tsx` - Appointment conflicts (180 lines)
7. `WalkInBookingDialog.tsx` - Walk-in booking (390 lines)

### API Clients (1)
8. `service-catalog.api.ts` - Service catalog integration (109 lines)

### Testing (2)
9. `DAY10_END_TO_END_TESTING_GUIDE.md` - Manual test protocol
10. `tests/e2e/opd-workflow.spec.ts` - Automated Playwright tests

### Documentation (1)
11. `PHASE1_OPD_WORKFLOW_IMPLEMENTATION_COMPLETE.md` - Full summary

## Modified Files (12)

### Backend (5)
1. `VisitsController.cs` - Token endpoint
2. `OpdBillsController.cs` - Billing status endpoints
3. `IVisitService.cs` - Interface update
4. `OpdBillService.cs` - GetByVisitIdAsync()
5. `OpdBillDtos.cs` - IsLocked property

### Frontend (7)
6. `PatientDirectoryHub.tsx` - Token integration
7. `opd-billing.api.ts` - Billing status API
8. `appointments-enhanced.api.ts` - Availability API
9. `package.json` - qrcode.react@4.2.0
10-12. Import path fixes (3 files)

## Test Checklist

### Must Pass ✅
- [ ] Check-in works
- [ ] Token displays with QR code
- [ ] Hard gates block access
- [ ] Emergency override requires reason
- [ ] Billing calculations accurate
- [ ] Payments record correctly
- [ ] Bill locks after payment
- [ ] Auto-billing prompt blocks completion
- [ ] Slots show availability
- [ ] Walk-in differentiation works

### Should Pass ✅
- [ ] Real-time slot refresh (30s)
- [ ] Conflict detection works
- [ ] Reservation timers count down
- [ ] Print preview opens

### Performance ⚡
- [ ] Page loads < 2 seconds
- [ ] API responses < 1 second
- [ ] No console errors

## Next Actions

1. ✅ **Start Servers** (see commands above)
2. ⏳ **Run Quick Test Flow** (5 minutes)
3. ⏳ **Check Database** (verify data)
4. ⏳ **Review API Endpoints** (Swagger)
5. ⏳ **Report Issues** (if any)

## Success Confirmation

When all tests pass, you should have:
- ✅ Patient checked in with token
- ✅ Bill generated with multiple items
- ✅ Payment recorded
- ✅ Bill locked
- ✅ Hard gates enforcing rules
- ✅ Slots showing real-time availability
- ✅ Walk-in appointments bookable

## Support

- **Testing Guide**: `DAY10_END_TO_END_TESTING_GUIDE.md`
- **Full Documentation**: `PHASE1_OPD_WORKFLOW_IMPLEMENTATION_COMPLETE.md`
- **README**: Root `README.md` for architecture

---

**Status**: ✅ Ready for Testing  
**Last Updated**: January 31, 2026  
**All 10 Days**: Complete
