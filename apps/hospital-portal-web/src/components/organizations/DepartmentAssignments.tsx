'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Settings,
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Download,
  Upload,
  Move,
  Copy,
  ChevronDown,
  Filter
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
  Organization,
  DepartmentAssignment,
  organizationsEnhancedApi 
} from '@/lib/api/organizations-enhanced.api';
import { DepartmentAssignmentFormModal } from './DepartmentAssignmentFormModal';
import { useDeleteConfirmation } from '@/components/common/ConfirmationDialog';

interface DepartmentAssignmentsProps {
  organizations: Organization[];
  onAssignmentUpdate: () => Promise<void>;
}

export const DepartmentAssignments: React.FC<DepartmentAssignmentsProps> = ({
  organizations,
  onAssignmentUpdate
}) => {
  const { confirmDelete, ConfirmationComponent } = useDeleteConfirmation();
  // State Management
  const [assignments, setAssignments] = useState<DepartmentAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<DepartmentAssignment | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('assignments');

  // Filters
  const [filters, setFilters] = useState({
    organization: '',
    department: '',
    status: '',
    performanceRange: '',
    budgetRange: ''
  });

  // Load department assignments
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API endpoint
      const allAssignments: DepartmentAssignment[] = [];
      
      organizations.forEach(org => {
        org.departments.forEach(dept => {
          allAssignments.push({
            id: `${org.id}-${dept.id}`,
            organizationId: org.id,
            organizationName: org.name,
            departmentId: dept.id,
            departmentName: dept.name,
            departmentCode: dept.code,
            assignment: {
              role: dept.type || 'Department',
              responsibilities: dept.description ? [dept.description] : [],
              reportingStructure: {
                reportsTo: org.hierarchy.parentId || null,
                directReports: [],
                dotLineReports: []
              },
              effectiveDate: new Date().toISOString().split('T')[0],
              endDate: null,
              status: dept.status || 'Active'
            },
            performance: {
              metrics: [
                {
                  name: 'Patient Satisfaction',
                  value: 85 + Math.random() * 15,
                  target: 90,
                  trend: Math.random() > 0.5 ? 'up' : 'down'
                },
                {
                  name: 'Efficiency Score',
                  value: 75 + Math.random() * 20,
                  target: 85,
                  trend: Math.random() > 0.5 ? 'up' : 'down'
                },
                {
                  name: 'Quality Score',
                  value: 80 + Math.random() * 15,
                  target: 95,
                  trend: Math.random() > 0.5 ? 'up' : 'down'
                }
              ],
              overallScore: 80 + Math.random() * 15,
              lastUpdated: new Date().toISOString()
            },
            budget: {
              allocated: 500000 + Math.random() * 2000000,
              spent: 300000 + Math.random() * 1500000,
              remaining: 200000 + Math.random() * 500000,
              utilizationRate: 60 + Math.random() * 30,
              forecastAccuracy: 85 + Math.random() * 10
            },
            staffing: {
              totalPositions: Math.floor(10 + Math.random() * 50),
              filledPositions: Math.floor(8 + Math.random() * 45),
              vacantPositions: Math.floor(2 + Math.random() * 10),
              turnoverRate: Math.random() * 20,
              avgTenure: 2 + Math.random() * 8
            },
            compliance: {
              score: 85 + Math.random() * 15,
              lastAudit: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              issues: Math.floor(Math.random() * 5),
              certifications: ['HIPAA', 'Joint Commission'].slice(0, Math.floor(1 + Math.random() * 2))
            },
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      });

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading department assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchQuery || 
      assignment.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.departmentCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrganization = !filters.organization || 
      assignment.organizationId === filters.organization;
    const matchesDepartment = !filters.department ||
      assignment.departmentName.toLowerCase().includes(filters.department.toLowerCase());
    const matchesStatus = !filters.status || 
      assignment.assignment.status === filters.status;
    const matchesPerformance = !filters.performanceRange ||
      (filters.performanceRange === 'high' && assignment.performance.overallScore >= 90) ||
      (filters.performanceRange === 'medium' && assignment.performance.overallScore >= 70 && assignment.performance.overallScore < 90) ||
      (filters.performanceRange === 'low' && assignment.performance.overallScore < 70);
    const matchesBudget = !filters.budgetRange ||
      (filters.budgetRange === 'high' && assignment.budget.utilizationRate >= 80) ||
      (filters.budgetRange === 'medium' && assignment.budget.utilizationRate >= 60 && assignment.budget.utilizationRate < 80) ||
      (filters.budgetRange === 'low' && assignment.budget.utilizationRate < 60);

    return matchesSearch && matchesOrganization && matchesDepartment && 
           matchesStatus && matchesPerformance && matchesBudget;
  });

  const handleAssignmentAction = async (action: string, assignment: DepartmentAssignment) => {
    switch (action) {
      case 'edit':
        setSelectedAssignment(assignment);
        setShowFormModal(true);
        break;
      case 'duplicate':
        const duplicatedAssignment = { 
          ...assignment, 
          departmentName: `${assignment.departmentName} (Copy)`, 
          id: undefined 
        };
        setSelectedAssignment(duplicatedAssignment);
        setShowFormModal(true);
        break;
      case 'delete':
        confirmDelete(assignment.departmentName, async () => {
          try {
            // In a real implementation, call API to delete assignment
            await onAssignmentUpdate();
          } catch (error) {
            console.error('Error deleting assignment:', error);
          }
        });
        break;
      case 'view':
        setSelectedAssignment(assignment);
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

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 80) return 'text-orange-600';
    if (rate >= 70) return 'text-yellow-600';
    if (rate >= 60) return 'text-blue-600';
    return 'text-green-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-3 h-3 text-green-500" /> :
      <TrendingUp className="w-3 h-3 text-red-500 transform rotate-180" />;
  };

  // Statistics
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.assignment.status === 'Active').length,
    avgPerformance: Math.round(
      assignments.reduce((sum, a) => sum + a.performance.overallScore, 0) / Math.max(assignments.length, 1)
    ),
    avgUtilization: Math.round(
      assignments.reduce((sum, a) => sum + a.budget.utilizationRate, 0) / Math.max(assignments.length, 1)
    ),
    totalBudget: assignments.reduce((sum, a) => sum + a.budget.allocated, 0),
    totalStaff: assignments.reduce((sum, a) => sum + a.staffing.totalPositions, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading department assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmationComponent />
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-7 h-7 text-purple-600 mr-3" />
            Department Assignments
          </h2>
          <p className="text-gray-600 mt-1">
            Manage department assignments, performance, and resource allocation
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => organizationsEnhancedApi.exportDepartmentAssignments('xlsx')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={() => {
              setSelectedAssignment(null);
              setShowFormModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.avgPerformance)}`}>
              {stats.avgPerformance}%
            </div>
            <div className="text-sm text-gray-600">Avg Performance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getUtilizationColor(stats.avgUtilization)}`}>
              {stats.avgUtilization}%
            </div>
            <div className="text-sm text-gray-600">Avg Utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalBudget)}</div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalStaff}</div>
            <div className="text-sm text-gray-600">Total Staff</div>
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
                placeholder="Search departments, organizations, or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.organization} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, organization: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
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

              <Select 
                value={filters.performanceRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, performanceRange: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Performance</SelectItem>
                  <SelectItem value="high">High (90%+)</SelectItem>
                  <SelectItem value="medium">Medium (70-89%)</SelectItem>
                  <SelectItem value="low">Low ({'<'}70%)</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.budgetRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, budgetRange: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Budget</SelectItem>
                  <SelectItem value="high">High Util (80%+)</SelectItem>
                  <SelectItem value="medium">Medium Util (60-79%)</SelectItem>
                  <SelectItem value="low">Low Util ({'<'}60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="mt-6">
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.departmentName}
                        </h3>
                        <Badge className={getStatusBadgeColor(assignment.assignment.status)}>
                          {assignment.assignment.status}
                        </Badge>
                        <Badge variant="outline">
                          {assignment.departmentCode}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          @ {assignment.organizationName}
                        </span>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getPerformanceColor(assignment.performance.overallScore)}`}>
                            {Math.round(assignment.performance.overallScore)}%
                          </div>
                          <div className="text-xs text-gray-600">Performance</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getUtilizationColor(assignment.budget.utilizationRate)}`}>
                            {Math.round(assignment.budget.utilizationRate)}%
                          </div>
                          <div className="text-xs text-gray-600">Budget Util.</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {assignment.staffing.filledPositions}/{assignment.staffing.totalPositions}
                          </div>
                          <div className="text-xs text-gray-600">Staffing</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {Math.round(assignment.compliance.score)}%
                          </div>
                          <div className="text-xs text-gray-600">Compliance</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(assignment.budget.allocated)}
                          </div>
                          <div className="text-xs text-gray-600">Budget</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {Math.round(assignment.staffing.turnoverRate)}%
                          </div>
                          <div className="text-xs text-gray-600">Turnover</div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">Key Performance Indicators</div>
                        {assignment.performance.metrics.slice(0, 3).map((metric, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <span className="text-sm text-gray-600 min-w-0 flex-1">
                                {metric.name}
                              </span>
                              {getTrendIcon(metric.trend)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(metric.value / metric.target) * 100} 
                                className="w-20 h-2"
                              />
                              <span className="text-sm font-medium text-gray-900 min-w-[50px] text-right">
                                {Math.round(metric.value)}%
                              </span>
                              <span className="text-xs text-gray-500 min-w-[45px] text-right">
                                / {metric.target}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Assignment Details */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Role:</span>
                          <span className="ml-2 text-gray-600">{assignment.assignment.role}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Effective Date:</span>
                          <span className="ml-2 text-gray-600">{assignment.assignment.effectiveDate}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(assignment.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Actions
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAssignmentAction('view', assignment)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignmentAction('edit', assignment)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignmentAction('duplicate', assignment)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleAssignmentAction('delete', assignment)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Assignment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid gap-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    High Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredAssignments
                      .filter(a => a.performance.overallScore >= 90)
                      .slice(0, 5)
                      .map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{assignment.departmentName}</div>
                            <div className="text-xs text-gray-600">{assignment.organizationName}</div>
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {Math.round(assignment.performance.overallScore)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Needs Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredAssignments
                      .filter(a => a.performance.overallScore < 70)
                      .slice(0, 5)
                      .map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{assignment.departmentName}</div>
                            <div className="text-xs text-gray-600">{assignment.organizationName}</div>
                          </div>
                          <div className="text-sm font-bold text-red-600">
                            {Math.round(assignment.performance.overallScore)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Department</th>
                        <th className="text-left py-2 px-4">Organization</th>
                        <th className="text-center py-2 px-4">Overall Score</th>
                        <th className="text-center py-2 px-4">Patient Satisfaction</th>
                        <th className="text-center py-2 px-4">Efficiency</th>
                        <th className="text-center py-2 px-4">Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{assignment.departmentName}</td>
                          <td className="py-2 px-4 text-gray-600">{assignment.organizationName}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`font-bold ${getPerformanceColor(assignment.performance.overallScore)}`}>
                              {Math.round(assignment.performance.overallScore)}%
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="font-medium">
                              {Math.round(assignment.performance.metrics[0]?.value || 0)}%
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="font-medium">
                              {Math.round(assignment.performance.metrics[1]?.value || 0)}%
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="font-medium">
                              {Math.round(assignment.performance.metrics[2]?.value || 0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-6">
          <div className="grid gap-6">
            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Allocated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(filteredAssignments.reduce((sum, a) => sum + a.budget.allocated, 0))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(filteredAssignments.reduce((sum, a) => sum + a.budget.spent, 0))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(filteredAssignments.reduce((sum, a) => sum + a.budget.remaining, 0))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getUtilizationColor(stats.avgUtilization)}`}>
                    {stats.avgUtilization}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Budget Table */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Department</th>
                        <th className="text-left py-2 px-4">Organization</th>
                        <th className="text-right py-2 px-4">Allocated</th>
                        <th className="text-right py-2 px-4">Spent</th>
                        <th className="text-right py-2 px-4">Remaining</th>
                        <th className="text-center py-2 px-4">Utilization</th>
                        <th className="text-center py-2 px-4">Forecast Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{assignment.departmentName}</td>
                          <td className="py-2 px-4 text-gray-600">{assignment.organizationName}</td>
                          <td className="py-2 px-4 text-right font-medium">
                            {formatCurrency(assignment.budget.allocated)}
                          </td>
                          <td className="py-2 px-4 text-right">
                            {formatCurrency(assignment.budget.spent)}
                          </td>
                          <td className="py-2 px-4 text-right">
                            {formatCurrency(assignment.budget.remaining)}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className={`font-bold ${getUtilizationColor(assignment.budget.utilizationRate)}`}>
                              {Math.round(assignment.budget.utilizationRate)}%
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="font-medium">
                              {Math.round(assignment.budget.forecastAccuracy)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Performance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                    <PieChart className="w-12 h-12 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Budget Utilization Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Staffing Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Positions</span>
                      <span className="font-bold">{stats.totalStaff}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Filled Positions</span>
                      <span className="font-bold text-green-600">
                        {filteredAssignments.reduce((sum, a) => sum + a.staffing.filledPositions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vacant Positions</span>
                      <span className="font-bold text-red-600">
                        {filteredAssignments.reduce((sum, a) => sum + a.staffing.vacantPositions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Turnover Rate</span>
                      <span className="font-bold text-orange-600">
                        {Math.round(filteredAssignments.reduce((sum, a) => sum + a.staffing.turnoverRate, 0) / Math.max(filteredAssignments.length, 1))}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Compliance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Compliance Score</span>
                      <span className="font-bold text-green-600">
                        {Math.round(filteredAssignments.reduce((sum, a) => sum + a.compliance.score, 0) / Math.max(filteredAssignments.length, 1))}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Issues</span>
                      <span className="font-bold text-red-600">
                        {filteredAssignments.reduce((sum, a) => sum + a.compliance.issues, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Certified Departments</span>
                      <span className="font-bold text-blue-600">
                        {filteredAssignments.filter(a => a.compliance.certifications.length > 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* No Results */}
      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No department assignments found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f)
                ? 'No assignments match your current filters.'
                : 'No department assignments have been created yet.'}
            </p>
            <Button onClick={() => {
              setSelectedAssignment(null);
              setShowFormModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Assignment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Assignment Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DepartmentAssignmentFormModal
            assignment={selectedAssignment}
            organizations={organizations}
            onSave={async (assignmentData) => {
              try {
                // In a real implementation, this would call the API
                await onAssignmentUpdate();
                setShowFormModal(false);
                setSelectedAssignment(null);
              } catch (error) {
                console.error('Error saving assignment:', error);
              }
            }}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedAssignment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentAssignments;