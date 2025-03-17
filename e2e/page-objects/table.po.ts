import { Locator, Page } from '@playwright/test';

export interface TableBugReport {
  title: string;
  severityLabel: string;
  bugTypeLabel: string;
}

export class Table {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page, table: Locator) {
    this.page = page;
    this.table = table;
  }

  async hasRow(bugReport: TableBugReport) {
    // it seems that webkit and firefox require this timeout. If not, the table will not be loaded by the time we are searching for the rows.
    await this.page.waitForTimeout(500);
    const filteredRows = await this.findRow(bugReport);
    return filteredRows.count().then((count: number) => count === 1);
  }

  async findRow({ title, severityLabel, bugTypeLabel }: TableBugReport) {
    const filteredRows = await this.table
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: title }) })
      .filter({ has: this.page.getByRole('cell', { name: severityLabel }) })
      .filter({ has: this.page.getByRole('cell', { name: bugTypeLabel }) });

    return filteredRows;
  }

  async clickRow(bugReport: TableBugReport) {
    return (await this.findRow(bugReport)).click();
  }

  async clearSearch() {
    return this.table.getByLabel('Search').clear();
  }

  async search(searchString: string) {
    return this.table.getByLabel('Search').type(searchString);
  }

  /**
   * Deletes a bug report
   */
  async deleteBugReport(bugReport: TableBugReport) {
    const tableEntry = await this.findRow(bugReport);
    return tableEntry.getByTestId('delete_issue_button').click();
  }
}
