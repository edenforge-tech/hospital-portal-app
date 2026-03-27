'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  Heart,
  AlertTriangle,
  Calendar,
  FileText,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Shield,
  Clock,
  TrendingUp,
  Activity,
  ChevronDown,
  Settings,
  Copy,
  Merge,
  UserPlus,
  Stethoscope,
  Pill
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  patientsEnhancedApi,
  Patient,
  PatientSearchFilters,
  PatientAnalytics
} from '@/lib/api/patients-enhanced.api';
import { PatientDetailsModal } from './PatientDetailsModal';
import { PatientFormModal } from './PatientFormModal';
// import { PatientMedicalRecords } from './PatientMedicalRecords';
// import { PatientPortalManagement } from './PatientPortalManagement';
// import { PatientAnalyticsDashboard } from './PatientAnalyticsDashboard';

interface EnhancedPatientsPageProps {}

export const EnhancedPatientsPage: React.FC<EnhancedPatientsPageProps> = () => {
  // State Management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [analytics, setAnalytics] = useState<PatientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('patients');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState<PatientSearchFilters>({
    query: '',
    status: '',
    ageRange: undefined,
    gender: '',
    provider: '',
    insurance: '',
    riskLevel: '',
    hasUpcomingAppointments: undefined,
    lastVisitRange: undefined,
    medicalConditions: [],
    allergies: [],
    flags: [],
    zipCode: '',
    registrationDateRange: undefined
  });

  // Quick Filters
  const [quickFilters, setQuickFilters] = useState({
    newPatients: false,
    highRisk: false,
    upcomingAppointments: false,
    overdueBills: false,
    portalUsers: false
  });

  // View Options
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'compact'>('card');
  const [sortBy, setSortBy] = useState('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filters, quickFilters, sortBy, sortDirection]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Build filters based on quick filters
      const combinedFilters: PatientSearchFilters = {
        ...filters,
        query: searchQuery || filters.query,
        riskLevel: quickFilters.highRisk ? 'High' : filters.riskLevel,
        hasUpcomingAppointments: quickFilters.upcomingAppointments || filters.hasUpcomingAppointments,
        registrationDateRange: quickFilters.newPatients 
          ? {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0]
            }
          : filters.registrationDateRange
      };

      const response = await patientsEnhancedApi.getPatients(
        combinedFilters,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

      setPatients(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);

    } catch (error) {
      console.error('Error loading patients:', error);
      // Set empty array on error - backend may not be running
      setPatients([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await patientsEnhancedApi.getPatientAnalytics({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handlePatientAction = async (action: string, patient: Patient) => {
    switch (action) {
      case 'view':
        setSelectedPatient(patient);
        setShowDetailsModal(true);
        break;
      case 'edit':
        setSelectedPatient(patient);
        setShowFormModal(true);
        break;
      case 'duplicate':
        const duplicatedPatient = { 
          ...patient, 
          personalInfo: {
            ...patient.personalInfo,
            firstName: `${patient.personalInfo.firstName} (Copy)`
          },
          id: undefined 
        };
        setSelectedPatient(duplicatedPatient);
        setShowFormModal(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete patient "${patient.personalInfo.firstName} ${patient.personalInfo.lastName}"?`)) {
          try {
            await patientsEnhancedApi.deletePatient(patient.id);
            await loadData();
          } catch (error) {
            console.error('Error deleting patient:', error);
          }
        }
        break;
      case 'portal':
        // Handle portal registration/management
        break;
      case 'appointment':
        // Handle appointment booking
        break;
    }
  };

  const handleQuickFilter = (filterName: string) => {
    setQuickFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev]
    }));
    setCurrentPage(1);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Deceased': return 'bg-black text-white border-black';
      case 'Transferred': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // Statistics from analytics
  const stats = analytics ? {
    total: analytics.summary.totalPatients,
    active: analytics.summary.activePatients,
    newThisMonth: analytics.summary.newPatientsThisMonth,
    averageAge: Math.round(analytics.summary.averageAge),
    highRisk: analytics.summary.riskLevelDistribution.high + analytics.summary.riskLevelDistribution.critical,
    portalUsers: analytics.utilization.portalUsage.reduce((sum, p) => sum + p.activeUsers, 0)
  } : {
    total: 0,
    active: 0,
    newThisMonth: 0,
    averageAge: 0,
    highRisk: 0,
    portalUsers: 0
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading patient management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            Patient Management
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive patient records, medical history, and portal management
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => patientsEnhancedApi.exportPatients('xlsx', filters)}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={() => {
              setSelectedPatient(null);
              setShowFormModal(true);
            }}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-purple-600">{stats.newThisMonth}</p>
                <p className="text-xs text-gray-500">New registrations</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Age</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageAge}</p>
                <p className="text-xs text-gray-500">Years old</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
                <p className="text-xs text-gray-500">Patients</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portal Users</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.portalUsers}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.portalUsers / stats.total) * 100) : 0}% adoption
                </p>
              </div>
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={quickFilters.newPatients ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('newPatients')}
              className="flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Patients (30d)
            </Button>
            
            <Button
              variant={quickFilters.highRisk ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('highRisk')}
              className="flex items-center"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              High Risk
            </Button>
            
            <Button
              variant={quickFilters.upcomingAppointments ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('upcomingAppointments')}
              className="flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Appointments
            </Button>
            
            <Button
              variant={quickFilters.overdueBills ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('overdueBills')}
              className="flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Overdue Bills
            </Button>
            
            <Button
              variant={quickFilters.portalUsers ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('portalUsers')}
              className="flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Portal Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name, MRN, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadData()}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Deceased">Deceased</SelectItem>
                  <SelectItem value="Transferred">Transferred</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.gender || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.riskLevel || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Cards</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={loadData}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Patients ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center">
            <Stethoscope className="w-4 h-4 mr-2" />
            Medical Records
          </TabsTrigger>
          <TabsTrigger value="portal" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Patient Portal
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading patients...</p>
              </CardContent>
            </Card>
          ) : viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {patients?.map((patient) => (
                <Card key={patient.id} className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-blue-500 cursor-pointer" onClick={() => handlePatientAction('view', patient)}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Patient Header with Avatar */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                            patient.systemInfo.riskLevel === 'High' || patient.systemInfo.riskLevel === 'Critical' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                            patient.systemInfo.riskLevel === 'Medium' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                            'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {patient.personalInfo.firstName[0]}{patient.personalInfo.lastName[0]}
                          </div>
                          {patient.portalAccess.isEnabled && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name and MRN */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {patient.personalInfo.firstName} {patient.personalInfo.lastName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 font-mono">MRN: {patient.medicalInfo.mrn}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {formatAge(patient.personalInfo.dateOfBirth)}y • {patient.personalInfo.gender}
                            </Badge>
                            {patient.medicalInfo.bloodType && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {patient.medicalInfo.bloodType}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('view', patient); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('edit', patient); }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Patient
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('appointment', patient); }}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Book Appointment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('portal', patient); }}>
                              <Shield className="w-4 h-4 mr-2" />
                              Portal Access
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('duplicate', patient); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handlePatientAction('delete', patient); }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getStatusBadgeColor(patient.systemInfo.status)} shadow-sm`}>
                          {patient.systemInfo.status}
                        </Badge>
                        <Badge className={`${getRiskLevelColor(patient.systemInfo.riskLevel)} shadow-sm`}>
                          {patient.systemInfo.riskLevel}
                        </Badge>
                        {patient.systemInfo.totalVisits > 10 && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            VIP
                          </Badge>
                        )}
                      </div>

                      {/* Contact Info - Compact */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                          <Phone className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{formatPhoneNumber(patient.contactInfo.primaryPhone)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                          <Mail className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{patient.contactInfo.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{patient.contactInfo.address.city}, {patient.contactInfo.address.state}</span>
                        </div>
                      </div>

                      {/* Critical Medical Info - Only if exists */}
                      {(patient.medicalInfo.medicalAlerts.filter(alert => alert.isActive).length > 0 || 
                        patient.medicalInfo.allergies.length > 0) && (
                        <div className="space-y-2">
                          {patient.medicalInfo.medicalAlerts.filter(alert => alert.isActive).length > 0 && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded p-2.5">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-red-900">
                                  {patient.medicalInfo.medicalAlerts.filter(alert => alert.isActive).length} Active Alert{patient.medicalInfo.medicalAlerts.filter(alert => alert.isActive).length > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {patient.medicalInfo.allergies.length > 0 && (
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 rounded p-2.5">
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-orange-900 truncate">
                                  {patient.medicalInfo.allergies.slice(0, 2).map(a => a.allergen).join(', ')}
                                  {patient.medicalInfo.allergies.length > 2 && ` +${patient.medicalInfo.allergies.length - 2}`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Stats Bar */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="text-lg font-bold text-gray-900">{patient.systemInfo.totalVisits}</div>
                          <div className="text-xs text-gray-500">Visits</div>
                        </div>
                        <div className="text-center border-x border-gray-100">
                          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {patient.systemInfo.lastVisit 
                              ? Math.floor((new Date().getTime() - new Date(patient.systemInfo.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
                              : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">Days Ago</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {patient.insurance.verificationStatus === 'Verified' ? '✓' : '⚠'}
                          </div>
                          <div className="text-xs text-gray-500">Insurance</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">MRN</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Age/Gender</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Risk</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Last Visit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients?.map((patient, index) => (
                        <tr key={patient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {patient.personalInfo.firstName} {patient.personalInfo.lastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {patient.personalInfo.dateOfBirth}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {patient.medicalInfo.mrn}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {formatAge(patient.personalInfo.dateOfBirth)} / {patient.personalInfo.gender}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div>{formatPhoneNumber(patient.contactInfo.primaryPhone)}</div>
                            <div className="text-gray-600">{patient.contactInfo.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusBadgeColor(patient.systemInfo.status)}>
                              {patient.systemInfo.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getRiskLevelColor(patient.systemInfo.riskLevel)}`}>
                              {patient.systemInfo.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {patient.systemInfo.lastVisit 
                              ? new Date(patient.systemInfo.lastVisit).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-4 h-4" />
                                  <ChevronDown className="w-4 h-4 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePatientAction('view', patient)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePatientAction('edit', patient)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePatientAction('appointment', patient)}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Appointment
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePatientAction('delete', patient)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} patients
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="medical">
          <Card>
            <CardContent className="p-12 text-center">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Records Coming Soon</h3>
              <p className="text-gray-600">This feature is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Portal Tab */}
        <TabsContent value="portal">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Portal Coming Soon</h3>
              <p className="text-gray-600">This feature is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">This feature is under development.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* No Results */}
      {patients?.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f) || Object.values(quickFilters).some(f => f)
                ? 'No patients match your current filters.'
                : 'No patients have been registered yet.'}
            </p>
            <Button onClick={() => {
              setSelectedPatient(null);
              setShowFormModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Register First Patient
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Patient Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <PatientFormModal
            patient={selectedPatient}
            onSave={async (patientData) => {
              try {
                if (selectedPatient?.id) {
                  await patientsEnhancedApi.updatePatient(selectedPatient.id, patientData);
                } else {
                  await patientsEnhancedApi.createPatient(patientData);
                }
                await loadData();
                setShowFormModal(false);
                setSelectedPatient(null);
              } catch (error) {
                console.error('Error saving patient:', error);
              }
            }}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedPatient(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <PatientDetailsModal
            patient={selectedPatient}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowFormModal(true);
            }}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedPatient(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedPatientsPage;