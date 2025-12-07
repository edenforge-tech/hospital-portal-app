'use client';

import { useState, useEffect } from 'react';
import { X, Building2, ChevronRight, ChevronDown, Loader2, GitBranch, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { organizationsApi, OrganizationHierarchyNode } from '@/lib/api/organizations.api';

interface OrganizationHierarchyModalProps {
  tenantId: string;
  rootOrganizationId?: string;
  onClose: () => void;
}

interface TreeNodeProps {
  node: OrganizationHierarchyNode;
  level: number;
  onSelectOrganization?: (org: OrganizationHierarchyNode) => void;
}

function TreeNode({ node, level, onSelectOrganization }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Hospital': return 'bg-blue-100 text-blue-800';
      case 'Clinic': return 'bg-green-100 text-green-800';
      case 'Diagnostic': return 'bg-purple-100 text-purple-800';
      case 'Pharmacy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'border-green-400';
      case 'inactive': return 'border-gray-400';
      case 'suspended': return 'border-red-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="select-none">
      {/* Node */}
      <div
        className={`flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getStatusColor(node.status)}`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => onSelectOrganization?.(node)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsExpanded(!isExpanded);
          }}
          className={`flex-shrink-0 ${hasChildren ? 'text-gray-600 hover:text-gray-900' : 'text-transparent'}`}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        {/* Organization Info */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Building2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">{node.name}</p>
                {node.code && (
                  <span className="text-xs text-gray-500 font-mono flex-shrink-0">({node.code})</span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getTypeColor(node.type)}`}>
                  {node.type || 'N/A'}
                </span>
                {node.hierarchyLevel !== undefined && (
                  <span className="text-xs text-gray-500">Level {node.hierarchyLevel}</span>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
            {(node.totalBranches !== undefined && node.totalBranches > 0) && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <GitBranch className="h-4 w-4" />
                <span>{node.totalBranches}</span>
              </div>
            )}
            {(node.totalUsers !== undefined && node.totalUsers > 0) && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Users className="h-4 w-4" />
                <span>{node.totalUsers}</span>
              </div>
            )}
            {hasChildren && (
              <div className="flex items-center space-x-1 text-xs text-indigo-600 font-medium">
                <Building2 className="h-4 w-4" />
                <span>{node.children.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelectOrganization={onSelectOrganization}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationHierarchyModal({
  tenantId,
  rootOrganizationId,
  onClose,
}: OrganizationHierarchyModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<OrganizationHierarchyNode | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationHierarchyNode | null>(null);

  useEffect(() => {
    loadHierarchy();
  }, [tenantId, rootOrganizationId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationsApi.getHierarchy(tenantId, rootOrganizationId);
      setHierarchy(data);
    } catch (err: any) {
      console.error('Error loading hierarchy:', err);
      setError(err.response?.data?.message || 'Failed to load organization hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const getTotalCount = (node: OrganizationHierarchyNode): number => {
    let count = 1; // Count the node itself
    if (node.children) {
      node.children.forEach(child => {
        count += getTotalCount(child);
      });
    }
    return count;
  };

  const getTotalBranches = (node: OrganizationHierarchyNode): number => {
    let count = node.totalBranches || 0;
    if (node.children) {
      node.children.forEach(child => {
        count += getTotalBranches(child);
      });
    }
    return count;
  };

  const getTotalUsers = (node: OrganizationHierarchyNode): number => {
    let count = node.totalUsers || 0;
    if (node.children) {
      node.children.forEach(child => {
        count += getTotalUsers(child);
      });
    }
    return count;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Organization Hierarchy</h2>
              <p className="text-sm text-gray-500">View the complete organizational structure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Statistics Summary */}
        {!loading && hierarchy && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                    <p className="text-2xl font-bold text-indigo-600">{getTotalCount(hierarchy)}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-indigo-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Branches</p>
                    <p className="text-2xl font-bold text-blue-600">{getTotalBranches(hierarchy)}</p>
                  </div>
                  <GitBranch className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-green-600">{getTotalUsers(hierarchy)}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Max Depth</p>
                    <p className="text-2xl font-bold text-purple-600">{hierarchy.hierarchyLevel !== undefined ? hierarchy.hierarchyLevel + 1 : 1}</p>
                  </div>
                  <div className="h-8 w-8 text-purple-400 font-bold text-2xl">∞</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hierarchy Tree */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading hierarchy...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadHierarchy}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && hierarchy && (
            <div className="space-y-1">
              <div className="mb-4 flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-l-4 border-green-400 rounded"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-l-4 border-gray-400 rounded"></div>
                  <span>Inactive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-l-4 border-red-400 rounded"></div>
                  <span>Suspended</span>
                </div>
              </div>
              <TreeNode
                node={hierarchy}
                level={0}
                onSelectOrganization={setSelectedOrg}
              />
            </div>
          )}

          {!loading && !error && !hierarchy && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No organizations found</p>
            </div>
          )}
        </div>

        {/* Selected Organization Details */}
        {selectedOrg && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Organization</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{selectedOrg.name}</p>
                </div>
                {selectedOrg.code && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Code</p>
                    <p className="text-sm text-gray-900 font-mono">{selectedOrg.code}</p>
                  </div>
                )}
                {selectedOrg.type && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Type</p>
                    <p className="text-sm text-gray-900">{selectedOrg.type}</p>
                  </div>
                )}
                {selectedOrg.hierarchyLevel !== undefined && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Hierarchy Level</p>
                    <p className="text-sm text-gray-900">Level {selectedOrg.hierarchyLevel}</p>
                  </div>
                )}
                {selectedOrg.totalBranches !== undefined && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Branches</p>
                    <p className="text-sm text-gray-900">{selectedOrg.totalBranches}</p>
                  </div>
                )}
                {selectedOrg.totalUsers !== undefined && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Users</p>
                    <p className="text-sm text-gray-900">{selectedOrg.totalUsers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
