import { useState } from 'react';

type Result = 'account-and-grant' | 'account-only' | 'not-eligible' | null;

export default function EligibilityQuiz() {
  const [birthYear, setBirthYear] = useState('');
  const [result, setResult] = useState<Result>(null);

  const currentYear = new Date().getFullYear();

  const check = () => {
    const year = parseInt(birthYear);
    if (isNaN(year)) return;

    const age = currentYear - year;

    if (age >= 18) {
      setResult('not-eligible');
    } else if (year >= 2025 && year <= 2028) {
      setResult('account-and-grant');
    } else {
      setResult('account-only');
    }
  };

  const reset = () => {
    setBirthYear('');
    setResult(null);
  };

  if (result) {
    return (
      <div className="space-y-6">
        {result === 'account-and-grant' && (
          <div className="rounded-xl border-2 border-mint-400 bg-mint-400/10 p-6 text-center">
            <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-mint-400/20">
              <svg className="h-8 w-8 text-mint-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-white">
              Your child qualifies for an account + the $1,000 grant!
            </h2>
            <p className="text-mint-300">
              Children born {birthYear} are eligible for a Trump Account <strong>and</strong> the
              one-time $1,000 federal pilot deposit.
            </p>
          </div>
        )}

        {result === 'account-only' && (
          <div className="rounded-xl border-2 border-gold-400 bg-gold-400/10 p-6 text-center">
            <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20">
              <svg className="h-8 w-8 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-white">
              Your child qualifies for an account (but not the grant)
            </h2>
            <p className="mb-4 text-gold-300">
              The $1,000 pilot deposit is only for children born 2025–2028.
              But here's why you should still open one:
            </p>
            <ul className="mx-auto max-w-md space-y-2 text-left text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-gold-400">1.</span>
                <span>Contribute up to <strong className="text-white">$5,000/year</strong> (after-tax) toward your child's future</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-gold-400">2.</span>
                <span>Your employer can add up to <strong className="text-white">$2,500/year</strong> tax-free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-gold-400">3.</span>
                <span>Money grows in S&P 500 index funds until age 18, then converts to an IRA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-gold-400">4.</span>
                <span>No income limits — every U.S. citizen child qualifies</span>
              </li>
            </ul>
          </div>
        )}

        {result === 'not-eligible' && (
          <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-6 text-center">
            <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-white">
              Not eligible — must be under 18
            </h2>
            <p className="text-gray-400">
              Trump Accounts are for U.S. citizen children under 18. A child born in {birthYear} is {currentYear - parseInt(birthYear)} years old in {currentYear}.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg border border-surface-600 px-6 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-surface-700/50"
          >
            Check Another Child
          </button>
          {result !== 'not-eligible' && (
            <a
              href="/how-to-open-trump-account"
              className="rounded-lg bg-gold-500 px-6 py-2.5 text-center text-sm font-semibold text-white no-underline transition-colors hover:bg-gold-600"
            >
              How to Open a Trump Account
            </a>
          )}
          <a
            href="/calculators/growth-calculator"
            className="rounded-lg border border-surface-600 px-6 py-2.5 text-center text-sm font-semibold text-gray-300 no-underline transition-colors hover:bg-surface-700/50"
          >
            See Growth Projections
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-extrabold text-white">
          What year was your child born?
        </h2>
        <p className="mb-6 text-sm text-gray-400">
          One question. Instant answer. No data stored.
        </p>

        <select
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          className="mb-6 w-full rounded-lg border border-surface-600 bg-surface-800 px-4 py-3 text-center text-lg text-gray-200 focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          aria-label="Child's birth year"
        >
          <option value="">Select year</option>
          {Array.from({ length: 30 }, (_, i) => 2028 - i).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button
          onClick={check}
          disabled={!birthYear}
          className="w-full rounded-lg bg-gold-500 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check Eligibility
        </button>
      </div>
    </div>
  );
}
