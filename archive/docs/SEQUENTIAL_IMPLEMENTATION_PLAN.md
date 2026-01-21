# Sequential Implementation Plan - Eye Hospital Management System

**Generated Date**: December 8, 2025  
**Based On**: Requirements Gap Analysis v1.0  
**Repository**: https://github.com/edenforge-tech/hospital-portal-app  
**Current Status**: ~50% Complete (Infrastructure-heavy, features light)

---

## Executive Summary

This document provides a **detailed, week-by-week implementation roadmap** to complete the Eye Hospital Management System based on the comprehensive requirements document. The plan assumes **3-4 full-time developers** and is organized into **4 phases over 9 months** to reach production-ready status.

### **Timeline Overview**

| Phase | Duration | Focus Areas | Completion Target |
|-------|----------|-------------|-------------------|
| **Phase 2** | Months 1-3 (12 weeks) | **Priority 1**: Core Clinical + Financial | 70% Complete |
| **Phase 3** | Months 4-6 (12 weeks) | **Priority 2**: Advanced Clinical + Infrastructure | 85% Complete |
| **Phase 4** | Months 7-9 (12 weeks) | **Priority 3**: Reporting, Localization, Polish | 95% Complete |
| **Phase 5** | Months 10-12 (12 weeks) | **Advanced Features**: Patient Portal, Telemedicine, Mobile | 100% Complete |

---

## Phase 2: Core Clinical & Financial Workflows (Months 1-3)

**Goal**: Implement **Priority 1 (P1) features** to make the system viable for basic clinical operations

**Deliverables**: Prescriptions, Billing, Lab Orders, Pharmacy, Appointment Calendar

---

### **Month 1: Clinical Core - Prescriptions & Laboratory**

#### **Week 1-2: Prescription Module (Backend + Frontend)**

**Objective**: Enable doctors to create, approve, and manage prescriptions

**Backend Tasks** (Week 1):
- ✅ Database: `prescription` table already exists
- [ ] Create `PrescriptionsController.cs` with endpoints:
  - `GET /api/prescriptions` - List prescriptions (filtered by patient, doctor, date range)
  - `GET /api/prescriptions/{id}` - Get prescription details
  - `POST /api/prescriptions` - Create new prescription
  - `PUT /api/prescriptions/{id}` - Update prescription (with approval workflow)
  - `DELETE /api/prescriptions/{id}` - Soft delete prescription
  - `POST /api/prescriptions/{id}/approve` - Approve prescription (for junior doctors)
  - `POST /api/prescriptions/{id}/refill` - Create refill prescription
  - `GET /api/prescriptions/patient/{patientId}` - Patient prescription history
  - `GET /api/prescriptions/pending-approval` - Prescriptions awaiting approval
  - `POST /api/prescriptions/{id}/print` - Generate prescription PDF
- [ ] Implement `IPrescriptionService` interface and `PrescriptionService` class
  - Validation: Check prescribing authority (doctor/optometrist only)
  - Approval workflow: Junior doctor prescriptions require senior approval
  - Drug interaction checking (basic - use external API in future)
  - Audit logging: Log all prescription actions
- [ ] Add permissions: `prescription.view`, `prescription.create`, `prescription.edit`, `prescription.delete`, `prescription.approve`
- [ ] Unit tests for PrescriptionService (TDD approach)

**Frontend Tasks** (Week 2):
- [ ] Create `/dashboard/prescriptions` page (list view)
  - Table: Patient name, Doctor, Date, Medications, Status (Pending/Approved/Dispensed)
  - Filters: Date range, patient, doctor, status
  - Actions: View, Edit, Approve, Print
- [ ] Create prescription form component (`PrescriptionForm.tsx`)
  - Patient selection (autocomplete)
  - Medication selection (autocomplete from medication inventory)
  - Dosage, frequency, duration, instructions
  - SIG codes support (optional)
  - Special instructions (e.g., "Take with food", "Avoid alcohol")
- [ ] Create prescription detail modal (`PrescriptionDetail.tsx`)
  - Read-only view of prescription
  - Approval section (if pending approval)
  - Dispensing history (if linked to pharmacy)
- [ ] Create prescription approval workflow component
  - List of pending prescriptions
  - Approve/Reject with comments
- [ ] PDF generation component (using react-pdf or similar)
  - Organization branding (logo, name)
  - Doctor details (name, license, signature)
  - Patient details
  - Medication table
  - Prescription ID, date, QR code (for verification)
- [ ] Integration with pharmacy module (prepare API calls)

**Acceptance Criteria**:
- ✅ Doctor can create prescription with multiple medications
- ✅ Junior doctor prescriptions require senior doctor approval
- ✅ Prescription can be printed with organization branding
- ✅ Prescription history visible in patient record
- ✅ All prescription actions logged in audit trail
- ✅ Permission-based access control (only doctors/optometrists can prescribe)

**Dependencies**: None (ready to start)

**Risks**: Drug interaction checking may be complex - defer to Phase 3 if needed

---

#### **Week 3-4: Laboratory Orders Module (Backend + Frontend)**

**Objective**: Enable doctors to order lab tests and lab staff to enter results

