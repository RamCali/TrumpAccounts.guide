import { useState, useMemo } from 'react';

export default function MiniEligibilityChecker() {
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
      <h3 className="mb-4 text-lg font-bold text-white">Eligibility Checker</h3>

      {/* Birth Date */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-400">
          Birth Date (2025–2028)
        </label>
        <select
          value={birthYear}
          onChange={(e) => setBirthYear(Number(e.target.value))}
          className="w-full rounded-lg border border-[#333] bg-[#222] px-3 py-2 text-sm text-white focus:border-[#c5a059] focus:outline-none"
          aria-label="Child's birth year"
        >
          {[2025, 2026, 2027, 2028].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Toggle: US Citizen */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">US Citizen?</span>
        <button
          type="button"
          role="switch"
          aria-checked={isCitizen}
          aria-label="US Citizen toggle"
          onClick={() => setIsCitizen(!isCitizen)}
          className={`toggle-switch ${isCitizen ? 'active' : ''}`}
        />
      </div>

      {/* Toggle: Valid SSN */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">Valid SSN</span>
        <button
          type="button"
          role="switch"
          aria-checked={hasSSN}
          aria-label="Valid SSN toggle"
          onClick={() => setHasSSN(!hasSSN)}
          className={`toggle-switch ${hasSSN ? 'active' : ''}`}
        />
      </div>

      {/* Result */}
      {result.eligible ? (
        <div className="rounded-lg border border-green-600/40 bg-green-900/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-green-400">
            You Qualify for the{' '}
            <span className="text-green-300">$1,000 Grant!</span>
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-red-600/40 bg-red-900/20 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-red-400">
            Not currently eligible
          </p>
          <p className="mt-1 text-xs text-red-400/70">
            {!isCitizen && 'Must be a U.S. citizen. '}
            {!hasSSN && 'Valid SSN required. '}
          </p>
        </div>
      )}
    </div>
  );
}
