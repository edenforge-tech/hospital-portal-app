# TOTP Authenticator App MFA Implementation - Complete Fix

## Problem Identified

The user was able to login **without MFA verification** even though:
- `two_factor_enabled = true` in users table ✅
- `is_mfa_enabled = true` in user_mfa_settings table ✅
- `totp_enabled = true` with encrypted secret ✅
- TOTP enrolled on 2026-01-15 06:23:07 ✅

**Root Causes:**
1. **Backend Login Flow**: Tried to send email OTP via Notification Service, but on failure, continued with normal login (bypassing MFA)
2. **Frontend/Backend Mismatch**: Frontend sent `{email, mfaCode}` but backend expected `{userId, code, method}`

## Fixes Applied

### 1. Backend - AuthController.cs Login Method

**BEFORE (Lines 173-191):**
```csharp
// Check if MFA is required - via notification service
try {
    var mfaResult = await _notificationClient.SendMfaLoginOtpAsync(user.Id, "totp");
    if (mfaResult.Success) {
        return Ok(new { success = true, requiresMfa = true, userId = user.Id });
    }
} catch (Exception mfaEx) {
    _logger.LogInformation(mfaEx, "MFA not enabled or failed for user {UserId}", user.Id);
    // Continue with normal login if MFA fails ❌ BUG
}
// Generate JWT and login without MFA ❌
```

**AFTER (Fixed):**
```csharp
// Check if MFA/TOTP is required for this user
if (user.TwoFactorEnabled) {
    _logger.LogInformation("User {UserId} requires MFA verification", user.Id);
    
    // Return MFA required response - DO NOT send email OTP
    // User must enter TOTP code from their authenticator app
    return Ok(new {
        success = true,
        requiresMfa = true,
        userId = user.Id,
        email = user.Email,
        message = "Please enter the code from your authenticator app"
    });
}
// Only generate JWT after MFA verification ✅
```

**Key Changes:**
- ✅ Check `user.TwoFactorEnabled` flag directly (simple boolean check)
- ✅ **Do NOT send email OTP** - user already enrolled TOTP in authenticator app
- ✅ Return `requiresMfa: true` with `userId`
- ✅ **Stop login flow** - do NOT generate JWT yet

### 2. Frontend - login/page.tsx MFA Handling

**Changes Made:**

**A. Added State for userId:**
```tsx
const [mfaUserId, setMfaUserId] = useState('');
```

**B. Store userId When MFA Required:**
```tsx
if (data.requiresMfa) {
    console.log('MFA required for this user, userId:', data.userId);
    setMfaRequired(true);
    setMfaUserId(data.userId || '');  // ✅ Store userId from backend
    setMfaMethod(data.mfaMethod || 'authenticator');
    setIsLoading(false);
    return;
}
```

**C. Fixed MFA Verification Request:**
```tsx
// BEFORE:
body: JSON.stringify({
    email,           // ❌ Wrong
    mfaCode,         // ❌ Wrong property name
    isBackupCode     // ❌ Wrong format
})

// AFTER:
body: JSON.stringify({
    userId: mfaUserId,                              // ✅ Correct
    code: mfaCode,                                  // ✅ Correct property name
    method: useBackupCode ? 'backup' : 'totp'      // ✅ Correct format
})
```

**D. Reset State on Back to Login:**
```tsx
const handleBackToLogin = () => {
    setMfaRequired(false);
    setMfaCode('');
    setMfaUserId('');  // ✅ Reset userId
    setPassword('');
};
```

## MFA Flow - Expected Behavior

### User Has TOTP Enrolled (receptionist6@hospital.com)

**Step 1: User Enters Email/Password**
- User: `receptionist6@hospital.com` / `Password123!`
- Backend validates credentials ✅

**Step 2: Backend Checks two_factor_enabled**
```csharp
if (user.TwoFactorEnabled)  // true
{
    return Ok(new {
        success = true,
        requiresMfa = true,
        userId = "f52e4031-19a8-4d63-bc28-e8dc7c4c0a10",
        email = "receptionist6@hospital.com",
        message = "Please enter the code from your authenticator app"
    });
}
```

**Step 3: Frontend Displays MFA Input Screen**
- Shows: "Enter the code from your authenticator app"
- User opens Google Authenticator / Authy / Microsoft Authenticator
- Reads 6-digit TOTP code (e.g., `123456`)
- Enters code in frontend

**Step 4: Frontend Sends Verification Request**
```typescript
POST /api/auth/mfa/verify
Headers: { 'X-Tenant-ID': '155fe198-6ae5-4a01-9254-ead5b427247e' }
Body: {
  "userId": "f52e4031-19a8-4d63-bc28-e8dc7c4c0a10",
  "code": "123456",
  "method": "totp"
}
```

**Step 5: Backend Verifies TOTP Code**
- Calls Notification Service: `POST /api/mfa/verify-login`
- Notification Service:
  1. Fetches `totp_secret_encrypted` from `user_mfa_settings`
  2. Decrypts secret
  3. Validates TOTP code using OtpNet library
  4. Returns `{success: true}` if valid

**Step 6: Backend Generates JWT with Permissions**
```csharp
if (!success) return Unauthorized(new { message = "Invalid MFA code" });

var user = await _userManager.FindByIdAsync(request.UserId.ToString());
var roles = await _userManager.GetRolesAsync(user);  // ["Receptionist"]
var permissions = await _permissionService.GetUserPermissionsAsync(user.Id, user.TenantId);  // ["dashboard.view"]

return Ok(new LoginResponse {
    Success = true,
    AccessToken = _jwtService.GenerateToken(user, roles, permissions),  // ✅ JWT with permissions
    RefreshToken = _jwtService.GenerateRefreshToken(),
    ExpiresIn = 3600,
    User = new UserDto { ... },
    Roles = roles.ToList(),
    Permissions = permissions
});
```

