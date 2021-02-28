import { BugReportingPage } from '../../page-objects/bugReporting.po';
import { PhaseDescription } from '../../../src/app/core/services/phase.service';
import { Phase } from '../../../src/app/core/models/phase.model';
import { LoginPage } from '../../page-objects/login.po';
import { Header } from '../../page-objects/header.po';
import { ViewIssuePage } from '../../page-objects/viewIssue.po';
import { SEVERITY_MEDIUM, TYPE_DOCUMENTATION_BUG } from '../../../tests/constants/label.constants';

describe('CATcher\'s Bug Reporting Phase', () => {
  let bugReportingPage: BugReportingPage;
  let loginPage: LoginPage;
  let headerComponent: Header;
  let viewIssuePage: ViewIssuePage;

  beforeEach(() => {
    loginPage = new LoginPage();
    headerComponent = new Header();
    bugReportingPage = new BugReportingPage();
    viewIssuePage = new ViewIssuePage();
    loginPage.navigateToRoot();
  });

  it(`displays "${PhaseDescription[Phase.phaseBugReporting]}" in header bar`, async () => {
    await loginPage.bypassAuthentication();
    expect(await bugReportingPage.getPhaseDescription()).toContain(PhaseDescription[Phase.phaseBugReporting]);
  });

  it('creates new bug report', async () => {
    const testIssueCreationTitle = 'Test Issue Creation Title';
    const testIssueCreationDescription = 'Test Issue Creation Text';

    await loginPage.bypassAuthentication();

    await bugReportingPage.accessNewBugReportingPage()
      .then(() => viewIssuePage.enterNewIssueTitle(testIssueCreationTitle))
      .then(() => viewIssuePage.selectSeverityDropdown())
      .then(() => viewIssuePage.selectDropDownOption({dropdownText: SEVERITY_MEDIUM}))
      .then(() => viewIssuePage.enterNewBugReportDescription(testIssueCreationDescription))
      .then(() => viewIssuePage.selectBugTypeDropdown())
      .then(() => viewIssuePage.selectDropDownOption({dropdownText: TYPE_DOCUMENTATION_BUG}))
      .then(() => viewIssuePage.submitBugReport())
      .then(() => headerComponent.clickBackButton());

    const isBugReportCorrectlyCreated: boolean = await bugReportingPage.isBugReportPresent({
      title: testIssueCreationTitle,
      severityLabel: SEVERITY_MEDIUM,
      bugTypeLabel: TYPE_DOCUMENTATION_BUG
    });
    expect(isBugReportCorrectlyCreated).toEqual(true); // Confirm that new issue has been added to list of existing issues.
  });
});
