import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage.page.ts';

export class LogInLogOutUserPortalPageCl extends BasePage {
  constructor(readonly page: Page) {
    super(page);
  }

  // Locators defined as class properties (following framework guidelines)
  private usernameInput = this.page.getByLabel('Username');
  private passwordInput = this.page.getByLabel('Password');
  private signInButton = this.page.getByRole('button', { name: /Sign In/i });
  private errorMessage = this.page.locator('.alert-error');
  private signOutLink = this.page.getByRole('link', { name: /Sign Out/i });
  private logoutNotice = this.page.locator('.alert-notice');

  // Action methods
  async LogIn_UserPortal(url: string, username: string, password: string): Promise<void> {
    await this.page.goto(url);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async LogOut_UserPortal(): Promise<void> {
    await this.signOutLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Verification methods
  async verifyLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/i);
    await expect(this.page.getByRole('heading', { name: /Account Summary/i })).toBeVisible();
  }

  async verifyLoginFailed(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText('Invalid username or password');
  }

  async verifyLoggedOut(): Promise<void> {
    await expect(this.logoutNotice).toBeVisible();
    await expect(this.logoutNotice).toContainText('You have been safely signed out.');
  }
}
