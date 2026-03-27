'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Key,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  BarChart3,
  Users,
  Zap,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Send,
  Plus,
  Edit,
  Trash2,
  Search
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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Patient,
  PatientPortalUser,
  PatientMessage,
  PatientEducation,
  patientsEnhancedApi
} from '@/lib/api/patients-enhanced.api';

interface PatientPortalManagementProps {
  patients: Patient[];
  onPatientUpdate: () => Promise<void>;
}

export const PatientPortalManagement: React.FC<PatientPortalManagementProps> = ({
  patients,
  onPatientUpdate
}) => {
  // State Management
  const [portalUsers, setPortalUsers] = useState<PatientPortalUser[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [educationMaterials, setEducationMaterials] = useState<PatientEducation[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedUser, setSelectedUser] = useState<PatientPortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Registration Modal
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    enableTwoFactor: false,
    notificationPreferences: {
      appointmentReminders: true,
      testResults: true,
      billing: true,
      generalHealth: true,
      method: 'Email' as 'Email' | 'SMS' | 'Portal' | 'Phone'
    }
  });

  // Message Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
    messageType: 'General' as 'General' | 'Appointment' | 'Medical' | 'Billing' | 'Prescription',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    recipientType: 'single' as 'single' | 'multiple' | 'all',
    selectedPatients: [] as string[]
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    registrationPeriod: '',
    lastLoginPeriod: '',
    notificationMethod: '',
    twoFactorEnabled: '',
    hasMessages: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load portal users for patients
      const portalUsersData: PatientPortalUser[] = [];
      for (const patient of patients.filter(p => p.portalAccess.isEnabled)) {
        try {
          const user = await patientsEnhancedApi.getPortalUser(patient.id);
          portalUsersData.push(user);
        } catch (error) {
          // Patient doesn't have portal access yet
          console.warn(`No portal user found for patient ${patient.id}`);
        }
      }
      setPortalUsers(portalUsersData);

      // Load recent messages
      const allMessages: PatientMessage[] = [];
      for (const patient of patients.slice(0, 10)) { // Load messages for first 10 patients for performance
        try {
          const patientMessages = await patientsEnhancedApi.getPatientMessages(patient.id);
          allMessages.push(...patientMessages);
        } catch (error) {
          console.warn(`Error loading messages for patient ${patient.id}`);
        }
      }
      setMessages(allMessages.sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()));

      // Load education materials
      const education = await patientsEnhancedApi.getEducationMaterials();
      setEducationMaterials(education);

    } catch (error) {
      console.error('Error loading portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchQuery || 
      patient.personalInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.personalInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.medicalInfo.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contactInfo.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const filteredPortalUsers = portalUsers.filter(user => {
    const patient = patients.find(p => p.id === user.patientId);
    if (!patient) return false;

    const matchesStatus = !filters.status || 
      (filters.status === 'active' ? user.isActive : !user.isActive);
    
    const matchesRegistration = !filters.registrationPeriod || 
      (filters.registrationPeriod === '30d' && 
        new Date(user.registrationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const matchesLogin = !filters.lastLoginPeriod ||
      (filters.lastLoginPeriod === '30d' && user.lastLoginDate &&
        new Date(user.lastLoginDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const matchesTwoFactor = !filters.twoFactorEnabled ||
      (filters.twoFactorEnabled === 'true' ? user.securitySettings.twoFactorEnabled : !user.securitySettings.twoFactorEnabled);

    return matchesStatus && matchesRegistration && matchesLogin && matchesTwoFactor;
  });

  const handleRegisterPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setRegistrationData(prev => ({
      ...prev,
      email: patient.contactInfo.email,
      username: `${patient.personalInfo.firstName.toLowerCase()}.${patient.personalInfo.lastName.toLowerCase()}`
    }));
    setShowRegistrationModal(true);
  };

  const handleSubmitRegistration = async () => {
    if (!selectedPatient) return;

    if (registrationData.password !== registrationData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await patientsEnhancedApi.registerForPortal(selectedPatient.id, {
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        enableTwoFactor: registrationData.enableTwoFactor,
        preferences: registrationData.notificationPreferences
      });

      await loadData();
      await onPatientUpdate();
      setShowRegistrationModal(false);
      setSelectedPatient(null);
      setRegistrationData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        enableTwoFactor: false,
        notificationPreferences: {
          appointmentReminders: true,
          testResults: true,
          billing: true,
          generalHealth: true,
          method: 'Email'
        }
      });
    } catch (error) {
      console.error('Error registering patient for portal:', error);
      alert('Error registering patient for portal. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    try {
      if (messageData.recipientType === 'single' && selectedPatient) {
        await patientsEnhancedApi.sendMessage(selectedPatient.id, {
          subject: messageData.subject,
          message: messageData.message,
          messageType: messageData.messageType,
          priority: messageData.priority
        });
      } else if (messageData.recipientType === 'multiple') {
        for (const patientId of messageData.selectedPatients) {
          await patientsEnhancedApi.sendMessage(patientId, {
            subject: messageData.subject,
            message: messageData.message,
            messageType: messageData.messageType,
            priority: messageData.priority
          });
        }
      } else if (messageData.recipientType === 'all') {
        for (const patient of patients.filter(p => p.portalAccess.isEnabled)) {
          await patientsEnhancedApi.sendMessage(patient.id, {
            subject: messageData.subject,
            message: messageData.message,
            messageType: messageData.messageType,
            priority: messageData.priority
          });
        }
      }

      await loadData();
      setShowMessageModal(false);
      setMessageData({
        subject: '',
        message: '',
        messageType: 'General',
        priority: 'Medium',
        recipientType: 'single',
        selectedPatients: []
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getMessagePriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistics
  const stats = {
    totalEligible: patients.length,
    registered: portalUsers.length,
    active: portalUsers.filter(u => u.isActive).length,
    recentLogins: portalUsers.filter(u => 
      u.lastLoginDate && 
      new Date(u.lastLoginDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    twoFactorEnabled: portalUsers.filter(u => u.securitySettings.twoFactorEnabled).length,
    unreadMessages: messages.filter(m => m.status === 'Unread').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading patient portal management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-7 h-7 text-blue-600 mr-3" />
            Patient Portal Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage patient portal access, communications, and digital engagement
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowMessageModal(true)}
            className="flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button
            onClick={() => {/* Handle bulk registration */}}
            className="flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Bulk Register
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalEligible}</div>
            <div className="text-sm text-gray-600">Total Eligible</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.registered}</div>
            <div className="text-sm text-gray-600">Registered</div>
            <div className="text-xs text-gray-500">
              {stats.totalEligible > 0 ? Math.round((stats.registered / stats.totalEligible) * 100) : 0}% adoption
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.recentLogins}</div>
            <div className="text-sm text-gray-600">Recent Logins</div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.twoFactorEnabled}</div>
            <div className="text-sm text-gray-600">2FA Enabled</div>
            <div className="text-xs text-gray-500">
              {stats.registered > 0 ? Math.round((stats.twoFactorEnabled / stats.registered) * 100) : 0}% secure
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unreadMessages}</div>
            <div className="text-sm text-gray-600">Unread Messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name, MRN, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.registrationPeriod} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, registrationPeriod: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Registration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Time</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.twoFactorEnabled} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, twoFactorEnabled: value }))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="2FA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Portal Users ({stats.registered})</TabsTrigger>
          <TabsTrigger value="registration">Registration ({stats.totalEligible - stats.registered})</TabsTrigger>
          <TabsTrigger value="messages">Messages ({stats.unreadMessages})</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        {/* Portal Users Tab */}
        <TabsContent value="users" className="mt-6">
          <div className="grid gap-4">
            {filteredPortalUsers.map((user) => {
              const patient = patients.find(p => p.id === user.patientId);
              if (!patient) return null;

              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* User Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.personalInfo.firstName} {patient.personalInfo.lastName}
                          </h3>
                          <Badge className={getStatusBadgeColor(user.isActive)}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.securitySettings.twoFactorEnabled && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              2FA
                            </Badge>
                          )}
                          {user.securitySettings.accountLocked && (
                            <Badge className="bg-red-100 text-red-800">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>

                        {/* User Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Username</div>
                            <div className="text-sm text-gray-600">{user.username}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Email</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Registration</div>
                            <div className="text-sm text-gray-600">
                              {new Date(user.registrationDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Last Login</div>
                            <div className="text-sm text-gray-600">
                              {user.lastLoginDate 
                                ? new Date(user.lastLoginDate).toLocaleDateString()
                                : 'Never'}
                            </div>
                          </div>
                        </div>

                        {/* Portal Features */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700 mb-2">Portal Features</div>
                          <div className="flex flex-wrap gap-2">
                            {user.portalFeatures.map((feature, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={feature.isEnabled ? 'border-green-200 text-green-800' : 'border-red-200 text-red-600'}
                              >
                                {feature.featureName}
                                {feature.lastUsed && (
                                  <span className="ml-1 text-xs">
                                    (Used {new Date(feature.lastUsed).toLocaleDateString()})
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-2">Notification Preferences</div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Appointment Reminders</span>
                              <span className={user.preferences.notificationPreferences.appointmentReminders ? 'text-green-600' : 'text-red-600'}>
                                {user.preferences.notificationPreferences.appointmentReminders ? 'On' : 'Off'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Test Results</span>
                              <span className={user.preferences.notificationPreferences.testResults ? 'text-green-600' : 'text-red-600'}>
                                {user.preferences.notificationPreferences.testResults ? 'On' : 'Off'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Billing</span>
                              <span className={user.preferences.notificationPreferences.billing ? 'text-green-600' : 'text-red-600'}>
                                {user.preferences.notificationPreferences.billing ? 'On' : 'Off'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Method</span>
                              <span className="text-gray-600">
                                {user.preferences.notificationPreferences.method}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowMessageModal(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Registration Tab */}
        <TabsContent value="registration" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Eligible Patients for Portal Registration</h3>
              <Badge variant="outline">
                {patients.filter(p => !p.portalAccess.isEnabled).length} unregistered
              </Badge>
            </div>

            <div className="grid gap-4">
              {filteredPatients
                .filter(patient => !patient.portalAccess.isEnabled)
                .map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {patient.personalInfo.firstName} {patient.personalInfo.lastName}
                            </h4>
                            <Badge variant="outline">
                              {patient.medicalInfo.mrn}
                            </Badge>
                            <Badge className={`${patient.systemInfo.riskLevel === 'High' || patient.systemInfo.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {patient.systemInfo.riskLevel} Risk
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-gray-700">Email</div>
                              <div className="text-gray-600">{patient.contactInfo.email}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-700">Phone</div>
                              <div className="text-gray-600">{patient.contactInfo.primaryPhone}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-700">Age</div>
                              <div className="text-gray-600">
                                {Math.floor((new Date().getTime() - new Date(patient.personalInfo.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-700">Last Visit</div>
                              <div className="text-gray-600">
                                {patient.systemInfo.lastVisit 
                                  ? new Date(patient.systemInfo.lastVisit).toLocaleDateString()
                                  : 'Never'}
                              </div>
                            </div>
                          </div>

                          {/* Registration Readiness Indicators */}
                          <div className="mt-4 space-y-2">
                            <div className="text-sm font-medium text-gray-700">Registration Readiness</div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className={`flex items-center ${patient.contactInfo.email ? 'text-green-600' : 'text-red-600'}`}>
                                {patient.contactInfo.email ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                                Valid Email
                              </div>
                              <div className={`flex items-center ${patient.compliance.hipaaConsent ? 'text-green-600' : 'text-red-600'}`}>
                                {patient.compliance.hipaaConsent ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                                HIPAA Consent
                              </div>
                              <div className={`flex items-center ${patient.systemInfo.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                {patient.systemInfo.status === 'Active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                                Active Patient
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleRegisterPatient(patient)}
                            disabled={!patient.contactInfo.email || !patient.compliance.hipaaConsent}
                            className="flex items-center"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Patient Messages</h3>
              <Button
                onClick={() => setShowMessageModal(true)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>

            <div className="grid gap-4">
              {messages.slice(0, 20).map((message) => {
                const patient = patients.find(p => p.id === message.patientId);
                if (!patient) return null;

                return (
                  <Card key={message.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                            <Badge className={getMessagePriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            <Badge variant="outline">{message.messageType}</Badge>
                            <Badge className={message.status === 'Unread' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                              {message.status}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 mb-3">
                            <strong>To:</strong> {patient.personalInfo.firstName} {patient.personalInfo.lastName} ({patient.medicalInfo.mrn})
                          </div>

                          <div className="text-sm text-gray-800 mb-3">
                            {message.message.length > 200 
                              ? `${message.message.substring(0, 200)}...`
                              : message.message}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Sent: {formatDate(message.sentDate)}</span>
                            {message.readDate && <span>Read: {formatDate(message.readDate)}</span>}
                            {message.replyDate && <span>Replied: {formatDate(message.replyDate)}</span>}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Patient Education Materials</h3>
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{material.title}</h4>
                        <Badge variant="outline" className="mb-2">{material.category}</Badge>
                        <Badge variant="outline">{material.contentType}</Badge>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-3">
                        {material.description}
                      </p>

                      {material.thumbnailUrl && (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Updated: {new Date(material.lastUpdated).toLocaleDateString()}</span>
                        {material.duration && <span>{material.duration} min</span>}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Patient for Portal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={registrationData.username}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={registrationData.password}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={registrationData.confirmPassword}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm Password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="twoFactor"
                checked={registrationData.enableTwoFactor}
                onCheckedChange={(checked) => setRegistrationData(prev => ({ ...prev, enableTwoFactor: checked }))}
              />
              <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowRegistrationModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitRegistration} className="flex-1">
                Register
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to Patients</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="messageType">Message Type</Label>
                <Select
                  value={messageData.messageType}
                  onValueChange={(value: any) => setMessageData(prev => ({ ...prev, messageType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={messageData.priority}
                  onValueChange={(value: any) => setMessageData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="recipientType">Recipients</Label>
              <Select
                value={messageData.recipientType}
                onValueChange={(value: any) => setMessageData(prev => ({ ...prev, recipientType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Patient</SelectItem>
                  <SelectItem value="multiple">Multiple Patients</SelectItem>
                  <SelectItem value="all">All Portal Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={messageData.subject}
                onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Message subject"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageData.message}
                onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowMessageModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSendMessage} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientPortalManagement;