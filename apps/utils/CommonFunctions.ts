import { Page } from '@playwright/test';

export class CommonFunctions {
  static async navigateWithWait(page: Page, url: string): Promise<void> {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  }

  static async takeScreenshotOnFailure(page: Page, testName: string): Promise<void> {
    const timestamp = Date.now();
    await page.screenshot({ path: `AllTestResults/screenshots/${testName}_${timestamp}.png`, fullPage: true });
  }
}
