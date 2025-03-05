import { Page } from '@playwright/test';
import { NewIssuePage } from './newIssue.po';
import { BugReport } from './header.po';

export class BugReportingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async accessNewBugReportingPage() {
    return this.page.getByRole('button', { name: 'New Issue' }).click();
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
}
