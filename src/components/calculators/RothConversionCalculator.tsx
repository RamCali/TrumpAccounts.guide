import { useState, useMemo } from 'react';
import {
  calculateRothConversion,
  DEFAULT_SINGLE_BRACKETS,
  DEFAULT_STANDARD_DEDUCTION,
  maxConversionForZeroTax,
} from '../../lib/calculators/rothConversion';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const pct = (n: number) => `${n.toFixed(1)}%`;

export default function RothConversionCalculator() {
  // ─── State ──────────────────────────────────────────────
  const [accountBalance, setAccountBalance] = useState(100000);
  const [totalContributions, setTotalContributions] = useState(60000);
  const [annualEarnedIncome, setAnnualEarnedIncome] = useState(0);
  const [standardDeduction, setStandardDeduction] = useState(DEFAULT_STANDARD_DEDUCTION);
  const [conversionYears, setConversionYears] = useState(2);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [retirementAge, setRetirementAge] = useState(65);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Ensure contributions don't exceed balance
  const safeContributions = Math.min(totalContributions, accountBalance);

  // ─── Compute ────────────────────────────────────────────
  const result = useMemo(() => {
    return calculateRothConversion({
      accountBalance,
      totalContributions: safeContributions,
      annualEarnedIncome,
      standardDeduction,
      conversionYears,
      annualReturn: annualReturn / 100,
      taxBrackets: DEFAULT_SINGLE_BRACKETS,
      rothGrowthRate: annualReturn / 100,
      retirementAge,
      startAge: 18,
    });
  }, [accountBalance, safeContributions, annualEarnedIncome, standardDeduction, conversionYears, annualReturn, retirementAge]);

  const basisPct = accountBalance > 0 ? (safeContributions / accountBalance) * 100 : 0;
  const growthPct = 100 - basisPct;

  const zeroTaxMax = useMemo(() => {
    return maxConversionForZeroTax(
      basisPct / 100,
      standardDeduction,
      annualEarnedIncome,
    );
  }, [basisPct, standardDeduction, annualEarnedIncome]);

  // ─── Presets ────────────────────────────────────────────
  const presets = [
    { label: '$60K in, $100K balance', balance: 100000, contributions: 60000 },
    { label: '$90K in, $150K balance', balance: 150000, contributions: 90000 },
    { label: '$45K in, $80K balance', balance: 80000, contributions: 45000 },
    { label: 'Max: $90K in, $226K balance', balance: 226000, contributions: 90000 },
  ];

  return (
    <div className="space-y-6">
      {/* ── Presets ─────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">Quick scenarios</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setAccountBalance(p.balance); setTotalContributions(p.contributions); }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                accountBalance === p.balance && totalContributions === p.contributions
                  ? 'border-gold-400 bg-gold-400/15 text-gold-400'
                  : 'border-surface-600 text-gray-400 hover:border-gold-400/30 hover:text-gold-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Inputs ──────────────────────────────────────── */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Trump Account at Age 18</h3>

        <SliderInput
          label="Account balance at 18"
          value={accountBalance}
          min={10000}
          max={300000}
          step={5000}
          onChange={setAccountBalance}
          prefix="$"
        />

        <SliderInput
          label="Total after-tax contributions (your basis)"
          value={safeContributions}
          min={0}
          max={accountBalance}
          step={1000}
          onChange={setTotalContributions}
          prefix="$"
          helpText="Money you put in — no tax deduction taken. This is NOT taxed on conversion."
        />

        {/* Basis visual */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Non-taxable basis: {pct(basisPct)}</span>
            <span>Taxable growth: {pct(growthPct)}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-surface-600 overflow-hidden flex">
            <div
              className="h-full bg-mint-400 transition-all duration-300"
              style={{ width: `${basisPct}%` }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${growthPct}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-mint-400" />
              Basis ({fmt(safeContributions)}) — not taxed
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Growth ({fmt(accountBalance - safeContributions)}) — taxed on conversion
            </span>
          </div>
        </div>

        <SliderInput
          label="Years to spread conversion"
          value={conversionYears}
          min={1}
          max={6}
          step={1}
          onChange={setConversionYears}
          suffix={conversionYears === 1 ? ' year' : ' years'}
          helpText="More years = lower tax per year. College years (18-22) are ideal."
        />

        <SliderInput
          label="Child's annual earned income"
          value={annualEarnedIncome}
          min={0}
          max={60000}
          step={1000}
          onChange={setAnnualEarnedIncome}
          prefix="$"
          helpText="Part-time job income uses up some of the standard deduction."
        />

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-2 text-xs text-gold-400 hover:text-gold-300 transition-colors"
        >
          {showAdvanced ? '▼ Hide advanced settings' : '▶ Advanced settings'}
        </button>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-surface-600">
            <SliderInput
              label="Standard deduction"
              value={standardDeduction}
              min={12000}
              max={25000}
              step={500}
              onChange={setStandardDeduction}
              prefix="$"
              helpText="Projected standard deduction for the conversion year."
            />
            <SliderInput
              label="Expected annual return"
              value={annualReturn}
              min={4}
              max={12}
              step={0.5}
              onChange={setAnnualReturn}
              suffix="%"
            />
            <SliderInput
              label="Retirement age"
              value={retirementAge}
              min={50}
              max={75}
              step={1}
              onChange={setRetirementAge}
              suffix=" years"
            />
          </div>
        )}
      </div>

      {/* ── Pro Rata Rule Explainer ─────────────────────── */}
      <div className="rounded-xl border border-gold-400/20 bg-gold-400/5 p-4">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">The Pro Rata Rule</h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          Because your Trump Account contributions were <strong className="text-white">after-tax</strong> (no
          deduction), {pct(basisPct)} of every dollar converted is a return of your basis and{' '}
          <strong className="text-white">not taxed</strong>. Only the {pct(growthPct)} that is growth gets
          taxed. To convert with <strong className="text-white">$0 in tax</strong>, keep the taxable portion
          under the standard deduction — that means converting up to{' '}
          <strong className="text-white">{zeroTaxMax === Infinity ? 'unlimited' : fmt(zeroTaxMax)}</strong>{' '}
          per year{annualEarnedIncome > 0 ? ` (with ${fmt(annualEarnedIncome)} earned income)` : ' (with no other income)'}.
        </p>
      </div>

      {/* ── Results ─────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard
          label="Total Tax Paid"
          value={fmt(result.totalTaxPaid)}
          sublabel={`Effective rate: ${pct(result.overallEffectiveRate)}`}
          highlight
        />
        <ResultCard
          label="Total Converted to Roth"
          value={fmt(result.totalConverted)}
          sublabel={`Over ${conversionYears} year${conversionYears > 1 ? 's' : ''}`}
        />
        <ResultCard
          label={`Roth IRA at ${retirementAge}`}
          value={fmt(result.rothValueAtRetirement)}
          sublabel="Tax-free withdrawals"
          highlight
        />
        <ResultCard
          label={`Trad. IRA at ${retirementAge} (net)`}
          value={fmt(result.traditionalNetAtRetirement)}
          sublabel={`After ~${fmt(result.traditionalTaxAtRetirement)} est. tax`}
        />
      </div>

      {/* ── Tax Savings Highlight ───────────────────────── */}
      {result.taxSavings > 0 && (
        <div className="rounded-xl border border-mint-400/30 bg-mint-400/5 p-4 text-center">
          <p className="text-sm text-gray-400">Estimated lifetime tax savings from Roth conversion</p>
          <p className="mt-1 text-3xl font-bold text-mint-400">{fmt(result.taxSavings)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Roth: {fmt(result.rothValueAtRetirement)} tax-free vs Traditional: {fmt(result.traditionalNetAtRetirement)} after tax
          </p>
        </div>
      )}

      {/* ── Year-by-Year Table ──────────────────────────── */}
      <div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
        >
          {showTable ? '▼' : '▶'} Year-by-year conversion breakdown
        </button>

        {showTable && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-surface-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-600 bg-surface-800 text-left text-xs text-gray-400">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">Convert</th>
                  <th className="px-3 py-2">Non-Taxable</th>
                  <th className="px-3 py-2">Taxable</th>
                  <th className="px-3 py-2">Tax Owed</th>
                  <th className="px-3 py-2">Eff. Rate</th>
                  <th className="px-3 py-2">Remaining</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {result.yearlyResults.map((yr) => (
                  <tr key={yr.year} className="border-b border-surface-700">
                    <td className="px-3 py-2 text-white font-medium">{yr.year}</td>
                    <td className="px-3 py-2">{yr.age}</td>
                    <td className="px-3 py-2">{fmt(yr.conversionAmount)}</td>
                    <td className="px-3 py-2 text-mint-400">{fmt(yr.nonTaxableAmount)}</td>
                    <td className="px-3 py-2 text-amber-400">{fmt(yr.taxableAmount)}</td>
                    <td className="px-3 py-2 text-white font-medium">
                      {yr.taxOwed === 0 ? (
                        <span className="text-mint-400">$0</span>
                      ) : (
                        fmt(yr.taxOwed)
                      )}
                    </td>
                    <td className="px-3 py-2">{pct(yr.effectiveRate)}</td>
                    <td className="px-3 py-2 text-gray-500">{fmt(yr.remainingBalance)}</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-surface-800 font-medium text-white">
                  <td className="px-3 py-2" colSpan={2}>Total</td>
                  <td className="px-3 py-2">{fmt(result.totalConverted)}</td>
                  <td className="px-3 py-2 text-mint-400">
                    {fmt(result.totalConverted * (result.basisPercentage / 100))}
                  </td>
                  <td className="px-3 py-2 text-amber-400">
                    {fmt(result.totalConverted * (result.taxablePercentage / 100))}
                  </td>
                  <td className="px-3 py-2">{fmt(result.totalTaxPaid)}</td>
                  <td className="px-3 py-2">{pct(result.overallEffectiveRate)}</td>
                  <td className="px-3 py-2 text-gray-500">{fmt(result.yearlyResults[result.yearlyResults.length - 1]?.remainingBalance ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Disclaimer ──────────────────────────────────── */}
      <p className="text-xs text-gray-500 leading-relaxed">
        This calculator is for educational purposes only and does not constitute tax or financial advice.
        Tax brackets and standard deductions are approximate projections. The pro rata rule calculation
        uses simplified assumptions. State taxes are not included. Consult a qualified tax professional
        before executing a Roth conversion. Past returns do not guarantee future results.
      </p>
    </div>
  );
}
