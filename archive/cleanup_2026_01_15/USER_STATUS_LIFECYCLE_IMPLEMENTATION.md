# User Status Lifecycle Implementation - Complete Guide

## Status Transition Map

### Database Columns
- **`activation_status`** (VARCHAR 20): Detailed workflow tracking for audit trail
- **`UserStatus`** (TEXT): Simplified display status for UI

---

## Status Transitions & API Updates Required

### 1. **CREATED** → **INVITATION_SENT**
**Trigger**: Admin clicks "Activate User" button  
**API Endpoint**: `POST /api/users/{id}/send-activation`  
**Backend File**: `microservices/auth-service/AuthService/Controllers/UsersController.cs`  
**Action**: Send activation email via notification service  
**Status Update**:
```csharp
activation_status = "invitation_sent"
UserStatus = "pending_activation"
```

---

### 2. **INVITATION_SENT** → **EMAIL_VERIFIED**
**Trigger**: User clicks activation link in email  
**API Endpoint**: `POST /api/activation/validate-token`  
**Backend File**: `NotificationService/Functions/Activation/ValidateActivationToken.cs`  
**Action**: Validate token, mark email as verified  
**Status Update**:
```csharp
activation_status = "email_verified"
UserStatus = "pending_activation"  // Still in progress
email_verified = true
```

---

### 3. **EMAIL_VERIFIED** → **PASSWORD_SET**
**Trigger**: User submits password form  
**API Endpoint**: `POST /api/users/{id}/set-activation-password`  
**Backend File**: `AuthService/Controllers/UsersController.cs`  
**Action**: Set password with HIPAA requirements (12+ chars, complexity, 90-day expiry)  
**Status Update**:
```csharp
activation_status = "password_set"
UserStatus = "pending_activation"  // Still in progress
password_hash = <hashed password>
password_expiry_date = NOW() + 90 days
```

---

### 4. **PASSWORD_SET** → **TERMS_ACCEPTED**
**Trigger**: User clicks "Accept Terms" checkbox and submits  
**API Endpoint**: `POST /api/users/{id}/accept-terms`  
**Backend File**: `AuthService/Controllers/UsersController.cs`  
**Action**: Record terms acceptance  
**Status Update**:
```csharp
activation_status = "terms_accepted"
UserStatus = "pending_activation"  // Still in progress
accepted_terms_at = NOW()
```

---

### 5. **TERMS_ACCEPTED** → **MFA_ENROLLED**
**Trigger**: User completes MFA setup (scans QR, verifies TOTP code)  
**API Endpoint**: `POST /api/mfa/enroll/verify`  
**Backend File**: `NotificationService/Functions/Mfa/VerifyMfaEnrollment.cs`  
**Action**: Enable MFA, save backup codes  
**Status Update**:
```csharp
activation_status = "mfa_enrolled"
UserStatus = "pending_activation"  // Activation complete but not logged in yet
// In user_mfa_settings table:
is_mfa_enabled = true
totp_enabled = true
enrolled_at = NOW()
```

---

### 6. **MFA_ENROLLED** → **ACTIVE**
**Trigger**: User's first successful login  
**API Endpoint**: `POST /api/auth/login`  
**Backend File**: `AuthService/Controllers/AuthController.cs`  
**Action**: Authenticate, verify MFA, create session  
**Status Update**:
```csharp
activation_status = "active"
UserStatus = "active"
last_login_at = NOW()
```

---

### 7. **ACTIVE** → **LOCKED**
**Trigger**: Too many failed login attempts (5) OR password expired  
**API Endpoint**: Automatic during login attempts  
**Backend File**: `AuthService/Controllers/AuthController.cs`  
**Action**: Lock account temporarily  
**Status Update**:
```csharp
activation_status = "locked"
UserStatus = "locked"
lockout_end = NOW() + 30 minutes  // Or admin unlock
```

---

### 8. **LOCKED** → **ACTIVE**
**Trigger**: Admin unlocks OR auto-unlock after timeout  
**API Endpoint**: `POST /api/users/{id}/unlock`  
**Backend File**: `AuthService/Controllers/UsersController.cs`  
**Action**: Clear lockout  
**Status Update**:
```csharp
activation_status = "active"
UserStatus = "active"
lockout_end = NULL
access_failed_count = 0
```

---

### 9. **ACTIVE/LOCKED** → **INACTIVE**
**Trigger**: Admin clicks "Deactivate User"  
**API Endpoint**: `POST /api/users/{id}/deactivate`  
**Backend File**: `AuthService/Controllers/UsersController.cs`  
**Action**: Soft deactivate (data retained for HIPAA)  
**Status Update**:
```csharp
activation_status = "inactive"
UserStatus = "inactive"
deactivated_at = NOW()
deactivated_by_user_id = <admin_user_id>
```

