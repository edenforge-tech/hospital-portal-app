# Permission Middleware - Quick Reference

## 🚀 Quick Start

### Applying Permissions to New Endpoints

**Pattern**:
```csharp
using AuthService.Authorization; // Add this using statement

[HttpGet]
[RequirePermission("resource.action")] // Add this attribute
public async Task<IActionResult> MyEndpoint() { ... }
```

### Permission Naming Convention
Format: `{resource}.{action}`

**Actions**: `view`, `create`, `update`, `delete`, `manage`, `assign`, `cancel`

**Examples**:
- `tenant.view` - Read tenant data
- `user.create` - Create new users
- `appointment.cancel` - Cancel appointments
- `permission.manage` - Manage permission settings

---

## 📊 Current Status

### Completed (115/162+ endpoints - 71%)
- ✅ TenantsController (12 endpoints)
- ✅ OrganizationsController (17 endpoints)
- ✅ BranchesController (17 endpoints)
- ✅ DepartmentsController (11 endpoints)
- ✅ RolesController (2 endpoints)
- ✅ PermissionsController (25 endpoints)
- ✅ UsersController (6 endpoints)
- ✅ DashboardController (5 endpoints)
- ✅ AppointmentsController (7 endpoints)
- ✅ PatientsController (5 endpoints)
- ✅ ExaminationsController (6 endpoints)
- ✅ AuthController (1 endpoint - change password)
- ✅ SeedController (1 endpoint)

### Skipped
- ⏭️ TestController (public health check)
- ⏭️ _Phase4_Disabled/ (~40 endpoints - disabled in .csproj)

---

## 🔐 Permission Codes by Module

### Admin & Configuration (18 permissions)
```
tenant.view, tenant.create, tenant.update, tenant.delete, tenant.manage
organization.view, organization.create, organization.update, organization.delete, organization.manage
branch.view, branch.create, branch.update, branch.delete, branch.manage
department.view, department.create, department.update, department.delete
```

### User & Access Management (7 permissions)
```
user.view, user.create, user.update, user.delete
role.view, role.create
role.assign
```

### Permissions Management (5 permissions)
```
permission.view, permission.create, permission.update, permission.delete, permission.manage
```

### Clinical Operations (13 permissions)
```
appointment.view, appointment.create, appointment.update, appointment.cancel, appointment.delete
patient.view, patient.create, patient.update, patient.delete
examination.view, examination.create, examination.update, examination.delete
```

### Dashboard & Monitoring (2 permissions)
```
dashboard.view, dashboard.manage
```

### System & Authentication (2 permissions)
```
auth.change_password
system.admin
```

---

## 🧪 Testing Shortcuts

### Swagger Testing
1. **Run backend**: `cd microservices/auth-service/AuthService; dotnet run`
2. **Open Swagger**: `https://localhost:7001/swagger`
3. **Login**: POST `/api/auth/login` → Copy `accessToken`
4. **Authorize**: Click 🔓 → Enter `Bearer {token}` → Authorize
5. **Test endpoints**: Try different endpoints, verify 200 OK or 403 Forbidden

### cURL Testing
```bash
# Admin - Should work (has all permissions)
curl -X GET "https://localhost:7001/api/tenants" \
  -H "Authorization: Bearer {admin_token}" \
  -H "X-Tenant-ID: {tenant_id}"
# Expected: 200 OK

# Doctor - Should fail (no admin permissions)
curl -X GET "https://localhost:7001/api/tenants" \
  -H "Authorization: Bearer {doctor_token}" \
  -H "X-Tenant-ID: {tenant_id}"
# Expected: 403 Forbidden
```

---

## 🏗️ Architecture Components

### 1. RequirePermissionAttribute
**File**: `Authorization/RequirePermissionAttribute.cs`

Simple attribute that decorates controller actions.

### 2. PermissionAuthorizationPolicyProvider
**File**: `Authorization/PermissionAuthorizationPolicyProvider.cs`

Dynamically creates authorization policies (no need to register 330 policies in Program.cs).

### 3. PermissionAuthorizationHandler
**File**: `Services/PermissionAuthorizationHandler.cs`

Queries database to verify user has required permission.

### 4. Service Registration
**File**: `Program.cs`

```csharp
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, AuthService.Services.PermissionAuthorizationHandler>();
```

---

## 🔄 Request Flow

```
1. Request → [RequirePermission("tenant.view")]
2. ASP.NET Core → PermissionAuthorizationPolicyProvider
3. Policy Provider → Creates policy with PermissionRequirement("tenant.view")
4. ASP.NET Core → PermissionAuthorizationHandler
5. Handler → Queries database:
   SELECT 1 FROM role_permission rp
   WHERE rp.permission_code = 'tenant.view'
     AND rp.role_id IN (user's roles)
     AND rp.tenant_id = {current_tenant}
6. Result:
   - Found → 200 OK (proceed to controller)
   - Not found → 403 Forbidden
```

---

## 📈 Database Structure

### Role-Permission Mapping
**Table**: `role_permission`

