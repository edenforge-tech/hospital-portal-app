/**
 * Surgery Schedule Dashboard Page
 * Comprehensive OR calendar view with surgeon availability, conflict detection, and multi-OR management
 */

'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SurgeryCalendar } from '@/components/module3/counselor/SurgeryCalendar';
import { SurgeonAvailabilityTracker } from '@/components/module3/counselor/SurgeonAvailabilityTracker';
import { MultiORDashboard } from '@/components/module3/counselor/MultiORDashboard';
import { ArrowLeft, Calendar, User, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SurgeryScheduleDashboardPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Surgery Schedule Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage OR bookings, track surgeon availability, and resolve scheduling conflicts
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="surgeons" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Surgeon Availability
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live OR Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <SurgeryCalendar showAllTheaters={true} />
          </TabsContent>

          <TabsContent value="surgeons" className="mt-6">
            <SurgeonAvailabilityTracker selectedDate={selectedDate} />
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <MultiORDashboard autoRefresh={true} refreshIntervalSeconds={30} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
