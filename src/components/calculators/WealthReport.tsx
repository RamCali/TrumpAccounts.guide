import { useState, useMemo, useRef, useCallback } from 'react';
import { calculateGrowth, calculateLifetimeGrowth } from '../../lib/calculators/growth';
import SliderInput from './shared/SliderInput';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function generateCertificateCanvas(
  childName: string,
  at18: number,
  at30: number,
  at65: number,
  monthly: number,
  returnRate: number,
): HTMLCanvasElement {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, W, H);

  // Gold border
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Inner accent line
  ctx.strokeStyle = 'rgba(197,160,89,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  // Header
  ctx.fillStyle = '#c5a059';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TRUMP ACCOUNT WEALTH PROJECTION', W / 2, 72);

  // Child name
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px system-ui, sans-serif';
  ctx.fillText(childName || 'Your Child', W / 2, 120);

  // Divider
  ctx.strokeStyle = 'rgba(197,160,89,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, 142);
  ctx.lineTo(W * 0.75, 142);
  ctx.stroke();

  // Three milestone columns
  const milestones = [
    { label: 'Age 18', sublabel: 'College / Trade School', value: at18 },
    { label: 'Age 30', sublabel: 'House Down Payment', value: at30 },
    { label: 'Age 65', sublabel: 'Retirement', value: at65 },
  ];

  const colW = (W - 120) / 3;
  milestones.forEach((m, i) => {
    const cx = 60 + colW * i + colW / 2;

    // Label
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.label.toUpperCase(), cx, 190);

    // Value
    ctx.fillStyle = i === 2 ? '#c5a059' : '#ffffff';
    ctx.font = `700 ${i === 2 ? 48 : 40}px system-ui, sans-serif`;
    ctx.fillText(fmt(m.value), cx, i === 2 ? 248 : 240);

    // Sublabel
    ctx.fillStyle = '#666666';
    ctx.font = '400 14px system-ui, sans-serif';
    ctx.fillText(m.sublabel, cx, 270);
  });

  // Assumptions box
  ctx.fillStyle = 'rgba(197,160,89,0.08)';
  roundRect(ctx, 60, 310, W - 120, 80, 8);
  ctx.fill();
  ctx.fillStyle = '#9e9e9e';
  ctx.font = '400 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Based on $1,000 federal deposit + $${monthly}/mo contribution · ${returnRate}% avg annual return`,
    W / 2, 345
  );
  ctx.fillText(
    'Invested in S&P 500 index funds · Converts to Traditional IRA at age 18',
    W / 2, 370
  );

  // Disclaimer
  ctx.fillStyle = '#555555';
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillText(
    'Hypothetical projection for educational purposes only. Not financial advice. Actual returns will vary.',
    W / 2, 430
  );

  // CTA / URL
  ctx.fillStyle = '#c5a059';
  ctx.font = '600 16px system-ui, sans-serif';
  ctx.fillText('Calculate yours free at TrumpAccounts.guide', W / 2, 480);

  // Small logo text
  ctx.fillStyle = '#444444';
  ctx.font = '400 12px system-ui, sans-serif';
  ctx.fillText('TrumpAccounts.guide — Your Plain-English Guide to IRC §530A', W / 2, H - 50);

  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function WealthReport() {
  const [childName, setChildName] = useState('');
  const [monthly, setMonthly] = useState(200);
  const [returnRate, setReturnRate] = useState(8);
  const previewRef = useRef<HTMLDivElement>(null);

  const at18 = useMemo(() =>
    calculateGrowth({ birthYear: 2025, pilotDeposit: 1000, monthlyContribution: monthly, annualReturn: returnRate / 100, endAge: 18 }).finalBalance,
    [monthly, returnRate]
  );

  const at30 = useMemo(() =>
    calculateLifetimeGrowth({ birthYear: 2025, pilotDeposit: 1000, monthlyContribution: monthly, annualReturn: returnRate / 100, retirementAge: 30, postIRAContribution: 0 }).finalBalance,
    [monthly, returnRate]
  );

  const at65 = useMemo(() =>
    calculateLifetimeGrowth({ birthYear: 2025, pilotDeposit: 1000, monthlyContribution: monthly, annualReturn: returnRate / 100, retirementAge: 65, postIRAContribution: 0 }).finalBalance,
    [monthly, returnRate]
  );

  const downloadReport = useCallback(() => {
    const canvas = generateCertificateCanvas(childName, at18, at30, at65, monthly, returnRate);
    const link = document.createElement('a');
    link.download = `${childName || 'TrumpAccount'}-Wealth-Projection.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [childName, at18, at30, at65, monthly, returnRate]);

  const shareReport = useCallback(async () => {
    const canvas = generateCertificateCanvas(childName, at18, at30, at65, monthly, returnRate);
    const text = `${childName || 'My child'}'s Trump Account could grow to ${fmt(at65)} by retirement! Free $1,000 federal deposit for babies born 2025-2028. Calculate yours: https://trumpaccounts.guide/tools/wealth-report`;

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        const file = new File([blob], 'wealth-projection.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ text, files: [file] });
          return;
        }
      } catch { /* fall through */ }
    }

    try {
      await navigator.clipboard.writeText(text);
      alert('Projection details copied to clipboard!');
    } catch {
      // Fallback: do nothing
    }
  }, [childName, at18, at30, at65, monthly, returnRate]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Create Your Child's Wealth Map</h2>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-300">Child's First Name (optional)</label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Enter name for personalized report"
            maxLength={30}
            className="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none"
          />
        </div>

        <SliderInput
          label="Monthly Contribution"
          value={monthly}
          min={0}
          max={417}
          step={25}
          onChange={setMonthly}
          prefix="$"
          suffix="/mo"
          helpText="Max $5,000/year ($417/mo) from all sources"
        />

        <SliderInput
          label="Expected Annual Return"
          value={returnRate}
          min={4}
          max={12}
          step={0.5}
          onChange={setReturnRate}
          suffix="%"
          helpText="S&P 500 historical average: ~10% (7% after inflation)"
        />
      </div>

      {/* Preview card */}
      <div ref={previewRef} className="rounded-xl border-2 border-gold-400/30 bg-surface-900 p-6 shadow-sm">
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wider text-gold-400">
          Trump Account Wealth Projection
        </p>
        <h3 className="mb-6 text-center text-2xl font-bold text-white">
          {childName || 'Your Child'}
        </h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Age 18</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white md:text-3xl">{fmt(at18)}</p>
            <p className="mt-0.5 text-xs text-gray-500">College / Trade School</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Age 30</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white md:text-3xl">{fmt(at30)}</p>
            <p className="mt-0.5 text-xs text-gray-500">House Down Payment</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Age 65</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gold-400 md:text-3xl">{fmt(at65)}</p>
            <p className="mt-0.5 text-xs text-gray-500">Retirement</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-gold-400/5 px-4 py-3 text-center">
          <p className="text-xs text-gray-400">
            Based on $1,000 federal deposit + ${monthly}/mo · {returnRate}% avg annual return · S&P 500 index funds
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={downloadReport}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-3 font-semibold text-surface-900 transition-colors hover:bg-gold-400"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Wealth Map
        </button>
        <button
          onClick={shareReport}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface-600 px-5 py-3 font-semibold text-white transition-colors hover:border-gold-400/40 hover:bg-surface-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Projection
        </button>
      </div>

      <p className="text-center text-xs text-gray-600">
        Hypothetical projection for educational purposes only. Not financial advice. Actual returns will vary.
      </p>
    </div>
  );
}
