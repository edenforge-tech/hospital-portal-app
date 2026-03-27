'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { InsurancePreAuth } from '@/types/counselor';
import { useDeletePreAuth } from '@/hooks/use-insurance';
import { toast } from 'sonner';

interface PreAuthTableProps {
  data: InsurancePreAuth[];
  isLoading?: boolean;
  onSessionFilter?: (sessionId?: string) => void;
}

export function PreAuthTable({ data, isLoading }: PreAuthTableProps) {
  const deletePreAuth = useDeletePreAuth();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pre-authorization?')) return;
    
    try {
      await deletePreAuth.mutateAsync(id);
      toast.success('Pre-authorization deleted successfully');
    } catch (error) {
      toast.error('Failed to delete pre-authorization');
    }
  };

  const columns: ColumnDef<InsurancePreAuth>[] = [
    {
      accessorKey: 'requestNumber',
      header: 'Request #',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.requestNumber}</div>
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
      accessorKey: 'insuranceProvider',
      header: 'Provider',
      cell: ({ row }) => (
        <div>
          <div>{row.original.insuranceProvider}</div>
          {row.original.tpaName && (
            <div className="text-xs text-muted-foreground">TPA: {row.original.tpaName}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'surgeryType',
      header: 'Surgery Type',
    },
    {
      accessorKey: 'requestedAmount',
      header: 'Requested',
      cell: ({ row }) => `₹${row.original.requestedAmount.toLocaleString()}`,
    },
    {
      accessorKey: 'approvedAmount',
      header: 'Approved',
      cell: ({ row }) =>
        row.original.approvedAmount
          ? `₹${row.original.approvedAmount.toLocaleString()}`
          : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'submittedDate',
      header: 'Submitted',
      cell: ({ row }) => new Date(row.original.submittedDate).toLocaleDateString(),
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
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
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
