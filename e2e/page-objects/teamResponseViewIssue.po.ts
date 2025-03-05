import { Page } from '@playwright/test';
import { BugResponse } from './teamResponse.po';

export class TeamResponseViewIssue {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Fills in the response with the given response
   */
  async fillResponse(response: BugResponse) {
    await this.page.locator('.mat-form-field-infix').filter({ hasText: 'Severity' }).click();
    await this.page.getByRole('menuitem', { name: response.severityLabel, exact: true }).click();

    await this.page.locator('.mat-form-field-infix').filter({ hasText: 'Bug Type' }).click();
    await this.page.getByRole('menuitem', { name: response.bugTypeLabel, exact: true }).click();

    await this.page.locator('.mat-form-field-infix').filter({ hasText: 'Response' }).click();
    await this.page.getByRole('menuitem', { name: response.responseLabel, exact: true }).click();

    await this.page.locator('.mat-form-field-infix').filter({ hasText: 'Assignees' }).click();

    for (const assignee of response.assignees) {
      await this.page.getByText(assignee, { exact: true }).click();
    }

    await this.page.locator('body').click();

    const textArea = this.page.locator('.text-input-area');
    await textArea.focus();
    await textArea.clear();
    await textArea.fill(response.body);
    return this.page.getByText('Submit').click();
  }
}
