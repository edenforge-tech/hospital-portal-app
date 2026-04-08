# Unified Appointment Booking - Testing Guide

## 🎯 Overview
The new Unified Appointment Booking system replaces the old Walk-In Registration with a single, streamlined workflow for booking appointments with both existing and new patients.

---

## 📍 Access Points - Where to Find It

### 1. **Sidebar Navigation** (Available from anywhere)
   - **Patient Management Section** → "Book Appointment"
   - **Front Desk Section** → "Book Appointment"
   
### 2. **Appointments Page** (http://localhost:3000/dashboard/appointments)
   - Click the prominent blue **"Book New Appointment"** button in the header
   - Opens as modal overlay

### 3. **Patients Page** (http://localhost:3000/dashboard/patients)
   - Click the green **"Book Appointment"** button in the header
   - Redirects to booking page

### 4. **Front Desk Dashboard** (http://localhost:3000/dashboard/frontdesk)
   - **Header Button**: Blue "Book Appointment" button
   - **Quick Actions Card**: "Book Appointment" tile (green)
   - Both navigate to booking page

### 5. **Direct URLs**
   - `/dashboard/appointments/book` - From appointments
   - `/dashboard/frontdesk/book` - Front desk access
   - `/dashboard/patients/book` - From patients page

---

## 🧪 Test Scenarios

### ✅ Test 1: Existing Patient Appointment Booking

**Steps:**
1. Open any of the access points above
2. In the search box, type a patient identifier:
   - Name: "Sam" or "John"
   - MRN: "PT-2024-0001"
   - Mobile: "9876543210"
   - Email: "patient@email.com"
3. Click **"Search"** button
4. Click on a patient from the search results
5. Patient details appear in green success box
6. Fill appointment details:
   - Select **Department** (e.g., "Ophthalmology")
   - Select **Doctor** (filtered by department)
   - Select **Date** (including today)
   - Select **Time Slot** (9 AM - 5 PM, 30-min intervals)
   - Select **Appointment Type** (Consultation/Follow-up/Emergency)
   - Add **Notes** (optional)
7. Click **"Book Appointment & Proceed to Billing"**

**Expected Result:**
- ✅ Appointment created successfully
- ✅ Auto-redirect to `/dashboard/billing?appointmentId={id}`
- ✅ Modal closes
- ✅ Appointments list refreshes

---

### ✅ Test 2: New Patient Quick Registration + Booking

**Steps:**
1. Open booking modal/page
2. Search for non-existent patient: "9999999999"
3. No results found → Quick registration form appears automatically
4. Fill **mandatory fields**:
   - **First Name**: John
   - **Last Name**: Doe
   - **Mobile**: 9876543210 (10 digits, auto-validated)
   - **Date of Birth**: Type "15061990" → auto-formats to "15/06/1990"
   - **Age**: Auto-calculated (should show ~34)
   - **Gender**: Select "Male"
5. **Guardian fields should NOT appear** (age is 34, not <18 or >60)
6. Optionally add photo:
   - Click "Add Photo" button
   - Choose: Upload / Webcam / Send to Patient
7. Click **"Save & Continue to Booking"**
8. Patient created → form switches to appointment booking
9. Fill appointment details (same as Test 1)
10. Click **"Book Appointment & Proceed to Billing"**

**Expected Result:**
- ✅ Patient created with auto-generated MRN
- ✅ Quick form closes, booking form appears
- ✅ Appointment created successfully
- ✅ Redirect to billing

---

### ✅ Test 3: Minor Patient (Guardian Required)

**Steps:**
1. Open booking modal/page
2. Search non-existent, quick form appears
3. Fill details:
   - **Name**: Sarah Smith
   - **Mobile**: 9988776655
   - **DOB**: Type "15062020" → formats to "15/06/2020"
   - **Age**: Auto-calculated (~5-6 years)
   - **Gender**: Female
