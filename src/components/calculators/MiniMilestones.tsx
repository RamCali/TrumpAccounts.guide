import { useState, useMemo } from 'react';
import { calculateMilestones } from '../../lib/calculators/growth';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function MiniMilestones() {
  const [monthlyContribution, setMonthlyContribution] = useState(250);

  const result = useMemo(() => {
    return calculateMilestones({
      monthlyContribution,
      annualReturn: 0.08,
      pilotDeposit: 1000,
      birthYear: 2025,
      showLifetime: true,
    });
  }, [monthlyContribution]);

  // Show a subset of milestones for compact display
  const keyMilestones = result.milestones.filter((m) =>
    ['$50K', '$100K', '$500K', '$1M'].includes(m.label)
  );

  const valueAt18 = result.growthData.snapshots.find((s) => s.age === 18)?.endBalance ?? 0;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Milestone Calculator</h3>

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

      {/* Value at 18 */}
      <div className="mb-4">
        <p className="text-sm text-gray-400">Value at Age 18:</p>
        <p className="text-3xl font-bold tabular-nums text-white">{fmt(valueAt18)}</p>
      </div>

      {/* Key Milestones */}
      <div className="mb-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Lifetime Milestones (to age 65)
        </p>
        {keyMilestones.map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2"
          >
            <span className={`text-sm font-semibold ${m.ageReached ? 'text-[#c5a059]' : 'text-gray-600'}`}>
              {m.label}
            </span>
            <span className={`text-sm tabular-nums ${m.ageReached ? 'font-bold text-white' : 'text-gray-600'}`}>
              {m.ageReached ? `Age ${m.ageReached}` : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href="/calculators/milestones"
        className="block rounded-lg bg-[#c5a059] px-4 py-2.5 text-center text-sm font-semibold text-[#0d0d0d] no-underline transition-colors hover:bg-[#d4b06a]"
      >
        See All Milestones
      </a>
    </div>
  );
}
