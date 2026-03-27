'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { WorkflowsTable } from '@/components/counselor/workflow/WorkflowsTable';
import { WorkflowForm } from '@/components/counselor/workflow/WorkflowForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWorkflows } from '@/hooks/use-workflows';
import { SeedButton } from '@/components/counselor/SeedButton';

export default function WorkflowPage() {
  const router = useRouter();
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>();

  const { data: workflowsData, isLoading: workflowsLoading } = useWorkflows(undefined, statusFilter);

  return (
    <div className="p-4 space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard/counselor')}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session Workflows</CardTitle>
              <CardDescription>
                Monitor progress through counseling stages with dependencies and milestones
              </CardDescription>
            </div>
            <Button onClick={() => setShowWorkflowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Initialize Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Filter Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={!statusFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(undefined)}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'InProgress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('InProgress')}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'Blocked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('Blocked')}
            >
              Blocked
            </Button>
            <Button
              variant={statusFilter === 'Completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('Completed')}
            >
              Completed
            </Button>
          </div>

          <WorkflowsTable
            data={workflowsData?.data || []}
            isLoading={workflowsLoading}
          />
        </CardContent>
      </Card>

      {/* Workflow Form Dialog */}
      <Dialog open={showWorkflowForm} onOpenChange={setShowWorkflowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Initialize Workflow</DialogTitle>
            <DialogDescription>
              Start tracking a counseling session through the workflow stages
            </DialogDescription>
          </DialogHeader>
          <WorkflowForm onSuccess={() => setShowWorkflowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* TEMPORARY: Seed button for patient types */}
      <SeedButton />
    </div>
  );
}
