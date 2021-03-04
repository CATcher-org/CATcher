import { by, element } from 'protractor';

export class BugReportingPage {
  async getPhaseDescription() {
    return element(by.css('app-root')).element(by.id('phase-descriptor')).getText();
  }
}
