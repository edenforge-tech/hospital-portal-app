# Module 4 - Quick Testing Commands

## 🚀 START SERVERS

### Backend (Terminal 1)
```powershell
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
dotnet run
```
✅ Verify: Open http://localhost:5073/swagger

### Frontend (Terminal 2)
```powershell
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web"
pnpm dev
```
✅ Verify: Open http://localhost:3000

---

## 🧪 QUICK TEST SEQUENCE

### 1. Login
- URL: http://localhost:3000/login
- Email: `receptionist@test.com`
- Password: `Test@123456`

### 2. Create Test Patient (via Swagger)

**POST /api/patients**
```json
{
  "firstName": "Test",
  "lastName": "Patient",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "mobileNumber": "9999999999",
  "email": "test.patient@test.com",
  "address": "Test Address"
}
```
📋 Copy `id` from response

### 3. Get Doctor ID (via Swagger)

**GET /api/users/doctors**

📋 Copy any doctor's `id`

### 4. Get Department ID (via Swagger)

**GET /api/departments**

📋 Copy any department's `id`

### 5. Create Appointment (via Swagger)

**POST /api/appointments**
```json
{
  "patientId": "{PATIENT_ID}",
  "doctorId": "{DOCTOR_ID}",
  "departmentId": "{DEPARTMENT_ID}",
  "appointmentDate": "2026-02-05T00:00:00Z",
  "startTime": "10:00:00",
  "endTime": "10:30:00",
  "appointmentType": "New",
  "status": "Confirmed"
}
```
📋 Copy `id` from response

### 6. Create OPD Bill (via Swagger)

**POST /api/opdbills**
```json
{
  "appointmentId": "{APPOINTMENT_ID}",
  "patientId": "{PATIENT_ID}",
  "totalAmount": 500,
  "paidAmount": 500,
  "status": "Paid",
  "paymentMethod": "Cash"
}
```

### 7. Test Check-In (Frontend)

- Navigate to: http://localhost:3000/dashboard/frontdesk/check-in
- Enter mobile: `9999999999`
- Click "Search Patient"
- Click "Verify & Check In"
- ✅ Should succeed and generate token

---

## 🎯 CRITICAL TESTS

### Test SignalR (2 windows)

**Window 1**: http://localhost:3000/dashboard/frontdesk/queue  
**Window 2**: http://localhost:3000/dashboard/frontdesk/queue-tv?queueType=Doctor

1. In Window 1, click "Call Patient"
2. Watch Window 2 update instantly (<1s)
3. ✅ Console logs: "Token called"

---

## 📊 VERIFY REPORTS

**Daily Report**: http://localhost:3000/dashboard/frontdesk/reports?type=daily&date=2026-02-05

Or via Swagger:
```
GET /api/reports/opd/daily?date=2026-02-05
```

---

## ✅ SUCCESS CRITERIA

- [ ] Backend running on http://localhost:5073
- [ ] Frontend running on http://localhost:3000
- [ ] Can login successfully
- [ ] Can create patient/appointment via Swagger
- [ ] Check-in succeeds (token generated)
- [ ] Queue displays patient
- [ ] SignalR updates work (Queue TV)
- [ ] Reports load without errors

**All checks pass?** → Step 4 Complete! ✅

---

## 🔧 TROUBLESHOOTING

**Backend won't start?**
```powershell
# Check port 5073
netstat -ano | findstr :5073
# Kill if needed
Stop-Process -Id <PID> -Force
```

**Frontend won't start?**
```powershell
# Check port 3000
netstat -ano | findstr :3000
# Kill if needed
Stop-Process -Id <PID> -Force
# Clear cache
pnpm store prune
pnpm install
```

**Can't login?**
- Verify database has test users (run migrations)
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`

**SignalR not working?**
- Check backend logs for "SignalR hubs mapped"
- Verify JWT token in localStorage
- Check browser console for connection errors
