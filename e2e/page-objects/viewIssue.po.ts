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
   * NOTE: There is an issue where the page data isn't updated in
   * realtime when dealing with drop-down clicks and option selection.
   * As such stringing multiple of these actions (i.e. Select Severity Dropdown,
   * Select Severity Option, Select BugType Dropdown, Select BugType option)
   * can result in the test failing as the page does not update quickly and
   * the driver receives stale data on the elements present on screen. Due
   * to the fact that mat-option is a generic classname (which we have abstracted)
   * the ExpectCondition would not accurately wait for the right dropdown list.
   * But it has still been left in the function as a precautionary measure.
   * A work-around to this is to place other actions in-between a dropdown option
   * selection action. See 'creates new bug report' for example.
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
