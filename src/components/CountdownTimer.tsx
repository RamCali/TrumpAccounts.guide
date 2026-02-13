import { useState, useEffect } from 'react';

/**
 * Countdown to the last day a child can be born and qualify for
 * the $1,000 federal pilot deposit (Dec 31, 2028).
 */
const DEADLINE = new Date('2029-01-01T00:00:00');

function getTimeLeft() {
  const now = new Date();
  const diff = DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.expired) {
    return (
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 text-center">
        <p className="text-sm font-medium text-gray-400">The $1,000 pilot deposit window has closed.</p>
        <p className="mt-1 text-xs text-gray-500">Children born after 2028 can still open Trump Accounts — they just won't receive the federal deposit.</p>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div className="rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/5 p-6">
      <p className="mb-1 text-center text-sm font-semibold uppercase tracking-wider text-[#c5a059]">
        $1,000 Free Deposit — Time Left
      </p>
      <p className="mb-4 text-center text-xs text-gray-400">
        Babies born before Dec 31, 2028 get a free $1,000 federal deposit
      </p>

      <div className="grid grid-cols-4 gap-3 text-center">
        {units.map((u) => (
          <div key={u.label}>
            <p className="text-3xl font-extrabold tabular-nums text-white md:text-4xl">
              {String(u.value).padStart(2, '0')}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">{u.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href="/calculators/eligibility-checker"
          className="inline-flex items-center rounded-lg bg-[#c5a059] px-5 py-2.5 text-sm font-semibold text-[#0d0d0d] no-underline transition-colors hover:bg-[#d4b06a]"
        >
          Check Eligibility
        </a>
        <button
          onClick={() => {
            const text = `Did you know? Babies born before Dec 31, 2028 get a FREE $1,000 federal investment deposit via Trump Accounts (IRC §530A). Check eligibility: https://trumpaccounts.guide/calculators/eligibility-checker`;
            if (navigator.share) {
              navigator.share({ title: '$1,000 Free Deposit for Your Baby', text }).catch(() => {});
            } else {
              navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#c5a059]/40 hover:bg-[#1a1a1a]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Send to a New Parent
        </button>
      </div>
    </div>
  );
}
