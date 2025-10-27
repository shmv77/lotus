import { test, expect } from '@playwright/test';

test.describe('Auth Session Restoration', () => {
  test('App should load after reopening browser with session', async ({ page, context }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to home page
    await page.goto('http://localhost:5174/');

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Should see the home page content (not stuck loading)
    await expect(page.locator('text=Featured Cocktails')).toBeVisible({ timeout: 10000 });

    console.log('✓ Home page loaded on first visit');

    // Simulate closing and reopening browser by creating a new page with same storage
    const storageState = await context.storageState();
    const newPage = await context.newPage();

    // Navigate to home with the existing session
    await newPage.goto('http://localhost:5174/');

    // Should load without hanging (even if session needs refresh)
    await newPage.waitForLoadState('networkidle', { timeout: 15000 });

    // Check that page is not stuck loading
    const isLoading = await newPage.locator('.animate-spin').isVisible({ timeout: 5000 }).catch(() => false);
    expect(isLoading).toBeFalsy();

    // Should show content
    const hasContent = await newPage.locator('text=Featured Cocktails').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();

    console.log('✓ App loaded successfully after simulated browser reopen');
    console.log(`Console errors: ${errors.length}`);

    await newPage.close();
  });

  test('Protected routes should handle auth restoration gracefully', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('http://localhost:5174/profile');

    // Should either redirect to login OR show profile (not hang forever)
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Wait a bit for any auth loading
    await page.waitForTimeout(6000); // Wait for timeouts to kick in

    const url = page.url();
    console.log(`Final URL: ${url}`);

    // Should be on login page or profile page (not stuck with spinner)
    expect(url.includes('/login') || url.includes('/profile')).toBeTruthy();

    // Should not have loading spinner stuck
    const hasLoadingSpinner = await page.locator('.animate-spin').isVisible().catch(() => false);
    if (hasLoadingSpinner) {
      // If spinner is visible, it should disappear within timeout period
      await page.waitForTimeout(6000);
      const stillLoading = await page.locator('.animate-spin').isVisible().catch(() => false);
      expect(stillLoading).toBeFalsy();
    }

    console.log('✓ Protected route handled auth restoration without hanging');
  });

  test('Products page should load with or without auth', async ({ page }) => {
    // Navigate to products
    await page.goto('http://localhost:5174/products');

    // Should load regardless of auth state
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Should show products heading
    await expect(page.locator('h1.heading-1')).toBeVisible({ timeout: 10000 });

    // Should not be stuck loading
    await page.waitForTimeout(3000);
    const isLoading = await page.locator('.animate-spin').isVisible().catch(() => false);

    if (isLoading) {
      console.warn('Products page still loading, waiting for timeout...');
      await page.waitForTimeout(8000);
    }

    const stillLoading = await page.locator('.animate-spin').isVisible().catch(() => false);
    expect(stillLoading).toBeFalsy();

    console.log('✓ Products page loaded without auth issues');
  });
});
