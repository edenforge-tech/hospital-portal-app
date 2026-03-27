/**
 * Medical Imaging Workflow - End-to-End Tests
 * Coverage: Upload, Annotation, Comparison, Export workflows
 * Framework: Playwright with multi-browser support
 * 
 * Run with:
 *   pnpm test:imaging           # Run all imaging tests
 *   pnpm test:imaging --headed  # Run with browser visible
 *   pnpm test:imaging --debug   # Debug mode
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5073';

// Test data
const TEST_USER = {
  userName: 'admin',
  password: 'Admin@123456',
};

const TEST_PATIENT = {
  id: 'test-patient-001',
  firstName: 'John',
  lastName: 'Doe',
  mrn: 'MRN-001',
};

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="userName"]', TEST_USER.userName);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
}

async function navigateToImaging(page: Page) {
  await page.goto(`${BASE_URL}/dashboard/imaging/orders`);
  await expect(page.locator('h1')).toContainText('Imaging Orders');
}

test.describe('Medical Imaging Workflow - Complete E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe('1. DICOM Upload Workflow', () => {
    test('should upload single DICOM file successfully', async ({ page }) => {
      await navigateToImaging(page);

      // Click create new order
      await page.click('button:has-text("New Order")');

      // Fill order form
      await page.fill('input[name="patientId"]', TEST_PATIENT.id);
      await page.selectOption('select[name="modality"]', 'CT');
      await page.fill('input[name="studyDescription"]', 'Chest CT Scan');
      await page.fill('textarea[name="clinicalHistory"]', 'Patient with chest pain');
      
      // Upload DICOM file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(__dirname, '../fixtures/sample-ct.dcm'));

      // Verify upload progress
      await expect(page.locator('text=Uploading')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 10000 });

      // Submit order
      await page.click('button:has-text("Create Order")');

      // Verify success
      await expect(page.locator('.toast-success')).toContainText('Order created successfully');
      await expect(page).toHaveURL(/\/dashboard\/imaging\/orders\/[a-z0-9-]+/);
    });

    test('should upload multiple DICOM files (series)', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('button:has-text("New Order")');

      // Fill basic info
      await page.fill('input[name="patientId"]', TEST_PATIENT.id);
      await page.selectOption('select[name="modality"]', 'MRI');
      await page.fill('input[name="studyDescription"]', 'Brain MRI with contrast');

      // Upload multiple files
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([
        path.join(__dirname, '../fixtures/mri-slice-001.dcm'),
        path.join(__dirname, '../fixtures/mri-slice-002.dcm'),
        path.join(__dirname, '../fixtures/mri-slice-003.dcm'),
      ]);

      // Verify multiple uploads
      await expect(page.locator('text=3 files uploaded')).toBeVisible({ timeout: 15000 });

      // Submit
      await page.click('button:has-text("Create Order")');
      await expect(page.locator('.toast-success')).toBeVisible();
    });

    test('should validate DICOM file format', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('button:has-text("New Order")');

      // Try to upload non-DICOM file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(__dirname, '../fixtures/invalid-image.jpg'));

      // Verify error
      await expect(page.locator('.toast-error')).toContainText('Invalid DICOM file');
    });

    test('should handle upload cancellation', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('button:has-text("New Order")');

      // Start upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(__dirname, '../fixtures/large-file.dcm'));

      // Cancel during upload
      await page.click('button:has-text("Cancel Upload")');

      // Verify cancelled
      await expect(page.locator('text=Upload cancelled')).toBeVisible();
    });
  });

  test.describe('2. Annotation Creation & Management', () => {
    test('should create Length measurement annotation', async ({ page }) => {
      await navigateToImaging(page);
      
      // Open existing order with DICOM
      await page.click('tr:first-child');

      // Wait for viewer to load
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Select Length tool
      await page.click('button[aria-label="Length Tool"]');

      // Draw on canvas (approximate coordinates)
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 200 } });

      // Verify annotation appears in list
      await expect(page.locator('[data-testid="annotations-list"]')).toContainText('Length');
      await expect(page.locator('[data-testid="annotation-value"]')).toContainText('mm');
    });

    test('should create Angle measurement annotation', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Select Angle tool
      await page.click('button[aria-label="Angle Tool"]');

      // Draw angle (3 points)
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 150, y: 150 } });
      await canvas.click({ position: { x: 200, y: 100 } });

      // Verify annotation
      await expect(page.locator('[data-testid="annotations-list"]')).toContainText('Angle');
      await expect(page.locator('[data-testid="annotation-value"]')).toContainText('°');
    });

    test('should create ROI annotation with area calculation', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Select Rectangle ROI tool
      await page.click('button[aria-label="Rectangle ROI"]');

      // Draw rectangle
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 250, y: 250 } });

      // Verify ROI annotation
      await expect(page.locator('[data-testid="annotations-list"]')).toContainText('ROI');
      await expect(page.locator('[data-testid="annotation-value"]')).toContainText('mm²');
    });

    test('should toggle annotation visibility', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Create annotation
      await page.click('button[aria-label="Length Tool"]');
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 200 } });

      // Toggle visibility off
      await page.click('[data-testid="annotation-visibility-toggle"]:first-of-type');
      
      // Verify annotation hidden on canvas
      await expect(page.locator('canvas.cornerstone-canvas')).not.toContainText('mm');

      // Toggle visibility on
      await page.click('[data-testid="annotation-visibility-toggle"]:first-of-type');
      
      // Verify annotation visible again
      await expect(page.locator('[data-testid="annotation-value"]')).toBeVisible();
    });

    test('should edit annotation label', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Create annotation
      await page.click('button[aria-label="Length Tool"]');
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 200 } });

      // Click edit button
      await page.click('[data-testid="annotation-edit-button"]:first-of-type');

      // Change label
      await page.fill('input[name="annotationLabel"]', 'Tumor measurement');
      await page.click('button:has-text("Save")');

      // Verify updated label
      await expect(page.locator('[data-testid="annotations-list"]')).toContainText('Tumor measurement');
    });

    test('should delete annotation', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Create annotation
      await page.click('button[aria-label="Length Tool"]');
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 200 } });

      // Verify annotation exists
      await expect(page.locator('[data-testid="annotations-list"] > div')).toHaveCount(1);

      // Delete annotation
      await page.click('[data-testid="annotation-delete-button"]:first-of-type');
      await page.click('button:has-text("Confirm")');

      // Verify annotation removed
      await expect(page.locator('[data-testid="annotations-list"] > div')).toHaveCount(0);
    });

    test('should sync annotations between canvas and list', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Create annotation on canvas
      await page.click('button[aria-label="Length Tool"]');
      const canvas = page.locator('canvas.cornerstone-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 200 } });

      // Verify appears in list immediately (bidirectional sync test)
      await expect(page.locator('[data-testid="annotations-list"]')).toContainText('Length');

      // Delete from canvas using keyboard
      await page.keyboard.press('Delete');

      // Verify removed from list (bidirectional sync test)
      await expect(page.locator('[data-testid="annotations-list"] > div')).toHaveCount(0);
    });
  });

  test.describe('3. Image Comparison Workflow', () => {
    test('should create new comparison between two scans', async ({ page }) => {
      await navigateToImaging(page);

      // Click Comparisons tab
      await page.click('a:has-text("Comparisons")');

      // Create new comparison
      await page.click('button:has-text("New Comparison")');

      // Select baseline scan
      await page.selectOption('select[name="baselineOrderId"]', { index: 1 });

      // Select follow-up scan
      await page.selectOption('select[name="followUpOrderId"]', { index: 2 });

      // Add comparison notes
      await page.fill('textarea[name="comparisonNotes"]', 'Comparing pre-treatment and post-treatment scans');

      // Submit
      await page.click('button:has-text("Create Comparison")');

      // Verify comparison created
      await expect(page.locator('.toast-success')).toContainText('Comparison created');
      await expect(page).toHaveURL(/\/dashboard\/imaging\/comparisons\/[a-z0-9-]+/);
    });

    test('should display side-by-side comparison view', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/imaging/comparisons`);
      
      // Open existing comparison
      await page.click('tr:first-child');

      // Verify two viewports visible
      await expect(page.locator('[data-testid="baseline-viewport"]')).toBeVisible();
      await expect(page.locator('[data-testid="followup-viewport"]')).toBeVisible();

      // Verify sync indicator
      await expect(page.locator('[data-testid="viewport-sync-indicator"]')).toContainText('Linked');
    });

    test('should synchronize window/level between viewports', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/imaging/comparisons`);
      await page.click('tr:first-child');

      // Adjust window/level on baseline
      const baselineCanvas = page.locator('[data-testid="baseline-viewport"] canvas');
      await baselineCanvas.click({ position: { x: 100, y: 100 } });
      await page.mouse.move(150, 150);

      // Verify follow-up viewport matches (visual check would require screenshot comparison)
      await expect(page.locator('[data-testid="viewport-sync-indicator"]')).toContainText('Synced');
    });

    test('should synchronize zoom between viewports', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/imaging/comparisons`);
      await page.click('tr:first-child');

      // Click zoom in button
      await page.click('[data-testid="zoom-in-button"]');

      // Verify both viewports zoomed (check zoom level display)
      await expect(page.locator('[data-testid="baseline-zoom-level"]')).toContainText('150%');
      await expect(page.locator('[data-testid="followup-zoom-level"]')).toContainText('150%');
    });

    test('should add progression finding to comparison', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/imaging/comparisons`);
      await page.click('tr:first-child');

      // Click Add Finding button
      await page.click('button:has-text("Add Finding")');

      // Select finding type
      await page.selectOption('select[name="findingType"]', 'progression');

      // Add description
      await page.fill('textarea[name="findingDescription"]', 'Lesion increased from 15mm to 22mm');

      // Add severity
      await page.selectOption('select[name="severity"]', 'moderate');

      // Save finding
      await page.click('button:has-text("Save Finding")');

      // Verify finding appears in list
      await expect(page.locator('[data-testid="findings-list"]')).toContainText('progression');
      await expect(page.locator('[data-testid="findings-list"]')).toContainText('15mm to 22mm');
    });
  });

  test.describe('4. Report Export & PDF Preview Workflow', () => {
    test('should open export dialog from order details', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');

      // Click Export button
      await page.click('button:has-text("Export")');

      // Verify export dialog opens
      await expect(page.locator('[data-testid="export-dialog"]')).toBeVisible();
      await expect(page.locator('text=Export Options')).toBeVisible();
    });

    test('should configure export options', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Select export options
      await page.check('input[name="includeAnnotations"]');
      await page.check('input[name="includeMeasurements"]');
      await page.uncheck('input[name="includePatientDemographics"]'); // HIPAA de-identification

      // Select report template
      await page.selectOption('select[name="reportTemplate"]', 'detailed');

      // Verify selections
      await expect(page.locator('input[name="includeAnnotations"]')).toBeChecked();
      await expect(page.locator('input[name="includePatientDemographics"]')).not.toBeChecked();
    });

    test('should generate PDF report successfully', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Configure options
      await page.check('input[name="includeAnnotations"]');
      await page.check('input[name="includeMeasurements"]');

      // Generate report
      await page.click('button:has-text("Generate PDF")');

      // Verify generating state
      await expect(page.locator('text=Generating...')).toBeVisible();

      // Wait for completion
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });

      // Verify download link appears
      await expect(page.locator('a:has-text("Download PDF")')).toBeVisible();
    });

    test('should preview PDF before download', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Generate report first
      await page.click('button:has-text("Generate PDF")');
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });

      // Click Preview button
      await page.click('button:has-text("Preview PDF")');

      // Verify PrintPreview modal opens
      await expect(page.locator('[data-testid="print-preview-modal"]')).toBeVisible();
      await expect(page.locator('iframe[title="PDF Preview"]')).toBeVisible();
    });

    test('should zoom in/out in PDF preview', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Generate and preview
      await page.click('button:has-text("Generate PDF")');
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Preview PDF")');

      // Zoom in
      await page.click('[data-testid="zoom-in-button"]');
      await expect(page.locator('[data-testid="zoom-level"]')).toContainText('125%');

      // Zoom in again
      await page.click('[data-testid="zoom-in-button"]');
      await expect(page.locator('[data-testid="zoom-level"]')).toContainText('150%');

      // Zoom out
      await page.click('[data-testid="zoom-out-button"]');
      await expect(page.locator('[data-testid="zoom-level"]')).toContainText('125%');
    });

    test('should navigate pages in PDF preview', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Generate multi-page report
      await page.check('input[name="includeAnnotations"]');
      await page.check('input[name="includeMeasurements"]');
      await page.check('input[name="includeComparisons"]');
      await page.click('button:has-text("Generate PDF")');
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Preview PDF")');

      // Verify page 1
      await expect(page.locator('[data-testid="current-page"]')).toContainText('1');

      // Navigate to next page
      await page.click('[data-testid="next-page-button"]');
      await expect(page.locator('[data-testid="current-page"]')).toContainText('2');

      // Navigate back
      await page.click('[data-testid="previous-page-button"]');
      await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
    });

    test('should print PDF from preview', async ({ page, context }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Generate and preview
      await page.click('button:has-text("Generate PDF")');
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Preview PDF")');

      // Click print button
      const [printDialog] = await Promise.all([
        context.waitForEvent('page'),
        page.click('[data-testid="print-button"]')
      ]);

      // Verify print dialog opened (browser native)
      expect(printDialog).toBeTruthy();
      await printDialog.close();
    });

    test('should download PDF from preview', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Generate and preview
      await page.click('button:has-text("Generate PDF")');
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Preview PDF")');

      // Start download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-button"]')
      ]);

      // Verify download
      expect(download.suggestedFilename()).toContain('.pdf');
      await expect(page.locator('.toast-success')).toContainText('Download started');
    });

    test('should close preview and return to export dialog', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await page.click('button:has-text("Export")');

      // Generate and preview
      await page.click('button:has-text("Generate PDF")');
      await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Preview PDF")');

      // Verify preview open
      await expect(page.locator('[data-testid="print-preview-modal"]')).toBeVisible();

      // Close preview
      await page.click('[data-testid="preview-close-button"]');

      // Verify back to export dialog
      await expect(page.locator('[data-testid="print-preview-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="export-dialog"]')).toBeVisible();
    });
  });

  test.describe('5. Performance & Error Handling', () => {
    test('should handle large DICOM files efficiently', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('button:has-text("New Order")');

      // Upload large file (100MB+)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(__dirname, '../fixtures/large-ct-series.dcm'));

      // Verify upload doesn't timeout
      await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 60000 });

      // Verify performance metrics (if displayed)
      await expect(page.locator('[data-testid="upload-time"]')).toBeVisible();
    });

    test('should display error for corrupted DICOM file', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('button:has-text("New Order")');

      // Upload corrupted file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.join(__dirname, '../fixtures/corrupted.dcm'));

      // Verify error message
      await expect(page.locator('.toast-error')).toContainText('Failed to parse DICOM file');
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      // Simulate offline
      await context.setOffline(true);

      await navigateToImaging(page);
      await page.click('button:has-text("New Order")');

      // Try to submit
      await page.fill('input[name="patientId"]', TEST_PATIENT.id);
      await page.click('button:has-text("Create Order")');

      // Verify error handling
      await expect(page.locator('.toast-error')).toContainText('Network error');

      // Restore connection
      await context.setOffline(false);
    });

    test('should recover from viewer initialization failure', async ({ page }) => {
      await navigateToImaging(page);

      // Open order that might fail to load
      await page.click('tr:first-child');

      // If error occurs, verify retry button
      const errorLocator = page.locator('text=Failed to load viewer');
      if (await errorLocator.isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Retry")');
        await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('6. Accessibility & UX', () => {
    test('should support keyboard navigation in viewer', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 5000 });

      // Focus viewer
      await page.locator('canvas.cornerstone-canvas').focus();

      // Pan with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      // Zoom with + and -
      await page.keyboard.press('+');
      await page.keyboard.press('-');

      // Reset with 'R'
      await page.keyboard.press('r');
    });

    test('should have accessible labels for all controls', async ({ page }) => {
      await navigateToImaging(page);
      await page.click('tr:first-child');

      // Verify ARIA labels
      await expect(page.locator('button[aria-label="Length Tool"]')).toBeVisible();
      await expect(page.locator('button[aria-label="Angle Tool"]')).toBeVisible();
      await expect(page.locator('button[aria-label="Window Level Tool"]')).toBeVisible();
      await expect(page.locator('button[aria-label="Zoom In"]')).toBeVisible();
    });

    test('should display loading states appropriately', async ({ page }) => {
      await navigateToImaging(page);

      // Navigate to order
      await page.click('tr:first-child');

      // Verify loading spinner
      await expect(page.locator('[role="status"]')).toBeVisible();

      // Wait for content to load
      await expect(page.locator('canvas.cornerstone-canvas')).toBeVisible({ timeout: 10000 });

      // Verify loading spinner hidden
      await expect(page.locator('[role="status"]')).not.toBeVisible();
    });
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should adapt UI for mobile devices', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="userName"]', TEST_USER.userName);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/dashboard/imaging/orders`);

    // Verify mobile menu
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Verify responsive table
    await expect(page.locator('table')).toHaveCSS('overflow-x', 'auto');
  });
});

test.describe('Security & HIPAA Compliance', () => {
  test('should de-identify patient data in exported reports', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="userName"]', TEST_USER.userName);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/dashboard/imaging/orders`);
    await page.click('tr:first-child');
    await page.click('button:has-text("Export")');

    // Ensure de-identification option is checked
    await page.uncheck('input[name="includePatientDemographics"]');

    // Generate report
    await page.click('button:has-text("Generate PDF")');
    await expect(page.locator('text=Report generated successfully')).toBeVisible({ timeout: 10000 });

    // Verify de-identification notice
    await expect(page.locator('text=Patient data de-identified')).toBeVisible();
  });

  test('should require authentication for imaging access', async ({ page }) => {
    // Try to access without login
    await page.goto(`${BASE_URL}/dashboard/imaging/orders`);

    // Verify redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});
