import { useState, useMemo } from 'react';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function MiniEmployerMatch() {
  const [employerContrib, setEmployerContrib] = useState(2500);
  const [personalContrib, setPersonalContrib] = useState(2500);

  const totalAnnual = useMemo(() => {
    return Math.min(employerContrib + personalContrib, 5000);
  }, [employerContrib, personalContrib]);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">Employer Match Tool</h3>

      {/* Two value displays side by side */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#333] bg-[#222] p-3 text-center">
          <p className="text-xs text-gray-400">Trump Account</p>
          <p className="text-xl font-bold tabular-nums text-[#c5a059]">
            {fmt(personalContrib)}
            <span className="text-xs font-normal text-gray-500">/year</span>
          </p>
        </div>
        <div className="rounded-lg border border-[#333] bg-[#222] p-3 text-center">
          <p className="text-xs text-gray-400">Employer Match</p>
          <p className="text-xl font-bold tabular-nums text-[#c5a059]">
            {fmt(employerContrib)}
            <span className="text-xs font-normal text-gray-500">/year</span>
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs text-gray-400">Your Contribution</label>
          <span className="text-xs tabular-nums text-gray-500">{fmt(personalContrib)}/yr</span>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={personalContrib}
          onChange={(e) => setPersonalContrib(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Your annual contribution"
        />
      </div>
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs text-gray-400">Employer Contribution</label>
          <span className="text-xs tabular-nums text-gray-500">{fmt(employerContrib)}/yr</span>
        </div>
        <input
          type="range"
          min={0}
          max={2500}
          step={100}
          value={employerContrib}
          onChange={(e) => setEmployerContrib(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Employer annual contribution"
        />
      </div>

      {/* Total */}
      <p className="text-sm text-gray-400">Total Annual Benefit Increase:</p>
      <p className="text-2xl font-bold tabular-nums text-white">
        {fmt(totalAnnual)}
        <span className="text-sm font-normal text-gray-500">/year</span>
      </p>

      {/* CTA */}
      <a
        href="/calculators/employer-match"
        className="mt-4 block rounded-lg border border-[#444] bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-colors hover:border-[#c5a059] hover:text-[#c5a059]"
      >
        Learn More
      </a>
    </div>
  );
}
