'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useInitializeWorkflow } from '@/hooks/use-workflows';
import { toast } from 'sonner';
import type { InitializeWorkflowRequest } from '@/types/counselor';

interface WorkflowFormProps {
  onSuccess?: () => void;
}

export function WorkflowForm({ onSuccess }: WorkflowFormProps) {
  const initializeWorkflow = useInitializeWorkflow();

  const form = useForm<InitializeWorkflowRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      initialState: 'SessionStarted',
      totalMilestones: 16,
    },
  });

  const onSubmit = async (data: InitializeWorkflowRequest) => {
    try {
      await initializeWorkflow.mutateAsync(data);
      toast.success('Workflow initialized successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to initialize workflow');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sessionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter session ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter patient ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="initialState"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial State</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SessionStarted" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalMilestones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Milestones</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="16"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedCompletionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Completion Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workflowMetadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow Metadata (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"priority": "high", "notes": "..."}'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={initializeWorkflow.isPending}>
            {initializeWorkflow.isPending ? 'Initializing...' : 'Initialize Workflow'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
