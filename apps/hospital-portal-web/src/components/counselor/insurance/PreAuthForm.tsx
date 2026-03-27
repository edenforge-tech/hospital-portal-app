'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormStepper, FormStepperActions } from '@/components/counselor/FormStepper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePreAuth } from '@/hooks/use-insurance';
import { useInsuranceProviders, useTpaProviders, useSurgeryTypes } from '@/hooks/use-master-data';
import { toast } from 'sonner';
import type { CreatePreAuthRequest } from '@/types/counselor';

const steps = [
  { id: 'patient', title: 'Patient Info', description: 'Basic patient details' },
  { id: 'insurance', title: 'Insurance', description: 'Insurance provider details' },
  { id: 'surgery', title: 'Surgery', description: 'Surgery and procedure details' },
  { id: 'financial', title: 'Financial', description: 'Cost breakdown' },
];

interface PreAuthFormProps {
  onSuccess?: () => void;
}

export function PreAuthForm({ onSuccess }: PreAuthFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const createPreAuth = useCreatePreAuth();
  
  // Fetch master data
  const { data: insuranceProviders = [], isLoading: loadingInsurance } = useInsuranceProviders();
  const { data: tpaProviders = [], isLoading: loadingTpa } = useTpaProviders();
  const { data: surgeryTypes = [], isLoading: loadingSurgery } = useSurgeryTypes();
  
  // Filter active items only
  const activeInsuranceProviders = insuranceProviders.filter(p => p.isActive);
  const activeTpaProviders = tpaProviders.filter(p => p.isActive);
  const activeSurgeryTypes = surgeryTypes.filter(t => t.isActive);

  const form = useForm<CreatePreAuthRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      insuranceType: 'Cashless',
      insuranceProvider: '',
      policyNumber: '',
      policyHolderName: '',
      surgeryType: '',
      plannedProcedure: '',
      diagnosisCode: '',
      procedureCode: '',
      requestedAmount: 0,
    },
  });

  const onSubmit = async (data: CreatePreAuthRequest) => {
    try {
      await createPreAuth.mutateAsync(data);
      toast.success('Pre-authorization request submitted successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit pre-authorization request');
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
                name="insuranceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mediclaim">Mediclaim</SelectItem>
                        <SelectItem value="Cashless">Cashless</SelectItem>
                        <SelectItem value="Reimbursement">Reimbursement</SelectItem>
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

          {/* Step 3: Surgery */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="surgeryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surgery Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingSurgery}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingSurgery ? 'Loading...' : 'Select surgery type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeSurgeryTypes.map((surgery) => (
                          <SelectItem key={surgery.id} value={surgery.surgeryName}>
                            {surgery.surgeryName}
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
                name="plannedProcedure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Procedure *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the planned procedure" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eyeOperated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eye Operated</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select eye" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Left">Left</SelectItem>
                        <SelectItem value="Right">Right</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>
          )}

          {/* Step 4: Financial */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="requestedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter requested amount"
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
                name="itemizedBreakdown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itemized Breakdown (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter cost breakdown (JSON format)"
                        rows={8}
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
            isSubmitting={createPreAuth.isPending}
          />
        </form>
      </Form>
    </div>
  );
}
