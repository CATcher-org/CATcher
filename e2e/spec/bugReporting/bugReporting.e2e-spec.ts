import { BugReportingPage } from '../../page-objects/bugReporting.po';
import { Phase, PhaseDescription } from '../../../src/app/core/services/phase.service';
import { LoginPage } from '../../page-objects/login.po';

describe('CATcher\'s Bug Reporting Page', () => {
  let bugReportingPage: BugReportingPage;
  let loginPage: LoginPage;

  beforeEach(() => {
    loginPage = new LoginPage();
    bugReportingPage = new BugReportingPage();
    loginPage.navigateToRoot();
  });

  it(`displays "${PhaseDescription[Phase.phaseBugReporting]}" in header bar`, async () => {
    await loginPage.bypassAuthentication();
    expect(await bugReportingPage.getPhaseDescription()).toContain(PhaseDescription[Phase.phaseBugReporting]);
  });
});
