# 🔐 Integration Testing Credentials

## Quick Reference

### Tenant Information
```json
{
  "name": "India Eye Hospital Network",
  "id": "155fe198-6ae5-4a01-9254-ead5b427247e",
  "code": "INDIA_EYE_NET"
}
```

### Test Users (Password: `Test@123456` for all)

| Email | Password | Role |
|-------|----------|------|
| **admin@test.com** | Test@123456 | System Administrator |
| doctor@test.com | Test@123456 | Doctor |
| nurse@test.com | Test@123456 | Nurse |
| receptionist@test.com | Test@123456 | Receptionist |
| labtech@test.com | Test@123456 | Lab Technician |

---

## 📋 Step-by-Step Swagger Testing

### Step 1: Login (POST /api/auth/login)

**Copy this exact JSON into Swagger:**
```json
{
  "email": "admin@test.com",
  "password": "Test@123456",
  "tenantId": "155fe198-6ae5-4a01-9254-ead5b427247e"
}
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@test.com",
    "firstName": "Test",
    "lastName": "Admin"
  }
}
```

### Step 2: Authorize in Swagger

1. Click the **🔓 Authorize** button (top right in Swagger UI)
2. In the "Value" field, enter:
   ```
   Bearer eyJhbGciOiJIUzI1NiIs...
   ```
   *(Replace with your actual token from Step 1)*
3. Click **Authorize**, then **Close**

### Step 3: Test User Activation Integration

**POST /api/users/{userId}/send-activation**

1. Enter a valid user ID in the `id` field
2. Request body:
   ```json
   {
     "deliveryMethod": "email"
   }
   ```
3. Click **Execute**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Activation code sent to e***@hospital.com",
  "deliveryMethod": "email",
  "recipient": "e***@hospital.com"
}
```

**Expected Logs in Notification Service Terminal:**
```
[SendActivationOtp] Processing request for user: <userId>
[SendActivationOtp] OTP sent successfully via email
```

---

## 🔧 Alternative: PowerShell Testing

```powershell
# 1. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        email = "admin@test.com"
        password = "Test@123456"
        tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"
    } | ConvertTo-Json)

$token = $loginResponse.accessToken
Write-Host "Token: $token"

# 2. Test activation endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = "155fe198-6ae5-4a01-9254-ead5b427247e"
}

$userId = "YOUR_USER_ID_HERE"

Invoke-RestMethod -Uri "http://localhost:5073/api/users/$userId/send-activation" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body (@{
        deliveryMethod = "email"
    } | ConvertTo-Json)
```

---

## 🎯 Common Issues

### Issue: "Tenant ID is required"
**Cause:** The `tenantId` field is missing or empty in login request  
**Solution:** Ensure all 3 fields are provided in login JSON:
- `email`
- `password`
- `tenantId`

### Issue: "401 Unauthorized" on other endpoints
**Cause:** Token not set in Swagger Authorization  
**Solution:** Click Authorize button and enter `Bearer <token>`

### Issue: "404 User not found"
**Cause:** User ID doesn't exist in database or belongs to different tenant  
**Solution:** Use GET /api/users to find valid user IDs for your tenant

---

## 📊 Integration Flow

```
1. Client → POST /api/auth/login (with tenantId)
   ↓
2. Auth-Service → Validates credentials & tenant
   ↓
3. Auth-Service ← Returns JWT token with claims
   ↓
4. Client → POST /api/users/{id}/send-activation (with Bearer token)
   ↓
5. Auth-Service → NotificationClient.SendActivationOtpAsync()
   ↓
6. Auth-Service → HTTP POST to http://localhost:7071/api/activation/send-otp
   ↓
7. Notification-Service → Sends email/SMS via Resend/Twilio
   ↓
8. Notification-Service ← Returns success response
   ↓
9. Client ← 200 OK with masked recipient
```

---

## ✅ Services Status

- **Notification Service**: http://localhost:7071 ✅ Running
- **Auth Service**: http://localhost:5073 ✅ Running  
- **Swagger UI**: http://localhost:5073/swagger ✅ Open
- **Database**: Azure PostgreSQL ✅ Connected

---

**Last Updated**: January 12, 2026  
**Integration Status**: ✅ Code Complete, Ready for Testing
