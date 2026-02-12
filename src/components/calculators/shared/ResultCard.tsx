interface ResultCardProps {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}

export default function ResultCard({ label, value, sublabel, highlight = false }: ResultCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        highlight
          ? 'border-gold-400/50 bg-gold-400/10'
          : 'border-surface-600 bg-surface-800'
      }`}
    >
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          highlight ? 'text-gold-400' : 'text-white'
        }`}
      >
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
    </div>
  );
}