4. **Guardian fields should AUTOMATICALLY appear** (age < 18)
5. Fill **mandatory guardian fields**:
   - **Guardian Name**: Robert Smith
   - **Guardian Mobile**: 9876543210
   - **Relationship**: Father
6. Try to save without guardian details → Should show error: "Guardian details are mandatory for minors and senior citizens"
7. Fill guardian fields and save
8. Book appointment

**Expected Result:**
- ✅ Guardian fields appear when DOB makes age <18
- ✅ Validation prevents saving without guardian details
- ✅ Patient created with guardian info
- ✅ Appointment booked successfully

---

### ✅ Test 4: Senior Citizen (Guardian Required)

**Steps:**
1. Quick registration form
2. Fill details:
   - **Name**: Margaret Wilson
   - **Mobile**: 9123456789
   - **DOB**: Type "15061950" → formats to "15/06/1950"
   - **Age**: Auto-calculated (~75 years)
   - **Gender**: Female
3. **Guardian fields should appear** (age > 60)
4. Fill guardian details:
   - **Guardian Name**: Emily Wilson
   - **Guardian Mobile**: 9988001122
   - **Relationship**: Daughter
5. Save and book appointment

**Expected Result:**
- ✅ Guardian fields appear when DOB makes age >60
- ✅ Patient created with guardian info
- ✅ Appointment booked successfully

---

### ✅ Test 5: DOB Auto-Formatting

**Test the DD/MM/YYYY auto-formatting:**

| User Types | Auto-Formats To | Age Calculated |
|------------|----------------|----------------|
| 1 | 1 | - |
| 15 | 15/ | - |
| 1506 | 15/06/ | - |
| 150619 | 15/06/19 | - |
| 15061990 | 15/06/1990 | 35-36 |
| 01012000 | 01/01/2000 | 24-25 |
| 31121955 | 31/12/1955 | 70 |

**Expected Result:**
- ✅ Auto-inserts `/` after day and month
- ✅ Max length is 10 characters (DD/MM/YYYY)
- ✅ Age updates in real-time when valid DOB entered
- ✅ Year must be 4 digits

---

### ✅ Test 6: Multi-Field Smart Search

**Test search across all fields:**

| Search Term | Should Find Patients By |
|-------------|------------------------|
| Sam | First/Last Name |
| PT-2024-0001 | MRN |
| 9876543210 | Mobile Number |
| patient@email.com | Email |

**Expected Result:**
- ✅ Single search executes 4 parallel API calls
- ✅ Results deduplicated by patient ID
- ✅ No dropdown needed - searches all fields automatically

---

### ✅ Test 7: Photo Capture Options

**Test all photo options:**

1. **Upload Photo**:
   - Click "Add Photo" → "Upload Photo"
   - Select image file
   - Should preview immediately

2. **Webcam Capture** (Phase 1):
   - Click "Add Photo" → "Take Photo (Webcam)"
   - Should show alert: "Webcam capture will be implemented"

3. **Send to Patient** (Phase 1):
   - Click "Add Photo" → "Send to Patient"
   - Should show alert: "Photo link sent to patient mobile number..."

**Expected Result:**
- ✅ Upload works and shows preview
- ✅ Webcam/Send show placeholder alerts (Phase 2 feature)

---

### ✅ Test 8: Modal vs Full Page

**Test different access modes:**

1. **Modal Mode** (Appointments page):
   - Click "Book New Appointment" button
   - Should open as overlay
   - Background page still visible but dimmed
   - Click X or outside → closes modal

2. **Full Page Mode** (Direct URLs):
   - Navigate to `/dashboard/frontdesk/book`
   - Should open as full page
   - Click X → navigates back

**Expected Result:**
- ✅ Both modes work identically
- ✅ Same component, different presentation
- ✅ Data submission works in both modes

---

### ✅ Test 9: Validation Errors

**Test form validations:**

