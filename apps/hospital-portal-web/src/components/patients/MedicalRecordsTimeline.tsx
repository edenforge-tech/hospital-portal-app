'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Activity,
  Scissors,
  Pill,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'examination' | 'surgery' | 'medication' | 'imaging' | 'treatment' | 'follow-up';
  category: string;
  title: string;
  details: string;
  provider?: string;
  findings?: string;
  status?: 'completed' | 'scheduled' | 'cancelled' | 'in-progress';
  metadata?: Record<string, any>;
}

interface IOPRecord {
  date: string;
  OD: number;
  OS: number;
  medication?: string;
}

interface VisualAcuityRecord {
  date: string;
  OD: string;
  OS: string;
  chart: string;
}

interface RefractiveRecord {
  date: string;
  eye: 'OD' | 'OS';
  sphere: number;
  cylinder: number;
  axis: number;
}

interface MedicalRecordsTimelineProps {
  patientId: string;
}

export function MedicalRecordsTimeline({ patientId }: MedicalRecordsTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [iopHistory, setIopHistory] = useState<IOPRecord[]>([]);
  const [vaHistory, setVaHistory] = useState<VisualAcuityRecord[]>([]);
  const [refractionHistory, setRefractionHistory] = useState<RefractiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    loadPatientHistory();
  }, [patientId]);

  const loadPatientHistory = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const response = await medicalRecordsApi.getPatientHistory(patientId);
      
      // Mock data for demonstration
      setEvents([
        {
          id: '1',
          date: '2026-01-15',
          type: 'examination',
          category: 'Comprehensive Eye Exam',
          title: 'Annual Eye Examination',
          details: 'Complete eye health assessment with refraction and tonometry',
          provider: 'Dr. Sarah Johnson',
          findings: 'No significant changes. IOP within normal limits. BCVA 6/6 OU.',
          status: 'completed',
          metadata: {
            iop: { OD: 14, OS: 15 },
            va: { OD: '6/6', OS: '6/6' }
          }
        },
        {
          id: '2',
          date: '2025-12-20',
          type: 'imaging',
          category: 'OCT Scan',
          title: 'Optical Coherence Tomography',
          details: 'Macular OCT for diabetic retinopathy screening',
          provider: 'Imaging Technician - John Doe',
          findings: 'No macular edema detected. RNFL thickness within normal limits.',
          status: 'completed',
          metadata: {
            crt: { OD: 245, OS: 248 },
            rnflAverage: { OD: 98, OS: 102 }
          }
        },
        {
          id: '3',
          date: '2025-11-05',
          type: 'surgery',
          category: 'Cataract Surgery',
          title: 'Phacoemulsification with IOL Implantation - OD',
          details: 'Uncomplicated phacoemulsification with AcrySof IQ IOL +22.0D',
          provider: 'Dr. Michael Chen',
          findings: 'Post-op day 1: BCVA 6/9, IOP 12 mmHg, clear cornea, well-centered IOL',
          status: 'completed',
          metadata: {
            iolPower: '+22.0',
            iolModel: 'Alcon AcrySof IQ SN60WF',
            complications: 'None'
          }
        },
        {
          id: '4',
          date: '2025-10-15',
          type: 'treatment',
          category: 'Anti-VEGF Injection',
          title: 'Intravitreal Ranibizumab Injection - OS',
          details: 'Treatment for diabetic macular edema',
          provider: 'Dr. Emily Rodriguez',
          findings: 'Injection well tolerated. IOP post-injection: 16 mmHg.',
          status: 'completed',
          metadata: {
            medication: 'Ranibizumab 0.5mg',
            injectionNumber: 3,
            nextInjection: '2025-11-15'
          }
        },
        {
          id: '5',
          date: '2026-02-01',
          type: 'follow-up',
          category: 'Post-Surgical Follow-up',
          title: '3-Month Post-Cataract Surgery Review',
          details: 'Scheduled follow-up for cataract surgery outcome assessment',
          provider: 'Dr. Michael Chen',
          status: 'scheduled'
        }
      ]);

      setIopHistory([
        { date: '2025-06-01', OD: 16, OS: 17 },
        { date: '2025-07-15', OD: 15, OS: 16, medication: 'Started Latanoprost' },
        { date: '2025-09-01', OD: 14, OS: 15, medication: 'Latanoprost' },
        { date: '2025-11-01', OD: 13, OS: 14, medication: 'Latanoprost' },
        { date: '2026-01-15', OD: 14, OS: 15, medication: 'Latanoprost' }
      ]);

      setVaHistory([
        { date: '2025-06-01', OD: '6/9', OS: '6/9', chart: 'Snellen' },
        { date: '2025-09-01', OD: '6/12', OS: '6/9', chart: 'Snellen' },
        { date: '2025-11-05', OD: 'CF 1m', OS: '6/9', chart: 'Snellen' },
        { date: '2025-11-06', OD: '6/9', OS: '6/9', chart: 'Snellen' },
        { date: '2026-01-15', OD: '6/6', OS: '6/6', chart: 'Snellen' }
      ]);

      setRefractionHistory([
        { date: '2025-06-01', eye: 'OD', sphere: -2.5, cylinder: -0.75, axis: 180 },
        { date: '2025-06-01', eye: 'OS', sphere: -2.25, cylinder: -0.5, axis: 175 },
        { date: '2025-09-01', eye: 'OD', sphere: -3.0, cylinder: -1.0, axis: 180 },
        { date: '2025-09-01', eye: 'OS', sphere: -2.5, cylinder: -0.75, axis: 175 },
        { date: '2026-01-15', eye: 'OD', sphere: -0.5, cylinder: -0.25, axis: 180 },
        { date: '2026-01-15', eye: 'OS', sphere: -2.75, cylinder: -0.75, axis: 175 }
      ]);

    } catch (error) {
      console.error('Failed to load patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'examination': return <Eye className="h-5 w-5 text-blue-500" />;
      case 'surgery': return <Scissors className="h-5 w-5 text-red-500" />;
      case 'medication': return <Pill className="h-5 w-5 text-green-500" />;
      case 'imaging': return <Activity className="h-5 w-5 text-purple-500" />;
      case 'treatment': return <FileText className="h-5 w-5 text-orange-500" />;
      case 'follow-up': return <Calendar className="h-5 w-5 text-teal-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><Activity className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return null;
    }
  };

  const convertVAToDecimal = (va: string): number => {
    if (va.includes('/')) {
      const [num, denom] = va.split('/').map(Number);
      return num / denom;
    }
    if (va.startsWith('CF')) return 0.01; // Counting Fingers
    if (va === 'HM') return 0.005; // Hand Motion
    if (va === 'LP') return 0.001; // Light Perception
    return 1.0;
  };

  const vaChartData = vaHistory.map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    OD: convertVAToDecimal(record.OD),
    OS: convertVAToDecimal(record.OS)
  }));

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medical Records Timeline</CardTitle>
              <CardDescription>Complete patient history with examinations, surgeries, and treatments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="iop-trends">IOP Trends</TabsTrigger>
              <TabsTrigger value="visual-acuity">Visual Acuity</TabsTrigger>
              <TabsTrigger value="refraction">Refraction History</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4 mt-6">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {sortedEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-16 pb-8">
                    <div className="absolute left-6 -ml-2 mt-1.5">
                      <div className="h-4 w-4 rounded-full bg-white border-2 border-blue-500 ring-4 ring-white"></div>
                    </div>
                    
                    <Card className="border-l-4 border-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getEventIcon(event.type)}
                            <div>
                              <CardTitle className="text-base">{event.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {event.category} • {new Date(event.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(event.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{event.details}</p>
                        
                        {event.provider && (
                          <p className="text-sm">
                            <span className="font-medium">Provider:</span> {event.provider}
                          </p>
                        )}
                        
                        {event.findings && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                            <p className="text-sm">
                              <span className="font-medium text-blue-900">Findings:</span>
                              <br />
                              <span className="text-blue-800">{event.findings}</span>
                            </p>
                          </div>
                        )}
                        
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* IOP Trends Tab */}
            <TabsContent value="iop-trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Intraocular Pressure Trends</CardTitle>
                  <CardDescription>Historical IOP measurements with medication changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={iopHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        label={{ value: 'IOP (mmHg)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 25]}
                      />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        formatter={(value, name) => [`${value} mmHg`, name]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="OD" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Right Eye (OD)"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="OS" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Left Eye (OS)"
                        dot={{ r: 4 }}
                      />
                      {/* Target IOP line */}
                      <Line 
                        type="monotone" 
                        dataKey={() => 21} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        name="Upper Normal Limit (21 mmHg)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-4 space-y-2">
                    {iopHistory.filter(record => record.medication).map((record, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{new Date(record.date).toLocaleDateString()}:</span>
                        <span>{record.medication}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visual Acuity Tab */}
            <TabsContent value="visual-acuity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Acuity Progression</CardTitle>
                  <CardDescription>Changes in visual acuity over time (higher = better vision)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={vaChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        label={{ value: 'Visual Acuity (Decimal)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 1.2]}
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <Tooltip 
                        formatter={(value: any) => value.toFixed(2)}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="OD" 
                        stroke="#3b82f6" 
                        fill="#93c5fd"
                        name="Right Eye (OD)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="OS" 
                        stroke="#10b981" 
                        fill="#86efac"
                        name="Left Eye (OS)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Detailed VA Records</h4>
                    <div className="space-y-2">
                      {vaHistory.map((record, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                          <div className="flex gap-4">
                            <span className="text-blue-600">OD: {record.OD}</span>
                            <span className="text-green-600">OS: {record.OS}</span>
                            <span className="text-gray-500">({record.chart})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Refraction History Tab */}
            <TabsContent value="refraction" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Refraction History</CardTitle>
                  <CardDescription>Prescription changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(refractionHistory.map(r => r.date)))
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                      .map(date => {
                        const odRecord = refractionHistory.find(r => r.date === date && r.eye === 'OD');
                        const osRecord = refractionHistory.find(r => r.date === date && r.eye === 'OS');
                        
                        return (
                          <Card key={date} className="border border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                {odRecord && (
                                  <div className="space-y-1">
                                    <div className="font-medium text-blue-600">Right Eye (OD)</div>
                                    <div className="font-mono text-sm bg-blue-50 p-2 rounded">
                                      {odRecord.sphere > 0 ? '+' : ''}{odRecord.sphere.toFixed(2)} 
                                      {' '}{odRecord.cylinder > 0 ? '+' : ''}{odRecord.cylinder.toFixed(2)} 
                                      {' '}× {odRecord.axis}°
                                    </div>
                                  </div>
                                )}
                                {osRecord && (
                                  <div className="space-y-1">
                                    <div className="font-medium text-green-600">Left Eye (OS)</div>
                                    <div className="font-mono text-sm bg-green-50 p-2 rounded">
                                      {osRecord.sphere > 0 ? '+' : ''}{osRecord.sphere.toFixed(2)} 
                                      {' '}{osRecord.cylinder > 0 ? '+' : ''}{osRecord.cylinder.toFixed(2)} 
                                      {' '}× {osRecord.axis}°
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
