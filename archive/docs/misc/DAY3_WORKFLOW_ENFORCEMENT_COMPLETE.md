# Day 3 Implementation Complete: Backend Workflow Enforcement Middleware

## ✅ Completed Components

### 1. **CheckInValidationMiddleware** (`Middleware/CheckInValidationMiddleware.cs`)
Backend middleware that enforces check-in requirements for clinical endpoints.

**Features:**
- ✅ Intercepts all POST/PUT/PATCH requests to restricted endpoints
- ✅ Validates patient check-in status before allowing access
- ✅ Returns 403 Forbidden if patient not checked in
- ✅ Supports emergency override via `X-Emergency-Override` header
- ✅ Logs all enforcement attempts and emergency overrides
- ✅ Fail-open design (allows requests if validation error occurs)

**Restricted Endpoints:**
- `/api/examinations` - Clinical examinations
- `/api/prescriptions` - Prescription management
- `/api/labreports` - Laboratory reports
- `/api/clinical-examinations` - Clinical examination details

**Emergency Override:**
- Header: `X-Emergency-Override: <reason (min 10 chars)>`
- Logs: User ID, role, endpoint, reason, timestamp
- Future: Will insert into `audit_log` table

### 2. **CheckInAttributes** (`Attributes/CheckInAttributes.cs`)
Custom attributes for fine-grained control over check-in validation.

**Attributes:**
- `[RequireCheckIn]` - Marks endpoint as requiring check-in validation
  - `AllowEmergencyOverride` property (default: true)
  - `OnlyForModifyingRequests` property (default: true)
- `[SkipCheckInValidation]` - Exempts endpoint from check-in requirement

### 3. **Program.cs Integration**
Middleware registered in the HTTP pipeline after authentication/authorization:

```csharp
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<CheckInValidationMiddleware>();
```

### 4. **Frontend API Integration** (`lib/check-in-api.ts`)
Updated frontend check-in API to call real backend endpoints:

**Endpoints Used:**
- `GET /api/visits/by-patient/{patientId}` - Get patient's visit status
- `POST /api/visits/checkin` - Check in patient
- `POST /api/visits/checkout` - Check out patient
- `GET /api/visits?date={date}&status={status}` - Get today's check-ins

**Real API Integration:**
- ✅ `getStatus()` - Fetches active visit from backend
- ✅ `checkIn()` - Posts to `/visits/checkin` endpoint
- ✅ `checkOut()` - Posts to `/visits/checkout` endpoint
- ✅ `getTodayCheckIns()` - Fetches active visits for today

## 🔍 How It Works

### Normal Flow:
1. User attempts to create examination/prescription via API
2. Middleware intercepts the request
3. Extracts patient ID from request body/query/route
4. Queries `visits` table for active visit (checked_in_at today, completed_at NULL)
5. If checked in → Allow request to proceed
6. If not checked in → Return 403 Forbidden with helpful error message

### Emergency Override Flow:
1. Authorized user includes `X-Emergency-Override` header with reason
2. Middleware validates reason (minimum 10 characters)
3. Logs override to console (future: audit table)
4. Allows request to proceed
5. Frontend can set this header in emergency cases

### Error Response Format:
```json
{
  "error": "CheckInRequired",
  "message": "Patient must be checked in before accessing this clinical service.",
  "patientId": "...",
  "endpoint": "/api/examinations",
  "timestamp": "2026-01-31T...",
  "emergencyOverrideAvailable": true,
  "emergencyOverrideInstructions": "Authorized users can bypass..."
}
```

## 🧪 Testing Guide

### Test Case 1: Block Unauthorized Access
```bash
# Without check-in, attempt to create examination
curl -X POST http://localhost:5073/api/examinations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"patientId": "...", "chiefComplaint": "..."}'
  
# Expected: 403 Forbidden with CheckInRequired error
```

### Test Case 2: Allow Access After Check-In
```bash
# 1. Check in patient
curl -X POST http://localhost:5073/api/visits/checkin \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "...",
    "departmentId": "...",
    "checkInType": "walk-in",
    "reasonForVisit": "Eye examination"
  }'
  
# 2. Create examination (should succeed)
curl -X POST http://localhost:5073/api/examinations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"patientId": "...", "chiefComplaint": "..."}'
  
# Expected: 201 Created
```

### Test Case 3: Emergency Override
```bash
# Create examination without check-in using override
curl -X POST http://localhost:5073/api/examinations \
  -H "Authorization: Bearer {token}" \
  -H "X-Emergency-Override: Critical patient, immediate examination required" \
  -H "Content-Type: application/json" \
  -d '{"patientId": "...", "chiefComplaint": "..."}'
  
# Expected: 201 Created + logged to console/audit
```

## 📊 Database Query
The middleware uses this SQL query to validate check-in:

```sql
SELECT 1 
FROM visits 
WHERE patient_id = {patientId}::uuid 
  AND checked_in_at::date = {today}
  AND completed_at IS NULL
  AND deleted_at IS NULL
LIMIT 1
```

## 🔐 Security Features

1. **Fail-Open Design**: If database query fails, allows request (availability > strict enforcement)
2. **Audit Logging**: All enforcement attempts and overrides logged
3. **Role-Based Override**: Only authorized users can use emergency override (frontend enforces)
4. **Detailed Error Messages**: Clear instructions for users on how to proceed
5. **Tenant Isolation**: RLS policies ensure queries scoped to current tenant

## 🚀 Future Enhancements (TODO)

1. **Audit Table Integration**: Uncomment SQL insert statements in middleware when audit_log table ready
2. **Role Validation**: Check user role before allowing emergency override at backend level
3. **Configurable Endpoints**: Move restricted endpoints to configuration file
4. **Grace Period**: Allow access to exam/prescription within X minutes after checkout
5. **Performance**: Cache check-in status to reduce database queries
6. **Metrics**: Track override frequency, blocked attempts per user/department

## 📝 Notes

- Middleware only validates POST/PUT/PATCH (modifying operations)
- GET requests always allowed (read-only access)
- Patient ID extraction supports: query params, route params, request body (JSON)
- Frontend check-in dialog automatically generates token numbers via backend
- Real-time check-in status synchronized between frontend and backend

---

**Status**: ✅ Day 3 Complete  
**Next**: Day 4 - OPD Bill Items Table & API
