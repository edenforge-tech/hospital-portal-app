'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PatientAdmission } from '@/types/counselor';
import { useDeleteAdmission, useDischargeAdmission } from '@/hooks/use-admissions';
import { toast } from 'sonner';

interface AdmissionsTableProps {
  data: PatientAdmission[];
  isLoading?: boolean;
}

export function AdmissionsTable({ data, isLoading }: AdmissionsTableProps) {
  const deleteAdmission = useDeleteAdmission();
  const dischargeAdmission = useDischargeAdmission();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admission?')) return;
    
    try {
      await deleteAdmission.mutateAsync(id);
      toast.success('Admission deleted successfully');
    } catch (error) {
      toast.error('Failed to delete admission');
    }
  };

  const handleDischarge = async (id: string) => {
    const dischargeSummary = prompt('Enter discharge summary (optional):');
    
    try {
      await dischargeAdmission.mutateAsync({
        id,
        dischargeData: {
          actualDischargeDate: new Date().toISOString(),
          dischargeSummary: dischargeSummary || undefined,
        },
      });
      toast.success('Patient discharged successfully');
    } catch (error) {
      toast.error('Failed to discharge patient');
    }
  };

  const columns: ColumnDef<PatientAdmission>[] = [
    {
      accessorKey: 'admissionNumber',
      header: 'Admission #',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.admissionNumber}</div>
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
      accessorKey: 'admissionType',
      header: 'Type',
    },
    {
      accessorKey: 'surgeryType',
      header: 'Surgery',
      cell: ({ row }) => (
        <div>
          <div>{row.original.surgeryType || '-'}</div>
          {row.original.eyeOperated && (
            <div className="text-xs text-muted-foreground">Eye: {row.original.eyeOperated}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'plannedAdmissionDate',
      header: 'Planned Date',
      cell: ({ row }) => new Date(row.original.plannedAdmissionDate).toLocaleDateString(),
    },
    {
      accessorKey: 'actualAdmissionDate',
      header: 'Actual Date',
      cell: ({ row }) =>
        row.original.actualAdmissionDate
          ? new Date(row.original.actualAdmissionDate).toLocaleDateString()
          : '-',
    },
    {
      accessorKey: 'bedAssigned',
      header: 'Bed',
      cell: ({ row }) => row.original.bedAssigned || '-',
    },
    {
      accessorKey: 'admissionStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.admissionStatus} />,
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
            {row.original.admissionStatus === 'Admitted' && (
              <DropdownMenuItem onClick={() => handleDischarge(row.original.id)}>
                <LogOut className="mr-2 h-4 w-4" />
                Discharge
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