**Backend Tasks** (Week 3):
- ✅ Database: `lab_order`, `lab_order_item` tables exist
- [ ] Create `LabOrdersController.cs` with endpoints:
  - `GET /api/lab-orders` - List lab orders (filtered by patient, doctor, status)
  - `GET /api/lab-orders/{id}` - Get lab order details
  - `POST /api/lab-orders` - Create new lab order
  - `PUT /api/lab-orders/{id}` - Update lab order
  - `DELETE /api/lab-orders/{id}` - Soft delete lab order
  - `POST /api/lab-orders/{id}/items` - Add lab test to order
  - `PUT /api/lab-orders/{id}/items/{itemId}` - Update test result
  - `POST /api/lab-orders/{id}/items/{itemId}/result` - Enter test result
  - `POST /api/lab-orders/{id}/approve` - Approve critical results (pathologist)
  - `POST /api/lab-orders/{id}/print` - Generate lab order form
  - `GET /api/lab-orders/patient/{patientId}` - Patient lab history
  - `GET /api/lab-orders/pending-results` - Tests pending result entry
  - `GET /api/lab-orders/critical-results` - Critical results needing approval
- [ ] Create `LabTestCatalogController.cs` with endpoints:
  - `GET /api/lab-tests` - List available lab tests
  - `POST /api/lab-tests` - Add new lab test to catalog
  - `PUT /api/lab-tests/{id}` - Update lab test details
  - `DELETE /api/lab-tests/{id}` - Remove lab test from catalog
- [ ] Implement `ILabOrderService` and `LabOrderService`
  - Validation: Only doctors/junior doctors can order lab tests
  - Result entry: Only lab staff can enter results
  - Critical value alerts: Auto-alert ordering doctor for critical results
  - Status workflow: Ordered → Sample Collected → In Progress → Completed → Approved
- [ ] Add lab test catalog seeding (common tests: CBC, LFT, RFT, HbA1c, etc.)
- [ ] Add permissions: `lab_order.view`, `lab_order.create`, `lab_order.edit`, `lab_order.delete`, `lab_result.enter`, `lab_result.approve`

**Frontend Tasks** (Week 4):
- [ ] Create `/dashboard/laboratory` page (list view)
  - Table: Patient, Doctor, Test(s), Status (Ordered/In Progress/Completed), Date
  - Filters: Date range, patient, doctor, status, test type
  - Actions: View, Enter Result, Approve, Print
- [ ] Create lab order form component (`LabOrderForm.tsx`)
  - Patient selection
  - Multiple test selection (checkboxes from catalog)
  - Clinical indication / reason for test
  - Priority (Routine/Urgent/STAT)
  - Sample collection notes
- [ ] Create result entry component (`LabResultEntry.tsx`)
  - Test name, reference range
  - Result value (numeric or text)
  - Units (e.g., mg/dL, g/dL, cells/μL)
  - Interpretation (Normal/Abnormal/Critical)
  - Technician notes
  - Critical value auto-flag
- [ ] Create lab report component (`LabReport.tsx`)
  - Patient demographics
  - Test(s) with results
  - Reference ranges, flags (H/L/Critical)
  - Pathologist approval signature (if required)
  - Lab logo, accreditation details
- [ ] Critical value alert notification
  - Real-time notification to ordering doctor
  - Acknowledge alert workflow
- [ ] Integration with patient record (show lab history)

**Acceptance Criteria**:
- ✅ Doctor can order multiple lab tests for a patient
- ✅ Lab staff can enter test results with reference ranges
- ✅ Critical results trigger alerts to ordering doctor
- ✅ Pathologist can approve critical results before release
- ✅ Lab reports can be printed with organization branding
- ✅ Lab history visible in patient record
- ✅ Permission-based access control (doctors order, lab staff enter results)

**Dependencies**: Patient module (already exists)

**Risks**: Critical value alert mechanism may require SMS/email integration - use in-app notification initially

---

### **Month 2: Financial Core - Billing & Payments**

#### **Week 5-6: Billing & Invoicing Module (Backend + Frontend)**

**Objective**: Enable invoice generation, billing, and revenue tracking

**Backend Tasks** (Week 5):
- ✅ Database: `invoice`, `charge_item`, `payment` tables exist
- [ ] Create `BillingController.cs` with endpoints:
  - `GET /api/billing/invoices` - List invoices (filtered by patient, date, status)
  - `GET /api/billing/invoices/{id}` - Get invoice details
  - `POST /api/billing/invoices` - Create invoice (manual or auto-generate from services)
  - `PUT /api/billing/invoices/{id}` - Update invoice (before payment)
  - `DELETE /api/billing/invoices/{id}` - Soft delete invoice (only if unpaid and unapproved)
  - `POST /api/billing/invoices/{id}/items` - Add charge item to invoice
  - `PUT /api/billing/invoices/{id}/items/{itemId}` - Update charge item
  - `DELETE /api/billing/invoices/{id}/items/{itemId}` - Remove charge item
  - `POST /api/billing/invoices/{id}/finalize` - Finalize invoice (lock for editing)
  - `GET /api/billing/outstanding` - Outstanding invoices (unpaid)
  - `GET /api/billing/patient/{patientId}/invoices` - Patient billing history
  - `POST /api/billing/invoices/{id}/print` - Generate invoice PDF
  - `GET /api/billing/revenue-summary` - Revenue summary (by date range, branch, department)
- [ ] Create `ChargeMasterController.cs` with endpoints:
  - `GET /api/charge-master` - List charge items (procedures, consultations, tests)
  - `POST /api/charge-master` - Add new charge item
  - `PUT /api/charge-master/{id}` - Update charge item (price, code)
  - `DELETE /api/charge-master/{id}` - Remove charge item
- [ ] Implement `IBillingService` and `BillingService`
  - Auto-generate invoices from appointments, lab orders, prescriptions
  - Calculate totals, taxes (based on organization region)
  - Apply discounts, insurance adjustments
  - Link payments to invoices
  - Outstanding balance tracking
- [ ] Seed charge master with common items:
  - Consultation fees (new patient, follow-up)
  - Common procedures (cataract surgery, LASIK, etc.)
  - Lab tests (from lab catalog)
  - Medications (from pharmacy inventory)
- [ ] Add permissions: `billing.view`, `billing.create`, `billing.edit`, `billing.delete`, `billing.approve`, `billing.writeoff`

**Frontend Tasks** (Week 6):
- [ ] Create `/dashboard/billing` page (invoice list view)
  - Table: Patient, Invoice Date, Total Amount, Paid Amount, Balance, Status
  - Filters: Date range, patient, status (Draft/Finalized/Paid/Partial/Overdue)
  - Actions: View, Edit, Finalize, Print, Record Payment
- [ ] Create invoice form component (`InvoiceForm.tsx`)
  - Patient selection
  - Service date
  - Charge items (add multiple from charge master)
  - Quantity, unit price, discount
  - Subtotal, tax, total
  - Payment terms, due date
- [ ] Create invoice detail component (`InvoiceDetail.tsx`)
  - Read-only view of invoice
  - Payment history table
  - Outstanding balance
  - Actions: Record Payment, Print, Email
- [ ] Create charge master management component (`ChargeMaster.tsx`)
  - List of charge items (procedures, tests, medications)
  - Add/Edit/Delete charge items
  - Bulk import from CSV
- [ ] Create invoice PDF component
  - Organization branding (logo, name, address, tax ID)
  - Patient details
  - Itemized services table
  - Payment terms, due date
  - QR code for online payment (future)
- [ ] Dashboard widget: Revenue summary, outstanding invoices, aging report

**Acceptance Criteria**:
- ✅ Billing staff can create invoices manually or auto-generate from services
- ✅ Invoices can include multiple charge items with discounts
- ✅ Invoices can be finalized (locked for editing)
- ✅ Outstanding invoices report shows aging (30/60/90 days)
- ✅ Revenue summary dashboard displays daily/weekly/monthly revenue
- ✅ Invoices can be printed with organization branding
- ✅ Permission-based access control (only billing staff can create/edit invoices)

**Dependencies**: Appointments, Lab Orders (for auto-invoice generation)

**Risks**: Tax calculation complexity - start with simple percentage, enhance later

---

#### **Week 7-8: Payment Processing & Gateway Integration**

**Objective**: Enable payment recording, online payment processing, and reconciliation

**Backend Tasks** (Week 7):
- ✅ Database: `payment` table exists
- [ ] Create `PaymentsController.cs` with endpoints:
  - `GET /api/payments` - List payments (filtered by date, patient, method)
  - `GET /api/payments/{id}` - Get payment details
  - `POST /api/payments` - Record payment (cash/card/online)
  - `PUT /api/payments/{id}` - Update payment (only if pending)
  - `DELETE /api/payments/{id}` - Soft delete payment (only if pending and unapproved)
  - `POST /api/payments/{id}/approve` - Approve payment (for supervisor approval)
  - `GET /api/payments/patient/{patientId}` - Patient payment history
  - `GET /api/payments/invoice/{invoiceId}` - Payments for specific invoice
  - `POST /api/payments/{id}/receipt` - Generate payment receipt
  - `GET /api/payments/reconciliation` - Daily reconciliation report
- [ ] Implement payment gateway integration (choose one):
  - **Option A**: Razorpay (India) - https://razorpay.com/docs/
  - **Option B**: Stripe (Global) - https://stripe.com/docs/api
  - **Option C**: PayPal (Global) - https://developer.paypal.com/
- [ ] Create `IPaymentGatewayService` interface
  - `CreatePaymentIntent(amount, currency, metadata)`
  - `CapturePayment(paymentIntentId)`
  - `RefundPayment(paymentId, amount)`
  - `GetPaymentStatus(paymentId)`
- [ ] Implement `RazorpayPaymentService` (or StripePaymentService)
  - Initialize SDK with API keys (from appsettings.json)
  - Create payment orders
  - Verify payment signatures (webhook handling)
  - Handle payment callbacks
- [ ] Add webhook endpoint for payment gateway callbacks
  - `POST /api/payments/webhook/razorpay` (or stripe)
  - Verify signature, update payment status
  - Link payment to invoice, update invoice balance
  - Send payment confirmation email (future)
- [ ] Add permissions: `payment.view`, `payment.create`, `payment.edit`, `payment.delete`, `payment.approve`, `payment.refund`

**Frontend Tasks** (Week 8):
- [ ] Create payment recording component (`RecordPayment.tsx`)
  - Invoice selection (if linked)
  - Payment method (Cash, Card, Online, Check, UPI)
  - Amount (with auto-fill of outstanding balance)
  - Payment reference number
  - Payment date
  - Notes
- [ ] Create online payment component (`OnlinePayment.tsx`)
  - Integration with payment gateway (Razorpay/Stripe SDK)
  - Payment form (card details or UPI)
  - Payment confirmation page
  - Redirect back to invoice after payment
- [ ] Create payment receipt component (`PaymentReceipt.tsx`)
  - Organization branding
  - Payment details (amount, method, date, reference)
  - Invoice details (if linked)
  - Thank you message
  - QR code for verification
