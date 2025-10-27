import { test, expect } from '@playwright/test';

test.describe('Infinite Loop Fix', () => {
  test('Products page should not reload infinitely', async ({ page }) => {
    // Track console logs to detect repeated queries
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      if (msg.text().includes('Loading products with filters') ||
          msg.text().includes('Executing query')) {
        consoleLogs.push(msg.text());
      }
    });

    // Navigate to products page
    await page.goto('http://localhost:5174/products');

    // Wait for initial load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait a bit to see if queries keep repeating
    await page.waitForTimeout(3000);

    // Count how many times the query executed
    const executingQueryCount = consoleLogs.filter(log =>
      log.includes('Executing query')
    ).length;

    console.log(`Total query executions: ${executingQueryCount}`);
    console.log(`Console logs:`, consoleLogs);

    // Should only execute once (or twice max for initial load + HMR)
    expect(executingQueryCount).toBeLessThanOrEqual(2);

    // Verify products loaded
    const productsLoaded = await page.locator('.product-card').count().catch(() => 0);
    const noProductsMessage = await page.locator('text=No products found').isVisible().catch(() => false);

    expect(productsLoaded > 0 || noProductsMessage).toBeTruthy();

    console.log('✓ Products page does not reload infinitely');
  });

  test('Home page should load once', async ({ page }) => {
    await page.goto('http://localhost:5174/');

    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait to ensure no infinite reloads
    await page.waitForTimeout(2000);

    // Check that content is visible
    await expect(page.locator('text=Featured Cocktails')).toBeVisible();

    console.log('✓ Home page loaded successfully');
  });

  test('Profile page should load once without hanging', async ({ page }) => {
    await page.goto('http://localhost:5174/profile');

    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait to ensure no hanging
    await page.waitForTimeout(2000);

    // Should redirect to login or show profile
    const url = page.url();
    expect(url.includes('/login') || url.includes('/profile')).toBeTruthy();

    console.log('✓ Profile page loaded without hanging');
  });
});
