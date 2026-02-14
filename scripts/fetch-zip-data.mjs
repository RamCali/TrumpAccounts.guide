#!/usr/bin/env node
/**
 * Fetches median household income by ZIP code from the Census Bureau ACS 5-Year Estimates.
 * Outputs a compact JSON file for use in the grant eligibility checker.
 *
 * Data source: American Community Survey (ACS) 5-Year Estimates
 * Variable: B19013_001E (Median Household Income)
 * Geography: ZIP Code Tabulation Areas (ZCTAs)
 *
 * Usage: node scripts/fetch-zip-data.mjs
 */

const ACS_URL =
  'https://api.census.gov/data/2022/acs/acs5?get=B19013_001E&for=zip%20code%20tabulation%20area:*';

async function main() {
  console.log('Fetching median household income data from Census Bureau...');
  console.log(`URL: ${ACS_URL}\n`);

  const res = await fetch(ACS_URL);
  if (!res.ok) {
    throw new Error(`Census API returned ${res.status}: ${res.statusText}`);
  }

  const raw = await res.json();

  // First row is the header: ["B19013_001E", "zip code tabulation area"]
  const rows = raw.slice(1);

  // Build a compact object: { "00601": 17526, ... }
  // Skip entries where income is negative (Census uses -666666666 for missing data)
  const data = {};
  let skipped = 0;

  for (const [income, zip] of rows) {
    const incomeNum = parseInt(income, 10);
    if (incomeNum < 0 || isNaN(incomeNum)) {
      skipped++;
      continue;
    }
    data[zip] = incomeNum;
  }

  const count = Object.keys(data).length;
  console.log(`Processed ${rows.length} ZIP codes`);
  console.log(`  Valid: ${count}`);
  console.log(`  Skipped (no data): ${skipped}`);

  const json = JSON.stringify(data);
  const sizeKB = (Buffer.byteLength(json) / 1024).toFixed(0);
  console.log(`\nOutput size: ${sizeKB} KB`);

  const { writeFileSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, '../src/data/zip-median-income.json');

  writeFileSync(outPath, json + '\n');
  console.log(`Written to: ${outPath}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
