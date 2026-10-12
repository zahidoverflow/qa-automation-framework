import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class AccountActivityPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private heading = this.page.getByRole('heading', { name: /Account Activity & History/i });
  private transactionsTable = this.page.locator('table');
  private allFilterBtn = this.page.getByRole('link', { name: /^All$/i });
  private creditsFilterBtn = this.page.getByRole('link', { name: /^Credits$/i });
  private debitsFilterBtn = this.page.getByRole('link', { name: /^Debits$/i });
  private transactionRows = this.page.locator('.tx-row');

  // Action methods
  async navigateToActivity(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/activity`);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCredits(): Promise<void> {
    await this.creditsFilterBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByDebits(): Promise<void> {
    await this.debitsFilterBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions
  async verifyActivityTableLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.transactionsTable).toBeVisible();
    const count = await this.transactionRows.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyOnlyCreditTransactions(): Promise<void> {
    const count = await this.transactionRows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const rowText = await this.transactionRows.nth(i).innerText();
      expect(rowText).toContain('Credit');
      expect(rowText).not.toContain('Debit');
    }
  }
}
