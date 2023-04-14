import { AppConfig } from '../src/environments/environment';
import { test, expect } from '@playwright/test';

test.describe("CATcher's Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays "CATcher" in header bar', async ({ page }) => {
    const title = await page.locator('app-layout-header').textContent();
    expect(title).toEqual(`CATcher v${AppConfig.version}receiptmail`);
  });

  test('allows users to authenticate themselves', async ({ page }) => {
    await page.locator('app-profiles').click();
    await page.locator('mat-option').nth(1).click();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Confirm Login Account')).toHaveText('Confirm Login Account');

    const login_button = page.getByRole('button', { name: 'github-logo Continue as CAT-Tester' });
    await expect(login_button).toBeVisible();
    await login_button.click();
  });
});
