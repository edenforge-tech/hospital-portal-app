'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Plus, Search, Video, Phone, Calendar, Clock, User, 
  CheckCircle, XCircle, Monitor, Mic, MicOff, VideoOff,
  MessageSquare, FileText, Activity
} from 'lucide-react';

interface TelemedicineAppointment {
  id: string;
  patientMRN: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  consultationType: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  doctor: string;
  department: string;
  chiefComplaint: string;
  notes?: string;
}

const mockAppointments: TelemedicineAppointment[] = [
  {
    id: '1',
    patientMRN: 'MRN-2024-0456',
    patientName: 'Rajesh Kumar',
    patientPhone: '+91 98765 43210',
    appointmentDate: '2024-01-15',
    appointmentTime: '10:00 AM',
    duration: 15,
    consultationType: 'video',
    status: 'waiting',
    doctor: 'Dr. Sharma',
    department: 'Ophthalmology',
    chiefComplaint: 'Follow-up for post-operative care after cataract surgery',
  },
  {
    id: '2',
    patientMRN: 'MRN-2024-0789',
    patientName: 'Sunita Devi',
    patientPhone: '+91 87654 32109',
    appointmentDate: '2024-01-15',
    appointmentTime: '10:30 AM',
    duration: 20,
    consultationType: 'video',
    status: 'scheduled',
    doctor: 'Dr. Patel',
    department: 'Retina',
    chiefComplaint: 'Diabetic retinopathy management consultation',
  },
  {
    id: '3',
    patientMRN: 'MRN-2024-0234',
    patientName: 'Mohammed Ali',
    patientPhone: '+91 76543 21098',
    appointmentDate: '2024-01-15',
    appointmentTime: '11:00 AM',
    duration: 15,
    consultationType: 'audio',
    status: 'scheduled',
    doctor: 'Dr. Gupta',
    department: 'Glaucoma',
    chiefComplaint: 'Prescription renewal and IOP check discussion',
  },
  {
    id: '4',
    patientMRN: 'MRN-2024-0123',
    patientName: 'Priya Singh',
    patientPhone: '+91 65432 10987',
    appointmentDate: '2024-01-15',
    appointmentTime: '09:00 AM',
    duration: 20,
    consultationType: 'video',
    status: 'completed',
    doctor: 'Dr. Sharma',
    department: 'Ophthalmology',
    chiefComplaint: 'Eye strain from prolonged screen use',
    notes: 'Recommended blue light glasses, lubricating drops, 20-20-20 rule. Follow-up in 2 weeks if symptoms persist.'
  },
];

export default function TelemedicinePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<TelemedicineAppointment | null>(null);

  const filteredAppointments = mockAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.patientMRN.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'waiting': 'bg-yellow-100 text-yellow-800 animate-pulse',
      'in-progress': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'no-show': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-200 text-gray-600',
    };
    const labels: Record<string, string> = {
      'scheduled': 'Scheduled',
      'waiting': 'Patient Waiting',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'no-show': 'No Show',
      'cancelled': 'Cancelled',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-600" />;
      case 'audio': return <Phone className="h-4 w-4 text-green-600" />;
      case 'chat': return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default: return null;
    }
  };

  // Statistics
  const waitingCount = mockAppointments.filter(a => a.status === 'waiting').length;
  const scheduledCount = mockAppointments.filter(a => a.status === 'scheduled').length;
  const completedCount = mockAppointments.filter(a => a.status === 'completed').length;

  return (
    <ProtectedRoute requiredPermission="TELEMEDICINE:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Video className="h-8 w-8 text-blue-600" />
              Telemedicine Consultations
            </h1>
            <p className="text-gray-600 mt-1">
              Video, audio, and chat consultations with patients
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/telemedicine/schedule')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Schedule Consultation
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Patients Waiting</p>
                <p className="text-2xl font-bold text-yellow-900">{waitingCount}</p>
              </div>
              <div className="relative">
                <Clock className="h-8 w-8 text-yellow-600" />
                {waitingCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full animate-ping"></span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Upcoming Today</p>
                <p className="text-2xl font-bold text-blue-900">{scheduledCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-green-900">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Consultations</p>
                <p className="text-2xl font-bold text-purple-900">{mockAppointments.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="no-show">No Show</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Main Content - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Consultations</h2>
            {filteredAppointments.map(apt => (
              <div 
                key={apt.id} 
                className={`bg-white rounded-lg shadow border p-4 cursor-pointer transition-all ${
                  selectedAppointment?.id === apt.id ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'
                } ${apt.status === 'waiting' ? 'border-l-4 border-l-yellow-500' : ''}`}
                onClick={() => setSelectedAppointment(apt)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{apt.patientName}</h3>
                      <p className="text-sm text-gray-500">{apt.patientMRN}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getConsultationIcon(apt.consultationType)}
                    {getStatusBadge(apt.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium">{apt.appointmentTime} ({apt.duration} min)</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Doctor</p>
                    <p className="font-medium">{apt.doctor}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Chief Complaint</p>
                    <p className="font-medium text-gray-700 truncate">{apt.chiefComplaint}</p>
                  </div>
                </div>

                {apt.status === 'waiting' && (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                      <Video className="h-4 w-4" />
                      Start Consultation
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Consultation Panel */}
          <div className="bg-white rounded-lg shadow-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-4">
              {/* Start Consultation Button */}
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Video className="h-5 w-5" />
                Start Video Call
              </button>
              
              {/* Device Check */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Device Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Camera
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Microphone
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Internet
                    </span>
                    <span className="text-green-600 text-xs">Strong</span>
                  </div>
                </div>
              </div>

              {/* Recent Notes */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Quick Links</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Consultation Templates
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Follow-up
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Patient History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
