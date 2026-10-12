import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { ManagePayeesPageCl } from '../../../pages/User/Payees/ManagePayeesPage.page.ts';

const testCases = getTestCasesByGroup('managePayees');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const payeesPage = new ManagePayeesPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    // Authenticate
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // Navigate to Payees module
    await payeesPage.navigateToPayees(portalUrl);

    if (data.testCaseID === 'TC-849101') {
      // Dynamic payee addition
      const uniquePayee = `SolarEnergy_Grid_${Date.now()}`;
      await payeesPage.addPayee(uniquePayee, '1122334455', 'Solar Energy');
      await payeesPage.verifyPayeeInList(uniquePayee);
    } else if (data.testCaseID === 'TC-849102') {
      // Missing required field validation
      await payeesPage.addPayee('', '');
      await payeesPage.verifyPayeeError('Payee name and account number are required');
    }
  });
}
