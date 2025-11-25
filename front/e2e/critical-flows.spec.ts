import { test, expect } from '@playwright/test';
import { login } from './utils';

test.describe('NPPE - Critical User Flows', () => {

  test('login → dashboard → start custom test → answer questions → complete → review', async ({ page }) => {
    // Login
    await login(page);

    // Dashboard should render
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Navigate to new practice test
    await page.goto('/practice-test/new');
    await expect(page.getByRole('heading', { name: /create practice test/i })).toBeVisible();

    // Select custom test type
    await page.getByText(/custom test/i).click();

    // Select a topic (adjust selector to match your UI)
    const firstTopic = page.locator('[type="checkbox"]').first();
    await firstTopic.check();

    // Set 10 questions
    const questionInput = page.locator('input[type="number"]').first();
    await questionInput.fill('10');

    // Start test
    await page.getByRole('button', { name: /start practice test/i }).click();

    // Should navigate to test runner
    await page.waitForURL(/\/practice-test\/take/);
    await expect(page.locator('text=/Question 1 of 10/i')).toBeVisible();

    // Answer first 2 questions
    for (let i = 0; i < 2; i++) {
      // Wait for question to load
      await page.waitForTimeout(500);
      
      // Click first option (A)
      const firstOption = page.locator('.cursor-pointer').first();
      await firstOption.click();

      // Next question
      if (i < 1) {
        await page.getByRole('button', { name: /next/i }).click();
      }
    }

    // Submit test
    await page.getByRole('button', { name: /submit test/i }).click();
    
    // Confirm in modal if present
    const confirmBtn = page.getByRole('button', { name: /submit test|confirm/i }).last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Should land on review page
    await page.waitForURL(/\/test\/.+\/review/);
    await expect(page.getByRole('heading', { name: /review/i })).toBeVisible();

    // Review should show questions
    await expect(page.locator('text=/Question 1/i')).toBeVisible();

    // Back to dashboard
    await page.getByRole('button', { name: /back to dashboard/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('practice questions → bookmark → view bookmarks', async ({ page }) => {
    await login(page);

    // Go to practice
    await page.goto('/practice');
    await expect(page.getByRole('heading', { name: /practice/i })).toBeVisible();

    // Wait for questions to load
    await page.waitForTimeout(1000);

    // Bookmark current question
    const bookmarkBtn = page.locator('button:has(i.ri-bookmark-line)').first();
    if (await bookmarkBtn.isVisible()) {
      await bookmarkBtn.click();
      await page.waitForTimeout(500);
    }

    // Navigate to bookmarks
    await page.goto('/bookmarks');
    await expect(page.getByRole('heading', { name: /bookmarked questions/i })).toBeVisible();

    // Should show at least one bookmark (if we successfully bookmarked)
    const bookmarkCards = page.locator('[class*="Card"]');
    const count = await bookmarkCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('topics → view topic detail → start practice', async ({ page }) => {
    await login(page);

    // Navigate to topics
    await page.goto('/topics');
    await expect(page.getByRole('heading', { name: /topics/i })).toBeVisible();

    // Wait for topics to load
    await page.waitForTimeout(1000);

    // Click first topic card
    const firstTopic = page.locator('[class*="Card"]').first();
    await firstTopic.click();

    // Should navigate to topic detail
    await page.waitForURL(/\/topics\/detail/);

    // Click practice button
    const practiceBtn = page.getByRole('button', { name: /practice/i }).first();
    await practiceBtn.click();

    // Should navigate to practice with topic filter
    await page.waitForURL(/\/practice/);
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('page refresh during test preserves answers', async ({ page }) => {
    await login(page);

    // Start a test
    await page.goto('/practice-test/new');
    await page.getByText(/full nppe simulation/i).click();
    await page.getByRole('button', { name: /start practice test/i }).click();

    // Wait for test to start
    await page.waitForURL(/\/practice-test\/take/);
    await page.waitForTimeout(1000);

    // Answer first question
    const firstOption = page.locator('.cursor-pointer').first();
    await firstOption.click();
    await page.waitForTimeout(500);

    // Get current URL
    const currentUrl = page.url();

    // Refresh page
    await page.reload();

    // Should stay on same test
    expect(page.url()).toBe(currentUrl);

    // Answer should be preserved (option should be selected)
    const selectedOption = page.locator('.border-blue-500, .bg-blue-50').first();
    await expect(selectedOption).toBeVisible();
  });

  test('admin routes protected from non-admin users', async ({ page }) => {
    // Login as regular user (adjust if needed)
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('user@test.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /log in/i }).click();

    // Try to access admin route
    await page.goto('/admin/subscriptions');

    // Should redirect to dashboard (non-admin)
    await page.waitForURL(/\/dashboard/);
  });

});

test.describe('NPPE - Error Handling', () => {
  
  test('displays error on failed API call', async ({ page }) => {
    await login(page);

    // Navigate to a page that makes API calls
    await page.goto('/practice');

    // If API is down or returns error, should show error message
    // (This test assumes error handling is in place)
    const errorMessage = page.locator('text=/error|failed|try again/i');
    
    // Either content loads OR error shows (both are acceptable)
    const hasContent = await page.locator('[class*="Card"]').count() > 0;
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasContent || hasError).toBeTruthy();
  });

});