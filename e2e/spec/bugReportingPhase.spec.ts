import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.po';
import { BugReportingPage } from '../page-objects/bugReporting.po';
import { BugReportingViewIssuePage } from '../page-objects/bugReportingViewIssue.po';
import { Header } from '../page-objects/header.po';
import { Table } from '../page-objects/table.po';
import { BUG_REPORT_1, BUG_REPORT_2 } from '../constants/bugreports.constants';

test.describe("CATcher's Bug Reporting Phase", () => {
  let bugReportingPage: BugReportingPage;
  let loginPage: LoginPage;
  let header: Header;
  let viewIssuePage: BugReportingViewIssuePage;
  let postedTable: Table;
  let deletedTable: Table;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    header = new Header(page);
    bugReportingPage = new BugReportingPage(page);
    viewIssuePage = new BugReportingViewIssuePage(page);

    await loginPage.navigateToRoot();
    await loginPage.bypassAuthentication();

    postedTable = new Table(page, page.getByTestId('app-issues-posted'));
    deletedTable = new Table(page, page.getByTestId('app-issues-deleted'));
  });

  test(`displays "Bug Reporting Phase" in header bar`, async ({ page }) => {
    expect(await header.getPhaseDescription()).toContain('Bug Reporting Phase');
  });

  test(`creates new bug report`, async ({ page }) => {
    await bugReportingPage.createBugReport(BUG_REPORT_1);
    const isBugReportCorrectlyCreated: boolean = await postedTable.hasRow(BUG_REPORT_1);
    expect(isBugReportCorrectlyCreated).toEqual(true);
  });

  test.describe('with a pre-existing issue', () => {
    test.beforeEach(async ({ page }) => {
      await bugReportingPage.createBugReport(BUG_REPORT_1);
    });

    test(`edits a bug report`, async ({ page }) => {
      await postedTable.clickRow(BUG_REPORT_1);

      await viewIssuePage.editIssueTitle(BUG_REPORT_2.title);
      await viewIssuePage.editIssueSeverity(BUG_REPORT_2.severityLabel);
      await viewIssuePage.editIssueType(BUG_REPORT_2.bugTypeLabel);
      await viewIssuePage.editIssueDescription(BUG_REPORT_2.body!);

      await page.locator('.back-button').click();

      const isBugReportCorrectlyEditted: boolean = await postedTable.hasRow(BUG_REPORT_2);
      expect(isBugReportCorrectlyEditted).toEqual(true);
    });

    test(`closes a bug report`, async () => {
      await postedTable.deleteBugReport(BUG_REPORT_1);
      const isBugReportDeleted: boolean = !(await postedTable.hasRow(BUG_REPORT_1));
      expect(isBugReportDeleted).toEqual(true);

      const isBugReportMovedToDeletedTable: boolean = await deletedTable.hasRow(BUG_REPORT_1);
      expect(isBugReportMovedToDeletedTable).toEqual(true);
    });

    test(`searching with title finds bug report`, async () => {
      await postedTable.search(BUG_REPORT_1.title);
      const isBugReportFound: boolean = await postedTable.hasRow(BUG_REPORT_1);
      expect(isBugReportFound).toEqual(true);

      await postedTable.deleteBugReport(BUG_REPORT_1);
      await deletedTable.search(BUG_REPORT_1.title);
      const isBugReportFoundInDeletedTable: boolean = await deletedTable.hasRow(BUG_REPORT_1);
      expect(isBugReportFoundInDeletedTable).toEqual(true);
    });

    test(`searching with arbitrary string does not find bug report`, async () => {
      const otherIssueTitle = 'Other Issue Title';

      await postedTable.search(otherIssueTitle);
      const isBugReportNotFound: boolean = !(await postedTable.hasRow(BUG_REPORT_1));
      expect(isBugReportNotFound).toEqual(true);

      await postedTable.clearSearch();
      await postedTable.deleteBugReport(BUG_REPORT_1);
      await deletedTable.search(otherIssueTitle);
      const isBugReportNotFoundInDeletedTable: boolean = !(await postedTable.hasRow(BUG_REPORT_1));
      expect(isBugReportNotFoundInDeletedTable).toEqual(true);
    });
  });
});
