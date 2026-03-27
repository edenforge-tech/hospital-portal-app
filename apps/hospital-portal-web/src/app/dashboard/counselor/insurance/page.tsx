'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { PreAuthTable } from '@/components/counselor/insurance/PreAuthTable';
import { ClaimsTable } from '@/components/counselor/insurance/ClaimsTable';
import { PreAuthForm } from '@/components/counselor/insurance/PreAuthForm';
import { ClaimForm } from '@/components/counselor/insurance/ClaimForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePreAuths, useClaims } from '@/hooks/use-insurance';

export default function InsurancePage() {
  const router = useRouter();
  const [showPreAuthForm, setShowPreAuthForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const { data: preAuthsData, isLoading: preAuthsLoading } = usePreAuths(selectedSessionId);
  const { data: claimsData, isLoading: claimsLoading } = useClaims(selectedSessionId);

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

      <Tabs defaultValue="pre-auth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pre-auth">Pre-Authorizations</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="pre-auth" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pre-Authorizations</CardTitle>
                  <CardDescription>
                    Submit and track insurance pre-authorization requests
                  </CardDescription>
                </div>
                <Button onClick={() => setShowPreAuthForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Pre-Authorization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PreAuthTable
                data={preAuthsData?.data || []}
                isLoading={preAuthsLoading}
                onSessionFilter={setSelectedSessionId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Insurance Claims</CardTitle>
                  <CardDescription>
                    Submit and track insurance reimbursement claims
                  </CardDescription>
                </div>
                <Button onClick={() => setShowClaimForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Claim
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ClaimsTable
                data={claimsData?.data || []}
                isLoading={claimsLoading}
                onSessionFilter={setSelectedSessionId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pre-Authorization Form Dialog */}
      <Dialog open={showPreAuthForm} onOpenChange={setShowPreAuthForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Pre-Authorization Request</DialogTitle>
            <DialogDescription>
              Submit a new insurance pre-authorization request for planned surgery
            </DialogDescription>
          </DialogHeader>
          <PreAuthForm onSuccess={() => setShowPreAuthForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Claim Form Dialog */}
      <Dialog open={showClaimForm} onOpenChange={setShowClaimForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Insurance Claim</DialogTitle>
            <DialogDescription>
              Submit a new insurance reimbursement claim
            </DialogDescription>
          </DialogHeader>
          <ClaimForm onSuccess={() => setShowClaimForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
