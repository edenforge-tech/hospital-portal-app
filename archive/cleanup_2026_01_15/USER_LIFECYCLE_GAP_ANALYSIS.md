# User Lifecycle Implementation - Gap Analysis

**Date**: December 26, 2025  
**Current Status**: ~60% Complete

---

## ✅ IMPLEMENTED (What We Have)

### 1. Create User - Personal/Employee Info ✅ COMPLETE
**Status**: Fully implemented with healthcare standards

**Frontend**: `UserForm.tsx`
- ✅ Personal Information: firstName, lastName, dateOfBirth, gender
- ✅ Contact Information: email, userName, phoneNumber
- ✅ Professional Information: designation, employeeId, qualifications, specialization, licenseNumber
- ✅ System Information: userType, roleId, mainDepartmentId, subDepartmentId, branchId
- ✅ 4 organized sections with proper UX
- ✅ Hierarchical department selection (Main → Sub cascade)

**Backend**: `UsersController.cs` POST `/api/users`
- ✅ Complete AppUser entity with all healthcare fields
- ✅ Password hashing via ASP.NET Identity
- ✅ Tenant isolation enforcement

**Database**: `users` table
- ✅ All fields: FirstName, LastName, DateOfBirth, Gender, Qualifications, Specialization, EmployeeId, Designation, LicenseNumber, OrganizationId, BranchId, UserStatus, etc.

---

### 2. Assign Departments ✅ MOSTLY COMPLETE
**Status**: Multi-department with granular permissions implemented

**Frontend**: `UserDepartmentAccessModal.tsx`
- ✅ Assign multiple departments to user
- ✅ Set primary department (`is_primary` flag)
- ✅ Granular permissions: canView, canCreate, canEdit, canDelete, canApprove, canExport
- ✅ Access type: Full Access, Read-Only Access, Restricted Access
- ✅ Effective date range (effective_from, effective_until)
- ✅ Role-based department filtering (shows department type icons)

**Backend**: `UserDepartmentAccessController.cs`
- ✅ POST `/api/user-department-access/bulk-assign` - Assign multiple departments
- ✅ GET `/api/user-department-access/user/{userId}` - Get all user departments
- ✅ DELETE `/api/user-department-access/{id}` - Remove department access
- ✅ PUT `/api/user-department-access/{id}/set-primary` - Set primary department

**Database**: `user_department_access` table
- ✅ Fields: user_id, department_id, role_id, is_primary, access_type, status, effective_from, effective_until, granted_at, granted_by_user_id

**Gap**: 
- ⚠️ No role-based department suggestions (e.g., "Doctors should be assigned to OPD/Emergency/ICU")
- ⚠️ No workflow validation (e.g., "Pharmacists must have Pharmacy department")

---

### 3. Link Branches ⚠️ PARTIAL
**Status**: Single branch only, needs multi-branch support

**Frontend**: `UserForm.tsx`
- ✅ Single branch selection dropdown
- ❌ **MISSING**: Multi-branch assignment UI
- ❌ **MISSING**: Default branch designation

**Backend**: 
- ✅ `users.BranchId` (single branch)
- ✅ `app_user_roles.branch_id` (supports multiple entries)
- ❌ **MISSING**: Dedicated multi-branch API endpoint

**Database**:
- ✅ Schema supports multi-branch (app_user_roles can have multiple rows)
- ⚠️ UI only allows ONE branch currently

**Recommendation**: 
```tsx
// Add BranchAssignmentModal similar to UserDepartmentAccessModal
<BranchAssignmentModal 
  userId={user.id} 
  branches={allBranches}
  onSave={handleBranchSave}
/>
```

---

### 4. Manage User - Disable/Audit Trail ✅ PARTIAL
**Status**: Deactivate works, audit trails exist, password reset missing

**Frontend**: `users/page.tsx`
- ✅ "Deactivate" button (changes UserStatus to "Inactive")
- ❌ **MISSING**: "Reset Password" button
- ❌ **MISSING**: Audit trail viewer UI

**Backend**: `UsersController.cs`
- ✅ POST `/api/users/{id}/deactivate` - Sets UserStatus to "Inactive"
- ❌ **MISSING**: POST `/api/users/{id}/reset-password` endpoint
- ❌ **MISSING**: GET `/api/users/{id}/audit-trail` endpoint

