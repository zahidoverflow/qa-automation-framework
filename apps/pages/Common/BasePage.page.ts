import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(readonly page: Page) {}

  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }
}
