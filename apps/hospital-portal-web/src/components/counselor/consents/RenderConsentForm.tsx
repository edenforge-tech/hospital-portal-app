'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConsentTemplates, useRenderConsent } from '@/hooks/use-consents';
import { toast } from 'sonner';
import type { RenderConsentRequest } from '@/types/counselor';

interface RenderConsentFormProps {
  onSuccess?: () => void;
}

export function RenderConsentForm({ onSuccess }: RenderConsentFormProps) {
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const { data: templates } = useConsentTemplates();
  const renderConsent = useRenderConsent();

  const form = useForm<RenderConsentRequest>({
    defaultValues: {
      templateId: '',
      sessionId: '',
      patientId: '',
      placeholderValues: '{}',
    },
  });

  const selectedTemplateId = form.watch('templateId');
  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const onSubmit = async (data: RenderConsentRequest) => {
    try {
      // Parse placeholderValues JSON
      const parsedData = {
        ...data,
        placeholderValues: JSON.parse(data.placeholderValues || '{}'),
      };

      const result = await renderConsent.mutateAsync(parsedData);
      setRenderedHtml(result.renderedHtml);
      toast.success('Consent form generated successfully');
    } catch (error) {
      toast.error('Failed to generate consent form');
    }
  };

  return (
    <div className="space-y-6">
      {!renderedHtml ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consent Template *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.templateName} ({template.consentCategory})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTemplate && (
              <Card className="p-3 bg-muted">
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description || 'No description available'}
                </p>
              </Card>
            )}

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
              name="placeholderValues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder Values (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"PATIENT_NAME": "John Doe", "SURGERY_TYPE": "Cataract", "DOCTOR_NAME": "Dr. Smith"}'
                      rows={6}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={renderConsent.isPending}>
                {renderConsent.isPending ? 'Generating...' : 'Generate Consent'}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <Card className="p-6">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRenderedHtml(null);
                form.reset();
              }}
            >
              Generate Another
            </Button>
            <Button type="button" onClick={onSuccess}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
