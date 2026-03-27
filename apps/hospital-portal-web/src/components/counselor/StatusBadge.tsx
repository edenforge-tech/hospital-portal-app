'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 
  // Insurance
  | 'Pending' | 'Approved' | 'Rejected' | 'Under Review'
  // Payments
  | 'Completed' | 'Refunded' | 'Active' | 'Paid' | 'Expired' | 'Cancelled'
  // Admissions
  | 'Scheduled' | 'Admitted' | 'Discharged' | 'Reserved' | 'Occupied' | 'Released'
  // Consents
  | 'Draft' | 'PatientSigned' | 'WitnessSigned' | 'Finalized'
  // Workflow
  | 'InProgress' | 'Blocked' | 'Completed';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  // Success states (Green)
  'Approved': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  'Completed': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  'Paid': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  'Discharged': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  'Finalized': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  'Released': { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  
  // Pending/In Progress states (Blue)
  'Pending': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'Under Review': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'InProgress': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'Scheduled': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'Admitted': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'Reserved': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'Active': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  'Draft': { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  
  // Warning states (Yellow)
  'PatientSigned': { variant: 'default', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  'WitnessSigned': { variant: 'default', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  'Occupied': { variant: 'default', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  
  // Error/Blocked states (Red)
  'Rejected': { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  'Refunded': { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  'Expired': { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  'Cancelled': { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  'Blocked': { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'secondary' as const, className: '' };
  
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {status}
    </Badge>
  );
}
