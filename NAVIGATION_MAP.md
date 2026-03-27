# 🗺️ Unified Appointment Booking - Navigation Map

## Complete Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOSPITAL PORTAL NAVIGATION                    │
└─────────────────────────────────────────────────────────────────┘

📱 SIDEBAR (Left Navigation)
├── 📊 Dashboard
│   └── Overview → /dashboard
│
├── 👥 Patient Management
│   ├── Patients → /dashboard/patients
│   ├── Appointments → /dashboard/appointments
│   ├── 📅 Book Appointment → /dashboard/appointments/book ⭐ NEW
│   ├── Patient Portal → /dashboard/patient-portal
│   └── Referrals → /dashboard/referrals
│
├── 🏢 Front Desk ⭐ NEW SECTION
│   ├── Front Desk Dashboard → /dashboard/frontdesk
│   ├── 📅 Book Appointment → /dashboard/frontdesk/book ⭐ NEW
│   └── Check-In → /dashboard/frontdesk/check-in
│
├── 🩺 Clinical Operations
│   ├── Examinations → /dashboard/examinations
│   ├── Eye Examination (submenu)
│   ├── Doctor's Desk (submenu)
│   └── [Other clinical items...]
│
└── ⚙️ Admin Management
    └── [Admin items...]


🎯 APPOINTMENTS PAGE (/dashboard/appointments)
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [📅 Book New Appointment] ← BLUE PROMINENT BUTTON ⭐   │ │
│  │ [Quick Book] [Eye Appointment] ← Gray legacy buttons  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Stats Cards: Today | Completed | Scheduled | Confirmed     │
│                                                              │
│  Tabs: Calendar | List | Availability | Specialty | Analytics│
│                                                              │
│  [Appointment Calendar/List View]                           │
└─────────────────────────────────────────────────────────────┘

When "Book New Appointment" clicked:
→ Opens UnifiedAppointmentBooking as MODAL OVERLAY


🗂️ PATIENTS PAGE (/dashboard/patients)
┌─────────────────────────────────────────────────────────────┐
│  Patient Directory Hub                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Header                                                  │ │
│  │ [📅 Book Appointment] [+ New Patient] ⭐ NEW GREEN BTN │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────┬─────────────────────────────────────────────┐ │
│  │ Patient  │  Patient Details & Actions                  │ │
│  │ List     │                                             │ │
│  │ (Left)   │  [Check-In] [Medical Records] [More...]    │ │
│  └──────────┴─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

When "Book Appointment" clicked:
→ Navigates to /dashboard/patients/book (FULL PAGE)


🏢 FRONT DESK DASHBOARD (/dashboard/frontdesk)
┌─────────────────────────────────────────────────────────────┐
│  Front Desk Dashboard                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Header                                                  │ │
│  │ [📅 Book Appointment] [Check-In] ⭐ NEW BLUE BTN       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Stats: Today's Appts | Pending Reg | Waiting | Completed  │
│                                                              │
│  ┌─────────────────────┬─────────────────────────────────┐ │
│  │ Today's Schedule    │ Quick Actions ⭐ CLICKABLE     │ │
│  │                     │ ┌─────────┬─────────────────┐  │ │
│  │ [Timeline view]     │ │ New     │ 📅 Book        │  │ │
│  │                     │ │ Patient │ Appointment ⭐  │  │ │
│  │                     │ ├─────────┼─────────────────┤  │ │
│  │                     │ │ Check-  │ View            │  │ │
│  │                     │ │ In      │ Waitlist        │  │ │
│  └─────────────────────┴─┴─────────┴─────────────────┴──┘ │
└─────────────────────────────────────────────────────────────┘

Multiple ways to access booking:
1. Header: "Book Appointment" button → /dashboard/frontdesk/book
2. Quick Actions: "Book Appointment" tile → /dashboard/frontdesk/book


📅 UNIFIED BOOKING COMPONENT
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Book Appointment                                   [X] │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  STEP 1: PATIENT SEARCH                               │  │
│  │  ┌──────────────────────────────────┬──────────────┐  │  │
│  │  │ Search by name, MRN, mobile...   │ [🔍 Search] │  │  │
│  │  └──────────────────────────────────┴──────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ ✓ Patient Found                                 │  │  │
│  │  │ John Doe | MRN: PT-2024-0001 | 9876543210      │  │  │
│  │  │ [Change Patient]                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  OR (if not found)                                    │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ 👤 Quick Patient Registration                   │  │  │
│  │  │                                                  │  │  │
│  │  │ [Photo]  [Add Photo ▼]                         │  │  │
│  │  │          - Upload Photo                         │  │  │
│  │  │          - Take Photo (Webcam)                  │  │  │
│  │  │          - Send to Patient                      │  │  │
│  │  │                                                  │  │  │
│  │  │ First Name:    [________]  Last Name: [_______] │  │  │
│  │  │ Mobile:        [__________]  Gender: [▼Male  ] │  │  │
│  │  │ DOB (DD/MM/YYYY): [15/06/1990]  Age: [34    ] │  │  │
│  │  │                                                  │  │  │
│  │  │ 👨‍👦 Guardian Details (if age <18 or >60)       │  │  │
│  │  │ Guardian Name: [_______________]                │  │  │
│  │  │ Guardian Mobile: [______________]               │  │  │
│  │  │ Relationship: [_________________]               │  │  │
│  │  │                                                  │  │  │
│  │  │ [Save & Continue to Booking]                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  STEP 2: APPOINTMENT DETAILS                          │  │
│  │  Department: [▼ Ophthalmology    ]                   │  │
│  │  Doctor:     [▼ Dr. John Smith   ]                   │  │
│  │  Date:       [15/02/2026         ]                   │  │
│  │  Time Slot:  [09:00] [09:30] [10:00] ...            │  │
│  │  Type:       [▼ Consultation     ]                   │  │
│  │  Notes:      [___________________]                   │  │
│  │                                                        │  │
│  │  [Cancel] [Book Appointment & Proceed to Billing]    │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

