# Permission Middleware - Endpoint Mapping Guide

## Overview
This document maps all 162+ API endpoints to their corresponding permission codes from the 330 permission database. Use this guide when applying `[RequirePermission("permission.code")]` attributes to controller actions.

## Permission Naming Convention
**Format**: `{resource}.{action}`
- Resources: tenant, user, organization, branch, department, role, permission, appointment, notification, patient, document, audit, systemsetting, bulkoperation
- Actions: view, create, update, delete, manage, assign, execute, download, share, approve

---

## 1. Authentication & Authorization (AuthController)
**File**: `Controllers/AuthController.cs`

| Endpoint | Method | Permission Code | Notes |
|----------|--------|----------------|-------|
| `/api/auth/login` | POST | *Public* | No permission required |
| `/api/auth/refresh-token` | POST | `user.authenticate` | Requires valid refresh token |
| `/api/auth/logout` | POST | `user.authenticate` | Authenticated users only |
| `/api/auth/change-password` | POST | `user.update` | Users can change own password |

---

## 2. Tenant Management (TenantsController)
**File**: `Controllers/TenantsController.cs` - **12 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/tenants` | GET | `tenant.view` | List all tenants |
| `/api/tenants/{id}` | GET | `tenant.view` | Get tenant by ID |
| `/api/tenants` | POST | `tenant.create` | Create new tenant |
| `/api/tenants/{id}` | PUT | `tenant.update` | Update tenant |
| `/api/tenants/{id}` | DELETE | `tenant.delete` | Delete tenant |
| `/api/tenants/search` | GET | `tenant.view` | Search tenants |
| `/api/tenants/{id}/statistics` | GET | `tenant.view` | Get tenant stats |
| `/api/tenants/{id}/users` | GET | `user.view` | List users in tenant |
| `/api/tenants/{id}/settings` | GET | `tenant.view` | Get tenant settings |
| `/api/tenants/{id}/settings` | PUT | `tenant.update` | Update settings |
| `/api/tenants/{id}/activate` | POST | `tenant.manage` | Activate tenant |
| `/api/tenants/{id}/deactivate` | POST | `tenant.manage` | Deactivate tenant |

---

## 3. User Management (UsersController)
**File**: `Controllers/UsersController.cs` - **15+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/users` | GET | `user.view` | List all users |
| `/api/users/{id}` | GET | `user.view` | Get user by ID |
| `/api/users` | POST | `user.create` | Create new user |
| `/api/users/{id}` | PUT | `user.update` | Update user |
| `/api/users/{id}` | DELETE | `user.delete` | Delete user |
| `/api/users/search` | GET | `user.view` | Search users |
| `/api/users/{id}/roles` | GET | `role.view` | Get user roles |
| `/api/users/{id}/roles` | POST | `role.assign` | Assign role to user |
| `/api/users/{id}/roles/{roleId}` | DELETE | `role.assign` | Remove role from user |
| `/api/users/{id}/permissions` | GET | `permission.view` | Get user permissions |
| `/api/users/{id}/activate` | POST | `user.manage` | Activate user |
| `/api/users/{id}/deactivate` | POST | `user.manage` | Deactivate user |
| `/api/users/{id}/reset-password` | POST | `user.update` | Reset user password |
| `/api/users/me` | GET | `user.view` | Get current user profile |
| `/api/users/me` | PUT | `user.update` | Update own profile |

---

## 4. Organization Management (OrganizationsController)
**File**: `Controllers/OrganizationsController.cs` - **18 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/organizations` | GET | `organization.view` | List all organizations |
| `/api/organizations/{id}` | GET | `organization.view` | Get organization by ID |
| `/api/organizations` | POST | `organization.create` | Create organization |
| `/api/organizations/{id}` | PUT | `organization.update` | Update organization |
| `/api/organizations/{id}` | DELETE | `organization.delete` | Delete organization |
| `/api/organizations/search` | GET | `organization.view` | Search organizations |
| `/api/organizations/{id}/branches` | GET | `branch.view` | Get organization branches |
| `/api/organizations/{id}/departments` | GET | `department.view` | Get departments |
| `/api/organizations/{id}/users` | GET | `user.view` | Get organization users |
| `/api/organizations/{id}/statistics` | GET | `organization.view` | Get statistics |
| `/api/organizations/{id}/analytics` | GET | `organization.view` | Get analytics |
| `/api/organizations/{id}/hierarchy` | GET | `organization.view` | Get hierarchy |
| `/api/organizations/{id}/active-users` | GET | `user.view` | Get active users |
| `/api/organizations/{id}/departments-by-type` | GET | `department.view` | Get depts by type |
| `/api/organizations/{id}/activate` | POST | `organization.manage` | Activate org |
| `/api/organizations/{id}/deactivate` | POST | `organization.manage` | Deactivate org |
| `/api/organizations/{id}/archive` | POST | `organization.manage` | Archive org |
| `/api/organizations/{id}/restore` | POST | `organization.manage` | Restore org |

---

## 5. Branch Management (BranchesController)
**File**: `Controllers/BranchesController.cs` - **22 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/branches` | GET | `branch.view` | List all branches |
| `/api/branches/{id}` | GET | `branch.view` | Get branch by ID |
| `/api/branches` | POST | `branch.create` | Create branch |
| `/api/branches/{id}` | PUT | `branch.update` | Update branch |
| `/api/branches/{id}` | DELETE | `branch.delete` | Delete branch |
| `/api/branches/search` | GET | `branch.view` | Search branches |
| `/api/branches/{id}/departments` | GET | `department.view` | Get branch departments |
| `/api/branches/{id}/users` | GET | `user.view` | Get branch users |
| `/api/branches/{id}/statistics` | GET | `branch.view` | Get branch statistics |
| `/api/branches/{id}/analytics` | GET | `branch.view` | Get analytics |
| `/api/branches/{id}/activate` | POST | `branch.manage` | Activate branch |
| `/api/branches/{id}/deactivate` | POST | `branch.manage` | Deactivate branch |
| `/api/branches/organization/{orgId}` | GET | `branch.view` | Get branches by org |
| `/api/branches/{id}/contact-info` | GET | `branch.view` | Get contact info |
| `/api/branches/{id}/contact-info` | PUT | `branch.update` | Update contact info |
| `/api/branches/{id}/address` | GET | `branch.view` | Get address |
| `/api/branches/{id}/address` | PUT | `branch.update` | Update address |
| `/api/branches/{id}/operating-hours` | GET | `branch.view` | Get operating hours |
| `/api/branches/{id}/operating-hours` | PUT | `branch.update` | Update hours |
| `/api/branches/by-city` | GET | `branch.view` | Filter by city |
| `/api/branches/by-type` | GET | `branch.view` | Filter by type |
| `/api/branches/{id}/performance` | GET | `branch.view` | Get performance metrics |

---

