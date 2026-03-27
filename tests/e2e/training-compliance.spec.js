const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5073/api';

test.describe('Training & Compliance E2E Workflow', () => {
  let page;
  let authToken;
  let tenantId;
  let assignmentId;
  let courseId;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'testadmin@hospital.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    tenantId = await page.evaluate(() => localStorage.getItem('tenantId'));
  });

  test('Complete Training Assignment to Completion Workflow', async () => {
    // Step 1: Create Training Course
    await test.step('Create new mandatory training course', async () => {
      await page.goto(`${BASE_URL}/training/courses/new`);
      
      await page.fill('input[name="courseName"]', 'HIPAA Compliance Training 2026');
      await page.fill('textarea[name="description"]', 'Annual HIPAA compliance and privacy training.');
      await page.check('input[name="isMandatory"]');
      await page.fill('input[name="validityPeriodDays"]', '365'); // Expires in 1 year
      await page.fill('input[name="durationHours"]', '4');
      await page.fill('input[name="courseProvider"]', 'HealthCare Training Institute');
      
      await page.click('button:has-text("Create Course")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      // Extract course ID
      const url = page.url();
      courseId = url.split('/').pop();
    });

    // Step 2: Assign Training to User
    await test.step('Assign training to employee', async () => {
      await page.goto(`${BASE_URL}/training/assign`);
      
      await page.fill('input[name="userId"]', 'employee-001');
      await page.selectOption('select[name="courseId"]', courseId);
      
      // Set due date 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await page.fill('input[name="dueDate"]', dueDate.toISOString().split('T')[0]);
      
      await page.click('button:has-text("Assign Training")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      // Get assignment ID from response
      assignmentId = await page.locator('[data-testid="assignment-id"]').textContent();
    });

    // Step 3: View User Assignments
    await test.step('View user training assignments', async () => {
      await page.goto(`${BASE_URL}/training/my-trainings`);
      
      // Verify assignment appears
      await expect(page.locator(`tr:has-text("${courseId}")`)).toBeVisible();
      
      // Check status is "Not Started"
      const status = await page.locator(`tr:has-text("${courseId}") [data-testid="status"]`).textContent();
      expect(status).toContain('Not Started');
    });

    // Step 4: Mark as In Progress
    await test.step('Start training', async () => {
      await page.click(`tr:has-text("${courseId}") button:has-text("Start")`);
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      const status = await page.locator(`tr:has-text("${courseId}") [data-testid="status"]`).textContent();
      expect(status).toContain('In Progress');
    });

    // Step 5: Complete Training
    await test.step('Complete training and upload certificate', async () => {
      await page.click(`tr:has-text("${courseId}") button:has-text("Complete")`);
      
      // Fill completion details
      const completionDate = new Date().toISOString().split('T')[0];
      await page.fill('input[name="completionDate"]', completionDate);
      
      // Upload certificate (mock file upload)
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'hipaa_certificate.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Mock PDF certificate content')
      });
      
      await page.click('button:has-text("Submit Completion")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      const status = await page.locator(`tr:has-text("${courseId}") [data-testid="status"]`).textContent();
      expect(status).toContain('Completed');
    });

    // Step 6: Verify Compliance Report
    await test.step('Check user compliance increases to 100%', async () => {
      await page.goto(`${BASE_URL}/training/compliance`);
      
      // Check compliance percentage
      const compliancePercentage = await page.locator('[data-testid="compliance-percentage"]').textContent();
      expect(parseFloat(compliancePercentage)).toBeGreaterThanOrEqual(100);
      
      // Verify "Compliant" badge
      await expect(page.locator('[data-testid="compliance-badge"]:has-text("Compliant")')).toBeVisible();
      
      // Check completed count
      const completedCount = await page.locator('[data-testid="completed-mandatory"]').textContent();
      expect(parseInt(completedCount)).toBeGreaterThan(0);
    });

    // Step 7: Check Expiry Date Calculation
    await test.step('Verify training expiry date is set correctly', async () => {
      await page.goto(`${BASE_URL}/training/my-trainings`);
      
      await page.click(`tr:has-text("${courseId}")`);
      
      // Verify expiry date is 365 days from completion
      const expiryDate = await page.locator('[data-testid="expiry-date"]').textContent();
      expect(expiryDate).toBeTruthy();
      
      const completionDate = new Date();
      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 365);
      
      // Check expiry is approximately 1 year from now
      expect(new Date(expiryDate).getFullYear()).toBe(expectedExpiry.getFullYear());
    });
  });

  test('Overdue Training Detection', async () => {
    await test.step('Create overdue training assignment', async () => {
      // Create assignment with past due date via API
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 10); // 10 days overdue
      
      const response = await page.request.post(`${API_URL}/Training/assign`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        },
        data: {
          userId: 'employee-002',
          courseId: courseId,
          dueDate: pastDueDate.toISOString()
        }
      });
      
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Verify overdue training appears in compliance report', async () => {
      await page.goto(`${BASE_URL}/training/compliance/user/employee-002`);
      
      // Check for overdue assignments section
      await expect(page.locator('[data-testid="overdue-trainings"]')).toBeVisible();
      
      const overdueCount = await page.locator('[data-testid="overdue-count"]').textContent();
      expect(parseInt(overdueCount)).toBeGreaterThan(0);
      
      // User should be non-compliant
      await expect(page.locator('[data-testid="compliance-badge"]:has-text("Non-Compliant")')).toBeVisible();
    });
  });

  test('Credential Expiry Management', async () => {
    let credentialId;

    await test.step('Add user credential', async () => {
      await page.goto(`${BASE_URL}/credentials/new`);
      
      await page.fill('input[name="credentialName"]', 'Registered Nurse License');
      await page.selectOption('select[name="credentialType"]', 'License');
      await page.fill('input[name="issuingAuthority"]', 'State Medical Board');
      await page.fill('input[name="credentialNumber"]', 'RN-123456');
      
      const issuedDate = new Date();
      issuedDate.setFullYear(issuedDate.getFullYear() - 1);
      await page.fill('input[name="issuedDate"]', issuedDate.toISOString().split('T')[0]);
      
      // Set expiry to 15 days from now (within 30-day expiring window)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);
      await page.fill('input[name="expiryDate"]', expiryDate.toISOString().split('T')[0]);
      
      await page.check('input[name="isRequired"]');
      
      await page.click('button:has-text("Add Credential")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify credential appears in expiring list', async () => {
      await page.goto(`${BASE_URL}/credentials/expiring`);
      
      await expect(page.locator('tr:has-text("Registered Nurse License")')).toBeVisible();
      
      // Check status is "Expiring"
      const status = await page.locator('tr:has-text("Registered Nurse License") [data-testid="status"]').textContent();
      expect(status).toContain('Expiring');
    });

    await test.step('Run auto-suspend for expired credentials', async () => {
      await page.goto(`${BASE_URL}/credentials/manage`);
      
      await page.click('button:has-text("Auto-Suspend Expired")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      // Check suspended count
      const suspendedCount = await page.locator('[data-testid="suspended-count"]').textContent();
      expect(suspendedCount).toBeTruthy();
    });
  });

  test('Tenant Compliance Dashboard', async () => {
    await test.step('View tenant-wide compliance report', async () => {
      await page.goto(`${BASE_URL}/training/compliance/tenant`);
      
      // Verify dashboard loads
      await expect(page.locator('h1:has-text("Tenant Compliance Dashboard")')).toBeVisible();
      
      // Check overall compliance rate
      const complianceRate = await page.locator('[data-testid="overall-compliance-rate"]').textContent();
      expect(parseFloat(complianceRate)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(complianceRate)).toBeLessThanOrEqual(100);
      
      // Verify user list
      await expect(page.locator('[data-testid="user-compliance-list"]')).toBeVisible();
      
      // Check compliant vs non-compliant counts
      const compliantUsers = await page.locator('[data-testid="compliant-users"]').textContent();
      const nonCompliantUsers = await page.locator('[data-testid="non-compliant-users"]').textContent();
      
      expect(parseInt(compliantUsers) + parseInt(nonCompliantUsers)).toBeGreaterThan(0);
    });
  });

  test.afterAll(async () => {
    await page.close();
  });
});
