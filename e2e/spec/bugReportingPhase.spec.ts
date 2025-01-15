import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.po';
import { BugReportingPage } from '../page-objects/bugReporting.po';
import { NewIssuePage } from '../page-objects/newIssue.po';

test.describe("CATcher's Bug Reporting Phase", () => {
  let bugReportingPage: BugReportingPage;
  let loginPage: LoginPage;
  let newIssuePage: NewIssuePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bugReportingPage = new BugReportingPage(page);
    newIssuePage = new NewIssuePage(page);

    await loginPage.navigateToRoot();
    await loginPage.bypassAuthentication();
  });

  test(`displays "Bug Reporting Phase" in header bar`, async ({ page }) => {
    expect(await bugReportingPage.getPhaseDescription()).toContain('Bug Reporting Phase');
  });

  test(`creates new bug report`, async ({ page }) => {
    const testIssueCreationTitle = 'Test Issue Creation Title';
    const testIssueCreationDescription = 'Test Issue Creation Text';

    await bugReportingPage.accessNewBugReportingPage();
    await newIssuePage.enterNewIssueTitle(testIssueCreationTitle);
    await newIssuePage.enterNewBugReportDescription(testIssueCreationDescription);
    await newIssuePage.selectSeverityDropdown();
    await newIssuePage.selectDropDownOption({ dropdownText: 'Medium' });
    await newIssuePage.selectBugTypeDropdown();
    await newIssuePage.selectDropDownOption({ dropdownText: 'DocumentationBug' });
    await newIssuePage.submitBugReport();
    await page.locator('.back-button').click();

    const isBugReportCorrectlyCreated: boolean = await bugReportingPage.isBugReportPresent({
      title: testIssueCreationTitle,
      severityLabel: 'Medium',
      bugTypeLabel: 'DocumentationBug'
    });

    expect(isBugReportCorrectlyCreated).toEqual(true);
  });
});
