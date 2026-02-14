import { useState, useCallback } from 'react';

type CardType = 'birthday' | 'shower' | 'holiday';

const CARD_TYPES: { value: CardType; label: string; emoji: string; desc: string }[] = [
  { value: 'birthday', label: 'Birthday Party', emoji: '🎂', desc: 'Include with invitations' },
  { value: 'shower', label: 'Baby Shower', emoji: '👶', desc: 'For new parents' },
  { value: 'holiday', label: 'Holiday Gift', emoji: '🎄', desc: 'Christmas, Hanukkah, etc.' },
];

const GIFT_AMOUNTS = [25, 50, 100, 250, 500];

function projectValue(amount: number, years: number): number {
  return amount * Math.pow(1.08, Math.max(years, 0));
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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

const COPY = {
  birthday: {
    topLabel: 'BIRTHDAY CONTRIBUTION CARD',
    emoji: '🎂',
    tagline: 'This year, give a gift that keeps growing',
    cta: 'In lieu of another toy, please contribute via',
    giftLabel: 'A birthday gift of',
  },
  shower: {
    topLabel: 'BABY SHOWER GIFT CARD',
    emoji: '👶',
    tagline: 'Skip the onesie. Fund their future.',
    cta: 'Give the gift of compound interest via',
    giftLabel: 'A gift of',
  },
  holiday: {
    topLabel: 'HOLIDAY GIFT CARD',
    emoji: '🎄',
    tagline: 'This holiday, invest in their future',
    cta: 'Instead of another gadget, contribute via',
    giftLabel: 'A holiday gift of',
  },
} as const;

function getHeadline(cardType: CardType, name: string, age: number): string {
  if (cardType === 'birthday') return `${name} is turning ${age}!`;
  if (cardType === 'shower') return `Welcome, ${name}!`;
  return `Give ${name} a gift that grows`;
}

function generateCardCanvas(
  childName: string,
  age: number,
  amount: number,
  val18: number,
  val65: number,
  cardType: CardType,
): HTMLCanvasElement {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const cx = W / 2;

  const gold = '#c5a059';
  const white = '#ffffff';
  const gray = '#9e9e9e';
  const darkGray = '#666666';
  const tinyGray = '#444444';

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, W, H);

  // Decorative border
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Inner accent line
  ctx.strokeStyle = 'rgba(197,160,89,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(45, 45, W - 90, H - 90);

  ctx.textAlign = 'center';

  const copy = COPY[cardType];
  const name = childName || 'Our Child';
  const yearsTo18 = 18 - age;

  // Top label
  ctx.fillStyle = gold;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(copy.topLabel, cx, 95);
  ctx.letterSpacing = '0px';

  // Emoji
  ctx.font = '64px system-ui, sans-serif';
  ctx.fillText(copy.emoji, cx, 190);

  // Headline — dynamic size for long names
  const headline = getHeadline(cardType, name, age);
  const headlineSize = headline.length > 30 ? 30 : headline.length > 25 ? 34 : 38;
  ctx.fillStyle = white;
  ctx.font = `700 ${headlineSize}px system-ui, sans-serif`;
  ctx.fillText(headline, cx, 270);

  // Tagline
  ctx.fillStyle = gray;
  ctx.font = '400 22px system-ui, sans-serif';
  ctx.fillText(copy.tagline, cx, 318);

  // Projection box
  const boxY = 360;
  const boxH = yearsTo18 > 0 ? 210 : 170;
  ctx.fillStyle = 'rgba(197,160,89,0.06)';
  roundRect(ctx, cx - 260, boxY, 520, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(197,160,89,0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, cx - 260, boxY, 520, boxH, 16);
  ctx.stroke();

  ctx.fillStyle = gray;
  ctx.font = '400 16px system-ui, sans-serif';
  ctx.fillText(copy.giftLabel, cx, boxY + 40);

  ctx.fillStyle = white;
  ctx.font = '700 56px system-ui, sans-serif';
  ctx.fillText(`$${amount}`, cx, boxY + 105);

  if (yearsTo18 > 0) {
    ctx.fillStyle = gold;
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText(`could be worth $${Math.round(val18).toLocaleString()} by age 18`, cx, boxY + 150);

    ctx.fillStyle = gray;
    ctx.font = '400 15px system-ui, sans-serif';
    ctx.fillText(`and $${Math.round(val65).toLocaleString()} by retirement`, cx, boxY + 185);
  } else {
    ctx.fillStyle = gold;
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText(`could be worth $${Math.round(val65).toLocaleString()} by retirement`, cx, boxY + 150);
  }

  // CTA section
  const ctaY = boxY + boxH + 50;
  ctx.fillStyle = white;
  ctx.font = '500 18px system-ui, sans-serif';
  ctx.fillText(copy.cta, cx, ctaY);

  ctx.fillStyle = gold;
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('trumpaccounts.gov', cx, ctaY + 35);

  ctx.fillStyle = darkGray;
  ctx.font = '400 16px system-ui, sans-serif';
  ctx.fillText('or ask the parents for account details', cx, ctaY + 65);

  // Footer
  ctx.fillStyle = gold;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText('Learn more at TrumpAccounts.guide/birthday', cx, H - 120);

  ctx.fillStyle = tinyGray;
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillText('Trump Accounts (IRC §530A) — Tax-advantaged investment accounts for children', cx, H - 85);
  ctx.fillText('Projected values assume 8% average annual return. This is not financial advice.', cx, H - 68);

  return canvas;
}

export default function BirthdayCardGenerator() {
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(3);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [cardType, setCardType] = useState<CardType>('birthday');
  const [copied, setCopied] = useState(false);

  const effectiveAge = cardType === 'shower' ? 0 : childAge;
  const yearsTo18 = 18 - effectiveAge;
  const yearsTo65 = 65 - effectiveAge;
  const valueAt18 = projectValue(selectedAmount, yearsTo18);
  const valueAt65 = projectValue(selectedAmount, yearsTo65);

  const name = childName || 'our child';
  const displayName = childName || 'Our Child';

  const messageText =
    cardType === 'birthday'
      ? `🎂 Instead of another toy for ${name}'s ${ordinal(childAge)} birthday, please consider contributing to their Trump Account! A $${selectedAmount} gift today could be worth $${Math.round(valueAt18).toLocaleString()} by age 18. Learn more: https://trumpaccounts.guide/birthday`
      : cardType === 'shower'
        ? `👶 Welcome, ${name}! Instead of another onesie, consider contributing to their Trump Account. A $${selectedAmount} gift could be worth $${Math.round(valueAt18).toLocaleString()} by age 18! Learn more: https://trumpaccounts.guide/birthday`
        : `🎄 This holiday, give ${name} a gift that grows! A $${selectedAmount} contribution to their Trump Account could be worth $${Math.round(valueAt18).toLocaleString()} by age 18. Learn more: https://trumpaccounts.guide/birthday`;

  const downloadCard = useCallback(() => {
    const canvas = generateCardCanvas(childName, effectiveAge, selectedAmount, valueAt18, valueAt65, cardType);
    const link = document.createElement('a');
    const typeLabel = cardType === 'birthday' ? 'Birthday' : cardType === 'shower' ? 'BabyShower' : 'Holiday';
    link.download = `${childName || 'TrumpAccount'}-${typeLabel}-Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [childName, effectiveAge, selectedAmount, valueAt18, valueAt65, cardType]);

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
        const canvas = generateCardCanvas(childName, effectiveAge, selectedAmount, valueAt18, valueAt65, cardType);
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png'),
        );
        const file = new File([blob], 'birthday-card.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ text: messageText, files: [file] });
          return;
        }
        await navigator.share({ text: messageText });
        return;
      } catch { /* fall through */ }
    }
    copyMessage();
  }, [childName, effectiveAge, selectedAmount, valueAt18, valueAt65, cardType, messageText, copyMessage]);

  const copy = COPY[cardType];

  return (
    <div className="space-y-6">
      {/* Card Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {CARD_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setCardType(type.value)}
            className={`rounded-xl border p-3 text-center transition-all ${
              cardType === type.value
                ? 'border-gold-400/60 bg-gold-400/10 shadow-sm shadow-gold-400/10'
                : 'border-surface-600 hover:border-gold-400/30'
            }`}
          >
            <span className="block text-2xl">{type.emoji}</span>
            <span
              className={`mt-1 block text-sm font-medium ${
                cardType === type.value ? 'text-gold-400' : 'text-gray-300'
              }`}
            >
              {type.label}
            </span>
            <span className="block text-xs text-gray-500">{type.desc}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Customize Your Card</h2>

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

        {cardType !== 'shower' && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {cardType === 'birthday' ? 'Turning Age' : "Child's Age"}
            </label>
            <select
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
              className="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white focus:border-gold-400/50 focus:outline-none"
            >
              {Array.from({ length: 17 }, (_, i) => i + 1).map((age) => (
                <option key={age} value={age}>
                  {cardType === 'birthday' ? `Turning ${age}` : `${age} years old`}
                </option>
              ))}
            </select>
          </div>
        )}

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

      {/* Live Preview */}
      <div className="rounded-xl border-2 border-gold-400/30 bg-surface-900 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">{copy.topLabel}</p>

        <p className="mt-4 text-4xl">{copy.emoji}</p>

        <p className="mt-4 text-2xl font-bold text-white">
          {getHeadline(cardType, displayName, childAge)}
        </p>

        <p className="mt-2 text-lg text-gray-400">{copy.tagline}</p>

        <div className="mx-auto mt-5 max-w-xs rounded-lg border border-gold-400/20 bg-gold-400/5 p-4">
          <p className="text-sm text-gray-400">{copy.giftLabel}</p>
          <p className="text-4xl font-bold tabular-nums text-white">${selectedAmount}</p>
          {yearsTo18 > 0 && (
            <p className="mt-1 text-sm font-semibold text-gold-400">
              could be worth ${Math.round(valueAt18).toLocaleString()} by age 18
            </p>
          )}
          <p className="mt-0.5 text-xs text-gray-500">
            and <strong className="text-gray-300">${Math.round(valueAt65).toLocaleString()}</strong> by retirement
          </p>
        </div>

        <p className="mt-5 text-sm text-gray-400">{copy.cta}</p>
        <p className="font-semibold text-gold-400">trumpaccounts.gov</p>
      </div>

      {/* Group Chat Message */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4">
        <p className="mb-2 text-sm font-medium text-gray-300">
          {cardType === 'birthday'
            ? 'Message for Party Group Chat'
            : cardType === 'shower'
              ? 'Message for Baby Shower Group'
              : 'Message for Family Group Chat'}
        </p>
        <p className="rounded-lg bg-surface-900 px-4 py-3 text-sm leading-relaxed text-gray-400">
          {messageText}
        </p>
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

      {/* Viral prompt */}
      <div className="rounded-lg border border-surface-700 bg-surface-800/50 p-4 text-center">
        <p className="text-sm text-gray-400">
          Every parent at the party will see this card.{' '}
          <strong className="text-gold-400">That's the point.</strong>
        </p>
      </div>
    </div>
  );
}
