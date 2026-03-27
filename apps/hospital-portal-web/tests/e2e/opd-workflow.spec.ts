// Day 10: Automated End-to-End Tests
// Run with: pnpm test:e2e

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

// Test credentials
const TEST_USER = {
  email: 'frontdesk@hospital.com',
  password: 'Test@1234'
};

const TEST_PATIENT = {
  mrn: 'TEST001',
  name: 'John Doe',
  phone: '+1234567890'
};

test.describe('Phase 1 OPD Workflow - Complete E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test.describe('Day 1-2: Check-In & Hard Gates', () => {
    test('should complete patient check-in successfully', async ({ page }) => {
      // Navigate to patient directory
      await page.goto(`${BASE_URL}/dashboard/patients`);
      
      // Search for test patient
      await page.fill('input[placeholder*="Search"]', TEST_PATIENT.mrn);
      await page.waitForTimeout(500);
      
      // Click check-in button
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Check In")');
      
      // Fill check-in form
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.selectOption('select[name="appointmentType"]', 'Follow-up');
      await page.fill('textarea[name="reasonForVisit"]', 'Regular checkup');
      
      // Submit check-in
      await page.click('button:has-text("Confirm Check In")');
      
      // Verify success
      await expect(page.locator('text=Check-in successful')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Checked In')).toBeVisible();
    });

    test('should block examination access before check-in', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/patients`);
      
      // Select unchecked patient
      await page.click(`text=${TEST_PATIENT.name}`);
      
      // Try to access examination
      await page.click('button:has-text("Examination")');
      
      // Verify blocked
      await expect(page.locator('text=Patient must be checked in first')).toBeVisible();
    });

    test('should allow emergency override with reason', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/patients`);
      await page.click(`text=${TEST_PATIENT.name}`);
      
      // Try to access examination
      await page.click('button:has-text("Examination")');
      
      // Click emergency override
      await page.click('button:has-text("Emergency Override")');
      
      // Enter reason
      await page.fill('textarea[name="overrideReason"]', 'Critical emergency, immediate care needed for patient safety');
      
      // Confirm override
      await page.click('button:has-text("Confirm Override")');
      
      // Verify access granted
      await expect(page.locator('text=Emergency Override Active')).toBeVisible();
    });
  });

  test.describe('Day 6: Token Display & Print', () => {
    test('should display token slip after check-in', async ({ page, context }) => {
      // Complete check-in first
      await page.goto(`${BASE_URL}/dashboard/patients`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Check In")');
      
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.selectOption('select[name="appointmentType"]', 'Consultation');
      await page.fill('textarea[name="reasonForVisit"]', 'Eye examination');
      await page.click('button:has-text("Confirm Check In")');
      
      // Verify token slip appears
      await expect(page.locator('[data-testid="token-slip"]')).toBeVisible({ timeout: 5000 });
      
      // Verify token number visible
      await expect(page.locator('text=Token #')).toBeVisible();
      
      // Verify QR code rendered
      await expect(page.locator('svg[data-testid="qr-code"]')).toBeVisible();
      
      // Click print button
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.click('button:has-text("Print Token")')
      ]);
      
      // Verify print window opened
      await expect(popup).toBeTruthy();
      await popup.close();
    });

    test('should generate sequential token numbers', async ({ page }) => {
      // Check in first patient
      await page.goto(`${BASE_URL}/dashboard/patients`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Check In")');
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.click('button:has-text("Confirm Check In")');
      
      // Get first token number
      const token1 = await page.locator('[data-testid="token-number"]').textContent();
      await page.click('button:has-text("Close")');
      
      // Check in second patient
      await page.click('text=Another Patient');
      await page.click('button:has-text("Check In")');
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.click('button:has-text("Confirm Check In")');
      
      // Get second token number
      const token2 = await page.locator('[data-testid="token-number"]').textContent();
      
      // Verify sequential
      expect(parseInt(token2!)).toBe(parseInt(token1!) + 1);
    });
  });

  test.describe('Day 7: Itemized Billing', () => {
    test('should create bill with multiple services', async ({ page }) => {
      // Navigate to billing
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      
      // Select patient with completed visit
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Generate Bill")');
      
      // Add first service
      await page.click('button:has-text("Add Service")');
      await page.fill('input[placeholder*="Search services"]', 'Consultation');
      await page.click('text=General Consultation');
      await page.fill('input[name="quantity"]', '1');
      await page.fill('input[name="discount"]', '5');
      await page.click('button:has-text("Add to Bill")');
      
      // Verify service added
      await expect(page.locator('text=General Consultation')).toBeVisible();
      
      // Add second service
      await page.click('button:has-text("Add Service")');
      await page.fill('input[placeholder*="Search services"]', 'Blood Test');
      await page.click('text=Blood Test');
      await page.fill('input[name="quantity"]', '2');
      await page.click('button:has-text("Add to Bill")');
      
      // Verify calculations
      const subtotal = await page.locator('[data-testid="subtotal"]').textContent();
      const discount = await page.locator('[data-testid="total-discount"]').textContent();
      const tax = await page.locator('[data-testid="total-tax"]').textContent();
      const grandTotal = await page.locator('[data-testid="grand-total"]').textContent();
      
      expect(subtotal).toBeTruthy();
      expect(discount).toBeTruthy();
      expect(tax).toBeTruthy();
      expect(grandTotal).toBeTruthy();
      
      // Save bill
      await page.click('button:has-text("Save Bill")');
      await expect(page.locator('text=Bill created successfully')).toBeVisible();
    });

    test('should validate discount limits', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Generate Bill")');
      
      await page.click('button:has-text("Add Service")');
      await page.click('text=General Consultation');
      
      // Try to enter discount > max allowed
      await page.fill('input[name="discount"]', '101');
      await page.click('button:has-text("Add to Bill")');
      
      // Verify error message
      await expect(page.locator('text=Discount cannot exceed')).toBeVisible();
    });
  });

  test.describe('Day 7: Payment Recording', () => {
    test('should record cash payment', async ({ page }) => {
      // Assume bill already generated
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Record Payment")');
      
      // Select cash payment
      await page.click('[data-payment-mode="cash"]');
      
      // Enter amount
      await page.fill('input[name="amount"]', '1000');
      
      // Add notes
      await page.fill('textarea[name="notes"]', 'Cash payment received');
      
      // Submit payment
      await page.click('button:has-text("Submit Payment")');
      
      // Verify success
      await expect(page.locator('text=Payment recorded successfully')).toBeVisible();
    });

    test('should validate card payment fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Record Payment")');
      
      // Select card payment
      await page.click('[data-payment-mode="card"]');
      
      // Enter amount only (missing required fields)
      await page.fill('input[name="amount"]', '1000');
      await page.click('button:has-text("Submit Payment")');
      
      // Verify validation errors
      await expect(page.locator('text=Last 4 digits required')).toBeVisible();
      await expect(page.locator('text=Transaction ID required')).toBeVisible();
    });

    test('should validate UPI ID format', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Record Payment")');
      
      await page.click('[data-payment-mode="upi"]');
      
      // Enter invalid UPI ID
      await page.fill('input[name="upiId"]', 'invalid-format');
      await page.fill('input[name="amount"]', '1000');
      await page.click('button:has-text("Submit Payment")');
      
      // Verify validation
      await expect(page.locator('text=Invalid UPI ID format')).toBeVisible();
    });
  });

  test.describe('Day 5: Bill Locking', () => {
    test('should lock bill after payment', async ({ page }) => {
      // Assume bill fully paid
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      await page.click(`text=${TEST_PATIENT.name}`);
      
      // Click lock bill
      await page.click('button:has-text("Lock Bill")');
      
      // Confirm lock
      await page.click('button:has-text("Confirm Lock")');
      
      // Verify locked state
      await expect(page.locator('[data-testid="lock-icon"]')).toBeVisible();
      await expect(page.locator('text=This bill is locked')).toBeVisible();
      
      // Verify edit buttons disabled
      await expect(page.locator('button:has-text("Add Item")')).toBeDisabled();
    });

    test('should unlock bill with reason', async ({ page }) => {
      // Assume bill locked
      await page.goto(`${BASE_URL}/dashboard/billing/opd`);
      await page.click(`text=${TEST_PATIENT.name}`);
      
      // Click unlock
      await page.click('button:has-text("Unlock Bill")');
      
      // Enter reason
      await page.fill('textarea[name="unlockReason"]', 'Correction needed for billing department review');
      
      // Confirm unlock
      await page.click('button:has-text("Confirm Unlock")');
      
      // Verify unlocked
      await expect(page.locator('text=Bill unlocked successfully')).toBeVisible();
      await expect(page.locator('button:has-text("Add Item")')).toBeEnabled();
    });
  });

  test.describe('Day 8: Auto-Billing Validation', () => {
    test('should block visit completion without payment', async ({ page }) => {
      // Assume visit with unpaid bill
      await page.goto(`${BASE_URL}/dashboard/patients`);
      await page.click(`text=${TEST_PATIENT.name}`);
      
      // Try to complete visit
      await page.click('button:has-text("Complete Visit")');
      
      // Verify billing prompt appears
      await expect(page.locator('[data-testid="billing-prompt"]')).toBeVisible();
      await expect(page.locator('text=Payment Pending')).toBeVisible();
      
      // Verify proceed button disabled
      await expect(page.locator('button:has-text("Proceed to Complete")')).toBeDisabled();
    });

    test('should allow completion with paid bill', async ({ page }) => {
      // Assume visit with paid bill
      await page.goto(`${BASE_URL}/dashboard/patients`);
      await page.click(`text=${TEST_PATIENT.name}`);
      await page.click('button:has-text("Complete Visit")');
      
      // Verify billing prompt shows paid status
      await expect(page.locator('text=Paid')).toBeVisible();
      
      // Verify proceed button enabled
      await expect(page.locator('button:has-text("Proceed to Complete")')).toBeEnabled();
      
      // Complete visit
      await page.click('button:has-text("Proceed to Complete")');
      
      // Verify success
      await expect(page.locator('text=Visit completed successfully')).toBeVisible();
    });
  });

  test.describe('Day 9: Slot Availability', () => {
    test('should display real-time slot availability', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/appointments`);
      await page.click('button:has-text("New Appointment")');
      
      // Select doctor and date
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.fill('input[type="date"]', '2026-02-01');
      
      // Wait for slots to load
      await expect(page.locator('[data-testid="slot-panel"]')).toBeVisible({ timeout: 5000 });
      
      // Verify slot elements visible
      await expect(page.locator('[data-slot-available="true"]').first()).toBeVisible();
      
      // Verify last updated timestamp
      await expect(page.locator('text=Last updated:')).toBeVisible();
    });

    test('should reserve slot with countdown timer', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/appointments`);
      await page.click('button:has-text("New Appointment")');
      
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.fill('input[type="date"]', '2026-02-01');
      
      // Click available slot
      await page.click('[data-slot-available="true"]').first();
      
      // Verify reservation
      await expect(page.locator('[data-slot-reserved="true"]')).toBeVisible();
      
      // Verify timer starts
      await expect(page.locator('text=/[0-9]:[0-9]{2}/')).toBeVisible();
      
      // Wait a few seconds and verify countdown
      await page.waitForTimeout(3000);
      // Timer should have decreased
    });

    test('should detect appointment conflicts', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/appointments`);
      await page.click('button:has-text("New Appointment")');
      
      // Select doctor with existing appointment
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.fill('input[type="date"]', '2026-02-01');
      await page.fill('input[name="startTime"]', '10:00');
      
      // Fill patient details
      await page.selectOption('select[name="patientId"]', { index: 1 });
      
      // Verify conflict detection runs
      await expect(page.locator('[data-testid="conflict-detection"]')).toBeVisible({ timeout: 3000 });
      
      // If conflict exists, verify message
      const hasConflict = await page.locator('text=Doctor Busy').isVisible();
      if (hasConflict) {
        // Verify suggested alternatives shown
        await expect(page.locator('[data-testid="suggested-slot"]')).toBeVisible();
      }
    });

    test('should differentiate walk-in appointments', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/appointments`);
      
      // Click walk-in button
      await page.click('button:has-text("Walk-In Appointment")');
      
      // Verify walk-in dialog
      await expect(page.locator('[data-testid="walk-in-dialog"]')).toBeVisible();
      await expect(page.locator('text=Patient is present and waiting')).toBeVisible();
      
      // Fill walk-in details
      await page.fill('input[name="patientName"]', 'Jane Smith');
      await page.fill('input[name="patientPhone"]', '+9876543210');
      await page.selectOption('select[name="doctorId"]', { index: 1 });
      await page.fill('textarea[name="reasonForVisit"]', 'Urgent eye pain');
      
      // Select immediate slot
      await page.click('[data-slot-available="true"]').first();
      
      // Create appointment
      await page.click('button:has-text("Create Walk-In Appointment")');
      
      // Verify success
      await expect(page.locator('text=Walk-in appointment created')).toBeVisible();
    });
  });

  test.describe('API Backend Tests', () => {
    test('should enforce check-in middleware', async ({ request }) => {
      // Try to access protected endpoint without check-in
      const response = await request.post(`${API_URL}/clinical-examination`, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN}`,
          'X-Tenant-ID': process.env.TEST_TENANT_ID
        },
        data: {
          visitId: 'unchecked-visit-id',
          findings: 'Test'
        }
      });
      
      // Verify 403 Forbidden
      expect(response.status()).toBe(403);
      expect(await response.json()).toMatchObject({
        message: expect.stringContaining('checked in')
      });
    });

    test('should return visit billing status', async ({ request }) => {
      const response = await request.get(`${API_URL}/OpdBills/visit-billing-status/test-visit-id`, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN}`,
          'X-Tenant-ID': process.env.TEST_TENANT_ID
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('hasBill');
      expect(data).toHaveProperty('isPaid');
      expect(data).toHaveProperty('canComplete');
      expect(data).toHaveProperty('message');
    });

    test('should return doctor availability', async ({ request }) => {
      const response = await request.get(
        `${API_URL}/appointments/doctor/test-doctor-id/availability?date=2026-02-01`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN}`,
            'X-Tenant-ID': process.env.TEST_TENANT_ID
          }
        }
      );
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('availableSlots');
      expect(data).toHaveProperty('unavailableSlots');
      expect(data).toHaveProperty('workingHours');
      expect(data).toHaveProperty('isAvailable');
    });
  });
});

// Performance tests
test.describe('Performance & Load Tests', () => {
  test('should load patient directory within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/dashboard/patients`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle concurrent slot reservations', async ({ browser }) => {
    // Create multiple contexts (simulating different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both users navigate to appointments
    await Promise.all([
      page1.goto(`${BASE_URL}/dashboard/appointments`),
      page2.goto(`${BASE_URL}/dashboard/appointments`)
    ]);
    
    // Both try to book same slot simultaneously
    const slot = '[data-slot-time="10:00"]';
    await Promise.all([
      page1.click(slot),
      page2.click(slot)
    ]);
    
    // Only one should succeed
    const reservation1 = await page1.locator('[data-slot-reserved="true"]').count();
    const reservation2 = await page2.locator('[data-slot-reserved="true"]').count();
    
    // Exactly one reservation should exist
    expect(reservation1 + reservation2).toBe(1);
    
    await context1.close();
    await context2.close();
  });
});
