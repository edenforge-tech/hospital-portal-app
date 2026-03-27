import { test, expect, Page } from '@playwright/test';

/**
 * End-to-End Tests with Playwright
 * Coverage: 15 critical user flows
 * Browsers: Chrome, Firefox, Safari
 * 
 * Run with: npx playwright test
 */

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5073';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.goto(`${BASE_URL}/login`);

    // Fill credentials
    await page.fill('input[name="userName"]', 'admin');
    await page.fill('input[name="password"]', 'Admin@123456');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="userName"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginAsAdmin(page);

    // Click logout
    await page.click('button[aria-label="Logout"]');

    // Verify redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe('Patient Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should create new patient and view details', async ({ page }) => {
    // Navigate to patients
    await page.goto(`${BASE_URL}/dashboard/admin/patients`);

    // Click New Patient button
    await page.click('button:has-text("New Patient")');

    // Fill patient form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'Male');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '555-1234');

    // Submit
    await page.click('button:has-text("Create")');

    // Verify success
    await expect(page.locator('.success-message')).toContainText('Patient created');

    // Click on created patient
    await page.click('text=John Doe');

    // Verify details page
    await expect(page.locator('h1')).toContainText('John Doe');
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
  });

  test('should search for existing patient', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/patients`);

    // Search
    await page.fill('input[placeholder*="Search"]', 'John Doe');

    // Verify results
    await expect(page.locator('table tbody tr')).toContainText('John Doe');
  });
});

test.describe('Appointment Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should book appointment for patient', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/appointments`);

    // Click New Appointment
    await page.click('button:has-text("New Appointment")');

    // Fill appointment form
    await page.selectOption('select[name="patientId"]', { index: 1 });
    await page.selectOption('select[name="doctorId"]', { index: 1 });
    await page.fill('input[name="appointmentDate"]', '2026-02-15');
    await page.fill('input[name="appointmentTime"]', '10:00');
    await page.fill('textarea[name="reason"]', 'Routine checkup');

    // Submit
    await page.click('button:has-text("Schedule")');

    // Verify
    await expect(page.locator('.success-message')).toContainText('Appointment scheduled');
  });

  test('should cancel appointment', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/appointments`);

    // Find appointment and click cancel
    await page.click('button[aria-label="Cancel appointment"]:first-of-type');

    // Confirm cancellation
    page.on('dialog', dialog => dialog.accept());

    // Verify status update
    await expect(page.locator('.status-badge:first-of-type')).toContainText('Cancelled');
  });
});

test.describe('Performance Review Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should create, score, and approve performance review', async ({ page }) => {
    // Navigate to performance reviews
    await page.goto(`${BASE_URL}/dashboard/admin/performance-reviews`);

    // Create new review
    await page.click('button:has-text("New Review")');
    await page.selectOption('select[name="employeeId"]', { index: 1 });
    await page.selectOption('select[name="reviewerId"]', { index: 2 });
    await page.fill('input[name="reviewPeriodStart"]', '2025-07-01');
    await page.fill('input[name="reviewPeriodEnd"]', '2025-12-31');
    await page.click('button:has-text("Create")');

    // Add scores
    await page.fill('input[name="technicalSkills"]', '4.5');
    await page.fill('input[name="communication"]', '4.0');
    await page.fill('input[name="teamwork"]', '5.0');
    await page.fill('textarea[name="comments"]', 'Excellent performance');

    // Submit review
    await page.click('button:has-text("Submit Review")');

    // Approve review (as manager)
    await page.click('button:has-text("Approve")');

    // Verify status
    await expect(page.locator('.status-badge')).toContainText('Approved');
  });
});

test.describe('Training Enrollment and Completion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should enroll employee and mark training complete', async ({ page }) => {
    // Navigate to training
    await page.goto(`${BASE_URL}/dashboard/admin/training`);

    // Click on training program
    await page.click('text=HIPAA Compliance Training');

    // Enroll employee
    await page.click('button:has-text("Enroll Employee")');
    await page.selectOption('select[name="employeeId"]', { index: 1 });
    await page.fill('textarea[name="notes"]', 'Mandatory training');
    await page.click('button:has-text("Enroll")');

    // Mark as complete
    await page.click('button:has-text("Complete"):first-of-type');
    
    // Enter score
    page.on('dialog', dialog => {
      dialog.accept('85');
    });

    // Verify certificate issued
    await expect(page.locator('.certificate-badge')).toBeVisible();
  });
});

test.describe('Onboarding Workflow Progression', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should complete onboarding checklist and grant progressive access', async ({ page }) => {
    // Navigate to onboarding
    await page.goto(`${BASE_URL}/dashboard/admin/onboarding`);

    // Create new workflow
    await page.click('button:has-text("New Workflow")');
    await page.selectOption('select[name="userId"]', { index: 1 });
    await page.fill('input[name="startDate"]', '2026-01-23');
    await page.click('button:has-text("Create")');

    // Click on workflow
    await page.click('text=View Details');

    // Complete checklist items
    await page.click('button:has-text("Complete"):first-of-type');
    page.on('dialog', dialog => dialog.accept('Completed orientation'));

    await page.click('button:has-text("Complete"):nth(1)');
    page.on('dialog', dialog => dialog.accept('Reviewed policies'));

    // Grant Day 1 access
    await page.click('text=Access Management');
    await page.click('button:has-text("Grant Access"):first-of-type');
    page.on('dialog', dialog => dialog.accept());

    // Verify access granted
    await expect(page.locator('text=Day1 access granted')).toBeVisible();
  });
});

test.describe('Approval Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should request, approve department access', async ({ page }) => {
    // Request access
    await page.goto(`${BASE_URL}/dashboard/approvals/my-requests`);
    await page.click('button:has-text("New Request")');
    await page.selectOption('select[name="departmentId"]', { index: 1 });
    await page.selectOption('select[name="requestedAccessLevel"]', 'Read');
    await page.fill('textarea[name="justification"]', 'Need access for patient consultation');
    await page.click('button:has-text("Submit Request")');

    // Switch to pending approvals (as manager)
    await page.goto(`${BASE_URL}/dashboard/approvals/pending`);

    // Approve request
    await page.click('button:has-text("Approve"):first-of-type');
    page.on('dialog', dialog => dialog.accept('Approved - valid reason'));

    // Verify approval
    await expect(page.locator('.status-badge:first-of-type')).toContainText('Approved');
  });
});

test.describe('Report Generation and Export', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should generate and download PDF report', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/reports`);

    // Select report template
    await page.click('text=Monthly Patient Summary');

    // Configure parameters
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-01-31');
    await page.selectOption('select[name="format"]', 'pdf');

    // Generate
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Report")');

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="userName"]', 'admin');
  await page.fill('input[name="password"]', 'Admin@123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

test.describe('Mobile Viewport Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should navigate mobile menu', async ({ page }) => {
    await loginAsAdmin(page);

    // Open mobile menu
    await page.click('button[aria-label="Open menu"]');

    // Click menu item
    await page.click('text=Patients');

    // Verify navigation
    await expect(page).toHaveURL(/patients/);
  });
});

test.describe('Cross-browser Compatibility', () => {
  test('should work correctly in Chromium', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    await loginAsAdmin(page);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work correctly in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox');
    await loginAsAdmin(page);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work correctly in WebKit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit');
    await loginAsAdmin(page);
    await expect(page.locator('h1')).toBeVisible();
  });
});
