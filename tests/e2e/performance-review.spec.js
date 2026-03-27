const { test, expect } = require('@playwright/test');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5073/api';

test.describe('Performance Review E2E Workflow', () => {
  let page;
  let authToken;
  let tenantId;
  let reviewId;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'testadmin@hospital.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    // Extract auth token from localStorage
    authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    tenantId = await page.evaluate(() => localStorage.getItem('tenantId'));
    
    expect(authToken).toBeTruthy();
    expect(tenantId).toBeTruthy();
  });

  test('Complete Performance Review Workflow - Create to Approval', async () => {
    // Step 1: Create Performance Review
    await test.step('Create new performance review', async () => {
      await page.goto(`${BASE_URL}/performance-reviews/new`);
      
      // Fill review form
      await page.fill('input[name="employeeId"]', 'employee-001');
      await page.fill('input[name="reviewerId"]', 'reviewer-001');
      await page.selectOption('select[name="reviewType"]', 'Annual');
      await page.fill('input[name="reviewPeriodStart"]', '2025-07-01');
      await page.fill('input[name="reviewPeriodEnd"]', '2025-12-31');
      
      await page.click('button:has-text("Create Review")');
      
      // Wait for success message
      await expect(page.locator('.toast-success, .success-message')).toBeVisible({ timeout: 5000 });
      
      // Extract review ID from URL
      await page.waitForURL(/\/performance-reviews\/[a-f0-9-]+/);
      const url = page.url();
      reviewId = url.split('/').pop();
      
      expect(reviewId).toBeTruthy();
    });

    // Step 2: Update Review Scores
    await test.step('Fill all performance criteria scores', async () => {
      await page.goto(`${BASE_URL}/performance-reviews/${reviewId}/edit`);
      
      // Fill all 13 criteria scores (1-5 scale)
      const criteria = [
        'qualityOfWork', 'productivity', 'technicalSkills', 'communication',
        'teamwork', 'initiative', 'problemSolving', 'adaptability',
        'attendancePunctuality', 'professionalism', 'learningDevelopment',
        'policyCompliance', 'customerService'
      ];
      
      for (const criterion of criteria) {
        await page.selectOption(`select[name="${criterion}Score"]`, '4'); // Score of 4
      }
      
      // Add comments
      await page.fill('textarea[name="strengthsComments"]', 'Excellent team player with strong technical skills.');
      await page.fill('textarea[name="areasForImprovement"]', 'Could improve time management.');
      await page.fill('textarea[name="goalsForNextPeriod"]', 'Complete advanced certification.');
      
      await page.click('button:has-text("Save Scores")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      // Verify weighted score is calculated
      const weightedScore = await page.locator('[data-testid="weighted-score"]').textContent();
      expect(weightedScore).toContain('4.0'); // All 4s should average to 4.0
    });

    // Step 3: Submit for Approval
    await test.step('Submit review for approval chain', async () => {
      await page.click('button:has-text("Submit for Approval")');
      
      // Fill approval chain
      await page.fill('input[name="level1ApproverId"]', 'approver1-001');
      await page.fill('input[name="level2ApproverId"]', 'approver2-001');
      await page.fill('input[name="level3ApproverId"]', 'approver3-001');
      
      await page.click('button:has-text("Confirm Submission")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      // Verify status changed to PendingLevel1
      const status = await page.locator('[data-testid="review-status"]').textContent();
      expect(status).toContain('Pending Level 1');
    });

    // Step 4: Level 1 Approval
    await test.step('Level 1 approver approves review', async () => {
      // Navigate to pending reviews for Level 1 approver
      await page.goto(`${BASE_URL}/performance-reviews/pending`);
      
      // Find the review
      await page.click(`tr:has-text("${reviewId}") button:has-text("Review")`);
      
      // Approve
      await page.click('button:has-text("Approve")');
      await page.fill('textarea[name="approvalComments"]', 'Approved by Level 1 - Good performance.');
      await page.click('button:has-text("Confirm Approval")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      // Verify status changed to PendingLevel2
      const status = await page.locator('[data-testid="review-status"]').textContent();
      expect(status).toContain('Pending Level 2');
    });

    // Step 5: Level 2 Approval
    await test.step('Level 2 approver approves review', async () => {
      await page.goto(`${BASE_URL}/performance-reviews/${reviewId}`);
      
      await page.click('button:has-text("Approve")');
      await page.fill('textarea[name="approvalComments"]', 'Approved by Level 2 - Meets expectations.');
      await page.click('button:has-text("Confirm Approval")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      const status = await page.locator('[data-testid="review-status"]').textContent();
      expect(status).toContain('Pending Level 3');
    });

    // Step 6: Level 3 Final Approval
    await test.step('Level 3 approver gives final approval', async () => {
      await page.goto(`${BASE_URL}/performance-reviews/${reviewId}`);
      
      await page.click('button:has-text("Approve")');
      await page.fill('textarea[name="approvalComments"]', 'Final approval granted.');
      await page.click('button:has-text("Confirm Approval")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      const status = await page.locator('[data-testid="review-status"]').textContent();
      expect(status).toContain('Approved');
    });

    // Step 7: Complete Probation (if applicable)
    await test.step('Complete probation for probation review', async () => {
      // Update review type to Probation
      await page.goto(`${BASE_URL}/performance-reviews/${reviewId}/edit`);
      await page.selectOption('select[name="reviewType"]', 'Probation');
      await page.click('button:has-text("Save")');
      
      // Complete probation
      await page.click('button:has-text("Complete Probation")');
      await page.selectOption('select[name="probationDecision"]', 'Confirmed');
      await page.fill('textarea[name="probationNotes"]', 'Employee has successfully completed probation period.');
      await page.click('button:has-text("Confirm Decision")');
      
      await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
      
      const decision = await page.locator('[data-testid="probation-decision"]').textContent();
      expect(decision).toContain('Confirmed');
    });
  });

  test('Reject Review at Level 2', async () => {
    // Create a new review
    const response = await page.request.post(`${API_URL}/PerformanceReview`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json'
      },
      data: {
        employeeId: 'employee-002',
        reviewerId: 'reviewer-002',
        reviewPeriodStart: '2025-07-01',
        reviewPeriodEnd: '2025-12-31',
        reviewType: 'Annual'
      }
    });
    
    const review = await response.json();
    const newReviewId = review.id;

    await page.goto(`${BASE_URL}/performance-reviews/${newReviewId}`);
    
    // Simulate rejection at Level 2
    await page.click('button:has-text("Reject")');
    await page.fill('textarea[name="rejectionReason"]', 'Performance does not meet minimum standards.');
    await page.click('button:has-text("Confirm Rejection")');
    
    await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
    
    const status = await page.locator('[data-testid="review-status"]').textContent();
    expect(status).toContain('Rejected');
  });

  test.afterAll(async () => {
    await page.close();
  });
});
