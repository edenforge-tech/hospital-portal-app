'use client';

/**
 * ExpiryDateBadge
 * Shows an expiry date with color coding based on proximity to expiry.
 *   Red    ≤ 30 days
 *   Amber  ≤ 90 days
 *   Gray   > 90 days or N/A
 */
interface Props {
  date?: string | null;
  className?: string;
}

export function ExpiryDateBadge({ date, className = '' }: Props) {
  if (!date) {
    return <span className={`text-gray-400 text-xs ${className}`}>N/A</span>;
  }

  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  const cls =
    days <= 0  ? 'text-red-700 font-semibold'  :
    days <= 30 ? 'text-red-600 font-semibold'  :
    days <= 90 ? 'text-amber-600 font-medium'  :
                 'text-gray-600';

  return (
    <span className={`text-xs ${cls} ${className}`}>
      {new Date(date).toLocaleDateString('en-IN')}
      {days <= 90 && days > 0 && <span className="ml-1">({days}d)</span>}
      {days <= 0  && <span className="ml-1">(Expired)</span>}
    </span>
  );
}