**Step 7: Frontend Stores Auth and Redirects**
```typescript
setAuth(
    data.accessToken,    // JWT with permissions
    data.refreshToken,
    data.user,
    data.roles,          // ["Receptionist"]
    data.permissions,    // ["dashboard.view"]
    tenantId
);

router.push('/dashboard');  // ✅ Dashboard loads successfully
```

## Database State - receptionist6@hospital.com

```sql
-- users table
email: receptionist6@hospital.com
two_factor_enabled: true ✅
UserStatus: active
activation_status: active

-- user_mfa_settings table
user_id: f52e4031-19a8-4d63-bc28-e8dc7c4c0a10
is_mfa_enabled: true ✅
primary_method: totp ✅
totp_enabled: true ✅
totp_secret_encrypted: <encrypted_secret> ✅
enrolled_at: 2026-01-15 06:23:07.722681+00 ✅

-- app_user_roles table
user_id: f52e4031-19a8-4d63-bc28-e8dc7c4c0a10
role_id: <receptionist_role_id> ✅

-- role_permission table (via Receptionist role)
permission_id: <dashboard.view_id> ✅
```

## Testing Checklist

- [ ] User logs out completely
- [ ] User navigates to login page
- [ ] User enters `receptionist6@hospital.com` / `Password123!`
- [ ] Frontend shows: "Please enter the code from your authenticator app"
- [ ] User opens authenticator app (Google Authenticator/Authy/Microsoft Authenticator)
- [ ] User reads 6-digit TOTP code from app
- [ ] User enters TOTP code in frontend
- [ ] Frontend sends `{userId, code, method: "totp"}` to `/api/auth/mfa/verify`
- [ ] Backend verifies TOTP code via Notification Service
- [ ] Backend returns JWT with Receptionist role + dashboard.view permission
- [ ] Frontend stores auth state and redirects to `/dashboard`
- [ ] Dashboard loads successfully (200 OK, no 403 errors)
- [ ] User sees receptionist-appropriate dashboard views

## Files Modified

### Backend
1. `microservices/auth-service/AuthService/Controllers/AuthController.cs` (Line 173)
   - Removed try-catch around Notification Service call
   - Added direct check: `if (user.TwoFactorEnabled)`
   - Return MFA required response immediately
   - Do NOT generate JWT until MFA verified

### Frontend
2. `apps/hospital-portal-web/src/app/auth/login/page.tsx`
   - Added `mfaUserId` state variable (Line 33)
   - Store `userId` from backend response (Line 147)
   - Fixed verification request body format (Lines 207-211)
   - Reset `mfaUserId` on back to login (Line 253)

## Notification Service Configuration

The Notification Service **VerifyMfaLogin** function:
- **Endpoint**: `POST /api/mfa/verify-login`
- **Port**: 7071
- **Status**: Running ✅

**Request Format:**
```json
{
  "userId": "guid",
  "code": "123456",
  "method": "totp"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "MFA verification successful"
}
```

## Security Notes

### TOTP Secret Storage
- Stored in `user_mfa_settings.totp_secret_encrypted`
- **Encrypted at rest** (AES-256)
- **Never transmitted** to frontend
- Only decrypted in Notification Service for verification

### MFA Bypass Prevention
- Backend **immediately returns** when `TwoFactorEnabled = true`
- **No JWT issued** until TOTP code verified
- **No fallback** to email OTP if TOTP enrolled
- Frontend **cannot proceed** without valid TOTP verification

### Time-Based One-Time Password (TOTP)
- **Algorithm**: RFC 6238 (Google Authenticator compatible)
- **Time Step**: 30 seconds
- **Code Length**: 6 digits
- **Hash**: SHA-1
- **Window**: ±1 time step (allows 30s clock drift)

## Common TOTP Apps

Users can use any of these authenticator apps:
- **Google Authenticator** (Android/iOS)
- **Microsoft Authenticator** (Android/iOS)
- **Authy** (Android/iOS/Desktop)
- **1Password** (if user has premium)
- **LastPass Authenticator**

## Troubleshooting

### MFA Not Requested
**Problem**: User logs in directly without MFA prompt
**Check**:
```sql
SELECT email, two_factor_enabled FROM users WHERE email = 'receptionist6@hospital.com';
```
**Fix**: Ensure `two_factor_enabled = true`

### Invalid TOTP Code
**Problem**: User enters correct code but verification fails
**Causes**:
1. **Time Sync Issue**: User's phone clock is out of sync
   - **Fix**: Enable automatic time sync on phone
2. **Expired Code**: TOTP codes expire every 30 seconds
   - **Fix**: Wait for new code to generate
3. **Wrong Account**: User reading code from different account
   - **Fix**: Verify QR code enrollment was for this email

### Backend 500 Error on Verify
**Problem**: Notification Service returns error
**Check Logs**:
```
Get-Process | Where-Object { $_.ProcessName -eq 'func' }
```
**Fix**: Ensure Notification Service is running on port 7071

## Current Status

✅ **Backend**: MFA check implemented correctly
✅ **Frontend**: MFA verification fixed with correct request format
✅ **Database**: User has TOTP enrolled and enabled
✅ **Notification Service**: Running and ready to verify TOTP codes
✅ **Permissions**: dashboard.view assigned to Receptionist role

🔄 **Next Step**: User must log out, log in again, and enter TOTP code from authenticator app

