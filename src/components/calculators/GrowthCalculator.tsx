import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { calculateGrowth, calculateLifetimeGrowth } from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function GrowthCalculator() {
  const [birthYear, setBirthYear] = useState(2025);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [showLifetime, setShowLifetime] = useState(false);

  const result = useMemo(() => {
    if (showLifetime) {
      return calculateLifetimeGrowth({
        birthYear,
        pilotDeposit: birthYear >= 2025 && birthYear <= 2028 ? 1000 : 0,
        monthlyContribution,
        annualReturn: annualReturn / 100,
        retirementAge: 65,
        postIRAContribution: 0,
      });
    }
    return calculateGrowth({
      birthYear,
      pilotDeposit: birthYear >= 2025 && birthYear <= 2028 ? 1000 : 0,
      monthlyContribution,
      annualReturn: annualReturn / 100,
      endAge: 18,
    });
  }, [birthYear, monthlyContribution, annualReturn, showLifetime]);

  const chartData = result.snapshots.map((s) => ({
    age: s.age,
    balance: Math.round(s.endBalance),
    contributions: Math.round(result.snapshots.slice(0, s.age).reduce((sum, snap) => sum + snap.contributions, 0) +
      (birthYear >= 2025 && birthYear <= 2028 ? 1000 : 0)),
  }));

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Adjust Your Scenario</h2>

        <SliderInput
          label="Child's Birth Year"
          value={birthYear}
          min={2025}
          max={2028}
          step={1}
          onChange={setBirthYear}
          helpText="Federal $1,000 pilot deposit available for births 2025–2028"
        />

        <SliderInput
          label="Monthly Contribution"
          value={monthlyContribution}
          min={0}
          max={417}
          step={25}
          onChange={setMonthlyContribution}
          prefix="$"
          helpText={`$${(monthlyContribution * 12).toLocaleString()}/year of $5,000 annual limit`}
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
        />
        <ResultCard
          label="Total Earnings"
          value={fmt(result.totalEarnings)}
          sublabel={`${((result.totalEarnings / result.totalContributions) * 100).toFixed(0)}% return on contributions`}
        />
        <ResultCard
          label="Pilot Deposit"
          value={birthYear >= 2025 && birthYear <= 2028 ? '$1,000' : '$0'}
          sublabel={birthYear >= 2025 && birthYear <= 2028 ? 'Federal grant' : 'Not eligible'}
        />
      </div>

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
                <th className="py-2 pr-4 text-right">Contributions</th>
                <th className="py-2 pr-4 text-right">Earnings</th>
                <th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.snapshots.map((s) => (
                <tr key={s.age} className="border-b border-surface-600/50">
                  <td className="py-2 pr-4 tabular-nums">{s.age}</td>
                  <td className="py-2 pr-4 tabular-nums">{s.year}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt(s.contributions)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt(s.earnings)}</td>
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