## 6. Department Management (DepartmentsController)
**File**: `Controllers/DepartmentsController.cs` - **16 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/departments` | GET | `department.view` | List all departments |
| `/api/departments/{id}` | GET | `department.view` | Get department by ID |
| `/api/departments` | POST | `department.create` | Create department |
| `/api/departments/{id}` | PUT | `department.update` | Update department |
| `/api/departments/{id}` | DELETE | `department.delete` | Delete department |
| `/api/departments/search` | GET | `department.view` | Search departments |
| `/api/departments/{id}/users` | GET | `user.view` | Get department users |
| `/api/departments/{id}/statistics` | GET | `department.view` | Get statistics |
| `/api/departments/{id}/head` | GET | `user.view` | Get department head |
| `/api/departments/{id}/head` | PUT | `department.update` | Set department head |
| `/api/departments/branch/{branchId}` | GET | `department.view` | Get depts by branch |
| `/api/departments/type/{type}` | GET | `department.view` | Get depts by type |
| `/api/departments/{id}/activate` | POST | `department.manage` | Activate department |
| `/api/departments/{id}/deactivate` | POST | `department.manage` | Deactivate dept |
| `/api/departments/{id}/specializations` | GET | `department.view` | Get specializations |
| `/api/departments/{id}/equipment` | GET | `department.view` | Get equipment |

---

## 7. Role Management (RolesController)
**File**: `Controllers/RolesController.cs` - **20 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/roles` | GET | `role.view` | List all roles |
| `/api/roles/{id}` | GET | `role.view` | Get role by ID |
| `/api/roles` | POST | `role.create` | Create role |
| `/api/roles/{id}` | PUT | `role.update` | Update role |
| `/api/roles/{id}` | DELETE | `role.delete` | Delete role |
| `/api/roles/search` | GET | `role.view` | Search roles |
| `/api/roles/{id}/permissions` | GET | `permission.view` | Get role permissions |
| `/api/roles/{id}/permissions` | POST | `permission.assign` | Assign permissions |
| `/api/roles/{id}/permissions/{permissionId}` | DELETE | `permission.assign` | Remove permission |
| `/api/roles/{id}/users` | GET | `user.view` | Get users with role |
| `/api/roles/{id}/users/{userId}` | POST | `role.assign` | Assign role to user |
| `/api/roles/{id}/users/{userId}` | DELETE | `role.assign` | Remove role from user |
| `/api/roles/{id}/statistics` | GET | `role.view` | Get role statistics |
| `/api/roles/system` | GET | `role.view` | Get system roles |
| `/api/roles/custom` | GET | `role.view` | Get custom roles |
| `/api/roles/{id}/clone` | POST | `role.create` | Clone role |
| `/api/roles/{id}/activate` | POST | `role.manage` | Activate role |
| `/api/roles/{id}/deactivate` | POST | `role.manage` | Deactivate role |
| `/api/roles/hierarchy` | GET | `role.view` | Get role hierarchy |
| `/api/roles/{id}/dependencies` | GET | `role.view` | Get role dependencies |

---

## 8. Permission Management (PermissionsController)
**File**: `Controllers/PermissionsController.cs` - **25+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/permissions` | GET | `permission.view` | List all permissions |
| `/api/permissions/{id}` | GET | `permission.view` | Get permission by ID |
| `/api/permissions` | POST | `permission.create` | Create permission |
| `/api/permissions/{id}` | PUT | `permission.update` | Update permission |
| `/api/permissions/{id}` | DELETE | `permission.delete` | Delete permission |
| `/api/permissions/search` | GET | `permission.view` | Search permissions |
| `/api/permissions/module/{module}` | GET | `permission.view` | Get by module |
| `/api/permissions/resource/{resource}` | GET | `permission.view` | Get by resource |
| `/api/permissions/matrix` | GET | `permission.view` | Get permission matrix |
| `/api/permissions/by-role/{roleId}` | GET | `permission.view` | Get role permissions |
| `/api/permissions/by-user/{userId}` | GET | `permission.view` | Get user permissions |
| `/api/permissions/modules` | GET | `permission.view` | Get all modules |
| `/api/permissions/resources` | GET | `permission.view` | Get all resources |
| `/api/permissions/actions` | GET | `permission.view` | Get all actions |
| `/api/permissions/{id}/roles` | GET | `role.view` | Get roles with permission |
| `/api/permissions/{id}/users` | GET | `user.view` | Get users with permission |
| `/api/permissions/bulk-assign` | POST | `permission.assign` | Bulk assign permissions |
| `/api/permissions/bulk-remove` | POST | `permission.assign` | Bulk remove permissions |
| `/api/permissions/statistics` | GET | `permission.view` | Get permission stats |
| `/api/permissions/validate` | POST | `permission.view` | Validate permissions |
| `/api/permissions/{id}/activate` | POST | `permission.manage` | Activate permission |
| `/api/permissions/{id}/deactivate` | POST | `permission.manage` | Deactivate permission |

---

## 9. Appointment Management (AppointmentsController)
**File**: `Controllers/AppointmentsController.cs` - **15+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/appointments` | GET | `appointment.view` | List appointments |
| `/api/appointments/{id}` | GET | `appointment.view` | Get appointment by ID |
| `/api/appointments` | POST | `appointment.create` | Create appointment |
| `/api/appointments/{id}` | PUT | `appointment.update` | Update appointment |
| `/api/appointments/{id}` | DELETE | `appointment.delete` | Delete appointment |
| `/api/appointments/search` | GET | `appointment.view` | Search appointments |
| `/api/appointments/patient/{patientId}` | GET | `appointment.view` | Get patient appointments |
| `/api/appointments/doctor/{doctorId}` | GET | `appointment.view` | Get doctor appointments |
| `/api/appointments/department/{deptId}` | GET | `appointment.view` | Get dept appointments |
| `/api/appointments/{id}/cancel` | POST | `appointment.update` | Cancel appointment |
| `/api/appointments/{id}/reschedule` | POST | `appointment.update` | Reschedule appointment |
| `/api/appointments/{id}/confirm` | POST | `appointment.update` | Confirm appointment |
| `/api/appointments/availability` | GET | `appointment.view` | Check availability |
| `/api/appointments/statistics` | GET | `appointment.view` | Get statistics |
| `/api/appointments/calendar` | GET | `appointment.view` | Get calendar view |