**Database**: 
- ✅ Audit columns: created_at, updated_at, created_by_user_id, updated_by_user_id
- ✅ 28 audit triggers on critical tables (patients, appointments, clinical data)
- ⚠️ No dedicated `user_audit_log` table for user management actions

---

## ❌ NOT IMPLEMENTED (Critical Gaps)

### 5. Assign Permission Template ❌ MISSING
**Status**: Not implemented at all

**What's Needed**:
```tsx
// Frontend Component
<PermissionTemplateSelector 
  userId={user.id}
  roleId={user.roleId}
  availableTemplates={[
    { id: 1, name: "Doctor - Full Access", permissions: [...] },
    { id: 2, name: "Nurse - Clinical Only", permissions: [...] },
    { id: 3, name: "Receptionist - Front Desk", permissions: [...] }
  ]}
  onApply={handleApplyTemplate}
/>
```

**Backend**:
- ❌ `permission_templates` table doesn't exist
- ❌ No `/api/permission-templates` endpoints
- ❌ No template-to-user assignment API

**Database Schema Needed**:
```sql
CREATE TABLE permission_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    role_id UUID, -- Optional: associate with role
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID
);

CREATE TABLE permission_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES permission_templates(id),
    permission_id UUID REFERENCES permissions(id),
    granted BOOLEAN DEFAULT true
);

CREATE TABLE user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    permission_id UUID REFERENCES permissions(id),
    granted BOOLEAN, -- true=grant, false=revoke
    applied_at TIMESTAMP DEFAULT NOW(),
    applied_by_user_id UUID
);
```

**UI Flow**:
1. Admin clicks "Assign Template" on user
2. Modal shows pre-configured templates (e.g., "Doctor - Full Access")
3. Select template → shows 297 permissions with checkboxes
4. Click "Apply" → grants permissions to user
5. Option: "Allow fine-tuning" → user can override specific permissions

---

### 6. Security Setup - IP Restrictions ❌ MISSING
**Status**: Not implemented

**What's Needed**:
```tsx
// Frontend Component
<SecuritySettingsModal 
  userId={user.id}
  accessMode={accessMode} // "Open" | "Restricted IP"
  allowedIPs={["192.168.1.0/24", "10.0.0.5"]}
  roleOverrides={["Admin", "Security Officer"]} // Bypass IP restrictions
  onSave={handleSecuritySave}
/>
```

**Backend**:
- ❌ No IP restriction middleware
- ❌ No `/api/users/{id}/security-settings` endpoint

**Database Schema Needed**:
```sql
ALTER TABLE users ADD COLUMN access_mode VARCHAR(20) DEFAULT 'Open' 
    CHECK (access_mode IN ('Open', 'IP-Restricted', 'Geo-Restricted'));

CREATE TABLE user_ip_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    ip_address INET NOT NULL, -- PostgreSQL IP type
    ip_range CIDR, -- e.g., 192.168.1.0/24
    description VARCHAR(200),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_security_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id),
    bypass_ip_restrictions BOOLEAN DEFAULT false,
    bypass_geo_restrictions BOOLEAN DEFAULT false,
    bypass_time_restrictions BOOLEAN DEFAULT false
);
```

**Middleware Implementation**:
```csharp
// Program.cs
app.UseMiddleware<IpRestrictionMiddleware>();

// Middleware/IpRestrictionMiddleware.cs
public class IpRestrictionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        var user = context.User;
        if (user.Identity?.IsAuthenticated == true)
        {
            var userId = user.FindFirst("sub")?.Value;
            var userSettings = await _db.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.AccessMode })
                .FirstOrDefaultAsync();
                
            if (userSettings?.AccessMode == "IP-Restricted")
            {
                var clientIp = context.Connection.RemoteIpAddress;
                var allowed = await _db.UserIpWhitelist
                    .AnyAsync(w => w.UserId == userId && 
                                   (w.IpAddress == clientIp || w.IpRange.Contains(clientIp)));
                                   
                if (!allowed)
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("Access denied: IP not whitelisted");
                    return;
                }
            }
        }
        await _next(context);
    }
}
```

---

### 7. Activate User - One-Time Password ❌ MISSING
**Status**: Not implemented

**What's Needed**:
```tsx
// Frontend Component
<UserActivationModal 
  userId={user.id}
  userName={user.userName}
  email={user.email}
  onGenerateOTP={handleGenerateOTP} // Sends email with temp password
  onActivate={handleActivate} // Changes status to "Active"
/>
```

