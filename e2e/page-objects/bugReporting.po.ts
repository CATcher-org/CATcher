import { by, element } from 'protractor';

export class BugReportingPage {

  async getPhaseDescription() {
    return element(by.css('app-root')).element(by.id('phase-descriptor')).getText();
  }

  async accessNewBugReportingPage() {
    return element(by.className('create-new-bug-report-button')).click();
  }

  async getNumberOfBugReports() {
    return element.all(by.className('tr')).count();
  }
}
