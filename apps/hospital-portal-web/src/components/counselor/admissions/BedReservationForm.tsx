'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateBedReservation } from '@/hooks/use-admissions';
import { toast } from 'sonner';

interface BedReservationFormProps {
  onSuccess?: () => void;
}

export function BedReservationForm({ onSuccess }: BedReservationFormProps) {
  const createBedReservation = useCreateBedReservation();

  const form = useForm({
    defaultValues: {
      admissionId: '',
      patientId: '',
      bedId: '',
      reservationStartDate: '',
      reservationEndDate: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createBedReservation.mutateAsync(data);
      toast.success('Bed reserved successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to reserve bed');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="admissionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter admission ID" {...field} />
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
          name="bedId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bed ID *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., B-101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reservationStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reservationEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={createBedReservation.isPending}>
            {createBedReservation.isPending ? 'Reserving...' : 'Reserve Bed'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
