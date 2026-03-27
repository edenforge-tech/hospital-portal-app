'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  FileText,
  TestTube,
  CreditCard,
  MessageSquare,
  Bell,
  ArrowRight,
  Clock,
  User,
  Heart,
  Activity,
  Pill,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Plus,
  Eye,
  Download,
  Phone,
  Video,
} from 'lucide-react';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled';
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: string;
  refillsRemaining: number;
}

interface TestResult {
  id: string;
  testName: string;
  date: string;
  status: 'available' | 'pending' | 'in-progress';
  category: string;
}

interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'due' | 'overdue' | 'paid';
}

interface Message {
  id: string;
  from: string;
  subject: string;
  date: string;
  isRead: boolean;
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Arun Mehta',
    specialty: 'Ophthalmology',
    date: '2026-01-30',
    time: '10:00 AM',
    type: 'in-person',
    status: 'confirmed',
  },
  {
    id: '2',
    doctorName: 'Dr. Priya Nair',
    specialty: 'General Medicine',
    date: '2026-02-05',
    time: '2:30 PM',
    type: 'video',
    status: 'upcoming',
  },
];

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    medication: 'Prednisolone Eye Drops',
    dosage: '1%',
    frequency: '4 times daily',
    prescribedBy: 'Dr. Arun Mehta',
    prescribedDate: '2026-01-15',
    refillsRemaining: 2,
  },
  {
    id: '2',
    medication: 'Moxifloxacin Eye Drops',
    dosage: '0.5%',
    frequency: '3 times daily',
    prescribedBy: 'Dr. Arun Mehta',
    prescribedDate: '2026-01-15',
    refillsRemaining: 1,
  },
];

const mockTestResults: TestResult[] = [
  {
    id: '1',
    testName: 'Complete Blood Count (CBC)',
    date: '2026-01-25',
    status: 'available',
    category: 'Blood Test',
  },
  {
    id: '2',
    testName: 'OCT Scan - Right Eye',
    date: '2026-01-28',
    status: 'pending',
    category: 'Eye Scan',
  },
];

const mockBills: Bill[] = [
  {
    id: '1',
    description: 'Consultation - Dr. Arun Mehta',
    amount: 1500,
    dueDate: '2026-02-01',
    status: 'due',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    from: 'Dr. Arun Mehta',
    subject: 'Follow-up on your recent visit',
    date: '2026-01-27',
    isRead: false,
  },
  {
    id: '2',
    from: 'Hospital Admin',
    subject: 'Your appointment confirmation',
    date: '2026-01-26',
    isRead: true,
  },
];

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getAppointmentTypeIcon = (type: Appointment['type']) => {
  switch (type) {
    case 'video': return <Video className="h-4 w-4 text-blue-600" />;
    case 'phone': return <Phone className="h-4 w-4 text-green-600" />;
    default: return <User className="h-4 w-4 text-purple-600" />;
  }
};

export default function PatientDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [testResults, setTestResults] = useState<TestResult[]>(mockTestResults);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // Patient info - would come from auth context
  const patient = {
    name: 'Rajesh Kumar',
    mrn: 'MRN-2024-001',
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    lastVisit: '2026-01-15',
  };

  const unreadMessages = messages.filter(m => !m.isRead).length;
  const pendingBills = bills.filter(b => b.status === 'due' || b.status === 'overdue');
  const totalDue = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {patient.name}!</h1>
            <p className="text-blue-100 mt-1">
              Here's an overview of your health information
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                MRN: {patient.mrn}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Blood: {patient.bloodGroup}
              </span>
              {patient.allergies.length > 0 && (
                <span className="bg-red-500/80 px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Allergies: {patient.allergies.join(', ')}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/patient/appointments/new"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              <p className="text-xs text-gray-500">Upcoming Visits</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Pill className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              <p className="text-xs text-gray-500">Active Medications</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TestTube className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{testResults.filter(t => t.status === 'available').length}</p>
              <p className="text-xs text-gray-500">New Results</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
              <p className="text-xs text-gray-500">Unread Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments & Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </h2>
              <Link href="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Link
                    href="/patient/appointments/new"
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                  >
                    Book an appointment
                  </Link>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getAppointmentTypeIcon(apt.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.doctorName}</p>
                        <p className="text-sm text-gray-500">{apt.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(apt.date)} at {apt.time}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            apt.type === 'video' ? 'bg-blue-100 text-blue-700' :
                            apt.type === 'phone' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {apt.type === 'video' ? 'Video Call' : apt.type === 'phone' ? 'Phone Call' : 'In-Person'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.type === 'video' && apt.status === 'confirmed' && (
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          Join
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TestTube className="h-5 w-5 text-purple-600" />
                Recent Test Results
              </h2>
              <Link href="/patient/results" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      result.status === 'available' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {result.status === 'available' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{result.testName}</p>
                      <p className="text-xs text-gray-500">{result.category} • {formatDate(result.date)}</p>
                    </div>
                  </div>
                  {result.status === 'available' ? (
                    <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  ) : (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Outstanding Bills */}
          {totalDue > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-800">Outstanding Balance</p>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(totalDue)}</p>
                </div>
              </div>
              <Link
                href="/patient/payments"
                className="block w-full py-2 bg-orange-600 text-white text-center rounded-lg hover:bg-orange-700 text-sm font-medium"
              >
                Pay Now
              </Link>
            </div>
          )}

          {/* Current Medications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-600" />
                My Medications
              </h2>
              <Link href="/patient/prescriptions" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{rx.medication}</p>
                  <p className="text-sm text-gray-500">{rx.dosage} - {rx.frequency}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">by {rx.prescribedBy}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rx.refillsRemaining > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {rx.refillsRemaining} refills left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Messages
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </h2>
              <Link href="/patient/messages" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {messages.slice(0, 3).map((msg) => (
                <Link 
                  key={msg.id} 
                  href={`/patient/messages/${msg.id}`}
                  className={`block p-3 rounded-lg hover:bg-gray-100 ${!msg.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    {!msg.isRead && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                    <p className={`text-sm ${!msg.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {msg.from}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{msg.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(msg.date)}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/patient/appointments/new"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-xs text-gray-700">Book Visit</span>
              </Link>
              <Link
                href="/patient/prescriptions/refill"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <Pill className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-xs text-gray-700">Refill Rx</span>
              </Link>
              <Link
                href="/patient/messages/new"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <MessageSquare className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <span className="text-xs text-gray-700">Message Dr</span>
              </Link>
              <Link
                href="/patient/records"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <Download className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-xs text-gray-700">Get Records</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
