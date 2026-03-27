'use client';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Pending:           { bg: 'bg-yellow-100',  text: 'text-yellow-800', dot: 'bg-yellow-500',  label: 'Pending' },
  Processed:         { bg: 'bg-blue-100',    text: 'text-blue-800',   dot: 'bg-blue-500',    label: 'Processed' },
  Done:              { bg: 'bg-green-100',   text: 'text-green-800',  dot: 'bg-green-500',   label: 'Done' },
  AddOnSurgery:      { bg: 'bg-purple-100',  text: 'text-purple-800', dot: 'bg-purple-500',  label: 'Add on Surgery' },
  RepeatCounselling: { bg: 'bg-orange-100',  text: 'text-orange-800', dot: 'bg-orange-400',  label: 'Repeat Counselling' },
  Confirmed:         { bg: 'bg-blue-100',    text: 'text-blue-800',   dot: 'bg-blue-500',    label: 'Confirmed' },
  NotConfirmed:      { bg: 'bg-orange-100',  text: 'text-orange-800', dot: 'bg-orange-400',  label: 'Not Confirmed' },
  Finalised:         { bg: 'bg-indigo-100',  text: 'text-indigo-800', dot: 'bg-indigo-600',  label: 'Finalised' },
  SurgeryDone:       { bg: 'bg-green-100',   text: 'text-green-800',  dot: 'bg-green-600',   label: 'Surgery Done' },
  Cancelled:         { bg: 'bg-gray-100',    text: 'text-gray-600',   dot: 'bg-gray-400',    label: 'Cancelled' },
  Expected:          { bg: 'bg-sky-100',     text: 'text-sky-800',    dot: 'bg-sky-400',     label: 'Expected' },
  Admitted:          { bg: 'bg-cyan-100',    text: 'text-cyan-800',   dot: 'bg-cyan-500',    label: 'Admitted' },
  ReadyForSurgery:   { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-500',    label: 'Ready for Surgery' },
  Discharged:        { bg: 'bg-gray-100',    text: 'text-gray-500',   dot: 'bg-gray-400',    label: 'Discharged' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'md', showDot = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: status,
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${config.bg} ${config.text}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}

/** Just the colored dot indicator (no text) */
export function StatusDot({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { dot: 'bg-gray-400', label: status };
  return (
    <span
      title={config.label}
      className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot}`}
    />
  );
}
