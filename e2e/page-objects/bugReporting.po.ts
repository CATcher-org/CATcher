import { expect, Page } from '@playwright/test';

interface BugReport {
  title: string;
  severityLabel?: string;
  bugTypeLabel?: string;
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
   * Identifies a Bug-Report based on the provided parameters.
   * @param title Title of Bug-Report.
   * @param severityLabel Severity assigned to Bug-Report.
   * @param bugTypeLabel Bug-Report's Type.
   * @returns true if a unique Bug-Report is present, false otherwise.
   */
  async isBugReportPresent({ title, severityLabel, bugTypeLabel }: BugReport) {
    let allRows = this.page.locator('.mat-row').filter({ hasText: title });

    if (severityLabel != null) {
      allRows = allRows.filter({ hasText: severityLabel });
    }

    if (bugTypeLabel != null) {
      allRows = allRows.filter({ hasText: bugTypeLabel });
    }

    return allRows.count().then((count: number) => count === 1);
  }
}
