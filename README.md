# EAL IT Solutions - Playwright Test Automation Framework

A production-grade, CSV-driven, data-centric Playwright test automation framework built for **Architect Online Banking (Fiserv XD)** platform testing.

---

## 🎯 Architecture Overview

```text
root/
├── package.json                          ← npm scripts (npm test <controller.csv>)
├── playwright.config.ts                  ← Playwright configuration with dynamic CSV filtering
├── tsconfig.json                         ← TypeScript compiler configuration
├── .env                                  ← Environment secrets and default controller
│
├── apps/
│   ├── utils/                            ← Core framework utilities
│   │   ├── runTests.mjs                  ← Main orchestrator with Pre-flight plan & HTML report
│   │   ├── testControllerCsv.ts          ← Controller resolver, Execute=Y filtering, data loader
│   │   ├── csvReader.ts                  ← Fast CSV parser utility
│   │   └── CommonFunctions.ts            ← Shared test & navigation helpers
│   │
│   ├── test-controllers/                 ← CSV Test execution controllers
│   │   └── Pipeline_RegressionTestController.csv
│   │
│   ├── pages/                            ← Page Object Models (POM)
│   │   ├── Common/
│   │   │   ├── BasePage.page.ts          ← Base page class
│   │   │   └── LogInLogOutUserPortal.page.ts ← LogInLogOutUserPortalPageCl
│   │   └── User/
│   │       └── Accounts/
│   │           └── AccountSummary.page.ts ← AccountSummaryPageCl
│   │
│   └── test/                             ← Test Specifications
│       └── Regression/
│           ├── Login/
│           │   └── loginSmoke.spec.ts    ← Dynamic data-driven login test suite
│           └── Accounts/
│               └── accountSummary.spec.ts← Dynamic account balance validation suite
│
├── mock-app/                             ← Self-contained mock banking portal
│   └── server.mjs                        ← Auto-spawned by Playwright webServer
│
├── AllTestResults/                       ← Generated execution reports
│   └── HTMLReports/                      ← Timestamped summary reports
│
└── .github/
    └── workflows/
        └── regression-tests.yml          ← Multi-matrix CI/CD pipeline
```

---

## 🚀 How to Run Tests

### 1. Execute via Test Controller CSV (Default)
```bash
npm test Pipeline_RegressionTestController.csv
```

### 2. Execution Flow
1. **CLI Parsing**: `runTests.mjs` receives the CSV argument and resolves its full path.
2. **Pre-Flight Execution Plan**: Scans rows, counts `Execute=Y` vs `N`, and validates specs before browser launch.
3. **Dynamic Filtering**: `playwright.config.ts` configures `testMatch` and `grep` based on `Execute=Y` rows.
4. **Data Injection**: Each `.spec.ts` calls `getTestCasesByGroup('<SpecFileName>')` to generate dynamic tests.
5. **Auto Server**: Playwright's `webServer` automatically launches the portal at `http://127.0.0.1:3000`.
6. **Execution & Reporting**: Tests run in parallel workers, generating Playwright trace reports and a standalone `TestExecutionSummary.html`.

---

## 📝 Coding Standards & Best Practices

1. **Page Object Classes**:
   - Must use `Cl` suffix (e.g. `LogInLogOutUserPortalPageCl`).
   - Must use `constructor(readonly page: Page)`.
   - Locators defined at top of class using semantic locators (`getByRole`, `getByLabel`, `getByText`).
   - Action methods separated from Verification methods.
   - All methods must be `async` and return `Promise<void>`.
2. **No Hardcoded Sleeps**:
   - Strictly avoid `page.waitForTimeout()`.
   - Rely on Playwright auto-waiting or `page.waitForLoadState('networkidle')`.
3. **Adding a New Test Case**:
   - 1. Create `apps/test/Regression/<Module>/<specName>.spec.ts`.
   - 2. Implement POM in `apps/pages/<Module>/<PageName>.page.ts`.
   - 3. Add row in `Pipeline_RegressionTestController.csv`:
     ```csv
     Execute,testCaseID,testDescription,SpecFileName,Module
     Y,TC-XXXXXX,Description of test case,specName,Module
     ```
   - 4. Run `npm test Pipeline_RegressionTestController.csv`.
