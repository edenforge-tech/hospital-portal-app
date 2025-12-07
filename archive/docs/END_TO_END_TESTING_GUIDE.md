# End-to-End Permission Testing Guide

## 📋 Overview
This guide provides step-by-step instructions for testing the Hospital Portal permission middleware implementation with 5 different user roles.

---

## 🔐 Test User Credentials

| User | Email | Password | Role | Expected Access |
|------|-------|----------|------|----------------|
| **Admin** | `admin@test.com` | `Test@123456` | System Admin | ✅ Full access to all 115 endpoints |
| **Doctor** | `doctor@test.com` | `Test@123456` | Doctor | ✅ Medical endpoints, ❌ Admin endpoints |
| **Nurse** | `nurse@test.com` | `Test@123456` | Nurse | ✅ Clinical support, ❌ Admin/Doctor endpoints |
| **Receptionist** | `receptionist@test.com` | `Test@123456` | Receptionist | ✅ Front desk only, ❌ Clinical/Admin endpoints |
| **Lab Tech** | `labtech@test.com` | `Test@123456` | Lab Technician | ✅ Lab access, ❌ Clinical/Admin endpoints |

**TenantId**: Get from database after running setup script (shown in script output)

---

## 🚀 Setup Steps

### Step 1: Ensure Database is Ready
```powershell
# Navigate to workspace root
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal"

# Verify database has sample data
# Run in pgAdmin or psql:
SELECT COUNT(*) FROM tenant WHERE tenant_code = 'USA_HEALTH_HOSP';
SELECT COUNT(*) FROM roles WHERE name LIKE '%USA Healthcare%';
```

### Step 2: Create Test Users
```powershell
# Option A: Using psql command line
psql -U postgres -d hospital_portal -f create_test_users_for_testing.sql

# Option B: Using pgAdmin
# 1. Open pgAdmin
# 2. Connect to hospital_portal database
# 3. Open Query Tool
# 4. Load create_test_users_for_testing.sql
# 5. Execute (F5)
# 6. Check Messages tab for NOTICE output with TenantId
```

**Expected Output:**
```
NOTICE:  Using tenant: USA Healthcare Hospital (ID: <uuid>)
NOTICE:  Created user: admin@test.com (ID: <uuid>)
NOTICE:  Created user: doctor@test.com (ID: <uuid>)
...
NOTICE:  =====================================================
NOTICE:  TEST USERS CREATED SUCCESSFULLY
NOTICE:  =====================================================
NOTICE:  TenantId: <uuid-copy-this>
```

**⚠️ IMPORTANT**: Copy the `TenantId` value - you'll need it for all API requests!

