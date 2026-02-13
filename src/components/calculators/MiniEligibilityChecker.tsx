import { useState, useMemo } from 'react';

const DEFAULT_T = {
  title: 'Eligibility Checker',
  birthDate: 'Birth Date (2025–2028)',
  birthYearAria: "Child's birth year",
  usCitizen: 'US Citizen?',
  usCitizenAria: 'US Citizen toggle',
  validSSN: 'Valid SSN',
  validSSNAria: 'Valid SSN toggle',
  eligible: 'You Qualify for the',
  grant: '$1,000 Grant!',
  notEligible: 'Not currently eligible',
  mustBeCitizen: 'Must be a U.S. citizen. ',
  ssnRequired: 'Valid SSN required. ',
};

type Translations = typeof DEFAULT_T;

interface MiniEligibilityCheckerProps {
  translations?: Partial<Translations>;
}

export default function MiniEligibilityChecker({ translations }: MiniEligibilityCheckerProps = {}) {
  const t = { ...DEFAULT_T, ...translations };
  const [birthYear, setBirthYear] = useState(2025);
  const [isCitizen, setIsCitizen] = useState(true);
  const [hasSSN, setHasSSN] = useState(true);

  const result = useMemo(() => {
    const eligible = isCitizen && hasSSN && birthYear >= 2025 && birthYear <= 2028;
    const pilotEligible = birthYear >= 2025 && birthYear <= 2028;
    return { eligible, pilotEligible };
  }, [birthYear, isCitizen, hasSSN]);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <h3 className="mb-4 text-lg font-bold text-white">{t.title}</h3>

      {/* Birth Date */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-400">
          {t.birthDate}
        </label>
        <select
          value={birthYear}
          onChange={(e) => setBirthYear(Number(e.target.value))}
          className="w-full rounded-lg border border-[#333] bg-[#222] px-3 py-2 text-sm text-white focus:border-[#c5a059] focus:outline-none"
          aria-label={t.birthYearAria}
        >
          {[2025, 2026, 2027, 2028].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Toggle: US Citizen */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">{t.usCitizen}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isCitizen}
          aria-label={t.usCitizenAria}
          onClick={() => setIsCitizen(!isCitizen)}
          className={`toggle-switch ${isCitizen ? 'active' : ''}`}
        />
      </div>

      {/* Toggle: Valid SSN */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">{t.validSSN}</span>
        <button
          type="button"
          role="switch"
          aria-checked={hasSSN}
          aria-label={t.validSSNAria}
          onClick={() => setHasSSN(!hasSSN)}
          className={`toggle-switch ${hasSSN ? 'active' : ''}`}
        />
      </div>

      {/* Result */}
      {result.eligible ? (
        <div className="rounded-lg border border-green-600/40 bg-green-900/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-green-400">
            {t.eligible}{' '}
            <span className="text-green-300">{t.grant}</span>
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-red-600/40 bg-red-900/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-red-400">
            {t.notEligible}
          </p>
          <p className="mt-1 text-xs text-red-400/70">
            {!isCitizen && t.mustBeCitizen}
            {!hasSSN && t.ssnRequired}
          </p>
        </div>
      )}
    </div>
  );
}
