import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class AccountSummaryPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private heading = this.page.getByRole('heading', { name: /Account Summary/i });
  private checkingBalance = this.page.locator('[data-testid="checking-balance"]');
  private savingsBalance = this.page.locator('[data-testid="savings-balance"]');

  // Verification methods
  async verifyAccountBalances(expectedChecking: string, expectedSavings: string): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.checkingBalance).toContainText(expectedChecking);
    await expect(this.savingsBalance).toContainText(expectedSavings);
  }
}
