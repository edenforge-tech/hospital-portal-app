# UI Testing Checklist - Audit Logs Enhancement

## ✅ Frontend Integration Complete!

All frontend components are now connected to the backend API. You can test everything from the UI.

---

## 🚀 Quick Start

### 1. Verify Servers Are Running
- **Backend**: http://localhost:5073 ✅ (Already running)
- **Frontend**: http://localhost:3001 ✅ (Already running)
- **Swagger**: http://localhost:5073/swagger (For API testing)

### 2. Login Credentials
```
Email: admin@test.com
Password: Admin123!
```

---

## 📋 Step-by-Step Testing Guide

### Test 1: Navigate to Audit Logs
1. Open browser: http://localhost:3001
2. Login with admin credentials
3. Navigate to: **Dashboard → Admin → Audit Logs**
4. **Expected**: See 4 tabs:
   - System Logs (blue)
   - User Activations (green)
   - **PHI Access Tracking (purple)** ← NEW
   - **Breach Detection (red)** ← NEW

---

### Test 2: System Logs Tab (Baseline)
1. Click **System Logs** tab
2. **Expected**: Table with existing audit logs
3. Click any row
4. **Expected**: Modal opens with:
   - ✅ Loading spinner (while fetching detailed data)
   - ✅ Before/After diff viewer (ReactDiffViewer)
   - ✅ Device info (browser, OS, device type)
   - ✅ Network info (IP address, geolocation if available)
   - ✅ Request/Response panels (if data available)
   - ✅ Close button

**API Call**: `GET /api/audit-logs/{id}/details`

---

### Test 3: PHI Access Tracking Tab
1. Click **PHI Access Tracking** tab (purple theme)
2. **Expected UI**:
   - Patient ID input field
   - Start Date and End Date filters
   - "Track Access" button
   - Yellow HIPAA compliance notice
   - Empty state message (no data until you search)

3. **Test Search**:
   - Find a patient UUID from database:
     ```powershell
     $env:PGPASSWORD='NewPass@2026!'; 
     psql -h hospitalportal-db-server.postgres.database.azure.com -U postgres -d hospitalportal -c "SELECT id FROM patient LIMIT 5;"
     ```
   - Enter patient ID in search box
   - Click **Track Access** button
   
4. **Expected Results**:
   - ✅ Loading state during API call
   - ✅ Table with PHI access logs (if any exist):
     - Timestamp
     - User name + role badge
     - Action
     - Data viewed
     - Justification (⚠️ warning if missing)
     - IP address
     - Session duration
     - Suspicious flag (red badge if risk level is High/Critical)
   - ✅ Pagination controls (if > 25 records)
   - ✅ Export buttons (CSV, PDF)
   - ✅ Error message if patient not found
   - ✅ Empty state if no access logs

**API Call**: `GET /api/audit-logs/phi-access/{patientId}?startDate=&endDate=&page=1&pageSize=25`

**Note**: If no audit logs exist for patients yet, you may see empty results. This is normal for a new database.

---

### Test 4: Breach Detection Alerts Tab
1. Click **Breach Detection** tab (red theme)
2. **Expected UI**:
   - Statistics dashboard (4 cards):
     - Critical Alerts (red count)
     - High Priority (orange count)
     - Investigating (yellow count)
     - Total Alerts (gray count)
   - Filter dropdowns:
     - Severity: All, Critical, High, Medium, Low
     - Status: All, New, Investigating, Resolved, False Positive
     - Alert Type: All, High Volume, After Hours, etc.
   - Alerts table with:
     - Severity badge (color-coded)
     - Alert type icon
     - Description
     - Affected user
     - Risk score (%)
     - Detected timestamp
     - Status dropdown
     - Action buttons (Investigate, Dismiss)

3. **Test Filters**:
   - Select **Severity: Critical**
   - **Expected**: API call with `?severity=Critical`
   - Table updates automatically (auto-refresh on filter change)
   
4. **Test Multiple Filters**:
   - Select **Status: New**
   - Select **Alert Type: high_volume**
   - **Expected**: API call with `?severity=Critical&status=New&alertType=high_volume`
   - Table filters accordingly

**API Call**: `GET /api/audit-logs/breach-detection?severity={}&status={}&alertType={}&page=1&pageSize=25`

**Note**: Breach detection rules run on existing audit logs:
- **High Volume**: >100 patient records in 1 hour
- **After Hours**: Access before 6am or after 10pm
- **Failed Logins**: >5 failures in 15 minutes
- **Bulk Export**: Actions containing "Export" or "Bulk"

If no alerts show, the database may not have patterns matching these rules yet.

---

### Test 5: End-to-End Integration

**Scenario: Track PHI Access After Creating Audit Log**

1. **Create an audit log** (via Swagger or normal system usage):
   ```
   Navigate to any patient record in the UI
   → This creates an audit log automatically
   ```

