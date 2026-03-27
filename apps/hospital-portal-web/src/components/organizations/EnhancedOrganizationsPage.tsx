'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  BarChart3, 
  TreePine, 
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Move,
  Copy,
  ChevronDown,
  Building2,
  Globe,
  Phone,
  Mail,
  Calendar,
  Award,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle
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
import { 
  organizationsEnhancedApi, 
  Organization, 
  Location, 
  OrganizationAnalytics,
  DepartmentAssignment
} from '@/lib/api/organizations-enhanced.api';
import { OrganizationHierarchyTree } from './OrganizationHierarchyTree';
import { LocationManagement } from './LocationManagement';
import { DepartmentAssignments } from './DepartmentAssignments';
import { OrganizationAnalyticsDashboard } from './OrganizationAnalyticsDashboard';
import { EnhancedOrganizationFormModal } from './EnhancedOrganizationFormModal';

interface EnhancedOrganizationsPageProps {}

export const EnhancedOrganizationsPage: React.FC<EnhancedOrganizationsPageProps> = () => {
  // State Management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('organizations');
  const [showFormModal, setShowFormModal] = useState(false);

  // Filters
  const [organizationFilters, setOrganizationFilters] = useState({
    type: '',
    status: '',
    location: '',
    hasChildren: undefined as boolean | undefined
  });

  // Real-time Statistics
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalLocations: 0,
    totalDepartments: 0,
    totalEmployees: 0,
    totalRevenue: 0,
    averagePerformance: 0,
    complianceScore: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [organizationsResponse, locationsResponse, analyticsData] = await Promise.all([
        organizationsEnhancedApi.getOrganizations({}, 1, 100),
        organizationsEnhancedApi.getLocations(),
        organizationsEnhancedApi.getOrganizationAnalytics('30d')
      ]);

      setOrganizations(organizationsResponse.items);
      setLocations(locationsResponse);
      setAnalytics(analyticsData);

      // Calculate statistics
      const totalOrganizations = organizationsResponse.items.length;
      const activeOrganizations = organizationsResponse.items.filter(o => o.status === 'Active').length;
      const totalEmployees = organizationsResponse.items.reduce((sum, org) => sum + org.analytics.totalEmployees, 0);
      const totalRevenue = organizationsResponse.items.reduce((sum, org) => sum + org.analytics.totalRevenue, 0);
      const totalDepartments = organizationsResponse.items.reduce((sum, org) => sum + org.departments.length, 0);
      const averagePerformance = organizationsResponse.items.reduce((sum, org) => {
        const avgPerf = org.analytics.performance.reduce((s, p) => s + p.value, 0) / Math.max(org.analytics.performance.length, 1);
        return sum + avgPerf;
      }, 0) / Math.max(organizationsResponse.items.length, 1);
      const averageCompliance = organizationsResponse.items.reduce((sum, org) => sum + org.compliance.complianceScore, 0) / Math.max(organizationsResponse.items.length, 1);

      setStats({
        totalOrganizations,
        activeOrganizations,
        totalLocations: locationsResponse.length,
        totalDepartments,
        totalEmployees,
        totalRevenue,
        averagePerformance: Math.round(averagePerformance),
        complianceScore: Math.round(averageCompliance)
      });

    } catch (error) {
      console.error('Error loading organizations data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data based on search and filters
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = !searchQuery || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !organizationFilters.type || org.type.category === organizationFilters.type;
    const matchesStatus = !organizationFilters.status || org.status === organizationFilters.status;
    const matchesLocation = !organizationFilters.location || 
      org.locations.some(loc => 
        loc.address.city.toLowerCase().includes(organizationFilters.location.toLowerCase()) ||
        loc.address.state.toLowerCase().includes(organizationFilters.location.toLowerCase())
      );
    const matchesHasChildren = organizationFilters.hasChildren === undefined || 
      (organizationFilters.hasChildren ? org.hierarchy.children.length > 0 : org.hierarchy.children.length === 0);

    return matchesSearch && matchesType && matchesStatus && matchesLocation && matchesHasChildren;
  });

  const handleOrganizationAction = async (action: string, organization: Organization) => {
    switch (action) {
      case 'edit':
        setSelectedOrganization(organization);
        setShowFormModal(true);
        break;
      case 'duplicate':
        const duplicatedOrg = { ...organization, name: `${organization.name} (Copy)`, id: undefined };
        setSelectedOrganization(duplicatedOrg);
        setShowFormModal(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete the organization "${organization.name}"?`)) {
          try {
            await organizationsEnhancedApi.deleteOrganization(organization.id);
            await loadData();
          } catch (error) {
            console.error('Error deleting organization:', error);
          }
        }
        break;
      case 'view':
        setSelectedOrganization(organization);
        // Could open a detailed view modal
        break;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Hospital': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Clinic': return 'bg-green-100 text-green-800 border-green-200';
      case 'Department': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Unit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Branch': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Subsidiary': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading organizations management...</span>
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
            <Building className="w-8 h-8 text-blue-600 mr-3" />
            Organizations Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage organizational hierarchy, locations, and department assignments
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => organizationsEnhancedApi.exportOrganizations('xlsx')}
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
              setSelectedOrganization(null);
              setShowFormModal(true);
            }}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrganizations}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeOrganizations} active
                </p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalEmployees)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Across all organizations
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalLocations} locations
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averagePerformance}%</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-100 text-green-800">
                    {stats.complianceScore}% compliance
                  </Badge>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search organizations, codes, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={organizationFilters.type} 
                onValueChange={(value) => setOrganizationFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                  <SelectItem value="Branch">Branch</SelectItem>
                  <SelectItem value="Subsidiary">Subsidiary</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={organizationFilters.status} 
                onValueChange={(value) => setOrganizationFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location..."
                value={organizationFilters.location}
                onChange={(e) => setOrganizationFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organizations" className="flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="flex items-center">
            <TreePine className="w-4 h-4 mr-2" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <div className="grid gap-4">
            {filteredOrganizations.map((organization) => (
              <Card key={organization.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{organization.name}</h3>
                        <Badge className={getStatusBadgeColor(organization.status)}>
                          {organization.status}
                        </Badge>
                        <Badge className={getTypeBadgeColor(organization.type.category)}>
                          {organization.type.category}
                        </Badge>
                        <Badge variant="outline">
                          {organization.code}
                        </Badge>
                        {organization.hierarchy.level > 0 && (
                          <Badge variant="secondary">
                            Level {organization.hierarchy.level}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{organization.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-2" />
                          {formatNumber(organization.analytics.totalEmployees)} employees
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          {organization.locations.length} location(s)
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Building2 className="w-4 h-4 mr-2" />
                          {organization.departments.length} department(s)
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {formatCurrency(organization.analytics.totalRevenue)}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        {organization.email && (
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {organization.email}
                          </span>
                        )}
                        {organization.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {organization.phone}
                          </span>
                        )}
                        {organization.website && (
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {organization.website}
                          </span>
                        )}
                      </div>

                      {/* Performance Indicators */}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Performance:</span>
                          <Badge className={
                            organization.analytics.performance.reduce((sum, p) => sum + p.value, 0) / organization.analytics.performance.length > 80 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {Math.round(organization.analytics.performance.reduce((sum, p) => sum + p.value, 0) / Math.max(organization.analytics.performance.length, 1))}%
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Compliance:</span>
                          <Badge className={
                            organization.compliance.complianceScore > 85 
                              ? 'bg-green-100 text-green-800' 
                              : organization.compliance.complianceScore > 70 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {organization.compliance.complianceScore}%
                          </Badge>
                        </div>
                        {organization.compliance.accreditations.length > 0 && (
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {organization.compliance.accreditations.length} accreditation(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Actions
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOrganizationAction('view', organization)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOrganizationAction('edit', organization)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Organization
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOrganizationAction('duplicate', organization)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleOrganizationAction('delete', organization)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy">
          <OrganizationHierarchyTree 
            organizations={organizations}
            onOrganizationUpdate={loadData}
          />
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations">
          <LocationManagement 
            locations={locations}
            organizations={organizations}
            onLocationUpdate={loadData}
          />
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <DepartmentAssignments 
            organizations={organizations}
            onAssignmentUpdate={loadData}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {analytics && (
            <OrganizationAnalyticsDashboard 
              analytics={analytics}
              organizations={organizations}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Organization Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <EnhancedOrganizationFormModal
            organization={selectedOrganization}
            organizations={organizations}
            onSave={async (organizationData) => {
              try {
                if (selectedOrganization?.id) {
                  await organizationsEnhancedApi.updateOrganization(selectedOrganization.id, organizationData);
                } else {
                  await organizationsEnhancedApi.createOrganization(organizationData);
                }
                await loadData();
                setShowFormModal(false);
                setSelectedOrganization(null);
              } catch (error) {
                console.error('Error saving organization:', error);
              }
            }}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedOrganization(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedOrganizationsPage;