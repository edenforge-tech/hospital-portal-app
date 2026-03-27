'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Key, 
  TreePine, 
  BarChart3, 
  Settings, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  UserCheck,
  FileText,
  Eye,
  Edit,
  Trash2,
  Copy,
  Layers,
  ChevronDown,
  Zap
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
import { rolesPermissionsEnhancedApi, Role, Permission, RoleAnalytics, PermissionTemplate } from '@/lib/api/roles-permissions-enhanced.api';
import { RoleHierarchyTree } from './RoleHierarchyTree';
import { PermissionTemplatesManager } from './PermissionTemplatesManager';
import { RoleAnalyticsDashboard } from './RoleAnalyticsDashboard';
import { BulkRoleOperations } from './BulkRoleOperations';
import { EnhancedRoleFormModal } from './EnhancedRoleFormModal';
import { PermissionComplianceView } from './PermissionComplianceView';

interface EnhancedRolesPageProps {}

export const EnhancedRolesPage: React.FC<EnhancedRolesPageProps> = () => {
  // State Management
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [analytics, setAnalytics] = useState<RoleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roles');
  const [showFormModal, setShowFormModal] = useState(false);

  // Filters
  const [roleFilters, setRoleFilters] = useState({
    category: '',
    status: '',
    riskLevel: '',
    hasUsers: undefined as boolean | undefined
  });

  const [permissionFilters, setPermissionFilters] = useState({
    category: '',
    resource: '',
    riskLevel: '',
    hasConditions: undefined as boolean | undefined
  });

  // Real-time Statistics
  const [stats, setStats] = useState({
    totalRoles: 0,
    activeRoles: 0,
    totalPermissions: 0,
    systemRoles: 0,
    customRoles: 0,
    usersWithRoles: 0,
    pendingApprovals: 0,
    complianceScore: 0,
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 }
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse, templatesResponse, analyticsData] = await Promise.all([
        rolesPermissionsEnhancedApi.getRoles({ includeInherited: true }, 1, 100),
        rolesPermissionsEnhancedApi.getPermissions({}, 1, 200),
        rolesPermissionsEnhancedApi.getPermissionTemplates(),
        rolesPermissionsEnhancedApi.getRoleAnalytics('30d')
      ]);

      setRoles(rolesResponse.items);
      setPermissions(permissionsResponse.items);
      setTemplates(templatesResponse);
      setAnalytics(analyticsData);

      // Calculate statistics
      const totalRoles = rolesResponse.items.length;
      const activeRoles = rolesResponse.items.filter(r => r.status === 'Active').length;
      const systemRoles = rolesResponse.items.filter(r => r.isSystemRole).length;
      const usersWithRoles = rolesResponse.items.reduce((sum, role) => sum + role.users.length, 0);
      
      const riskDistribution = rolesResponse.items.reduce(
        (acc, role) => {
          const riskLevel = role.analytics.riskScore > 80 ? 'critical' : 
                           role.analytics.riskScore > 60 ? 'high' : 
                           role.analytics.riskScore > 30 ? 'medium' : 'low';
          acc[riskLevel]++;
          return acc;
        },
        { low: 0, medium: 0, high: 0, critical: 0 }
      );

      setStats({
        totalRoles,
        activeRoles,
        totalPermissions: permissionsResponse.items.length,
        systemRoles,
        customRoles: totalRoles - systemRoles,
        usersWithRoles,
        pendingApprovals: analyticsData.complianceMetrics.violationCount, // Placeholder
        complianceScore: analyticsData.complianceMetrics.overallScore,
        riskDistribution
      });

    } catch (error) {
      console.error('Error loading roles data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data based on search and filters
  const filteredRoles = roles.filter(role => {
    const matchesSearch = !searchQuery || 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !roleFilters.category || role.category === roleFilters.category;
    const matchesStatus = !roleFilters.status || role.status === roleFilters.status;
    const matchesRiskLevel = !roleFilters.riskLevel || 
      (roleFilters.riskLevel === 'Low' && role.analytics.riskScore <= 30) ||
      (roleFilters.riskLevel === 'Medium' && role.analytics.riskScore > 30 && role.analytics.riskScore <= 60) ||
      (roleFilters.riskLevel === 'High' && role.analytics.riskScore > 60 && role.analytics.riskScore <= 80) ||
      (roleFilters.riskLevel === 'Critical' && role.analytics.riskScore > 80);
    const matchesHasUsers = roleFilters.hasUsers === undefined || 
      (roleFilters.hasUsers ? role.users.length > 0 : role.users.length === 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesRiskLevel && matchesHasUsers;
  });

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !searchQuery || 
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !permissionFilters.category || permission.category === permissionFilters.category;
    const matchesResource = !permissionFilters.resource || permission.resource === permissionFilters.resource;
    const matchesRiskLevel = !permissionFilters.riskLevel || permission.riskLevel === permissionFilters.riskLevel;
    const matchesHasConditions = permissionFilters.hasConditions === undefined || 
      (permissionFilters.hasConditions ? permission.conditions && permission.conditions.length > 0 : !permission.conditions || permission.conditions.length === 0);

    return matchesSearch && matchesCategory && matchesResource && matchesRiskLevel && matchesHasConditions;
  });

  const handleRoleAction = async (action: string, role: Role) => {
    switch (action) {
      case 'edit':
        setSelectedRole(role);
        setShowFormModal(true);
        break;
      case 'duplicate':
        const duplicatedRole = { ...role, name: `${role.name} (Copy)`, id: undefined };
        setSelectedRole(duplicatedRole);
        setShowFormModal(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
          try {
            await rolesPermissionsEnhancedApi.deleteRole(role.id);
            await loadData();
          } catch (error) {
            console.error('Error deleting role:', error);
          }
        }
        break;
      case 'view':
        setSelectedRole(role);
        // Could open a detailed view modal
        break;
    }
  };

  const getRiskBadgeColor = (riskScore: number) => {
    if (riskScore > 80) return 'bg-red-100 text-red-800 border-red-200';
    if (riskScore > 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (riskScore > 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore > 80) return 'Critical';
    if (riskScore > 60) return 'High';
    if (riskScore > 30) return 'Medium';
    return 'Low';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PendingApproval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Deprecated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading advanced roles & permissions...</span>
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
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            Advanced Roles & Permissions
          </h1>
          <p className="text-gray-600 mt-1">
            Enterprise-grade RBAC with hierarchy, templates, and compliance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => rolesPermissionsEnhancedApi.exportRoles('xlsx')}
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
              setSelectedRole(null);
              setShowFormModal(true);
            }}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRoles}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.systemRoles} system, {stats.customRoles} custom
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.usersWithRoles}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeRoles} active roles
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPermissions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Across all roles
                </p>
              </div>
              <Key className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.complianceScore}%</p>
                <div className="flex items-center mt-1">
                  {stats.pendingApprovals > 0 ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {stats.pendingApprovals} pending
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      All clear
                    </Badge>
                  )}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
            Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Low Risk: {stats.riskDistribution.low}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm">Medium Risk: {stats.riskDistribution.medium}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span className="text-sm">High Risk: {stats.riskDistribution.high}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Critical Risk: {stats.riskDistribution.critical}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles, permissions, or templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {activeTab === 'roles' && (
              <div className="flex gap-2">
                <Select value={roleFilters.category} onValueChange={(value) => 
                  setRoleFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Clinical">Clinical</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilters.status} onValueChange={(value) => 
                  setRoleFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="PendingApproval">Pending</SelectItem>
                    <SelectItem value="Deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilters.riskLevel} onValueChange={(value) => 
                  setRoleFilters(prev => ({ ...prev, riskLevel: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Risk</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="flex gap-2">
                <Select value={permissionFilters.category} onValueChange={(value) => 
                  setPermissionFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={permissionFilters.riskLevel} onValueChange={(value) => 
                  setPermissionFilters(prev => ({ ...prev, riskLevel: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Risk</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="roles" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center">
            <Key className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="flex items-center">
            <TreePine className="w-4 h-4 mr-2" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-4">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        <Badge className={getStatusBadgeColor(role.status)}>
                          {role.status}
                        </Badge>
                        <Badge className={getRiskBadgeColor(role.analytics.riskScore)}>
                          {getRiskLevel(role.analytics.riskScore)} Risk
                        </Badge>
                        {role.isSystemRole && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            System
                          </Badge>
                        )}
                        {role.hierarchy.level > 0 && (
                          <Badge variant="outline">
                            L{role.hierarchy.level}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{role.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {role.users.length} users
                        </span>
                        <span className="flex items-center">
                          <Key className="w-4 h-4 mr-1" />
                          {role.permissions.length} permissions
                        </span>
                        {role.inheritedPermissions && role.inheritedPermissions.length > 0 && (
                          <span className="flex items-center">
                            <TreePine className="w-4 h-4 mr-1" />
                            +{role.inheritedPermissions.length} inherited
                          </span>
                        )}
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {role.analytics.usageCount} uses
                        </span>
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
                          <DropdownMenuItem onClick={() => handleRoleAction('view', role)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleAction('edit', role)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleAction('duplicate', role)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRoleAction('delete', role)}
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

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="grid gap-4">
            {filteredPermissions.map((permission) => (
              <Card key={permission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{permission.name}</h3>
                        <Badge className={getRiskBadgeColor(
                          permission.riskLevel === 'Critical' ? 90 :
                          permission.riskLevel === 'High' ? 70 :
                          permission.riskLevel === 'Medium' ? 40 : 20
                        )}>
                          {permission.riskLevel} Risk
                        </Badge>
                        {permission.isSystemPermission && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            System
                          </Badge>
                        )}
                        {permission.conditions && permission.conditions.length > 0 && (
                          <Badge variant="outline">
                            {permission.conditions.length} conditions
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{permission.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Resource: <strong>{permission.resource}</strong></span>
                        <span>Action: <strong>{permission.action}</strong></span>
                        <span>Category: <strong>{permission.category}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy">
          <RoleHierarchyTree 
            roles={roles}
            onRoleUpdate={loadData}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <PermissionTemplatesManager 
            templates={templates}
            permissions={permissions}
            roles={roles}
            onTemplateUpdate={loadData}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {analytics && (
            <RoleAnalyticsDashboard 
              analytics={analytics}
              roles={roles}
            />
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <PermissionComplianceView 
            roles={roles}
            permissions={permissions}
            analytics={analytics}
          />
        </TabsContent>
      </Tabs>

      {/* Bulk Operations */}
      <BulkRoleOperations
        roles={roles}
        permissions={permissions}
        onOperationComplete={loadData}
      />

      {/* Role Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <EnhancedRoleFormModal
            role={selectedRole}
            permissions={permissions}
            templates={templates}
            onSave={async (roleData) => {
              try {
                if (selectedRole?.id) {
                  await rolesPermissionsEnhancedApi.updateRole(selectedRole.id, roleData);
                } else {
                  await rolesPermissionsEnhancedApi.createRole(roleData);
                }
                await loadData();
                setShowFormModal(false);
                setSelectedRole(null);
              } catch (error) {
                console.error('Error saving role:', error);
              }
            }}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedRole(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedRolesPage;