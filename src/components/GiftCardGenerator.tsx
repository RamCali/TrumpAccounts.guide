import { useState, useCallback } from 'react';

const GIFT_AMOUNTS = [25, 50, 100, 250, 500];

function getProjectedValue(amount: number, years: number, rate: number): number {
  return amount * Math.pow(1 + rate, years);
}

function generateCardCanvas(childName: string, amount: number, futureValue: number): HTMLCanvasElement {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, W, H);

  // Decorative border
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Top label
  ctx.fillStyle = '#c5a059';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TRUMP ACCOUNT GIFT CARD', W / 2, 90);

  // Gift icon (simplified)
  ctx.fillStyle = '#c5a059';
  ctx.font = '64px system-ui, sans-serif';
  ctx.fillText('\uD83C\uDF81', W / 2, 190);

  // Main message
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 28px system-ui, sans-serif';
  ctx.fillText(`Instead of a toy, please contribute to`, W / 2, 280);

  // Child name
  ctx.fillStyle = '#c5a059';
  ctx.font = '700 44px system-ui, sans-serif';
  ctx.fillText(`${childName || "Our Child"}'s`, W / 2, 340);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px system-ui, sans-serif';
  ctx.fillText('Trump Account', W / 2, 390);

  // Amount highlight
  ctx.fillStyle = 'rgba(197,160,89,0.1)';
  roundRect(ctx, W / 2 - 200, 430, 400, 120, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(197,160,89,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, W / 2 - 200, 430, 400, 120, 12);
  ctx.stroke();

  ctx.fillStyle = '#9e9e9e';
  ctx.font = '400 14px system-ui, sans-serif';
  ctx.fillText('A gift of', W / 2, 465);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 48px system-ui, sans-serif';
  ctx.fillText(`$${amount}`, W / 2, 520);

  ctx.fillStyle = '#9e9e9e';
  ctx.font = '400 13px system-ui, sans-serif';
  ctx.fillText(`could grow to $${Math.round(futureValue).toLocaleString()} by retirement`, W / 2, 545);

  // How to contribute
  ctx.fillStyle = '#666666';
  ctx.font = '400 16px system-ui, sans-serif';
  ctx.fillText('Contribute via trumpaccounts.gov', W / 2, 640);
  ctx.fillText('or ask the parents for account details', W / 2, 665);

  // Bottom info
  ctx.fillStyle = '#c5a059';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.fillText('Learn more at TrumpAccounts.guide', W / 2, 750);

  ctx.fillStyle = '#444444';
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillText('Trump Accounts (IRC §530A) — Tax-advantaged investment accounts for children', W / 2, 790);
  ctx.fillText('Projected values assume 8% annual return. Not financial advice.', W / 2, 810);

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

export default function GiftCardGenerator() {
  const [childName, setChildName] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [copied, setCopied] = useState(false);

  const futureValue = getProjectedValue(selectedAmount, 65, 0.08);

  const messageText = `Instead of a toy, please contribute to ${childName || 'our child'}'s Trump Account! Every $${selectedAmount} today could be worth $${Math.round(futureValue).toLocaleString()} by retirement. Learn more: https://trumpaccounts.guide/tools/gift-card`;

  const downloadCard = useCallback(() => {
    const canvas = generateCardCanvas(childName, selectedAmount, futureValue);
    const link = document.createElement('a');
    link.download = `${childName || 'TrumpAccount'}-Gift-Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [childName, selectedAmount, futureValue]);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [messageText]);

  const shareCard = useCallback(async () => {
    if (navigator.share) {
      try {
        const canvas = generateCardCanvas(childName, selectedAmount, futureValue);
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        const file = new File([blob], 'gift-card.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ text: messageText, files: [file] });
          return;
        }
        await navigator.share({ text: messageText });
        return;
      } catch { /* fall through */ }
    }
    copyMessage();
  }, [childName, selectedAmount, futureValue, messageText, copyMessage]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Create Your Gift Card</h2>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-300">Child's First Name</label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="e.g., Emma"
            maxLength={20}
            className="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Suggested Gift Amount</label>
          <div className="flex flex-wrap gap-2">
            {GIFT_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedAmount === amt
                    ? 'border-gold-400/60 bg-gold-400/15 text-gold-400'
                    : 'border-surface-600 text-gray-400 hover:border-gold-400/30 hover:text-gray-200'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border-2 border-gold-400/30 bg-surface-900 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">Trump Account Gift Card</p>

        <p className="mt-4 text-lg text-gray-300">Instead of a toy, please contribute to</p>
        <p className="text-2xl font-bold text-gold-400">{childName || 'Our Child'}'s</p>
        <p className="text-xl font-bold text-white">Trump Account</p>

        <div className="mx-auto mt-5 max-w-xs rounded-lg border border-gold-400/20 bg-gold-400/5 p-4">
          <p className="text-sm text-gray-400">A gift of</p>
          <p className="text-4xl font-bold tabular-nums text-white">${selectedAmount}</p>
          <p className="mt-1 text-xs text-gray-500">
            could grow to <strong className="text-gray-300">${Math.round(futureValue).toLocaleString()}</strong> by retirement
          </p>
        </div>

        <p className="mt-4 text-sm text-gray-500">Contribute via trumpaccounts.gov</p>
      </div>

      {/* Copy message for group chat */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4">
        <p className="mb-2 text-sm font-medium text-gray-300">Message for Family Group Chat</p>
        <p className="rounded-lg bg-surface-900 px-4 py-3 text-sm text-gray-400">{messageText}</p>
      </div>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={downloadCard}
          className="flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-3 font-semibold text-surface-900 transition-colors hover:bg-gold-400"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Card
        </button>
        <button
          onClick={copyMessage}
          className="flex items-center justify-center gap-2 rounded-lg border border-surface-600 px-5 py-3 font-semibold text-white transition-colors hover:border-gold-400/40 hover:bg-surface-700"
        >
          {copied ? (
            <>
              <svg className="h-5 w-5 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy for Group Chat
            </>
          )}
        </button>
        <button
          onClick={shareCard}
          className="flex items-center justify-center gap-2 rounded-lg border border-surface-600 px-5 py-3 font-semibold text-white transition-colors hover:border-gold-400/40 hover:bg-surface-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