### Step 3: Start the Backend Service
```powershell
cd "microservices\auth-service\AuthService"
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Step 4: Open Swagger UI
Open browser: **https://localhost:7001/swagger**

---

## 🧪 Testing Workflow

### Phase 1: Admin User (Full Access)

#### 1.1 Login as Admin
1. In Swagger UI, find **POST /api/auth/login**
2. Click "Try it out"
3. Request body:
   ```json
   {
     "email": "admin@test.com",
     "password": "Test@123456",
     "tenantId": "<paste-tenant-id-here>"
   }
   ```
4. Click "Execute"
5. **Expected Response**: `200 OK`
   ```json
   {
     "success": true,
     "message": "Login successful",
     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "userName": "admin@test.com",
       "firstName": "Test",
       "lastName": "Admin",
       ...
     },
     "roles": ["System Admin - USA Healthcare Hospital"],
     "permissions": ["tenant.view", "tenant.create", ...]
   }
   ```

#### 1.2 Set Authorization Token
1. Copy the `accessToken` value (entire JWT string)
2. Click **"Authorize"** button (top right, padlock icon)
3. Enter: `Bearer <paste-token-here>`
4. Click "Authorize", then "Close"

#### 1.3 Test All Endpoints (Systematic)

**Test TenantsController (12 endpoints):**
- GET /api/tenants → Expected: `200 OK` with tenant list
- GET /api/tenants/{id} → Expected: `200 OK` with tenant details
- POST /api/tenants → Expected: `200 OK` (create test tenant)
- PUT /api/tenants/{id} → Expected: `200 OK` (update tenant)
- DELETE /api/tenants/{id} → Expected: `200 OK` (soft delete)
- GET /api/tenants/statistics → Expected: `200 OK`
- GET /api/tenants/active → Expected: `200 OK`
- GET /api/tenants/by-tier/{tier} → Expected: `200 OK`
- GET /api/tenants/by-region/{region} → Expected: `200 OK`
- GET /api/tenants/expiring/{days} → Expected: `200 OK`
- POST /api/tenants/{id}/suspend → Expected: `200 OK`
- POST /api/tenants/{id}/activate → Expected: `200 OK`

**Document Results:**
- ✅ All 200 OK = **PASS**
- ❌ Any 403 Forbidden = **FAIL** (admin should have full access)
- ❌ Any 401 Unauthorized = **FAIL** (token issue)

**Repeat for all controllers:**
- OrganizationsController (17 endpoints)
- BranchesController (17 endpoints)
- DepartmentsController (11 endpoints)
- RolesController (2 endpoints)
- PermissionsController (25 endpoints)
- UsersController (6 endpoints)
- DashboardController (5 endpoints)
- AppointmentsController (7 endpoints)
- PatientsController (5 endpoints)
- ExaminationsController (6 endpoints)
- AuthController (1 protected endpoint)
- SeedController (1 endpoint)

**Expected Admin Result**: ✅ **115/115 endpoints return 200 OK**

---

### Phase 2: Doctor User (Medical Access Only)

#### 2.1 Login as Doctor
1. Logout: Click "Authorize" → "Logout"
2. POST /api/auth/login with:
   ```json
   {
     "email": "doctor@test.com",
     "password": "Test@123456",
     "tenantId": "<tenant-id>"
   }
   ```
3. Copy new `accessToken`
4. Re-authorize with doctor token

#### 2.2 Test Medical Endpoints (Should Work)
**Expected 200 OK:**
- GET /api/appointments → ✅ (doctor can view appointments)
- GET /api/patients → ✅ (doctor can view patients)
- GET /api/examinations → ✅ (doctor can view examinations)
- POST /api/examinations → ✅ (doctor can create examinations)
- GET /api/dashboard/quick-stats → ✅ (doctor can view dashboard)

#### 2.3 Test Admin Endpoints (Should Fail)
**Expected 403 Forbidden:**
- POST /api/tenants → ❌ (only admin can create tenants)
- DELETE /api/tenants/{id} → ❌ (only admin can delete tenants)
- POST /api/users → ❌ (only admin can create users)
- POST /api/roles → ❌ (only admin can create roles)
- GET /api/permissions → ❌ (only admin can view permissions)

**Expected Doctor Result**: 
- ✅ Medical endpoints = 200 OK
- ❌ Admin endpoints = 403 Forbidden

---

### Phase 3: Receptionist User (Front Desk Only)

#### 3.1 Login as Receptionist
1. Logout and login with `receptionist@test.com`
2. Copy token and re-authorize

#### 3.2 Test Front Desk Endpoints (Should Work)
**Expected 200 OK:**
- GET /api/appointments → ✅ (receptionist schedules appointments)
- POST /api/appointments → ✅ (receptionist creates appointments)
- GET /api/patients → ✅ (receptionist registers patients)
- POST /api/patients → ✅ (receptionist creates patient records)

#### 3.3 Test Clinical Endpoints (Should Fail)
**Expected 403 Forbidden:**
- GET /api/examinations → ❌ (only doctors/nurses access)
- POST /api/examinations → ❌ (only doctors create examinations)
- DELETE /api/patients/{id} → ❌ (only admin can delete)

#### 3.4 Test Admin Endpoints (Should Fail)
**Expected 403 Forbidden:**
- GET /api/tenants → ❌
- POST /api/users → ❌
- GET /api/permissions → ❌

**Expected Receptionist Result**: 
- ✅ Front desk = 200 OK
- ❌ Clinical = 403 Forbidden
- ❌ Admin = 403 Forbidden

---

### Phase 4: Unauthenticated Requests

#### 4.1 Remove Authorization
1. Click "Authorize" → "Logout"
2. Ensure no token is set

#### 4.2 Test Protected Endpoints (Should All Fail)
**Expected 401 Unauthorized:**
- GET /api/tenants → ❌
- GET /api/users → ❌
- GET /api/appointments → ❌
- GET /api/dashboard → ❌

#### 4.3 Test Public Endpoints (Should Work)
**Expected 200 OK:**
- POST /api/auth/login → ✅ (login is public)
- GET /api/test/ping → ✅ (health check is public)

**Expected Unauthenticated Result**: 
- ❌ All protected endpoints = 401 Unauthorized
- ✅ Public endpoints = 200 OK

---

## 📊 Test Results Matrix

### Summary Table

| User Role | Total Endpoints | Expected 200 OK | Expected 403 | Expected 401 |
|-----------|----------------|-----------------|--------------|--------------|
| **Admin** | 115 | 115 (100%) | 0 | 0 |
| **Doctor** | 115 | ~40 (medical) | ~75 (admin/other) | 0 |
| **Receptionist** | 115 | ~20 (front desk) | ~95 (clinical/admin) | 0 |
| **Unauthenticated** | 115 | 2 (public) | 0 | 113 (protected) |

### Detailed Test Log Template

```markdown
## Test Execution: [Date]