- [ ] Create reconciliation dashboard (`PaymentReconciliation.tsx`)
  - Summary: Total payments by method (Cash, Card, Online)
  - Discrepancy tracking
  - Export to Excel for accounting
- [ ] Update invoice detail page to show payment history
- [ ] Dashboard widget: Daily payment collections, pending payments

**Acceptance Criteria**:
- ✅ Front desk staff can record cash/card payments
- ✅ Patients can make online payments via payment gateway
- ✅ Payments automatically linked to invoices and update balance
- ✅ Payment receipts can be printed with organization branding
- ✅ Daily reconciliation report available for accounting
- ✅ Webhook integration for real-time payment status updates
- ✅ Permission-based access control (only billing staff can record payments)

**Dependencies**: Billing module (must be completed first)

**Risks**: Payment gateway integration may take longer if APIs are complex - allocate buffer time

---

### **Month 3: Pharmacy & Enhanced Scheduling**

#### **Week 9-10: Pharmacy Management Module (Backend + Frontend)**

**Objective**: Enable medication dispensing, inventory management, and pharmacy workflows

**Backend Tasks** (Week 9):
- ✅ Database: `medication`, `medication_inventory`, `prescription_item` tables exist
- [ ] Create `PharmacyController.cs` with endpoints:
  - `GET /api/pharmacy/prescriptions/pending` - Prescriptions pending dispensing
  - `GET /api/pharmacy/prescriptions/{id}` - Get prescription for dispensing
  - `POST /api/pharmacy/prescriptions/{id}/dispense` - Dispense prescription
  - `GET /api/pharmacy/inventory` - Medication inventory list
  - `GET /api/pharmacy/inventory/{id}` - Medication details
  - `POST /api/pharmacy/inventory` - Add medication to inventory
  - `PUT /api/pharmacy/inventory/{id}` - Update medication (price, stock)
  - `POST /api/pharmacy/inventory/{id}/adjust-stock` - Stock adjustment (add/remove)
  - `GET /api/pharmacy/inventory/low-stock` - Low stock alerts
  - `GET /api/pharmacy/inventory/expiring` - Medications expiring soon
  - `GET /api/pharmacy/patient/{patientId}/medication-history` - Patient medication history
  - `POST /api/pharmacy/prescriptions/{id}/verify` - Verify prescription (pharmacist check)
- [ ] Implement `IPharmacyService` and `PharmacyService`
  - Dispensing workflow: Verify → Dispense → Update Stock → Link Payment
  - Stock management: Add, remove, adjust inventory
  - Low stock alerts (configurable threshold)
  - Expiration tracking (alert 90 days before expiry)
  - Medication interaction checking (basic - use external API later)
  - Controlled substance logging (if applicable)
- [ ] Seed medication inventory with common eye medications:
  - Antibiotic drops (Moxifloxacin, Gatifloxacin)
  - Steroid drops (Prednisolone, Dexamethasone)
  - Anti-glaucoma drops (Timolol, Latanoprost)
  - Artificial tears (various brands)
  - Oral medications (Acetazolamide, etc.)
- [ ] Add permissions: `pharmacy.view`, `pharmacy.dispense`, `pharmacy.inventory.view`, `pharmacy.inventory.edit`, `pharmacy.verify`

**Frontend Tasks** (Week 10):
- [ ] Create `/dashboard/pharmacy` page (dispensing queue)
  - Table: Patient, Prescription Date, Doctor, Medications, Status
  - Filters: Date, status (Pending/Dispensed/Partially Dispensed)
  - Actions: View Prescription, Dispense, Verify
- [ ] Create prescription dispensing component (`DispensePrescription.tsx`)
  - Display prescription details (medications, dosage, instructions)
  - Medication availability check (in stock / out of stock)
  - Batch/lot number entry
  - Expiry date verification
  - Patient counseling notes
  - Dispense confirmation
- [ ] Create medication inventory component (`MedicationInventory.tsx`)
  - Table: Medication Name, Generic Name, Stock Quantity, Unit Price, Expiry Date
  - Filters: Category, low stock, expiring soon
  - Actions: Add Stock, Adjust Stock, Edit Details
- [ ] Create stock adjustment component (`StockAdjustment.tsx`)
  - Reason (Purchase, Return, Expiry, Wastage)
  - Quantity (add/remove)
  - Batch/lot number
  - Notes
- [ ] Create low stock alerts widget
  - List of medications below reorder threshold
  - Action: Create purchase order (future)
- [ ] Create expiring medications widget
  - List of medications expiring in next 90 days
  - Action: Mark for return or disposal
- [ ] Patient medication history integration (show in patient record)

**Acceptance Criteria**:
- ✅ Pharmacist can view pending prescriptions in dispensing queue
- ✅ Pharmacist can verify prescription and check drug interactions
- ✅ Pharmacist can dispense medications and update inventory stock
- ✅ Low stock alerts visible on pharmacy dashboard
- ✅ Expiring medications list available for proactive management
- ✅ Patient medication history visible across modules
- ✅ Permission-based access control (only pharmacy staff can dispense)

**Dependencies**: Prescription module (must be completed first)

**Risks**: Drug interaction checking may be complex - use simple lookup table initially

---

#### **Week 11-12: Appointment Calendar Enhancement (Frontend-Heavy)**

**Objective**: Replace basic appointment list with visual calendar, doctor availability, and drag-and-drop scheduling

