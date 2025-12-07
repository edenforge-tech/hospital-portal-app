# Hospital Portal - 8-Week Implementation Plan
**Option 3: Hybrid Approach (Recommended)**

**Start Date**: November 11, 2025  
**Target Launch**: January 6, 2026  
**Strategy**: Focus on healthcare core + essential admin features

---

## 🎯 Success Criteria

### Must-Have for Launch
- ✅ Complete healthcare workflow (appointments → patients → examinations)
- ✅ Complete RBAC (roles + permissions management)
- ✅ HIPAA compliance (audit logs + document access controls)
- ✅ System administration (settings + user management)
- ✅ Basic testing coverage (critical paths)
- ✅ Production deployment (Azure with monitoring)

### Nice-to-Have (Post-Launch)
- Bulk operations (can do manually initially)
- Advanced reports builder (use basic queries)
- Notifications center (email fallback)
- Advanced analytics dashboard

---

## 📅 WEEK-BY-WEEK BREAKDOWN

## WEEK 1-2: Healthcare Core Features (10 days)

**Goal**: Complete patient care workflow from scheduling to treatment

### Day 1-2: Appointments Calendar Module ⭐ CRITICAL
**Status**: Currently 30% (basic list exists)  
**API**: 7 endpoints ready ✅

**Tasks**:
- [ ] Install FullCalendar React component
  ```bash
  cd apps/hospital-portal-web
  pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
  ```
- [ ] Create `AppointmentCalendar.tsx` component
  * Monthly view (default)
  * Weekly view
  * Daily view
  * Click date to create appointment
  * Click event to view/edit
  * Color-code by status (scheduled, completed, cancelled, no-show)
  * Filter by doctor, department, status
- [ ] Enhance `AppointmentFormModal.tsx`
  * Patient search/select
  * Doctor selection
  * Department selection
  * Appointment type dropdown
  * Date/time picker
  * Duration selector
  * Notes field
  * Status management
- [ ] Create `DoctorScheduleView.tsx`
  * Show doctor availability
  * Block/unblock time slots
  * Recurring schedule setup
- [ ] Add appointment conflict detection
  * Check doctor availability
  * Check room availability
  * Warn on double-booking
