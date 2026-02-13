import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { calculateInflationComparison } from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function InflationComparisonCalc() {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [inflationRate, setInflationRate] = useState(3);
  const [savingsAPY, setSavingsAPY] = useState(0.5);
  const [investmentReturn, setInvestmentReturn] = useState(8);
  const [years, setYears] = useState(18);
  const [showPurchasingPower, setShowPurchasingPower] = useState(true);

  const result = useMemo(() => {
    return calculateInflationComparison({
      initialAmount,
      years,
      inflationRate: inflationRate / 100,
      savingsAPY: savingsAPY / 100,
      investmentReturn: investmentReturn / 100,
    });
  }, [initialAmount, years, inflationRate, savingsAPY, investmentReturn]);

  const chartData = useMemo(() => {
    return [
      {
        year: 0,
        savings: initialAmount,
        investment: initialAmount,
      },
      ...result.years.map((y) => ({
        year: y.year,
        savings: Math.round(showPurchasingPower ? y.savingsPurchasingPower : y.savingsBalance),
        investment: Math.round(showPurchasingPower ? y.investmentPurchasingPower : y.investmentBalance),
      })),
    ];
  }, [result, initialAmount, showPurchasingPower]);

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Adjust Your Scenario</h2>

        <SliderInput
          label="Initial Amount"
          value={initialAmount}
          min={500}
          max={5000}
          step={100}
          onChange={setInitialAmount}
          prefix="$"
        />

        <SliderInput
          label="Time Horizon"
          value={years}
          min={5}
          max={30}
          step={1}
          onChange={setYears}
          suffix=" years"
        />

        <SliderInput
          label="Inflation Rate"
          value={inflationRate}
          min={1}
          max={5}
          step={0.5}
          onChange={setInflationRate}
          suffix="%"
          helpText="U.S. historical average: ~3%"
        />

        <SliderInput
          label="Savings Account APY"
          value={savingsAPY}
          min={0.01}
          max={2}
          step={0.1}
          onChange={setSavingsAPY}
          suffix="%"
          helpText="National average savings rate: ~0.5%"
        />

        <SliderInput
          label="Trump Account Return (S&P 500)"
          value={investmentReturn}
          min={4}
          max={12}
          step={0.5}
          onChange={setInvestmentReturn}
          suffix="%"
          helpText="S&P 500 historical average: ~10%"
        />

        <label className="mt-4 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPurchasingPower}
            onChange={(e) => setShowPurchasingPower(e.target.checked)}
            className="h-4 w-4 rounded border-surface-600 text-gold-400 accent-[#c5a059]"
          />
          <span className="text-sm text-gray-300">
            Show purchasing power (inflation-adjusted)
          </span>
        </label>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultCard
          label={`Savings Account`}
          value={fmt(showPurchasingPower ? result.savingsFinalPurchasingPower : result.savingsFinalBalance)}
          sublabel={showPurchasingPower ? "Today's dollars" : 'Nominal balance'}
        />
        <ResultCard
          label={`Trump Account`}
          value={fmt(showPurchasingPower ? result.investmentFinalPurchasingPower : result.investmentFinalBalance)}
          sublabel={showPurchasingPower ? "Today's dollars" : 'Nominal balance'}
          highlight
        />
        <ResultCard
          label="Savings Loses"
          value={fmt(result.purchasingPowerLostInSavings)}
          sublabel="Purchasing power eroded"
        />
        <ResultCard
          label="Real Advantage"
          value={fmt(result.investmentAdvantage)}
          sublabel="Investment wins by"
          highlight
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          {showPurchasingPower ? 'Purchasing Power Over Time' : 'Nominal Balance Over Time'}
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
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
              }
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                fmt(value),
                name === 'savings' ? 'Savings Account' : 'Trump Account',
              ]}
              labelFormatter={(label: number) => `Year ${label}`}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid #333333', color: '#f5f5f5' }}
            />
            <Line
              type="monotone"
              dataKey="investment"
              stroke="#C5A059"
              strokeWidth={2.5}
              dot={false}
              name="investment"
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#EF4444"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              name="savings"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-gold-400" /> Trump Account (S&P 500)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-red-400" /> Savings Account
          </span>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-gold-400/30 bg-gold-400/5 px-4 py-3">
        <p className="text-sm text-gray-300">
          <strong className="text-gold-400">Why this matters:</strong> A savings account earning {savingsAPY}% APY
          loses purchasing power every year when inflation is {inflationRate}%. After {years} years, your
          ${initialAmount.toLocaleString()} can buy <strong className="text-red-400">less</strong> than it can today.
          In a Trump Account tracking the S&P 500, that same money grows to have
          <strong className="text-gold-400"> {fmt(result.investmentAdvantage)} more</strong> in real purchasing power.
        </p>
      </div>
    </div>
  );
}
