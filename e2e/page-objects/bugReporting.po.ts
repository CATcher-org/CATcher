import { by, element } from 'protractor';

export class BugReportingPage {
  async getPhaseDescription() {
    return element(by.css('app-root')).element(by.id('phase-descriptor')).getText();
  }

  async accessNewBugReportingPage() {
    return element(by.className('create-new-bug-report-button')).click();
  }

  /**
   * Identifies a Bug-Report based on the provided parameters.
   * @param title Title of Bug-Report.
   * @param severityLabel Severity assigned to Bug-Report.
   * @param bugTypeLabel Bug-Report's Type.
   * @returns true if a unique Bug-Report is present, false otherwise.
   */
  async isBugReportPresent({ title, severityLabel, bugTypeLabel }: { title: string; severityLabel?: string; bugTypeLabel?: string }) {
    return element
      .all(by.className('mat-row'))
      .filter(async (element, index) => {
        // Obtain Bug-Report Element's data
        const titleText: string = await element.getText();
        const severityText = await element.element(by.className('mat-column-severity')).getText();
        const responseText = await element.element(by.className('mat-column-type')).getText();

        // Compare based on provided information
        return (
          titleText.includes(title) &&
          (severityLabel == null ? severityText.includes(severityLabel) : true) &&
          (bugTypeLabel == null ? responseText.includes(bugTypeLabel) : true)
        );
      })
      .count()
      .then((count: number) => count === 1);
  }
}
