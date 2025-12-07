'use client';

import React, { useState, useEffect } from 'react';
import { departmentsApi, DepartmentHierarchy } from '@/lib/api/departments.api';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DepartmentHierarchyModalProps {
  onClose: () => void;
}

const DepartmentHierarchyModal: React.FC<DepartmentHierarchyModalProps> = ({ onClose }) => {
  const [hierarchy, setHierarchy] = useState<DepartmentHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await departmentsApi.getHierarchy();
      setHierarchy(data);
      // Expand all top-level nodes by default
      setExpandedNodes(new Set(data.map((d) => d.id)));
    } catch (err) {
      console.error('Error loading hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node: DepartmentHierarchy, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="mb-2">
        <div
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-gray-900">{node.departmentName}</p>
                <p className="text-sm text-gray-600">{node.departmentCode}</p>
              </div>
              <StatusBadge status={node.status} size="sm" />
              <span className="text-sm text-gray-600">{node.departmentType}</span>
            </div>
          </div>

          <div className="text-right">
            {node.departmentHeadName && (
              <p className="text-sm text-gray-600">Head: {node.departmentHeadName}</p>
            )}
            <p className="text-sm text-gray-500">Staff: {node.totalStaff}</p>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p>Loading hierarchy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Department Hierarchy</h2>
              <p className="text-sm text-gray-600">
                View organizational structure of all departments
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {hierarchy.length === 0 ? (
            <div className="text-center text-gray-500">
              <p className="text-4xl">🏥</p>
              <p className="mt-2">No departments found</p>
            </div>
          ) : (
            <div>{hierarchy.map((node) => renderNode(node))}</div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between">
            <button
              onClick={() => setExpandedNodes(new Set(hierarchy.map((d) => d.id)))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Expand All
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHierarchyModal;