**Backend Tasks** (Week 11):
- ✅ `AppointmentsController.cs` already exists with 15 endpoints
- [ ] Add new endpoints for calendar features:
  - `GET /api/appointments/calendar` - Appointments for calendar view (date range, doctor filter)
  - `GET /api/appointments/availability/{doctorId}` - Doctor availability (time slots)
  - `POST /api/appointments/availability` - Set doctor availability (recurring schedule)
  - `PUT /api/appointments/{id}/reschedule` - Reschedule appointment (drag-and-drop support)
  - `GET /api/appointments/time-slots` - Available time slots (for booking)
  - `POST /api/appointments/waitlist` - Add patient to waitlist
  - `GET /api/appointments/waitlist` - View waitlist
- [ ] Implement doctor availability management:
  - Create `doctor_availability` table (doctor_id, day_of_week, start_time, end_time, is_available)
  - Allow blocking time slots (lunch break, personal time)
  - Handle appointment conflicts (double-booking prevention)
- [ ] Implement appointment reminders (prepare for Phase 3 SMS/email integration):
  - Create `appointment_reminder` table (appointment_id, reminder_type, scheduled_time, sent_at, status)
  - Endpoint: `POST /api/appointments/{id}/send-reminder` (future integration)

**Frontend Tasks** (Week 12):
- [ ] Install calendar library (FullCalendar, React Big Calendar, or custom)
- [ ] Create `/dashboard/appointments/calendar` page (calendar view)
  - Month/Week/Day views
  - Doctor filter (show all doctors or specific doctor)
  - Appointment blocks displayed on calendar
  - Color coding by status (Scheduled/Confirmed/In Progress/Completed/Cancelled)
  - Click appointment to view details
- [ ] Implement drag-and-drop rescheduling
  - Drag appointment to new time slot
  - Validate availability before confirming
  - Show confirmation dialog with new time
  - Update appointment on backend
- [ ] Create time slot selection component (`TimeSlotPicker.tsx`)
  - Display available time slots for selected date and doctor
  - 15-minute or 30-minute intervals (configurable)
  - Block unavailable slots (lunch, personal time, already booked)
  - Click slot to schedule appointment
- [ ] Create doctor availability management component (`DoctorAvailability.tsx`)
  - Weekly schedule grid (Mon-Sun, 9 AM - 6 PM)
  - Set available/unavailable time slots
  - Recurring schedule (same every week)
  - Block specific dates (holidays, leave)
- [ ] Create appointment booking wizard (`AppointmentBookingWizard.tsx`)
  - Step 1: Select patient (search or create new)
  - Step 2: Select doctor
  - Step 3: Select date and time slot
  - Step 4: Confirm appointment details
- [ ] Create waitlist management component (`Waitlist.tsx`)
  - List of patients on waitlist
  - Auto-suggest available slots
  - Convert waitlist to scheduled appointment
- [ ] Dashboard widget: Today's appointments, upcoming appointments, waitlist count

**Acceptance Criteria**:
- ✅ Appointments displayed on visual calendar (Month/Week/Day views)
- ✅ Front office staff can drag-and-drop appointments to reschedule
- ✅ Doctor availability configurable with recurring weekly schedules
- ✅ Available time slots displayed during appointment booking
- ✅ Double-booking prevented by system
- ✅ Waitlist functionality for fully booked time slots
- ✅ Appointment booking wizard simplifies scheduling process
- ✅ Today's appointments widget on dashboard

**Dependencies**: None (enhances existing Appointments module)

**Risks**: Calendar library integration may have learning curve - allocate time for customization

---

### **Phase 2 Summary**

**Completed by End of Month 3**:
- ✅ Prescription Module (create, approve, print prescriptions)
- ✅ Laboratory Orders Module (order tests, enter results, critical value alerts)
- ✅ Billing & Invoicing Module (create invoices, revenue tracking)
- ✅ Payment Processing (record payments, online payment gateway integration)
- ✅ Pharmacy Management (dispense medications, inventory management)
- ✅ Appointment Calendar (visual calendar, doctor availability, drag-and-drop)

**System Completion**: **~70%** (up from 50%)

**Production Readiness**: ✅ **Ready for Pilot Deployment** with early adopter clinics

---

## Phase 3: Advanced Clinical & Infrastructure (Months 4-6)

**Goal**: Implement **Priority 2 (P2) features** for comprehensive clinical operations

**Deliverables**: Imaging/Radiology, Optical, Insurance, OT Management, SMS/WhatsApp Notifications, Reporting Foundation

---

### **Month 4: Imaging, Optical & Insurance**

#### **Week 13-14: Imaging/Radiology Module**

**Backend**:
- Create `ImagingController.cs` (order imaging studies, enter reports, DICOM placeholder)
- Implement `ImagingService` (imaging order workflow, report entry, critical findings alerts)
- Add imaging study catalog (OCT, Fundus Photography, Visual Field, Corneal Topography, etc.)

**Frontend**:
- `/dashboard/imaging` page (imaging orders, pending reports, completed studies)
- Imaging order form (patient, study type, clinical indication, priority)
- Report entry form (findings, impression, recommendations)
- DICOM viewer integration (future - Phase 4)

**Acceptance Criteria**:
- ✅ Doctors can order imaging studies (OCT, fundus photos, etc.)
- ✅ Imaging technicians can mark studies as completed
- ✅ Radiologists/doctors can enter findings and reports
- ✅ Imaging reports visible in patient record

