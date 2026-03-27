'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { WorkflowState } from '@/types/counselor';
import { useDeleteWorkflow } from '@/hooks/use-workflows';
import { toast } from 'sonner';
import { useState } from 'react';
import { WorkflowProgressDialog } from '@/components/counselor/workflow/WorkflowProgressDialog';

interface WorkflowsTableProps {
  data: WorkflowState[];
  isLoading?: boolean;
}

export function WorkflowsTable({ data, isLoading }: WorkflowsTableProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const deleteWorkflow = useDeleteWorkflow();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await deleteWorkflow.mutateAsync(id);
      toast.success('Workflow deleted successfully');
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const columns: ColumnDef<WorkflowState>[] = [
    {
      accessorKey: 'sessionNumber',
      header: 'Session',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.sessionNumber}</div>
          <div className="text-xs text-muted-foreground">{row.original.sessionId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.patientName}</div>
      ),
    },
    {
      accessorKey: 'currentState',
      header: 'Current Stage',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.currentState}</Badge>
      ),
    },
    {
      header: 'Progress',
      cell: ({ row }) => (
        <div className="w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <Progress value={row.original.progressPercentage} className="h-2" />
            <span className="text-xs font-medium text-muted-foreground">
              {row.original.progressPercentage}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.milestonesAchieved}/{row.original.totalMilestones} milestones
          </div>
        </div>
      ),
    },
    {
      header: 'Stages',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs">
            ✓ Completed: <Badge variant="secondary" className="text-xs">{row.original.stagesCompleted.length}</Badge>
          </div>
          <div className="text-xs">
            ⏳ Pending: <Badge variant="secondary" className="text-xs">{row.original.stagesPending.length}</Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.isBlocked ? 'Blocked' : 
                       row.original.progressPercentage === 100 ? 'Completed' : 'InProgress';
        return (
          <div>
            <StatusBadge status={status} />
            {row.original.isBlocked && (
              <div className="text-xs text-muted-foreground mt-1">
                {row.original.blockageReason}
              </div>
            )}
          </div>
        );
      },
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
            <DropdownMenuItem onClick={() => setSelectedWorkflowId(row.original.id)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Progress
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Update Stage
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
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="patientName"
        searchPlaceholder="Search by patient name..."
        pageSize={10}
      />

      {/* Progress Dialog */}
      {selectedWorkflowId && (
        <WorkflowProgressDialog
          workflowId={selectedWorkflowId}
          open={!!selectedWorkflowId}
          onClose={() => setSelectedWorkflowId(null)}
        />
      )}
    </>
  );
}
