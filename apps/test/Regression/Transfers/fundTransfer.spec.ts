import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { TransfersPageCl } from '../../../pages/User/Transfers/TransfersPage.page.ts';

const testCases = getTestCasesByGroup('fundTransfer');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const transfersPage = new TransfersPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    // Pre-requisite: Authenticate
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // Navigate to Transfers module
    await transfersPage.navigateToTransfers(portalUrl);

    if (data.testCaseID === 'TC-619201') {
      // Valid funds transfer
      await transfersPage.executeTransfer('checking', 'savings', '250.00');
      await transfersPage.verifyTransferSuccess('Transfer of $250.00 completed successfully.');
    } else if (data.testCaseID === 'TC-619202') {
      // Transfer exceeding checking account limit
      await transfersPage.executeTransfer('checking', 'savings', '999999.00');
      await transfersPage.verifyTransferError('Transfer amount exceeds available checking balance');
    }
  });
}
