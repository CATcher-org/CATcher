import { browser, by, element } from 'protractor';

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

  async enterNewBugReportText(input: string) {
    const textArea = element(by.className('text-input-area'));
    await textArea.clear();
    return textArea.sendKeys(input);
  }

  async selectSeverityDropdown() {
    return element(by.className('severity-dropdown')).click()
      .then(() => browser.sleep(100)); // Allow time for DOM to update. (Dropdown Selection may fail if DOM is stale)
  }

  /**
   * Selects a Mat-Option from DOM.
   * Selects first option by default.
   * @param optionNumber Mat-Option Index Number
   */
  async selectDropDownOption(optionNumber: number = 0) {
    const selectedOption =  element.all(by.className('mat-option')).get(optionNumber);
    return selectedOption.click();
  }

  async selectBugTypeDropdown() {
    return element(by.className('bug-dropdown')).click()
      .then(() => browser.sleep(100)); // Allow time for DOM to update. (Dropdown Selection may fail if DOM is stale)
  }
}
