/**
 * Roth conversion calculator logic for Trump Account → Traditional IRA → Roth IRA.
 * Models the pro rata rule, standard deduction chunking, and multi-year conversion strategies.
 * All functions are pure — no UI or side effects.
 */

// ─── Types ──────────────────────────────────────────────────

export interface RothConversionInput {
  /** Total Trump Account balance at age 18 */
  accountBalance: number;
  /** Total after-tax (nondeductible) contributions made to the Trump Account */
  totalContributions: number;
  /** Child's annual earned income (part-time job, etc.) */
  annualEarnedIncome: number;
  /** Standard deduction for the conversion year (default: $15,000 est. for ~2035) */
  standardDeduction: number;
  /** Number of years to spread the conversion over */
  conversionYears: number;
  /** Expected annual return during conversion period */
  annualReturn: number;
  /** Tax brackets: array of { min, max, rate } */
  taxBrackets: TaxBracket[];
  /** Expected annual return after full conversion (for Roth projection) */
  rothGrowthRate: number;
  /** Target retirement age for Roth projection */
  retirementAge: number;
  /** Child's age at conversion start (default: 18) */
  startAge: number;
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface ConversionYearResult {
  year: number;
  age: number;
  /** Amount converted in this year */
  conversionAmount: number;
  /** Non-taxable portion (return of basis) */
  nonTaxableAmount: number;
  /** Taxable portion (growth) */
  taxableAmount: number;
  /** Standard deduction applied */
  standardDeduction: number;
  /** Taxable income after standard deduction */
  taxableIncome: number;
  /** Federal tax owed */
  taxOwed: number;
  /** Effective tax rate on conversion */
  effectiveRate: number;
  /** Running total converted to Roth */
  cumulativeConverted: number;
  /** Remaining traditional IRA balance */
  remainingBalance: number;
  /** Balance grows during conversion period */
  balanceAtStartOfYear: number;
}

export interface RothConversionResult {
  /** Year-by-year conversion details */
  yearlyResults: ConversionYearResult[];
  /** Total amount converted to Roth */
  totalConverted: number;
  /** Total tax paid across all years */
  totalTaxPaid: number;
  /** Overall effective tax rate */
  overallEffectiveRate: number;
  /** Pro rata basis percentage (nondeductible %) */
  basisPercentage: number;
  /** Taxable percentage (growth %) */
  taxablePercentage: number;
  /** Projected Roth IRA value at retirement */
  rothValueAtRetirement: number;
  /** Projected traditional IRA value at retirement (for comparison) */
  traditionalValueAtRetirement: number;
  /** Tax on traditional IRA withdrawal at retirement (est. 22% bracket) */
  traditionalTaxAtRetirement: number;
  /** Net after-tax value if kept as traditional IRA */
  traditionalNetAtRetirement: number;
  /** Tax savings from Roth conversion vs keeping traditional */
  taxSavings: number;
}

// ─── Helpers ────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate federal income tax using progressive brackets.
 */
export function calculateTax(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let remaining = taxableIncome;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketWidth = bracket.max !== null ? bracket.max - bracket.min : Infinity;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return round2(tax);
}

/**
 * Calculate the maximum conversion amount that keeps taxable income
 * at or below a target (e.g., standard deduction for zero tax).
 */
export function maxConversionForZeroTax(
  basisPercentage: number,
  standardDeduction: number,
  earnedIncome: number,
): number {
  const availableDeduction = Math.max(0, standardDeduction - earnedIncome);
  const taxablePercentage = 1 - basisPercentage;

  if (taxablePercentage <= 0) return Infinity;

  return round2(availableDeduction / taxablePercentage);
}

// ─── Main Calculator ────────────────────────────────────────

/**
 * Calculate a multi-year Roth conversion strategy with pro rata rule.
 *
 * The pro rata rule: When converting from a traditional IRA that contains
 * both deductible and nondeductible (after-tax) contributions, you cannot
 * choose to convert only the nondeductible portion. Each conversion is
 * a proportional mix of taxable and non-taxable dollars.
 *
 * For Trump Accounts:
 * - All personal contributions are after-tax (nondeductible) → basis
 * - Growth/earnings and pilot deposit/employer contributions → taxable
 * - Basis % = total personal contributions / account balance
 * - Each dollar converted = (basis%) non-taxable + (1 - basis%) taxable
 */
export function calculateRothConversion(input: RothConversionInput): RothConversionResult {
  const {
    accountBalance,
    totalContributions,
    annualEarnedIncome,
    standardDeduction,
    conversionYears,
    annualReturn,
    taxBrackets,
    rothGrowthRate,
    retirementAge,
    startAge,
  } = input;

  // Pro rata percentages
  const basisPercentage = accountBalance > 0
    ? Math.min(totalContributions / accountBalance, 1)
    : 0;
  const taxablePercentage = 1 - basisPercentage;

  let remainingBalance = accountBalance;
  let totalConverted = 0;
  let totalTaxPaid = 0;
  let totalInRoth = 0;
  const yearlyResults: ConversionYearResult[] = [];

  for (let i = 0; i < conversionYears; i++) {
    const age = startAge + i;
    const balanceAtStart = remainingBalance;

    // Divide remaining balance equally across remaining years
    const yearsLeft = conversionYears - i;
    const conversionAmount = round2(Math.min(remainingBalance, remainingBalance / yearsLeft));

    // Pro rata split
    const nonTaxableAmount = round2(conversionAmount * basisPercentage);
    const taxableAmount = round2(conversionAmount * taxablePercentage);

    // Total income = earned income + taxable portion of conversion
    const totalIncome = annualEarnedIncome + taxableAmount;
    const taxableIncome = Math.max(0, totalIncome - standardDeduction);
    const taxOwed = calculateTax(taxableIncome, taxBrackets);
    const effectiveRate = conversionAmount > 0 ? round2((taxOwed / conversionAmount) * 100) / 100 : 0;

    totalConverted += conversionAmount;
    totalTaxPaid += taxOwed;

    // Remaining balance grows during the year (for next year)
    remainingBalance = round2((remainingBalance - conversionAmount) * (1 + annualReturn));

    // Roth balance also grows
    totalInRoth = round2((totalInRoth + conversionAmount) * (1 + rothGrowthRate));

    yearlyResults.push({
      year: i + 1,
      age,
      conversionAmount: round2(conversionAmount),
      nonTaxableAmount,
      taxableAmount,
      standardDeduction,
      taxableIncome: round2(taxableIncome),
      taxOwed,
      effectiveRate: round2(effectiveRate * 100),
      cumulativeConverted: round2(totalConverted),
      remainingBalance: round2(remainingBalance),
      balanceAtStartOfYear: round2(balanceAtStart),
    });
  }

  // Project Roth value at retirement
  const yearsToRetirement = retirementAge - (startAge + conversionYears);
  let rothAtRetirement = totalInRoth;
  for (let y = 0; y < yearsToRetirement; y++) {
    rothAtRetirement *= (1 + rothGrowthRate);
  }
  rothAtRetirement = round2(rothAtRetirement);

  // Compare: what if kept as traditional IRA?
  let traditionalAtRetirement = accountBalance;
  for (let y = 0; y < (retirementAge - startAge); y++) {
    traditionalAtRetirement *= (1 + annualReturn);
  }
  traditionalAtRetirement = round2(traditionalAtRetirement);

  // Estimate tax on traditional IRA at retirement (assume 22% effective)
  const retirementTaxRate = 0.22;
  const traditionalTax = round2(traditionalAtRetirement * retirementTaxRate);
  const traditionalNet = round2(traditionalAtRetirement - traditionalTax);
  const taxSavings = round2(rothAtRetirement - traditionalNet);

  const overallEffectiveRate = totalConverted > 0
    ? round2((totalTaxPaid / totalConverted) * 100)
    : 0;

  return {
    yearlyResults,
    totalConverted: round2(totalConverted),
    totalTaxPaid: round2(totalTaxPaid),
    overallEffectiveRate,
    basisPercentage: round2(basisPercentage * 100),
    taxablePercentage: round2(taxablePercentage * 100),
    rothValueAtRetirement: rothAtRetirement,
    traditionalValueAtRetirement: traditionalAtRetirement,
    traditionalTaxAtRetirement: traditionalTax,
    traditionalNetAtRetirement: traditionalNet,
    taxSavings,
  };
}

// ─── Default 2025 Brackets (projected forward) ─────────────

export const DEFAULT_SINGLE_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: null, rate: 0.37 },
];

export const DEFAULT_STANDARD_DEDUCTION = 15000;