---

#### **Week 15-16: Optical Services Module**

**Backend**:
- Create `OpticalController.cs` (optical prescriptions, eyewear sales, inventory)
- Implement `OpticalService` (prescription verification, lens fitting, sales tracking)
- Seed optical inventory (frames, lenses, contact lenses)

**Frontend**:
- `/dashboard/optical` page (optical prescriptions, sales, inventory)
- Optical prescription form (sphere, cylinder, axis, PD, add power)
- Eyewear sales form (frame selection, lens type, coating, pricing)
- Optical inventory management (frames, lenses, contact lenses)

**Acceptance Criteria**:
- ✅ Optometrists can create optical prescriptions
- ✅ Optical staff can record eyewear sales
- ✅ Optical inventory tracked with stock levels
- ✅ Optical prescriptions linked to patient record

---

### **Month 5: Insurance & OT Management**

#### **Week 17-18: Insurance Management Module**

**Backend**:
- Create `InsuranceController.cs` (eligibility verification, claims submission, denial management)
- Implement `InsuranceService` (insurance verification, claims workflow, remittance processing)
- Create `insurance_provider` table (payer details, contact, claim submission URL)
- Create `patient_insurance` table (patient-insurance linkage)

**Frontend**:
- `/dashboard/insurance` page (claims list, pending verification, denials)
- Insurance verification form (patient insurance card scan, eligibility check)
- Claims submission form (services, diagnosis codes, provider details)
- Denial management (rejection reason, appeal workflow)

**Acceptance Criteria**:
- ✅ Insurance coordinators can verify patient eligibility
- ✅ Claims can be created and submitted to insurance providers
- ✅ Denials tracked with rejection reasons
- ✅ Insurance details visible on patient billing screen

---

#### **Week 19-20: OT Scheduling & Management Module**

**Backend**:
- Create `SurgeryController.cs` (surgical calendar, OT bookings, equipment tracking)
- Implement `SurgeryService` (OT scheduling, conflict resolution, equipment allocation)
- Create `ot_equipment` table (equipment catalog, availability, maintenance)
- Create `ot_booking` table (surgery schedule, assigned staff, equipment)

**Frontend**:
- `/dashboard/surgery` or `/dashboard/ot-management` page (surgical calendar, OT bookings)
- OT booking form (patient, procedure, surgeon, date/time, equipment needs)
- OT calendar (visualize booked surgeries, available slots)
- Equipment tracking (sterilization status, maintenance log)

**Acceptance Criteria**:
- ✅ Surgeons can view surgical calendar and book OT slots
- ✅ Nurses can manage OT equipment and assignments
- ✅ OT booking conflicts prevented
- ✅ Equipment sterilization status tracked

---

### **Month 6: Communication & Reporting Foundation**

#### **Week 21-22: SMS/WhatsApp/Email Notifications**

**Backend**:
- Integrate **Twilio** for SMS and WhatsApp (https://www.twilio.com/docs)
- Create `NotificationService` interface
  - `SendSMS(phoneNumber, message)`
  - `SendWhatsApp(phoneNumber, message)`
  - `SendEmail(email, subject, body)` (using SendGrid or Azure Communication Services)
- Create `NotificationController.cs` (send notifications, templates, logs)
- Create `notification` table (notification_type, recipient, content, status, sent_at)
- Create notification templates:
  - Appointment reminders (1 day before, 1 hour before)
  - OTP for login/password reset
  - Prescription ready for pickup
  - Lab results available
  - Payment receipts
  - Post-operative instructions

**Frontend**:
- `/dashboard/admin/notifications` page (notification logs, templates)
- Notification template editor (create/edit SMS, WhatsApp, email templates)
- Send test notification (manual trigger)
- Notification preferences (per organization/branch)

**Acceptance Criteria**:
- ✅ Appointment reminders sent via SMS/WhatsApp 1 day before
- ✅ OTPs sent for password reset and MFA
- ✅ Prescription ready notifications sent to patients
- ✅ Lab results notifications sent to patients
- ✅ Email receipts sent after payment
- ✅ Notification logs available for audit

---

#### **Week 23-24: Reporting & Analytics Foundation**

**Backend**:
- Create `ReportsController.cs` (pre-built reports, custom queries)
- Implement pre-built reports:
  - Daily census (patient visits, appointments, revenue)
  - Financial summary (revenue by department, outstanding payments)
  - Appointment summary (scheduled, completed, no-shows)
  - Prescription summary (prescriptions issued, dispensed)
  - Lab order summary (tests ordered, pending results)
  - Inventory summary (stock levels, expiring medications)
- Add report export functionality (PDF, Excel, CSV)

**Frontend**:
- `/dashboard/reports` page (report catalog, parameters, execution)
- Report parameter form (date range, branch, department, doctor)
- Report viewer (tables, charts, summary cards)
- Report export (PDF, Excel, CSV download)
- Scheduled reports configuration (future - auto-email daily/weekly reports)

**Acceptance Criteria**:
- ✅ Pre-built reports available (daily census, financial, appointments, prescriptions, lab, inventory)
- ✅ Reports filterable by date range, branch, department
- ✅ Reports exportable to PDF, Excel, CSV
- ✅ Report execution logged for audit

---

### **Phase 3 Summary**

**Completed by End of Month 6**:
- ✅ Imaging/Radiology Module
- ✅ Optical Services Module
- ✅ Insurance Management Module
- ✅ OT Scheduling & Management
- ✅ SMS/WhatsApp/Email Notifications (Twilio integration)
- ✅ Pre-Built Reports & Export Functionality

**System Completion**: **~85%** (up from 70%)

**Production Readiness**: ✅ **Ready for Full Clinical Deployment**

---

## Phase 4: Reporting, Localization & Polish (Months 7-9)

**Goal**: Implement **Priority 3 (P3) features** for production-ready, globally deployable system

**Deliverables**: Custom Report Builder, Multi-Language Support, Onboarding Wizard, Inventory Management, Nursing Workflows

---

### **Month 7: Inventory & Nursing**

#### **Week 25-26: Inventory Management Module**

**Backend**:
- Create `InventoryController.cs` (stock tracking, purchase orders, suppliers)
- Implement `InventoryService` (stock adjustments, reorder alerts, expiration tracking)
- Create `supplier` table (supplier details, contact, payment terms)
- Create `purchase_order` table (PO to suppliers, items, quantities, pricing)

**Frontend**:
- `/dashboard/inventory` page (inventory list, low stock, expiring items)
- Stock adjustment form (purchase, return, expiry, wastage)
- Purchase order form (supplier, items, quantities, delivery date)
- Supplier management (add/edit suppliers)

**Acceptance Criteria**:
- ✅ Inventory managers can track stock levels across departments
- ✅ Low stock alerts trigger reorder notifications
- ✅ Purchase orders can be created and tracked
- ✅ Expiring items flagged proactively

---

#### **Week 27-28: Nursing Workflows (MAR, Care Plans)**

**Backend**:
- Create `NursingController.cs` (medication administration records, care plans, vitals)
- Implement `NursingService` (MAR workflow, care plan tracking, vitals logging)
- Create `medication_administration_record` table (MAR entries)
- Create `patient_care_plan` table (nursing care plans)
- Create `patient_vitals` table (blood pressure, pulse, temperature, etc.)

**Frontend**:
- `/dashboard/nursing` page (MAR, care plans, vitals)
- MAR component (medication administration checklist, sign-off)
- Care plan component (nursing diagnoses, interventions, evaluations)
- Vitals logging component (record patient vitals)

**Acceptance Criteria**:
- ✅ Nurses can document medication administration (MAR)
- ✅ Nurses can create and update patient care plans
- ✅ Nurses can log patient vitals (BP, pulse, temp, etc.)
- ✅ MAR and care plans visible in patient record

---

### **Month 8: Reporting & Localization**

#### **Week 29-30: Custom Report Builder**

**Backend**:
- Create `ReportBuilderController.cs` (custom queries, saved reports)
- Implement query builder engine (SQL generation from UI selections)
- Add security (prevent SQL injection, limit accessible tables)

**Frontend**:
- `/dashboard/reports/builder` page (drag-and-drop report builder)
- Select data source (patients, appointments, prescriptions, billing, etc.)
- Select columns, filters, grouping, sorting
- Preview report, save, and execute
- Share report with other users

**Acceptance Criteria**:
- ✅ Administrators can create custom reports without SQL knowledge
- ✅ Reports can be saved and shared
- ✅ Report builder prevents SQL injection
- ✅ Custom reports executable with parameters

---

#### **Week 31-32: Multi-Language Support (3 Languages)**

**Backend**:
- Enhance `LocalizationController.cs` (bulk translation import/export)
- Implement translation management (add, edit, delete translations)

**Frontend**:
- Add i18n library (react-i18next or next-intl)
- Create translation files for 3 languages:
  - English (en)
  - Hindi (hi) or Spanish (es) based on target market
  - Arabic (ar) or French (fr) based on target market
- Add language switcher component in top navigation
- Translate all UI labels, buttons, messages, error text
- RTL support for Arabic (CSS changes)

**Acceptance Criteria**:
- ✅ UI available in 3 languages
- ✅ Users can switch languages from profile settings
- ✅ RTL layout for Arabic/Hebrew
- ✅ All UI text translated (no hardcoded English strings)

---

### **Month 9: Onboarding & Polish**

#### **Week 33-34: Onboarding Wizard & Bulk Import**

**Backend**:
- Create `OnboardingController.cs` (wizard steps, bulk user import)
- Implement CSV parser for bulk user import
- Validation: Check for duplicate emails, invalid roles, missing required fields

**Frontend**:
- Create `/onboarding` wizard (multi-step form)
  - Step 1: Organization setup (name, address, timezone, currency, language)
  - Step 2: Branch setup (add branches)
  - Step 3: Department setup (select standard departments or customize)
  - Step 4: User onboarding (bulk import CSV or manual entry)
  - Step 5: Review and confirm
- Create bulk user import component (CSV upload, validation, preview, import)
- Create CSV template download (with sample data)

**Acceptance Criteria**:
- ✅ New organizations can complete onboarding wizard
- ✅ Bulk user import via CSV works (with validation)
- ✅ Onboarding wizard simplifies initial setup
- ✅ Sample data generated for testing

---

#### **Week 35-36: Testing, Bug Fixes & Documentation**

**Tasks**:
- [ ] Comprehensive testing (unit, integration, end-to-end)
- [ ] Bug fixes (prioritize critical and high-severity bugs)
- [ ] Performance optimization (database query optimization, caching with Redis)
- [ ] Security audit (penetration testing, vulnerability scanning)
- [ ] Documentation updates (user manuals, admin guides, API documentation)
- [ ] Training materials (video tutorials, knowledge base articles)
- [ ] Deployment preparation (staging environment, production checklist)

**Deliverables**:
- ✅ Zero critical bugs
- ✅ All high-priority bugs fixed
- ✅ Performance benchmarks met (page load < 2 seconds, API response < 200ms)
- ✅ Security audit passed
- ✅ Documentation complete
- ✅ Training materials ready
- ✅ Staging environment deployed
- ✅ Production deployment plan finalized

---

### **Phase 4 Summary**

**Completed by End of Month 9**:
- ✅ Inventory Management Module
- ✅ Nursing Workflows (MAR, Care Plans, Vitals)
- ✅ Custom Report Builder
- ✅ Multi-Language Support (3 languages, RTL)
- ✅ Onboarding Wizard & Bulk User Import
- ✅ Comprehensive Testing & Bug Fixes
- ✅ Documentation & Training Materials

**System Completion**: **~95%** (up from 85%)

**Production Readiness**: ✅ **Ready for Full Production Deployment Globally**

---

## Phase 5: Advanced Features (Months 10-12) - OPTIONAL

**Goal**: Implement **Priority 4 (P4) advanced features** for competitive differentiation

**Deliverables**: Patient Portal, Telemedicine, Native Mobile Apps, AI Decision Support (MVP)

### **Month 10: Patient Engagement (Patient Portal & Telemedicine)**

### **Month 11: Native Mobile Apps (iOS + Android)**

### **Month 12: AI & Analytics (Predictive Analytics, Decision Support MVP)**

_(Details available upon request - defer to future phases if needed)_

---

## Resource Requirements

### **Team Composition** (Recommended)

| Role | Headcount | Responsibility |
|------|-----------|----------------|
| **Backend Developer** | 2 FTE | API development, database design, integrations |
| **Frontend Developer** | 2 FTE | UI/UX implementation, React components, state management |
| **Full-Stack Developer** | 1 FTE | Cross-functional tasks, integration work |
| **QA Engineer** | 1 FTE | Testing, bug tracking, automation (join from Week 20) |
| **DevOps Engineer** | 0.5 FTE | Azure infrastructure, CI/CD, monitoring (part-time) |
| **Project Manager** | 0.5 FTE | Sprint planning, stakeholder communication (part-time) |

**Total**: **~5.5 FTEs** (can be 4-5 people with overlapping skills)

---

## Risk Management

### **High-Risk Dependencies**

1. **Payment Gateway Integration** (Week 7-8)
   - **Risk**: API changes, sandbox issues, compliance requirements
   - **Mitigation**: Start sandbox testing early, have fallback payment method (manual entry)

2. **SMS/WhatsApp Integration** (Week 21-22)
   - **Risk**: Twilio account approval delays, WhatsApp Business API approval
   - **Mitigation**: Apply for Twilio account early, use SMS initially if WhatsApp delayed

3. **DICOM Integration** (Future - Phase 4+)
   - **Risk**: Complex medical imaging standards, vendor-specific implementations
   - **Mitigation**: Use DICOM libraries (dcm4che, cornerstone.js), partner with imaging vendors

4. **Performance at Scale** (Phase 3-4)
   - **Risk**: Slow queries, high API latency with large datasets
   - **Mitigation**: Implement Redis caching early, database query optimization, load testing

---

## Success Criteria

### **Phase 2 Success** (End of Month 3):
- ✅ 70%+ system completion
- ✅ Core clinical workflows operational (prescriptions, billing, lab orders, pharmacy)
- ✅ Ready for pilot deployment with 1-2 early adopter clinics
- ✅ Positive feedback from pilot users

### **Phase 3 Success** (End of Month 6):
- ✅ 85%+ system completion
- ✅ All critical clinical modules operational (imaging, optical, insurance, OT, notifications)
- ✅ Ready for full clinical deployment with multiple clinics
- ✅ Real-time notifications working (SMS/WhatsApp/Email)

### **Phase 4 Success** (End of Month 9):
- ✅ 95%+ system completion
- ✅ Production-ready, globally deployable system
- ✅ Multi-language support (3 languages)
- ✅ Custom reporting and analytics
- ✅ Comprehensive documentation and training materials
- ✅ Zero critical bugs, performance benchmarks met

---

## Conclusion

This sequential implementation plan provides a **clear, week-by-week roadmap** to complete the Eye Hospital Management System over **9 months** (Phases 2-4). The plan prioritizes **high-impact clinical and financial features** first, followed by advanced modules and global readiness features.

With **3-4 dedicated developers** and disciplined execution, this timeline is achievable and will result in a **production-ready, HIPAA-compliant, globally deployable eye hospital management system**.

---

**Next Steps**:
1. ✅ Review and approve this plan
2. 📋 Assemble development team (4-5 FTEs)
3. 📋 Set up development environment (Azure, Git, CI/CD)
4. 📋 Kick off **Phase 2, Week 1: Prescription Module** (Backend)
5. 📋 Schedule weekly sprint planning and reviews
6. 📋 Track progress in project management tool (Jira, Azure DevOps, or GitHub Projects)

**Let's build a world-class eye hospital management system! 🚀**

---

**Document Prepared By**: GitHub Copilot (AI Assistant)  
**Review Status**: Pending stakeholder approval  
**Version**: 1.0  
**Last Updated**: December 8, 2025

---

**END OF SEQUENTIAL IMPLEMENTATION PLAN**
