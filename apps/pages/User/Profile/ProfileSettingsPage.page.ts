import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class ProfileSettingsPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private fullNameInput = this.page.locator('#fullName');
  private emailInput = this.page.locator('#email');
  private phoneInput = this.page.locator('#phone');
  private paperlessCheckbox = this.page.locator('#paperless');
  private submitButton = this.page.getByRole('button', { name: /Update Preferences/i });
  private successAlert = this.page.locator('.alert-success');
  private errorAlert = this.page.locator('.alert-error');

  // Action methods
  async navigateToProfile(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/profile`);
    await this.page.waitForLoadState('networkidle');
  }

  async updateContactPreferences(email: string, phone: string, paperless: boolean): Promise<void> {
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    if (paperless) {
      await this.paperlessCheckbox.check();
    } else {
      await this.paperlessCheckbox.uncheck();
    }
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions
  async verifyProfileSuccess(expectedSnippet: string): Promise<void> {
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toContainText(expectedSnippet);
  }

  async verifyProfileError(expectedSnippet: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(expectedSnippet);
  }
}
