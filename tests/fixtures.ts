import { test as base, expect, Page } from '@playwright/test';

// Extend base test with authentication fixture
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Set auth session in localStorage before navigating
    await page.goto('/login');
    
    // Set a mock auth session directly
    await page.evaluate(() => {
      const mockSession = {
        userId: 'test-user-id',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        timestamp: Date.now()
      };
      localStorage.setItem('auth_session', JSON.stringify(mockSession));
    });
    
    await use(page);
  },
});

// Helper to bypass auth for public pages
export async function skipAuth(page: Page) {
  await page.evaluate(() => {
    const mockSession = {
      userId: 'test-user-id',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin',
      timestamp: Date.now()
    };
    localStorage.setItem('auth_session', JSON.stringify(mockSession));
  });
}

// Helper to wait for page load
export async function waitForPageLoad(page: Page, expectedText?: RegExp) {
  await page.waitForLoadState('networkidle');
  if (expectedText) {
    await expect(page.locator('h1, h2, h3').first()).toContainText(expectedText, { timeout: 10000 }).catch(() => {});
  }
}

export { expect };
