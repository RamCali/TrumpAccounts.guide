import { useState, useMemo } from 'react';
import { calculateGrowth } from '../../lib/calculators/growth';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const DEFAULT_T = {
  title: 'Millionaire Baby Calculator',
  initialDeposit: 'Initial Deposit',
  monthlySavings: 'Monthly Contributions',
  growthRate: 'Growth Rate',
  projectedValue: 'Projected Value at Age 18:',
  cta: 'Calculate Now',
  ctaHref: '/calculators/growth-calculator',
  initialDepositAria: 'Initial deposit amount',
  monthlySavingsAria: 'Monthly contribution amount',
  growthRateAria: 'Annual growth rate',
};

type Translations = typeof DEFAULT_T;

interface MiniGrowthCalcProps {
  translations?: Partial<Translations>;
}

export default function MiniGrowthCalc({ translations }: MiniGrowthCalcProps = {}) {
  const t = { ...DEFAULT_T, ...translations };
  const [initialDeposit, setInitialDeposit] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [growthRate, setGrowthRate] = useState(8);

  const result = useMemo(() => {
    return calculateGrowth({
      birthYear: 2025,
      pilotDeposit: 1000,
      monthlyContribution,
      annualReturn: growthRate / 100,
      endAge: 18,
    });
  }, [monthlyContribution, growthRate]);

  // Add initial deposit on top of pilot deposit growth
  const projectedValue = result.finalBalance + (initialDeposit - 1000) * Math.pow(1 + growthRate / 100, 18);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">{t.title}</h3>

      {/* Initial Deposit */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-gray-400">{t.initialDeposit}</label>
          <span className="text-sm font-semibold tabular-nums text-[#c5a059]">
            ${initialDeposit.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={initialDeposit}
          onChange={(e) => setInitialDeposit(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label={t.initialDepositAria}
        />
      </div>

      {/* Monthly Contributions & Growth Rate side by side */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-400">{t.monthlySavings}</label>
          </div>
          <input
            type="range"
            min={0}
            max={417}
            step={25}
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full cursor-pointer"
            aria-label={t.monthlySavingsAria}
          />
          <p className="mt-0.5 text-right text-xs tabular-nums text-gray-500">
            ${monthlyContribution}/mo
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-400">{t.growthRate}</label>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={0.5}
            value={growthRate}
            onChange={(e) => setGrowthRate(Number(e.target.value))}
            className="w-full cursor-pointer"
            aria-label={t.growthRateAria}
          />
          <p className="mt-0.5 text-right text-xs tabular-nums text-gray-500">
            {growthRate}%
          </p>
        </div>
      </div>

      {/* Projected Value */}
      <p className="text-sm text-gray-400">{t.projectedValue}</p>
      <p className="text-3xl font-bold tabular-nums text-white">
        {fmt(projectedValue)}
      </p>

      {/* CTA */}
      <a
        href={t.ctaHref}
        className="mt-4 block rounded-lg bg-[#c5a059] px-4 py-2.5 text-center text-sm font-semibold text-[#0d0d0d] no-underline transition-colors hover:bg-[#d4b06a]"
      >
        {t.cta}
      </a>
    </div>
  );
}