**Backend**:
- ❌ No POST `/api/users/{id}/activate` endpoint
- ❌ No POST `/api/users/{id}/generate-otp` endpoint
- ❌ No email service integration for OTP delivery

**Database Schema Needed**:
```sql
ALTER TABLE users 
    ADD COLUMN activation_status VARCHAR(20) DEFAULT 'Pending' 
        CHECK (activation_status IN ('Pending', 'Active', 'Suspended', 'Locked'));
    
ALTER TABLE users 
    ADD COLUMN one_time_password_hash VARCHAR(500),
    ADD COLUMN otp_expires_at TIMESTAMP,
    ADD COLUMN must_reset_password BOOLEAN DEFAULT true,
    ADD COLUMN last_password_change TIMESTAMP;
```

**Backend Implementation**:
```csharp
// UsersController.cs
[HttpPost("{id}/generate-otp")]
[RequirePermission("user.activate")]
public async Task<IActionResult> GenerateOTP(Guid id)
{
    var user = await _userManager.FindByIdAsync(id.ToString());
    if (user == null) return NotFound();
    
    // Generate random 12-char password
    var otp = GenerateSecurePassword(12);
    var otpHash = _passwordHasher.HashPassword(user, otp);
    
    user.OneTimePasswordHash = otpHash;
    user.OtpExpiresAt = DateTime.UtcNow.AddHours(24);
    user.MustResetPassword = true;
    user.ActivationStatus = "Pending";
    await _userManager.UpdateAsync(user);
    
    // Send email with OTP
    await _emailService.SendOTPEmail(user.Email, otp);
    
    return Ok(new { message = "OTP sent to user email" });
}

[HttpPost("{id}/activate")]
[RequirePermission("user.activate")]
public async Task<IActionResult> ActivateUser(Guid id)
{
    var user = await _userManager.FindByIdAsync(id.ToString());
    if (user == null) return NotFound();
    
    user.ActivationStatus = "Active";
    user.UserStatus = "Active";
    await _userManager.UpdateAsync(user);
    
    return Ok(new { message = "User activated" });
}
```

**UI Flow**:
1. Create user → Status: "Pending Activation"
2. Admin clicks "Activate User" → generates OTP → sends email
3. User receives email: "Your temporary password is: Xk9$mP2#qL7!"
4. User logs in with OTP → forced to change password on first login
5. After password change → Status: "Active", MustResetPassword: false

---

### 8. Reset Password ❌ MISSING
**Status**: Deactivate exists, but no password reset

**What's Needed**:
```tsx
// Frontend Component (in users/page.tsx actions)
<button onClick={() => handleResetPassword(user.id)}>
  Reset Password
</button>

// Modal shows: "Send password reset link to user@example.com?"
```

**Backend**:
```csharp
// UsersController.cs
[HttpPost("{id}/reset-password")]
[RequirePermission("user.manage")]
public async Task<IActionResult> ResetPassword(Guid id)
{
    var user = await _userManager.FindByIdAsync(id.ToString());
    if (user == null) return NotFound();
    
    // Generate reset token
    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
    
    // Send reset email
    var resetUrl = $"https://your-app.com/reset-password?token={resetToken}&userId={id}";
    await _emailService.SendPasswordResetEmail(user.Email, resetUrl);
    
    return Ok(new { message = "Password reset email sent" });
}
```

---

## 📊 IMPLEMENTATION PRIORITY MATRIX

| Feature | Impact | Effort | Priority | Status |
|---------|--------|--------|----------|---------|
| **Multi-Branch Assignment** | High | Medium | 🔥 P1 | Not Started |
| **Permission Templates** | High | High | 🔥 P1 | Not Started |
| **User Activation (OTP)** | High | Medium | 🔥 P1 | Not Started |
| **Password Reset** | High | Low | 🟡 P2 | Not Started |
| **IP Restrictions** | Medium | High | 🟢 P3 | Not Started |
| **Audit Trail Viewer** | Medium | Low | 🟡 P2 | Not Started |
| **Role-Based Dept Suggestions** | Low | Medium | 🟢 P3 | Not Started |

---

## 🎯 RECOMMENDED IMPLEMENTATION SEQUENCE

### Phase 1: Critical User Management (Week 1-2)
1. **Multi-Branch Assignment** (2 days)
   - Create `BranchAssignmentModal.tsx`
   - Backend: GET/POST `/api/users/{id}/branches`
   - Update UserForm to show branch count badge

