export default function ConfidenceBadge({ score }) {
  const color =
    score >= 90 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' :
    score >= 70 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' :
    'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {score}% confidence
    </span>
  );
}