---

## 10. Notification Management (NotificationsController)
**File**: `Controllers/NotificationsController.cs` - **12+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/notifications` | GET | `notification.view` | List notifications |
| `/api/notifications/{id}` | GET | `notification.view` | Get notification by ID |
| `/api/notifications` | POST | `notification.create` | Create notification |
| `/api/notifications/{id}` | PUT | `notification.update` | Update notification |
| `/api/notifications/{id}` | DELETE | `notification.delete` | Delete notification |
| `/api/notifications/user/{userId}` | GET | `notification.view` | Get user notifications |
| `/api/notifications/{id}/read` | POST | `notification.update` | Mark as read |
| `/api/notifications/mark-all-read` | POST | `notification.update` | Mark all as read |
| `/api/notifications/unread-count` | GET | `notification.view` | Get unread count |
| `/api/notifications/preferences` | GET | `notification.view` | Get preferences |
| `/api/notifications/preferences` | PUT | `notification.update` | Update preferences |
| `/api/notifications/send-bulk` | POST | `notification.create` | Send bulk notifications |

---

## 11. Dashboard (DashboardController)
**File**: `Controllers/DashboardController.cs` - **8 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/dashboard/overview` | GET | `dashboard.view` | Get dashboard overview |
| `/api/dashboard/statistics` | GET | `dashboard.view` | Get statistics |
| `/api/dashboard/charts` | GET | `dashboard.view` | Get chart data |
| `/api/dashboard/recent-activity` | GET | `dashboard.view` | Get recent activity |
| `/api/dashboard/alerts` | GET | `dashboard.view` | Get system alerts |
| `/api/dashboard/user-activity` | GET | `user.view` | Get user activity |
| `/api/dashboard/performance` | GET | `dashboard.view` | Get performance metrics |
| `/api/dashboard/export` | GET | `dashboard.view` | Export dashboard data |

---

