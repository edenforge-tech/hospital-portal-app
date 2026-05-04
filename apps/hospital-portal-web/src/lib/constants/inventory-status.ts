/**
 * Centralised status definitions for the Inventory / Procurement modules.
 *
 * Each entry provides:
 *   label       – human-friendly display text
 *   badgeClass  – Tailwind classes for a compact inline badge
 *   dotClass    – Tailwind classes for a small colour dot (tabs, legends)
 *   description – one-line tooltip / aria-label text
 */

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

// ─── Purchase Invoice ─────────────────────────────────────────────────────────

export const INVOICE_STATUS: Record<string, StatusConfig> = {
  Draft: {
    label: 'Draft',
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    description: 'Invoice created but not yet submitted for approval.',
  },
  PrimaryApproved: {
    label: 'Primary Appr.',
    badgeClass: 'bg-blue-100 text-blue-700',
    dotClass: 'bg-blue-400',
    description: 'Invoice has received primary approval; awaiting final approval.',
  },
  Approved: {
    label: 'Approved',
    badgeClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    description: 'Invoice fully approved; GRN can be created.',
  },
  Rejected: {
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-400',
    description: 'Invoice was rejected and requires correction.',
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
    description: 'Invoice has been cancelled.',
  },
};

// ─── GRN ─────────────────────────────────────────────────────────────────────

export const GRN_STATUS: Record<string, StatusConfig> = {
  Draft: {
    label: 'Draft',
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    description: 'GRN created but not yet submitted for primary approval.',
  },
  PrimaryApproved: {
    label: 'Primary Appr.',
    badgeClass: 'bg-blue-100 text-blue-700',
    dotClass: 'bg-blue-400',
    description: 'GRN has primary approval; awaiting final approval.',
  },
  Approved: {
    label: 'Approved',
    badgeClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    description: 'GRN fully approved; stock has been received.',
  },
  Rejected: {
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-400',
    description: 'GRN was rejected.',
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
    description: 'GRN has been cancelled.',
  },
};

// ─── Bill Transfer ────────────────────────────────────────────────────────────

export const BT_STATUS: Record<string, StatusConfig> = {
  Draft: {
    label: 'Draft',
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    description: 'Bill Transfer generated; awaiting L1 approval.',
  },
  L1Approved: {
    label: 'L1 Approved',
    badgeClass: 'bg-blue-100 text-blue-700',
    dotClass: 'bg-blue-400',
    description: 'Bill Transfer approved at L1; awaiting L2 approval.',
  },
  L2Approved: {
    label: 'L2 Approved',
    badgeClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    description: 'Bill Transfer fully approved; payment can be scheduled.',
  },
  L1Rejected: {
    label: 'L1 Rejected',
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-400',
    description: 'Bill Transfer rejected at L1.',
  },
  L2Rejected: {
    label: 'L2 Rejected',
    badgeClass: 'bg-red-200 text-red-800',
    dotClass: 'bg-red-600',
    description: 'Bill Transfer rejected at L2.',
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
    description: 'Bill Transfer has been cancelled.',
  },
};

// ─── Invoice Settlement ───────────────────────────────────────────────────────

export const SETTLEMENT_STATUS: Record<string, StatusConfig> = {
  Pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    description: 'Settlement payment is pending.',
  },
  PartiallyPaid: {
    label: 'Partially Paid',
    badgeClass: 'bg-blue-100 text-blue-700',
    dotClass: 'bg-blue-400',
    description: 'Settlement has been partially paid.',
  },
  Paid: {
    label: 'Paid',
    badgeClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    description: 'Settlement fully paid.',
  },
  OnHold: {
    label: 'On Hold',
    badgeClass: 'bg-orange-100 text-orange-700',
    dotClass: 'bg-orange-400',
    description: 'Settlement has been placed on hold.',
  },
  WrittenOff: {
    label: 'Written Off',
    badgeClass: 'bg-purple-100 text-purple-700',
    dotClass: 'bg-purple-400',
    description: 'Settlement balance has been written off.',
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-400',
    description: 'Settlement has been cancelled.',
  },
};

// ─── Vendor Payment ───────────────────────────────────────────────────────────

export const VENDOR_PAYMENT_STATUS: Record<string, StatusConfig> = {
  active: {
    label: 'Recorded',
    badgeClass: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-400',
    description: 'Payment has been recorded.',
  },
  reversed: {
    label: 'Reversed',
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-400',
    description: 'Payment has been reversed.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a StatusConfig, falling back to a default grey badge if the key is unknown. */
export function getStatusConfig(map: Record<string, StatusConfig>, status: string): StatusConfig {
  return map[status] ?? {
    label: status,
    badgeClass: 'bg-gray-100 text-gray-500',
    dotClass: 'bg-gray-300',
    description: status,
  };
}