1. Try to save patient without name → Error: "Please enter patient name"
2. Try with invalid mobile (999) → Error: "Please enter valid 10-digit mobile number"
3. Try without DOB → Error: "Please enter valid date of birth (DD/MM/YYYY)"
4. Try without gender → Error: "Please select gender"
5. Try minor without guardian → Error: "Guardian details are mandatory..."
6. Try to book without department → Error: "Please fill all appointment details"
7. Try to book without time slot → Button disabled

**Expected Result:**
- ✅ All validations fire correctly
- ✅ Helpful error messages shown
- ✅ Form prevents invalid submissions

---

### ✅ Test 10: Navigation Flow

**Test complete user journey:**

```
Dashboard → Sidebar → Book Appointment
   ↓
Search existing patient → Found → Select
   ↓
Fill appointment details
   ↓
Click "Book Appointment & Proceed to Billing"
   ↓
Redirect to /dashboard/billing?appointmentId=XXX
   ↓
Process payment
   ↓
Patient receives token/receipt
```

**Alternative Journey (New Patient):**

```
Front Desk Dashboard → Book Appointment (Quick Action)
   ↓
Search non-existent patient (mobile)
   ↓
Quick registration form appears
   ↓
Fill patient details (auto-format DOB)
   ↓
Guardian fields appear if minor/senior
   ↓
Upload photo (optional)
   ↓
Save & Continue
   ↓
Fill appointment details
   ↓
Book & Redirect to billing
```

---

## 🐛 Known Issues / Limitations

### Phase 1 (Current):
- ✅ Upload photo works
- ⚠️ Webcam capture: Placeholder (Phase 2)
- ⚠️ Send to Patient: Manual process (Phase 2 will add SMS/WhatsApp link)

### Phase 2 (Planned):
- SMS/WhatsApp integration for photo link
- Real-time photo sync via WebSocket
- Mobile-optimized photo capture page
- Link expiration and security

---

## 📊 Success Criteria

| Criteria | Status |
|----------|--------|
| Existing patient search works | ✅ |
| New patient quick registration works | ✅ |
| DOB auto-formatting works | ✅ |
| Age auto-calculation works | ✅ |
| Guardian fields show for <18 or >60 | ✅ |
| Guardian validation enforced | ✅ |
| Photo upload works | ✅ |
| Multi-field search works | ✅ |
| Appointment booking works | ✅ |
| Auto-redirect to billing works | ✅ |
| Modal mode works | ✅ |
| Full page mode works | ✅ |
| All navigation buttons work | ✅ |
| Sidebar navigation added | ✅ |
| Walk-in registration removed | ✅ |

---

## 🚀 Quick Test Checklist

- [ ] Click "Book New Appointment" from appointments page
- [ ] Search for existing patient "Sam"
- [ ] Select patient and book appointment
- [ ] Verify redirect to billing
- [ ] Go to Front Desk dashboard
- [ ] Click "Book Appointment" quick action
- [ ] Search non-existent mobile: 9999999999
- [ ] Quick form appears
- [ ] Type DOB: 15061990 → formats to 15/06/1990
- [ ] Age shows ~34
- [ ] No guardian fields (age not <18 or >60)
- [ ] Save patient
- [ ] Book appointment
- [ ] Verify redirect to billing
- [ ] Test minor patient (DOB: 15062020)
- [ ] Guardian fields appear
- [ ] Fill guardian details
- [ ] Save and book
- [ ] Test senior patient (DOB: 15061950)
- [ ] Guardian fields appear
- [ ] Complete booking
- [ ] Check sidebar has "Book Appointment" links
- [ ] Verify old walk-in route deleted

---

## 📞 Support

**Backend Running?**
- Check: http://localhost:5073/swagger

**Frontend Running?**
- Check: http://localhost:3000

**Servers Not Running?**
```powershell
# Frontend
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web"
pnpm dev

# Backend
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
dotnet run
```

**Still Issues?**
- Check browser console for errors (F12)
- Check network tab for failed API calls
- Verify tenant ID is set in auth store
- Check API connection in .env.local

---

**Happy Testing! 🎉**
