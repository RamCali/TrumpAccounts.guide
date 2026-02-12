/**
 * Tax impact calculations for Trump Account withdrawals.
 * Trump Accounts convert to traditional IRA at age 18.
 * Withdrawals are taxed as ordinary income.
 */

export interface WithdrawalScenario {
  age: number;
  balance: number;
  withdrawalAmount: number;
  taxableAmount: number;
  federalTax: number;
  earlyWithdrawalPenalty: number;
  netAmount: number;
  effectiveTaxRate: number;
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

/**
 * Calculate federal income tax on a given amount using progressive brackets.
 */
export function calculateFederalTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): number {
  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketMax = bracket.max ?? Infinity;
    const bracketWidth = bracketMax - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Calculate the net withdrawal amount after taxes and penalties.
 * Before 18: No withdrawals allowed (except rollovers, excess, death).
 * 18-59½: Traditional IRA rules — ordinary income tax + 10% early withdrawal penalty.
 * 59½+: Ordinary income tax only, no penalty.
 */
export function calculateWithdrawal(params: {
  age: number;
  balance: number;
  withdrawalAmount: number;
  otherIncome: number;
  filingStatus: 'single' | 'marriedFilingJointly';
  brackets: TaxBracket[];
}): WithdrawalScenario {
  const { age, balance, withdrawalAmount, otherIncome, filingStatus, brackets } = params;

  const actualWithdrawal = Math.min(withdrawalAmount, balance);
  const taxableAmount = actualWithdrawal; // All traditional IRA withdrawals are taxable

  // Calculate tax on the withdrawal (considering other income pushes into higher brackets)
  const totalTax = calculateFederalTax(otherIncome + taxableAmount, brackets);
  const baseTax = calculateFederalTax(otherIncome, brackets);
  const incrementalTax = totalTax - baseTax;

  // Early withdrawal penalty: 10% if under 59.5
  const earlyWithdrawalPenalty = age < 59.5 ? actualWithdrawal * 0.10 : 0;

  const netAmount = actualWithdrawal - incrementalTax - earlyWithdrawalPenalty;
  const effectiveTaxRate = actualWithdrawal > 0
    ? (incrementalTax + earlyWithdrawalPenalty) / actualWithdrawal
    : 0;

  return {
    age,
    balance: Math.round(balance * 100) / 100,
    withdrawalAmount: Math.round(actualWithdrawal * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    federalTax: Math.round(incrementalTax * 100) / 100,
    earlyWithdrawalPenalty: Math.round(earlyWithdrawalPenalty * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10000) / 10000,
  };
}

/**
 * Generate withdrawal scenarios at multiple ages to show the impact of waiting.
 */
export function generateWithdrawalTimeline(params: {
  currentBalance: number;
  annualReturn: number;
  otherIncome: number;
  filingStatus: 'single' | 'marriedFilingJointly';
  brackets: TaxBracket[];
  withdrawalPercentage: number;
}): WithdrawalScenario[] {
  const { currentBalance, annualReturn, otherIncome, filingStatus, brackets, withdrawalPercentage } = params;
  const ages = [18, 21, 25, 30, 35, 40, 50, 59.5, 65];
  const scenarios: WithdrawalScenario[] = [];

  for (const age of ages) {
    // Project balance to this age (assuming starting at 18)
    const yearsOfGrowth = age - 18;
    const projectedBalance = currentBalance * Math.pow(1 + annualReturn, yearsOfGrowth);
    const withdrawalAmount = projectedBalance * withdrawalPercentage;

    scenarios.push(
      calculateWithdrawal({
        age,
        balance: projectedBalance,
        withdrawalAmount,
        otherIncome,
        filingStatus,
        brackets,
      }),
    );
  }

  return scenarios;
}

/**
 * Calculate the expense ratio "leakage" over time for fund comparison.
 */
export function calculateExpenseLeakage(params: {
  initialBalance: number;
  annualContribution: number;
  annualReturn: number;
  expenseRatio: number;
  years: number;
}): { year: number; balanceWithFees: number; balanceWithoutFees: number; cumulativeLeakage: number }[] {
  const { initialBalance, annualContribution, annualReturn, expenseRatio, years } = params;
  const results: { year: number; balanceWithFees: number; balanceWithoutFees: number; cumulativeLeakage: number }[] = [];

  let balanceWithFees = initialBalance;
  let balanceWithoutFees = initialBalance;

  for (let year = 1; year <= years; year++) {
    balanceWithFees = (balanceWithFees + annualContribution) * (1 + annualReturn - expenseRatio);
    balanceWithoutFees = (balanceWithoutFees + annualContribution) * (1 + annualReturn);

    results.push({
      year,
      balanceWithFees: Math.round(balanceWithFees * 100) / 100,
      balanceWithoutFees: Math.round(balanceWithoutFees * 100) / 100,
      cumulativeLeakage: Math.round((balanceWithoutFees - balanceWithFees) * 100) / 100,
    });
  }

  return results;
}
