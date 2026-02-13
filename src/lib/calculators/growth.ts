/**
 * Compound growth calculations for Trump Account projections.
 * All functions are pure — no UI or side effects.
 */

export interface ContributionPhase {
  fromAge: number;
  toAge: number;
  monthlyAmount: number;
}

export interface GrowthInput {
  birthYear: number;
  pilotDeposit: number;
  monthlyContribution: number;
  annualReturn: number;
  startAge?: number;
  endAge?: number;
}

export interface PhasedGrowthInput {
  birthYear: number;
  pilotDeposit: number;
  phases: ContributionPhase[];
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

const MAX_ANNUAL_CONTRIBUTION = 5000;

/**
 * Get annual contribution for a given age based on phases.
 * Caps at $5,000/year. If no phase covers this age, returns 0.
 */
function getAnnualContribution(age: number, phases: ContributionPhase[]): number {
  for (const phase of phases) {
    if (age >= phase.fromAge && age < phase.toAge) {
      return Math.min(phase.monthlyAmount * 12, MAX_ANNUAL_CONTRIBUTION);
    }
  }
  return 0;
}

/**
 * Calculate compound growth with variable contribution phases.
 * Each phase defines a monthly contribution for a range of ages.
 */
export function calculatePhasedGrowth(input: PhasedGrowthInput): GrowthResult {
  const {
    birthYear,
    pilotDeposit,
    phases,
    annualReturn,
    startAge = 0,
    endAge = 18,
  } = input;

  let balance = pilotDeposit;
  let totalContributions = pilotDeposit;
  let totalEarnings = 0;
  const snapshots: YearlySnapshot[] = [];

  for (let age = startAge; age < endAge; age++) {
    const startBalance = balance;
    const contribution = getAnnualContribution(age, phases);
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
 * Calculate compound growth of a Trump Account from birth to a target age.
 * Uses annual compounding with a single monthly contribution amount.
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

  return calculatePhasedGrowth({
    birthYear,
    pilotDeposit,
    phases: [{ fromAge: startAge, toAge: endAge, monthlyAmount: monthlyContribution }],
    annualReturn,
    startAge,
    endAge,
  });
}

/**
 * Calculate projected value at age 65 (for "Millionaire Baby" scenario).
 * After age 18, account converts to traditional IRA.
 * Supports phased contributions during growth phase.
 */
export function calculatePhasedLifetimeGrowth(input: PhasedGrowthInput & {
  postIRAContribution?: number;
  retirementAge?: number;
}): GrowthResult {
  const { postIRAContribution = 0, retirementAge = 65, ...baseInput } = input;

  // Phase 1: Start age to 18 (Trump Account)
  const phase1 = calculatePhasedGrowth({ ...baseInput, endAge: 18 });

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

/**
 * Calculate projected value at age 65 with a single monthly contribution.
 * Backwards-compatible wrapper around calculatePhasedLifetimeGrowth.
 */
export function calculateLifetimeGrowth(input: GrowthInput & {
  postIRAContribution?: number;
  retirementAge?: number;
}): GrowthResult {
  const { postIRAContribution = 0, retirementAge = 65, monthlyContribution, startAge = 0, ...rest } = input;

  return calculatePhasedLifetimeGrowth({
    ...rest,
    startAge,
    phases: [{ fromAge: startAge, toAge: 18, monthlyAmount: monthlyContribution }],
    postIRAContribution,
    retirementAge,
  });
}
