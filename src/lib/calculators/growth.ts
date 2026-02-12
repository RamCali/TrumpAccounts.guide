/**
 * Compound growth calculations for Trump Account projections.
 * All functions are pure — no UI or side effects.
 */

export interface GrowthInput {
  birthYear: number;
  pilotDeposit: number;
  monthlyContribution: number;
  annualReturn: number;
  startAge?: number;
  endAge?: number;
}

export interface YearlySnapshot {
  age: number;
  year: number;
  startBalance: number;
  contributions: number;
  earnings: number;
  endBalance: number;
}

export interface GrowthResult {
  totalContributions: number;
  totalEarnings: number;
  finalBalance: number;
  snapshots: YearlySnapshot[];
}

/**
 * Calculate compound growth of a Trump Account from birth to a target age.
 * Uses annual compounding with monthly contributions converted to annual.
 */
export function calculateGrowth(input: GrowthInput): GrowthResult {
  const {
    birthYear,
    pilotDeposit,
    monthlyContribution,
    annualReturn,
    startAge = 0,
    endAge = 18,
  } = input;

  const annualContribution = monthlyContribution * 12;
  const maxAnnualContribution = 5000;
  const cappedAnnualContribution = Math.min(annualContribution, maxAnnualContribution);

  let balance = pilotDeposit;
  let totalContributions = pilotDeposit;
  let totalEarnings = 0;
  const snapshots: YearlySnapshot[] = [];

  for (let age = startAge; age < endAge; age++) {
    const startBalance = balance;
    const contribution = cappedAnnualContribution;
    const earnings = (startBalance + contribution) * annualReturn;

    balance = startBalance + contribution + earnings;
    totalContributions += contribution;
    totalEarnings += earnings;

    snapshots.push({
      age: age + 1,
      year: birthYear + age + 1,
      startBalance: Math.round(startBalance * 100) / 100,
      contributions: Math.round(contribution * 100) / 100,
      earnings: Math.round(earnings * 100) / 100,
      endBalance: Math.round(balance * 100) / 100,
    });
  }

  return {
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    finalBalance: Math.round(balance * 100) / 100,
    snapshots,
  };
}

/**
 * Calculate projected value at age 65 (for "Millionaire Baby" scenario).
 * After age 18, account converts to traditional IRA.
 * Assumes continued contributions up to IRA limits post-18.
 */
export function calculateLifetimeGrowth(input: GrowthInput & {
  postIRAContribution?: number;
  retirementAge?: number;
}): GrowthResult {
  const { postIRAContribution = 0, retirementAge = 65, ...baseInput } = input;

  // Phase 1: Birth to 18 (Trump Account)
  const phase1 = calculateGrowth({ ...baseInput, endAge: 18 });

  // Phase 2: 18 to retirement (Traditional IRA)
  let balance = phase1.finalBalance;
  let totalContributions = phase1.totalContributions;
  let totalEarnings = phase1.totalEarnings;
  const snapshots = [...phase1.snapshots];

  for (let age = 18; age < retirementAge; age++) {
    const startBalance = balance;
    const contribution = postIRAContribution;
    const earnings = (startBalance + contribution) * baseInput.annualReturn;

    balance = startBalance + contribution + earnings;
    totalContributions += contribution;
    totalEarnings += earnings;

    snapshots.push({
      age: age + 1,
      year: baseInput.birthYear + age + 1,
      startBalance: Math.round(startBalance * 100) / 100,
      contributions: Math.round(contribution * 100) / 100,
      earnings: Math.round(earnings * 100) / 100,
      endBalance: Math.round(balance * 100) / 100,
    });
  }

  return {
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    finalBalance: Math.round(balance * 100) / 100,
    snapshots,
  };
}