### Admin User
- Login: ✅/❌
- TenantsController (12): ✅/❌ (X/12 passed)
- OrganizationsController (17): ✅/❌ (X/17 passed)
- BranchesController (17): ✅/❌ (X/17 passed)
- ... (continue for all 13 controllers)
- **Total**: X/115 passed

### Doctor User
- Login: ✅/❌
- Medical Endpoints: ✅/❌ (X endpoints passed)
- Admin Endpoints Blocked: ✅/❌ (X endpoints returned 403)

### Receptionist User
- Login: ✅/❌
- Front Desk Endpoints: ✅/❌
- Clinical Endpoints Blocked: ✅/❌
- Admin Endpoints Blocked: ✅/❌

### Unauthenticated
- Protected Endpoints Blocked: ✅/❌ (X/113 returned 401)
- Public Endpoints Accessible: ✅/❌ (2/2 passed)
```

---

## 🐛 Troubleshooting

### Problem: 401 Unauthorized on all requests
**Cause**: Token expired or not set correctly
**Solution**: 
1. Re-login to get fresh token
2. Ensure "Bearer " prefix in authorization
3. Check token expiry (default: 60 minutes)

### Problem: 403 Forbidden on expected endpoints
**Cause**: User doesn't have required permission
**Solution**:
```sql
-- Check user permissions
SELECT 
    u.user_name,
    r.name as role,
    p.code as permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permission rp ON r.id = rp.role_id
JOIN permission p ON rp.permission_id = p.id
WHERE u.user_name = 'doctor@test.com';
```

### Problem: 500 Internal Server Error
**Cause**: Backend issue or database connection
**Solution**:
1. Check backend console logs
2. Verify database connection in `appsettings.json`
3. Check PostgreSQL is running

### Problem: TenantId not found
**Cause**: Sample data not loaded
**Solution**:
```powershell
psql -U postgres -d hospital_portal -f sample_data_complete.sql
```

### Problem: User already exists error
**Cause**: Running setup script multiple times
**Solution**: Script uses `ON CONFLICT DO UPDATE`, safe to re-run

---

## ✅ Success Criteria

### Minimum Passing Requirements:
1. ✅ Admin user can access ALL 115 endpoints (100% success rate)
2. ✅ Doctor user can access medical endpoints, blocked from admin (403)
3. ✅ Receptionist user can access front desk only, blocked from clinical/admin (403)
4. ✅ Unauthenticated requests blocked from all protected endpoints (401)
5. ✅ Public endpoints (login, health check) accessible without token

### Performance Requirements:
- Average response time < 500ms
- Permission check overhead < 50ms per request
- No N+1 query issues

### Quality Requirements:
- 0 authorization errors in backend logs
- Consistent response codes across similar endpoints
- Clear error messages in 403/401 responses

---

## 📝 Next Steps After Testing

1. **Document all test results** in test matrix
2. **Fix any failing tests** (permission assignments, middleware issues)
3. **Create automated test suite** (Postman collection, xUnit tests)
4. **Implement caching** for permission checks (Redis/in-memory)
5. **Add audit logging** for all 403/401 responses
6. **Frontend integration** (hide buttons based on permissions)
7. **Performance optimization** (load testing, database indexing)

---

## 🔗 Related Documentation

- [PERMISSION_MIDDLEWARE_IMPLEMENTATION_COMPLETE.md](./PERMISSION_MIDDLEWARE_IMPLEMENTATION_COMPLETE.md) - Full implementation details
- [PERMISSION_MIDDLEWARE_QUICK_REFERENCE.md](./PERMISSION_MIDDLEWARE_QUICK_REFERENCE.md) - Quick reference guide
- [README.md](./README.md) - Project overview and getting started

---

## 📞 Support

If you encounter issues:
1. Check backend console logs for errors
2. Verify database connection and data
3. Review Swagger UI error responses
4. Check this troubleshooting section
5. Review implementation documentation

**Testing Status**: Ready to begin ✅
**Last Updated**: 2025-11-10
