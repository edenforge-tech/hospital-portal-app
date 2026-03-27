'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Users, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Play,
  Pause,
  BarChart3,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Role, 
  Permission, 
  BulkRoleOperation, 
  BulkOperationResult,
  rolesPermissionsEnhancedApi 
} from '@/lib/api/roles-permissions-enhanced.api';

interface BulkRoleOperationsProps {
  roles: Role[];
  permissions: Permission[];
  onOperationComplete: () => void;
}

export const BulkRoleOperations: React.FC<BulkRoleOperationsProps> = ({
  roles,
  permissions,
  onOperationComplete
}) => {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [operationType, setOperationType] = useState<'assign' | 'revoke' | 'modify' | 'approve'>('assign');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<BulkOperationResult[]>([]);
  const [progress, setProgress] = useState(0);

  const handleRoleSelection = (roleId: string) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handlePermissionSelection = (permissionId: string) => {
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

  const executeBulkOperation = async () => {
    if (selectedRoles.size === 0 && selectedUsers.size === 0) {
      alert('Please select roles or users for the operation');
      return;
    }

    setIsExecuting(true);
    setProgress(0);

    try {
      const operation: BulkRoleOperation = {
        operationType,
        targets: {
          roleIds: Array.from(selectedRoles),
          userIds: Array.from(selectedUsers),
          permissionIds: Array.from(selectedPermissions)
        },
        changes: getOperationChanges(),
        validationRules: {
          requireApproval: operationType === 'assign' && selectedPermissions.size > 5,
          maxBatchSize: 50,
          allowRiskEscalation: false
        }
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const operationResults = await rolesPermissionsEnhancedApi.performBulkRoleOperation(operation);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(operationResults);
      
      setTimeout(() => {
        setIsExecuting(false);
        onOperationComplete();
      }, 1000);

    } catch (error) {
      console.error('Bulk operation failed:', error);
      setIsExecuting(false);
      alert('Bulk operation failed. Please try again.');
    }
  };

  const getOperationChanges = () => {
    switch (operationType) {
      case 'assign':
        return {
          action: 'add_permissions',
          permissions: Array.from(selectedPermissions)
        };
      case 'revoke':
        return {
          action: 'remove_permissions',
          permissions: Array.from(selectedPermissions)
        };
      case 'modify':
        return {
          action: 'update_roles',
          changes: { status: 'Active' } // Example change
        };
      default:
        return {};
    }
  };

  const validateOperation = async () => {
    if (selectedRoles.size === 0) {
      alert('Please select at least one role');
      return;
    }

    const operation: BulkRoleOperation = {
      operationType,
      targets: {
        roleIds: Array.from(selectedRoles),
        permissionIds: Array.from(selectedPermissions)
      },
      changes: getOperationChanges(),
      validationRules: {
        requireApproval: false,
        maxBatchSize: 50,
        allowRiskEscalation: false
      }
    };

    try {
      const validation = await rolesPermissionsEnhancedApi.validateBulkOperation(operation);
      
      const message = `
        Validation Results:
        - Valid: ${validation.isValid ? 'Yes' : 'No'}
        - Errors: ${validation.errors.length}
        - Warnings: ${validation.warnings.length}
        - Risk Level: ${validation.riskAssessment.riskLevel}
      `;
      
      alert(message);
    } catch (error) {
      console.error('Validation failed:', error);
      alert('Validation failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Skipped': return 'bg-yellow-100 text-yellow-800';
      case 'PendingApproval': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 text-orange-600 mr-2" />
          Bulk Role Operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assign" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assign" onClick={() => setOperationType('assign')}>
              Assign Permissions
            </TabsTrigger>
            <TabsTrigger value="revoke" onClick={() => setOperationType('revoke')}>
              Revoke Permissions
            </TabsTrigger>
            <TabsTrigger value="modify" onClick={() => setOperationType('modify')}>
              Modify Roles
            </TabsTrigger>
            <TabsTrigger value="results">
              Operation Results
            </TabsTrigger>
          </TabsList>

          {/* Assign Permissions Tab */}
          <TabsContent value="assign" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Select Roles ({selectedRoles.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedRoles.has(role.id)}
                            onCheckedChange={() => handleRoleSelection(role.id)}
                          />
                          <div>
                            <h4 className="font-medium text-sm">{role.name}</h4>
                            <p className="text-xs text-gray-600">{role.users.length} users</p>
                          </div>
                        </div>
                        <Badge variant="outline">{role.category}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRoles(new Set(roles.map(r => r.id)))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRoles(new Set())}
                    >
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Permission Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Select Permissions ({selectedPermissions.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {permissions.slice(0, 20).map(permission => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={() => handlePermissionSelection(permission.id)}
                          />
                          <div>
                            <h4 className="font-medium text-sm">{permission.name}</h4>
                            <p className="text-xs text-gray-600">
                              {permission.resource} · {permission.action}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          permission.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                          permission.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                          permission.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {permission.riskLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPermissions(new Set(permissions.slice(0, 20).map(p => p.id)))}
                    >
                      Select Visible
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPermissions(new Set())}
                    >
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Operation Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Bulk Permission Assignment</h4>
                    <p className="text-sm text-gray-600">
                      Add selected permissions to {selectedRoles.size} role(s)
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={validateOperation}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validate
                    </Button>
                    <Button 
                      onClick={executeBulkOperation}
                      disabled={isExecuting || selectedRoles.size === 0}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Operation
                    </Button>
                  </div>
                </div>
                
                {isExecuting && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing operation...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similar tabs for revoke and modify would go here */}
          <TabsContent value="revoke" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Permission Revocation</p>
                <p className="text-sm">Remove permissions from selected roles</p>
                <p className="text-xs mt-2">(Implementation similar to assign tab)</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modify" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Role Modification</p>
                <p className="text-sm">Bulk update role properties and settings</p>
                <p className="text-xs mt-2">(Implementation for bulk role updates)</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operation Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {results.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Operation Results
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {results.filter(r => r.status === 'Success').length}
                      </div>
                      <div className="text-sm text-green-700">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {results.filter(r => r.status === 'Failed').length}
                      </div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.filter(r => r.status === 'Skipped').length}
                      </div>
                      <div className="text-sm text-yellow-700">Skipped</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.filter(r => r.status === 'PendingApproval').length}
                      </div>
                      <div className="text-sm text-blue-700">Pending</div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{result.targetName}</h4>
                          <p className="text-xs text-gray-600">{result.message}</p>
                          {result.riskAssessment && (
                            <div className="flex items-center mt-1">
                              <AlertTriangle className="w-3 h-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-yellow-600">
                                {result.riskAssessment.riskLevel} Risk
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Operations Executed</p>
                  <p className="text-sm">Results will appear here after running bulk operations</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BulkRoleOperations;