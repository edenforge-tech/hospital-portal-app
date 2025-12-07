# 🚀 Quick Start - Permission Testing (5 Minutes)

## 📋 Pre-Flight Checklist
- [ ] PostgreSQL running
- [ ] Database `hospitalportal` exists
- [ ] Sample data loaded (tenants, roles, permissions)

## ⚡ 3 Commands to Start Testing

### 1️⃣ Create Test Users (Copy TenantId from output)
```powershell
psql -U postgres -d hospitalportal -f create_test_users_for_testing.sql
```
**→ COPY THE TENANT ID FROM OUTPUT**

### 2️⃣ Start Backend
```powershell
cd "microservices\auth-service\AuthService"
dotnet run
```
**→ Wait for "Now listening on: https://localhost:7001"**

### 3️⃣ Open Swagger
```
https://localhost:7001/swagger
```

---

## 🔐 Test Credentials (Password: Test@123456)

| User | Email | Role |
|------|-------|------|
| 👑 **Admin** | `admin@test.com` | System Admin (All Access) |
| 👨‍⚕️ **Doctor** | `doctor@test.com` | Medical Only |
| 👩‍⚕️ **Nurse** | `nurse@test.com` | Clinical Support |
| 👨‍💼 **Reception** | `receptionist@test.com` | Front Desk |
| 🔬 **Lab Tech** | `labtech@test.com` | Lab Access |

---

## 🧪 Testing in Swagger (5 Steps)

### Login Flow
1. **POST /api/auth/login** → Click "Try it out"
2. Enter credentials + TenantId:
   ```json
   {
     "email": "admin@test.com",
     "password": "Test@123456",
     "tenantId": "YOUR-TENANT-ID"
   }
   ```
3. **Execute** → Copy `accessToken`
4. Click **"Authorize"** (padlock icon)
5. Enter: `Bearer YOUR-TOKEN` → Authorize

### Test Endpoints
- GET /api/tenants → Should return 200 OK ✅
- GET /api/users → Should return 200 OK ✅
- GET /api/dashboard/overview-stats → Should return 200 OK ✅

---

## ✅ Expected Results

| User | All Endpoints | Medical | Admin | Front Desk |
|------|--------------|---------|-------|------------|
| Admin | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| Doctor | - | ✅ 200 | ❌ 403 | ✅ 200 |
| Nurse | - | ✅ 200 | ❌ 403 | ✅ 200 |
| Reception | - | ❌ 403 | ❌ 403 | ✅ 200 |
| Lab Tech | - | ❌ 403 | ❌ 403 | ❌ 403 |
| No Auth | - | ❌ 401 | ❌ 401 | ❌ 401 |

---

## 🐛 Quick Fixes

**401 Unauthorized?**
- Token expired (60 min) → Re-login
- Missing "Bearer " prefix → Add it

**403 Forbidden?**
- Wrong user role → Check user assignment
- Missing permissions → Check role-permission mappings

**500 Internal Error?**
- Check backend console logs
- Verify database connection

---

## 📚 Full Documentation

- **Complete Guide**: `END_TO_END_TESTING_GUIDE.md`
- **Setup Summary**: `TESTING_SETUP_COMPLETE.md`
- **Quick Helper**: `START_TESTING.ps1`
- **Verify Environment**: `verify_testing_readiness.sql`

---

## 🎯 Success = Admin Gets 200 OK on All 115 Endpoints

**Ready? Run the 3 commands above!** 🚀
