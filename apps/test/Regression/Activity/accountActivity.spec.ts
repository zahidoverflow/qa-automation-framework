import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { AccountActivityPageCl } from '../../../pages/User/Activity/AccountActivityPage.page.ts';

const testCases = getTestCasesByGroup('accountActivity');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const activityPage = new AccountActivityPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    // Authenticate
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // Navigate to Activity
    await activityPage.navigateToActivity(portalUrl);

    if (data.testCaseID === 'TC-958201') {
      // Activity history table presence
      await activityPage.verifyActivityTableLoaded();
    } else if (data.testCaseID === 'TC-958202') {
      // Filtering by credits
      await activityPage.filterByCredits();
      await activityPage.verifyOnlyCreditTransactions();
    }
  });
}
