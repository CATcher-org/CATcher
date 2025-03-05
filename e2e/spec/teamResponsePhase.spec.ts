import { expect, test } from '@playwright/test';
import { BugReportingPage } from '../page-objects/bugReporting.po';
import { LoginPage } from '../page-objects/login.po';
import { BugReport, Header } from '../page-objects/header.po';
import { TeamResponsePage } from '../page-objects/teamResponse.po';
import { TeamResponseViewIssue } from '../page-objects/teamResponseViewIssue.po';
import { Table } from '../page-objects/table.po';
import { BUG_REPORT_1, BUG_RESPONSE_1 } from '../constants/bugreports.constants';

test.describe("CATcher's Team Response Phase", () => {
  let header: Header;
  let loginPage: LoginPage;
  let viewIssuePage: TeamResponseViewIssue;
  let teamResponsePage: TeamResponsePage;
  let bugReportingPage: BugReportingPage;

  let pendingTable: Table;
  let respondedTable: Table;
  let faultyTable: Table;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    header = new Header(page);
    viewIssuePage = new TeamResponseViewIssue(page);
    teamResponsePage = new TeamResponsePage(page);
    bugReportingPage = new BugReportingPage(page);

    await loginPage.navigateToRoot();
    await loginPage.bypassAuthentication();
    await header.navigateToPhase("Team's Response Phase");

    pendingTable = new Table(page, page.getByTestId('issues-pending-table'));
    respondedTable = new Table(page, page.getByTestId('issues-responded-table'));
    faultyTable = new Table(page, page.getByTestId('issues-faulty-table'));
  });

  test(`displays "Team's Response Phase" in header bar`, async () => {
    expect(await header.getPhaseDescription()).toContain("Team's Response Phase");
  });

  test.describe('with two pre-existing issues', () => {
    test.beforeEach(async ({ page }) => {
      await header.navigateToPhase('Bug Reporting Phase');

      await bugReportingPage.createBugReport(BUG_REPORT_1);

      await header.navigateToPhase("Team's Response Phase");
    });

    test(`displays the pre-existing issue under pending`, async () => {
      const isBugReportPresent = await pendingTable.hasRow(BUG_REPORT_1);
      expect(isBugReportPresent).toEqual(true);
    });

    test(`responding to issue moves issue to responded`, async ({ page }) => {
      await pendingTable.clickRow(BUG_REPORT_1);

      await viewIssuePage.fillResponse(BUG_RESPONSE_1);

      await page.locator('.back-button').click();

      const bugReportAfterResponse: BugReport = {
        title: BUG_REPORT_1.title,
        severityLabel: BUG_RESPONSE_1.severityLabel,
        bugTypeLabel: BUG_RESPONSE_1.bugTypeLabel
      };

      const isBugReportCorrectlyMovedToRespondedTable = await respondedTable.hasRow(bugReportAfterResponse);

      expect(isBugReportCorrectlyMovedToRespondedTable).toEqual(true);
    });

    test.describe(`with responded issue`, () => {
      test.beforeEach(async ({ page }) => {
        await pendingTable.clickRow(BUG_REPORT_1);
        await viewIssuePage.fillResponse(BUG_RESPONSE_1);
        await page.locator('.back-button').click();
      });

      test(`marks issue as pending then as responded`, async () => {
        const bugReportAfterResponse: BugReport = {
          title: BUG_REPORT_1.title,
          severityLabel: BUG_RESPONSE_1.severityLabel,
          bugTypeLabel: BUG_RESPONSE_1.bugTypeLabel
        };

        const markAsPendingButton = (await respondedTable.findRow(bugReportAfterResponse)).getByTestId('mark_pending_button');
        await markAsPendingButton.click();

        const isBugReportCorrectlyMovedToPendingTable = await pendingTable.hasRow(bugReportAfterResponse);
        expect(isBugReportCorrectlyMovedToPendingTable).toEqual(true);

        const markAsRespondedButton = (await pendingTable.findRow(bugReportAfterResponse)).getByTestId('mark_responded_button');
        await markAsRespondedButton.click();

        const isBugReportCorrectlyMovedToReportedTable = await respondedTable.hasRow(bugReportAfterResponse);
        expect(isBugReportCorrectlyMovedToReportedTable).toEqual(true);
      });
    });
  });
});
