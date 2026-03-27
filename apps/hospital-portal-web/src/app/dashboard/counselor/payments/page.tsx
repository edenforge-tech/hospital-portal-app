'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Link as LinkIcon, Gift } from 'lucide-react';
import { PaymentsTable } from '@/components/counselor/payments/PaymentsTable';
import { PaymentLinksTable } from '@/components/counselor/payments/PaymentLinksTable';
import { GovernmentClaimsTable } from '@/components/counselor/payments/GovernmentClaimsTable';
import { PaymentForm } from '@/components/counselor/payments/PaymentForm';
import { PaymentLinkForm } from '@/components/counselor/payments/PaymentLinkForm';
import { GovernmentClaimForm } from '@/components/counselor/payments/GovernmentClaimForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePayments, usePaymentLinks, useGovernmentClaims } from '@/hooks/use-payments';

export default function PaymentsPage() {
  const router = useRouter();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const { data: paymentsData, isLoading: paymentsLoading } = usePayments(selectedSessionId);
  const { data: linksData, isLoading: linksLoading } = usePaymentLinks();
  const { data: claimsData, isLoading: claimsLoading } = useGovernmentClaims();

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

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="links">Payment Links</TabsTrigger>
          <TabsTrigger value="government">Government Schemes</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>
                    Record and manage patient payments across all methods
                  </CardDescription>
                </div>
                <Button onClick={() => setShowPaymentForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PaymentsTable
                data={paymentsData?.data || []}
                isLoading={paymentsLoading}
                onSessionFilter={setSelectedSessionId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Links</CardTitle>
                  <CardDescription>
                    Generate and send payment links via SMS, Email, or WhatsApp
                  </CardDescription>
                </div>
                <Button onClick={() => setShowLinkForm(true)}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Generate Link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PaymentLinksTable
                data={linksData?.data || []}
                isLoading={linksLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="government" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Government Scheme Claims</CardTitle>
                  <CardDescription>
                    Submit and track Ayushman Bharat, State Scheme, and CGHS claims
                  </CardDescription>
                </div>
                <Button onClick={() => setShowClaimForm(true)}>
                  <Gift className="mr-2 h-4 w-4" />
                  New Claim
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <GovernmentClaimsTable
                data={claimsData?.data || []}
                isLoading={claimsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a new payment transaction from patient
            </DialogDescription>
          </DialogHeader>
          <PaymentForm onSuccess={() => setShowPaymentForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Payment Link Form Dialog */}
      <Dialog open={showLinkForm} onOpenChange={setShowLinkForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Payment Link</DialogTitle>
            <DialogDescription>
              Create a secure payment link with QR code for patient
            </DialogDescription>
          </DialogHeader>
          <PaymentLinkForm onSuccess={() => setShowLinkForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Government Claim Form Dialog */}
      <Dialog open={showClaimForm} onOpenChange={setShowClaimForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Government Scheme Claim</DialogTitle>
            <DialogDescription>
              Submit claim for Ayushman Bharat, State Scheme, or CGHS
            </DialogDescription>
          </DialogHeader>
          <GovernmentClaimForm onSuccess={() => setShowClaimForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
