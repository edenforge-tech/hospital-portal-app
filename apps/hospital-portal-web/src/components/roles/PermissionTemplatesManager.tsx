'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Filter,
  Copy,
  Edit,
  Trash2,
  Play,
  Users,
  Key,
  Tag,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  BarChart3
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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  PermissionTemplate, 
  Permission, 
  Role, 
  rolesPermissionsEnhancedApi 
} from '@/lib/api/roles-permissions-enhanced.api';
import { useDeleteConfirmation } from '@/components/common/ConfirmationDialog';

interface PermissionTemplatesManagerProps {
  templates: PermissionTemplate[];
  permissions: Permission[];
  roles: Role[];
  onTemplateUpdate: () => void;
}

export const PermissionTemplatesManager: React.FC<PermissionTemplatesManagerProps> = ({
  templates,
  permissions,
  roles,
  onTemplateUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  const { confirmDelete, ConfirmationComponent } = useDeleteConfirmation();

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category)));

  // Template statistics
  const templateStats = {
    total: templates.length,
    systemTemplates: templates.filter(t => t.isSystemTemplate).length,
    customTemplates: templates.filter(t => !t.isSystemTemplate).length,
    mostUsed: templates.reduce((max, t) => t.usage.usedCount > max.usage.usedCount ? t : max, templates[0] || { usage: { usedCount: 0 } }),
    totalUsage: templates.reduce((sum, t) => sum + t.usage.usedCount, 0)
  };

  const handleApplyTemplate = async (template: PermissionTemplate, roleIds: string[]) => {
    try {
      const results = await rolesPermissionsEnhancedApi.applyPermissionTemplate(template.id, roleIds);
      console.log('Template applied:', results);
      onTemplateUpdate();
      
      // Show results summary
      const successful = results.filter(r => r.status === 'Success').length;
      const failed = results.filter(r => r.status === 'Failed').length;
      const pending = results.filter(r => r.status === 'PendingApproval').length;
      
      alert(`Template applied: ${successful} successful, ${failed} failed, ${pending} pending approval`);
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Error applying template');
    }
  };

  const handleDeleteTemplate = async (template: PermissionTemplate) => {
    if (template.isSystemTemplate) {
      alert('Cannot delete system templates');
      return;
    }

    confirmDelete(template.name, async () => {
      try {
        // Note: Delete endpoint would need to be implemented
        alert('Delete functionality would be implemented here');
        onTemplateUpdate();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    });
  };

  const getComplianceBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permission Templates</h2>
          <p className="text-gray-600">
            Pre-defined permission sets for quick role setup and standardization
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templateStats.total}</p>
              </div>
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templateStats.systemTemplates}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templateStats.customTemplates}</p>
              </div>
              <Edit className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">{templateStats.totalUsage}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <Layers className="w-5 h-5 text-blue-600 mr-2" />
                    {template.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.isSystemTemplate && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        System
                      </Badge>
                    )}
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge className={getComplianceBadgeColor(template.compliance.complianceLevel)}>
                      {template.compliance.complianceLevel} Compliance
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template)}
                    disabled={template.isSystemTemplate}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {template.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="font-medium">{template.permissions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage Count:</span>
                  <span className="font-medium">{template.usage.usedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Applicable Roles:</span>
                  <span className="font-medium">{template.applicableRoles.length}</span>
                </div>
                {template.usage.lastUsed && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Used:</span>
                    <span className="font-medium text-xs">
                      {new Date(template.usage.lastUsed).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {template.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Tag className="w-3 h-3 mr-1" />
                    Tags:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm text-gray-600">Compliance Framework:</div>
                <div className="text-sm font-medium">{template.compliance.regulatoryFramework}</div>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    // Open role selection dialog
                    const roleIds = prompt('Enter role IDs (comma-separated):');
                    if (roleIds) {
                      const ids = roleIds.split(',').map(id => id.trim());
                      handleApplyTemplate(template, ids);
                    }
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Apply to Roles
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Layers className="w-6 h-6 text-blue-600 mr-3" />
                  {selectedTemplate.name}
                </h2>
                <p className="text-gray-600 mt-2">{selectedTemplate.description}</p>
              </div>

              {/* Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Template Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline">{selectedTemplate.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge className={selectedTemplate.isSystemTemplate ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {selectedTemplate.isSystemTemplate ? 'System' : 'Custom'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage Count:</span>
                      <span>{selectedTemplate.usage.usedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-sm">{new Date(selectedTemplate.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="text-sm">{selectedTemplate.createdBy}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Framework:</span>
                      <span className="text-sm">{selectedTemplate.compliance.regulatoryFramework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <Badge className={getComplianceBadgeColor(selectedTemplate.compliance.complianceLevel)}>
                        {selectedTemplate.compliance.complianceLevel}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Requirements:</span>
                      <ul className="mt-2 space-y-1">
                        {selectedTemplate.compliance.requirements.map((req, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Permissions List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Permissions ({selectedTemplate.permissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {selectedTemplate.permissions.map((permission) => (
                      <div 
                        key={permission.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h4 className="font-medium text-sm">{permission.name}</h4>
                          <p className="text-xs text-gray-600">
                            {permission.resource} · {permission.action}
                          </p>
                        </div>
                        <Badge 
                          className={
                            permission.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                            permission.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                            permission.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {permission.riskLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Applicable Roles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Applicable Roles ({selectedTemplate.applicableRoles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.applicableRoles.map((roleId) => {
                      const role = roles.find(r => r.id === roleId);
                      return role ? (
                        <Badge key={roleId} variant="outline">
                          {role.name}
                        </Badge>
                      ) : (
                        <Badge key={roleId} variant="secondary">
                          Unknown Role
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Template
                </Button>
                <Button variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Apply to Roles
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Template Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Create Permission Template</h2>
            <p className="text-gray-600">Template creation form would be implemented here</p>
            {/* Template creation form would go here */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionTemplatesManager;