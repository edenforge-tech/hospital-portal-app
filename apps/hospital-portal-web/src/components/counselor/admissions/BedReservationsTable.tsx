'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal,Unlock, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BedReservation } from '@/types/counselor';
import { useReleaseBedReservation, useDeleteBedReservation } from '@/hooks/use-admissions';
import { toast } from 'sonner';

interface BedReservationsTableProps {
  data: BedReservation[];
  isLoading?: boolean;
}

export function BedReservationsTable({ data, isLoading }: BedReservationsTableProps) {
  const releaseBed = useReleaseBedReservation();
  const deleteBed = useDeleteBedReservation();

  const handleRelease = async (id: string) => {
    if (!confirm('Release this bed reservation?')) return;
    
    try {
      await releaseBed.mutateAsync(id);
      toast.success('Bed released successfully');
    } catch (error) {
      toast.error('Failed to release bed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bed reservation?')) return;
    
    try {
      await deleteBed.mutateAsync(id);
      toast.success('Bed reservation deleted');
    } catch (error) {
      toast.error('Failed to delete bed reservation');
    }
  };

  const columns: ColumnDef<BedReservation>[] = [
    {
      accessorKey: 'bedId',
      header: 'Bed ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.bedId}</div>
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
      accessorKey: 'admissionNumber',
      header: 'Admission #',
    },
    {
      accessorKey: 'reservationStartDate',
      header: 'Start Date',
      cell: ({ row }) => new Date(row.original.reservationStartDate).toLocaleDateString(),
    },
    {
      accessorKey: 'reservationEndDate',
      header: 'End Date',
      cell: ({ row }) => new Date(row.original.reservationEndDate).toLocaleDateString(),
    },
    {
      accessorKey: 'reservationStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.reservationStatus} />,
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
            {(row.original.reservationStatus === 'Reserved' || row.original.reservationStatus === 'Occupied') && (
              <DropdownMenuItem onClick={() => handleRelease(row.original.id)}>
                <Unlock className="mr-2 h-4 w-4" />
                Release Bed
              </DropdownMenuItem>
            )}
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
