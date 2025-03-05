import { Page } from '@playwright/test';
import { Table, TableBugReport } from './table.po';

export interface BugResponse {
  body: string;
  severityLabel: string;
  bugTypeLabel: string;
  assignees: string[];
  responseLabel: string;
}

export class TeamResponsePage {
  readonly page: Page;

  readonly pendingTable: Table;

  constructor(page: Page) {
    this.page = page;
  }
}
