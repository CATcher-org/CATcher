import { by, element } from 'protractor';

export class BugReportingPhase {

  async getPhaseDescription() {
    return element(by.css('app-root')).element(by.id('phase-descriptor')).getText();
  }

  async accessNewBugReportingPage() {
    return element(by.className('create-new-bug-report-button')).click();
  }

  async enterNewIssueTitle(title: string) {
    return element(by.id('title')).sendKeys(title);
  }
}
