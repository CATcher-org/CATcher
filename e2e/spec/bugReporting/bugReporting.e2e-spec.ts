import { BugReportingPage } from '../../page-objects/bugReporting.po';
import { PhaseDescription } from '../../../src/app/core/services/phase.service';
import { Phase } from '../../../src/app/core/models/phase.model';
import { LoginPage } from '../../page-objects/login.po';

describe("CATcher's Bug Reporting Page", () => {
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