## 12. Document Sharing (DocumentSharingController) - Phase 4
**File**: `Controllers/_Phase4_Disabled/DocumentSharingController.cs` - **16 endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/documents` | GET | `document.view` | List documents |
| `/api/documents/{id}` | GET | `document.view` | Get document by ID |
| `/api/documents` | POST | `document.create` | Upload document |
| `/api/documents/{id}` | PUT | `document.update` | Update document |
| `/api/documents/{id}` | DELETE | `document.delete` | Delete document |
| `/api/documents/{id}/share` | POST | `document.share` | Share document |
| `/api/documents/{id}/download` | GET | `document.download` | Download document |
| `/api/documents/{id}/access-log` | GET | `audit.view` | Get access log |
| `/api/documents/shared-with-me` | GET | `document.view` | Get shared documents |
| `/api/documents/types` | GET | `document.view` | Get document types |
| `/api/documents/{id}/permissions` | GET | `document.view` | Get document permissions |
| `/api/documents/{id}/permissions` | PUT | `document.share` | Update permissions |
| `/api/documents/patient/{patientId}` | GET | `document.view` | Get patient documents |
| `/api/documents/{id}/versions` | GET | `document.view` | Get document versions |
| `/api/documents/{id}/audit-trail` | GET | `audit.view` | Get audit trail |
| `/api/documents/search` | GET | `document.view` | Search documents |

---

## 13. System Settings (SystemSettingsController) - Phase 4
**File**: `Controllers/_Phase4_Disabled/SystemSettingsController.cs` - **10+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/system-settings` | GET | `systemsetting.view` | List all settings |
| `/api/system-settings/{key}` | GET | `systemsetting.view` | Get setting by key |
| `/api/system-settings` | POST | `systemsetting.create` | Create setting |
| `/api/system-settings/{key}` | PUT | `systemsetting.update` | Update setting |
| `/api/system-settings/{key}` | DELETE | `systemsetting.delete` | Delete setting |
| `/api/system-settings/category/{category}` | GET | `systemsetting.view` | Get by category |
| `/api/system-settings/validate` | POST | `systemsetting.view` | Validate settings |
| `/api/system-settings/bulk-update` | POST | `systemsetting.update` | Bulk update |
| `/api/system-settings/export` | GET | `systemsetting.view` | Export settings |
| `/api/system-settings/import` | POST | `systemsetting.update` | Import settings |

---

