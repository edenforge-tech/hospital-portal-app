'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { ConsentTemplatesTable } from '@/components/counselor/consents/ConsentTemplatesTable';
import { PatientConsentsTable } from '@/components/counselor/consents/PatientConsentsTable';
import { ConsentTemplateForm } from '@/components/counselor/consents/ConsentTemplateForm';
import { RenderConsentForm } from '@/components/counselor/consents/RenderConsentForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConsentTemplates, useConsents } from '@/hooks/use-consents';

export default function ConsentsPage() {
  const router = useRouter();
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showRenderForm, setShowRenderForm] = useState(false);

  const { data: templatesData, isLoading: templatesLoading } = useConsentTemplates();
  const { data: consentsData, isLoading: consentsLoading } = useConsents();

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

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="consents">Patient Consents</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consent Templates</CardTitle>
                  <CardDescription>
                    Create and manage reusable consent form templates
                  </CardDescription>
                </div>
                <Button onClick={() => setShowTemplateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ConsentTemplatesTable
                data={templatesData || []}
                isLoading={templatesLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Consents</CardTitle>
                  <CardDescription>
                    Manage patient consent forms with digital signatures
                  </CardDescription>
                </div>
                <Button onClick={() => setShowRenderForm(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Consent
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PatientConsentsTable
                data={consentsData?.data || []}
                isLoading={consentsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Form Dialog */}
      <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Consent Template</DialogTitle>
            <DialogDescription>
              Create a reusable consent form template with placeholders
            </DialogDescription>
          </DialogHeader>
          <ConsentTemplateForm onSuccess={() => setShowTemplateForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Render Consent Form Dialog */}
      <Dialog open={showRenderForm} onOpenChange={setShowRenderForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Patient Consent</DialogTitle>
            <DialogDescription>
              Generate a consent form for a patient from a template
            </DialogDescription>
          </DialogHeader>
          <RenderConsentForm onSuccess={() => setShowRenderForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
