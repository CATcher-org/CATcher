import { expect, Page } from '@playwright/test';

type DropdownOptionProps = {
  optionNumber: number;
  dropdownText: string;
};

export class NewIssuePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async enterNewIssueTitle(title: string) {
    return this.page.locator('#title').fill(title);
  }

  async enterNewBugReportDescription(desc: string) {
    const textArea = this.page.locator('.text-input-area');
    await textArea.focus();
    await textArea.clear();
    return textArea.fill(desc);
  }

  async selectSeverityDropdown() {
    return this.page.locator('.severity-dropdown').click();
  }

  async selectBugTypeDropdown() {
    return this.page.locator('.bug-dropdown').click();
  }

  async selectDropDownOption({ optionNumber, dropdownText }: Partial<DropdownOptionProps>) {
    if (optionNumber != null && dropdownText != null) {
      throw new Error('Supply either Dropdown option number or text, not both.');
    } else if (optionNumber == null && dropdownText == null) {
      throw new Error('No Dropdown identification parameters supplied.');
    }

    await expect(this.page.getByRole('listbox')).toBeVisible();
    const selectedOption =
      optionNumber != null ? this.selectDropwdownByOption(optionNumber) : this.selectDropdownByText(dropdownText as string);
    await selectedOption.click();
    return expect(this.page.getByRole('listbox')).toBeHidden();
  }

  private selectDropwdownByOption(optionNumber: number) {
    return this.page.locator('.mat-option').nth(optionNumber);
  }

  private selectDropdownByText(dropdownText: string) {
    return this.page.locator('mat-option').getByText(dropdownText, { exact: true });
  }

  async submitBugReport() {
    return this.page.locator('.submit-new-bug-report').click();
  }
}
