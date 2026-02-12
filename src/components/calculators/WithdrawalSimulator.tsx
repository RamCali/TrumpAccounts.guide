import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';
import { generateWithdrawalTimeline, type TaxBracket } from '../../lib/calculators/tax';
import taxBracketsData from '../../data/tax-brackets.json';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function WithdrawalSimulator() {
  const [balanceAt18, setBalanceAt18] = useState(150000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [otherIncome, setOtherIncome] = useState(50000);
  const [withdrawalPct, setWithdrawalPct] = useState(100);
  const [filingStatus, setFilingStatus] = useState<'single' | 'marriedFilingJointly'>('single');

  const brackets = (filingStatus === 'single'
    ? taxBracketsData.single
    : taxBracketsData.marriedFilingJointly
  ) as TaxBracket[];

  const scenarios = useMemo(() => {
    return generateWithdrawalTimeline({
      currentBalance: balanceAt18,
      annualReturn: annualReturn / 100,
      otherIncome,
      filingStatus,
      brackets,
      withdrawalPercentage: withdrawalPct / 100,
    });
  }, [balanceAt18, annualReturn, otherIncome, filingStatus, withdrawalPct, brackets]);

  const chartData = scenarios.map((s) => ({
    age: s.age === 59.5 ? '59½' : String(s.age),
    netAmount: Math.round(s.netAmount),
    taxes: Math.round(s.federalTax),
    penalty: Math.round(s.earlyWithdrawalPenalty),
    balance: Math.round(s.balance),
  }));

  const bestScenario = scenarios[scenarios.length - 1]; // Age 65
  const worstScenario = scenarios[0]; // Age 18

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Configure Your Scenario</h2>

        <SliderInput
          label="Projected Balance at Age 18"
          value={balanceAt18}
          min={10000}
          max={500000}
          step={5000}
          onChange={setBalanceAt18}
          prefix="$"
          helpText="Use our Growth Calculator to estimate this"
        />

        <SliderInput
          label="Post-18 Annual Return"
          value={annualReturn}
          min={4}
          max={12}
          step={0.5}
          onChange={setAnnualReturn}
          suffix="%"
        />

        <SliderInput
          label="Other Annual Income at Withdrawal"
          value={otherIncome}
          min={0}
          max={200000}
          step={5000}
          onChange={setOtherIncome}
          prefix="$"
          helpText="Your other income affects your tax bracket"
        />

        <SliderInput
          label="Withdrawal Amount"
          value={withdrawalPct}
          min={10}
          max={100}
          step={10}
          onChange={setWithdrawalPct}
          suffix="% of balance"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Filing Status</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFilingStatus('single')}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                filingStatus === 'single' ? 'border-gold-400 bg-gold-400/20 text-gold-400' : 'border-surface-600 text-gray-400 hover:border-surface-500'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setFilingStatus('marriedFilingJointly')}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                filingStatus === 'marriedFilingJointly' ? 'border-gold-400 bg-gold-400/20 text-gold-400' : 'border-surface-600 text-gray-400 hover:border-surface-500'
              }`}
            >
              Married Filing Jointly
            </button>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ResultCard
          label="Withdraw at 18"
          value={fmt(worstScenario.netAmount)}
          sublabel={`${pct(worstScenario.effectiveTaxRate)} effective tax rate`}
        />
        <ResultCard
          label="Withdraw at 59½ (no penalty)"
          value={fmt(scenarios.find(s => s.age === 59.5)?.netAmount ?? 0)}
          sublabel="No early withdrawal penalty"
          highlight
        />
        <ResultCard
          label="Withdraw at 65"
          value={fmt(bestScenario.netAmount)}
          sublabel={`${pct(bestScenario.effectiveTaxRate)} effective tax rate`}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Net Amount After Taxes & Penalties by Withdrawal Age
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              label={{ value: 'Withdrawal Age', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#9E9E9E' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  netAmount: 'Net (You Keep)',
                  taxes: 'Federal Tax',
                  penalty: 'Early Withdrawal Penalty',
                };
                return [fmt(value), labels[name] || name];
              }}
              labelFormatter={(label: string) => `Age ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #333333', backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  netAmount: 'Net (You Keep)',
                  taxes: 'Federal Tax',
                  penalty: 'Early Withdrawal Penalty',
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="netAmount" stackId="a" fill="#4CAF50" radius={[0, 0, 0, 0]} />
            <Bar dataKey="taxes" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="penalty" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-600 bg-surface-700 text-left text-gray-500">
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-right">Withdrawal</th>
              <th className="px-4 py-3 text-right">Federal Tax</th>
              <th className="px-4 py-3 text-right">Penalty</th>
              <th className="px-4 py-3 text-right">Net Amount</th>
              <th className="px-4 py-3 text-right">Eff. Rate</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.age} className={`border-b border-surface-600/50 ${s.age >= 59.5 ? 'bg-mint-400/10' : ''}`}>
                <td className="px-4 py-2 font-medium">{s.age === 59.5 ? '59½' : s.age}</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmt(s.balance)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmt(s.withdrawalAmount)}</td>
                <td className="px-4 py-2 text-right tabular-nums text-amber-400">{fmt(s.federalTax)}</td>
                <td className="px-4 py-2 text-right tabular-nums text-red-400">
                  {s.earlyWithdrawalPenalty > 0 ? fmt(s.earlyWithdrawalPenalty) : '—'}
                </td>
                <td className="px-4 py-2 text-right font-semibold tabular-nums text-mint-400">{fmt(s.netAmount)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{pct(s.effectiveTaxRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key rules */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <h3 className="font-semibold text-amber-300">Key Withdrawal Rules</h3>
        <ul className="mt-2 space-y-1 text-sm text-amber-400">
          <li>&bull; <strong>Before age 18:</strong> No withdrawals (except rollovers, excess contributions, or death)</li>
          <li>&bull; <strong>Age 18:</strong> Converts to traditional IRA automatically</li>
          <li>&bull; <strong>Ages 18–59½:</strong> Ordinary income tax + 10% early withdrawal penalty</li>
          <li>&bull; <strong>Age 59½+:</strong> Ordinary income tax only, no penalty</li>
          <li>&bull; All withdrawals are taxed as <strong>ordinary income</strong> (traditional IRA rules)</li>
        </ul>
      </div>
    </div>
  );
}
