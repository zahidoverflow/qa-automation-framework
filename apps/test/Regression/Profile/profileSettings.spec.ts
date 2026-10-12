import { test } from '@playwright/test';
import { getTestCasesByGroup } from '../../../utils/testControllerCsv.ts';
import { LogInLogOutUserPortalPageCl } from '../../../pages/Common/LogInLogOutUserPortal.page.ts';
import { ProfileSettingsPageCl } from '../../../pages/User/Profile/ProfileSettingsPage.page.ts';

const testCases = getTestCasesByGroup('profileSettings');

for (const data of testCases) {
  test(`${data.testCaseID}: ${data.testDescription}`, async ({ page }) => {
    const loginPage = new LogInLogOutUserPortalPageCl(page);
    const profilePage = new ProfileSettingsPageCl(page);
    const portalUrl = process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000';

    // Authenticate
    await loginPage.LogIn_UserPortal(
      portalUrl,
      process.env.USER_PORTAL_USERNAME || 'testuser@example.com',
      process.env.USER_PORTAL_PASSWORD || 'SecurePassword123!'
    );
    await loginPage.verifyLoggedIn();

    // Navigate to Profile
    await profilePage.navigateToProfile(portalUrl);

    if (data.testCaseID === 'TC-928401') {
      // Valid preference update
      await profilePage.updateContactPreferences('alex.updated@corpdomain.com', '555-888-9999', true);
      await profilePage.verifyProfileSuccess('Contact preferences updated successfully');
    } else if (data.testCaseID === 'TC-928402') {
      // Invalid email validation
      await profilePage.updateContactPreferences('invalid-email-string', '555-888-9999', false);
      await profilePage.verifyProfileError('Please enter a valid email address');
    }
  });
}
