import { expect, Page } from '@playwright/test';
import { NewIssuePage } from './newIssue.po';

export interface BugReport {
  title: string;
  body?: string;
  severityLabel: string;
  bugTypeLabel: string;
}

export class BugReportingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getPhaseDescription() {
    return this.page.locator('app-layout-header').textContent();
  }

  async accessNewBugReportingPage() {
    return this.page.getByRole('button', { name: 'New Issue' }).click();
  }

  /**
   * Accesses the view issue page of the nth issue
   * @param title Title of Bug-Report.
   */
  async accessViewIssuePage({ title, severityLabel, bugTypeLabel }: BugReport) {
    const issueRow = this.page
      .locator('.mat-row')
      .filter({ hasText: title })
      .filter({ has: this.page.locator('.mat-tooltip-trigger').getByText(severityLabel) })
      .filter({ has: this.page.locator('.mat-tooltip-trigger').getByText(bugTypeLabel) });

    await expect(issueRow).toHaveCount(1);

    return issueRow.getByTestId('edit_issue_button').click();
  }

  /**
   * Creates a bug report
   */
  async createBugReport({ title, body, severityLabel, bugTypeLabel }: BugReport) {
    const newIssuePage = new NewIssuePage(this.page);

    await this.accessNewBugReportingPage();
    await newIssuePage.enterNewIssueTitle(title);

    if (body) {
      await newIssuePage.enterNewBugReportDescription(body);
    }

    await newIssuePage.selectSeverityDropdown();
    await newIssuePage.selectDropDownOption({ dropdownText: severityLabel });
    await newIssuePage.selectBugTypeDropdown();
    await newIssuePage.selectDropDownOption({ dropdownText: bugTypeLabel });
    await newIssuePage.submitBugReport();
    return this.page.locator('.back-button').click();
  }

  /**
   * Deletes a bug report
   */
  async deleteBugReport({ title, severityLabel, bugTypeLabel }: BugReport) {
    await this.page
      .getByRole('row', { name: [title, bugTypeLabel, severityLabel].join(' ') })
      .getByTestId('delete_issue_button')
      .click();
    return this.page.getByRole('button', { name: 'Yes, I wish to delete this' }).click();
  }

  /**
   * Identifies a Bug-Report based on the provided parameters.
   * @param title Title of Bug-Report.
   * @param severityLabel Severity assigned to Bug-Report.
   * @param bugTypeLabel Bug-Report's Type.
   * @returns true if a unique Bug-Report is present, false otherwise.
   */
  async isBugReportPresent({ title, severityLabel, bugTypeLabel }: BugReport) {
    let allRows = this.page.getByRole('row', { name: [title, bugTypeLabel, severityLabel].join(' ') });

    return allRows.count().then((count: number) => count === 1);
  }

  async search(searchString: string) {
    return this.page.getByLabel('Search').type(searchString);
  }
}
