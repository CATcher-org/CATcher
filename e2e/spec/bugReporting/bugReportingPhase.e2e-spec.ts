import { BugReportingPhase } from '../../page-objects/bugReportingPhase.po';
import { PhaseDescription } from '../../../src/app/core/services/phase.service';
import { Phase } from '../../../src/app/core/models/phase.model';
import { LoginPage } from '../../page-objects/login.po';
import { Header } from '../../page-objects/header.po';

describe('CATcher\'s Bug Reporting Page', () => {
  let bugReportingPhase: BugReportingPhase;
  let loginPage: LoginPage;
  let header: Header;

  beforeEach(() => {
    loginPage = new LoginPage();
    header = new Header();
    bugReportingPhase = new BugReportingPhase();
    loginPage.navigateToRoot();
  });

  it(`displays "${PhaseDescription[Phase.phaseBugReporting]}" in header bar`, async () => {
    await loginPage.bypassAuthentication();
    expect(await bugReportingPhase.getPhaseDescription()).toContain(PhaseDescription[Phase.phaseBugReporting]);
  });

  it('creates new bug report', async () => {
    const testIssueCreationTitle = 'Test Issue Creation Title';
    const testIssueCreationDescription = 'Test Issue Creation Text';

    await loginPage.bypassAuthentication();
    const issueCount: number = await bugReportingPhase.getNumberOfBugReports();

    await bugReportingPhase.accessNewBugReportingPage()
      .then(() => bugReportingPhase.enterNewIssueTitle(testIssueCreationTitle))
      .then(() => bugReportingPhase.enterNewBugReportDescription(testIssueCreationDescription))
      .then(() => bugReportingPhase.selectSeverityDropdown())
      .then(() => bugReportingPhase.selectDropDownOption())
      .then(() => bugReportingPhase.selectBugTypeDropdown())
      .then(() => bugReportingPhase.selectDropDownOption())
      .then(() => bugReportingPhase.submitBugReport())
      .then(() => header.clickBackButton());

    const newIssueCount: number = await bugReportingPhase.getNumberOfBugReports();
    expect(() => newIssueCount === (issueCount + 1)); // Confirm that new issue has been added to list of existing issues.
  });
});
