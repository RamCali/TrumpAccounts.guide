import { useState, useMemo } from 'react';
import { checkGrantEligibility, getDataSource } from '../../lib/calculators/grants';
import type { ZipLookupResult } from '../../lib/calculators/grants';

export default function GrantEligibilityChecker() {
  const [zip, setZip] = useState('');
  const [result, setResult] = useState<ZipLookupResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const isValid = /^\d{5}$/.test(zip.trim());

  const handleCheck = () => {
    if (!isValid) return;
    const r = checkGrantEligibility(zip);
    setResult(r);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) handleCheck();
  };

  const reset = () => {
    setZip('');
    setResult(null);
    setHasSearched(false);
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const eligibleGrants = result?.grants.filter((g) => g.eligible) ?? [];
  const ineligibleGrants = result?.grants.filter((g) => !g.eligible) ?? [];

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
        <h2 className="text-lg font-bold text-white">Enter your ZIP code</h2>
        <p className="mt-1 text-sm text-gray-400">
          We'll check if your area qualifies for grants like the Dell Foundation pledge.
        </p>

        <div className="mt-4 flex gap-3">
          <div className="relative flex-1 max-w-[200px]">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZip(v);
                if (hasSearched) setHasSearched(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 90210"
              aria-label="ZIP code"
              className="w-full rounded-lg border border-surface-600 bg-surface-700 px-4 py-3 text-lg font-mono text-white tracking-widest placeholder:text-gray-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
            {zip.length > 0 && zip.length < 5 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                {5 - zip.length} more
              </span>
            )}
          </div>
          <button
            onClick={handleCheck}
            disabled={!isValid}
            className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-white hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Check Eligibility
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          No data is stored. Everything runs in your browser.
        </p>
      </div>

      {/* Results */}
      {hasSearched && result && (
        <div className="space-y-4">
          {/* ZIP info card */}
          <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">ZIP Code</p>
                <p className="text-2xl font-bold text-white font-mono">{result.zip}</p>
              </div>
              {result.found && result.medianIncome !== null && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-400">Median Household Income</p>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {fmt(result.medianIncome)}
                  </p>
                  <p className="text-xs text-gray-500">ACS 5-Year Estimates (2018–2022)</p>
                </div>
              )}
            </div>

            {!result.found && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-300">
                  This ZIP code was not found in Census data. It may be a PO Box, military ZIP,
                  or newly created area. Try a nearby residential ZIP code.
                </p>
              </div>
            )}
          </div>

          {/* Eligible grants */}
          {eligibleGrants.length > 0 && (
            <div className="rounded-xl border border-mint-400/30 bg-mint-400/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-full bg-mint-400/20 p-1.5">
                  <svg className="h-5 w-5 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-mint-300">
                  Your ZIP code may qualify for {eligibleGrants.length === 1 ? '1 grant' : `${eligibleGrants.length} grants`}
                </h3>
              </div>

              {/* Total amount */}
              {result.totalEligibleAmount > 0 && (
                <div className="mb-4 rounded-lg border border-mint-400/20 bg-mint-400/10 p-4 text-center">
                  <p className="text-sm text-mint-400">Potential additional funding per child</p>
                  <p className="text-3xl font-bold text-mint-300 tabular-nums">
                    {fmt(result.totalEligibleAmount)}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {eligibleGrants.map(({ grant, reason }) => (
                  <div key={grant.id} className="rounded-lg border border-surface-600 bg-surface-800 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white">{grant.name}</p>
                        <p className="text-sm text-gray-400">{grant.organization}</p>
                      </div>
                      <span className="rounded-full bg-mint-400/20 px-3 py-1 text-sm font-semibold text-mint-400">
                        {grant.amountLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{grant.description}</p>
                    <p className="mt-1 text-xs text-mint-400">{reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>Age requirement: {grant.eligibility.maxAgeLabel}</span>
                      <span>&middot;</span>
                      <span>U.S. citizen required</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ineligible grants */}
          {result.found && ineligibleGrants.length > 0 && (
            <div className="rounded-xl border border-surface-600 bg-surface-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-full bg-red-500/20 p-1.5">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Not eligible</h3>
              </div>

              <div className="space-y-3">
                {ineligibleGrants.map(({ grant, reason }) => (
                  <div key={grant.id} className="rounded-lg border border-surface-600 bg-surface-700 p-4">
                    <p className="font-semibold text-gray-300">{grant.name}</p>
                    <p className="mt-1 text-sm text-red-400">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Still eligible for Trump Account callout */}
          <div className="rounded-xl border border-gold-400/30 bg-gold-400/5 p-6">
            <h3 className="font-bold text-gold-300">
              {eligibleGrants.length > 0
                ? 'What this means for your Trump Account'
                : 'Your child may still qualify for a Trump Account'}
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              {eligibleGrants.length > 0
                ? `This ${fmt(result.totalEligibleAmount)} grant supplements the Trump Account. Combined with the $1,000 federal pilot deposit (for children born 2025–2028) and your own contributions of up to $5,000/year, this can grow significantly over 18 years.`
                : 'Grant eligibility is based on ZIP code median income. Even without grants, every eligible U.S. citizen child can open a Trump Account with up to $5,000/year in contributions and potentially receive the $1,000 federal pilot deposit (born 2025–2028).'}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="/calculators/growth-calculator"
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gold-600 no-underline transition-colors"
              >
                See Growth Projections
              </a>
              <a
                href="/calculators/eligibility-checker"
                className="rounded-lg border border-surface-600 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-surface-700/50 no-underline transition-colors"
              >
                Check Child Eligibility
              </a>
            </div>
          </div>

          {/* Data disclaimer */}
          <div className="rounded-lg border border-surface-600 bg-surface-800 p-4">
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Data source:</strong> {getDataSource()}.
              Median household income is for the ZIP Code Tabulation Area (ZCTA), which may
              differ slightly from USPS ZIP codes. Individual grant programs will publish their
              own official eligibility lists — this tool provides an estimate based on publicly
              available data.
            </p>
          </div>

          {/* Search again */}
          <button
            onClick={reset}
            className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 transition-colors"
          >
            Check Another ZIP Code
          </button>
        </div>
      )}
    </div>
  );
}
