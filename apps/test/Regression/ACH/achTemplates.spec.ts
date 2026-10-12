import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { TemplatesPageCl } from '../../../pages/User/ACH/TemplatesPage.page.ts';

const testCases = getTestCasesByGroup('achTemplates');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const templatesPage = new TemplatesPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    // Pre-requisite: Authenticate
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // Navigate to ACH Templates module
    await templatesPage.navigateToTemplates(portalUrl);

    if (data.testCaseID === 'TC-728101') {
      // Dynamic ACH template creation (Question 13 pattern: unique name per execution run)
      const createdName = await templatesPage.createTemplate(
        'Payroll_Corp_Auto',
        'Bi-weekly direct deposit disbursement template'
      );
      await templatesPage.verifyTemplateInList(createdName);
    }
  });
}
