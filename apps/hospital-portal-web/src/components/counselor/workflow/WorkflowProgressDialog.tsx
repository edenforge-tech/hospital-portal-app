'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useWorkflowProgress, useStageTransitions, useStageDependencies } from '@/hooks/use-workflows';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkflowProgressDialogProps {
  workflowId: string;
  open: boolean;
  onClose: () => void;
}

export function WorkflowProgressDialog({ workflowId, open, onClose }: WorkflowProgressDialogProps) {
  const { data: progressData, isLoading: progressLoading } = useWorkflowProgress(workflowId);
  const { data: transitionsData, isLoading: transitionsLoading } = useStageTransitions(workflowId);
  const { data: dependenciesData, isLoading: dependenciesLoading } = useStageDependencies(workflowId);

  if (progressLoading || transitionsLoading || dependenciesLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const workflow = progressData?.workflow;
  const transitions = transitionsData?.transitions || [];
  const dependencies = dependenciesData?.dependencies || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workflow Progress - {workflow?.sessionNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion</span>
                  <span className="text-sm font-medium">{workflow?.progressPercentage}%</span>
                </div>
                <Progress value={workflow?.progressPercentage} className="h-3" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {workflow?.milestonesAchieved}
                  </div>
                  <div className="text-xs text-muted-foreground">Achieved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {workflow?.totalMilestones - workflow?.milestonesAchieved}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {workflow?.totalMilestones}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>

              {workflow?.isBlocked && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Workflow Blocked</p>
                    <p className="text-xs text-red-700 mt-1">{workflow.blockageReason}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stages Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stages Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Completed Stages */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Completed Stages ({workflow?.stagesCompleted.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow?.stagesCompleted.map((stage: string, index: number) => (
                      <Badge key={index} variant="default" className="bg-green-100 text-green-700">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pending Stages */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Pending Stages ({workflow?.stagesPending.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow?.stagesPending.map((stage: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage Transitions Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stage Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transitions.length > 0 ? (
                  transitions.map((transition: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="mt-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {transition.fromState}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="default" className="text-xs">
                            {transition.toState}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transition.transitionDate).toLocaleString()} • 
                          Triggered by: {transition.triggeredBy}
                        </p>
                        {transition.transitionReason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {transition.transitionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No stage transitions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stage Dependencies */}
          {dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stage Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dependencies.map((dep: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{dep.stage}</Badge>
                      <span className="text-muted-foreground">depends on</span>
                      <Badge variant="secondary">{dep.dependsOn}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
