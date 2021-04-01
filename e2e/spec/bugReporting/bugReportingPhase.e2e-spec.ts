import { BugReportingPage } from '../../page-objects/bugReporting.po';
import { PhaseDescription } from '../../../src/app/core/services/phase.service';
import { Phase } from '../../../src/app/core/models/phase.model';
import { LoginPage } from '../../page-objects/login.po';
import { Header } from '../../page-objects/header.po';
import { NewIssuePage } from '../../page-objects/newIssue.po';
import { SEVERITY_MEDIUM, TYPE_DOCUMENTATION_BUG } from '../../../tests/constants/label.constants';

describe("CATcher's Bug Reporting Phase", () => {
  let bugReportingPage: BugReportingPage;
  let loginPage: LoginPage;
  let headerComponent: Header;
  let newIssuePage: NewIssuePage;

  beforeEach(async () => {
    loginPage = new LoginPage();
    headerComponent = new Header();
    bugReportingPage = new BugReportingPage();
    newIssuePage = new NewIssuePage();
    await loginPage.navigateToRoot();
    await loginPage.bypassAuthentication();
  });

  it(`displays "${PhaseDescription[Phase.phaseBugReporting]}" in header bar`, async () => {
    expect(await bugReportingPage.getPhaseDescription()).toContain(PhaseDescription[Phase.phaseBugReporting]);
  });

  it('creates new bug report', async () => {
    const testIssueCreationTitle = 'Test Issue Creation Title';
    const testIssueCreationDescription = 'Test Issue Creation Text';

    await bugReportingPage
      .accessNewBugReportingPage()
      .then(() => newIssuePage.enterNewIssueTitle(testIssueCreationTitle))
      .then(() => newIssuePage.selectSeverityDropdown())
      .then(() => newIssuePage.selectDropDownOption({ dropdownText: SEVERITY_MEDIUM }))
      .then(() => newIssuePage.enterNewBugReportDescription(testIssueCreationDescription))
      .then(() => newIssuePage.selectBugTypeDropdown())
      .then(() => newIssuePage.selectDropDownOption({ dropdownText: TYPE_DOCUMENTATION_BUG }))
      .then(() => newIssuePage.submitBugReport())
      .then(() => headerComponent.clickBackButton());

    const isBugReportCorrectlyCreated: boolean = await bugReportingPage.isBugReportPresent({
      title: testIssueCreationTitle,
      severityLabel: SEVERITY_MEDIUM,
      bugTypeLabel: TYPE_DOCUMENTATION_BUG
    });
    expect(isBugReportCorrectlyCreated).toEqual(true); // Confirm that new issue has been added to list of existing issues.
  });
});
