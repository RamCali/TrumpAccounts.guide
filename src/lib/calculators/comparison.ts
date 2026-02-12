/**
 * Account type comparison logic.
 * Compares Trump Accounts vs 529 plans vs Roth IRA for Kids vs custodial accounts.
 */

export interface AccountComparison {
  name: string;
  annualLimit: number;
  taxOnContributions: 'after-tax' | 'pre-tax' | 'varies';
  taxOnGrowth: 'tax-deferred' | 'tax-free' | 'taxable';
  taxOnWithdrawal: string;
  investmentOptions: string;
  ageRestriction: string;
  incomeRestriction: string;
  usageRestriction: string;
  federalSeedMoney: number;
  employerContribution: boolean;
}

export const accountTypes: Record<string, AccountComparison> = {
  trumpAccount: {
    name: 'Trump Account (§530A)',
    annualLimit: 5000,
    taxOnContributions: 'after-tax',
    taxOnGrowth: 'tax-deferred',
    taxOnWithdrawal: 'Ordinary income tax (traditional IRA rules at 18)',
    investmentOptions: 'S&P 500 or broad U.S. equity index funds/ETFs only',
    ageRestriction: 'Under 18 at end of election year; converts to IRA at 18',
    incomeRestriction: 'None',
    usageRestriction: 'No withdrawals before 18 (except rollovers, excess, or death). Standard IRA rules after 18.',
    federalSeedMoney: 1000,
    employerContribution: true,
  },
  plan529: {
    name: '529 Education Savings',
    annualLimit: 18000,
    taxOnContributions: 'after-tax',
    taxOnGrowth: 'tax-free',
    taxOnWithdrawal: 'Tax-free for qualified education expenses; 10% penalty + income tax otherwise',
    investmentOptions: 'State-specific plan options (mutual funds, age-based portfolios)',
    ageRestriction: 'None',
    incomeRestriction: 'None',
    usageRestriction: 'Qualified education expenses (tuition, room, board, K-12 up to $10K/yr). Can roll to Roth IRA (limits apply).',
    federalSeedMoney: 0,
    employerContribution: false,
  },
  rothIRA: {
    name: 'Roth IRA (Custodial)',
    annualLimit: 7000,
    taxOnContributions: 'after-tax',
    taxOnGrowth: 'tax-free',
    taxOnWithdrawal: 'Tax-free on qualified distributions (age 59½ + 5-year rule)',
    investmentOptions: 'Stocks, bonds, ETFs, mutual funds — nearly unlimited',
    ageRestriction: 'Child must have earned income',
    incomeRestriction: 'MAGI limits apply ($161K single, $240K joint for 2025)',
    usageRestriction: 'Contributions can be withdrawn anytime. Earnings penalty-free at 59½.',
    federalSeedMoney: 0,
    employerContribution: false,
  },
  custodialUTMA: {
    name: 'UTMA/UGMA Custodial',
    annualLimit: 18000,
    taxOnContributions: 'after-tax',
    taxOnGrowth: 'taxable',
    taxOnWithdrawal: 'Kiddie tax on unearned income over $2,500 (2025)',
    investmentOptions: 'Stocks, bonds, ETFs, mutual funds, real estate — nearly unlimited',
    ageRestriction: 'Transfers to child at 18-25 depending on state',
    incomeRestriction: 'None',
    usageRestriction: 'Must be used for benefit of minor. Becomes child\'s asset at majority age.',
    federalSeedMoney: 0,
    employerContribution: false,
  },
};

export interface ComparisonProjection {
  accountType: string;
  year: number;
  age: number;
  balance: number;
}

/**
 * Project the growth of multiple account types side by side.
 */
export function compareAccountGrowth(params: {
  annualContribution: number;
  annualReturn: number;
  years: number;
  birthYear: number;
  includePilotDeposit: boolean;
}): ComparisonProjection[] {
  const { annualContribution, annualReturn, years, birthYear, includePilotDeposit } = params;
  const results: ComparisonProjection[] = [];

  for (const [key, account] of Object.entries(accountTypes)) {
    const cappedContribution = Math.min(annualContribution, account.annualLimit);
    let balance = key === 'trumpAccount' && includePilotDeposit ? 1000 : 0;

    for (let year = 0; year < years; year++) {
      balance = (balance + cappedContribution) * (1 + annualReturn);
      results.push({
        accountType: account.name,
        year: birthYear + year + 1,
        age: year + 1,
        balance: Math.round(balance * 100) / 100,
      });
    }
  }

  return results;
}
