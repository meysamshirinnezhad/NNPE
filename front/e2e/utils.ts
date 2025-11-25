import type { Page } from '@playwright/test';

export const testCredentials = {
  email: 'admin@nppepro.local',
  password: 'Passw0rd!',
};

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(testCredentials.email);
  await page.getByLabel(/password/i).fill(testCredentials.password);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(/\/dashboard/i);
}