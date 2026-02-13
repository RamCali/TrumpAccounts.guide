import { useState, useMemo } from 'react';
import { calculateCostOfWaiting } from '../../lib/calculators/growth';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function MiniCostOfWaiting() {
  const [waitAge, setWaitAge] = useState(5);
  const [monthlyContribution, setMonthlyContribution] = useState(200);

  const result = useMemo(() => {
    return calculateCostOfWaiting({
      startAge1: 0,
      startAge2: waitAge,
      monthlyContribution,
      annualReturn: 0.08,
      pilotDeposit: 1000,
      birthYear: 2025,
    });
  }, [waitAge, monthlyContribution]);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Cost of Waiting Calculator</h3>

      {/* Wait Age Slider */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-gray-400">Wait Until Age</label>
          <span className="text-sm font-semibold tabular-nums text-[#c5a059]">
            Age {waitAge}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={waitAge}
          onChange={(e) => setWaitAge(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Wait until age"
        />
      </div>

      {/* Monthly Contribution Slider */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-gray-400">Monthly Contribution</label>
          <span className="text-sm font-semibold tabular-nums text-[#c5a059]">
            ${monthlyContribution}/mo
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={417}
          step={25}
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Monthly contribution amount"
        />
      </div>

      {/* Results */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#2a2a2a] bg-[#111] p-3 text-center">
          <p className="text-xs text-gray-500">Start at Birth</p>
          <p className="text-xl font-bold tabular-nums text-[#c5a059]">
            {fmt(result.scenario1.finalBalance)}
          </p>
        </div>
        <div className="rounded-lg border border-[#2a2a2a] bg-[#111] p-3 text-center">
          <p className="text-xs text-gray-500">Start at Age {waitAge}</p>
          <p className="text-xl font-bold tabular-nums text-white">
            {fmt(result.scenario2.finalBalance)}
          </p>
        </div>
      </div>

      {/* Cost of Waiting */}
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
        <p className="text-xs text-amber-400">Cost of Waiting {waitAge} Years</p>
        <p className="text-2xl font-bold tabular-nums text-amber-300">
          {fmt(result.difference)}
        </p>
        <p className="text-xs text-amber-400/70">{result.percentageLost.toFixed(1)}% less growth</p>
      </div>

      {/* CTA */}
      <a
        href="/calculators/cost-of-waiting"
        className="block rounded-lg bg-[#c5a059] px-4 py-2.5 text-center text-sm font-semibold text-[#0d0d0d] no-underline transition-colors hover:bg-[#d4b06a]"
      >
        Open Full Calculator
      </a>
    </div>
  );
}
