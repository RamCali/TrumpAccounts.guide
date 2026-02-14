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
  // Enhanced fields (populated by calculateEnhancedGrowth)
  personalContributions?: number;
  employerContributions?: number;
  effectiveCapForYear?: number;
  taxFreeBasis?: number;
  taxableBalance?: number;
  expenseDeducted?: number;
}

export interface GrowthResult {
  totalContributions: number;
  totalEarnings: number;
  finalBalance: number;
  snapshots: YearlySnapshot[];
  // Enhanced fields (populated by calculateEnhancedGrowth)
  totalPersonalContributions?: number;
  totalEmployerContributions?: number;
  taxFreeBasis?: number;
  taxableAtConversion?: number;
  totalExpensesPaid?: number;
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

// ─── Cost of Waiting ─────────────────────────────────────────

export interface CostOfWaitingInput {
  startAge1: number;
  startAge2: number;
  monthlyContribution: number;
  annualReturn: number;
  pilotDeposit: number;
  birthYear: number;
}

export interface CostOfWaitingResult {
  scenario1: GrowthResult;
  scenario2: GrowthResult;
  difference: number;
  percentageLost: number;
}

/**
 * Compare two start-age scenarios side by side.
 * Pilot deposit only applies if birthYear is 2025-2028.
 */
export function calculateCostOfWaiting(input: CostOfWaitingInput): CostOfWaitingResult {
  const { startAge1, startAge2, monthlyContribution, annualReturn, pilotDeposit, birthYear } = input;
  const hasPilot = birthYear >= 2025 && birthYear <= 2028;

  const scenario1 = calculateGrowth({
    birthYear,
    pilotDeposit: hasPilot ? pilotDeposit : 0,
    monthlyContribution,
    annualReturn,
    startAge: startAge1,
    endAge: 18,
  });

  const scenario2 = calculateGrowth({
    birthYear,
    pilotDeposit: hasPilot ? pilotDeposit : 0,
    monthlyContribution,
    annualReturn,
    startAge: startAge2,
    endAge: 18,
  });

  const difference = scenario1.finalBalance - scenario2.finalBalance;
  const percentageLost = scenario1.finalBalance > 0
    ? (difference / scenario1.finalBalance) * 100
    : 0;

  return { scenario1, scenario2, difference, percentageLost };
}

// ─── Milestones ──────────────────────────────────────────────

export interface MilestoneTarget {
  amount: number;
  label: string;
  ageReached: number | null;
  yearReached: number | null;
}

export interface MilestonesResult {
  milestones: MilestoneTarget[];
  growthData: GrowthResult;
}

const MILESTONE_TARGETS = [
  { amount: 10_000, label: '$10K' },
  { amount: 25_000, label: '$25K' },
  { amount: 50_000, label: '$50K' },
  { amount: 100_000, label: '$100K' },
  { amount: 250_000, label: '$250K' },
  { amount: 500_000, label: '$500K' },
  { amount: 1_000_000, label: '$1M' },
];

/**
 * Find the age at which the account crosses each milestone.
 * Projects to age 65 (lifetime growth through IRA conversion).
 */
export function calculateMilestones(input: {
  monthlyContribution: number;
  annualReturn: number;
  pilotDeposit: number;
  birthYear: number;
  showLifetime?: boolean;
}): MilestonesResult {
  const { monthlyContribution, annualReturn, pilotDeposit, birthYear, showLifetime = true } = input;
  const hasPilot = birthYear >= 2025 && birthYear <= 2028;

  const growthData = showLifetime
    ? calculateLifetimeGrowth({
        birthYear,
        pilotDeposit: hasPilot ? pilotDeposit : 0,
        monthlyContribution,
        annualReturn,
        retirementAge: 65,
        postIRAContribution: 0,
      })
    : calculateGrowth({
        birthYear,
        pilotDeposit: hasPilot ? pilotDeposit : 0,
        monthlyContribution,
        annualReturn,
        endAge: 18,
      });

  const milestones: MilestoneTarget[] = MILESTONE_TARGETS.map(({ amount, label }) => {
    const snapshot = growthData.snapshots.find((s) => s.endBalance >= amount);
    return {
      amount,
      label,
      ageReached: snapshot ? snapshot.age : null,
      yearReached: snapshot ? snapshot.year : null,
    };
  });

  return { milestones, growthData };
}

// ─── Inflation Comparison ────────────────────────────────────

export interface InflationComparisonYear {
  year: number;
  savingsBalance: number;
  savingsPurchasingPower: number;
  investmentBalance: number;
  investmentPurchasingPower: number;
}

export interface InflationComparisonResult {
  years: InflationComparisonYear[];
  savingsFinalBalance: number;
  savingsFinalPurchasingPower: number;
  investmentFinalBalance: number;
  investmentFinalPurchasingPower: number;
  purchasingPowerLostInSavings: number;
  investmentAdvantage: number;
}

/**
 * Compare a savings account vs a Trump Account (index fund)
 * over time, adjusted for inflation purchasing power.
 */
export function calculateInflationComparison(input: {
  initialAmount: number;
  years: number;
  inflationRate: number;
  savingsAPY: number;
  investmentReturn: number;
}): InflationComparisonResult {
  const { initialAmount, years, inflationRate, savingsAPY, investmentReturn } = input;

  let savingsBalance = initialAmount;
  let investmentBalance = initialAmount;
  const yearData: InflationComparisonYear[] = [];

  for (let y = 1; y <= years; y++) {
    savingsBalance = savingsBalance * (1 + savingsAPY);
    investmentBalance = investmentBalance * (1 + investmentReturn);

    const inflationFactor = Math.pow(1 + inflationRate, y);

    yearData.push({
      year: y,
      savingsBalance: Math.round(savingsBalance * 100) / 100,
      savingsPurchasingPower: Math.round((savingsBalance / inflationFactor) * 100) / 100,
      investmentBalance: Math.round(investmentBalance * 100) / 100,
      investmentPurchasingPower: Math.round((investmentBalance / inflationFactor) * 100) / 100,
    });
  }

  const last = yearData[yearData.length - 1];

  return {
    years: yearData,
    savingsFinalBalance: last.savingsBalance,
    savingsFinalPurchasingPower: last.savingsPurchasingPower,
    investmentFinalBalance: last.investmentBalance,
    investmentFinalPurchasingPower: last.investmentPurchasingPower,
    purchasingPowerLostInSavings: Math.round((initialAmount - last.savingsPurchasingPower) * 100) / 100,
    investmentAdvantage: Math.round((last.investmentPurchasingPower - last.savingsPurchasingPower) * 100) / 100,
  };
}

// ─── Enhanced Growth Calculator ─────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface EnhancedGrowthInput extends PhasedGrowthInput {
  inflationAdjustCap?: boolean;
  inflationRate?: number;
  inflationIndexStartYear?: number;
  annualEmployerContribution?: number;
  dellPledgeAmount?: number;
  expenseRatio?: number;
}

