'use client';

import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  ChevronDown, 
  ChevronRight,
  Users,
  Key,
  Shield,
  Plus,
  Edit,
  Trash2,
  Move,
  Copy,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Role, RoleHierarchy, rolesPermissionsEnhancedApi } from '@/lib/api/roles-permissions-enhanced.api';

interface RoleHierarchyTreeProps {
  roles: Role[];
  onRoleUpdate: () => void;
}

interface TreeNode extends Role {
  children: TreeNode[];
  isExpanded: boolean;
  isSelected: boolean;
}

export const RoleHierarchyTree: React.FC<RoleHierarchyTreeProps> = ({ roles, onRoleUpdate }) => {
  const [hierarchy, setHierarchy] = useState<RoleHierarchy[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);
  const [dropTarget, setDropTarget] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHierarchy();
  }, [roles]);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const hierarchyData = await rolesPermissionsEnhancedApi.getRoleHierarchy();
      setHierarchy(hierarchyData);
      buildTreeData(hierarchyData);
    } catch (error) {
      console.error('Error loading role hierarchy:', error);
      // Fallback: build hierarchy from roles data
      buildTreeFromRoles();
    } finally {
      setLoading(false);
    }
  };

  const buildTreeFromRoles = () => {
    const nodeMap = new Map<string, TreeNode>();
    
    // Create tree nodes
    roles.forEach(role => {
      nodeMap.set(role.id, {
        ...role,
        children: [],
        isExpanded: expandedNodes.has(role.id),
        isSelected: false
      });
    });

    // Build hierarchy
    const rootNodes: TreeNode[] = [];
    nodeMap.forEach(node => {
      if (node.parentRoleId && nodeMap.has(node.parentRoleId)) {
        const parent = nodeMap.get(node.parentRoleId)!;
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Sort by hierarchy level and name
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.hierarchy.level !== b.hierarchy.level) {
          return a.hierarchy.level - b.hierarchy.level;
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => sortNodes(node.children));
    };

    sortNodes(rootNodes);
    setTreeData(rootNodes);
  };

  const buildTreeData = (hierarchyData: RoleHierarchy[]) => {
    const nodeMap = new Map<string, TreeNode>();
    
    // Find roles for each hierarchy node
    hierarchyData.forEach(item => {
      const role = roles.find(r => r.id === item.id);
      if (role) {
        nodeMap.set(item.id, {
          ...role,
          children: [],
          isExpanded: expandedNodes.has(item.id),
          isSelected: false
        });
      }
    });

    // Build tree structure
    const rootNodes: TreeNode[] = [];
    hierarchyData.forEach(item => {
      const node = nodeMap.get(item.id);
      if (node) {
        if (item.parentId && nodeMap.has(item.parentId)) {
          const parent = nodeMap.get(item.parentId)!;
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    });

    setTreeData(rootNodes);
  };

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });

    // Update tree data
    const updateExpansion = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => ({
        ...node,
        isExpanded: expandedNodes.has(node.id),
        children: updateExpansion(node.children)
      }));
    };

    setTreeData(updateExpansion(treeData));
  };

  const selectNode = (node: TreeNode) => {
    setSelectedNode(node);
    
    // Update selection in tree
    const updateSelection = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(n => ({
        ...n,
        isSelected: n.id === node.id,
        children: updateSelection(n.children)
      }));
    };

    setTreeData(updateSelection(treeData));
  };

  const handleDragStart = (node: TreeNode) => {
    setDraggedNode(node);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetNode: TreeNode) => {
    if (!draggedNode || draggedNode.id === targetNode.id) return;

    try {
      // Check if move is valid (prevent circular hierarchy)
      if (isDescendant(targetNode, draggedNode)) {
        alert('Cannot move a role to be a child of its descendant');
        return;
      }

      await rolesPermissionsEnhancedApi.moveRoleInHierarchy(draggedNode.id, targetNode.id);
      await loadHierarchy();
      onRoleUpdate();
    } catch (error) {
      console.error('Error moving role in hierarchy:', error);
    } finally {
      setDraggedNode(null);
      setDropTarget(null);
    }
  };

  const isDescendant = (potential: TreeNode, ancestor: TreeNode): boolean => {
    if (potential.parentRoleId === ancestor.id) return true;
    const parent = findNodeById(potential.parentRoleId);
    return parent ? isDescendant(parent, ancestor) : false;
  };

  const findNodeById = (id?: string): TreeNode | null => {
    if (!id) return null;
    
    const findInTree = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findInTree(node.children);
        if (found) return found;
      }
      return null;
    };

    return findInTree(treeData);
  };

  const handleRoleAction = async (action: string, node: TreeNode) => {
    switch (action) {
      case 'promote':
        if (node.parentRoleId) {
          const grandparent = findNodeById(node.parentRoleId)?.parentRoleId;
          await rolesPermissionsEnhancedApi.moveRoleInHierarchy(node.id, grandparent);
          await loadHierarchy();
          onRoleUpdate();
        }
        break;
      case 'demote':
        // Find a sibling to make this node a child of
        alert('Please drag and drop to demote this role');
        break;
      case 'delete':
        if (confirm(`Delete role "${node.name}" and all its children?`)) {
          await rolesPermissionsEnhancedApi.deleteRole(node.id);
          await loadHierarchy();
          onRoleUpdate();
        }
        break;
    }
  };

  const getRoleIcon = (role: TreeNode) => {
    if (role.isSystemRole) return <Shield className="w-4 h-4 text-blue-500" />;
    if (role.hierarchy.level === 0) return <TreePine className="w-4 h-4 text-green-500" />;
    return <Users className="w-4 h-4 text-purple-500" />;
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore > 80) return 'text-red-500';
    if (riskScore > 60) return 'text-orange-500';
    if (riskScore > 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore > 80) return 'Critical';
    if (riskScore > 60) return 'High';
    if (riskScore > 30) return 'Medium';
    return 'Low';
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const indent = depth * 24;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors
            ${node.isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'}
            ${draggedNode?.id === node.id ? 'opacity-50' : ''}
            ${dropTarget?.id === node.id ? 'bg-blue-100 border-l-blue-400' : ''}
          `}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => selectNode(node)}
          draggable
          onDragStart={() => handleDragStart(node)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(node)}
          onDragEnter={() => setDropTarget(node)}
          onDragLeave={() => setDropTarget(null)}
        >
          {/* Expand/Collapse Button */}
          <div className="w-5 h-5 flex items-center justify-center mr-2">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
              >
                {node.isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            ) : null}
          </div>

          {/* Role Icon */}
          <div className="mr-3">
            {getRoleIcon(node)}
          </div>

          {/* Role Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">{node.name}</h4>
              {node.isSystemRole && (
                <Badge variant="secondary" className="text-xs">System</Badge>
              )}
              <Badge 
                variant="outline" 
                className={`text-xs ${getRiskColor(node.analytics.riskScore)}`}
              >
                {getRiskLevel(node.analytics.riskScore)}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {node.users.length} users
              </span>
              <span className="flex items-center">
                <Key className="w-3 h-3 mr-1" />
                {node.permissions.length} perms
              </span>
              {node.inheritedPermissions && node.inheritedPermissions.length > 0 && (
                <span className="flex items-center">
                  <TreePine className="w-3 h-3 mr-1" />
                  +{node.inheritedPermissions.length} inherited
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRoleAction('edit', node)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Role
              </DropdownMenuItem>
              {node.hierarchy.level > 0 && (
                <DropdownMenuItem onClick={() => handleRoleAction('promote', node)}>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Promote Level
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleRoleAction('copy', node)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleRoleAction('delete', node)}
                className="text-red-600"
                disabled={node.isSystemRole}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Children */}
        {hasChildren && node.isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading role hierarchy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Hierarchy</h2>
          <p className="text-gray-600">
            Manage role relationships and inheritance. Drag roles to reorganize hierarchy.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              const newExpanded = new Set<string>();
              const expandAll = (nodes: TreeNode[]) => {
                nodes.forEach(node => {
                  newExpanded.add(node.id);
                  expandAll(node.children);
                });
              };
              expandAll(treeData);
              setExpandedNodes(newExpanded);
            }}
          >
            Expand All
          </Button>
          <Button 
            variant="outline"
            onClick={() => setExpandedNodes(new Set())}
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchy Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="w-5 h-5 text-green-600 mr-2" />
                Role Tree
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {treeData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <TreePine className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">No roles found</p>
                    <p className="text-sm">Create your first role to get started</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {treeData.map(node => renderTreeNode(node))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Details Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getRoleIcon(selectedNode)}
                  <span className="ml-2">{selectedNode.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Description</h4>
                  <p className="text-sm text-gray-900">{selectedNode.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Hierarchy Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <Badge variant="outline">Level {selectedNode.hierarchy.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Path:</span>
                      <span className="text-gray-600 text-xs">{selectedNode.hierarchy.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Children:</span>
                      <span>{selectedNode.children.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Usage Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active Users:</span>
                      <span>{selectedNode.users.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Permissions:</span>
                      <span>{selectedNode.permissions.length}</span>
                    </div>
                    {selectedNode.inheritedPermissions && (
                      <div className="flex justify-between">
                        <span>Inherited Permissions:</span>
                        <span>{selectedNode.inheritedPermissions.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Usage Count:</span>
                      <span>{selectedNode.analytics.usageCount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Risk Assessment</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Score:</span>
                    <Badge 
                      className={`
                        ${selectedNode.analytics.riskScore > 80 ? 'bg-red-100 text-red-800' : 
                          selectedNode.analytics.riskScore > 60 ? 'bg-orange-100 text-orange-800' : 
                          selectedNode.analytics.riskScore > 30 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}
                      `}
                    >
                      {selectedNode.analytics.riskScore}% - {getRiskLevel(selectedNode.analytics.riskScore)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Compliance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span>{selectedNode.compliance.complianceScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audit Required:</span>
                      {selectedNode.compliance.auditRequired ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {selectedNode.compliance.lastAuditDate && (
                      <div className="flex justify-between">
                        <span>Last Audit:</span>
                        <span className="text-xs text-gray-600">
                          {new Date(selectedNode.compliance.lastAuditDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Role
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Manage Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Select a Role</p>
                <p className="text-sm">Click on a role in the tree to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Hierarchy Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hierarchy Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Child Role
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Move className="w-4 h-4 mr-2" />
                Reorganize Hierarchy
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Key className="w-4 h-4 mr-2" />
                Bulk Update Permissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-sm text-gray-900 mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>System Role</span>
            </div>
            <div className="flex items-center space-x-2">
              <TreePine className="w-4 h-4 text-green-500" />
              <span>Root Role</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Standard Role</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500"></div>
              <span>Selected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleHierarchyTree;