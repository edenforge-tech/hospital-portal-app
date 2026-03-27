'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  X, 
  Plus, 
  Key, 
  Users, 
  Settings, 
  TreePine,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Tag,
  FileText,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Role, 
  Permission, 
  PermissionTemplate, 
  PermissionCondition 
} from '@/lib/api/roles-permissions-enhanced.api';

interface EnhancedRoleFormModalProps {
  role: Role | null;
  permissions: Permission[];
  templates: PermissionTemplate[];
  onSave: (roleData: Partial<Role>) => void;
  onCancel: () => void;
}

export const EnhancedRoleFormModal: React.FC<EnhancedRoleFormModalProps> = ({
  role,
  permissions,
  templates,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    parentRoleId: '',
    permissions: [] as Permission[],
    metadata: {
      maxUsers: 0,
      expirationDate: '',
      requiresApproval: false,
      autoAssignmentRules: []
    },
    compliance: {
      regulatoryTags: [] as string[],
      auditRequired: false,
      complianceScore: 0
    }
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        category: role.category || '',
        parentRoleId: role.parentRoleId || '',
        permissions: role.permissions || [],
        metadata: {
          maxUsers: role.metadata?.maxUsers || 0,
          expirationDate: role.metadata?.expirationDate || '',
          requiresApproval: role.metadata?.requiresApproval || false,
          autoAssignmentRules: role.metadata?.autoAssignmentRules || []
        },
        compliance: {
          regulatoryTags: role.compliance?.regulatoryTags || [],
          auditRequired: role.compliance?.auditRequired || false,
          complianceScore: role.compliance?.complianceScore || 0
        }
      });
      
      const permIds = new Set(role.permissions?.map(p => p.id) || []);
      setSelectedPermissions(permIds);
    } else {
      // Reset form for new role
      setFormData({
        name: '',
        description: '',
        category: 'Administrative',
        parentRoleId: '',
        permissions: [],
        metadata: {
          maxUsers: 0,
          expirationDate: '',
          requiresApproval: false,
          autoAssignmentRules: []
        },
        compliance: {
          regulatoryTags: [],
          auditRequired: false,
          complianceScore: 0
        }
      });
      setSelectedPermissions(new Set());
    }
  }, [role]);

  const handleInputChange = (field: string, value: any, nestedField?: string) => {
    setFormData(prev => {
      if (nestedField) {
        return {
          ...prev,
          [field]: {
            ...prev[field as keyof typeof prev],
            [nestedField]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const templatePermIds = template.permissions.map(p => p.id);
      const newSelected = new Set([...selectedPermissions, ...templatePermIds]);
      setSelectedPermissions(newSelected);
      
      // Apply template compliance settings
      handleInputChange('compliance', {
        ...formData.compliance,
        regulatoryTags: [...formData.compliance.regulatoryTags, template.compliance.regulatoryFramework],
        auditRequired: true,
        complianceScore: Math.max(formData.compliance.complianceScore, 
          template.compliance.complianceLevel === 'High' ? 90 : 
          template.compliance.complianceLevel === 'Medium' ? 70 : 50)
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (selectedPermissions.size === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const selectedPerms = permissions.filter(p => selectedPermissions.has(p.id));
    
    const roleData: Partial<Role> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      parentRoleId: formData.parentRoleId || undefined,
      permissions: selectedPerms,
      metadata: formData.metadata,
      compliance: formData.compliance,
      isSystemRole: false,
      status: 'Active'
    };

    onSave(roleData);
  };

  // Filter permissions based on search
  const filteredPermissions = permissions.filter(permission =>
    !permissionSearch || 
    permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    permission.resource.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    permission.action.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const category = permission.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <p className="text-gray-600 mt-1">
            {role ? 'Modify role settings and permissions' : 'Define a new role with permissions and settings'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Enter role name"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clinical">Clinical</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                  placeholder="Describe this role's purpose and responsibilities"
                  rows={4}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 text-purple-600 mr-2" />
                  Permission Assignment
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {selectedPermissions.size} of {permissions.length} selected
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Application */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Quick Start with Templates</h4>
                    <p className="text-sm text-blue-700">Apply pre-configured permission sets</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
                      disabled={!selectedTemplate}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Permission Search */}
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search permissions..."
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                  />
                </div>

                {errors.permissions && (
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {errors.permissions}
                  </div>
                )}
              </div>

              {/* Permissions by Category */}
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        {category}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            categoryPermissions.forEach(perm => {
                              setSelectedPermissions(prev => new Set([...prev, perm.id]));
                            });
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            categoryPermissions.forEach(perm => {
                              setSelectedPermissions(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(perm.id);
                                return newSet;
                              });
                            });
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {categoryPermissions.map(permission => (
                        <div
                          key={permission.id}
                          className={`
                            flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
                            ${selectedPermissions.has(permission.id) 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50'}
                          `}
                          onClick={() => handlePermissionToggle(permission.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedPermissions.has(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                            <div>
                              <h5 className="font-medium text-sm">{permission.name}</h5>
                              <p className="text-xs text-gray-600">
                                {permission.resource} · {permission.action}
                              </p>
                              {permission.conditions && permission.conditions.length > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Has {permission.conditions.length} conditions
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={getRiskColor(permission.riskLevel)}>
                              {permission.riskLevel}
                            </Badge>
                            {permission.isSystemPermission && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                System
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="w-5 h-5 text-green-600 mr-2" />
                Role Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="parentRole">Parent Role</Label>
                <Select
                  value={formData.parentRoleId}
                  onValueChange={(value) => handleInputChange('parentRoleId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent (Root Level)</SelectItem>
                    {/* Add role options here */}
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  Parent role determines inheritance and hierarchy level
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Inheritance Rules</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inherit parent permissions</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow permission overrides</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Restrictive mode</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                Role Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.metadata.maxUsers}
                    onChange={(e) => handleInputChange('metadata', parseInt(e.target.value) || 0, 'maxUsers')}
                    placeholder="0 = unlimited"
                  />
                  <p className="text-sm text-gray-600">
                    0 means unlimited users can have this role
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.metadata.expirationDate}
                    onChange={(e) => handleInputChange('metadata', e.target.value, 'expirationDate')}
                  />
                  <p className="text-sm text-gray-600">
                    Optional expiration date for this role
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Approval</Label>
                    <p className="text-sm text-gray-600">
                      Role assignments must be approved by administrators
                    </p>
                  </div>
                  <Switch
                    checked={formData.metadata.requiresApproval}
                    onCheckedChange={(checked) => handleInputChange('metadata', checked, 'requiresApproval')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 text-purple-600 mr-2" />
                Compliance & Regulatory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Required</Label>
                    <p className="text-sm text-gray-600">
                      This role requires regular compliance audits
                    </p>
                  </div>
                  <Switch
                    checked={formData.compliance.auditRequired}
                    onCheckedChange={(checked) => handleInputChange('compliance', checked, 'auditRequired')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Regulatory Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {['HIPAA', 'SOX', 'GDPR', 'PCI-DSS'].map(tag => (
                    <Button
                      key={tag}
                      variant={formData.compliance.regulatoryTags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const tags = formData.compliance.regulatoryTags.includes(tag)
                          ? formData.compliance.regulatoryTags.filter(t => t !== tag)
                          : [...formData.compliance.regulatoryTags, tag];
                        handleInputChange('compliance', tags, 'regulatoryTags');
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Select applicable regulatory frameworks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceScore">Compliance Score</Label>
                <Input
                  id="complianceScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.compliance.complianceScore}
                  onChange={(e) => handleInputChange('compliance', parseInt(e.target.value) || 0, 'complianceScore')}
                />
                <p className="text-sm text-gray-600">
                  Estimated compliance score (0-100)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Role Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {formData.name || 'Not set'}</div>
                <div><strong>Category:</strong> {formData.category || 'Not set'}</div>
                <div><strong>Parent:</strong> {formData.parentRoleId || 'None'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Total:</strong> {selectedPermissions.size}</div>
                <div><strong>Templates Applied:</strong> {selectedTemplate ? '1' : '0'}</div>
                <div><strong>Requires Approval:</strong> {formData.metadata.requiresApproval ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Compliance</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Audit Required:</strong> {formData.compliance.auditRequired ? 'Yes' : 'No'}</div>
                <div><strong>Regulatory Tags:</strong> {formData.compliance.regulatoryTags.length}</div>
                <div><strong>Score:</strong> {formData.compliance.complianceScore}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRoleFormModal;