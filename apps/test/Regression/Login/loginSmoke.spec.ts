import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';

const testCases = getTestCasesByGroup('loginSmoke');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    if (data.testCaseID === 'TC-472895') {
      // Valid credentials scenario
      await loginPage.LogIn_UserPortal(
        portalUrl,
        process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
        process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
      );
      await loginPage.verifyLoggedIn();
    } else if (data.testCaseID === 'TC-472896') {
      // Invalid credentials scenario
      await loginPage.LogIn_UserPortal(
        portalUrl,
        'invalid.user@example.com',
        'WrongPassword999!'
      );
      await loginPage.verifyLoginFailed();
    }
  });
}