/**
 * Get the inflation-adjusted annual contribution cap for a given year.
 * IRS typically rounds indexed limits to the nearest $50.
 */
export function getEffectiveCap(
  year: number,
  baseCap: number,
  inflationAdjust: boolean,
  inflationRate: number,
  inflationIndexStartYear: number,
): number {
  if (!inflationAdjust || year <= inflationIndexStartYear) return baseCap;
  const yearsOfInflation = year - inflationIndexStartYear;
  return Math.round((baseCap * Math.pow(1 + inflationRate, yearsOfInflation)) / 50) * 50;
}

/**
 * Get annual contribution split into personal and employer amounts.
 * Employer is applied first, personal fills the remaining cap.
 */
function getAnnualContributionDetailed(
  age: number,
  year: number,
  phases: ContributionPhase[],
  annualEmployer: number,
  effectiveCap: number,
): { personal: number; employer: number; total: number } {
  let personal = 0;
  for (const phase of phases) {
    if (age >= phase.fromAge && age < phase.toAge) {
      personal = phase.monthlyAmount * 12;
      break;
    }
  }

  const cappedEmployer = Math.min(annualEmployer, effectiveCap);
  const cappedPersonal = Math.min(personal, effectiveCap - cappedEmployer);
  const total = cappedPersonal + cappedEmployer;

  return { personal: cappedPersonal, employer: cappedEmployer, total };
}

/**
 * Enhanced compound growth calculation with inflation-adjusted cap,
 * employer contributions, Dell Pledge, expense ratio, and tax basis tracking.
 */
