import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { AccountSummaryPageCl } from '../../../pages/User/Accounts/AccountSummary.page.ts';

const testCases = getTestCasesByGroup('accountSummary');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';
    const loginPage = new LogInLogOutUserPortalPageCl(page);

    // 1. Log in to reach dashboard
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // 2. Validate Account Balances
    const accountsPage = new AccountSummaryPageCl(page);
    await accountsPage.verifyAccountBalances('$12,450.00', '$45,120.00');
  });
}
