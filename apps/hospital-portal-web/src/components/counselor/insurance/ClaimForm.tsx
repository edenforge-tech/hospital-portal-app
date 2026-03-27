'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormStepper, FormStepperActions } from '@/components/counselor/FormStepper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClaim } from '@/hooks/use-insurance';
import { useInsuranceProviders, useTpaProviders } from '@/hooks/use-master-data';
import { toast } from 'sonner';
import type { CreateClaimRequest } from '@/types/counselor';

const steps = [
  { id: 'patient', title: 'Patient Info', description: 'Basic patient details' },
  { id: 'insurance', title: 'Insurance', description: 'Insurance provider details' },
  { id: 'claim', title: 'Claim Details', description: 'Treatment and billing' },
];

interface ClaimFormProps {
  onSuccess?: () => void;
}

export function ClaimForm({ onSuccess }: ClaimFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const createClaim = useCreateClaim();
  
  // Fetch master data
  const { data: insuranceProviders = [], isLoading: loadingInsurance } = useInsuranceProviders();
  const { data: tpaProviders = [], isLoading: loadingTpa } = useTpaProviders();
  
  // Filter active items only
  const activeInsuranceProviders = insuranceProviders.filter(p => p.isActive);
  const activeTpaProviders = tpaProviders.filter(p => p.isActive);

  const form = useForm<CreateClaimRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      claimType: 'Post-Surgery Claim',
      insuranceProvider: '',
      policyNumber: '',
      policyHolderName: '',
      treatmentDate: '',
      claimedAmount: 0,
    },
  });

  const onSubmit = async (data: CreateClaimRequest) => {
    try {
      await createClaim.mutateAsync(data);
      toast.success('Insurance claim submitted successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit insurance claim');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      <FormStepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} allowSkip />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Patient Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Counseling Session ID *</FormLabel>
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
          )}

          {/* Step 2: Insurance */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="claimType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select claim type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Post-Surgery Claim">Post-Surgery Claim</SelectItem>
                        <SelectItem value="Treatment Claim">Treatment Claim</SelectItem>
                        <SelectItem value="Emergency Claim">Emergency Claim</SelectItem>
                        <SelectItem value="Follow-up Claim">Follow-up Claim</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingInsurance}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingInsurance ? 'Loading...' : 'Select provider'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeInsuranceProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.providerName}>
                            {provider.providerName}
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
                name="tpaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TPA Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingTpa}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingTpa ? 'Loading...' : 'Select TPA (optional)'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeTpaProviders.map((tpa) => (
                          <SelectItem key={tpa.id} value={tpa.tpaName}>
                            {tpa.tpaName}
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
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter policy number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policyHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Holder Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter policy holder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Claim Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="treatmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claimedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claimed Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter claimed amount"
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
                name="diagnosisCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Code (ICD-10) *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., H25.9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="procedureCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure Code (CPT) *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 66984" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportingDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supporting Documents (URLs)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter document URLs (one per line)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormStepperActions
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={form.handleSubmit(onSubmit)}
            isSubmitting={createClaim.isPending}
          />
        </form>
      </Form>
    </div>
  );
}
