import { test, expect } from '@playwright/test';

test.describe('Profile and Stripe Fixes', () => {
  test('Profile page should load without hanging', async ({ page }) => {
    // Navigate to profile page
    await page.goto('http://localhost:5174/profile');

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Should either redirect to login or show profile
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const isProfilePage = url.includes('/profile');

    expect(isLoginPage || isProfilePage).toBeTruthy();

    // If on profile page, check that it's not stuck loading
    if (isProfilePage) {
      // Wait a moment for any initial loading
      await page.waitForTimeout(2000);

      // Check that the loading spinner is not visible (meaning page loaded)
      const loadingSpinner = page.locator('.animate-spin').first();
      const isVisible = await loadingSpinner.isVisible().catch(() => false);

      if (isVisible) {
        // If spinner is still visible after 2 seconds, fail the test
        throw new Error('Profile page stuck loading');
      }

      console.log('✓ Profile page loaded successfully without hanging');
    } else {
      console.log('✓ Profile page redirected to login (user not authenticated)');
    }
  });

  test('Checkout page should show proper Stripe message', async ({ page }) => {
    // Navigate to checkout
    await page.goto('http://localhost:5174/checkout');

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check if redirected to login
    const url = page.url();
    if (url.includes('/login')) {
      console.log('✓ Checkout page redirected to login (user not authenticated)');
      return;
    }

    // Should show either "add items" message or shipping form
    const hasCartEmpty = await page.locator('text=Your Cart is Empty').isVisible().catch(() => false);
    const hasShippingForm = await page.locator('text=Shipping Information').isVisible().catch(() => false);

    expect(hasCartEmpty || hasShippingForm).toBeTruthy();

    if (hasShippingForm) {
      // Check that the Stripe message is appropriate
      const stripeConfigured = process.env.VITE_STRIPE_PUBLISHABLE_KEY ? true : false;

      if (stripeConfigured) {
        // Should show "Complete shipping information to proceed"
        const message = await page.locator('text=Complete shipping information to proceed to payment').isVisible().catch(() => false);
        expect(message).toBeTruthy();
      }

      console.log('✓ Checkout page displays correct Stripe integration status');
    }
  });

  test('Home page should load featured products', async ({ page }) => {
    // Navigate to home
    await page.goto('http://localhost:5174/');

    // Wait for featured section
    await expect(page.locator('text=Featured Cocktails')).toBeVisible({ timeout: 10000 });

    // Check loading completed
    await page.waitForTimeout(2000);

    const loadingSpinner = page.locator('.animate-spin').first();
    const isLoading = await loadingSpinner.isVisible().catch(() => false);

    expect(isLoading).toBeFalsy();

    console.log('✓ Home page loaded featured products successfully');
  });

  test('Products page should load products list', async ({ page }) => {
    // Navigate to products
    await page.goto('http://localhost:5174/products');

    // Wait for heading
    await expect(page.locator('h1.heading-1')).toBeVisible({ timeout: 10000 });

    // Wait for content to load
    await page.waitForFunction(() => {
      const spinner = document.querySelector('.animate-spin');
      const products = document.querySelectorAll('.product-card');
      return !spinner || products.length > 0;
    }, { timeout: 15000 });

    console.log('✓ Products page loaded successfully');
  });
});
