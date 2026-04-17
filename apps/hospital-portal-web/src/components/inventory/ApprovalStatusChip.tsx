'use client';

/**
 * ApprovalStatusChip
 * Unified colored badge for all inventory approval statuses.
 * Covers both GRN and Invoice workflows.
 */
const STATUS_STYLES: Record<string, string> = {
  Draft:             'bg-gray-100 text-gray-600',
  PrimaryApproved:   'bg-yellow-100 text-yellow-700',
  Approved:          'bg-green-100 text-green-700',
  PartiallyAccepted: 'bg-blue-100  text-blue-700',
  Rejected:          'bg-red-100   text-red-700',
  Cancelled:         'bg-gray-200  text-gray-500',
};

interface Props {
  status: string;
  className?: string;
}

export function ApprovalStatusChip({ status, className = '' }: Props) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style} ${className}`}
    >
      {status}
    </span>
  );
}
