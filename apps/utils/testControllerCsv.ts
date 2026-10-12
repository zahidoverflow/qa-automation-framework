import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { readCSVFile } from './csvReader.ts';

dotenv.config();

export interface TestControllerRow {
  Execute: string;
  testCaseID: string;
  testDescription: string;
  SpecFileName: string;
  Module: string;
}

const ROOT_DIR = process.cwd();

export function resolveControllerPath(controllerArg?: string): string {
  const target = controllerArg || process.env.TEST_CONTROLLER || process.env.DEFAULT_TEST_CONTROLLER || 'Pipeline_RegressionTestController.csv';
  
  if (path.isAbsolute(target) && fs.existsSync(target)) {
    return target;
  }

  const normalized = target.endsWith('.csv') ? target : `${target}.csv`;
  const potentialPaths = [
    path.join(ROOT_DIR, 'apps', 'test-controllers', normalized),
    path.join(ROOT_DIR, normalized)
  ];

  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(`Controller CSV could not be resolved: ${target}`);
}

export function loadControllerRows(customPath?: string): TestControllerRow[] {
  const filePath = customPath || resolveControllerPath();
  return readCSVFile<TestControllerRow>(filePath);
}

export function getExecutableTestMatchPatterns(): string[] {
  const rows = loadControllerRows();
  const activeSpecs = new Set<string>();

  for (const row of rows) {
    if (row.Execute.trim().toUpperCase() === 'Y' && row.SpecFileName) {
      activeSpecs.add(`**/${row.SpecFileName}.spec.ts`);
    }
  }

  return Array.from(activeSpecs);
}

export function getExecutableTestCaseGrep(): RegExp {
  const rows = loadControllerRows();
  const activeIds: string[] = [];

  for (const row of rows) {
    if (row.Execute.trim().toUpperCase() === 'Y' && row.testCaseID) {
      activeIds.push(row.testCaseID.trim());
    }
  }

  if (activeIds.length === 0) {
    return /$^/; // Matches nothing if no active tests
  }

  return new RegExp(activeIds.join('|'));
}

export function getTestCasesByGroup(specFileName: string): TestControllerRow[] {
  const rows = loadControllerRows();
  return rows.filter(r => r.SpecFileName.trim() === specFileName.trim());
}