After booking:
→ Redirects to /dashboard/billing?appointmentId=XXX


🔄 WORKFLOW DIAGRAMS

EXISTING PATIENT FLOW:
┌──────────────┐
│ Click "Book  │
│ Appointment" │
└──────┬───────┘
       ↓
┌──────────────┐
│ Search: "Sam"│
└──────┬───────┘
       ↓
┌──────────────────┐
│ Patient Found    │
│ Click to Select  │
└──────┬───────────┘
       ↓
┌────────────────────┐
│ Fill Appointment   │
│ - Department       │
│ - Doctor           │
│ - Date & Time      │
│ - Type & Notes     │
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ Click "Book &      │
│ Proceed to Billing"│
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ → /dashboard/      │
│   billing?apptId=X │
└────────────────────┘


NEW PATIENT FLOW:
┌──────────────┐
│ Click "Book  │
│ Appointment" │
└──────┬───────┘
       ↓
┌─────────────────┐
│ Search:         │
│ "9999999999"    │
└──────┬──────────┘
       ↓
┌─────────────────┐
│ Not Found       │
│ Quick Reg Form  │
│ Appears Auto    │
└──────┬──────────┘
       ↓
┌────────────────────┐
│ Fill Patient Info  │
│ - Name & Mobile    │
│ - DOB (auto-format)│
│ - Age (auto-calc)  │
│ - Gender           │
│ - Guardian (if <18)│
│ - Photo (optional) │
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ Click "Save &      │
│ Continue"          │
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ Patient Created    │
│ → Booking Form     │
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ Fill Appointment   │
│ Details            │
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ Book & Redirect    │
│ to Billing         │
└────────────────────┘


🎯 BUTTON LOCATIONS SUMMARY

Location: SIDEBAR
├── Patient Management → "Book Appointment"
│   → /dashboard/appointments/book
└── Front Desk → "Book Appointment"
    → /dashboard/frontdesk/book

Location: APPOINTMENTS PAGE
└── Header → "Book New Appointment" (Blue, Prominent)
    → Opens modal overlay

Location: PATIENTS PAGE
└── Header → "Book Appointment" (Green)
    → /dashboard/patients/book

Location: FRONT DESK DASHBOARD
├── Header → "Book Appointment" (Blue)
│   → /dashboard/frontdesk/book
└── Quick Actions Card → "Book Appointment" tile (Green)
    → /dashboard/frontdesk/book


🔗 URL STRUCTURE

/dashboard/appointments
  └── /book ⭐ NEW - Unified booking (full page mode)

/dashboard/frontdesk
  ├── (dashboard home)
  └── /book ⭐ NEW - Unified booking (full page mode)
      └── /check-in - Check-in page

/dashboard/patients
  ├── (patient list)
  └── /book ⭐ NEW - Unified booking (full page mode)


❌ REMOVED ROUTES

/dashboard/frontdesk/walk-in ← DELETED
  └── WalkInRegistration.tsx ← DELETED
      Replaced by: Unified booking system


✅ COMPONENT MAPPING

Route: /dashboard/appointments/book
File: apps/hospital-portal-web/src/app/dashboard/appointments/book/page.tsx
Component: UnifiedAppointmentBooking

Route: /dashboard/frontdesk/book
File: apps/hospital-portal-web/src/app/dashboard/frontdesk/book/page.tsx
Component: UnifiedAppointmentBooking

Route: /dashboard/patients/book
File: apps/hospital-portal-web/src/app/dashboard/patients/book/page.tsx
Component: UnifiedAppointmentBooking

Shared Component:
File: apps/hospital-portal-web/src/components/appointments/UnifiedAppointmentBooking.tsx
Purpose: Single source of truth for all booking workflows


🎨 BUTTON STYLING GUIDE

Primary Booking Buttons (Most Prominent):
- Appointments Page: BLUE background, white text
- Patients Page: GREEN background, white text
- Front Desk Header: BLUE background, white text
- Front Desk Quick Action: GREEN border, hover green bg

Secondary Buttons (Legacy):
- Quick Book: GRAY background (de-emphasized)
- Eye Appointment: GRAY background (de-emphasized)


📊 ACCESS MATRIX

| User Role        | Can Access Via                              |
|------------------|---------------------------------------------|
| Admin            | All locations                               |
| Receptionist     | Sidebar, Front Desk Dashboard, Appointments |
| Doctor           | Sidebar, Appointments Page                  |
| Nurse            | Sidebar, Appointments Page                  |
| Billing Clerk    | Appointments Page only                      |
| Any logged user  | Sidebar → Patient Management                |


🚀 QUICK ACCESS CHEAT SHEET

Want to book appointment? Try these:
1. Sidebar → "Book Appointment" (fastest)
2. Go to /dashboard/frontdesk → Click blue button
3. Go to /dashboard/appointments → Click blue button
4. Go to /dashboard/patients → Click green button
5. Direct: /dashboard/appointments/book (or /frontdesk/book or /patients/book)

All routes use the SAME component = consistent UX! ✨
```
