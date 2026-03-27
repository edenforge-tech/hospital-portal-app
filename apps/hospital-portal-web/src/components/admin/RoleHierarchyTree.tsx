'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

interface RoleNode {
  id: string;
  name: string;
  roleCode?: string;
  roleType?: string;
  priority?: number;
  totalUsers?: number;
  totalPermissions?: number;
  parentRoleId?: string | null;
  level: number;
  children: RoleNode[];
}

interface RoleHierarchyTreeProps {
  onRoleSelect?: (role: RoleNode) => void;
  onRoleMove?: (roleId: string, newParentId: string | null) => void;
  selectedRoleId?: string | null;
  refreshTrigger?: number;
}

export default function RoleHierarchyTree({
  onRoleSelect,
  onRoleMove,
  selectedRoleId,
  refreshTrigger
}: RoleHierarchyTreeProps) {
  const [hierarchy, setHierarchy] = useState<RoleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedRole, setDraggedRole] = useState<RoleNode | null>(null);
  const [dragOverRole, setDragOverRole] = useState<string | null>(null);

  useEffect(() => {
    loadHierarchy();
  }, [refreshTrigger]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getApi().get('/roles/hierarchy');
      setHierarchy(response.data || []);
      
      // Auto-expand all nodes on initial load
      const allIds = new Set<string>();
      const collectIds = (nodes: RoleNode[]) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(response.data || []);
      setExpandedNodes(allIds);
    } catch (err: any) {
      console.error('Error loading hierarchy:', err);
      setError(err.response?.data?.message || 'Failed to load role hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, role: RoleNode) => {
    setDraggedRole(role);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    // Add visual feedback
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedRole(null);
    setDragOverRole(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, targetRole: RoleNode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Don't allow dropping on self or descendants
    if (draggedRole && !isDescendant(draggedRole, targetRole.id)) {
      setDragOverRole(targetRole.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverRole(null);
  };

  const handleDrop = async (e: React.DragEvent, targetRole: RoleNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedRole) return;

    const newParentId = targetRole?.id || null;
    
    // Don't allow dropping on self or current parent
    if (draggedRole.id === newParentId || draggedRole.parentRoleId === newParentId) {
      setDragOverRole(null);
      return;
    }

    // Don't allow circular references
    if (targetRole && isDescendant(draggedRole, targetRole.id)) {
      alert('Cannot move a role to its own descendant');
      setDragOverRole(null);
      return;
    }

    try {
      // Call the API to update hierarchy
      if (onRoleMove) {
        await onRoleMove(draggedRole.id, newParentId);
        await loadHierarchy();
      }
    } catch (err: any) {
      console.error('Error moving role:', err);
      alert(err.response?.data?.message || 'Failed to move role');
    } finally {
      setDragOverRole(null);
    }
  };

  const isDescendant = (ancestor: RoleNode, potentialDescendantId: string): boolean => {
    if (ancestor.id === potentialDescendantId) return true;
    
    for (const child of ancestor.children) {
      if (isDescendant(child, potentialDescendantId)) return true;
    }
    
    return false;
  };

  const renderNode = (node: RoleNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedRoleId === node.id;
    const isDragOver = dragOverRole === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          className={`
            flex items-center gap-2 px-3 py-2 mb-1 rounded-lg cursor-pointer
            transition-all duration-150
            ${isSelected ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-white hover:bg-gray-50 border border-gray-200'}
            ${isDragOver ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''}
          `}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => onRoleSelect && onRoleSelect(node)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNode(node.id);
            }}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            {hasChildren ? (
              isExpanded ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )
            ) : (
              <span className="w-4 h-4 inline-block"></span>
            )}
          </button>

          {/* Drag Handle Icon */}
          <div className="flex-shrink-0 text-gray-400 cursor-move">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zM7 8a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zM7 14a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>

          {/* Role Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            node.level === 0 ? 'bg-purple-100 text-purple-700' :
            node.level === 1 ? 'bg-blue-100 text-blue-700' :
            node.level === 2 ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {node.name.charAt(0).toUpperCase()}
          </div>

          {/* Role Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 truncate">{node.name}</span>
              {node.roleCode && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {node.roleCode}
                </span>
              )}
              {node.level === 0 && (
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded font-medium">
                  ROOT
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <span>Level {node.level}</span>
              {node.totalUsers !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {node.totalUsers} users
                </span>
              )}
              {node.totalPermissions !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  {node.totalPermissions} permissions
                </span>
              )}
            </div>
          </div>

          {/* Children Count Badge */}
          {hasChildren && (
            <div className="flex-shrink-0 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
            </div>
          )}
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          onClick={loadHierarchy}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
        <p className="mt-1 text-sm text-gray-500">Create roles to build your hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone for making roles root-level */}
      {draggedRole && draggedRole.parentRoleId && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverRole('ROOT');
          }}
          onDragLeave={() => setDragOverRole(null)}
          onDrop={(e) => handleDrop(e, null)}
          className={`
            p-4 mb-4 border-2 border-dashed rounded-lg text-center text-sm
            ${dragOverRole === 'ROOT' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-500'}
          `}
        >
          <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Drop here to make <strong>{draggedRole.name}</strong> a root-level role
        </div>
      )}

      {/* Hierarchy Tree */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {hierarchy.map(node => renderNode(node, 0))}
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="font-semibold text-blue-900 mb-2">💡 How to use:</p>
        <ul className="text-blue-800 space-y-1 ml-4 list-disc">
          <li>Click on a role to select it</li>
          <li>Drag and drop roles to reorganize the hierarchy</li>
          <li>Click arrows to expand/collapse children</li>
          <li>Drop on the blue zone above to make a role root-level</li>
        </ul>
      </div>
    </div>
  );
}