- [ ] Update `apps/hospital-portal-web/src/app/dashboard/appointments/page.tsx`
  * Replace table with calendar
  * Add view switcher (calendar/list)
  * Add filters sidebar
  * Add statistics cards (today's appointments, pending, completed)

**API Endpoints to Use**:
- `GET /api/appointments` - List appointments
- `GET /api/appointments/{id}` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment
- `PUT /api/appointments/{id}/status` - Change status
- `GET /api/appointments/calendar` - Calendar view data

**Files to Create**:
- `src/components/appointments/AppointmentCalendar.tsx` (300 lines)
- `src/components/appointments/AppointmentFormModal.tsx` (250 lines)
- `src/components/appointments/DoctorScheduleView.tsx` (200 lines)
- `src/lib/api/appointments.api.ts` (150 lines)

**Acceptance Criteria**:
- ✅ Calendar displays appointments by month/week/day
- ✅ Click date creates new appointment
- ✅ Click event opens edit modal
- ✅ Appointment conflicts are detected
- ✅ Status changes update color immediately
- ✅ Doctor schedule shows availability

---

### Day 3-5: Complete Patients Management Module ⭐ CRITICAL
**Status**: Currently 20% (basic list exists)  
**API**: 13 endpoints ready ✅

**Tasks**:
- [ ] Create `PatientFormModal.tsx` - Multi-step form
  * **Step 1: Demographics**
    - First name, middle name, last name
    - Date of birth
    - Gender
    - Blood group
    - Contact number, email
    - Emergency contact
  * **Step 2: Address**
    - Street address
    - City, state, ZIP
    - Country
  * **Step 3: Insurance**
    - Insurance provider
    - Policy number
    - Group number
    - Valid from/to dates
  * **Step 4: Medical Info**
    - Allergies (multi-select)
    - Chronic conditions
    - Current medications
    - Previous surgeries
  * **Step 5: Documents**
    - Upload ID proof
    - Upload insurance card
    - Upload medical records
  * **Step 6: Review & Submit**

- [ ] Create `PatientDetailsModal.tsx` - 6 tabs
  * **Tab 1: Basic Info**
    - Demographics
    - Contact info
    - Emergency contact
    - Edit button
  * **Tab 2: Medical History**
    - Timeline view
    - Past appointments
    - Diagnoses
    - Treatments
  * **Tab 3: Documents**
    - Document list
    - Upload new
    - Download/view
    - Delete with confirmation
  * **Tab 4: Appointments**
    - Upcoming appointments
    - Past appointments
    - Book new appointment button
  * **Tab 5: Vital Signs**
    - Chart view (line graph)
    - Table view
    - Add new vitals button
  * **Tab 6: Consent Forms**
    - Signed consents list
    - Request new consent
    - Download PDF

- [ ] Create `MedicalHistoryTimeline.tsx`
  * Vertical timeline
  * Group by year/month
  * Filter by type (appointment, diagnosis, treatment)
  * Click to expand details

- [ ] Create `VitalSignsChart.tsx`
  * Chart.js integration
  * Blood pressure, temperature, pulse, weight over time
  * Date range selector

- [ ] Create `ConsentManagementModal.tsx`
  * List consent types
  * Digital signature pad
  * PDF generation
  * Email consent form

- [ ] Update `apps/hospital-portal-web/src/app/dashboard/patients/page.tsx`
  * Enhanced search (name, MRN, phone)
  * Advanced filters (age range, gender, blood group, status)
  * Statistics cards (total patients, new this month, active)
  * Export to CSV button

**API Endpoints to Use**:
- `GET /api/patients` - List patients with filters
- `GET /api/patients/{id}` - Get patient details
- `POST /api/patients` - Create patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Soft delete patient
- `GET /api/patients/{id}/appointments` - Patient appointments
- `GET /api/patients/{id}/medical-history` - Medical history
- `GET /api/patients/{id}/documents` - Documents
- `POST /api/patients/{id}/documents` - Upload document
- `GET /api/patients/{id}/vital-signs` - Vital signs
- `POST /api/patients/{id}/vital-signs` - Add vital signs
- `GET /api/patients/{id}/consents` - Consent forms
- `POST /api/patients/merge` - Merge duplicate patients

**Files to Create**:
- `src/components/patients/PatientFormModal.tsx` (400 lines)
- `src/components/patients/PatientDetailsModal.tsx` (500 lines)
- `src/components/patients/MedicalHistoryTimeline.tsx` (200 lines)
- `src/components/patients/VitalSignsChart.tsx` (150 lines)
- `src/components/patients/ConsentManagementModal.tsx` (200 lines)
- `src/lib/api/patients.api.ts` (200 lines)

**Acceptance Criteria**:
- ✅ Multi-step patient registration works
- ✅ Patient details show all 6 tabs correctly
- ✅ Medical history timeline displays chronologically
- ✅ Vital signs chart shows trends
- ✅ Document upload/download works
- ✅ Search and filters work correctly

---

### Day 6-8: Complete Clinical Examinations Module ⭐ CRITICAL
**Status**: Currently 20% (basic list exists)  
**API**: 10 endpoints ready ✅

**Tasks**:
- [ ] Create `ExaminationFormModal.tsx` - 5-step clinical workflow
  * **Step 1: Patient Selection**
    - Search patient by name/MRN
    - Display patient info card
    - Select appointment (if scheduled)
  * **Step 2: Chief Complaints**
    - Complaint description (textarea)
    - Duration
    - Severity (mild/moderate/severe)
    - Add multiple complaints
  * **Step 3: Examination Findings**
    - General appearance
    - Vital signs (auto-load if recent)
    - System examination (CVS, RS, CNS, etc.)
    - Physical findings
  * **Step 4: Diagnosis**
    - Primary diagnosis
    - Secondary diagnoses (multi)
    - ICD-10 code search
    - Clinical notes
  * **Step 5: Treatment Plan**
    - Medications (name, dosage, frequency, duration)
    - Laboratory tests ordered
    - Imaging ordered
    - Follow-up date
    - Special instructions

- [ ] Create `ExaminationDetailsModal.tsx` - 4 tabs
  * **Tab 1: Examination Summary**
    - Patient info
    - Date/time
    - Doctor info
    - Chief complaints
    - Diagnosis
    - Status badge
  * **Tab 2: Clinical Findings**
    - Vital signs
    - System examination details
    - Physical findings
  * **Tab 3: Treatment Plan**
    - Medications table
    - Lab orders
    - Imaging orders
    - Follow-up details
  * **Tab 4: Documents**
    - Prescription PDF
    - Lab reports
    - Imaging reports
    - Clinical notes

- [ ] Create `DiagnosisSearch.tsx` component
  * ICD-10 code search
  * Autocomplete
  * Recent diagnoses
  * Favorites

- [ ] Create `MedicationEntry.tsx` component
  * Drug name autocomplete
  * Dosage calculator
  * Drug interaction warnings
  * Allergy check

- [ ] Create `TreatmentPlanEditor.tsx`
  * Rich text editor for notes
  * Template library
  * Print prescription button
  * Email prescription

- [ ] Update `apps/hospital-portal-web/src/app/dashboard/examinations/page.tsx`
  * Enhanced search (patient name, doctor, diagnosis)
  * Filters (date range, status, department)
  * Statistics cards (today's exams, pending, completed)
  * Quick actions (new exam, follow-ups due)

**API Endpoints to Use**:
- `GET /api/clinical-examinations` - List examinations
- `GET /api/clinical-examinations/{id}` - Get examination details
- `POST /api/clinical-examinations` - Create examination
- `PUT /api/clinical-examinations/{id}` - Update examination
- `DELETE /api/clinical-examinations/{id}` - Soft delete
- `GET /api/clinical-examinations/patient/{patientId}` - Patient exams
- `POST /api/clinical-examinations/{id}/prescription` - Generate prescription
- `POST /api/clinical-examinations/{id}/lab-orders` - Lab orders
- `POST /api/clinical-examinations/{id}/imaging-orders` - Imaging orders
- `PUT /api/clinical-examinations/{id}/follow-up` - Schedule follow-up

**Files to Create**:
- `src/components/examinations/ExaminationFormModal.tsx` (500 lines)
- `src/components/examinations/ExaminationDetailsModal.tsx` (400 lines)
- `src/components/examinations/DiagnosisSearch.tsx` (150 lines)
- `src/components/examinations/MedicationEntry.tsx` (200 lines)
- `src/components/examinations/TreatmentPlanEditor.tsx` (250 lines)
- `src/lib/api/examinations.api.ts` (180 lines)

**Acceptance Criteria**:
- ✅ 5-step examination workflow completes successfully
- ✅ Chief complaints can be added/edited
- ✅ Diagnosis search with ICD-10 works
- ✅ Medication entry with drug interactions
- ✅ Treatment plan generates prescription PDF
- ✅ Follow-up scheduling works

---

### Day 9-10: Week 1-2 Buffer & Polish
- Polish UI/UX for healthcare modules
- Fix bugs found during development
- Write basic component tests
- Update API documentation
- Performance optimization

---

## WEEK 3-4: Critical Admin Features (10 days)

**Goal**: Complete RBAC system and system administration

### Day 11-12: Complete Roles Management Module
**Status**: Currently 50% (basic CRUD exists)  
**API**: 13 endpoints ready ✅

**Tasks**:
- [ ] Create `PermissionAssignmentGrid.tsx`
  * Checkbox grid (permissions × role)
  * Group permissions by category
  * Expand/collapse categories
  * Select all in category
  * Search permissions
  * Save changes button

- [ ] Create `RoleCloneModal.tsx`
  * Select source role
  * Enter new role name
  * Clone permissions option
  * Clone users option

- [ ] Create `UserAssignmentModal.tsx`
  * List users with this role
  * Add user to role (search + select)
  * Remove user from role
  * Bulk assignment

- [ ] Enhance `RoleManagementModal.tsx`
  * Role details form
  * Permission count badge
  * User count badge
  * System role indicator (read-only)
  * Audit info (created by, updated by)

- [ ] Update `apps/hospital-portal-web/src/app/dashboard/admin/roles/page.tsx`
  * Statistics cards (total roles, system roles, custom roles)
  * Enhanced search and filters
  * Role comparison feature
  * Export role permissions to CSV

**API Endpoints to Use**:
- `GET /api/roles` - List roles
- `GET /api/roles/{id}` - Get role details
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role
- `GET /api/roles/{id}/permissions` - Get role permissions
- `POST /api/roles/{id}/permissions` - Assign permissions
- `DELETE /api/roles/{id}/permissions/{permissionId}` - Remove permission
- `GET /api/roles/{id}/users` - Get users with role
- `POST /api/roles/{id}/users/{userId}` - Assign role to user
- `DELETE /api/roles/{id}/users/{userId}` - Remove role from user
- `POST /api/roles/clone` - Clone role
- `POST /api/roles/{id}/permissions/bulk` - Bulk permission assignment

**Files to Create**:
- `src/components/roles/PermissionAssignmentGrid.tsx` (300 lines)
- `src/components/roles/RoleCloneModal.tsx` (150 lines)
- `src/components/roles/UserAssignmentModal.tsx` (200 lines)
- Update `src/components/admin/RoleManagementModal.tsx` (+100 lines)
- Update `src/lib/api/roles.api.ts` (+80 lines)

**Acceptance Criteria**:
- ✅ Permission grid displays all permissions grouped
- ✅ Checkbox selections save correctly
- ✅ Role cloning works with permissions
- ✅ User assignment/removal works
- ✅ System roles are read-only

---

### Day 13-15: Permissions Management Module ⭐ NEW
**Status**: 0% (not started)  
**API**: 19 endpoints ready ✅

**Tasks**:
- [ ] Create `apps/hospital-portal-web/src/app/dashboard/admin/permissions/page.tsx`
  * Statistics dashboard (total permissions, categories, most used)
  * Permission list grouped by category
  * Search and filters
  * Create/edit/delete actions

- [ ] Create `PermissionMatrix.tsx` - Interactive grid
  * Rows: All roles
  * Columns: All permissions (grouped by category)
  * Cells: Checkboxes (checked = role has permission)
  * Color-code: Green (has), Red (missing)
  * Click cell to toggle
  * Save changes button
  * Export to CSV

- [ ] Create `PermissionFormModal.tsx`
  * Permission code (e.g., "USER_CREATE")
  * Permission name (e.g., "Create User")
  * Description
  * Category dropdown
  * Resource type
  * Active toggle

- [ ] Create `PermissionStatisticsCard.tsx`
  * Permissions by category (pie chart)
  * Most assigned permissions (bar chart)
  * Least assigned permissions
  * Unused permissions warning

- [ ] Create `BulkPermissionAssignment.tsx`
  * Select multiple roles
  * Select multiple permissions
  * Assign/remove action
  * Preview affected users
  * Confirm and execute

**API Endpoints to Use**:
- `GET /api/permissions` - List all permissions
- `GET /api/permissions/{id}` - Get permission details
- `POST /api/permissions` - Create permission
- `PUT /api/permissions/{id}` - Update permission
- `DELETE /api/permissions/{id}` - Delete permission
- `GET /api/permissions/category/{category}` - By category
- `GET /api/permissions/matrix` - Role-permission matrix
- `POST /api/permissions/bulk/assign` - Bulk assign
- `POST /api/permissions/bulk/remove` - Bulk remove
- `GET /api/permissions/statistics` - Permission statistics
- `GET /api/permissions/{id}/roles` - Roles with permission
- `GET /api/permissions/{id}/users` - Users with permission

**Files to Create**:
- `src/app/dashboard/admin/permissions/page.tsx` (400 lines)
- `src/components/permissions/PermissionMatrix.tsx` (350 lines)
- `src/components/permissions/PermissionFormModal.tsx` (200 lines)
- `src/components/permissions/PermissionStatisticsCard.tsx` (150 lines)
- `src/components/permissions/BulkPermissionAssignment.tsx` (250 lines)
- `src/lib/api/permissions.api.ts` (200 lines)

**Acceptance Criteria**:
- ✅ Permission list shows all permissions grouped
- ✅ Matrix view displays role-permission relationships
- ✅ Bulk assignment affects multiple roles at once
- ✅ Statistics show permission usage
- ✅ Create/edit/delete permissions works

---

### Day 16-18: System Settings Module ⭐ NEW
**Status**: 0% (placeholder exists)  
**API**: 5 endpoints ready ✅

**Tasks**:
- [ ] Replace placeholder in `apps/hospital-portal-web/src/app/dashboard/admin/settings/page.tsx`

- [ ] Create `SystemSettingsPage.tsx` with tabs
  * **Tab 1: General Settings**
    - System name
    - Timezone
    - Date format
    - Currency
    - Language
    - Logo upload
  * **Tab 2: Email Settings**
    - SMTP server
    - Port
    - Username/password
    - From email
    - Test email button
  * **Tab 3: Security Settings**
    - Password policy (min length, complexity)
    - Session timeout (minutes)
    - Max login attempts
    - Account lockout duration
    - MFA enforcement (optional/required)
    - IP whitelist/blacklist
  * **Tab 4: HIPAA Compliance**
    - Audit log retention (days)
    - Data encryption toggle
    - Automatic logout (minutes)
    - Privacy policy URL
    - Terms of service URL
    - Consent form templates
  * **Tab 5: Backup & Recovery**
    - Backup frequency
    - Backup retention
    - Last backup timestamp
    - Backup now button
    - Restore from backup
  * **Tab 6: Integrations**
    - API keys management
    - Webhook URLs
    - Third-party integrations toggle
    - HL7 settings
    - FHIR settings

- [ ] Create `SettingFormField.tsx` component
  * Reusable form field
  * Label, description, validation
  * Text, number, toggle, select, file upload
  * Save on blur or explicit save button

- [ ] Create `EmailTestModal.tsx`
  * Enter test email address
  * Send test email
  * Show success/error message

- [ ] Create `BackupRestoreModal.tsx`
  * Upload backup file
  * Confirm restore (warning message)
  * Progress bar
  * Success/error message

**API Endpoints to Use**:
- `GET /api/system-settings` - Get all settings
- `GET /api/system-settings/{key}` - Get setting by key
- `PUT /api/system-settings` - Update settings
- `POST /api/system-settings/test-email` - Send test email
- `GET /api/system-settings/categories` - Get categories

**Files to Create**:
- Update `src/app/dashboard/admin/settings/page.tsx` (500 lines)
- `src/components/settings/SettingFormField.tsx` (150 lines)
- `src/components/settings/EmailTestModal.tsx` (100 lines)
- `src/components/settings/BackupRestoreModal.tsx` (150 lines)
- `src/lib/api/settings.api.ts` (100 lines)

**Acceptance Criteria**:
- ✅ All 6 tabs render correctly
- ✅ Settings save/load correctly
- ✅ Test email sends successfully
- ✅ Validation works on all fields
- ✅ Backup/restore flow works (if backend supports)

---

### Day 19-20: Week 3-4 Buffer & Polish
- Polish UI/UX for admin modules
- Fix bugs found during development
- Write basic component tests
- Update documentation

---

## WEEK 5-6: Compliance & Security (10 days)

**Goal**: HIPAA compliance and security features

### Day 21-23: Audit Logs Module ⭐ CRITICAL (HIPAA)
**Status**: 0% (placeholder exists)  
**API**: Dashboard endpoints + custom queries ✅

**Tasks**:
- [ ] Replace placeholder in `apps/hospital-portal-web/src/app/dashboard/admin/audit-logs/page.tsx`

- [ ] Create `AuditLogViewer.tsx` - Main component
  * Table with pagination
  * Columns: Timestamp, User, Action, Resource, IP Address, Status
  * Click row to view details
  * Color-code by action type
  * Auto-refresh toggle (every 30 seconds)

- [ ] Create `AuditLogFilters.tsx`
  * Date range picker
  * User search/select
  * Action type multi-select
  * Resource type filter
  * Status filter (success/failure)
  * IP address filter
  * Department filter
  * Clear all button
  * Save filter preset

- [ ] Create `AuditLogDetailsModal.tsx`
  * Full audit log entry
  * Before/after values (diff view)
  * Request/response details
  * User info card
  * Timestamp details
  * Related logs

- [ ] Create `UserActivityTimeline.tsx`
  * Select user
  * Vertical timeline of all activities
  * Group by day
  * Filter by action type
  * Export to PDF

- [ ] Create `ComplianceReport.tsx`
  * HIPAA compliance metrics
  * Access patterns analysis
  * Suspicious activity alerts
  * Data breach detection
  * Export to PDF report

- [ ] Create `AuditLogExport.tsx`
  * Date range selection
  * Filter options
  * Export format (CSV/JSON/PDF)
  * Email report option
  * Schedule recurring reports

**API Endpoints to Use**:
- `GET /api/audit-logs` - List audit logs with filters
- `GET /api/audit-logs/{id}` - Get audit log details
- `GET /api/audit-logs/user/{userId}` - User activity
- `GET /api/audit-logs/resource/{resourceType}/{resourceId}` - Resource history
- `GET /api/audit-logs/compliance-report` - HIPAA compliance report
- `GET /api/audit-logs/export` - Export audit logs

**Note**: If audit log endpoints don't exist, use raw SQL queries via custom endpoint:
```sql
SELECT * FROM audit_log 
WHERE created_at BETWEEN @start AND @end
AND user_id = @userId
ORDER BY created_at DESC;
```

**Files to Create**:
- Update `src/app/dashboard/admin/audit-logs/page.tsx` (400 lines)
- `src/components/audit/AuditLogViewer.tsx` (300 lines)
- `src/components/audit/AuditLogFilters.tsx` (200 lines)
- `src/components/audit/AuditLogDetailsModal.tsx` (250 lines)
- `src/components/audit/UserActivityTimeline.tsx` (250 lines)
- `src/components/audit/ComplianceReport.tsx` (200 lines)
- `src/components/audit/AuditLogExport.tsx` (150 lines)
- `src/lib/api/audit.api.ts` (150 lines)

**Acceptance Criteria**:
- ✅ Audit logs display with filters
- ✅ Details modal shows before/after values
- ✅ User activity timeline works
- ✅ Compliance report generates
- ✅ Export to CSV/PDF works
- ✅ Auto-refresh works

---

### Day 24-25: Document Sharing Module (ABAC)
**Status**: 0% (not started)  
**API**: 7 endpoints ready ✅

**Tasks**:
- [ ] Create `apps/hospital-portal-web/src/app/dashboard/admin/document-sharing/page.tsx`
  * Document types list
  * Access rules list
  * Statistics (total rules, active, documents shared)

- [ ] Create `DocumentTypeFormModal.tsx`
  * Type name
  * Description
  * File extensions allowed
  * Max file size
  * Retention period
  * HIPAA category

- [ ] Create `AccessRuleFormModal.tsx` - ABAC Policy Builder
  * Rule name
  * Document type
  * **Conditions Builder**:
    - Attribute: User role, department, location, time
    - Operator: equals, not equals, contains, in
    - Value: Select or input
    - Add AND/OR conditions
  * **Actions**: Read, Write, Delete, Share
  * Active toggle
  * Priority (order of evaluation)

- [ ] Create `DocumentAccessManager.tsx`
  * Select document
  * Current access list (users/roles with access)
  * Grant access button → opens modal
  * Revoke access button
  * Audit trail (who accessed when)

- [ ] Create `GrantAccessModal.tsx`
  * Select users or roles
  * Select permissions (read/write/delete/share)
  * Expiry date (optional)
  * Reason for access (required)
  * Confirm button

**API Endpoints to Use**:
- `GET /api/document-types` - List document types
- `POST /api/document-types` - Create document type
- `GET /api/document-access-rules` - List access rules
- `POST /api/document-access-rules` - Create rule
- `PUT /api/document-access-rules/{id}` - Update rule
- `POST /api/document-access-rules/{id}/grant` - Grant access
- `POST /api/document-access-rules/{id}/revoke` - Revoke access

**Files to Create**:
- `src/app/dashboard/admin/document-sharing/page.tsx` (300 lines)
- `src/components/documents/DocumentTypeFormModal.tsx` (150 lines)
- `src/components/documents/AccessRuleFormModal.tsx` (350 lines)
- `src/components/documents/DocumentAccessManager.tsx` (250 lines)
- `src/components/documents/GrantAccessModal.tsx` (150 lines)
- `src/lib/api/documents.api.ts` (150 lines)

**Acceptance Criteria**:
- ✅ Document types CRUD works
- ✅ ABAC rule builder creates complex rules
- ✅ Access grant/revoke works
- ✅ Audit trail shows access history

---

### Day 26-27: MFA & Profile Settings
**Status**: 0% (not started)  
**API**: Partial (User Management endpoints) ✅

**Tasks**:
- [ ] Create `apps/hospital-portal-web/src/app/dashboard/profile/page.tsx`
  * Profile information card
  * Security section
  * Notification preferences
  * Avatar upload

- [ ] Create `MFAEnrollmentWizard.tsx` - 4 steps
  * **Step 1: Choose method**
    - Authenticator app (Google/Microsoft)
    - SMS
    - Email
  * **Step 2: Setup**
    - QR code display (for authenticator)
    - Enter phone number (for SMS)
  * **Step 3: Verify**
    - Enter 6-digit code
    - Validate code
  * **Step 4: Backup codes**
    - Display 10 backup codes
    - Download codes
    - Print codes
    - Confirm saved

- [ ] Create `DeviceManagementModal.tsx`
  * List trusted devices
  * Device info (name, IP, last used)
  * Remove device button
  * Trust this device checkbox (on login)

- [ ] Create `ProfileEditForm.tsx`
  * First name, last name
  * Email (read-only)
  * Phone number
  * Department
  * Job title
  * Avatar upload
  * Save button

- [ ] Create `ChangePasswordModal.tsx`
  * Current password
  * New password
  * Confirm password
  * Password strength indicator
  * Submit button

**API Endpoints to Use**:
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update profile
- `POST /api/users/{id}/change-password` - Change password
- `POST /api/users/{id}/mfa/enable` - Enable MFA
- `POST /api/users/{id}/mfa/verify` - Verify MFA code
- `GET /api/users/{id}/mfa/backup-codes` - Get backup codes
- `POST /api/users/{id}/avatar` - Upload avatar

**Files to Create**:
- `src/app/dashboard/profile/page.tsx` (300 lines)
- `src/components/profile/MFAEnrollmentWizard.tsx` (400 lines)
- `src/components/profile/DeviceManagementModal.tsx` (150 lines)
- `src/components/profile/ProfileEditForm.tsx` (200 lines)
- `src/components/profile/ChangePasswordModal.tsx` (150 lines)

**Acceptance Criteria**:
- ✅ MFA enrollment completes successfully
- ✅ QR code displays for authenticator apps
- ✅ Backup codes download works
- ✅ Device management works
- ✅ Profile edit saves correctly
- ✅ Password change with validation works

---

### Day 28-30: Week 5-6 Polish & Integration
- Polish all new features
- Fix cross-feature integration bugs
- Performance optimization
- Write integration tests
- Update user documentation

---

## WEEK 7: Testing Phase (5 days)

**Goal**: Basic test coverage for critical paths

### Day 31-32: Backend Unit Tests
**Framework**: xUnit for .NET

**Tasks**:
- [ ] Install testing packages
  ```bash
  cd microservices/auth-service/AuthService.Tests
  dotnet add package xunit
  dotnet add package xunit.runner.visualstudio
  dotnet add package Moq
  dotnet add package FluentAssertions
  ```

- [ ] Create test project structure
  ```
  AuthService.Tests/
  ├── Services/
  │   ├── UserServiceTests.cs
  │   ├── RoleServiceTests.cs
  │   ├── PermissionServiceTests.cs
  │   └── TenantServiceTests.cs
  ├── Controllers/
  │   ├── AuthControllerTests.cs
  │   └── UsersControllerTests.cs
  └── Helpers/
      └── TestDbContext.cs
  ```

- [ ] Write critical service tests
  * UserService: Create, update, delete, search
  * RoleService: Assign/remove permissions
  * PermissionService: Check permissions
  * TenantService: Tenant isolation

- [ ] Write controller tests
  * AuthController: Login, token validation
  * UsersController: CRUD operations

**Target**: 50+ unit tests, 60%+ coverage on services

---

### Day 33-34: Frontend Tests
**Framework**: Jest + React Testing Library

**Tasks**:
- [ ] Configure testing setup
  ```bash
  cd apps/hospital-portal-web
  pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
  ```

- [ ] Create test files
  ```
  src/
  ├── components/
  │   ├── ui/
  │   │   ├── StatCard.test.tsx
  │   │   ├── StatusBadge.test.tsx
  │   │   └── SearchFilter.test.tsx
  │   └── patients/
  │       └── PatientFormModal.test.tsx
  └── lib/
      └── api/patients.api.test.ts
  ```

- [ ] Write component tests
  * UI components: Render, props, events
  * Form modals: Validation, submission
  * API services: Mock responses

**Target**: 30+ component tests, critical UI paths covered

---

### Day 35: E2E Tests (Critical Flows)
**Framework**: Playwright or Cypress

**Tasks**:
- [ ] Install Playwright
  ```bash
  cd apps/hospital-portal-web
  pnpm add -D @playwright/test
  pnpx playwright install
  ```

- [ ] Write E2E tests for critical flows
  * **Login flow**: Login → Dashboard → Logout
  * **Patient registration**: Create patient → View details
  * **Appointment booking**: Create appointment → View calendar
  * **Role management**: Create role → Assign permissions
  * **Permission check**: Login as limited user → Access denied

- [ ] Configure CI test run
  ```yaml
  # .github/workflows/e2e-tests.yml
  name: E2E Tests
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - run: pnpm install
        - run: pnpx playwright test
  ```

**Target**: 5-8 E2E tests for critical workflows

---

## WEEK 8: Deployment & Launch (5 days)

**Goal**: Production deployment with monitoring

### Day 36-37: Azure Infrastructure Setup

**Tasks**:
- [ ] Create Azure resources
  ```powershell
  # Login to Azure
  az login
  
  # Create resource group
  az group create --name hospital-portal-prod --location eastus
  
  # Create App Service Plan
  az appservice plan create --name hospital-portal-plan --resource-group hospital-portal-prod --sku B1 --is-linux
  
  # Create Web App (Backend)
  az webapp create --name hospital-portal-api --resource-group hospital-portal-prod --plan hospital-portal-plan --runtime "DOTNETCORE:8.0"
  
  # Create Static Web App (Frontend)
  az staticwebapp create --name hospital-portal-web --resource-group hospital-portal-prod --location eastus
  
  # Create Azure PostgreSQL
  az postgres flexible-server create --name hospital-portal-db --resource-group hospital-portal-prod --location eastus --admin-user adminuser --admin-password <password> --sku-name Standard_B2s --version 14
  
  # Create Key Vault
  az keyvault create --name hospital-portal-vault --resource-group hospital-portal-prod --location eastus
  
  # Create Application Insights
  az monitor app-insights component create --app hospital-portal-insights --location eastus --resource-group hospital-portal-prod
  ```

- [ ] Configure Key Vault secrets
  * Database connection string
  * JWT secret key
  * SMTP credentials
  * API keys

- [ ] Configure networking
  * VNet for database
  * Firewall rules
  * SSL certificates
  * Custom domain (if applicable)

---

### Day 38-39: CI/CD Pipelines

**Tasks**:
- [ ] Create GitHub Actions workflow for backend
  ```yaml
  # .github/workflows/backend-deploy.yml
  name: Deploy Backend
  on:
    push:
      branches: [main]
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: actions/setup-dotnet@v1
          with:
            dotnet-version: '8.0.x'
        - run: dotnet build
        - run: dotnet test
        - run: dotnet publish -c Release
        - uses: azure/webapps-deploy@v2
          with:
            app-name: hospital-portal-api
            publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
  ```

- [ ] Create GitHub Actions workflow for frontend
  ```yaml
  # .github/workflows/frontend-deploy.yml
  name: Deploy Frontend
  on:
    push:
      branches: [main]
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: actions/setup-node@v2
          with:
            node-version: '18'
        - run: pnpm install
        - run: pnpm build
        - uses: Azure/static-web-apps-deploy@v1
          with:
            azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
            app_location: "apps/hospital-portal-web"
            output_location: "out"
  ```

- [ ] Configure environment variables
  * Production connection string
  * API URLs
  * Feature flags

- [ ] Set up blue-green deployment slots

---

### Day 40: Monitoring, Documentation & Launch

**Tasks**:
- [ ] Configure Application Insights
  * Backend logging
  * Frontend telemetry
  * Custom metrics (appointments created, patients registered)
  * Alerts (error rate, response time)

- [ ] Set up monitoring dashboards
  * Azure Monitor dashboard
  * Database performance
  * API response times
  * Error tracking

- [ ] Create operational documentation
  * Deployment guide
  * Rollback procedures
  * Monitoring guide
  * Troubleshooting guide
  * Disaster recovery plan

- [ ] Final pre-launch checklist
  - [ ] All tests passing
  - [ ] Security scan completed
  - [ ] Performance testing done
  - [ ] Backup system tested
  - [ ] Monitoring alerts configured
  - [ ] Documentation complete
  - [ ] Team training completed

- [ ] **LAUNCH** 🚀
  * Deploy to production
  * Smoke test critical flows
  * Monitor for 24 hours
  * Announce to users

---

## 📊 PROGRESS TRACKING

### Week 1-2 Milestones
- [ ] Appointments calendar fully functional
- [ ] Patients management complete with all tabs
- [ ] Clinical examinations workflow complete
- [ ] 10+ new React components created
- [ ] All healthcare APIs integrated

### Week 3-4 Milestones
- [ ] Roles management with permission grid complete
- [ ] Permissions management with matrix view complete
- [ ] System settings with 6 tabs complete
- [ ] 15+ new components for admin features
- [ ] All admin APIs integrated

### Week 5-6 Milestones
- [ ] Audit logs with filters and export complete
- [ ] Document sharing with ABAC complete
- [ ] MFA enrollment wizard complete
- [ ] Profile settings complete
- [ ] HIPAA compliance features verified

### Week 7 Milestones
- [ ] 50+ backend unit tests written
- [ ] 30+ frontend component tests written
- [ ] 5-8 E2E tests for critical flows
- [ ] CI/CD configured for automated testing

### Week 8 Milestones
- [ ] Azure infrastructure deployed
- [ ] CI/CD pipelines operational
- [ ] Monitoring and alerts configured
- [ ] Documentation complete
- [ ] **Production launch** 🎉

---

## 🚨 RISK MITIGATION

### Technical Risks
1. **Calendar integration complexity**
   - Mitigation: Use proven library (FullCalendar)
   - Fallback: Table view with filters

2. **ABAC rule engine complexity**
   - Mitigation: Start with simple attribute checks
   - Fallback: Role-based only initially

3. **Testing time constraints**
   - Mitigation: Focus on critical paths first
   - Fallback: Manual testing for low-priority features

4. **Azure deployment issues**
   - Mitigation: Test in staging environment first
   - Fallback: Extended timeline for deployment troubleshooting

### Resource Risks
1. **Single developer bottleneck**
   - Mitigation: Prioritize ruthlessly, use proven patterns
   - Fallback: Defer nice-to-have features

2. **API endpoint gaps**
   - Mitigation: All 162 endpoints already implemented
   - Fallback: Create custom endpoints as needed

---

## 📝 DAILY STANDUP FORMAT

**Daily Questions**:
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers?
4. On track for weekly milestone?

**Weekly Review**:
1. Milestone achieved? (Yes/No + %)
2. What went well?
3. What slowed us down?
4. Adjustments for next week?

---

## ✅ DEFINITION OF DONE

### For Each Feature
- [ ] Code written and peer reviewed
- [ ] Component/page renders without errors
- [ ] API integration tested (200 OK responses)
- [ ] Basic validation works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Error messages display correctly
- [ ] Loading states implemented
- [ ] Merged to main branch

### For Each Module
- [ ] All features in module complete
- [ ] API endpoints integrated
- [ ] Basic tests written
- [ ] Documentation updated
- [ ] Demo recorded (optional)

### For Production Launch
- [ ] All modules pass definition of done
- [ ] Tests passing (unit + integration + E2E)
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Backup/restore tested
- [ ] Deployed to production
- [ ] Smoke tests passed

---

## 🎉 SUCCESS METRICS

### Launch Day Metrics
- Zero critical bugs in production
- < 2 second page load time
- 99.9% API uptime
- All critical workflows functional

### Week 1 Post-Launch
- 5+ hospitals onboarded
- 100+ users registered
- 50+ appointments created
- Zero data breaches
- User satisfaction > 4/5

### Month 1 Post-Launch
- 20+ hospitals using system
- 1000+ users
- 10,000+ appointments
- 5,000+ patients registered
- HIPAA audit passed

---

**Let's build this! 🚀**

Start Date: November 11, 2025  
Target Launch: January 6, 2026  
Days: 56 working days  
Success Rate: 95% achievable with focus and execution

