import { useState } from 'react';

type Step = 'birthdate' | 'citizenship' | 'ssn' | 'result';
type Eligibility = 'eligible' | 'ineligible' | 'partial';

interface EligibilityResult {
  status: Eligibility;
  pilotDeposit: boolean;
  message: string;
  details: string[];
}

export default function EligibilityChecker() {
  const [step, setStep] = useState<Step>('birthdate');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [isCitizen, setIsCitizen] = useState<boolean | null>(null);
  const [hasSSN, setHasSSN] = useState<boolean | null>(null);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const checkEligibility = (ssnAnswer: boolean) => {
    const year = parseInt(birthYear);
    const details: string[] = [];
    let status: Eligibility = 'eligible';
    let pilotDeposit = false;

    // Check citizenship
    if (!isCitizen) {
      status = 'ineligible';
      details.push('The child must be a U.S. citizen to qualify for a Trump Account.');
    }

    // Check SSN — use the passed value, not stale state
    if (!ssnAnswer) {
      status = 'ineligible';
      details.push('A valid Social Security Number (SSN) is required.');
    }

    // Check age — must be under 18 at end of election year
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age >= 18) {
      status = 'ineligible';
      details.push(`The child must be under 18 at the end of the election year. A ${year} birth means they are ${age} in ${currentYear}.`);
    } else {
      details.push(`Age check passed: born in ${year}, currently ${age} years old.`);
    }

    // Check pilot deposit eligibility (born 2025-2028)
    if (year >= 2025 && year <= 2028 && status !== 'ineligible') {
      pilotDeposit = true;
      details.push('Eligible for the $1,000 federal pilot deposit (born Jan 1, 2025 – Dec 31, 2028).');
    } else if (status !== 'ineligible') {
      details.push('Not eligible for the $1,000 federal pilot deposit (only for births 2025–2028).');
      if (year < 2025 && age < 18) {
        status = 'partial';
      }
    }

    let message = '';
    if (status === 'eligible') {
      message = pilotDeposit
        ? 'Great news! Your child qualifies for a Trump Account AND the $1,000 federal pilot deposit.'
        : 'Your child qualifies for a Trump Account, but not the $1,000 pilot deposit.';
    } else if (status === 'partial') {
      message = 'Your child can open a Trump Account, but is not eligible for the $1,000 pilot deposit.';
    } else {
      message = 'Unfortunately, your child does not currently qualify for a Trump Account.';
    }

    setResult({ status, pilotDeposit, message, details });
    setStep('result');
  };

  const reset = () => {
    setStep('birthdate');
    setBirthYear('');
    setBirthMonth('');
    setIsCitizen(null);
    setHasSSN(null);
    setResult(null);
  };

  const progressWidth = step === 'birthdate' ? '25%' : step === 'citizenship' ? '50%' : step === 'ssn' ? '75%' : '100%';

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-surface-600 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold-400 transition-all duration-300"
          style={{ width: progressWidth }}
        />
      </div>

      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm min-h-[300px]">
        {/* Step 1: Birth Date */}
        {step === 'birthdate' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">When was your child born?</h2>
            <p className="text-sm text-gray-400">
              We need this to check age eligibility and pilot deposit qualification.
            </p>
            <div className="flex gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Birth Year</label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="rounded-lg border border-surface-600 bg-surface-800 text-gray-200 px-3 py-2 text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                  aria-label="Birth year"
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 30 }, (_, i) => 2028 - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Birth Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="rounded-lg border border-surface-600 bg-surface-800 text-gray-200 px-3 py-2 text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                  aria-label="Birth month"
                >
                  <option value="">Select month</option>
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setStep('citizenship')}
              disabled={!birthYear}
              className="mt-4 rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Citizenship */}
        {step === 'citizenship' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Is your child a U.S. citizen?</h2>
            <p className="text-sm text-gray-400">
              Trump Accounts are available only to U.S. citizens.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsCitizen(true); setStep('ssn'); }}
                className={`flex-1 rounded-lg border-2 px-6 py-4 text-center font-semibold transition-colors ${
                  isCitizen === true ? 'border-gold-400 bg-gold-400/20 text-gold-400' : 'border-surface-600 hover:border-surface-500'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => { setIsCitizen(false); setStep('ssn'); }}
                className={`flex-1 rounded-lg border-2 px-6 py-4 text-center font-semibold transition-colors ${
                  isCitizen === false ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-surface-600 hover:border-surface-500'
                }`}
              >
                No
              </button>
            </div>
            <button onClick={() => setStep('birthdate')} className="text-sm text-gray-500 hover:text-gray-300">
              &larr; Back
            </button>
          </div>
        )}

        {/* Step 3: SSN */}
        {step === 'ssn' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Does your child have a valid SSN?</h2>
            <p className="text-sm text-gray-400">
              A valid Social Security Number is required to open a Trump Account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setHasSSN(true); checkEligibility(true); }}
                className="flex-1 rounded-lg border-2 border-surface-600 px-6 py-4 text-center font-semibold hover:border-surface-500 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => { setHasSSN(false); checkEligibility(false); }}
                className="flex-1 rounded-lg border-2 border-surface-600 px-6 py-4 text-center font-semibold hover:border-surface-500 transition-colors"
              >
                No
              </button>
            </div>
            <button onClick={() => setStep('citizenship')} className="text-sm text-gray-500 hover:text-gray-300">
              &larr; Back
            </button>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <div className="space-y-4">
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              result.status === 'eligible'
                ? 'bg-mint-400/20 text-mint-400'
                : result.status === 'partial'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {result.status === 'eligible' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : result.status === 'partial' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              )}
              {result.status === 'eligible' ? 'Eligible' : result.status === 'partial' ? 'Partially Eligible' : 'Not Eligible'}
            </div>

            <h2 className="text-lg font-bold text-white">{result.message}</h2>

            {result.pilotDeposit && (
              <div className="rounded-lg border border-mint-400/30 bg-mint-400/10 p-4">
                <p className="font-semibold text-mint-300">$1,000 Federal Pilot Deposit: Eligible</p>
                <p className="text-sm text-mint-400 mt-1">
                  Your child qualifies for the one-time $1,000 federal deposit for children born 2025–2028.
                </p>
              </div>
            )}

            <ul className="space-y-2">
              {result.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-0.5 text-gray-500">&bull;</span>
                  {detail}
                </li>
              ))}
            </ul>

            {result.status !== 'ineligible' && (
              <div className="rounded-lg border border-gold-400/30 bg-gold-400/10 p-4">
                <p className="text-sm text-gold-300">
                  <strong>Next step:</strong> File{' '}
                  <a href="https://trumpaccounts.gov" target="_blank" rel="noopener noreferrer" className="underline">
                    IRS Form 4547
                  </a>{' '}
                  with your 2025 tax return (due April 15, 2026) or through the trumpaccounts.gov portal (available mid-2026).
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={reset}
                className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-600 transition-colors"
              >
                Check Another Child
              </button>
              <a
                href="/calculators/growth-calculator"
                className="rounded-lg border border-surface-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-surface-700/50 no-underline transition-colors"
              >
                See Growth Projections &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
