import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';
import { calculateExpenseLeakage } from '../../lib/calculators/tax';
import fundData from '../../data/sp500-returns.json';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const bps = (n: number) => `${(n * 10000).toFixed(1)} bps`;

interface Fund {
  ticker: string;
  name: string;
  expenseRatio: number;
  index: string;
  provider: string;
}

export default function FundExpenseTracker() {
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [comparisonExpense, setComparisonExpense] = useState(50); // in basis points
  const [selectedFund, setSelectedFund] = useState<string>('VOO');

  const funds = fundData.eligibleFunds as Fund[];
  const maxExpenseRatio = 0.001; // 10 bps cap

  const selected = funds.find((f) => f.ticker === selectedFund) || funds[0];

  // Calculate leakage for selected fund vs a higher-expense alternative
  const leakageData = useMemo(() => {
    return calculateExpenseLeakage({
      initialBalance: 1000, // pilot deposit
      annualContribution,
      annualReturn: annualReturn / 100,
      expenseRatio: comparisonExpense / 10000, // convert bps to decimal
      years: 18,
    });
  }, [annualContribution, annualReturn, comparisonExpense]);

  const lowCostData = useMemo(() => {
    return calculateExpenseLeakage({
      initialBalance: 1000,
      annualContribution,
      annualReturn: annualReturn / 100,
      expenseRatio: selected.expenseRatio,
      years: 18,
    });
  }, [annualContribution, annualReturn, selected]);

  const chartData = leakageData.map((high, i) => ({
    year: high.year,
    lowCost: lowCostData[i].balanceWithFees,
    highCost: high.balanceWithFees,
    noFees: high.balanceWithoutFees,
  }));

  const totalLeakageLow = lowCostData[lowCostData.length - 1].cumulativeLeakage;
  const totalLeakageHigh = leakageData[leakageData.length - 1].cumulativeLeakage;
  const savings = totalLeakageHigh - totalLeakageLow;

  return (
    <div className="space-y-6">
      {/* Fund Comparison Table */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 shadow-sm overflow-x-auto">
        <div className="px-6 py-4 border-b border-surface-600">
          <h2 className="text-lg font-bold text-white">Eligible Funds for Trump Accounts</h2>
          <p className="text-sm text-gray-400 mt-1">
            Expense ratios capped at 0.1% (10 basis points). All funds below qualify.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-600 bg-surface-700 text-left text-gray-500">
              <th className="px-4 py-3">Fund</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Index</th>
              <th className="px-4 py-3 text-right">Expense Ratio</th>
              <th className="px-4 py-3 text-right">Under Cap?</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr
                key={fund.ticker}
                className={`border-b border-surface-600/50 cursor-pointer hover:bg-gold-400/10 transition-colors ${
                  selectedFund === fund.ticker ? 'bg-gold-400/10' : ''
                }`}
                onClick={() => setSelectedFund(fund.ticker)}
              >
                <td className="px-4 py-3 font-medium text-white">{fund.name}</td>
                <td className="px-4 py-3 font-mono text-gold-400 font-semibold">{fund.ticker}</td>
                <td className="px-4 py-3 text-gray-400">{fund.provider}</td>
                <td className="px-4 py-3 text-gray-400">{fund.index}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {(fund.expenseRatio * 100).toFixed(4)}%
                  <span className="text-gray-500 ml-1">({bps(fund.expenseRatio)})</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {fund.expenseRatio <= maxExpenseRatio ? (
                    <span className="inline-flex items-center rounded-full bg-mint-400/20 px-2 py-1 text-xs font-medium text-mint-400">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leakage Calculator */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Expense Ratio Impact Calculator</h2>
        <p className="mb-4 text-sm text-gray-400">
          Compare {selected.ticker} ({bps(selected.expenseRatio)}) against a higher-fee fund to see how much fees "leak" over 18 years.
        </p>

        <SliderInput
          label="Annual Contribution"
          value={annualContribution}
          min={0}
          max={5000}
          step={250}
          onChange={setAnnualContribution}
          prefix="$"
        />

        <SliderInput
          label="Expected Annual Return"
          value={annualReturn}
          min={4}
          max={12}
          step={0.5}
          onChange={setAnnualReturn}
          suffix="%"
        />

        <SliderInput
          label="Higher-Fee Fund Expense Ratio"
          value={comparisonExpense}
          min={10}
          max={100}
          step={5}
          onChange={setComparisonExpense}
          suffix=" bps"
          helpText={`Comparing ${bps(selected.expenseRatio)} (${selected.ticker}) vs ${comparisonExpense} bps`}
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ResultCard
          label={`${selected.ticker} (${bps(selected.expenseRatio)})`}
          value={fmt(lowCostData[lowCostData.length - 1].balanceWithFees)}
          sublabel={`Leakage: ${fmt(totalLeakageLow)}`}
          highlight
        />
        <ResultCard
          label={`Higher-Fee (${comparisonExpense} bps)`}
          value={fmt(leakageData[leakageData.length - 1].balanceWithFees)}
          sublabel={`Leakage: ${fmt(totalLeakageHigh)}`}
        />
        <ResultCard
          label="You Save with Low-Cost"
          value={fmt(savings)}
          sublabel="Over 18 years"
          highlight
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Balance Over 18 Years: Low-Cost vs High-Fee
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#9E9E9E' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  lowCost: `${selected.ticker} (${bps(selected.expenseRatio)})`,
                  highCost: `Higher-Fee (${comparisonExpense} bps)`,
                  noFees: 'No Fees (theoretical)',
                };
                return [fmt(value), labels[name] || name];
              }}
              labelFormatter={(label: number) => `Year ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #333333', backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  lowCost: `${selected.ticker}`,
                  highCost: `Higher-Fee`,
                  noFees: 'No Fees',
                };
                return labels[value] || value;
              }}
            />
            <Line type="monotone" dataKey="noFees" stroke="#444444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="lowCost" stroke="#4CAF50" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="highCost" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
