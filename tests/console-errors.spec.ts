import { test, expect } from '@playwright/test';

test('No console errors when clicking all utils', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes timeout
  
  const consoleErrors: string[] = [];

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate to the app
  await page.goto('/');

  // Wait for the page to load - look for the main content or util grid
  await page.waitForSelector('h1:has-text("OpenDevUtils")');

  // Wait for util links to be present
  await page.waitForSelector('a[href^="/"]:not([href="/"])');

  // Get all util links (exclude home link)
  const utilLinks = page.locator('a[href^="/"]:not([href="/"])');
  const count = await utilLinks.count();

  console.log(`Found ${count} util links to test`);

  // Click each util and check for errors
  for (let i = 0; i < count; i++) {
    consoleErrors.length = 0; // Reset errors for each util

    const link = utilLinks.nth(i);
    const href = await link.getAttribute('href');
    console.log(`Testing util ${i + 1}/${count}: ${href}`);

    await link.click();

    // Wait for navigation and network to be idle
    await page.waitForLoadState('networkidle');

    // Wait a bit for any async errors (reduced from 2000ms)
    await page.waitForTimeout(500);

    // Check for console errors
    if (consoleErrors.length > 0) {
      console.error(`Console errors for ${href}:`, consoleErrors);
    }
    expect(consoleErrors).toHaveLength(0);

    // Go back to home
    await page.goto('/');
    await page.waitForSelector('h1:has-text("OpenDevUtils")');
  }
});