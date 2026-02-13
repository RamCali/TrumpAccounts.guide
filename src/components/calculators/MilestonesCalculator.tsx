import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { calculateMilestones } from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const MILESTONE_COLORS: Record<string, string> = {
  '$10K': '#4CAF50',
  '$25K': '#66BB6A',
  '$50K': '#42A5F5',
  '$100K': '#C5A059',
  '$250K': '#FFA726',
  '$500K': '#EF5350',
  '$1M': '#AB47BC',
};

export default function MilestonesCalculator() {
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [showLifetime, setShowLifetime] = useState(true);

  const result = useMemo(() => {
    return calculateMilestones({
      monthlyContribution,
      annualReturn: annualReturn / 100,
      pilotDeposit: 1000,
      birthYear: 2025,
      showLifetime,
    });
  }, [monthlyContribution, annualReturn, showLifetime]);

  const chartData = result.growthData.snapshots.map((s) => ({
    age: s.age,
    balance: Math.round(s.endBalance),
  }));

  // Find value at age 18
  const valueAt18 = result.growthData.snapshots.find((s) => s.age === 18)?.endBalance ?? 0;

  // Only show reference lines for milestones that can appear on the chart
  const maxBalance = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Adjust Your Scenario</h2>

        <SliderInput
          label="Monthly Contribution"
          value={monthlyContribution}
          min={0}
          max={417}
          step={25}
          onChange={setMonthlyContribution}
          prefix="$"
          helpText={`$${(Math.min(monthlyContribution * 12, 5000)).toLocaleString()}/year (max $5,000)`}
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
          label="Value at 18"
          value={fmt(valueAt18)}
          sublabel="IRA conversion"
          highlight
        />
        {showLifetime && (
          <ResultCard
            label="Value at 65"
            value={fmt(result.growthData.finalBalance)}
            sublabel="Retirement"
            highlight
          />
        )}
        <ResultCard
          label="Total Contributed"
          value={fmt(result.growthData.totalContributions)}
          sublabel="Your money in"
        />
        <ResultCard
          label="Total Earnings"
          value={fmt(result.growthData.totalEarnings)}
          sublabel="Compound growth"
        />
      </div>

      {/* Milestone cards */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-white">Milestone Timeline</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {result.milestones.map((m) => {
            const reached = m.ageReached !== null;
            return (
              <div
                key={m.label}
                className={`rounded-lg border p-4 text-center transition-all ${
                  reached
                    ? 'border-gold-400/40 bg-gold-400/5'
                    : 'border-surface-600/50 bg-surface-900/50 opacity-50'
                }`}
              >
                <p className={`text-lg font-bold ${reached ? 'text-gold-400' : 'text-gray-600'}`}>
                  {m.label}
                </p>
                {reached ? (
                  <>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                      Age {m.ageReached}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">Year {m.yearReached}</p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">Not reached</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Growth Curve with Milestones
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="milestoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
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
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              formatter={(value: number) => [fmt(value), 'Balance']}
              labelFormatter={(label: number) => `Age ${label}`}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid #333333', color: '#f5f5f5' }}
            />
            {/* Milestone reference lines */}
            {result.milestones
              .filter((m) => m.ageReached !== null && m.amount <= maxBalance * 1.1)
              .map((m) => (
                <ReferenceLine
                  key={m.label}
                  y={m.amount}
                  stroke={MILESTONE_COLORS[m.label] || '#666'}
                  strokeDasharray="5 5"
                  strokeOpacity={0.6}
                  label={{
                    value: m.label,
                    position: 'right',
                    fill: MILESTONE_COLORS[m.label] || '#666',
                    fontSize: 11,
                  }}
                />
              ))}
            {/* Age 18 vertical line */}
            <ReferenceLine
              x={18}
              stroke="#4CAF50"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: 'IRA at 18', position: 'top', fill: '#4CAF50', fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#C5A059"
              fill="url(#milestoneGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
