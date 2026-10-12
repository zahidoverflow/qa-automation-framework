import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getExecutableTestMatchPatterns, getExecutableTestCaseGrep } from './apps/utils/testControllerCsv.ts';

dotenv.config();

const controllerCli = process.env.CONTROLLER_CLI === 'true';
const directSpecRun = process.env.RUN_SPEC_DIRECTLY === 'true';
const applyControllerFilter = controllerCli && !directSpecRun;

const config = defineConfig({
  testDir: './apps/test',
  timeout: 30000,
  fullyParallel: process.env.TEST_PARALLEL === 'true',
  workers: process.env.TEST_PARALLEL_WORKERS ? parseInt(process.env.TEST_PARALLEL_WORKERS, 10) : 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'AllTestResults/test-results.json' }],
    ['html', { outputFolder: 'apps/playwright-report', open: 'never' }]
  ],
  use: {
    headless: true,
    baseURL: process.env.USER_PORTAL_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'node mock-app/server.mjs',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 10000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

if (applyControllerFilter) {
  config.testMatch = getExecutableTestMatchPatterns();
  config.grep = getExecutableTestCaseGrep();
}

export default config;
