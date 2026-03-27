'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateGovernmentClaim } from '@/hooks/use-payments';
import { useGovernmentSchemes } from '@/hooks/use-master-data';
import { toast } from 'sonner';
import type { CreateGovernmentClaimRequest } from '@/types/counselor';

interface GovernmentClaimFormProps {
  onSuccess?: () => void;
}

export function GovernmentClaimForm({ onSuccess }: GovernmentClaimFormProps) {
  const createClaim = useCreateGovernmentClaim();
  
  // Fetch government schemes master data
  const { data: governmentSchemes = [], isLoading: loadingSchemes } = useGovernmentSchemes();
  
  // Filter active schemes only
  const activeSchemes = governmentSchemes.filter(s => s.isActive);

  const form = useForm<CreateGovernmentClaimRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      schemeType: 'AyushmanBharat',
      schemeName: '',
      claimAmount: 0,
    },
  });

  const onSubmit = async (data: CreateGovernmentClaimRequest) => {
    try {
      await createClaim.mutateAsync(data);
      toast.success('Government scheme claim submitted successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit claim');
    }
  };

  const schemeType = form.watch('schemeType');

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
          name="schemeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheme Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingSchemes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSchemes ? 'Loading...' : 'Select scheme type'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeSchemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={scheme.schemeCode}>
                      {scheme.schemeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schemeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheme Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    schemeType === 'AyushmanBharat'
                      ? 'e.g., Pradhan Mantri Jan Arogya Yojana'
                      : 'Enter specific scheme name'
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {schemeType === 'AyushmanBharat' && (
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ayushman Card Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter 14-digit card number" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the patient's Ayushman Bharat card number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="claimAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Claim Amount (₹) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter claim amount"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Number *</FormLabel>
              <FormControl>
                <Input placeholder="Enter application/reference number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatmentDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Details</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of treatment" {...field} />
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
          <Button type="submit" disabled={createClaim.isPending}>
            {createClaim.isPending ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
