import { by, element } from 'protractor';

export class BugReportingPage {

  async getPhaseDescription() {
    return element(by.css('app-root')).element(by.id('phase-descriptor')).getText();
  }

  async accessNewBugReportingPage() {
    return element(by.className('create-new-bug-report-button')).click();
  }

  async isBugReportWithTitlePresent(title: string) {
    return element.all(by.className('mat-row')).filter(async (element, index) => {
      const elementText: string = await element.getText();
      return elementText.includes(title);
    }).count();
  }
}