2. **User Activation Flow** (3 days)
   - Database: Add activation_status, one_time_password_hash, otp_expires_at
   - Backend: Generate OTP endpoint, email service integration
   - Frontend: Activation modal with OTP generation

3. **Password Reset** (1 day)
   - Backend: Password reset endpoint
   - Frontend: "Reset Password" button in user actions
   - Email template for reset link

### Phase 2: Permission Management (Week 3)
4. **Permission Templates** (5 days)
   - Database: permission_templates, permission_template_items, user_permission_overrides tables
   - Backend: Full CRUD for templates + apply-to-user endpoint
   - Frontend: PermissionTemplateSelector component
   - Seed default templates: "Doctor - Full", "Nurse - Clinical", "Receptionist - Front Desk"

### Phase 3: Security & Compliance (Week 4)
5. **Audit Trail Viewer** (2 days)
   - Backend: GET `/api/users/{id}/audit-trail` (query audit tables)
   - Frontend: Timeline component showing user history

6. **IP Restrictions** (3 days)
   - Database: user_ip_whitelist, role_security_overrides
   - Middleware: IpRestrictionMiddleware
   - Frontend: SecuritySettingsModal

### Phase 4: UX Enhancements (Week 5)
7. **Role-Based Department Suggestions** (2 days)
   - Backend: Add role-to-department mapping configuration
   - Frontend: Show suggested departments when role selected

---

## 📋 IMPLEMENTATION CHECKLIST

### Multi-Branch Assignment
- [ ] Create database migration for `user_branches` junction table
- [ ] Backend: `UserBranchesController.cs` with CRUD endpoints
- [ ] Frontend: `BranchAssignmentModal.tsx` component
- [ ] Update `users/page.tsx` to show branch count badge
- [ ] Test: Assign user to 3 branches, verify isolation

### Permission Templates
- [ ] Create 3 database tables (templates, items, overrides)
- [ ] Backend: `PermissionTemplatesController.cs` with 7 endpoints
- [ ] Frontend: `PermissionTemplateSelector.tsx` component
- [ ] Seed 5 default templates (Doctor, Nurse, Receptionist, Lab Tech, Pharmacist)
- [ ] Test: Apply template to user, verify permissions granted

### User Activation
- [ ] Database migration: Add activation columns to users table
- [ ] Backend: Email service integration (SendGrid/SMTP)
- [ ] Backend: OTP generation + activation endpoints
- [ ] Frontend: `UserActivationModal.tsx` component
- [ ] Email templates: OTP notification, activation confirmation
- [ ] Test: Generate OTP, user logs in, forces password reset

### Password Reset
- [ ] Backend: Password reset token generation endpoint
- [ ] Backend: Email service for reset link
- [ ] Frontend: "Reset Password" button in user actions
- [ ] Frontend: Password reset page (public route)
- [ ] Email template: Password reset instructions
- [ ] Test: Admin resets user password, user receives email, clicks link, sets new password

### IP Restrictions
- [ ] Database migration: Add user_ip_whitelist table
- [ ] Middleware: `IpRestrictionMiddleware.cs`
- [ ] Backend: IP whitelist CRUD endpoints
- [ ] Frontend: `SecuritySettingsModal.tsx` component
- [ ] Configuration: Role-based bypass for admins
- [ ] Test: Set IP restriction, access from different IP (should block)

### Audit Trail Viewer
- [ ] Backend: Query audit tables + format timeline data
- [ ] Frontend: `AuditTrailModal.tsx` with timeline UI
- [ ] Display: User created, roles changed, departments assigned, permissions modified, logins, password resets
- [ ] Export: CSV download of audit trail
- [ ] Test: Perform 10 user actions, verify all logged

---

## 🔍 FINAL SUMMARY

**Current Implementation**: 60%  
**Critical Gaps**: 40%

**What Works**:
- ✅ User creation with all healthcare fields
- ✅ Hierarchical department selection
- ✅ Multi-department assignment with granular permissions
- ✅ User deactivation
- ✅ Basic audit trail (database level)

**What's Missing**:
- ❌ Multi-branch assignment UI/API
- ❌ Permission templates system
- ❌ User activation workflow with OTP
- ❌ Password reset functionality
- ❌ IP-based access control
- ❌ Audit trail viewer UI

**Recommendation**: Prioritize **Multi-Branch**, **User Activation**, and **Permission Templates** first (Phase 1-2). These are essential for production-ready user management. IP restrictions and advanced security can follow in Phase 3-4.
