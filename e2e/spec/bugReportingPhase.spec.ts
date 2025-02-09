import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.po';
import { BugReportingPage } from '../page-objects/bugReporting.po';
import { NewIssuePage } from '../page-objects/newIssue.po';
import { ViewIssuePage } from '../page-objects/viewIssue.po';

test.describe("CATcher's Bug Reporting Phase", () => {
  let bugReportingPage: BugReportingPage;
  let loginPage: LoginPage;
  let newIssuePage: NewIssuePage;
  let viewIssuePage: ViewIssuePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bugReportingPage = new BugReportingPage(page);
    newIssuePage = new NewIssuePage(page);
    viewIssuePage = new ViewIssuePage(page);

    await loginPage.navigateToRoot();
    await loginPage.bypassAuthentication();
  });

  test(`displays "Bug Reporting Phase" in header bar`, async ({ page }) => {
    expect(await bugReportingPage.getPhaseDescription()).toContain('Bug Reporting Phase');
  });

  test(`creates new bug report`, async ({ page }) => {
    const testIssueCreationTitle = 'Test Issue Creation Title';
    const testIssueCreationBody = 'Test Issue Creation Text';
    const testIssueCreationSeverity = 'Medium';
    const testIssueCreationType = 'DocumentationBug';

    await bugReportingPage.createBugReport({
      title: testIssueCreationTitle,
      body: testIssueCreationBody,
      severityLabel: testIssueCreationSeverity,
      bugTypeLabel: testIssueCreationType
    });

    const isBugReportCorrectlyCreated: boolean = await bugReportingPage.isBugReportPresent({
      title: testIssueCreationTitle,
      severityLabel: testIssueCreationSeverity,
      bugTypeLabel: testIssueCreationType
    });

    expect(isBugReportCorrectlyCreated).toEqual(true);
  });

  test.describe('with a pre-existing issue', () => {
    const preexistingIssueTitle = 'Preexisting Issue Title';
    const preexistingIssueBody = 'Preexisting Issue Body';
    const preexistingIssueSeverity = 'Low';
    const preexistingIssueType = 'FeatureFlaw';

    test.beforeEach(async ({ page }) => {
      await bugReportingPage.createBugReport({
        title: preexistingIssueTitle,
        body: preexistingIssueBody,
        severityLabel: preexistingIssueSeverity,
        bugTypeLabel: preexistingIssueType
      });
    });

    test(`edits a bug report`, async ({ page }) => {
      const edittedIssueTitle = 'Editted Issue Title';
      const edittedIssueBody = 'Editted Issue Body';
      const edittedIssueSeverity = 'High';
      const edittedIssueType = 'FunctionalityBug';

      await bugReportingPage.accessViewIssuePage({
        title: preexistingIssueTitle,
        severityLabel: preexistingIssueSeverity,
        bugTypeLabel: preexistingIssueType
      });

      await viewIssuePage.editIssueTitle(edittedIssueTitle);
      await viewIssuePage.editIssueSeverity(edittedIssueSeverity);
      await viewIssuePage.editIssueType(edittedIssueType);
      await viewIssuePage.editIssueDescription(edittedIssueBody);

      await page.locator('.back-button').click();

      const isBugReportCorrectlyEditted: boolean = await bugReportingPage.isBugReportPresent({
        title: edittedIssueTitle,
        severityLabel: edittedIssueSeverity,
        bugTypeLabel: edittedIssueType
      });

      expect(isBugReportCorrectlyEditted).toEqual(true);
    });

    test(`closes a bug report`, async ({ page }) => {
      await bugReportingPage.deleteBugReport({
        title: preexistingIssueTitle,
        severityLabel: preexistingIssueSeverity,
        bugTypeLabel: preexistingIssueType
      });

      const isBugReportDeleted: boolean = !(await bugReportingPage.isBugReportPresent({
        title: preexistingIssueTitle,
        severityLabel: preexistingIssueSeverity,
        bugTypeLabel: preexistingIssueType
      }));

      expect(isBugReportDeleted).toEqual(true);
    });

    test(`search finds bug report`, async ({ page }) => {
      await bugReportingPage.search(preexistingIssueTitle);

      const isBugReportFound: boolean = await bugReportingPage.isBugReportPresent({
        title: preexistingIssueTitle,
        severityLabel: preexistingIssueSeverity,
        bugTypeLabel: preexistingIssueType
      });

      expect(isBugReportFound).toEqual(true);
    });

    test(`search does not find bug report`, async ({ page }) => {
      const otherIssueTitle = 'Other Issue Title';
      await bugReportingPage.search(otherIssueTitle);

      const isBugReportNotFound: boolean = !(await bugReportingPage.isBugReportPresent({
        title: preexistingIssueTitle,
        severityLabel: preexistingIssueSeverity,
        bugTypeLabel: preexistingIssueType
      }));

      expect(isBugReportNotFound).toEqual(true);
    });
  });
});