2. **Verify in PHI Access tab**:
   - Go to PHI Access Tracking tab
   - Enter the patient ID
   - Click Track Access
   - **Expected**: See the new log entry immediately

3. **Verify in System Logs tab**:
   - Go to System Logs tab
   - Find the new log entry
   - Click on it
   - **Expected**: Modal shows detailed information

---

## 🐛 Troubleshooting

### No Data in PHI Access Tab
**Cause**: No patient access logs in database yet  
**Solution**: This is normal for new deployment. Create some patient records and access them to generate logs.

### No Alerts in Breach Detection
**Cause**: No patterns matching breach detection rules  
**Solution**: 
1. Create test data that triggers rules:
   - Access >100 patient records quickly (high volume)
   - Login after 10pm (after hours)
   - Try wrong password >5 times (failed attempts)

### Modal Shows Loading Forever
**Cause**: API endpoint not responding  
**Check**:
1. Verify backend is running: http://localhost:5073/swagger
2. Check browser console for errors (F12 → Console)
3. Check network tab for failed requests (F12 → Network)

**Common Fix**: JWT token expired
- Logout and login again to get new token

### CORS Error
**Cause**: Frontend can't connect to backend  
**Check**:
1. Backend CORS is configured for `http://localhost:3001`
2. Frontend `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5073/api`

### Filter Changes Don't Update Data
**Cause**: API call may be failing  
**Check**:
1. Open browser console (F12)
2. Watch for API errors
3. Verify JWT token is valid (check Authorization header in Network tab)

---

## 📊 API Endpoints Being Called

### When You Click on Audit Log Row
```
GET http://localhost:5073/api/audit-logs/{id}/details
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Response**:
```json
{
  "id": "uuid",
  "timestamp": "2026-01-21T...",
  "userName": "admin@test.com",
  "action": "Login",
  "oldValues": "{}",
  "newValues": "{...}",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "geolocation": { "city": "", "country": "" }
}
```

### When You Search for Patient Access
```
GET http://localhost:5073/api/audit-logs/phi-access/{patientId}?page=1&pageSize=25
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Response**:
```json
{
  "patientId": "uuid",
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2026-01-21T...",
      "userName": "Dr. Smith",
      "userRole": "Physician",
      "action": "View Patient Record",
      "suspicious": false
    }
  ],
  "totalCount": 5,
  "totalPages": 1
}
```

### When You Load Breach Alerts
```
GET http://localhost:5073/api/audit-logs/breach-detection?severity=Critical&page=1&pageSize=25
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Response**:
```json
{
  "alerts": [
    {
      "id": "uuid",
      "severity": "Critical",
      "alertType": "high_volume",
      "description": "Accessed >100 records in 1 hour",
      "userName": "Dr. Wilson",
      "riskScore": 95
    }
  ],
  "totalCount": 3
}
```

---

## ✅ Success Criteria

**All Tests Pass When**:
- ✅ Modal opens and fetches detailed log data
- ✅ Loading spinner shows during API calls
- ✅ PHI Access tab searches by patient ID
- ✅ Breach Detection tab loads and filters work
- ✅ Filter changes trigger automatic refresh
- ✅ Error messages display for failed API calls
- ✅ Empty states show when no data exists
- ✅ All 4 tabs are functional

---

## 🎯 What's Working Now

### ✅ Backend (100% Complete)
- 4 new endpoints implemented
- All endpoints compile with 0 errors
- Breach detection rules implemented:
  - High volume (>100 records/hour)
  - After hours (6am-10pm)
  - Failed logins (>5 in 15min)
  - Bulk export detection

### ✅ Frontend (100% Complete)
- PhiAccessTracking.tsx → Calls `/audit-logs/phi-access/{patientId}`
- BreachDetectionAlerts.tsx → Calls `/audit-logs/breach-detection`
- AuditLogDetailsModal.tsx → Calls `/audit-logs/{id}/details`
- All components have:
  - ✅ Loading states
  - ✅ Error handling
  - ✅ Auto-refresh on filter changes
  - ✅ Empty states

### ✅ Integration
- API base URL: `http://localhost:5073/api`
- JWT authentication working
- X-Tenant-ID header included
- CORS configured

---

## 🚀 Test Now!

1. **Open browser**: http://localhost:3001
2. **Login**: admin@test.com / Admin123!
3. **Navigate**: Dashboard → Admin → Audit Logs
4. **Test each tab** following the checklist above
5. **Report findings** (any errors, missing data, or unexpected behavior)

---

## 📝 Notes

- **Mock data removed**: All components now call real API
- **Loading states**: Spinners show during API calls
- **Error handling**: Errors display as red alerts
- **Auto-refresh**: Filters trigger new API calls automatically
- **Empty states**: Friendly messages when no data exists

**Backend is running. Frontend is running. APIs are connected. Ready to test!** 🎉