---

### 10. **INACTIVE** → **ACTIVE**
**Trigger**: Admin clicks "Reactivate User"  
**API Endpoint**: `POST /api/users/{id}/reactivate`  
**Backend File**: `AuthService/Controllers/UsersController.cs`  
**Action**: Restore active status  
**Status Update**:
```csharp
activation_status = "active"
UserStatus = "active"
reactivated_at = NOW()
reactivated_by_user_id = <admin_user_id>
```

---

### 11. **ANY** → **DELETED** (Soft Delete)
**Trigger**: Admin clicks "Delete User"  
**API Endpoint**: `DELETE /api/users/{id}`  
**Backend File**: `AuthService/Controllers/UsersController.cs`  
**Action**: Soft delete (data archived, not removed - HIPAA compliance)  
**Status Update**:
```csharp
activation_status = "deleted"
UserStatus = "deleted"
deleted_at = NOW()
deleted_by_user_id = <admin_user_id>
```

---

## Frontend UI Status Display Mapping

```typescript
// File: apps/hospital-portal-web/src/lib/utils/statusHelpers.ts

export function getDisplayStatus(activationStatus: string): {
  text: string;
  color: string;
  badge: string;
} {
  const statusMap = {
    'created': { text: 'Pending Invitation', color: 'gray', badge: 'secondary' },
    'invitation_sent': { text: 'Pending Activation', color: 'yellow', badge: 'warning' },
    'email_verified': { text: 'Pending Activation', color: 'yellow', badge: 'warning' },
    'password_set': { text: 'Pending Activation', color: 'yellow', badge: 'warning' },
    'terms_accepted': { text: 'Pending Activation', color: 'yellow', badge: 'warning' },
    'mfa_enrolled': { text: 'Pending Activation', color: 'yellow', badge: 'warning' },
    'active': { text: 'Active', color: 'green', badge: 'success' },
    'locked': { text: 'Locked', color: 'red', badge: 'danger' },
    'inactive': { text: 'Inactive', color: 'gray', badge: 'secondary' },
    'deleted': { text: 'Deleted', color: 'black', badge: 'dark' },
  };
  
  return statusMap[activationStatus] || { text: 'Unknown', color: 'gray', badge: 'secondary' };
}

export function getActivationProgress(activationStatus: string): number {
  const progressMap = {
    'created': 0,
    'invitation_sent': 16,
    'email_verified': 33,
    'password_set': 50,
    'terms_accepted': 66,
    'mfa_enrolled': 83,
    'active': 100,
  };
  
  return progressMap[activationStatus] || 0;
}
```

---

## Implementation Priority

### ✅ Phase 1: Database (DONE)
- [x] Create status constraints
- [x] Create status transitions audit table
- [x] Set initial statuses

### 🔄 Phase 2: Backend Status Transitions (IN PROGRESS)
1. **Send Activation Email** (`created` → `invitation_sent`)
2. **Validate Token** (`invitation_sent` → `email_verified`)
3. **Set Password** (`email_verified` → `password_set`)
4. **Accept Terms** (`password_set` → `terms_accepted`)
5. **MFA Enrollment** (`terms_accepted` → `mfa_enrolled`)
6. **First Login** (`mfa_enrolled` → `active`)

### ⏳ Phase 3: Admin Actions (PENDING)
1. Deactivate User
2. Reactivate User
3. Unlock User
4. Delete User (soft)

### ⏳ Phase 4: Frontend Updates (PENDING)
1. User Management table status badges
2. Activation progress indicator
3. Admin action buttons based on status
4. Status filter in user search

---

## Testing Checklist

- [ ] User created → Status shows "Pending Invitation"
- [ ] Admin sends activation → Status shows "Pending Activation"
- [ ] User clicks link → Email verified logged
- [ ] User sets password → Password set logged
- [ ] User accepts terms → Terms accepted logged
- [ ] User completes MFA → MFA enrolled logged
- [ ] User logs in → Status becomes "Active"
- [ ] Failed logins → Account locks automatically
- [ ] Admin deactivates → Status becomes "Inactive"
- [ ] Admin reactivates → Status returns to "Active"
- [ ] Status transition audit trail records all changes

---

## HIPAA Compliance Notes

- ✅ All status transitions logged in `user_status_transitions` table
- ✅ Soft deletes only (data retained for audit)
- ✅ Timestamps on all transitions
- ✅ User ID tracking for who made changes
- ✅ MFA required before activation complete
- ✅ Password expiry enforced (90 days)
- ✅ Account lockout after failed attempts
