import { browser, by, element } from 'protractor';

export class ViewIssuePage {

  async enterNewIssueTitle(title: string) {
    return element(by.id('title')).sendKeys(title);
  }

  async enterNewBugReportDescription(desc: string) {
    const textArea = element(by.className('text-input-area'));
    await textArea.clear();
    return textArea.sendKeys(desc);
  }

  async selectSeverityDropdown() {
    return element(by.className('severity-dropdown')).click()
      .then(() => browser.sleep(100)); // Allow time for DOM to update. (Dropdown Selection may fail if DOM is stale)
  }

  async selectBugTypeDropdown() {
    return element(by.className('bug-dropdown')).click()
      .then(() => browser.sleep(100)); // Allow time for DOM to update. (Dropdown Selection may fail if DOM is stale)
  }

  /**
   * Selects dropdown option from Severity or Bug Type.
   * @default Selects the first option
   * @param optionNumber Index of dropdown option
   */
  async selectDropDownOption(optionNumber: number = 0) {
    const selectedOption =  element.all(by.className('mat-option')).get(optionNumber);
    return selectedOption.click();
  }

  async submitBugReport() {
    return element(by.className('submit-new-bug-report')).click();
  }
}
