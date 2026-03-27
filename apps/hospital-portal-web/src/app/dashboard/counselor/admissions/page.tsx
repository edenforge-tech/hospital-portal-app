'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Bed } from 'lucide-react';
import { AdmissionsTable } from '@/components/counselor/admissions/AdmissionsTable';
import { BedReservationsTable } from '@/components/counselor/admissions/BedReservationsTable';
import { AdmissionForm } from '@/components/counselor/admissions/AdmissionForm';
import { BedReservationForm } from '@/components/counselor/admissions/BedReservationForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdmissions, useBedReservations } from '@/hooks/use-admissions';

export default function AdmissionsPage() {
  const router = useRouter();
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showBedReservationForm, setShowBedReservationForm] = useState(false);
  const [admissionTypeFilter, setAdmissionTypeFilter] = useState<string>();

  const { data: admissionsData, isLoading: admissionsLoading } = useAdmissions(undefined, admissionTypeFilter);
  const { data: bedReservationsData, isLoading: bedReservationsLoading } = useBedReservations();

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

      <Tabs defaultValue="admissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="beds">Bed Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="admissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Admissions</CardTitle>
                  <CardDescription>
                    Schedule and manage Day Care, IPD, and Emergency admissions
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAdmissionForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Admission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Admission Type Filter Buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={!admissionTypeFilter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdmissionTypeFilter(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={admissionTypeFilter === 'DayCare' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdmissionTypeFilter('DayCare')}
                >
                  Day Care
                </Button>
                <Button
                  variant={admissionTypeFilter === 'IPD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdmissionTypeFilter('IPD')}
                >
                  IPD
                </Button>
                <Button
                  variant={admissionTypeFilter === 'Emergency' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdmissionTypeFilter('Emergency')}
                >
                  Emergency
                </Button>
              </div>

              <AdmissionsTable
                data={admissionsData?.data || []}
                isLoading={admissionsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beds" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bed Reservations</CardTitle>
                  <CardDescription>
                    Manage bed allocations and reservations for admitted patients
                  </CardDescription>
                </div>
                <Button onClick={() => setShowBedReservationForm(true)}>
                  <Bed className="mr-2 h-4 w-4" />
                  Reserve Bed
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BedReservationsTable
                data={bedReservationsData?.data || []}
                isLoading={bedReservationsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admission Form Dialog */}
      <Dialog open={showAdmissionForm} onOpenChange={setShowAdmissionForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Patient Admission</DialogTitle>
            <DialogDescription>
              Schedule a new patient admission for surgery or treatment
            </DialogDescription>
          </DialogHeader>
          <AdmissionForm onSuccess={() => setShowAdmissionForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Bed Reservation Form Dialog */}
      <Dialog open={showBedReservationForm} onOpenChange={setShowBedReservationForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reserve Bed</DialogTitle>
            <DialogDescription>
              Reserve a bed for admitted patient
            </DialogDescription>
          </DialogHeader>
          <BedReservationForm onSuccess={() => setShowBedReservationForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
