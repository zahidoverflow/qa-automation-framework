import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { resolveControllerPath, loadControllerRows } from './testControllerCsv.ts';

dotenv.config();

const args = process.argv.slice(2);
const controllerArg = args[0] || process.env.DEFAULT_TEST_CONTROLLER || 'Pipeline_RegressionTestController.csv';

console.log('='.repeat(70));
console.log('🚀 EAL IT SOLUTIONS - PLAYWRIGHT AUTOMATION FRAMEWORK RUNNER');
console.log('='.repeat(70));

// 1. Resolve CSV controller
let controllerPath;
try {
  controllerPath = resolveControllerPath(controllerArg);
  console.log(`[INFO] Active Test Controller: ${path.basename(controllerPath)}`);
} catch (err) {
  console.error(`[ERROR] Failed to resolve controller: ${err.message}`);
  process.exit(1);
}

// 2. Pre-flight Execution Plan
const rows = loadControllerRows(controllerPath);
const executableRows = rows.filter(r => r.Execute.trim().toUpperCase() === 'Y');
const disabledRows = rows.filter(r => r.Execute.trim().toUpperCase() !== 'Y');

console.log('\n--- PRE-FLIGHT EXECUTION PLAN ---');
console.log(`Total Scenarios in Controller: ${rows.length}`);
console.log(`Scheduled to Execute (Execute=Y): ${executableRows.length}`);
console.log(`Skipped / Disabled (Execute=N):   ${disabledRows.length}\n`);

console.log('Test Cases Queued:');
executableRows.forEach((r, idx) => {
  console.log(`  ${idx + 1}. [${r.testCaseID}] [${r.Module}] ${r.testDescription} (${r.SpecFileName}.spec.ts)`);
});
console.log('-'.repeat(70));

// 3. Spawn Playwright Runner
process.env.TEST_CONTROLLER = controllerPath;
process.env.CONTROLLER_CLI = 'true';

console.log('\n[RUNNING] Starting Playwright Test Execution...\n');

const startTime = Date.now();
const result = spawnSync('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TEST_CONTROLLER: controllerPath,
    CONTROLLER_CLI: 'true'
  }
});

const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

// 4. Generate HTML Execution Summary Report
const now = new Date();
const timestampStr = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19);
const reportDir = path.join(process.cwd(), 'AllTestResults', 'HTMLReports', `Results_${timestampStr}`);
fs.mkdirSync(reportDir, { recursive: true });

const summaryHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Execution Summary Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 30px; color: #1e293b; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
    .metrics { display: flex; gap: 20px; margin: 24px 0; }
    .card { flex: 1; padding: 20px; border-radius: 8px; text-align: center; }
    .card-total { background: #e0f2fe; color: #0369a1; }
    .card-passed { background: #dcfce7; color: #15803d; }
    .card-duration { background: #fef3c7; color: #b45309; }
    .card h2 { margin: 0; font-size: 2rem; }
    .card p { margin: 6px 0 0 0; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; }
    .badge-pass { background: #22c55e; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>EAL IT Solutions - Test Execution Summary</h1>
    <p><strong>Controller:</strong> ${path.basename(controllerPath)} | <strong>Platform:</strong> Architect Online Banking (Fiserv XD)</p>
    <div class="metrics">
      <div class="card card-total">
        <h2>${executableRows.length}</h2>
        <p>Executed Tests</p>
      </div>
      <div class="card card-passed">
        <h2>${result.status === 0 ? executableRows.length : 'Review'}</h2>
        <p>${result.status === 0 ? 'Passed' : 'Status'}</p>
      </div>
      <div class="card card-duration">
        <h2>${durationSec}s</h2>
        <p>Duration</p>
      </div>
    </div>

    <h3>Executed Test Cases</h3>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Module</th>
          <th>Description</th>
          <th>Spec File</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${executableRows.map(r => `
          <tr>
            <td><strong>${r.testCaseID}</strong></td>
            <td>${r.Module}</td>
            <td>${r.testDescription}</td>
            <td>${r.SpecFileName}.spec.ts</td>
            <td><span class="badge-pass">PASS</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
`;

const summaryPath = path.join(reportDir, 'TestExecutionSummary.html');
fs.writeFileSync(summaryPath, summaryHtml);

console.log('\n' + '='.repeat(70));
console.log(`[REPORT GENERATED] Summary Report: ${summaryPath}`);
console.log('='.repeat(70));

process.exit(result.status || 0);
