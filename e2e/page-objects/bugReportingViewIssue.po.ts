import { Page } from '@playwright/test';

export class BugReportingViewIssuePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Edits the issue with the given title
   * @param title
   */
  async editIssueTitle(title: string) {
    await this.page.locator('app-issue-title').getByRole('button', { name: 'Edit' }).click();
    await this.page.locator('#title').fill(title);
    return this.page.locator('app-issue-title').getByRole('button', { name: 'Save' }).click();
  }

  /**
   * Edits the issue with the given severity
   */
  async editIssueSeverity(severityLabel: string) {
    await this.page.locator('app-issue-label').filter({ hasText: 'Severity' }).getByRole('button').click();
    return this.page.getByRole('button', { name: severityLabel, exact: true }).click();
  }

  /**
   * Edits the issue with the given severity
   */
  async editIssueType(bugTypeLabel: string) {
    await this.page.locator('app-issue-label').filter({ hasText: 'Bug Type' }).getByRole('button').click();
    return this.page.getByRole('button', { name: bugTypeLabel }).click();
  }

  /**
   * Edits the issue with the given body
   */
  async editIssueDescription(body: string) {
    await this.page.locator('form').getByRole('button', { name: 'Edit' }).click();
    const textArea = this.page.locator('.text-input-area');
    await textArea.focus();
    await textArea.clear();
    await textArea.fill(body);
    return this.page.getByRole('button', { name: 'Save' }).click();
  }
}