```sql
CREATE TABLE role_permission (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    role_id UUID NOT NULL,
    permission_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Current Data**:
- **330 permissions** defined
- **80 roles** created
- **641 role-permission mappings** configured

**Sample Query**:
```sql
-- Get all permissions for a user
SELECT DISTINCT rp.permission_code
FROM "AspNetUserRoles" ur
INNER JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
INNER JOIN role_permission rp ON rp.role_id = r."Id"
WHERE ur."UserId" = '{user-guid}'
  AND r.tenant_id = '{tenant-guid}';
```

---

## 🐛 Troubleshooting

### Problem: 403 Forbidden (Expected 200 OK)
**Check**:
1. Does user have required role?
   ```sql
   SELECT r."Name" FROM "AspNetUserRoles" ur
   INNER JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
   WHERE ur."UserId" = '{user-guid}';
   ```
2. Does role have required permission?
   ```sql
   SELECT * FROM role_permission rp
   INNER JOIN "AspNetRoles" r ON rp.role_id = r."Id"
   WHERE r."Name" = 'Admin'
     AND rp.permission_code = 'tenant.view';
   ```
3. Is tenant_id correct in JWT and X-Tenant-ID header?

### Problem: 401 Unauthorized
**Check**:
1. Is Authorization header present? `Authorization: Bearer {token}`
2. Is token valid? Decode at `https://jwt.io`
3. Is token expired? Check `exp` claim

### Problem: Slow Response (>500ms)
**Solution**: Add database indexes
```sql
CREATE INDEX idx_role_permission_lookup 
ON role_permission(role_id, permission_code, tenant_id);

CREATE INDEX idx_user_roles_lookup 
ON "AspNetUserRoles"("UserId", "RoleId");
```

---

## 📝 Common Patterns

### View Endpoints (GET)
```csharp
[HttpGet]
[RequirePermission("resource.view")]
public async Task<IActionResult> GetAll() { ... }

[HttpGet("{id}")]
[RequirePermission("resource.view")]
public async Task<IActionResult> GetById(Guid id) { ... }
```

### Create Endpoints (POST)
```csharp
[HttpPost]
[RequirePermission("resource.create")]
public async Task<IActionResult> Create([FromBody] CreateRequest request) { ... }
```

### Update Endpoints (PUT)
```csharp
[HttpPut("{id}")]
[RequirePermission("resource.update")]
public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRequest request) { ... }
```

### Delete Endpoints (DELETE)
```csharp
[HttpDelete("{id}")]
[RequirePermission("resource.delete")]
public async Task<IActionResult> Delete(Guid id) { ... }
```

### Management/Admin Operations
```csharp
[HttpPost("{id}/status")]
[RequirePermission("resource.manage")]
public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusRequest request) { ... }
```

### Public Endpoints (No Permission)
```csharp
[HttpPost("login")]
// No [RequirePermission] - public endpoint
public async Task<IActionResult> Login([FromBody] LoginRequest request) { ... }
```

---

## 📚 Key Files

### New Files
- `Authorization/RequirePermissionAttribute.cs` (35 lines)
- `Authorization/PermissionAuthorizationPolicyProvider.cs` (66 lines)
- `PERMISSION_MIDDLEWARE_IMPLEMENTATION_COMPLETE.md` (comprehensive doc)
- `PERMISSION_MIDDLEWARE_QUICK_REFERENCE.md` (this file)

### Modified Files
- `Program.cs` (added 15 lines for service registration)
- All 13 controller files (added using statement + [RequirePermission] attributes)

### Existing Files (Reused)
- `Services/PermissionAuthorizationHandler.cs`
- `Services/PermissionRequirement.cs`

### Reference Documentation
- `PERMISSIONS_MAPPING_GUIDE.md` (850+ lines - all endpoint mappings)
- `README.md` (consolidated project docs)

---

## ✅ Checklist for New Endpoints

When adding a new API endpoint:

1. ☐ Add `using AuthService.Authorization;` to controller
2. ☐ Apply `[RequirePermission("resource.action")]` attribute
3. ☐ Choose appropriate permission code (follow naming convention)
4. ☐ Ensure permission exists in database (`permission` table)
5. ☐ Map permission to relevant roles (`role_permission` table)
6. ☐ Build and verify (0 errors)
7. ☐ Test with different user roles (Admin, Doctor, Nurse, etc.)
8. ☐ Document in `PERMISSIONS_MAPPING_GUIDE.md`

---

## 🎯 Next Steps

1. **Testing**: Test all 115 endpoints with different roles
2. **Performance**: Add database indexes, measure latency
3. **Frontend**: Update API client to handle 403 Forbidden
4. **Caching**: Consider Redis caching for permissions
5. **Audit**: Log all permission denials to audit_logs table

---

**Build Status**: ✅ **0 Errors** (536 pre-existing nullable warnings)  
**Implementation**: ✅ **115/162+ endpoints secured (71%)**  
**Status**: ✅ **COMPLETE - Ready for Testing**
