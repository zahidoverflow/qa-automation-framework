import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class BillPayPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private payeeSelect = this.page.locator('#payee');
  private payDateInput = this.page.locator('#payDate');
  private amountInput = this.page.locator('#amount');
  private submitButton = this.page.getByRole('button', { name: /Submit Payment/i });
  private successAlert = this.page.locator('.alert-success');
  private errorAlert = this.page.locator('.alert-error');

  // Action methods
  async navigateToBillPay(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/billpay`);
    await this.page.waitForLoadState('networkidle');
  }

  async schedulePayment(payee: string, amount: string, date?: string): Promise<void> {
    await this.payeeSelect.selectOption({ label: payee });
    if (date) {
      await this.payDateInput.fill(date);
    }
    await this.amountInput.fill(amount);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions
  async verifyPaymentSuccess(expectedSnippet: string): Promise<void> {
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toContainText(expectedSnippet);
  }

  async verifyPaymentError(expectedSnippet: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(expectedSnippet);
  }
}
