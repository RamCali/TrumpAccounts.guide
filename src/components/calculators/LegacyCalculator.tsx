import { useState, useMemo } from 'react';
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
import { calculateLifetimeGrowth } from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface MilestoneResult {
  age: number;
  label: string;
  sublabel: string;
  value: number;
  color: string;
}

export default function LegacyCalculator() {
  const [monthly, setMonthly] = useState(200);
  const [returnRate, setReturnRate] = useState(8);

  const result = useMemo(() =>
    calculateLifetimeGrowth({
      birthYear: 2025,
      pilotDeposit: 1000,
      monthlyContribution: monthly,
      annualReturn: returnRate / 100,
      retirementAge: 65,
      postIRAContribution: 0,
    }),
    [monthly, returnRate]
  );

  // Extract milestone values from snapshots
  const milestoneAges = [18, 25, 30, 40, 50, 59, 65];
  const milestoneMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const snap of result.snapshots) {
      if (milestoneAges.includes(snap.age)) {
        map[snap.age] = snap.endBalance;
      }
    }
    return map;
  }, [result]);

  const primaryMilestones: MilestoneResult[] = [
    { age: 18, label: 'Age 18', sublabel: 'College / Trade School', value: milestoneMap[18] ?? 0, color: 'text-blue-400' },
    { age: 30, label: 'Age 30', sublabel: 'House Down Payment', value: milestoneMap[30] ?? 0, color: 'text-purple-400' },
    { age: 65, label: 'Age 65', sublabel: 'Retirement', value: milestoneMap[65] ?? 0, color: 'text-gold-400' },
  ];

  const chartData = result.snapshots.map((s) => ({
    age: s.age,
    balance: Math.round(s.endBalance),
  }));

  // Determine if millionaire
  const isMillionaire = (milestoneMap[65] ?? 0) >= 1_000_000;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Your Contribution Plan</h2>

        <SliderInput
          label="Monthly Contribution (ages 0–18)"
          value={monthly}
          min={0}
          max={417}
          step={25}
          onChange={setMonthly}
          prefix="$"
          suffix="/mo"
          helpText="Max $5,000/year ($417/mo). After age 18, no additional contributions modeled."
        />

        <SliderInput
          label="Expected Annual Return"
          value={returnRate}
          min={4}
          max={12}
          step={0.5}
          onChange={setReturnRate}
          suffix="%"
          helpText="S&P 500 historical average: ~10% (7% after inflation)"
        />
      </div>

      {/* Three primary milestones */}
      <div className="grid gap-4 sm:grid-cols-3">
        {primaryMilestones.map((m) => (
          <div
            key={m.age}
            className={`rounded-xl border p-5 text-center ${
              m.age === 65
                ? 'border-gold-400/50 bg-gold-400/10'
                : 'border-surface-600 bg-surface-800'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{m.label}</p>
            <p className={`mt-2 text-3xl font-bold tabular-nums md:text-4xl ${
              m.age === 65 ? 'text-gold-400' : 'text-white'
            }`}>
              {fmt(m.value)}
            </p>
            <p className="mt-1 text-sm text-gray-500">{m.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Millionaire badge */}
      {isMillionaire && (
        <div className="rounded-xl border border-gold-400/30 bg-gold-400/5 p-5 text-center">
          <p className="text-lg font-bold text-gold-400">Millionaire Baby Status Achieved</p>
          <p className="mt-1 text-sm text-gray-400">
            With ${monthly}/mo contributions and {returnRate}% returns, the account is projected
            to exceed $1,000,000 by retirement — from a $1,000 starting deposit.
          </p>
        </div>
      )}

      {/* Full timeline chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Lifetime Growth: Birth to Retirement
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="legacyGradient" x1="0" y1="0" x2="0" y2="1">
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
            <ReferenceLine x={18} stroke="#60a5fa" strokeDasharray="5 5" label={{ value: '18', position: 'top', fill: '#60a5fa', fontSize: 11 }} />
            <ReferenceLine x={30} stroke="#a78bfa" strokeDasharray="5 5" label={{ value: '30', position: 'top', fill: '#a78bfa', fontSize: 11 }} />
            <ReferenceLine x={65} stroke="#c5a059" strokeDasharray="5 5" label={{ value: '65', position: 'top', fill: '#c5a059', fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#C5A059"
              fill="url(#legacyGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-blue-400" /> IRA Conversion (18)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-purple-400" /> Home Purchase (30)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-gold-400" /> Retirement (65)
          </span>
        </div>
      </div>

      {/* All milestones table */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">Key Milestones</h3>
        <div className="space-y-3">
          {[
            { age: 18, label: 'Turns 18 — Account converts to traditional IRA', icon: '🎓' },
            { age: 25, label: 'Age 25 — First job / early career', icon: '💼' },
            { age: 30, label: 'Age 30 — House down payment', icon: '🏠' },
            { age: 40, label: 'Age 40 — Peak earning years', icon: '📈' },
            { age: 50, label: 'Age 50 — Catch-up eligible', icon: '⏳' },
            { age: 59, label: 'Age 59½ — Penalty-free withdrawals', icon: '🔓' },
            { age: 65, label: 'Age 65 — Full retirement', icon: '🏖️' },
          ].map((m) => (
            <div key={m.age} className="flex items-center justify-between rounded-lg bg-surface-900/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm text-gray-300">{m.label}</span>
              </div>
              <span className={`font-bold tabular-nums ${m.age === 65 ? 'text-gold-400' : 'text-white'}`}>
                {fmt(milestoneMap[m.age] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-600">
        Hypothetical projections. Assumes ${monthly}/mo contributions ages 0–18, no additional
        contributions after IRA conversion, {returnRate}% annual return. Not financial advice.
      </p>
    </div>
  );
}
