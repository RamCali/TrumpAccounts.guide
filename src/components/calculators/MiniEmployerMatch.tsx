import { useState, useMemo } from 'react';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const DEFAULT_T = {
  title: 'Employer Match Tool',
  trumpAccount: 'Trump Account',
  employerMatch: 'Employer Match',
  perYear: '/year',
  yourContrib: 'Your Contribution',
  yourContribAria: 'Your annual contribution',
  employerContrib: 'Employer Contribution',
  employerContribAria: 'Employer annual contribution',
  totalAnnual: 'Total Annual Benefit Increase:',
  cta: 'Learn More',
  ctaHref: '/calculators/employer-match',
};

type Translations = typeof DEFAULT_T;

interface MiniEmployerMatchProps {
  translations?: Partial<Translations>;
}

export default function MiniEmployerMatch({ translations }: MiniEmployerMatchProps = {}) {
  const t = { ...DEFAULT_T, ...translations };
  const [employerContrib, setEmployerContrib] = useState(2500);
  const [personalContrib, setPersonalContrib] = useState(2500);

  const totalAnnual = useMemo(() => {
    return Math.min(employerContrib + personalContrib, 5000);
  }, [employerContrib, personalContrib]);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">{t.title}</h3>

      {/* Two value displays side by side */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#333] bg-[#222] p-3 text-center">
          <p className="text-xs text-gray-400">{t.trumpAccount}</p>
          <p className="text-xl font-bold tabular-nums text-[#c5a059]">
            {fmt(personalContrib)}
            <span className="text-xs font-normal text-gray-500">{t.perYear}</span>
          </p>
        </div>
        <div className="rounded-lg border border-[#333] bg-[#222] p-3 text-center">
          <p className="text-xs text-gray-400">{t.employerMatch}</p>
          <p className="text-xl font-bold tabular-nums text-[#c5a059]">
            {fmt(employerContrib)}
            <span className="text-xs font-normal text-gray-500">{t.perYear}</span>
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs text-gray-400">{t.yourContrib}</label>
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
          aria-label={t.yourContribAria}
        />
      </div>
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs text-gray-400">{t.employerContrib}</label>
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
          aria-label={t.employerContribAria}
        />
      </div>

      {/* Total */}
      <p className="text-sm text-gray-400">{t.totalAnnual}</p>
      <p className="text-2xl font-bold tabular-nums text-white">
        {fmt(totalAnnual)}
        <span className="text-sm font-normal text-gray-500">{t.perYear}</span>
      </p>

      {/* CTA */}
      <a
        href={t.ctaHref}
        className="mt-4 block rounded-lg border border-[#444] bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-colors hover:border-[#c5a059] hover:text-[#c5a059]"
      >
        {t.cta}
      </a>
    </div>
  );
}
