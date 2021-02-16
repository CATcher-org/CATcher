import { BugReportingPhase } from '../../page-objects/bugReportingPhase.po';
import { PhaseDescription } from '../../../src/app/core/services/phase.service';
import { Phase } from '../../../src/app/core/models/phase.model';
import { LoginPage } from '../../page-objects/login.po';
import { browser } from 'protractor';

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
    await bugReportingPhase.accessNewBugReportingPage()
      .then(() => bugReportingPhase.enterNewIssueTitle('Test Issue Creation Title'));
    browser.sleep(100000); // Added Temporarily to Visualize Actions TODO: Remove after task completion.
  });
});
