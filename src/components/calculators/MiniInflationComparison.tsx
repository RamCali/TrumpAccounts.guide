import { useState, useMemo } from 'react';
import { calculateInflationComparison } from '../../lib/calculators/growth';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function MiniInflationComparison() {
  const [years, setYears] = useState(18);

  const result = useMemo(() => {
    return calculateInflationComparison({
      initialAmount: 1000,
      years,
      inflationRate: 0.03,
      savingsAPY: 0.005,
      investmentReturn: 0.08,
    });
  }, [years]);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">$1,000: Savings vs Trump Account</h3>

      {/* Years Slider */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-gray-400">Time Horizon</label>
          <span className="text-sm font-semibold tabular-nums text-[#c5a059]">
            {years} years
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={1}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Time horizon in years"
        />
      </div>

      {/* Results */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-center">
          <p className="text-xs text-red-400">Savings Account</p>
          <p className="text-lg font-bold tabular-nums text-red-300">
            {fmt(result.savingsFinalPurchasingPower)}
          </p>
          <p className="text-xs text-red-400/70">real value</p>
        </div>
        <div className="rounded-lg border border-[#c5a059]/30 bg-[#c5a059]/5 p-3 text-center">
          <p className="text-xs text-[#c5a059]">Trump Account</p>
          <p className="text-lg font-bold tabular-nums text-[#c5a059]">
            {fmt(result.investmentFinalPurchasingPower)}
          </p>
          <p className="text-xs text-[#c5a059]/70">real value</p>
        </div>
      </div>

      {/* Advantage */}
      <div className="mb-4 rounded-lg border border-[#c5a059]/30 bg-[#c5a059]/10 p-3 text-center">
        <p className="text-xs text-gray-400">Trump Account Advantage</p>
        <p className="text-2xl font-bold tabular-nums text-[#c5a059]">
          +{fmt(result.investmentAdvantage)}
        </p>
        <p className="text-xs text-gray-500">more purchasing power</p>
      </div>

      {/* CTA */}
      <a
        href="/calculators/inflation-comparison"
        className="block rounded-lg bg-[#c5a059] px-4 py-2.5 text-center text-sm font-semibold text-[#0d0d0d] no-underline transition-colors hover:bg-[#d4b06a]"
      >
        Customize Your Comparison
      </a>
    </div>
  );
}
