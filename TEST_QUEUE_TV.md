# Queue TV Real-Time Testing Guide 🎬

**Created**: February 4, 2026  
**Status**: Ready to test real-time SignalR updates

---

## ✅ Prerequisites (All Complete)

- ✅ Backend running on http://localhost:5073 (PID 13496)
- ✅ Frontend running on http://localhost:3000
- ✅ Queue TV Display: http://localhost:3000/dashboard/queue/tv
- ✅ WebSocket connected with green "Live Updates Active" badge
- ✅ SignalR hub: ws://localhost:5073/hubs/queue

---

## 🧪 Test Scenarios

### **Test 1: Call Patient via Swagger UI** (Recommended - Easiest)

**Step 1**: Open Swagger UI
```
http://localhost:5073/swagger
```

**Step 2**: Authenticate (get JWT token)
1. Click "Authorize" button (top right)
2. Login via POST `/api/auth/login`:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```
3. Copy the token from response
4. Click "Authorize" again
5. Paste token in format: `Bearer {your-token}`
6. Click "Authorize" then "Close"

**Step 3**: Get Queue Items
1. Expand `GET /api/queue/branch/{branchId}`
2. Use branch ID: `155fe198-6ae5-4a01-9254-ead5b427247e` (from Queue TV)
3. Click "Try it out" → "Execute"
4. Copy an `id` from the response (any queue item with status "waiting")

**Step 4**: Call Patient
1. Expand `POST /api/queue/{id}/call`
2. Click "Try it out"
3. Paste the queue item `id` from Step 3
4. Request body:
   ```json
   {
     "roomNumber": "Room 5",
     "doctorName": "Dr. Smith"
   }
   ```
5. Click "Execute"

**Step 5**: Watch Queue TV Page
- ✅ Current token should update immediately
- ✅ Token number displayed in large font
- ✅ Room number: "Room 5"
- ✅ Doctor name: "Dr. Smith"
- ✅ Audio notification plays (if enabled)

---

### **Test 2: Call Patient via PowerShell** (Advanced)

**Prerequisites**: You need a valid JWT token and queue item ID

**Step 1**: Get JWT Token
```powershell
$loginBody = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.token
Write-Host "Token: $token" -ForegroundColor Green
```

**Step 2**: Get Queue Items
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = "155fe198-6ae5-4a01-9254-ead5b427247e"
}

$branchId = "155fe198-6ae5-4a01-9254-ead5b427247e"
$queueItems = Invoke-RestMethod -Uri "http://localhost:5073/api/queue/branch/$branchId" `
    -Method GET `
    -Headers $headers

$queueItems | ForEach-Object {
    Write-Host "ID: $($_.id) | Token: $($_.tokenNumber) | Status: $($_.status)" -ForegroundColor Yellow
}

# Save first waiting item
$queueItemId = ($queueItems | Where-Object { $_.status -eq 'waiting' } | Select-Object -First 1).id
Write-Host "`nSelected Queue Item ID: $queueItemId" -ForegroundColor Cyan
```

**Step 3**: Call Patient
```powershell
$callBody = @{
    roomNumber = "Room 5"
    doctorName = "Dr. Smith"
} | ConvertTo-Json

$callResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/queue/$queueItemId/call" `
    -Method POST `
    -Body $callBody `
    -Headers $headers `
    -ContentType "application/json"

Write-Host "`nPatient Called Successfully!" -ForegroundColor Green
Write-Host "Token: $($callResponse.queueItem.tokenNumber)" -ForegroundColor Cyan
Write-Host "Room: $($callResponse.queueItem.roomNumber)" -ForegroundColor Cyan
Write-Host "Doctor: $($callResponse.queueItem.doctorName)" -ForegroundColor Cyan
```

**Step 4**: Check Queue TV page - should update in real-time!

---

### **Test 3: Create Test Queue Items** (If Queue is Empty)

If you don't have any queue items, create test data:

**Via Swagger**:
1. POST `/api/visits/check-in`
2. Body:
   ```json
   {
     "patientId": "your-patient-id",
     "appointmentId": "your-appointment-id",
     "branchId": "155fe198-6ae5-4a01-9254-ead5b427247e",
     "departmentId": "your-department-id",
     "queueType": "Doctor",
     "chiefComplaint": "Eye checkup"
   }
   ```

**Via PowerShell**:
```powershell
# You'll need valid patient ID, appointment ID, department ID
$checkInBody = @{
    patientId = "your-patient-id-here"
    appointmentId = "your-appointment-id-here"
    branchId = "155fe198-6ae5-4a01-9254-ead5b427247e"
    departmentId = "your-department-id-here"
    queueType = "Doctor"
    chiefComplaint = "Regular eye checkup"
} | ConvertTo-Json

$checkInResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/visits/check-in" `
    -Method POST `
    -Body $checkInBody `
    -Headers $headers `
    -ContentType "application/json"

Write-Host "Token Generated: $($checkInResponse.tokenNumber)" -ForegroundColor Green
```

---

## 🎯 Expected Results

### **Queue TV Page Should Show**:

**Before Calling**:
- 🟢 Green badge: "Live Updates Active"
- 📊 Stats: "0 Waiting" (if no tokens)
- 💬 Message: "Waiting for next patient..."

**After Calling**:
- 🔊 Audio notification plays
- 🎫 Token number updates (e.g., "BLR-20260204-001")
- 🏥 Room number: "Room 5"
- 👨‍⚕️ Doctor name: "Dr. Smith"
- ⏰ Called time: Current timestamp
- 📊 Stats update automatically

### **Console Logs (Check Browser DevTools)**:
```
[Queue TV] Token Called Event Received: {
  tokenNumber: "BLR-20260204-001",
  roomNumber: "Room 5",
  doctorName: "Dr. Smith",
  calledAt: "2026-02-04T..."
}
```

---

## 🐛 Troubleshooting

### **Issue 1: No Real-Time Updates**

**Check WebSocket Connection**:
```javascript
// In browser console on Queue TV page
console.log('Connection State:', connection?.state);
// Should be: "Connected"
```

**Check Green Badge**:
- If badge is red or missing → WebSocket not connected
- Hard refresh page (Ctrl+Shift+R)

### **Issue 2: "No Queue Items Found"**

**Create Test Data**:
- Use POST `/api/visits/check-in` to create queue tokens
- Or insert test data directly in database

### **Issue 3: SignalR Event Not Received**

**Check Browser Console**:
```javascript
// Should see logs like:
[Queue TV] Subscribed to queue updates
SubscriptionConfirmed event received
```

**Check Backend Logs**:
- Look for: "SignalR event emitted for token {TokenNumber}"
- Look for: "User subscribed to queue..."

### **Issue 4: 401 Unauthorized**

**Re-authenticate**:
- JWT token might be expired
- Login again via POST `/api/auth/login`
- Update Authorization header with new token

---

## 📊 Test Checklist

- [ ] Queue TV page loads without errors
- [ ] Green "Live Updates Active" badge visible
- [ ] Branch selected: "Bangalore Eye Hospital - Koramangala - Doctor"
- [ ] Backend running on port 5073
- [ ] Swagger UI accessible
- [ ] JWT token obtained and valid
- [ ] At least 1 queue item in "waiting" status
- [ ] Call patient via Swagger → Success (200 OK)
- [ ] Queue TV updates in real-time (< 1 second)
- [ ] Token number displayed correctly
- [ ] Room number displayed
- [ ] Doctor name displayed
- [ ] Audio notification plays (if enabled)
- [ ] Console logs show "TokenCalled" event
- [ ] Stats update correctly

---

## 🎬 Quick Start (Copy-Paste)

**Open these 3 tabs**:

1. **Queue TV Display**:
   ```
   http://localhost:3000/dashboard/queue/tv
   ```

2. **Swagger UI**:
   ```
   http://localhost:5073/swagger
   ```

3. **Browser Console** (Press F12 on Queue TV page)

**Then**:
1. Authenticate in Swagger (click "Authorize")
2. GET queue items: `/api/queue/branch/{branchId}`
3. Copy a queue item ID
4. POST `/api/queue/{id}/call` with room/doctor
5. Watch Queue TV update instantly! ✨

---

## 🚀 Next Steps After Testing

Once real-time updates are confirmed:

1. ✅ **Module 4 Queue TV Complete** - Mark as done
2. 🔄 **Test Audio Notification** - Enable browser sound
3. 📱 **Test on Mobile/Tablet** - Check responsiveness
4. 🎨 **Polish UI** - Font sizes, colors, animations
5. 📊 **Test Multiple Tokens** - Call 5+ patients
6. ⏰ **Test Auto-Advance** - Configure queue rotation
7. 🔧 **Configure Settings** - Branch/department filters

---

**Status**: Ready to test! 🎉  
**Estimated Time**: 15-30 minutes  
**Difficulty**: Easy (using Swagger UI)

---

**Need Help?**
- Backend not running? → Run `.\START_BACKEND.bat`
- Frontend not running? → Run `pnpm dev` in `apps/hospital-portal-web`
- WebSocket not connecting? → Hard refresh (Ctrl+Shift+R)
