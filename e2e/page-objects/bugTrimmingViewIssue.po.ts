import { Page } from '@playwright/test';

export class BugTrimmingViewIssuePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Returns if there is no edit title button
   */
  async isIssueTitleNotEditable() {
    return this.page
      .locator('app-issue-title')
      .getByRole('button', { name: 'Edit' })
      .count()
      .then((count: number) => count === 0);
  }

  /**
   * Returns if there is no edit description button
   */
  async isIssueDescriptionNotEditable() {
    return this.page
      .locator('form')
      .getByRole('button', { name: 'Edit' })
      .count()
      .then((count: number) => count === 0);
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
}
