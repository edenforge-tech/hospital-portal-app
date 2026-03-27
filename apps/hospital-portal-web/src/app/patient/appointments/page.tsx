'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileText,
  RefreshCw,
  Star,
} from 'lucide-react';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorImage?: string;
  specialty: string;
  department: string;
  date: string;
  time: string;
  duration: number;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  reason: string;
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image?: string;
  nextAvailable: string;
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: 'APT-001',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Arun Mehta',
    specialty: 'Ophthalmology - Cataract & Refractive',
    department: 'Eye Care',
    date: '2026-01-30',
    time: '10:00 AM',
    duration: 30,
    type: 'in-person',
    status: 'confirmed',
    location: 'Building A, Floor 2, Room 205',
    reason: 'Post-operative follow-up',
    notes: 'Bring previous prescription and test reports',
    createdAt: '2026-01-20',
  },
  {
    id: 'APT-002',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Priya Nair',
    specialty: 'General Medicine',
    department: 'Internal Medicine',
    date: '2026-02-05',
    time: '2:30 PM',
    duration: 15,
    type: 'video',
    status: 'scheduled',
    reason: 'Regular checkup',
    createdAt: '2026-01-25',
  },
  {
    id: 'APT-003',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Arun Mehta',
    specialty: 'Ophthalmology - Cataract & Refractive',
    department: 'Eye Care',
    date: '2026-01-15',
    time: '11:00 AM',
    duration: 45,
    type: 'in-person',
    status: 'completed',
    location: 'Building A, Floor 2, Room 205',
    reason: 'Cataract surgery pre-operative assessment',
    createdAt: '2026-01-05',
  },
  {
    id: 'APT-004',
    doctorId: 'DOC-003',
    doctorName: 'Dr. Suresh Rao',
    specialty: 'Vitreoretinal Surgery',
    department: 'Eye Care',
    date: '2026-01-10',
    time: '9:00 AM',
    duration: 30,
    type: 'in-person',
    status: 'cancelled',
    location: 'Building A, Floor 3, Room 310',
    reason: 'Retinal screening',
    createdAt: '2025-12-28',
  },
];

const suggestedDoctors: Doctor[] = [
  {
    id: 'DOC-001',
    name: 'Dr. Arun Mehta',
    specialty: 'Ophthalmology',
    rating: 4.9,
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: 'DOC-002',
    name: 'Dr. Priya Nair',
    specialty: 'General Medicine',
    rating: 4.8,
    nextAvailable: 'Today, 4:00 PM',
  },
];

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'no-show': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: Appointment['type']) => {
  switch (type) {
    case 'video': return <Video className="h-4 w-4 text-blue-600" />;
    case 'phone': return <Phone className="h-4 w-4 text-green-600" />;
    default: return <User className="h-4 w-4 text-purple-600" />;
  }
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const upcomingAppointments = appointments.filter(apt => 
    apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  const pastAppointments = appointments.filter(apt => 
    apt.date < today || apt.status === 'cancelled' || apt.status === 'completed'
  );

  const displayAppointments = (activeTab === 'upcoming' ? upcomingAppointments : pastAppointments)
    .filter(apt => {
      const matchesSearch = 
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const handleCancelAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    if (selectedAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id ? { ...apt, status: 'cancelled' as const } : apt
      ));
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500">Manage your appointments and schedule new visits</p>
        </div>
        <Link
          href="/patient/appointments/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 w-fit"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
              <p className="text-xs text-gray-500">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
              <p className="text-xs text-gray-500">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Appointment Alert */}
      {upcomingAppointments[0] && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              {getTypeIcon(upcomingAppointments[0].type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">Your Next Appointment</p>
              <p className="text-lg font-semibold text-blue-900">{upcomingAppointments[0].doctorName}</p>
              <p className="text-sm text-blue-700">{upcomingAppointments[0].specialty}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-blue-700">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(upcomingAppointments[0].date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {upcomingAppointments[0].time}
                </span>
                {upcomingAppointments[0].location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {upcomingAppointments[0].location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {upcomingAppointments[0].type === 'video' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  Join Call
                </button>
              )}
              <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-3 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-3 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Past ({pastAppointments.length})
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {displayAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments found'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/patient/appointments/new"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Book your first appointment
              </Link>
            )}
          </div>
        ) : (
          displayAppointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{apt.doctorName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{apt.specialty}</p>
                    <p className="text-sm text-gray-400 mt-1">{apt.reason}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {apt.time} ({apt.duration} min)
                      </span>
                      <span className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full ${
                        apt.type === 'video' ? 'bg-blue-50 text-blue-600' :
                        apt.type === 'phone' ? 'bg-green-50 text-green-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {getTypeIcon(apt.type)}
                        {apt.type === 'video' ? 'Video' : apt.type === 'phone' ? 'Phone' : 'In-Person'}
                      </span>
                    </div>

                    {apt.location && apt.type === 'in-person' && (
                      <p className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <MapPin className="h-4 w-4" />
                        {apt.location}
                      </p>
                    )}

                    {apt.notes && (
                      <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
                    <>
                      {apt.type === 'video' && (
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          Join
                        </button>
                      )}
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                        <RefreshCw className="h-4 w-4" />
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(apt)}
                        className="px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-50 flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  ) : apt.status === 'completed' ? (
                    <>
                      <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Summary
                      </button>
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-1">
                        <RefreshCw className="h-4 w-4" />
                        Book Again
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Suggested Doctors */}
      {activeTab === 'upcoming' && upcomingAppointments.length < 2 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Doctors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedDoctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-yellow-500 text-sm">
                        <Star className="h-4 w-4 fill-current" />
                        {doc.rating}
                      </span>
                      <span className="text-xs text-green-600">
                        Next: {doc.nextAvailable}
                      </span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment?</h3>
              <p className="text-gray-500 mb-4">
                Are you sure you want to cancel your appointment with {selectedAppointment.doctorName} on {formatDate(selectedAppointment.date)} at {selectedAppointment.time}?
              </p>
              <p className="text-sm text-orange-600 mb-6">
                Note: You may be charged a cancellation fee if cancelled within 24 hours.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={confirmCancellation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
