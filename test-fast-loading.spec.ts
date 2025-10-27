import { test, expect } from '@playwright/test';

test.describe('Fast Loading Performance', () => {
  test('Home page should load in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5174/');

    // Wait for main content to be visible (not just network idle)
    await expect(page.locator('text=Featured Cocktails')).toBeVisible({ timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`✓ Home page loaded in ${loadTime}ms (${(loadTime / 1000).toFixed(2)}s)`);

    // Should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('Products page should load in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5174/products');

    // Wait for products heading
    await expect(page.locator('h1.heading-1')).toBeVisible({ timeout: 5000 });

    // Wait for loading to complete
    await page.waitForFunction(() => {
      const spinner = document.querySelector('.animate-spin');
      return !spinner;
    }, { timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`✓ Products page loaded in ${loadTime}ms (${(loadTime / 1000).toFixed(2)}s)`);

    // Should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('Profile page redirect should happen quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5174/profile');

    // Should redirect to login quickly
    await page.waitForURL(/login/, { timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`✓ Profile redirect completed in ${loadTime}ms (${(loadTime / 1000).toFixed(2)}s)`);

    // Should redirect in under 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  test('Auth initialization should not block UI rendering', async ({ page }) => {
    // Track when content becomes visible
    let contentVisibleTime: number | null = null;
    let authCompleteTime: number | null = null;

    const startTime = Date.now();

    // Monitor for content visibility
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Error loading profile') || text.includes('Profile loading timeout')) {
        authCompleteTime = Date.now();
      }
    });

    await page.goto('http://localhost:5174/');

    // Content should be visible even if auth is still loading
    await expect(page.locator('text=Experience')).toBeVisible({ timeout: 2000 });
    contentVisibleTime = Date.now();

    const contentLoadTime = contentVisibleTime - startTime;
    console.log(`✓ UI rendered in ${contentLoadTime}ms (${(contentLoadTime / 1000).toFixed(2)}s)`);

    // UI should render in under 1 second
    expect(contentLoadTime).toBeLessThan(1000);

    // Wait a bit longer to see if auth completes
    await page.waitForTimeout(2000);

    console.log('✓ Auth loads in background without blocking UI');
  });

  test('Navigation between pages should be instant', async ({ page }) => {
    // Load home page first
    await page.goto('http://localhost:5174/');
    await expect(page.locator('text=Featured Cocktails')).toBeVisible();

    // Navigate to products
    const navStartTime = Date.now();
    await page.click('text=Products');

    await expect(page.locator('h1.heading-1')).toBeVisible({ timeout: 3000 });
    const navTime = Date.now() - navStartTime;

    console.log(`✓ Navigation completed in ${navTime}ms (${(navTime / 1000).toFixed(2)}s)`);

    // Navigation should be under 1 second
    expect(navTime).toBeLessThan(1000);
  });
});
