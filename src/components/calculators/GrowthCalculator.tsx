import { useState, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  calculateEnhancedGrowth,
  calculateEnhancedLifetimeGrowth,
  getEffectiveCap,
  type ContributionPhase,
} from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';
import limits from '../../data/contribution-limits.json';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface Preset {
  label: string;
  description: string;
  phases: (startAge: number) => ContributionPhase[];
}

function makePresets(startAge: number, endAge: number, employerAnnual: number): Preset[] {
  const personalCap = limits.annualContributionLimit - employerAnnual;
  const personalMaxMo = Math.floor(personalCap / 12);

  return [
    {
      label: 'Deposit only',
      description: employerAnnual > 0
        ? `No family contributions — employer adds $${employerAnnual.toLocaleString()}/yr`
        : 'No family contributions — just the $1,000 pilot deposit',
      phases: () => [],
    },
    {
      label: '$100/mo',
      description: `$1,200/year from age ${startAge} to ${endAge}`,
      phases: (s) => [{ fromAge: s, toAge: endAge, monthlyAmount: Math.min(100, personalMaxMo) }],
    },
    {
      label: '$250/mo',
      description: `$3,000/year from age ${startAge} to ${endAge}`,
      phases: (s) => [{ fromAge: s, toAge: endAge, monthlyAmount: Math.min(250, personalMaxMo) }],
    },
    {
      label: `Max ($${personalMaxMo}/mo)`,
      description: `$${personalCap.toLocaleString()}/year personal${employerAnnual > 0 ? ` + $${employerAnnual.toLocaleString()} employer` : ''} from age ${startAge} to ${endAge}`,
      phases: (s) => [{ fromAge: s, toAge: endAge, monthlyAmount: personalMaxMo }],
    },
    {
      label: '5 yrs then stop',
      description: `$250/mo for 5 years, then $0`,
      phases: (s) => [{ fromAge: s, toAge: Math.min(s + 5, endAge), monthlyAmount: Math.min(250, personalMaxMo) }],
    },
    {
      label: 'Start small, grow',
      description: `$100/mo early, $300/mo later`,
      phases: (s) => {
        const mid = Math.round(s + (endAge - s) / 2);
        return [
          { fromAge: s, toAge: mid, monthlyAmount: Math.min(100, personalMaxMo) },
          { fromAge: mid, toAge: endAge, monthlyAmount: Math.min(300, personalMaxMo) },
        ];
      },
    },
  ];
}

