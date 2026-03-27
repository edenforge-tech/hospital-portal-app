'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormStepper, FormStepperActions } from '@/components/counselor/FormStepper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateAdmission } from '@/hooks/use-admissions';
import { useSurgeryTypes, useAnesthesiaTypes } from '@/hooks/use-master-data';
import { toast } from 'sonner';
import type { CreateAdmissionRequest } from '@/types/counselor';

const steps = [
  { id: 'patient', title: 'Patient', description: 'Patient details' },
  { id: 'admission', title: 'Admission', description: 'Admission details' },
  { id: 'surgery', title: 'Surgery', description: 'Surgery information' },
];

interface AdmissionFormProps {
  onSuccess?: () => void;
}

export function AdmissionForm({ onSuccess }: AdmissionFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const createAdmission = useCreateAdmission();
  
  // Fetch master data
  const { data: surgeryTypes = [], isLoading: loadingSurgery } = useSurgeryTypes();
  const { data: anesthesiaTypes = [], isLoading: loadingAnesthesia } = useAnesthesiaTypes();
  
  // Filter active items only
  const activeSurgeryTypes = surgeryTypes.filter(t => t.isActive);
  const activeAnesthesiaTypes = anesthesiaTypes.filter(t => t.isActive);

  const form = useForm<CreateAdmissionRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      admissionType: 'DayCare',
      plannedAdmissionDate: '',
      preOpChecklistCompleted: false,
    },
  });

  const onSubmit = async (data: CreateAdmissionRequest) => {
    try {
      await createAdmission.mutateAsync(data);
      toast.success('Admission scheduled successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to schedule admission');
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
          {/* Step 1: Patient */}
          {currentStep === 0 && (
            <div className="space-y-4">
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
          )}

          {/* Step 2: Admission */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="admissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select admission type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DayCare">Day Care</SelectItem>
                        <SelectItem value="IPD">IPD (In-Patient Department)</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plannedAdmissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Admission Date *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDischargeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Discharge Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Assigned</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., B-101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wardAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Assigned</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., General Ward" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    <FormLabel>Surgery Type</FormLabel>
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
                name="surgeonAssigned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surgeon Assigned</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter surgeon name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anesthesiaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anesthesia Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingAnesthesia}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingAnesthesia ? 'Loading...' : 'Select anesthesia type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeAnesthesiaTypes.map((anesthesia) => (
                          <SelectItem key={anesthesia.id} value={anesthesia.anesthesiaName}>
                            {anesthesia.anesthesiaName}
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
                name="preOpChecklistCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pre-Op Checklist Completed</FormLabel>
                    </div>
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
            isSubmitting={createAdmission.isPending}
          />
        </form>
      </Form>
    </div>
  );
}