## 14. Bulk Operations (BulkOperationsController) - Phase 4
**File**: `Controllers/_Phase4_Disabled/BulkOperationsController.cs` - **8+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/bulk/users/create` | POST | `bulkoperation.execute` | Bulk create users |
| `/api/bulk/users/update` | POST | `bulkoperation.execute` | Bulk update users |
| `/api/bulk/users/delete` | POST | `bulkoperation.execute` | Bulk delete users |
| `/api/bulk/users/activate` | POST | `bulkoperation.execute` | Bulk activate users |
| `/api/bulk/roles/assign` | POST | `bulkoperation.execute` | Bulk assign roles |
| `/api/bulk/permissions/assign` | POST | `bulkoperation.execute` | Bulk assign permissions |
| `/api/bulk/operations/status/{id}` | GET | `bulkoperation.view` | Get operation status |
| `/api/bulk/operations/history` | GET | `bulkoperation.view` | Get operation history |

---

## 15. Audit Logs (AuditController)
**File**: `Controllers/AuditController.cs` - **10+ endpoints**

| Endpoint | Method | Permission Code | Description |
|----------|--------|----------------|-------------|
| `/api/audit/logs` | GET | `audit.view` | List all audit logs |
| `/api/audit/logs/{id}` | GET | `audit.view` | Get audit log by ID |
| `/api/audit/logs/user/{userId}` | GET | `audit.view` | Get user audit logs |
| `/api/audit/logs/resource/{resourceType}/{resourceId}` | GET | `audit.view` | Get resource audit logs |
| `/api/audit/logs/action/{action}` | GET | `audit.view` | Get logs by action |
| `/api/audit/logs/date-range` | GET | `audit.view` | Get logs by date range |
| `/api/audit/logs/export` | GET | `audit.view` | Export audit logs |
| `/api/audit/logs/statistics` | GET | `audit.view` | Get audit statistics |
| `/api/audit/logs/compliance-report` | GET | `audit.view` | Get compliance report |
| `/api/audit/logs/failed-logins` | GET | `audit.view` | Get failed login attempts |

---

## Quick Reference: Common Permission Codes

### Basic CRUD Operations
- **View/Read**: `{resource}.view` (e.g., `user.view`, `role.view`)
- **Create**: `{resource}.create` (e.g., `user.create`, `branch.create`)
- **Update**: `{resource}.update` (e.g., `user.update`, `permission.update`)
- **Delete**: `{resource}.delete` (e.g., `user.delete`, `organization.delete`)

### Management Operations
- **Manage** (activate/deactivate/archive): `{resource}.manage`
- **Assign** (roles/permissions): `{resource}.assign` or `role.assign`, `permission.assign`
- **Execute** (bulk operations): `bulkoperation.execute`

### Special Operations
- **Audit**: `audit.view` - for viewing audit logs and trails
- **Dashboard**: `dashboard.view` - for dashboard and analytics
- **Document**: `document.view`, `document.share`, `document.download`

---

## Implementation Examples

### Example 1: Simple CRUD Endpoint
```csharp
[HttpGet]
[RequirePermission("tenant.view")]
public async Task<IActionResult> GetAllTenants()
{
    // Only users with 'tenant.view' permission can access
    var tenants = await _tenantService.GetAllAsync();
    return Ok(tenants);
}
```

### Example 2: Administrative Action
```csharp
[HttpPost("{id}/activate")]
[RequirePermission("tenant.manage")]
public async Task<IActionResult> ActivateTenant(Guid id)
{
    // Only users with 'tenant.manage' permission can activate/deactivate
    await _tenantService.ActivateAsync(id);
    return Ok();
}
```

### Example 3: Multiple Permissions (use OR logic via custom attribute)
```csharp
[HttpGet("{id}/sensitive-data")]
[RequirePermission("user.manage")]  // Admins
// OR add custom logic in service layer for "view own data"
public async Task<IActionResult> GetSensitiveData(Guid id)
{
    // Either user.manage permission OR viewing own data
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (id.ToString() != userId && !await HasPermission("user.manage"))
        return Forbid();
    
    var data = await _userService.GetSensitiveDataAsync(id);
    return Ok(data);
}
```

---

## Testing Permission Enforcement

### 1. Via Swagger UI
1. Login with a user account: `POST /api/auth/login`
2. Copy the JWT token from response
3. Click "Authorize" button in Swagger UI
4. Enter: `Bearer {your-token}`
5. Try accessing endpoints - should get 403 Forbidden if permission missing

### 2. Via Postman
```http
GET https://localhost:7001/api/tenants
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  X-Tenant-ID: e0e6fefb-f3b9-4f3d-bc16-2203fe9c107c
```

Expected responses:
- **200 OK**: User has required permission
- **401 Unauthorized**: No token or invalid token
- **403 Forbidden**: Valid token but missing required permission

### 3. Check Logs
Permission authorization logs appear in console output:
```
[Information] Permission granted: User abc123 (user@example.com) has permission 'tenant.view' in tenant xyz789
[Warning] Permission denied: User abc123 (user@example.com) lacks permission 'tenant.delete' in tenant xyz789. User roles: 3
```

---

## Summary
- **Total Endpoints**: 162+ across 14 controllers
- **Total Permission Codes**: 330 in database (237 new + 93 legacy)
- **Role-Permission Mappings**: 641 active mappings
- **System Roles**: 20 generic roles (Admin, User, Doctor, Nurse, etc.)
- **Tenant-Specific Roles**: 60+ tenant-scoped roles

**Next Steps**:
1. ✅ Permission infrastructure created (RequirePermissionAttribute, PermissionAuthorizationHandler, Policy Provider)
2. ✅ Authorization registered in Program.cs
3. ⏳ Apply [RequirePermission] attributes to all 162 endpoints (IN PROGRESS)
4. ⏳ Test with different user roles and permissions
5. ⏳ Enable Phase 4 controllers (Document Sharing, System Settings, Bulk Operations)
