'use client';

import React, { useMemo, useState } from 'react';
import { Tree } from 'react-tree-graph';
import { RoleTreeProps, RoleHierarchyDto, InheritanceType } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  Network,
  SettingsIcon
} from 'lucide-react';

interface TreeData {
  name: string;
  id: string;
  children?: TreeData[];
  gProps?: {
    className: string;
    onClick: () => void;
  };
  textProps?: {
    className: string;
  };
}

export const RoleTree: React.FC<RoleTreeProps> = ({
  roles,
  onRoleSelect,
  onUpdateHierarchy,
  selectedRoleId
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  // Convert hierarchy data to tree structure
  const treeData = useMemo(() => {
    const buildTreeData = (role: RoleHierarchyDto, level = 0): TreeData => {
      return {
        name: role.roleName,
        id: role.roleId,
        children: role.children?.map(child => buildTreeData(child, level + 1)),
        gProps: {
          className: `role-node ${selectedRoleId === role.roleId ? 'selected' : ''} level-${level}`,
          onClick: () => onRoleSelect(role)
        },
        textProps: {
          className: 'role-text'
        }
      };
    };

    // Find root roles (no parent)
    const rootRoles = roles.filter(role => !role.parentRoleId);
    return rootRoles.map(role => buildTreeData(role));
  }, [roles, selectedRoleId, onRoleSelect]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getInheritanceIcon = (type: InheritanceType) => {
    switch (type) {
      case InheritanceType.InheritAll:
        return <ShieldCheckIcon className="w-4 h-4 text-green-500" />;
      case InheritanceType.InheritSelective:
        return <SettingsIcon className="w-4 h-4 text-yellow-500" />;
      case InheritanceType.None:
        return <Network className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const renderListView = () => {
    const flatRoles = roles.sort((a, b) => a.level - b.level);

    return (
      <div className="space-y-2">
        {flatRoles.map(role => (
          <div
            key={role.roleId}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all
              ${selectedRoleId === role.roleId 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            style={{ marginLeft: `${role.level * 20}px` }}
            onClick={() => onRoleSelect(role)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getInheritanceIcon(role.inheritanceType)}
                  <h3 className="font-semibold text-gray-900">{role.roleName}</h3>
                </div>
                
                {role.description && (
                  <span className="text-sm text-gray-500">{role.description}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Level {role.level}</Badge>
                
                {role.permissions && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <ShieldCheckIcon className="w-3 h-3" />
                    <span>{role.permissions.length} perms</span>
                  </Badge>
                )}
                
                {role.parentRoleName && (
                  <span className="text-xs text-gray-500">
                    Child of: {role.parentRoleName}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTreeView = () => {
    if (treeData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Network className="w-12 h-12 mb-4" />
          <p>No role hierarchy found</p>
          <p className="text-sm">Create roles and define parent-child relationships to see the tree</p>
        </div>
      );
    }

    return (
      <div className="w-full h-96 overflow-auto">
        <style jsx>{`
          .role-node.selected {
            fill: #3b82f6;
            stroke: #1d4ed8;
            stroke-width: 2;
          }
          .role-node {
            fill: #f3f4f6;
            stroke: #6b7280;
            stroke-width: 1;
            cursor: pointer;
          }
          .role-node:hover {
            fill: #e5e7eb;
            stroke: #374151;
          }
          .role-text {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 500;
            fill: #111827;
            pointer-events: none;
          }
          .level-0 { fill: #dbeafe; stroke: #3b82f6; }
          .level-1 { fill: #dcfce7; stroke: #16a34a; }
          .level-2 { fill: #fef3c7; stroke: #d97706; }
          .level-3 { fill: #fecaca; stroke: #dc2626; }
        `}</style>
        
        <Tree
          data={treeData}
          height={400}
          width={800}
          svgProps={{
            className: 'w-full h-full'
          }}
          margins={{
            bottom: 10,
            left: 20,
            right: 150,
            top: 10
          }}
          nodeProps={{
            r: 8
          }}
          textProps={{
            x: 15,
            y: 4
          }}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Network className="w-5 h-5" />
            <span>Role Hierarchy</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Visualize role relationships and permission inheritance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            Tree View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {viewMode === 'tree' ? renderTreeView() : renderListView()}

      {roles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No roles found</p>
          <Button onClick={() => {}}>Create First Role</Button>
        </div>
      )}
    </div>
  );
};