export function calculateEnhancedGrowth(input: EnhancedGrowthInput): GrowthResult {
  const {
    birthYear,
    pilotDeposit,
    phases,
    annualReturn,
    startAge = 0,
    endAge = 18,
    inflationAdjustCap = false,
    inflationRate = 0.025,
    inflationIndexStartYear = 2027,
    annualEmployerContribution = 0,
    dellPledgeAmount = 0,
    expenseRatio = 0,
  } = input;

  const baseCap = MAX_ANNUAL_CONTRIBUTION;
  const initialSeed = pilotDeposit + dellPledgeAmount;
  let balance = initialSeed;
  let totalContributions = initialSeed;
  let totalEarnings = 0;
  let totalPersonal = 0;
  let totalEmployer = 0;
  let totalExpenses = 0;
  let taxFreeBasis = 0;
  let taxableAccum = initialSeed;

  const snapshots: YearlySnapshot[] = [];

  for (let age = startAge; age < endAge; age++) {
    const year = birthYear + age + 1;
    const effectiveCap = getEffectiveCap(
      year, baseCap, inflationAdjustCap, inflationRate, inflationIndexStartYear,
    );

    const startBalance = balance;
    const { personal, employer, total } = getAnnualContributionDetailed(
      age, year, phases, annualEmployerContribution, effectiveCap,
    );

    const netReturn = annualReturn - expenseRatio;
    const earnings = (startBalance + total) * netReturn;
    const expenseCost = (startBalance + total) * expenseRatio;

    balance = startBalance + total + earnings;
    totalContributions += total;
    totalPersonal += personal;
    totalEmployer += employer;
    totalEarnings += earnings;
    totalExpenses += expenseCost;

    taxFreeBasis += personal;
    taxableAccum += employer + earnings;

    snapshots.push({
      age: age + 1,
      year,
      startBalance: round2(startBalance),
      contributions: round2(total),
      earnings: round2(earnings),
      endBalance: round2(balance),
      personalContributions: round2(personal),
      employerContributions: round2(employer),
      effectiveCapForYear: effectiveCap,
      taxFreeBasis: round2(taxFreeBasis),
      taxableBalance: round2(taxableAccum),
      expenseDeducted: round2(expenseCost),
    });
  }

  return {
    totalContributions: round2(totalContributions),
    totalEarnings: round2(totalEarnings),
    finalBalance: round2(balance),
    snapshots,
    totalPersonalContributions: round2(totalPersonal),
    totalEmployerContributions: round2(totalEmployer),
    taxFreeBasis: round2(taxFreeBasis),
    taxableAtConversion: round2(balance - taxFreeBasis),
    totalExpensesPaid: round2(totalExpenses),
  };
}

/**
 * Enhanced lifetime growth: Trump Account (birth–18) then Traditional IRA (18–retirement).
 */
export function calculateEnhancedLifetimeGrowth(input: EnhancedGrowthInput & {
  postIRAContribution?: number;
  retirementAge?: number;
}): GrowthResult {
  const { postIRAContribution = 0, retirementAge = 65, ...baseInput } = input;

  const phase1 = calculateEnhancedGrowth({ ...baseInput, endAge: 18 });

  let balance = phase1.finalBalance;
  let totalContributions = phase1.totalContributions;
  let totalEarnings = phase1.totalEarnings;
  let totalExpenses = phase1.totalExpensesPaid ?? 0;
  const snapshots = [...phase1.snapshots];

  const netReturn = baseInput.annualReturn - (baseInput.expenseRatio ?? 0);
  const er = baseInput.expenseRatio ?? 0;

  for (let age = 18; age < retirementAge; age++) {
    const startBalance = balance;
    const contribution = postIRAContribution;
    const earnings = (startBalance + contribution) * netReturn;
    const expenseCost = (startBalance + contribution) * er;

    balance = startBalance + contribution + earnings;
    totalContributions += contribution;
    totalEarnings += earnings;
    totalExpenses += expenseCost;

    snapshots.push({
      age: age + 1,
      year: baseInput.birthYear + age + 1,
      startBalance: round2(startBalance),
      contributions: round2(contribution),
      earnings: round2(earnings),
      endBalance: round2(balance),
      expenseDeducted: round2(expenseCost),
    });
  }

  return {
    totalContributions: round2(totalContributions),
    totalEarnings: round2(totalEarnings),
    finalBalance: round2(balance),
    snapshots,
    totalPersonalContributions: phase1.totalPersonalContributions,
    totalEmployerContributions: phase1.totalEmployerContributions,
    taxFreeBasis: phase1.taxFreeBasis,
    taxableAtConversion: round2(balance - (phase1.taxFreeBasis ?? 0)),
    totalExpensesPaid: round2(totalExpenses),
  };
}
