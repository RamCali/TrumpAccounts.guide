import zipData from '../../data/zip-median-income.json';
import grantsData from '../../data/grants.json';

export interface Grant {
  id: string;
  name: string;
  organization: string;
  amount: number;
  amountLabel: string;
  description: string;
  eligibility: {
    maxMedianIncome: number;
    maxAge: number;
    maxAgeLabel: string;
    requiresCitizenship: boolean;
  };
  source: string;
  announcedDate: string;
  notes: string;
}

export interface GrantResult {
  grant: Grant;
  eligible: boolean;
  reason: string;
}

export interface ZipLookupResult {
  zip: string;
  found: boolean;
  medianIncome: number | null;
  grants: GrantResult[];
  totalEligibleAmount: number;
}

const incomeByZip = zipData as Record<string, number>;

/**
 * Look up a ZIP code and check eligibility for all known grants.
 */
export function checkGrantEligibility(zip: string): ZipLookupResult {
  const normalized = zip.trim().padStart(5, '0');
  const income = incomeByZip[normalized];
  const found = income !== undefined;

  const grants: GrantResult[] = (grantsData.grants as Grant[]).map((grant) => {
    if (!found) {
      return {
        grant,
        eligible: false,
        reason: `ZIP code ${normalized} was not found in Census data. It may be a PO Box, military, or very new ZIP code.`,
      };
    }

    if (income > grant.eligibility.maxMedianIncome) {
      return {
        grant,
        eligible: false,
        reason: `Median household income ($${income.toLocaleString()}) exceeds the $${grant.eligibility.maxMedianIncome.toLocaleString()} threshold.`,
      };
    }

    return {
      grant,
      eligible: true,
      reason: `Median household income ($${income.toLocaleString()}) is below the $${grant.eligibility.maxMedianIncome.toLocaleString()} threshold.`,
    };
  });

  return {
    zip: normalized,
    found,
    medianIncome: found ? income : null,
    grants,
    totalEligibleAmount: grants
      .filter((g) => g.eligible)
      .reduce((sum, g) => sum + g.grant.amount, 0),
  };
}

/**
 * Returns the Census data source description for attribution.
 */
export function getDataSource(): string {
  return grantsData.dataSource;
}
