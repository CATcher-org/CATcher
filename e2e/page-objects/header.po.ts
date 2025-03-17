import { Page } from '@playwright/test';

export interface BugReport {
  title: string;
  body?: string;
  severityLabel: string;
  bugTypeLabel: string;
}

export class Header {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToPhase(phase: string) {
    await this.page.getByRole('button').filter({ hasText: 'expand_more' }).click();
    return this.page.getByRole('menuitem', { name: phase }).click();
  }

  async getPhaseDescription() {
    return this.page.locator('app-layout-header').textContent();
  }
}
