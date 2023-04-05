import { expect, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToRoot() {
    await this.page.goto('/');
  }

  async login() {
    await this.selectSession();
  }

  /**
   * Steps to select session on the login page.
   */
  private async selectSession() {
    await this.page.locator('app-profiles').click();
    await this.page.locator('mat-option').locator('nth=1').click();
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  /**
   * Steps to confirm user when redirected back by Github OAuth
   */
  async confirmUser() {
    await expect(this.page.getByText('Confirm Login Account')).toHaveText('Confirm Login Account');
    const login_button = this.page.getByRole('button', { name: 'github-logo Continue as CAT-Tester' });
    await expect(login_button).toBeVisible();
    await login_button.click();
  }

  async bypassAuthentication() {
    await this.login();
    await this.confirmUser();
  }
}
