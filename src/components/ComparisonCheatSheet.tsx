import { useCallback, useState } from 'react';

interface ComparisonRow {
  feature: string;
  trumpAccount: string;
  plan529: string;
  winner: 'trump' | '529' | 'tie';
}

const rows: ComparisonRow[] = [
  { feature: 'Federal Seed Money', trumpAccount: '$1,000 free deposit', plan529: 'None', winner: 'trump' },
  { feature: 'Annual Limit', trumpAccount: '$5,000/yr', plan529: '$18,000+/yr (varies by state)', winner: '529' },
  { feature: 'Use After 18', trumpAccount: 'Anything (converts to IRA)', plan529: 'Education expenses only', winner: 'trump' },
  { feature: 'Tax on Growth', trumpAccount: 'Tax-deferred', plan529: 'Tax-free (if for education)', winner: '529' },
  { feature: 'Employer Match', trumpAccount: 'Up to $2,500/yr tax-free', plan529: 'Not available', winner: 'trump' },
  { feature: 'Income Restrictions', trumpAccount: 'None', plan529: 'None', winner: 'tie' },
  { feature: 'Investment Options', trumpAccount: 'S&P 500 index funds only', plan529: 'State plan options (varies)', winner: '529' },
  { feature: 'FAFSA Impact', trumpAccount: 'Counted as child\'s asset', plan529: 'Parental asset (lower impact)', winner: '529' },
];

function generateCheatSheetCanvas(): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Title
  ctx.fillStyle = '#c5a059';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHEAT SHEET', W / 2, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 32px system-ui, sans-serif';
  ctx.fillText('Trump Account vs 529 Plan', W / 2, 115);

  ctx.fillStyle = '#666666';
  ctx.font = '400 14px system-ui, sans-serif';
  ctx.fillText('Updated 2026 — Side-by-Side Comparison', W / 2, 145);

  // Table header
  const tableTop = 185;
  const colX = [60, 380, 730];
  const colW = [300, 330, 310];

  ctx.fillStyle = 'rgba(197,160,89,0.15)';
  ctx.fillRect(40, tableTop, W - 80, 45);

  ctx.fillStyle = '#9e9e9e';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('FEATURE', colX[0], tableTop + 28);

  ctx.fillStyle = '#c5a059';
  ctx.fillText('TRUMP ACCOUNT', colX[1], tableTop + 28);

  ctx.fillStyle = '#60a5fa';
  ctx.fillText('529 PLAN', colX[2], tableTop + 28);

  // Table rows
  const rowHeight = 65;
  rows.forEach((row, i) => {
    const y = tableTop + 45 + i * rowHeight;

    // Alternating row background
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(40, y, W - 80, rowHeight);
    }

    // Row divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, y + rowHeight);
    ctx.lineTo(W - 40, y + rowHeight);
    ctx.stroke();

    const textY = y + 38;

    // Feature name
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(row.feature, colX[0], textY);

    // Trump Account value
    ctx.fillStyle = row.winner === 'trump' ? '#c5a059' : '#bbbbbb';
    ctx.font = `${row.winner === 'trump' ? '600' : '400'} 14px system-ui, sans-serif`;
    ctx.fillText(row.trumpAccount, colX[1], textY);
    if (row.winner === 'trump') {
      ctx.fillText(' \u2713', colX[1] + ctx.measureText(row.trumpAccount).width + 4, textY);
    }

    // 529 value
    ctx.fillStyle = row.winner === '529' ? '#60a5fa' : '#bbbbbb';
    ctx.font = `${row.winner === '529' ? '600' : '400'} 14px system-ui, sans-serif`;
    ctx.fillText(row.plan529, colX[2], textY);
    if (row.winner === '529') {
      ctx.fillText(' \u2713', colX[2] + ctx.measureText(row.plan529).width + 4, textY);
    }
  });

  // Bottom verdict
  const verdictY = tableTop + 45 + rows.length * rowHeight + 40;

  ctx.fillStyle = 'rgba(197,160,89,0.08)';
  roundRect(ctx, 60, verdictY, W - 120, 80, 10);
  ctx.fill();

  ctx.fillStyle = '#c5a059';
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Best Answer: Use Both', W / 2, verdictY + 35);

  ctx.fillStyle = '#9e9e9e';
  ctx.font = '400 14px system-ui, sans-serif';
  ctx.fillText('529 for education. Trump Account for everything else. They complement each other.', W / 2, verdictY + 60);

  // CTA
  ctx.fillStyle = '#c5a059';
  ctx.font = '600 16px system-ui, sans-serif';
  ctx.fillText('Full comparison at TrumpAccounts.guide/compare', W / 2, verdictY + 120);

  // Footer
  ctx.fillStyle = '#444444';
  ctx.font = '400 11px system-ui, sans-serif';
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

export default function ComparisonCheatSheet() {
  const [saved, setSaved] = useState(false);

  const downloadCheatSheet = useCallback(() => {
    const canvas = generateCheatSheetCanvas();
    const link = document.createElement('a');
    link.download = 'Trump-Account-vs-529-Cheat-Sheet.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const shareCheatSheet = useCallback(async () => {
    const text = `Trump Account vs 529 — which is better? Quick answer: Use both.\n\n• Trump Account: $1,000 free deposit, flexible use at 18, employer match available\n• 529: Tax-free growth for education, higher limits\n\nFull comparison: https://trumpaccounts.guide/compare/trump-account-vs-529`;

    if (navigator.share) {
      try {
        const canvas = generateCheatSheetCanvas();
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        const file = new File([blob], 'cheat-sheet.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ text, files: [file] });
          return;
        }
        await navigator.share({ text });
        return;
      } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('Comparison copied to clipboard!');
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="rounded-xl border border-gold-400/20 bg-surface-800 p-6">
      <h3 className="mb-2 text-lg font-bold text-white">Save This Comparison</h3>
      <p className="mb-4 text-sm text-gray-400">
        Download the cheat sheet or share it with other parents who are trying to decide.
      </p>

      {/* Quick visual preview */}
      <div className="mb-5 overflow-x-auto rounded-lg border border-surface-600 bg-surface-900">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-600">
              <th className="px-3 py-2 text-left text-gray-500">Feature</th>
              <th className="px-3 py-2 text-left text-gold-400">Trump Account</th>
              <th className="px-3 py-2 text-left text-blue-400">529 Plan</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            {rows.slice(0, 4).map((row) => (
              <tr key={row.feature} className="border-b border-surface-700/50">
                <td className="px-3 py-2 font-medium text-gray-300">{row.feature}</td>
                <td className={`px-3 py-2 ${row.winner === 'trump' ? 'text-gold-400 font-medium' : ''}`}>{row.trumpAccount}</td>
                <td className={`px-3 py-2 ${row.winner === '529' ? 'text-blue-400 font-medium' : ''}`}>{row.plan529}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-3 py-2 text-center text-xs text-gray-600">+ {rows.length - 4} more comparisons in the full cheat sheet</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={downloadCheatSheet}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-surface-900 transition-colors hover:bg-gold-400"
        >
          {saved ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Cheat Sheet
            </>
          )}
        </button>
        <button
          onClick={shareCheatSheet}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold-400/40 hover:bg-surface-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share with Parents
        </button>
      </div>
    </div>
  );
}
