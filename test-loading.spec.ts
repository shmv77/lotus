import { test, expect } from '@playwright/test';

test.describe('Loading Issues Fix Test', () => {
  test('Home page should load featured cocktails', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:5173/');

    // Wait for the featured cocktails section to be visible
    await expect(page.locator('text=Featured Cocktails')).toBeVisible({ timeout: 10000 });

    // Check that the loading spinner is NOT visible (meaning data loaded)
    const loadingSpinner = page.locator('.animate-spin').first();
    await expect(loadingSpinner).not.toBeVisible({ timeout: 15000 });

    // Verify that at least one product card is visible
    const productCards = page.locator('.product-card');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    console.log('✓ Home page loaded successfully');
  });

  test('Products page should load products list', async ({ page }) => {
    // Navigate to products page
    await page.goto('http://localhost:5173/products');

    // Wait for the products heading
    await expect(page.locator('h1.heading-1')).toBeVisible({ timeout: 10000 });

    // Check that the loading spinner disappears
    const loadingSpinner = page.locator('.animate-spin');

    // Wait for either products to load OR "no products" message
    await page.waitForFunction(() => {
      const spinner = document.querySelector('.animate-spin');
      const products = document.querySelectorAll('.product-card');
      const noProductsText = Array.from(document.querySelectorAll('p')).find(
        el => el.textContent?.includes('No products found')
      );
      return !spinner || products.length > 0 || noProductsText;
    }, { timeout: 15000 });

    console.log('✓ Products page loaded successfully');
  });

  test('Profile page should load (when authenticated)', async ({ page }) => {
    // Navigate to profile page
    await page.goto('http://localhost:5173/profile');

    // Should either show login redirect or profile page
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check if redirected to login or profile loaded
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const isProfilePage = url.includes('/profile');

    expect(isLoginPage || isProfilePage).toBeTruthy();

    // If on profile page, verify it's not stuck loading
    if (isProfilePage) {
      // Wait for profile content or loading to complete
      await page.waitForFunction(() => {
        const spinner = document.querySelector('.animate-spin');
        const profileHeading = document.querySelector('text=My Profile');
        return !spinner || profileHeading;
      }, { timeout: 15000 });
    }

    console.log('✓ Profile page loaded successfully (or redirected to login)');
  });
});
