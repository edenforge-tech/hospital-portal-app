'use client';

import { useEffect, useState } from 'react';
import { getApi } from '@/lib/api';

interface DepartmentNode {
  id: string;
  departmentName: string;
  departmentCode?: string;
  departmentType?: string;
  branchId?: string;
  branchName?: string;
  staffCount?: number;
  is24x7?: boolean;
  requiresApproval?: boolean;
  status?: string;
  parentDepartmentId?: string | null;
  level: number;
  children: DepartmentNode[];
}

interface Props {
  onDepartmentSelect: (department: DepartmentNode | null) => void;
  onDepartmentMove: (departmentId: string, newParentId: string | null) => Promise<void>;
  selectedDepartmentId?: string;
  refreshTrigger?: number;
}

export default function DepartmentHierarchyTree({
  onDepartmentSelect,
  onDepartmentMove,
  selectedDepartmentId,
  refreshTrigger
}: Props) {
  const [hierarchy, setHierarchy] = useState<DepartmentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedDepartment, setDraggedDepartment] = useState<DepartmentNode | null>(null);
  const [dragOverDepartment, setDragOverDepartment] = useState<DepartmentNode | null>(null);

  useEffect(() => {
    loadHierarchy();
  }, [refreshTrigger]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getApi().get<DepartmentNode[]>('/departments/hierarchy');
      const data = response.data || [];
      setHierarchy(data);
      
      // Auto-expand all nodes for better visibility
      const allIds = new Set<string>();
      const collectIds = (nodes: DepartmentNode[]) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children && node.children.length > 0) {
            collectIds(node.children);
          }
        });
      };
      collectIds(data);
      setExpandedNodes(allIds);
    } catch (err: any) {
      console.error('Error loading department hierarchy:', err);
      setError(err.response?.data?.message || 'Failed to load department hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (departmentId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(departmentId)) {
        next.delete(departmentId);
      } else {
        next.add(departmentId);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, department: DepartmentNode) => {
    setDraggedDepartment(department);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDepartment(null);
    setDragOverDepartment(null);
  };

  const handleDragOver = (e: React.DragEvent, department: DepartmentNode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedDepartment && draggedDepartment.id !== department.id) {
      setDragOverDepartment(department);
    }
  };

  const handleDragLeave = () => {
    setDragOverDepartment(null);
  };

  const isDescendant = (department: DepartmentNode, potentialParent: DepartmentNode): boolean => {
    if (department.id === potentialParent.id) return true;
    
    for (const child of department.children) {
      if (isDescendant(child, potentialParent)) return true;
    }
    
    return false;
  };

  const handleDrop = async (e: React.DragEvent, newParent: DepartmentNode | null) => {
    e.preventDefault();
    
    if (!draggedDepartment) return;
    
    // Prevent dropping onto self
    if (newParent && draggedDepartment.id === newParent.id) {
      alert('Cannot make a department a parent of itself');
      setDragOverDepartment(null);
      return;
    }
    
    // Prevent circular reference (dropping onto descendant)
    if (newParent && isDescendant(draggedDepartment, newParent)) {
      alert('Cannot move a department to one of its descendants');
      setDragOverDepartment(null);
      return;
    }
    
    try {
      await onDepartmentMove(draggedDepartment.id, newParent?.id || null);
      setDragOverDepartment(null);
      loadHierarchy(); // Refresh after move
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to move department');
      setDragOverDepartment(null);
    }
  };

  const getDepartmentTypeColor = (type: string | undefined) => {
    if (!type) return 'bg-gray-100 text-gray-700 border-gray-300';
    
    const colors: Record<string, string> = {
      'Clinical': 'bg-blue-100 text-blue-700 border-blue-300',
      'Administrative': 'bg-purple-100 text-purple-700 border-purple-300',
      'Support': 'bg-green-100 text-green-700 border-green-300',
      'Diagnostics': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Therapeutic': 'bg-pink-100 text-pink-700 border-pink-300',
      'Emergency': 'bg-red-100 text-red-700 border-red-300',
      'Surgical': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Medical': 'bg-cyan-100 text-cyan-700 border-cyan-300'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getDepartmentTypeIcon = (type: string | undefined) => {
    if (!type) return '🏢';
    
    const icons: Record<string, string> = {
      'Clinical': '🏥',
      'Administrative': '📋',
      'Support': '🔧',
      'Diagnostics': '🔬',
      'Therapeutic': '💊',
      'Emergency': '🚑',
      'Surgical': '⚕️',
      'Medical': '🩺'
    };
    
    return icons[type] || '🏢';
  };

  const renderNode = (department: DepartmentNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(department.id);
    const hasChildren = department.children && department.children.length > 0;
    const isSelected = selectedDepartmentId === department.id;
    const isDragging = draggedDepartment?.id === department.id;
    const isDragOver = dragOverDepartment?.id === department.id;

    return (
      <div key={department.id} className="select-none">
        {/* Department Item */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, department)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, department)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, department)}
          onClick={() => onDepartmentSelect(department)}
          className={`
            flex items-center gap-3 p-3 mb-2 rounded-lg border-2 cursor-move transition-all
            ${getDepartmentTypeColor(department.departmentType)}
            ${isSelected ? 'ring-4 ring-indigo-300 shadow-lg' : 'shadow-sm'}
            ${isDragging ? 'opacity-40' : 'opacity-100'}
            ${isDragOver ? 'ring-4 ring-blue-400' : ''}
            hover:shadow-md
          `}
          style={{ marginLeft: `${depth * 32}px` }}
        >
          {/* Drag Handle */}
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </div>

          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(department.id);
              }}
              className="flex-shrink-0 p-1 hover:bg-white/50 rounded"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* Department Icon */}
          <div className="flex-shrink-0 text-2xl">
            {getDepartmentTypeIcon(department.departmentType)}
          </div>

          {/* Department Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">{department.departmentName}</span>
              {department.departmentCode && (
                <span className="text-xs opacity-70">({department.departmentCode})</span>
              )}
            </div>
            {department.branchName && (
              <div className="text-xs opacity-70 mt-0.5">Branch: {department.branchName}</div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {department.is24x7 && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                24/7
              </span>
            )}
            {department.requiresApproval && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                Approval
              </span>
            )}
            {department.staffCount !== undefined && (
              <span className="px-2 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium">
                👥 {department.staffCount}
              </span>
            )}
            {hasChildren && (
              <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full font-medium">
                {department.children.length} sub
              </span>
            )}
          </div>

          {/* Level Indicator */}
          <div className="flex-shrink-0 text-xs font-semibold opacity-50">
            L{department.level}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {department.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading department hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="mt-2 font-medium">No departments found</p>
        <p className="text-sm">Create departments to build the hierarchy</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone for Root Level */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => handleDrop(e, null)}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
      >
        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <p className="mt-2 text-sm font-medium">Drop here to make root-level department</p>
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {hierarchy.map(department => renderNode(department, 0))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">💡 How to use:</h3>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span><strong>Click</strong> a department to view details in the sidebar</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span><strong>Drag and drop</strong> departments to reorganize hierarchy</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span><strong>Arrow icon</strong> expands/collapses sub-departments</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span><strong>Color-coded</strong> by department type for easy identification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span><strong>Badges</strong> show 24/7 status, approval required, staff count, and sub-departments</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
