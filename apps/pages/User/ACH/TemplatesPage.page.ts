import { Page, expect } from '@playwright/test';
import { BasePage } from '../../Common/BasePage.page.ts';

export class TemplatesPageCl extends BasePage {
  // Public property storing dynamically created template name (Question 13 pattern)
  public createdTemplateName: string = '';

  constructor(readonly page: Page) {
    super(page);
  }

  // Locators
  private templateNameInput = this.page.locator('#templateName');
  private descriptionInput = this.page.locator('#description');
  private saveButton = this.page.getByRole('button', { name: /Save Template/i });
  private templatesTable = this.page.locator('table');

  // Action methods
  async navigateToTemplates(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/ach/templates`);
    await this.page.waitForLoadState('networkidle');
  }

  async createTemplate(prefix: string, description: string): Promise<string> {
    const timestamp = Date.now();
    this.createdTemplateName = `${prefix}_${timestamp}`;

    await this.templateNameInput.fill(this.createdTemplateName);
    await this.descriptionInput.fill(description);
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');

    return this.createdTemplateName;
  }

  // Assertions
  async verifyTemplateInList(templateName?: string): Promise<void> {
    const nameToVerify = templateName || this.createdTemplateName;
    const row = this.templatesTable.locator('tr', { hasText: nameToVerify });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Active');
  }
}
