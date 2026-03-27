'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useCreateConsentTemplate } from '@/hooks/use-consents';
import { toast } from 'sonner';

interface ConsentTemplateFormProps {
  onSuccess?: () => void;
}

export function ConsentTemplateForm({ onSuccess }: ConsentTemplateFormProps) {
  const createTemplate = useCreateConsentTemplate();

  const form = useForm({
    defaultValues: {
      templateName: '',
      consentCategory: 'SurgeryConsent',
      description: '',
      templateHtml: '',
      requiresPatientSignature: true,
      requiresWitnessSignature: true,
      requiresGuardianSignature: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createTemplate.mutateAsync(data);
      toast.success('Consent template created successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create consent template');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="templateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cataract Surgery Consent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SurgeryConsent">Surgery Consent</SelectItem>
                  <SelectItem value="AnesthesiaConsent">Anesthesia Consent</SelectItem>
                  <SelectItem value="TreatmentConsent">Treatment Consent</SelectItem>
                  <SelectItem value="DataPrivacyConsent">Data Privacy Consent</SelectItem>
                  <SelectItem value="ResearchConsent">Research Consent</SelectItem>
                  <SelectItem value="GeneralConsent">General Consent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this consent template"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templateHtml"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Content (HTML) *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter consent form content with {{PLACEHOLDERS}} for dynamic data"
                  rows={12}
                  className="font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use placeholders: {`{{PATIENT_NAME}}, {{DATE}}, {{SURGERY_TYPE}}, {{DOCTOR_NAME}}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Signature Requirements</FormLabel>
          
          <FormField
            control={form.control}
            name="requiresPatientSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Patient Signature</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiresWitnessSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Witness Signature</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiresGuardianSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Guardian Signature (for minors)</FormLabel>
                </div>
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
          <Button type="submit" disabled={createTemplate.isPending}>
            {createTemplate.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
