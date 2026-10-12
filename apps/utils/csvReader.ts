import fs from 'node:fs';

export function readCSVFile<T = Record<string, string>>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });
    rows.push(rowObj as T);
  }

  return rows;
}
