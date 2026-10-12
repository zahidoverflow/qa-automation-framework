import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { BillPayPageCl } from '../../../pages/User/BillPay/BillPayPage.page.ts';

const testCases = getTestCasesByGroup('billPay');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const billPayPage = new BillPayPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    // Authenticate
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // Navigate to Bill Pay
    await billPayPage.navigateToBillPay(portalUrl);

    if (data.testCaseID === 'TC-819301') {
      // Valid bill payment submission
      await billPayPage.schedulePayment('Electric Utility Corp (Acct: ...4321)', '145.50', '2026-10-25');
      await billPayPage.verifyPaymentSuccess('Bill payment of $145.50 to Electric Utility Corp scheduled');
    } else if (data.testCaseID === 'TC-819302') {
      // Amount validation
      await billPayPage.schedulePayment('Electric Utility Corp (Acct: ...4321)', '0');
      await billPayPage.verifyPaymentError('Payment amount must be greater than zero');
    }
  });
}
