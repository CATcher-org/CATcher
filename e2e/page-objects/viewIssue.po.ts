import { browser, by, element, ExpectedConditions } from 'protractor';

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
    return element(by.className('severity-dropdown')).click();
  }

  async selectBugTypeDropdown() {
    return element(by.className('bug-dropdown')).click();
  }

  /**
   * Selects dropdown option from Severity or Bug Type.
   * @default Selects the first option
   * @param optionNumber Index of dropdown option
   */
  async selectDropDownOption(optionNumber: number = 0) {
    await browser.wait(ExpectedConditions.presenceOf(element(by.className('mat-option'))));
    const selectedOption =  element.all(by.className('mat-option')).get(optionNumber);
    return selectedOption.click();
  }

  async submitBugReport() {
    return element(by.className('submit-new-bug-report')).click();
  }
}
