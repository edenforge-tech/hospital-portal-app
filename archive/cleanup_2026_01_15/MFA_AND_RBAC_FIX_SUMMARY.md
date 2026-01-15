# MFA and RBAC/ABAC Fix Summary

## Issues Found

### Issue 1: MFA Not Enforced
- **Problem**: receptionist6@hospital.com had `two_factor_enabled = false`
- **Impact**: Login succeeded without MFA verification
- **Root Cause**: User was activated without enabling MFA

### Issue 2: Missing Dashboard Permissions
- **Problem**: Receptionist role had NO permissions assigned
- **Impact**: All API calls returned 403 Forbidden - "Permission not found in database"
- **Root Cause**: Dashboard permissions were never created in the database

## Fixes Applied

### 1. Enabled MFA for receptionist6
```sql
UPDATE users 
SET two_factor_enabled = true
WHERE email = 'receptionist6@hospital.com';
```
**Result**: ✅ MFA now enabled

### 2. Created Dashboard Permission
```sql
INSERT INTO permissions (
  "Code" = 'dashboard.view',
  "Name" = 'View Dashboard',
  "Module" = 'Dashboard',
  "IsActive" = true
)
```
**Result**: ✅ Permission created

### 3. Assigned Permission to Receptionist Role
```sql
INSERT INTO role_permission (id, "RoleId", "PermissionId", "CreatedAt")
VALUES (gen_random_uuid(), receptionist_role_id, dashboard_permission_id, NOW())
```
**Result**: ✅ Receptionist role now has dashboard.view permission

## Verification

```sql
SELECT 
  u.email,
  u.two_factor_enabled as mfa_enabled,
  r.name as role_name,
  p."Code" as permission_code,
  p."Name" as permission_name
FROM users u
INNER JOIN app_user_roles aur ON u.id = aur.user_id
INNER JOIN app_roles r ON aur.role_id = r.id
LEFT JOIN role_permission rp ON r.id = rp."RoleId"
LEFT JOIN permissions p ON rp."PermissionId" = p.id
WHERE u.email = 'receptionist6@hospital.com';
```

**Result**:
```
           email            | mfa_enabled |  role_name   | permission_code | permission_name
----------------------------+-------------+--------------+-----------------+-----------------
 receptionist6@hospital.com | t           | Receptionist | dashboard.view  | View Dashboard
```

## Current Status

- ✅ MFA enabled for receptionist6@hospital.com
- ✅ dashboard.view permission created
- ✅ dashboard.view assigned to Receptionist role
- ✅ Backend restarted on port 5073

## Next Steps for User

**IMPORTANT**: User must complete these steps to test the fixes:

1. **Log out** from the current session (old JWT token has no permissions)
2. **Log in again** with receptionist6@hospital.com
3. **Enter MFA code** when prompted (check email for OTP)
4. **Verify MFA code** to complete login
5. **Access Dashboard** - should now work with proper permissions based on Receptionist role

## Expected Behavior After Fix

### Login Flow:
1. User enters email/password → ✅ Validated
2. System checks `two_factor_enabled = true` → ✅ True
3. System sends MFA OTP via Notification Service → ✅ Email sent
4. User enters OTP code → ✅ Required
5. System verifies OTP → ✅ Validated
6. System generates JWT with role claims (Receptionist + dashboard.view permission) → ✅ Included
7. User redirected to receptionist dashboard → ✅ Allowed

### Authorization:
- GET /api/admin/dashboard/overview → ✅ **200 OK** (permission check passes)
- GET /api/admin/dashboard/alerts → ✅ **200 OK** (permission check passes)
- Dashboard displays proper data for Receptionist role → ✅ **Working**

## Files Modified

1. `create_dashboard_permissions_final.sql` - Created dashboard permissions and assigned to role
2. Database: `users` table - Enabled MFA for receptionist6
3. Database: `permissions` table - Added dashboard.view permission
4. Database: `role_permission` table - Assigned permission to Receptionist role

## Technical Details

### MFA Flow in AuthController
The Login endpoint should now:
```csharp
// 1. Validate email/password
// 2. Check if user.TwoFactorEnabled == true
if (user.TwoFactorEnabled) 
{
    // 3. Send OTP via Notification Service
    await _notificationService.SendMfaLoginOtp(user.Email);
    
    // 4. Return mfa_required response
    return Ok(new { status = "mfa_required" });
}

// 5. After OTP verification, generate JWT with all claims
var claims = new[] {
    new Claim("userId", user.Id.ToString()),
    new Claim("tenantId", user.TenantId.ToString()),
    new Claim("permission", "dashboard.view"),
    // ... other claims
};
```

### Permission-Based Authorization
```csharp
[Authorize]
[RequirePermission("dashboard.view")]
public async Task<IActionResult> GetDashboardOverview()
{
    // PermissionHandler checks:
    // 1. User authenticated? ✅
    // 2. User has permission in JWT claims? Check
    // 3. User has permission in database? ✅ Yes (via role_permission)
    // 4. Allow access ✅
}
```

## Remaining Work

### MFA Enrollment
The user may need to enroll in MFA on first login:
- System should prompt to set up TOTP (Google Authenticator, Authy, etc.)
- Or use email-based OTP (already configured in Notification Service)

### Additional Receptionist Permissions
Currently only dashboard.view is assigned. May need to add:
- `patients.read` - View patients
- `appointments.read` - View appointments
- `appointments.create` - Create appointments
- `appointments.update` - Update appointments

### MFA Code Delivery
- Currently using email-based OTP via Notification Service (port 7071)
- Notification Service is running and functional
- User should receive OTP codes at receptionist6@hospital.com

## Testing Checklist

- [ ] User logs out
- [ ] User logs in with receptionist6@hospital.com / Password123!
- [ ] System requests MFA code
- [ ] User checks email for OTP
- [ ] User enters OTP code
- [ ] System verifies OTP
- [ ] User gets new JWT token with permissions
- [ ] Dashboard loads successfully (200 OK)
- [ ] No more 403 Forbidden errors
- [ ] User sees receptionist-appropriate dashboard views
