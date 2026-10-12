import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class TransfersPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private fromAccountSelect = this.page.locator('#fromAccount');
  private toAccountSelect = this.page.locator('#toAccount');
  private amountInput = this.page.locator('#amount');
  private submitButton = this.page.getByRole('button', { name: /Execute Transfer/i });
  private successAlert = this.page.locator('.alert-success');
  private errorAlert = this.page.locator('.alert-error');

  // Action methods
  async navigateToTransfers(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/transfers`);
    await this.page.waitForLoadState('networkidle');
  }

  async executeTransfer(fromAccount: string, toAccount: string, amount: string): Promise<void> {
    await this.fromAccountSelect.selectOption(fromAccount);
    await this.toAccountSelect.selectOption(toAccount);
    await this.amountInput.fill(amount);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions (kept separate from actions per framework best practices)
  async verifyTransferSuccess(expectedSnippet: string): Promise<void> {
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toContainText(expectedSnippet);
  }

  async verifyTransferError(expectedSnippet: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(expectedSnippet);
  }
}
