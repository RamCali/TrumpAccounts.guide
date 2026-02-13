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
import { calculateCostOfWaiting } from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function CostOfWaitingCalculator() {
  const [waitAge, setWaitAge] = useState(5);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualReturn, setAnnualReturn] = useState(8);

  const result = useMemo(() => {
    return calculateCostOfWaiting({
      startAge1: 0,
      startAge2: waitAge,
      monthlyContribution,
      annualReturn: annualReturn / 100,
      pilotDeposit: 1000,
      birthYear: 2025,
    });
  }, [waitAge, monthlyContribution, annualReturn]);

  // Build chart data: one entry per age with both scenarios
  const chartData = useMemo(() => {
    const data: { age: number; earlyStart: number; lateStart: number }[] = [];
    const s1Map = new Map(result.scenario1.snapshots.map((s) => [s.age, s.endBalance]));
    const s2Map = new Map(result.scenario2.snapshots.map((s) => [s.age, s.endBalance]));

    for (let age = 0; age <= 18; age++) {
      data.push({
        age,
        earlyStart: Math.round(s1Map.get(age) ?? (age === 0 ? 1000 : 0)),
        lateStart: Math.round(s2Map.get(age) ?? (age === 0 ? 1000 : (age < waitAge ? 1000 : 0))),
      });
    }
    return data;
  }, [result, waitAge]);

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Adjust Your Scenario</h2>

        <SliderInput
          label="Compare: Start at Birth vs Start at Age…"
          value={waitAge}
          min={1}
          max={15}
          step={1}
          onChange={setWaitAge}
          helpText={`See the cost of waiting ${waitAge} years to start contributing`}
        />

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
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultCard
          label="Start at Birth"
          value={fmt(result.scenario1.finalBalance)}
          sublabel="18 years of growth"
        />
        <ResultCard
          label={`Start at Age ${waitAge}`}
          value={fmt(result.scenario2.finalBalance)}
          sublabel={`${18 - waitAge} years of growth`}
        />
        <ResultCard
          label="Cost of Waiting"
          value={fmt(result.difference)}
          sublabel="Money your child loses"
          highlight
        />
        <ResultCard
          label="Percentage Lost"
          value={`${result.percentageLost.toFixed(1)}%`}
          sublabel={`${waitAge} years of delay`}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Side-by-Side Growth Comparison
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="earlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
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
                name === 'earlyStart' ? 'Start at Birth' : `Start at Age ${waitAge}`,
              ]}
              labelFormatter={(label: number) => `Age ${label}`}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid #333333', color: '#f5f5f5' }}
            />
            <Area
              type="monotone"
              dataKey="earlyStart"
              stroke="#C5A059"
              fill="url(#earlyGradient)"
              strokeWidth={2}
              name="earlyStart"
            />
            <Area
              type="monotone"
              dataKey="lateStart"
              stroke="#EF4444"
              fill="url(#lateGradient)"
              strokeWidth={2}
              name="lateStart"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-gold-400" /> Start at Birth
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-red-400" /> Start at Age {waitAge}
          </span>
        </div>
      </div>

      {/* Year-by-year table */}
      <details className="rounded-xl border border-surface-600 bg-surface-800 shadow-sm">
        <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-gray-300 hover:bg-surface-700/50">
          View Year-by-Year Comparison
        </summary>
        <div className="overflow-x-auto px-6 pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-600 text-left text-gray-500">
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4 text-right">Start at Birth</th>
                <th className="py-2 pr-4 text-right">Start at {waitAge}</th>
                <th className="py-2 text-right">Difference</th>
              </tr>
            </thead>
            <tbody>
              {chartData.filter(d => d.age > 0).map((d) => (
                <tr key={d.age} className="border-b border-surface-600/50">
                  <td className="py-2 pr-4 tabular-nums">{d.age}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-gold-400">{fmt(d.earlyStart)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmt(d.lateStart)}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-amber-400">
                    {d.earlyStart - d.lateStart > 0 ? `-${fmt(d.earlyStart - d.lateStart)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
