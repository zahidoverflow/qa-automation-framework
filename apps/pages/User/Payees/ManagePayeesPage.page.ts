import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class ManagePayeesPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private payeeNameInput = this.page.locator('#payeeName');
  private accountNumberInput = this.page.locator('#accountNumber');
  private categoryInput = this.page.locator('#category');
  private submitButton = this.page.getByRole('button', { name: /Add Payee/i });
  private payeesTable = this.page.locator('table');
  private errorAlert = this.page.locator('.alert-error');

  // Action methods
  async navigateToPayees(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/payees`);
    await this.page.waitForLoadState('networkidle');
  }

  async addPayee(payeeName: string, accountNumber: string, category: string = 'Utilities'): Promise<void> {
    await this.payeeNameInput.fill(payeeName);
    await this.accountNumberInput.fill(accountNumber);
    await this.categoryInput.fill(category);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions
  async verifyPayeeInList(payeeName: string): Promise<void> {
    const row = this.payeesTable.locator('tr', { hasText: payeeName });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Active');
  }

  async verifyPayeeError(expectedSnippet: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(expectedSnippet);
  }
}