export default function GrowthCalculator() {
  const [birthYear, setBirthYear] = useState(2025);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [showLifetime, setShowLifetime] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Advanced options
  const [inflationAdjustCap, setInflationAdjustCap] = useState(false);
  const [annualEmployer, setAnnualEmployer] = useState(0);
  const [includeDellPledge, setIncludeDellPledge] = useState(false);
  const [expenseRatio, setExpenseRatio] = useState(limits.defaultExpenseRatio * 100); // as percentage (0.04)

  // Contributions can first be made for the 2025 tax year
  const firstContributionYear = 2025;
  const hasPilotDeposit = birthYear >= 2025 && birthYear <= 2028;
  const hasDellEligibility = hasPilotDeposit;
  const startAge = Math.max(0, firstContributionYear - birthYear);
  const yearsOfGrowth = 18 - startAge;
  const dellPledgeAmount = includeDellPledge && hasDellEligibility ? limits.dellPledge.perChildAmount : 0;
  const expenseRatioDecimal = expenseRatio / 100;
  const personalMaxMonthly = Math.floor((limits.annualContributionLimit - annualEmployer) / 12);

  // Contribution phases
  const [phases, setPhases] = useState<ContributionPhase[]>([
    { fromAge: 0, toAge: 18, monthlyAmount: 200 },
  ]);

  // Recalculate phases when birth year changes and startAge shifts
  const effectivePhases = useMemo(() => {
    return phases.map((p) => ({
      ...p,
      fromAge: Math.max(p.fromAge, startAge),
      toAge: Math.min(p.toAge, showLifetime ? 18 : 18),
    })).filter((p) => p.fromAge < p.toAge);
  }, [phases, startAge, showLifetime]);

  const result = useMemo(() => {
    const commonInput = {
      birthYear,
      pilotDeposit: hasPilotDeposit ? limits.pilotDeposit : 0,
      phases: effectivePhases,
      annualReturn: annualReturn / 100,
      startAge,
      inflationAdjustCap,
      inflationRate: limits.defaultInflationRate,
      inflationIndexStartYear: limits.inflationIndexStartYear,
      annualEmployerContribution: annualEmployer,
      dellPledgeAmount,
      expenseRatio: expenseRatioDecimal,
    };

    if (showLifetime) {
      return calculateEnhancedLifetimeGrowth({
        ...commonInput,
        retirementAge: 65,
        postIRAContribution: 0,
      });
    }
    return calculateEnhancedGrowth({ ...commonInput, endAge: 18 });
  }, [birthYear, effectivePhases, annualReturn, showLifetime, startAge, hasPilotDeposit,
      inflationAdjustCap, annualEmployer, dellPledgeAmount, expenseRatioDecimal]);

  const seedMoney = (hasPilotDeposit ? limits.pilotDeposit : 0) + dellPledgeAmount;

  const chartData = result.snapshots.map((s, i) => ({
    age: s.age,
    balance: Math.round(s.endBalance),
    contributions: Math.round(
      result.snapshots.slice(0, i + 1).reduce((sum, snap) => sum + snap.contributions, 0) +
      seedMoney
    ),
  }));

  // Phase management
  const updatePhase = useCallback((index: number, field: keyof ContributionPhase, value: number) => {
    setPhases((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setActivePreset(null);
  }, []);

  const addPhase = useCallback(() => {
    setPhases((prev) => {
      const lastEnd = prev.length > 0 ? prev[prev.length - 1].toAge : startAge;
      if (lastEnd >= 18) return prev;
      return [...prev, { fromAge: lastEnd, toAge: 18, monthlyAmount: 0 }];
    });
    setActivePreset(null);
  }, [startAge]);

  const removePhase = useCallback((index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    const newPhases = preset.phases(startAge);
    setPhases(newPhases.length > 0 ? newPhases : [{ fromAge: startAge, toAge: 18, monthlyAmount: 0 }]);
    setActivePreset(preset.label);
  }, [startAge]);

  const presets = useMemo(() => makePresets(startAge, 18, annualEmployer), [startAge, annualEmployer]);

  // Build dynamic help text for birth year slider
  const birthYearHelp = hasPilotDeposit
    ? 'Includes $1,000 federal pilot deposit (births 2025–2028)'
    : startAge > 0
      ? `No pilot deposit · contributions start at age ${startAge} · ${yearsOfGrowth} years of growth before 18`
      : 'No pilot deposit (born before 2025)';

  return (
    <div className="space-y-6">
      {/* Birth year & return */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Adjust Your Scenario</h2>

        <SliderInput
          label="Child's Birth Year"
          value={birthYear}
          min={2008}
          max={2028}
          step={1}
          onChange={(v) => { setBirthYear(v); setActivePreset(null); }}
          helpText={birthYearHelp}
        />

        <SliderInput
          label="Expected Annual Return"
          value={annualReturn}
          min={4}
          max={12}
          step={0.5}
          onChange={setAnnualReturn}
          suffix="%"
          helpText="S&P 500 historical average: ~10% (7% inflation-adjusted)"
        />

        <label className="mt-4 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLifetime}
            onChange={(e) => setShowLifetime(e.target.checked)}
            className="h-4 w-4 rounded border-surface-600 text-gold-400 accent-[#c5a059]"
          />
          <span className="text-sm text-gray-300">
            Show growth to age 65 (after IRA conversion at 18)
          </span>
        </label>
      </div>

      {/* Advanced Options */}
      <details className="rounded-xl border border-surface-600 bg-surface-800 shadow-sm">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-gray-300 hover:bg-surface-700/50">
          <span>Advanced Options</span>
          <span className="text-xs text-gray-500">Inflation, Employer Match, Dell Pledge, Fees</span>
        </summary>
        <div className="space-y-5 px-6 pb-6">
          {/* Inflation Adjustment */}
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={inflationAdjustCap}
                onChange={(e) => setInflationAdjustCap(e.target.checked)}
                className="h-4 w-4 rounded border-surface-600 accent-[#c5a059]"
              />
              <span className="text-sm text-gray-300">
                Adjust ${limits.annualContributionLimit.toLocaleString()} cap for inflation (post-{limits.inflationIndexStartYear})
              </span>
            </label>
            <p className="ml-6 mt-1 text-xs text-gray-500">
              The annual limit is indexed ~2.5%/year starting {limits.inflationIndexStartYear + 1}.
              {inflationAdjustCap && hasPilotDeposit && (
                <> By age 18, the cap could be ~{fmt(getEffectiveCap(birthYear + 17, limits.annualContributionLimit, true, limits.defaultInflationRate, limits.inflationIndexStartYear))}/year.</>
              )}
            </p>
          </div>

          {/* Employer Match */}
          <SliderInput
            label="Annual Employer Contribution"
            value={annualEmployer}
            min={0}
            max={limits.employerContributionLimit}
            step={100}
            onChange={(v) => { setAnnualEmployer(v); setActivePreset(null); }}
            prefix="$"
            helpText={`Tax-free under IRC §128. Counts toward the $${limits.annualContributionLimit.toLocaleString()} cap. Remaining for personal: $${(limits.annualContributionLimit - annualEmployer).toLocaleString()}/yr ($${personalMaxMonthly}/mo)`}
          />

          {/* Dell Pledge */}
          {hasDellEligibility && (
            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeDellPledge}
                  onChange={(e) => setIncludeDellPledge(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-600 accent-[#c5a059]"
                />
                <span className="text-sm text-gray-300">
                  Include Dell Foundation bonus (+${limits.dellPledge.perChildAmount})
                </span>
              </label>
              <p className="ml-6 mt-1 text-xs text-gray-500">
                For children {limits.dellPledge.eligibleAge} in ZIP codes with median income below ${limits.dellPledge.zipCodeMedianIncomeThreshold.toLocaleString()}.
                {includeDellPledge && ` Total seed: $${(limits.pilotDeposit + limits.dellPledge.perChildAmount).toLocaleString()}.`}
              </p>
            </div>
          )}

          {/* Expense Ratio */}
          <SliderInput
            label="Fund Expense Ratio"
            value={expenseRatio}
            min={0}
            max={limits.maxExpenseRatio * 100}
            step={0.01}
            onChange={setExpenseRatio}
            suffix="%"
            helpText="Law caps fees at 0.10%. VOO/IVV typically charge 0.03–0.04%. Deducted from returns annually."
          />
        </div>
      </details>

      {/* Contribution plan */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold text-white">Contribution Plan</h2>
        <p className="mb-4 text-sm text-gray-400">
          Set how much you'll contribute during different periods. Max ${personalMaxMonthly}/mo personal{annualEmployer > 0 ? ` + $${annualEmployer.toLocaleString()}/yr employer` : ''} ($${limits.annualContributionLimit.toLocaleString()}/yr total from all sources).
        </p>

        {/* Quick presets */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Quick scenarios</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePreset === preset.label
                    ? 'border-gold-400/60 bg-gold-400/15 text-gold-400'
                    : 'border-surface-600 text-gray-400 hover:border-gold-400/30 hover:text-gray-200'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase editor */}
        <div className="space-y-4">
          {phases.map((phase, i) => (
            <div
              key={i}
              className="rounded-lg border border-surface-600/50 bg-surface-900/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Phase {i + 1}
                </span>
                {phases.length > 1 && (
                  <button
                    onClick={() => removePhase(i)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    aria-label={`Remove phase ${i + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* From age */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">From age</label>
                  <select
                    value={phase.fromAge}
                    onChange={(e) => updatePhase(i, 'fromAge', Number(e.target.value))}
                    className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-white"
                    aria-label={`Phase ${i + 1} start age`}
                  >
                    {Array.from({ length: 18 - startAge }, (_, j) => startAge + j).map((age) => (
                      <option key={age} value={age}>
                        {age} ({birthYear + age})
                      </option>
                    ))}
                  </select>
                </div>

                {/* To age */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">To age</label>
                  <select
                    value={phase.toAge}
                    onChange={(e) => updatePhase(i, 'toAge', Number(e.target.value))}
                    className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-white"
                    aria-label={`Phase ${i + 1} end age`}
                  >
                    {Array.from({ length: 18 - phase.fromAge }, (_, j) => phase.fromAge + j + 1).map((age) => (
                      <option key={age} value={age}>
                        {age} ({birthYear + age})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monthly amount */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Monthly amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      min={0}
                      max={personalMaxMonthly}
                      step={25}
                      value={phase.monthlyAmount}
                      onChange={(e) => updatePhase(i, 'monthlyAmount', Math.min(personalMaxMonthly, Math.max(0, Number(e.target.value))))}
                      className="w-full rounded-lg border border-surface-600 bg-surface-800 py-2 pl-7 pr-3 text-sm text-white tabular-nums"
                      aria-label={`Phase ${i + 1} monthly contribution`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    ${(Math.min(phase.monthlyAmount * 12, limits.annualContributionLimit - annualEmployer)).toLocaleString()}/yr
                  </p>
                </div>
              </div>

              {/* Phase slider for quick adjustment */}
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={personalMaxMonthly}
                  step={25}
                  value={Math.min(phase.monthlyAmount, personalMaxMonthly)}
                  onChange={(e) => updatePhase(i, 'monthlyAmount', Number(e.target.value))}
                  className="w-full h-2 bg-surface-600 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                  aria-label={`Phase ${i + 1} amount slider`}
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>$0</span>
                  <span>${personalMaxMonthly}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add phase button */}
        {phases.length < 4 && (
          <button
            onClick={addPhase}
            className="mt-3 flex items-center gap-1 rounded-lg border border-dashed border-surface-600 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gold-400/30 hover:text-gold-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add contribution phase
          </button>
        )}

        {/* Summary line */}
        <div className="mt-4 rounded-lg bg-surface-900/50 px-4 py-3">
          <p className="text-xs text-gray-400">
            {effectivePhases.length === 0 ? (
              <>No personal contributions — {hasPilotDeposit ? `$${seedMoney.toLocaleString()} seed grows on its own` : 'account starts at $0'}</>
            ) : (
              <>
                {effectivePhases.map((p, i) => (
                  <span key={i}>
                    {i > 0 && ', then '}
                    <strong className="text-gray-300">${p.monthlyAmount}/mo</strong> ages {p.fromAge}–{p.toAge}
                  </span>
                ))}
              </>
            )}
            {annualEmployer > 0 && (
              <span className="text-gray-500"> + ${annualEmployer.toLocaleString()}/yr employer</span>
            )}
          </p>
        </div>
      </div>

      {/* Info banner for older children */}
      {startAge > 0 && !showLifetime && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-300">
            A child born in {birthYear} would be <strong className="text-amber-200">{startAge}</strong> when
            contributions begin in 2025. They have <strong className="text-amber-200">{yearsOfGrowth} years</strong> of
            tax-deferred growth before the account converts to a traditional IRA at age 18 ({birthYear + 18}).
          </p>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultCard
          label={showLifetime ? 'Value at 65' : 'Value at 18'}
          value={fmt(result.finalBalance)}
          highlight
        />
        <ResultCard
          label="Total Contributions"
          value={fmt(result.totalContributions)}
          sublabel={annualEmployer > 0
            ? `Personal: ${fmt(result.totalPersonalContributions ?? 0)} · Employer: ${fmt(result.totalEmployerContributions ?? 0)}`
            : undefined}
        />
        <ResultCard
          label="Total Earnings"
          value={fmt(result.totalEarnings)}
          sublabel={result.totalContributions > 0 ? `${((result.totalEarnings / result.totalContributions) * 100).toFixed(0)}% return on contributions` : undefined}
        />
        <ResultCard
          label="Seed Money"
          value={fmt(seedMoney)}
          sublabel={[
            hasPilotDeposit ? `$${limits.pilotDeposit.toLocaleString()} pilot` : null,
            includeDellPledge ? `$${limits.dellPledge.perChildAmount} Dell` : null,
            !hasPilotDeposit && !includeDellPledge ? 'No seed (born outside 2025–2028)' : null,
          ].filter(Boolean).join(' + ')}
        />
      </div>

      {/* Tax Basis Breakdown */}
      {(result.taxFreeBasis ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ResultCard
            label="Tax-Free Basis"
            value={fmt(result.taxFreeBasis ?? 0)}
            sublabel="Your after-tax contributions (not taxed again)"
          />
          <ResultCard
            label="Taxable at Withdrawal"
            value={fmt(result.taxableAtConversion ?? 0)}
            sublabel="Seed + employer + earnings (taxed as income)"
          />
          {(result.totalExpensesPaid ?? 0) > 0 && (
            <ResultCard
              label="Total Fees Paid"
              value={fmt(result.totalExpensesPaid ?? 0)}
              sublabel={`${expenseRatio.toFixed(2)}% expense ratio over ${showLifetime ? '47' : yearsOfGrowth} years`}
            />
          )}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Projected Growth Over Time
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="contribGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              label={{ value: 'Age', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#9E9E9E' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                fmt(value),
                name === 'balance' ? 'Total Balance' : 'Total Contributed',
              ]}
              labelFormatter={(label: number) => `Age ${label}`}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid #333333', color: '#f5f5f5' }}
            />
            {showLifetime && (
              <ReferenceLine
                x={18}
                stroke="#60a5fa"
                strokeDasharray="5 5"
                label={{ value: 'Converts to IRA', position: 'top', fill: '#60a5fa', fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#C5A059"
              fill="url(#balanceGradient)"
              strokeWidth={2}
              name="balance"
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="#4CAF50"
              fill="url(#contribGradient)"
              strokeWidth={2}
              name="contributions"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-gold-400" /> Total Balance
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-mint-400" /> Contributions
          </span>
        </div>
      </div>

      {/* Year-by-year table */}
      <details className="rounded-xl border border-surface-600 bg-surface-800 shadow-sm">
        <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-gray-300 hover:bg-surface-700/50">
          View Year-by-Year Breakdown
        </summary>
        <div className="overflow-x-auto px-6 pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-600 text-left text-gray-500">
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Year</th>
                {annualEmployer > 0 && <th className="py-2 pr-4 text-right">Personal</th>}
                {annualEmployer > 0 && <th className="py-2 pr-4 text-right">Employer</th>}
                <th className="py-2 pr-4 text-right">{annualEmployer > 0 ? 'Total' : 'Contributions'}</th>
                {inflationAdjustCap && <th className="py-2 pr-4 text-right">Cap</th>}
                <th className="py-2 pr-4 text-right">Earnings</th>
                {expenseRatioDecimal > 0 && <th className="py-2 pr-4 text-right">Fees</th>}
                <th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.snapshots.map((s) => (
                <tr
                  key={s.age}
                  className={`border-b border-surface-600/50 ${
                    s.age === 18 && showLifetime ? 'border-b-2 border-blue-500/50 bg-blue-500/5' : ''
                  }`}
                >
                  <td className="py-2 pr-4 tabular-nums">{s.age}</td>
                  <td className="py-2 pr-4 tabular-nums">{s.year}</td>
                  {annualEmployer > 0 && (
                    <td className="py-2 pr-4 text-right tabular-nums">{fmt(s.personalContributions ?? 0)}</td>
                  )}
                  {annualEmployer > 0 && (
                    <td className="py-2 pr-4 text-right tabular-nums text-blue-400">{fmt(s.employerContributions ?? 0)}</td>
                  )}
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt(s.contributions)}</td>
                  {inflationAdjustCap && (
                    <td className="py-2 pr-4 text-right tabular-nums text-gray-500">{fmt(s.effectiveCapForYear ?? limits.annualContributionLimit)}</td>
                  )}
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt(s.earnings)}</td>
                  {expenseRatioDecimal > 0 && (
                    <td className="py-2 pr-4 text-right tabular-nums text-red-400/70">{fmt(s.expenseDeducted ?? 0)}</td>
                  )}
                  <td className="py-2 text-right font-medium tabular-nums">{fmt(s.endBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
