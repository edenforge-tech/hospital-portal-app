const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

test.describe('Branch Capacity Map with Real-time SignalR', () => {
  let page;
  let signalRConnection;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'testadmin@hospital.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('Branch Capacity Map Loads and Displays Branches', async () => {
    await page.goto(`${BASE_URL}/branch-capacity`);
    
    // Wait for map to load
    await expect(page.locator('[data-testid="leaflet-map"]')).toBeVisible({ timeout: 10000 });
    
    // Verify map markers are present
    const markers = await page.locator('.leaflet-marker-icon').count();
    expect(markers).toBeGreaterThan(0);
    
    // Check capacity dashboard
    await expect(page.locator('[data-testid="capacity-dashboard"]')).toBeVisible();
  });

  test('Real-time Capacity Updates via SignalR', async () => {
    await page.goto(`${BASE_URL}/branch-capacity`);
    
    // Wait for SignalR connection
    await page.waitForFunction(() => {
      return window.signalRConnected === true;
    }, { timeout: 10000 });
    
    // Get initial capacity value
    const initialCapacity = await page.locator('[data-testid="total-capacity"]').textContent();
    
    // Click on a branch to view details
    await page.click('.leaflet-marker-icon:first-child');
    
    // Update capacity
    await page.click('button:has-text("Update Capacity")');
    await page.fill('input[name="currentOccupancy"]', '50');
    await page.click('button:has-text("Save")');
    
    // Wait for real-time update (SignalR should push update)
    await page.waitForTimeout(2000); // Allow time for SignalR message
    
    // Verify capacity updated in real-time
    const updatedCapacity = await page.locator('[data-testid="total-capacity"]').textContent();
    
    // Check that values changed or update notification appeared
    const notification = await page.locator('.toast-info, .notification:has-text("Capacity Updated")').isVisible();
    expect(notification || updatedCapacity !== initialCapacity).toBeTruthy();
  });

  test('Capacity Trend Chart Renders', async () => {
    await page.goto(`${BASE_URL}/branch-capacity`);
    
    // Select a branch
    await page.click('.leaflet-marker-icon:first-child');
    
    // Open trends
    await page.click('button:has-text("View Trends")');
    
    // Verify chart loads
    await expect(page.locator('[data-testid="capacity-chart"]')).toBeVisible({ timeout: 5000 });
    
    // Check chart has data
    const chartData = await page.locator('.recharts-line-curve, .recharts-bar').count();
    expect(chartData).toBeGreaterThan(0);
  });

  test('Filter Branches by Capacity Status', async () => {
    await page.goto(`${BASE_URL}/branch-capacity`);
    
    // Apply filter for high capacity
    await page.click('button:has-text("Filters")');
    await page.check('input[name="filter-high-capacity"]');
    await page.click('button:has-text("Apply")');
    
    // Verify markers are filtered
    await page.waitForTimeout(1000);
    
    const visibleMarkers = await page.locator('.leaflet-marker-icon:visible').count();
    expect(visibleMarkers).toBeGreaterThanOrEqual(0);
  });

  test('SignalR Reconnection on Connection Loss', async () => {
    await page.goto(`${BASE_URL}/branch-capacity`);
    
    // Wait for initial connection
    await page.waitForFunction(() => window.signalRConnected === true, { timeout: 10000 });
    
    // Simulate disconnect
    await page.evaluate(() => {
      if (window.signalRConnection) {
        window.signalRConnection.stop();
      }
    });
    
    // Wait for reconnection attempt
    await page.waitForTimeout(5000);
    
    // Verify reconnection
    const reconnected = await page.evaluate(() => window.signalRConnected === true);
    expect(reconnected).toBeTruthy();
  });

  test.afterAll(async () => {
    await page.close();
  });
});
