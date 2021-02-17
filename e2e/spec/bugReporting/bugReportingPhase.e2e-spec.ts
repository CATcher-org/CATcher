import { BugReportingPhase } from '../../page-objects/bugReportingPhase.po';
import { PhaseDescription } from '../../../src/app/core/services/phase.service';
import { Phase } from '../../../src/app/core/models/phase.model';
import { LoginPage } from '../../page-objects/login.po';

describe('CATcher\'s Bug Reporting Page', () => {
  let bugReportingPhase: BugReportingPhase;
  let loginPage: LoginPage;

  beforeEach(() => {
    loginPage = new LoginPage();
    bugReportingPhase = new BugReportingPhase();
    loginPage.navigateToRoot();
  });

  it(`displays "${PhaseDescription[Phase.phaseBugReporting]}" in header bar`, async () => {
    await loginPage.bypassAuthentication();
    expect(await bugReportingPhase.getPhaseDescription()).toContain(PhaseDescription[Phase.phaseBugReporting]);
  });

  it('creates new bug report', async () => {
    await loginPage.bypassAuthentication();
    const issueCount: number = await bugReportingPhase.getNumberOfBugReports();

    await bugReportingPhase.accessNewBugReportingPage()
      .then(() => bugReportingPhase.enterNewIssueTitle('Test Issue Creation Title'))
      .then(() => bugReportingPhase.enterNewBugReportText('Test Issue Creation Text'))
      .then(() => bugReportingPhase.selectSeverityDropdown())
      .then(() => bugReportingPhase.selectDropDownOption())
      .then(() => bugReportingPhase.selectBugTypeDropdown())
      .then(() => bugReportingPhase.selectDropDownOption())
      .then(() => bugReportingPhase.submitBugReport())
      .then(() => bugReportingPhase.clickBackButton());

    const newIssueCount: number = await bugReportingPhase.getNumberOfBugReports();
    expect(() => newIssueCount === (issueCount + 1)); // Confirm that new issue has been added to list of existing issues.
  });
});
