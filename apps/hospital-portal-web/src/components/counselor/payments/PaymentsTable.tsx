'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PaymentTransaction } from '@/types/counselor';
import { useRefundPayment } from '@/hooks/use-payments';
import { toast } from 'sonner';

interface PaymentsTableProps {
  data: PaymentTransaction[];
  isLoading?: boolean;
  onSessionFilter?: (sessionId?: string) => void;
}

export function PaymentsTable({ data, isLoading }: PaymentsTableProps) {
  const refundPayment = useRefundPayment();

  const handleRefund = async (id: string) => {
    const refundAmount = prompt('Enter refund amount:');
    const refundReason = prompt('Enter refund reason:');
    
    if (!refundAmount || !refundReason) return;
    
    try {
      await refundPayment.mutateAsync({
        id,
        refundData: {
          refundAmount: parseFloat(refundAmount),
          refundReason,
        },
      });
      toast.success('Payment refunded successfully');
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const columns: ColumnDef<PaymentTransaction>[] = [
    {
      accessorKey: 'transactionNumber',
      header: 'Transaction #',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.transactionNumber}</div>
      ),
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.patientName}</div>
          <div className="text-xs text-muted-foreground">{row.original.patientId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `₹${row.original.amount.toLocaleString()}`,
    },
    {
      accessorKey: 'transactionStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.transactionStatus} />,
    },
    {
      accessorKey: 'receiptNumber',
      header: 'Receipt',
      cell: ({ row }) => row.original.receiptNumber || '-',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.original.transactionStatus === 'Completed' && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleRefund(row.original.id)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Refund
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="patientName"
      searchPlaceholder="Search by patient name..."
      pageSize={10}
    />
  );
}
